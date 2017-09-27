var mongoose = require('mongoose');
var shopSchema = mongoose.Schema({ 
		name: String,
    token: String
});

shopSchema.methods.getToken = function(){
	return this.token;
};


var Shop = mongoose.model('Shop', shopSchema); 
module.exports = Shop;
