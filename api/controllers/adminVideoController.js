var modelVideoWebsite=require('../models/modelVideoWebsite');
var videoModel = require('../models/modelVideo');
var express=require('express');
var jwt=require('jsonwebtoken');
var mongoose=require('mongoose');
require('mongoose-pagination');
var modelUser = require("../models/modelUser");
apiRoutesAdminVideo=express.Router();
var passport = require("passport");
var Transactions= require('mongoose-transactions');
//middleware xác thực admin
var roleAdmin = function roleAdmin(req, res, next){
	if(req.user.role == '1'){
		next();
	}else{
		return res.status(401).json({
			message:"Unauthorizated"
		})
	}
}

apiRoutesAdminVideo.get('/_api/v1/admin/video', passport.authenticate('jwt', {session:false}), roleAdmin, function(req,res){
	var limit=parseInt(req.query.maxResult);
	var page=parseInt(req.query.page);
	var search=req.query.search;
	var fromDate=req.query.fromDate;
	var toDate=req.query.toDate;
	var status=req.query.status;
	if(limit==undefined||limit==null){
		limit=5;
	}
	if(page==undefined||page==null||page==""){
		page=1;
	}
	var totalVideo=0;
	if(search != "" && fromDate == "" && toDate == ""){
		//Có tìm kiếm, không có ngày tháng, có status, có limit
		console.log('Có tìm kiếm, không có ngày tháng, có status, có limit')
		loadVideoSearchNoDate(search, limit, page, res, totalVideo, status);
	}else if(search =="" && fromDate  == "" && toDate == ""){
		console.log('Không tìm kiếm, không có ngày tháng, có status, có limit')
		loadVideoNoSearchNoDate(limit, page, res, totalVideo, status)
	}else if(search != "" && fromDate != "" && toDate != ""){
			//Có search, chọn ngày tháng, có status, có limit
			console.log('Có search, chọn ngày tháng, có status, có limit')
			loadVideoSearchHaveDate(search, fromDate, toDate, limit, page, res, totalVideo, status)
	}else if(search =="" && fromDate != "" && toDate != ""){
			//Không search, có chọn ngày tháng
			console.log('Không search, có chọn ngày tháng')
			loadVideoNoSearchHaveDate(fromDate, toDate,limit, page, res, totalVideo, status)
	}
});

function loadVideoSearchNoDate(search, limit, page, res, totalVideo, status){
	modelVideoWebsite.find({status:status, $text:{$search:search}})
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
}

function loadVideoNoSearchNoDate(limit, page, res, totalVideo, status){
	modelVideoWebsite.find({status:status})
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
}

function loadVideoSearchHaveDate(search, fromDate, toDate, limit, page, res, totalVideo, status){
	modelVideoWebsite.find({status:status, 
		$text:{$search:search}, 
		createdAt:{$gte:fromDate},
		createdAt:{$lte:toDate}})
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
}

function loadVideoNoSearchHaveDate(fromDate, toDate,limit, page, res, totalVideo, status){
	modelVideoWebsite.find({status:status, 
		createdAt:{$gte:fromDate},
		createdAt:{$lte:toDate}})
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
}

//===============================Đếm lượt nghe=====================================//
apiRoutesAdminVideo.get("/_api/v1/admin/video/:id", passport.authenticate('jwt', {session:false}),roleAdmin, (req,res)=>{
	var userId=req.user.userId;
	modelVideoWebsite.findOne({videoWebsiteId: req.params.id}, function(err,result){
		if(err) return res.json({
			message:"Server error"
		})
			return res.json({
				message:"successful",
				data:result
			})
		});	
})

apiRoutesAdminVideo.put("/_api/v1/admin/video/verify/:id", passport.authenticate('jwt', {session:false}),roleAdmin, (req,res)=>{
	var userId=req.user.userId;
	var status=req.body.status;
	modelVideoWebsite.findOne({videoWebsiteId: req.params.id}, function(err,result){
		if(err) return res.status(500).send({message:"Server error"});
		modelVideoWebsite.update({videoWebsiteId: req.params.id},{$set:{status: status}}, 
			(err,result)=>{
				if(err){
					res.status(500).json({
						message:"Server error"
					})
				}else{
					videoModel.update({videoWebsiteId: req.params.id}, {$set:{status:status}}, function(err, result){
						if(err) res.status(500).json({
							message:"Server error"
						})
						return res.status(200).json({
							message:'Successful'
						})
					})
				}
			});
	});	
})

apiRoutesAdminVideo.put("/_api/v1/admin/video/:id", passport.authenticate('jwt', {session:false}),roleAdmin, (req,res)=>{
	modelVideoWebsite.findOne({videoWebsiteId: req.params.id}, function(err,result){
		if(err) return res.status(500).send({message:"Server error"});
		modelVideoWebsite.update({
			videoWebsiteId:req.params.id},
			{$set:{
				name:req.body.attributes.name, 
				description:req.body.attributes.description,
				keywords:req.body.attributes.keywords,
				thumbnail:req.body.attributes.thumbnail,
				updatedAt:Date.now(),
				status:req.body.attributes.status}}, 
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
// //===============================Đếm lượt nghe=====================================//
// //=======================================Xóa video=================================//
apiRoutesAdminVideo.delete("/_api/v1/admin/video/:id", passport.authenticate('jwt',{session:false}),roleAdmin, (req,res)=>{
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

module.exports=apiRoutesAdminVideo;
