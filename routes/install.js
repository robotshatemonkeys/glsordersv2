const express = require('express'),
			credentials = require('../utils/credentials.js'),
      shopifyAPI = require('shopify-node-api'),
      mongoose = require('mongoose'),
      Shop = require('../models/shop.js');

const router = express.Router();

let path=credentials.path.dev;
if(process.env.OPENSHIFT_MONGODB_DB_URL){
	path=credentials.path.prod;
}

/* GET home page. */
router.get('/auth', function(req, res, next) {
	let query_params =req.query;
	res.render('install', { csrf: 'CSRF token goes here' });
});

router.get('/finish_auth', function(req, res, next) {
	let query_params =req.query,
	 		url=path+credentials.oauth.redirect_uri;

	var Shopify = new shopifyAPI({
	    shop:query_params.shop, // MYSHOP.myshopify.com 
	    shopify_api_key: credentials.oauth.shopify_api_key, // Your API key 
	    shopify_shared_secret: credentials.oauth.shopify_shared_secret, // Your Shared Secret 
	    shopify_scope: credentials.oauth.shopify_scope,
	    redirect_uri: url,
	    nonce: '' // you must provide a randomly selected value unique for each authorization request 
	});

  Shopify.exchange_temporary_token(query_params, function(err, data){

  	// SAVE IN DATABASE;
  	Shop.find({"name":query_params.shop},function(err, shops){
			new Shop({
				name: query_params.shop,
      	token: data.access_token
			}).save();

			let removeUrl=path+credentials.oauth.remove_uri;
			

			let webhooks={
			  "webhook": {
			    "topic": "app/uninstalled",
			    "address": removeUrl,
			    "format": "json"
			  }
			}
			
			Shopify.post('/admin/webhooks.json',webhooks, function(err, data, headers){				
				res.redirect('https://'+query_params.shop+'/admin/apps');
			});
		});
  	
  });
  
});

router.post('/process', function(req, res){
  	let name=req.body.name,
				url=path+credentials.oauth.redirect_uri;
  	var Shopify = new shopifyAPI({
	    shop: name, // MYSHOP.myshopify.com 
	    shopify_api_key: credentials.oauth.shopify_api_key, // Your API key 
	    shopify_shared_secret: credentials.oauth.shopify_shared_secret, // Your Shared Secret 
	    shopify_scope: credentials.oauth.shopify_scope,
	    redirect_uri: url,
	    nonce: '' // you must provide a randomly selected value unique for each authorization request 
		});
		
		var auth_url = Shopify.buildAuthURL();
		res.redirect(auth_url);
});

router.get('/thank-you', function(req, res, next) {
	res.send('index :D');
});

/*------------------------
DELETE APP 
--------------------------*/
router.post('/delete', function(req, res) {
	let name=req.body.myshopify_domain;
	Shop.findOne({"name":name}).remove().exec();	
});


module.exports = router;

