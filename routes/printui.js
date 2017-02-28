const express = require('express'),
	  	credentials = require('../utils/credentials.js'),
      shopifyAPI = require('shopify-node-api'),
      shopifyRequest  = require('../utils/shopify-request.js'),
      mongoose = require('mongoose'),
      Shop = require('../models/shop.js');


const router = express.Router();


router.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {}; 
 	next();
})


function getWeatherData(){ 
	return {
      orders: [
          {
              id: 'Portland',                   
          },{
              id: 'caca',                   
          }
      ]
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  let query_params =req.query;
  Shop.find({"name":query_params.shop},function(err, shops){

  	if (err) return res.send(500, { error: err });
		
		Shop.findOne({"name":"blakshop.myshopify.com"},function(err,shops){
		  Shopify = new shopifyAPI({
		    shop: shops.name, // MYSHOP.myshopify.com 
		    shopify_api_key: credentials.oauth.shopify_api_key, // Your API key 
		    shopify_shared_secret: credentials.oauth.shopify_shared_secret, // Your Shared Secret 
		    access_token: shops.token, //permanent token,
		    verbose: false
		  });
		});

	  let orders=query_params.ids.join();
 		let query_data={};
 		query_data.ids=orders;
 		query_data.status="any";


  	Shopify.get('/admin/orders.json', query_data, function(err, data, headers){
  		console.log(data.orders);
  		let orders=data.orders;
  		var context = {
				orders: orders.map(function(order){
					return {
						id: order.id.toString()
					}
				})
			};
			console.log(context);
  	


  		if(orders.length>0){
  			res.locals.partials.ordersContext = context;
	  		res.render('printui');
			}else{
				res.send(200);
				res.end();
			}
		});
  });
});

function listOrder(order){


}

module.exports = router;

