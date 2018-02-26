var modelComment=require('../models/modelComment');
var express = require('express');
var jwt=require('jsonwebtoken');
var number = require('./randomNumber');
var mongoose=require('mongoose');
var passport = require("passport");
require('mongoose-pagination');
apiRoutesComment = express.Router();


apiRoutesComment.get('/_api/v1/comment', function(req,res){
	var videoWebsiteId=req.query.videoId;
	console.log('videoWebsiteId='+videoWebsiteId)
	var limit=parseInt(req.query.maxResult);
	var page=parseInt(req.query.page);
	console.log(page=="")
	if(limit==undefined||limit==null){
		limit=10;
	}
	if(page ==undefined||page==null||page==""){
		console.log(1)
		page = 1;
	}
	modelComment.find({videoWebsiteId:videoWebsiteId})
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
})

apiRoutesComment.post('/_api/v1/comment/:id', passport.authenticate('jwt', {session:false}), function(req,res){
	var userId=req.user.userId;
	console.log(req.body.comment)
	var comment= {
		types:'Comment',
		commentId:number.random(1000000000, 9999999999),
		userId:userId,
		thumbnail:req.user.thumbnail,
		videoWebsiteId:req.params.id,
		comment:req.body.comment,
		numberOfLike:0,
		createdAt:Date.now(),
		updatedAt:Date.now(),
		status:1
	}

	modelComment.create(comment, function(err, result){
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

apiRoutesComment.put('/_api/v1/comment/:id', passport.authenticate('jwt', {session:false}), function(req,res){
	var userId=req.user.userId;
	modelComment.update({userId:userId, videoWebsiteId:req.params.id, commentId:req.query.commentId}, 
		{$set:{comment:req.body.comment, numberoflike:req.body.numberoflike}}, function(err, result){
		if(err){
			res.status(500).send({
				message:"Server error"
			})
		}
		res.status(200).send({
			message:"Edit comment successfull"
		})
	})
})

apiRoutesComment.delete('/_api/v1/comment/:id', passport.authenticate('jwt', {session:false}), function(req,res){
	var userId=req.user.userId;

	modelComment.remove({userId:userId, videoWebsiteId:req.params.id, commentId:req.query.commentId}, function(err, result){
		if(err){
			res.status(500).send({
				message:"Server error"
			})
		}
		res.status(200).send({
			message:"Delete comment successfull"
		})
	})
})

module.exports=apiRoutesComment;