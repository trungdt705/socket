var express = require('express');
var videoModel = require('../models/modelVideo');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var number = require('./randomNumber');
var passport = require("passport");
require('mongoose-pagination');
var apiRoutesVideo = express.Router();

apiRoutesVideo.post("/_api/v1/member-video", passport.authenticate('jwt', {session:false}), (req,res)=>{
	if(req.body.thumbnail==""){
		var thumbnail ="https://tophinhanhdep.net/wp-content/uploads/2015/12/anh-dep-mua-xuan-3.jpg"
	}else{
		thumbnail=req.body.thumbnail
	}
	var userId=req.user.userId;
	var video =
	{
		videoId:number.random(100000,999999),
		videoWebsiteId:req.body.videoWebsiteId,
		name: req.body.name,
		description: req.body.description,
		keywords: req.body.keywords,
		url: req.body.url,
		playlistId: req.body.playlistId,
		thumbnail: thumbnail,
		userId:userId,
		createdAt:Date.now(),
		updatedAt:Date.now(),
		status:2
	}

	if(req.body.name==null
		||req.body.name==undefined
		||req.body.name.length<7
		||req.body.name.length==0){
		res.status(401).json({
			message:"Video name must be larger than 7 character"
		})
	return false;
}

if(req.body.playlistId==null
	||req.body.playlistId==undefined
	||req.body.playlistId.length==0){
	res.status(401).json({
		message:"playlistId can not empty"
	})
return false;
}
videoModel.create(video, (err,result)=>{
	if(err){
		res.status(500).json({
			message:"Server error"
		})
	}else{
		res.status(200).json(result);
	}
})
})

apiRoutesVideo.get("/_api/v1/member-video", passport.authenticate('jwt', {session:false}), (req,res)=>{
	var limit=parseInt(req.query.maxResult);
	var page=parseInt(req.query.page);
	var userId=req.user.userId;
	if(limit==undefined||limit==null){
		limit=10;
	}
	if(page==undefined||page==null){
		page=1;
	}
	videoModel.find({userId:userId,playlistId:req.query.playlistId, status:2})
	.paginate(page, limit, function(err, result, total){
		if(err){
			res.status(500).json({
				message:"Server error"
			});
		}else{
			res.status(200).json({
				data:result, 
				meta:{
					"totalPage":Math.ceil(total/limit)
				}
			});
		}
	})
});

apiRoutesVideo.get("/_api/v1/member-video/:id", passport.authenticate('jwt', {session:false}), (req,res)=>{
	var userId=req.user.userId;
	console.log(req.params.id)
	videoModel.findOne({userId:userId,videoId:req.params.id, status:2},
		function(err, result){
			console.log(result)
			if(err){
				res.status(500).json({
					message:"Server error"
				});
			}else{
				res.status(200).json(result);
			}
		})
})


apiRoutesVideo.put("/_api/v1/member-video/:id", passport.authenticate('jwt', {session:false}), (req,res)=>{
	if(req.body.thumbnail==""){
		var thumbnail ="https://tophinhanhdep.net/wp-content/uploads/2015/12/anh-dep-mua-xuan-3.jpg"
	}else{
		thumbnail=req.body.thumbnail
	}
	var userId=req.user.userId;
	videoModel.update({
		userId:userId, 
		videoId:req.params.id},
		{$set:{
			name:req.body.name, 
			description:req.body.description,
			keywords:req.body.keywords,
			playlistId:req.body.playlistId,
			thumbnail:thumbnail,
			updatedAt:Date.now()}}, 
			function(err, result){
				if(err){
					res.status(500).json({
						message:"Server error"
					});
				}else{
					res.status(200).json(result);
				}
			})
})

apiRoutesVideo.delete("/_api/v1/member-video/:id", passport.authenticate('jwt', {session:false}), (req,res)=>{
	var userId=req.user.userId;
	videoModel.remove({userId:userId, videoId:req.params.id}, function(err, result){
		if(err){
			res.status(500).json({
				message:"Server error"
			});
		}else{
			res.status(200).json({
				message:"Delete successfully"
			});
		}
	})
})

module.exports=apiRoutesVideo;