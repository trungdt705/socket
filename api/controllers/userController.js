var express = require('express');
var mongoose = require("mongoose");
var modelUser = require("../models/modelUser");
var jwt = require('jsonwebtoken');
var number = require('./randomNumber');
var passport = require("passport");
var apiRoutesUser = express.Router();

//=============sửa thông tin cá nhân==================//
apiRoutesUser.put("/_api/v1/members/:id", passport.authenticate('jwt', {session:false}), (req,res)=>{
	if(req.body.password.length < 7 || req.body.password.length==0){
		res.status(409).json({message:"Password must be larger than 7 character"});
		return false;
	}

	if(req.body.repassword.length<7||req.body.repassword.length==0||req.body.repassword!=req.body.password){
		res.status(409).json({message:"Re-Password is invalid"});
		return false;
	}

	if(req.body.birthday.length<7||req.body.birthday.length==0||req.body.birthday > Date.now()){
		res.status(409).json({message:"Birthday is invalid"});
		return false;
	} 

	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if(!re.test(req.body.email.toLowerCase())){
		res.status(409).json({message:"Email is invalid"});	
		return false;
	}

	modelUser.update({userId:req.params.id},{$set:{
		password:req.body.password, 
		repassword:req.body.repassword,
		gender:req.body.gender,
		birthday:req.body.birthday,
		email:req.body.email,
		updatedAt:Date.now(),
		status:1}},
		(err, result)=>{
		if(err) throw err;
		res.json({
			success:"true",
			message:"Sửa thông tin thành công"
		});
	});
})

apiRoutesUser.delete("/_api/v1/members/:id", passport.authenticate('jwt', {session:false}), (req,res)=>{
	modelUser.remove({userId:req.params.id},
		(err, result)=>{
		if(err) throw err;
		res.json({
			success:"true",
			message:"Xóa user thành công"
		});
	});
})
//=============Kết thúc sửa thông tin cá nhân==================//
module.exports=apiRoutesUser;