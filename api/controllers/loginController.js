var express = require('express');
var mongoose = require("mongoose");
var modelUser = require("../models/modelUser");
var jwt = require('jsonwebtoken');
var number = require('./randomNumber');
var req=require('request');
var apiRoutesLogin = express.Router();


//====================Đăng kí======================//
apiRoutesLogin.post("/_api/v1/members", (req, res)=>{
	console.log(req.body)
	if(req.body.thumbnail==""){
		var avatar ="https://unghotoi.com/data/avatar/1498047608OBM_avatar_user.png"
	}else{
		avatar=req.body.thumbnail
	}
	
	var user = {
		username:req.body.username,
		password:req.body.password,
		gender:req.body.gender,
		birthday:req.body.birthday,
		email:req.body.email,
		fullname:req.body.fullname,
		tokenFb:'',
		thumbnail:avatar,
		role:req.body.role,
		userId:number.random(10000000,99999999),
		createdAt:Date.now(),
		updatedAt:Date.now(),
		status:1
	};
	//================================Validate info//================================//
	if(req.body.username == null
		||req.body.username == undefined
		||req.body.username.length < 7 
		||req.body.username.length==0){
		res.status(409).json({message:"Username must be larger than 7 character"});
		return false;
	}	

	if(req.body.password == null
		||req.body.password == undefined
		||req.body.password.length < 7 
		||req.body.password.length==0){
		res.status(409).json({message:"Password must be larger than 7 character"});
		return false;
	}
	console.log(req.body.birthday)
	if(req.body.birthday == null
		||req.body.birthday == undefined
		||req.body.birthday > Date.now()){
		res.status(409).json({message:"Birthday is invalid"});
		return false;
	} 

	if(req.body.fullname == null
		||req.body.fullname == undefined
		||req.body.fullname.length < 7
		||req.body.fullname.length == 0){
		res.status(409).json({message:"fullname is invalid"});
		return false;
	} 


	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if(!re.test(req.body.email.toLowerCase())
		||req.body.email==null
		||req.body.email==undefined
		||req.body.email.length==0){
		res.status(409).json({message:"Email is invalid"});	
		return false;
	}
	console.log(1123)
	//================================Validate info//================================//
	//Tìm username trong database
	modelUser.find({username: req.body.username}, (err, resUser)=>{
		console.log(resUser)
		//Trả ra lỗi nếu xảy ra lỗi của chương trình
		if(err) return res.status(500).json({message:"Server error"});
		//Kiểm tra xem user có tồn tại hay không
		if(resUser == null||resUser == undefined||resUser.length == 0){
			//Trường hợp user chưa được đăng kí==> import vào database
			modelUser.create(user, (err, result)=>{
				if(err) throw  err;
				res.status(200).json(result);
			});
		}else if(resUser!=null || resUser.length != 0){
			//Lỗi trả về cho client
			res.status(409).json({
				message:"Username is existed"
			});
		}
	});
});
//====================Đăng nhập====================//
apiRoutesLogin.post("/_api/v1/authenticate",(req,res)=>{
	//Form đăng nhập
	var userLogin = {
		username:req.body.username,
		password:req.body.password,
	};
	//Tìm kiếm username trong database
	modelUser.findOne({username:req.body.username}, (err, user)=>{
		if(err) {return res.status(500).json({message:"Server error"})};
		
		if(user == null|| user == undefined|| user.length == 0){
			//Nếu user chưa có, thông báo sai tên đăng nhập
			res.status(409).json({
				success:false,
				message:"Username is not correct"
			});
		}
		else if(user != null||user.length != 0){
			if(user.password != req.body.password){
				//Nếu user có, password sai==>thông báo sai tên password
				res.status(409).json({
					success:false,
					message:"Password is not correct"
				})
			} else{
				//Tạo ra token trả về cho client
				var token = jwt.sign({userId:user.userId, role:user.role}, req.app.get("superSecret"));
				res.status(200).json({
					success:true, 
					message:"login successfully",
					token:'JWT '+token,
					username:user.username,
					userId:user.userId,
					thumbnail:user.thumbnail
				});
			}
		}
	});
});
//====================Kết thúc Đăng nhập============//
module.exports=apiRoutesLogin;
