var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var chatSchema = new Schema({
	conversationId:String,
   	userId:String,
   	chatId:String,
   	chatContent:String,
   	thumbnail:String,
   	role:Number,
  	createdAt:String,
   	updatedAt:String,
   	status:Number,
});

var modelChat = mongoose.model('modelChat', chatSchema);
module.exports = modelChat;