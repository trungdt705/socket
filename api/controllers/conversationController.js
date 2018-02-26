var modelConversation=require('../models/modelConversation');
var express = require('express');
var jwt=require('jsonwebtoken');
var mongoose=require('mongoose');
var passport = require("passport");
require('mongoose-pagination');
apiRoutesConversation = express.Router();


apiRoutesConversation.get('/_api/v1/conversation', function(req,res){
	var limit=parseInt(req.query.maxResult);
	var page=parseInt(req.query.page);
	if(limit == undefined || limit == null){
		limit = 10;
	}
	if(page == undefined || page == null || page == ""){
		page = 1;
	}
	modelConversation.find({})
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

apiRoutesConversation.post('/_api/v1/conversation', passport.authenticate('jwt', {session:false}), function(req,res){
	var conversation = {
		conversationId:req.body.conversationId,
		username:req.body.username,
		createdAt:Date.now(),
		updatedAt:Date.now(),
		status:1,
	}
	modelConversation.findOneAndUpdate({conversationId:req.body.conversationId}, conversation, {upsert:true}, function(err, result){
		console.log('result' + result)
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

module.exports=apiRoutesConversation;