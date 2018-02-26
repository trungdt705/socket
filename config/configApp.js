var config = require('./configMongoose');
module.exports={
	secretToken: "my-secret",
	url: ()=> {
		return `mongodb://trungdt705:thanhtrung@ds147518.mlab.com:47518/my_app`;
	},
}