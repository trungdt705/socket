var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var conversationSchema = new Schema({
	conversationId:String,
	username:String,
  	createdAt:String,
   	updatedAt:String,
   	status:Number,
});

var modelConversation = mongoose.model('modelConversation', conversationSchema);
module.exports = modelConversation;