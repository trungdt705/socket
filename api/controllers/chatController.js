var modelChat=require('../models/modelChat');
var modelUser=require('../models/modelUser');
var express = require('express');
var jwt=require('jsonwebtoken');
var number = require('./randomNumber');
var mongoose=require('mongoose');
var passport = require("passport");
require('mongoose-pagination');
apiRoutesChat = express.Router();


apiRoutesChat.get('/_api/v1/chat/:id', function(req,res){
	var limit=parseInt(req.query.maxResult);
	var page=parseInt(req.query.page);
	var conversationId=req.params.id
	if(limit==undefined||limit==null){
		limit=100;
	}
	if(page==undefined||page==null||page==""){
		page=1;
	}

	modelChat.find({conversationId:conversationId})
	.sort({createdAt:1})
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

apiRoutesChat.post('/_api/v1/chat', passport.authenticate('jwt', {session:false}), function(req,res){
	var userId=req.user.userId;
	var chat = {
		conversationId:req.body.conversationId,
		userId:userId,
		chatId:number.random(100000000, 999999999),
		chatContent:req.body.chatContent,
		role:req.body.role,
		createdAt:Date.now(),
		updatedAt:Date.now(),
		status:1,
	}
	modelUser.findOne({userId:userId}, function(err, result){
		if(err) console.log(err)
		chat.thumbnail=result.thumbnail;
		console.log(chat.thumbnail)
		console.log(chat)
		modelChat.create(chat, function(err, result){
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
})

// apiRoutesComment.put('/comment/:id', passport.authenticate('jwt', {session:false}), function(req,res){
// 	var userId=req.user.attributes.userId;
// 	modelComment.update({userId:userId, videoWebsiteId:req.params.id, commentId:req.query.commentId}, 
// 		{$set:{comment:req.body.comment, numberoflike:req.body.numberoflike}}, function(err, result){
// 		if(err){
// 			res.status(500).send({
// 				message:"Server error"
// 			})
// 		}
// 		res.status(200).send({
// 			message:"Edit comment successfull"
// 		})
// 	})
// })

// apiRoutesComment.delete('/comment/:id', passport.authenticate('jwt', {session:false}), function(req,res){
// 	var userId=req.user.userId;

// 	modelComment.remove({userId:userId, videoWebsiteId:req.params.id, commentId:req.query.commentId}, function(err, result){
// 		if(err){
// 			res.status(500).send({
// 				message:"Server error"
// 			})
// 		}
// 		res.status(200).send({
// 			message:"Delete comment successfull"
// 		})
// 	})
// })

module.exports=apiRoutesChat;