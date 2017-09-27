const crypto = require('crypto');

module.exports = {
  generateNonce:function() {
  	return crypto.randomBytes(16).toString('hex');
	},
 	sleep:function(milliseconds) {
	  var start = new Date().getTime();
	  var end = start;
	  while(end < start + milliseconds) {
	    end = new Date().getTime();
	  }
	}
};   