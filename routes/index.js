var express = require('express'),
    router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  	let query_params =req.query;
  	if(query_params.shop){
  		res.render('home',{"url":'https://'+query_params.shop+'/admin/orders'});
  	}else{
      res.redirect('/install/auth');
  	}
});


module.exports = router;
