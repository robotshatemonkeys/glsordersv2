const express = require('express'),
	  	credentials = require('../utils/credentials.js'),
      shopifyAPI = require('shopify-node-api'),
      shopifyRequest  = require('../utils/shopify-request.js'),
      mongoose = require('mongoose'),
      Shop = require('../models/shop.js');


const tntEmpty=' '.repeat(20).concat("00000");
const tntEmpty1=' '.repeat(32);
const tntPag=' '.repeat(5),
		 	tntColli="000001",
			tntPeso="00001,00",
			tntImp="0000000000,00",
			tntImpCont="0000000000,00";

const 
			tntDestLength=40,
			tntRagLength=30,
		  tntIndLength=30,
		  tntCapLength=5,
		  tntCitLength=30,
		  tntColliLength=6,
		  tntPesoLength=7,
		  tntImpLength=12,
		  tntMailLength=47,
		  tntTelLength=15,
		  tntImpContrLength=12;


const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let query_params =req.query;
  Shop.find({"name":query_params.shop},function(err, shops){

  	if (err) return res.status(500).send("database errror").end();
  	if(shops.length==0)return res.status(500).send("no shops found").end();

  	var Shopify = new shopifyAPI({
		  shop: shops[0].name, // MYSHOP.myshopify.com 
		  shopify_api_key: credentials.oauth.shopify_api_key, // Your API key 
	    shopify_shared_secret: credentials.oauth.shopify_shared_secret, // Your Shared Secret
		  access_token: shops[0].token, //permanent token 
		  verbose: false
		});

	  let orders=query_params.ids.join();
 		let query_data={};
 		query_data.ids=orders;
 		query_data.status="any";


  	Shopify.get('/admin/orders.json', query_data, function(err, data, headers){

  		let orders=data.orders;
  		let tntDat="";
  		if(orders.length>0){
	  		for (let i = 0; i < orders.length; i++) {
	  			tntDat=tntDat.concat(generateDat(orders[i]));
	  		}

	  		let date = new Date();
				let docName="Blak-".concat(date.yyyymmdd(),'.dat');
	  		res.setHeader('Content-disposition', 'attachment; filename='+docName);
				res.setHeader('Content-type', 'text/plain');
				res.charset = 'UTF-8';
				res.write(tntDat);
				res.end();
			}else{
				res.send(200);
				res.end();
			}
		});
  });
});


function generateDat(order){
	var noteAddress="";
	
	var address2=order.shipping_address.address2;
	if(address2!=null && address2!="undefined"){
		noteAddress=address2;
	}

	if(order.note!=null && order.note!="undefined"){
		noteAddress=noteAddress+" - "+order.note;
	}

	var company=order.shipping_address.company;
	if(company!=null && company!="undefined"){
		noteAddress=noteAddress+" - "+company;
	}
	
	let tntDest=buildTnt(noteAddress,tntDestLength);
	let tntRag=buildTnt(order.shipping_address.name,tntRagLength);
	let tntInd=buildTnt(order.shipping_address.address1,tntIndLength);
	let tntCap=buildTnt(order.shipping_address.zip,tntCapLength);
	let tntCit=buildTnt(order.shipping_address.city,tntCitLength);
	let tntPrv=order.shipping_address.province_code;

	let date = new Date();
	let tntDate=date.yyyymmdd();
	let tntHour=date.hhmm();

	let tntBarCode=buildBarcode(order.order_number);

	let tntMail=buildTnt(order.email,tntMailLength);
	let tntTel=buildTnt(order.shipping_address.phone,tntTelLength);

	let dat=tntDest.concat(
						tntEmpty,tntEmpty1,tntRag,
						tntInd,tntCap,tntCit,tntPrv,
						tntDate,tntHour,
						tntColli,tntPeso,tntImp,
						tntBarCode,
						tntMail,tntTel,
						tntPag,tntImpCont,".\r\n");



	return dat;
}



function buildBarcode(orderNum){
	let orderNumber=orderNum.toString();
	let format="2";
	let sezionale="01";
	let fix="0";  
	let d = new Date();
	let year = d.getFullYear();
	let codeYear=year.toString().substr(2,2);
	switch(orderNumber.length) {
	    case 4:
	        orderNumber= "00"+orderNumber;
	        break;
	    case 5:
	        orderNumber= "0"+orderNumber;
	        break;
	}
    
	let conbinedCode=format.concat(codeYear,sezionale,orderNumber,fix);
	var charts=conbinedCode.split('');

	var sumCode=0;
	for(let i=0;i<charts.length;i++){
	    var value=parseInt(charts[i]);
	    var multiplier=0;
	    if(isOdd(i)){
	     multiplier= value * 3;
	    }else{
	     multiplier= value * 1;
	    }
	    sumCode+=multiplier;
	  
	}
	
	let nearestMultiple=Math.round(sumCode / 10) * 10;
	if(nearestMultiple<sumCode){
    nearestMultiple+=10;
	}
	let checkCode=nearestMultiple-sumCode;

	/*let finalCode=conbinedCode.concat(checkCode.toString());*/
	return conbinedCode;
}


function buildTnt(text,totLength){
	let tnt=null;

	if(text!=null && text!="undefined"){
		var cleanText = text.replace(/[!”£$%&/()=?^ì*+§]/gi, '-')
												.replace(/[éè]/gi, 'e')
												.replace(/[ù]/gi, 'u')
												.replace(/[à]/gi, 'a')
												.replace(/[ò]/gi, 'o')
												.replace(/[ç]/gi, 'c');
		tnt=cleanText;

		if(cleanText.length<totLength){
			let diff=totLength-cleanText.length;
			let empty=' '.repeat(diff);
			tnt=cleanText.concat(empty);
		}
		else if(cleanText.length>totLength){
			tnt=cleanText.substring(0,totLength);
		}

	}else{
		tnt=' '.repeat(totLength);
	}
	return tnt;
}


function handelize(text) {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç'{}´-+¿?.,;:[]*¨¡!=()&%$#/\"_",
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc                         ",
      mapping = {};
  for(var i = 0, j = from.length; i < j; i++ )
      mapping[ from.charAt( i ) ] = to;
  return function( str ) {
      var ret = [];
      for( var i = 0, j = str.length; i < j; i++ ) {
          var c = str.charAt( i );
          if( mapping.hasOwnProperty( str.charAt( i ) ) )
              ret.push( mapping[ c ] );
          else
              ret.push( c );
      }
      //return ret.join( '' );
      return ret.join( '' ).trim().replace( /[^-A-Za-z0-9]+/g, '-' ).toLowerCase();
  };
}
    
function isOdd(num) { return num % 2 ==1;}

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

Date.prototype.hhmm = function() {
  var hh = this.getHours();
  var mm = this.getMinutes();

  return [(hh>9 ? '' : '0') + hh,
          (mm>9 ? '' : '0') + mm
         ].join('');
};


module.exports = router;

