module.exports = {
  callback: function (err, data, headers) {
		var api_limit = headers['http_x_shopify_shop_api_call_limit'];
		console.log( api_limit ); // "1/40" 
  }
};   