var express=require('express');
var playlistModel=require('../models/modelPlaylist');
var jwt=require('jsonwebtoken');
var mongoose=require('mongoose');
var number = require('./randomNumber');
var passport = require("passport");
require('mongoose-pagination');
var apiRoutesPlaylist = express.Router();


apiRoutesPlaylist.post("/_api/v1/playlist", passport.authenticate('jwt', {session:false}), (req,res)=>{
	if(req.body.thumbnail==""){
		var thumbnail ="https://tophinhanhdep.net/wp-content/uploads/2015/12/anh-dep-mua-xuan-3.jpg"
	}else{
		thumbnail=req.body.thumbnail
	}
	var userId = req.user.userId;
	var playlist={
		playlistId:number.random(10000000,99999999),
		name:req.body.name,
		description:req.body.description,
		thumbnail:thumbnail,
		userId:userId,
		createdAt:Date.now(),
		updatedAt:Date.now(),
		status:1
	};
	if(req.body.name==null||req.body.name==undefined||req.body.name.length<7||req.body.name.length==0){
		res.status(401).json({
			message:"Playlist name must be larger than 7 character"
		})
		return false;
	}
	playlistModel.create(playlist, (err,result)=>{
		if(err){
			res.status(500).json({
				message:"Server error"
			})
		}else{
			res.status(200).json(result);
		}
	})
})

apiRoutesPlaylist.get("/_api/v1/playlist", passport.authenticate('jwt', {session:false}), (req,res)=>{
	var limit=parseInt(req.query.maxResult);
	var page=parseInt(req.query.page);
	var userId=req.user.userId;
	if(limit==undefined||limit==null){
		limit=10;
	}
	if(page==undefined||page==null){
		page=1;
	}
	playlistModel.find({userId:userId})
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

apiRoutesPlaylist.get("/_api/v1/playlist/:id", passport.authenticate('jwt', {session:false}), (req,res)=>{
	var userId=req.user.userId;
	playlistModel.findOne({userId:userId,playlistId:req.params.id},
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

apiRoutesPlaylist.put("/_api/v1/playlist/:id", passport.authenticate('jwt', {session:false}), (req,res)=>{
	if(req.body.thumbnail==""){
		var thumbnail ="https://tophinhanhdep.net/wp-content/uploads/2015/12/anh-dep-mua-xuan-3.jpg"
	}else{
		thumbnail=req.body.thumbnail
	}
	var userId=req.user.userId;
	if(req.body.name==null||req.body.name==undefined||req.body.name.length<7||req.body.name.length==0){
		res.status(401).json({
			message:"Playlist name must be larger than 7 character"
		})
		return false;
	}

	playlistModel.update({
		userId:userId, 
		'playlistId':req.params.id},
		{$set:{
			'name':req.body.name, 
			'description':req.body.description,
			'thumbnail':thumbnail,
			'updatedAt':Date.now()}}, 
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

apiRoutesPlaylist.delete("/_api/v1/playlist/:id", passport.authenticate('jwt', {session:false}), (req,res)=>{
	var userId=req.user.userId;
	playlistModel.remove({userId:userId, playlistId:req.params.id}, function(err, result){
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

module.exports = apiRoutesPlaylist;