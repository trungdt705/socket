var express=require('express');
var modelVideoWebsite=require('../models/modelVideoWebsite');
var routeFile = express.Router();

routeFile.post('/_api/v1/upload', function (req,res) {	
	console.log(req.files);
	if (!req.files)
		return res.status(400).send('No files were uploaded.');

		// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
		let sampleFile = req.files.file;	

		// Use the mv() method to place the file somewhere on your server
		sampleFile.mv('./publics/images/' + sampleFile.name, function(err) {
			if (err)
			  return res.status(500).send(err);

			res.status(200).json({url:'https://api-challenger-2018.herokuapp.com/images/' + sampleFile.name});
		});
})

routeFile.get('/_api/v1/music/:id', function(req,res){	
	var fileId = req.params.id; 
	modelVideoWebsite.findOne({videoId : fileId}, function(err,result){
		if(err){
			res.status(500).send({
				message:"Server errors"
			})
		}
		var url=result.url;
		res.status(200).send({
			success:true,
			url:url
		})
	})
});
module.exports=routeFile;

