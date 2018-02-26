var modelVideoWebsite=require('../models/modelVideoWebsite');
var express=require('express');
var jwt=require('jsonwebtoken');
var number = require('./randomNumber');
var mongoose=require('mongoose');
require('mongoose-pagination');
apiRoutesVideoWebsite=express.Router();
var passport = require("passport");

apiRoutesVideoWebsite.get('/_api/v1/video', function(req,res){
	var limit=parseInt(req.query.maxResult);
	var page=parseInt(req.query.page);
	var search=req.query.search;
	if(limit==undefined||limit==null){
		limit=10;
	}
	if(page==undefined||page==null||page==""){
		page = 1;
	}
	if(search!=undefined){
		loadVideoSearch(search, limit, page, res);
	}else{
		loadVideoNoSearch(limit, page, res);
	}	
});

function loadVideoSearch(search, limit, page, res){
	modelVideoWebsite.find({ $text:{ $search:search }})
	.paginate(page, limit, function(err, result, total){
		if(err){
			res.status(500).json({
				message:"Server error"
			});
		}else{
			res.status(200).json({
				data:result, 
				meta:{
					"totalPage":Math.ceil(total/limit),
					"page":page
				}
			});
		}
	})
}

function loadVideoNoSearch(limit, page, res){
	console.log('page='+page)
	console.log('limit='+limit)
	modelVideoWebsite.find({status:2})
	.paginate(page, limit, function(err, result, total){
		if(err){
			res.status(500).json({
				message:"Server error"
			});
		}else{
			res.status(200).json({
				data:result, 
				meta:{
					"totalPage":Math.ceil(total/limit),
					"page":page
				}
			});
		}
	})
}

apiRoutesVideoWebsite.get("/_api/v1/video/:id", (req,res)=>{
	modelVideoWebsite.findOne({videoWebsiteId:req.params.id}, (err, result)=>{
		if(err) return res.status(500).json({message:"Server error"})
			res.status(200).json(result);
	})
})

//===============================Tạo mới video=====================================//
apiRoutesVideoWebsite.post("/_api/v1/video", passport.authenticate('jwt', {session:false}), (req,res)=>{
	console.log(req.user)
	var userId=req.user.userId;
	var randomnumber=number.random(10000000,99999999);
	if(req.body.thumbnail==""){
		var avatar="https://phunudep.com/wp-content/uploads/2016/01/anh-thien-nhien-tuoi-dep-ngay-xuan-hinh-2.jpg"
	}else{
		var avatar=req.body.thumbnail
	}
	var videoWebsite =
	{
		videoWebsiteId:randomnumber,
		name: req.body.name,
		description: req.body.description,
		thumbnail:avatar,
		keywords: req.body.keywords,
		url: req.body.url,			
		userId:userId,
		createdAt:Date.now(),
		updatedAt:Date.now(),
		status:1,
		play:{
			listened:req.body.play.listened,
			downloaded:req.body.play.downloaded,
			favourited:req.body.play.favourited
		}
	};

	if(req.body.name==null
		||req.body.name==undefined
		||req.body.name.length < 7
		||req.body.name.length==0){
		res.status(401).json({
			message:"Video name must be larger than 7 character"
		})
		return false;
	}
	modelVideoWebsite.create(videoWebsite, (err,result)=>{
		if(err){
			res.status(500).json({
				message:"Server error"
			})
		}
		res.status(200).json(result);
	});
})
//===============================Tạo mới video=====================================//

//===============================Đếm lượt nghe=====================================//
apiRoutesVideoWebsite.put("/_api/v1/video/:id", (req,res)=>{
	var userId=req.user.userId;
	if(req.body.name==null
		||req.body.name==undefined
		||req.body.name.length<7
		||req.body.name.length==0){
		res.status(401).json({
			message:"Video name must be larger than 7 character"
		})
		return false;
	}
	if(req.body.listened==undefined||req.body.listened==null){
		req.body.listened=0;
	}
	if(req.body.downloaded==undefined||req.body.downloaded==null){
		req.body.listened=0;
	}
	if(req.body.favourited==undefined||req.body.favourited==null){
		req.body.listened=0;
	}
	modelVideoWebsite.findOne({videoWebsiteId: req.params.id}, function(err,result){
		if(err) return res.status(500).send({message:"Server error"});
		modelVideoWebsite.update({videoWebsiteId: req.params.id},{$set:{
			"play.listened":parseInt(result.play.listened)+parseInt(req.body.listened),
			"play.downloaded":parseInt(result.play.downloaded)+parseInt(req.body.downloaded),
			"play.favourited":parseInt(result.play.favourited)+parseInt(req.body.downloaded),
			name:req.body.name,
			description:req.body.description,
			thumbnail:req.body.thumbnail,
			keywords:req.body.keywords}}, 
			(err,result)=>{
				if(err){
					res.status(500).json({
						message:"Server error"
					})
				}else{
					res.status(200).json(result);
				}
			});	
	});	
})
//===============================Đếm lượt nghe=====================================//
//=======================================Xóa video=================================//
apiRoutesVideoWebsite.delete("/_api/v1/video/:id", passport.authenticate('jwt',{session:false}), (req,res)=>{
	var userId=req.user.userId;
	modelVideoWebsite.remove({videoWebsiteId: req.params.id}, (err,result)=>{
		if(err){
			res.status(500).json({
				message:"Server error"
			})
		}else{
			res.status(200).json({
				message:"Delete successful"
			});
		}
	});

})
//==================================Kết thúc Xóa video===============================//

module.exports=apiRoutesVideoWebsite;
