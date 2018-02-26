var modelVideoWebsite=require('../models/modelVideoWebsite');
var modelNotiVideo=require('../models/modelNotificationCheckVideo');
var express=require('express');
var jwt=require('jsonwebtoken');
var number = require('./randomNumber');
var mongoose=require('mongoose');
var apiRoutesAdminNotifi = express.Router();
var passport = require("passport");

apiRoutesAdminNotifi.post('/_api/v1/admin/noti_video/', passport.authenticate('jwt', {session:true}), function (req,res) {
	var adminId=req.user.userId;
	var noti = {
		notiId:number.random(100000000,999999999),
		videoWebsiteId:req.body.videoWebsiteId,
		userId:req.body.userId,
		adminId:adminId,
		contentNoti:req.body.contentNoti,
		createdAt:Date.now(),
		updatedAt:Date.now(),
		status:1
	}
	modelNotiVideo.create(noti, function(err, result){
		if(err){
			res.status(500).send({
				message:"Server error"
			})
		}
		res.status(200).send({
			message:"successful",
			info:result
		})
	})
})

apiRoutesAdminNotifi.delete('/_api/v1/admin/noti_video/:id', passport.authenticate('jwt', {session:true}), function (req,res) {
	var adminId=req.user.userId;
	modelNotiVideo.remove({notiId:req.params.id}, function(err, result){
		if(err){
			res.status(500).send({
				message:"Server error"
			})
		}
		res.status(200).send({
			message:"successful",
			info:result
		})
	})
})

apiRoutesAdminNotifi.put('/_api/v1/admin/noti_video/:id', passport.authenticate('jwt', {session:true}), function (req,res) {
	var adminId=req.user.userId;
	modelNotiVideo.update({notiId:req.params.id},{$set:{status:req.body.status}}, function(err, result){
		if(err){
			res.status(500).send({
				message:"Server error"
			})
		}
		res.status(200).send({
			message:"successful",
			info:result
		})
	})
})

module.exports=apiRoutesAdminNotifi;