const express 		= require('express'),
			credentials = require('../utils/credentials.js'),
      shopifyAPI 	= require('shopify-node-api'),
      mongoose 		= require('mongoose'),
      Shop 				= require('../models/shop.js');

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
	    nonce: credentials.oauth.nonce,
	    verbose: false
	});

  Shopify.exchange_temporary_token(query_params, function(err, data){
  	// SAVE IN DATABASE;
  	if (err) return res.send(500, { error: err });

		var update = {
			name: query_params.shop,
			token: data.access_token
	  };
    var options = {
      new: true, // return the new doc
      upsert: true, // add a new doc if doesn't exit
      setDefaultsOnInsert: true
    };

  	Shop.findOneAndUpdate({"name":query_params.shop},update,options,function(err, shops){
			if (err) return res.send(500, { error: err });
			console.log(shops);

			if(shops==null){
				new Shop({
					name: query_params.shop,
	      	token: data.access_token
				}).save();
			}
			let webhooks=credentials.webhooks;

			for (let i = 0; i < webhooks.length; i++) {
				Shopify.post('/admin/webhooks.json',webhooks[i], function(err, data, headers){
					if(err)console.log(err);
					if(err)console.log(data);
				});
			}
			res.redirect('https://'+query_params.shop+'/admin/apps');
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
	    nonce: credentials.oauth.nonce,
	    verbose: false
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
	res.sendStatus(200);
	let name=req.body.myshopify_domain;
	Shop.findOne({"name":name}).remove().exec();
	res.end();
});

module.exports = router;
