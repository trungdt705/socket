var modelVideoWebsite= require('../models/modelVideoWebsite')
var modelNoti = require('../models/modelNotificationCheckVideo');
var modelUser = require('../models/modelUser');
var secret=require('../../config/configApp')
var jwt= require('jsonwebtoken');
module.exports=function (io) {
	//middleware xac thuc ket noi socket
	var decodedToken=""
	io.use(function(socket, next){
		if (socket.handshake.query && socket.handshake.query.token){
			var token = socket.handshake.query.token.split(' ')[1];
			jwt.verify(token, secret.secretToken, function(err, decoded) {
				if(err) return console.log('Co loi');
				decodedToken = decoded;
				next();
			});
		}
		next(new Error('Authentication error'));
	})
	//Bat su kien khi ng dung connect den server
	io.on('connection', function(socket){
		var userId=decodedToken.userId;
		console.log('Co nguoi ket noi ' + socket.id);
		socket.on('admin-send-noti', function(data){
			console.log(data);
			socket.broadcast.emit('server-response-noti', data)
		})

		socket.on('admin-uncheck-noti', function(data){
			console.log('admin-uncheck-noti '+ data);
			modelNoti.findOne({notiId:data.notiId}, function(err, result){
				console.log('result'+result)
				if(result == null|| result.status == 1){
					socket.broadcast.emit('server-uncheck-noti', data);
				}
			})		
		})

		function reconnect(){
			modelNoti.find({status:1, userId:userId}, function(err, result){
				if(err) return console.log(err);
				socket.emit('reconnect', result)		
			})
		}
		reconnect();

		//=================Bắt đầu Xử lý phần chat=====================//
		//user join room của mình khi đăng nhập
		socket.on('user-join-room-myself', function(data){
			console.log(data)
			socket.join(data);
		})
		socket.on("user-chat-admin", function(data){
			modelUser.findOne({userId:userId}, function(err, result){
				if(err) console.log(err);
				var infoUserSendAdmin = {
					userId:userId,
					username:result.username,
					thumbnail:result.thumbnail,
					content:data.content,
					createdAt:data.createdAt
				};
				socket.broadcast.emit('server-send-chat-admin', infoUserSendAdmin)
			})		
		})
		//Lắng nghe sự kiện khi admin click vào để support
		socket.on('admin-join-rooms', function(data){
			//admin join vào room của user cần support
			console.log('room' + data)
			socket.join(data);
		})
		//server lắng nghe sự kiện khi admin gõ nội dung chat cho user
		socket.on('admin-support-user', function(data){
				console.log(1)
				modelUser.findOne({userId:userId}, function(err, result){
					if(err) console.log(err)
					var infoAdminSendUser = {
						userId:userId,
						username:result.username,
						thumbnail:result.thumbnail,
						content:data.content,
						createdAt:data.createdAt,
						room:data.room
					};
					console.log(infoAdminSendUser)
					//Gửi nội dung chat về user		
					io.sockets.in(data.room).emit('server-send-chat-from-admin', infoAdminSendUser)
				})		
			})

		//=================Kết thúc Xử lý phần chat=====================//	
	})
}