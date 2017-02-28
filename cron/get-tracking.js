#!/usr/bin/env node
const express = require('express'),
      credentials = require('../utils/credentials.js'),
      shopifyAPI = require('shopify-node-api'),
      shopifyRequest  = require('../utils/shopify-request.js'),
      mongoose = require('mongoose'),
      Client = require('ftp'),
      csv=require('csvtojson'),
      fs = require('fs'),
      Shop = require('../models/shop.js');



var Shopify = new shopifyAPI({
  shop: "blakshop.myshopify.com", // MYSHOP.myshopify.com 
  shopify_api_key: credentials.oauth.shopify_api_key, // Your API key 
  shopify_shared_secret: credentials.oauth.shopify_shared_secret, // Your Shared Secret 
  access_token: "6f9351032845a7bb3d45c998276974ce", //permanent token,
  verbose: false
});



let orders={},
    ordersList=[],
    filesList=[];

var fileIndex=0;

var c = new Client();

// connect to FTP GLS
c.connect({
  host:'ftp.gls-italy.com',
  user:'blakshopv17530',
  password:'3Az4keFa'
});


c.on('ready',()=>{
  c.list(function(err, list) {
    if (err) throw err;
    for (var i = 0; i < list.length; i++) {
      let name=list[i].name;
      console.log("READ FILE:"+name);
      if(name.indexOf('Spedizioni')!=-1){
        filesList.push(name);
      }
    } 
    console.log(filesList.length+" files");
    if(filesList.length>0){
      getFile();
    }else{
      console.log("no files");
      process.exit()

    }
  })
});

function getFile(){
  let file=filesList[fileIndex];
  ordersList=[];
  console.log("-----------------------");
  console.log("START FILE:"+file);
  c.get(file,(err, stream)=> {
    if (err) throw err;
    stream.pipe(fs.createWriteStream(process.env.OPENSHIFT_DATA_DIR+"/"+file));

              
    csv({
      noheader:true,
      trim:true,
      delimiter:["$"]
    })
    .fromStream(stream)
    .on('json',(jsonObj)=>{
        if(jsonObj.field1){
          let orderNumb=(jsonObj.field1);
          ordersList.push(orderNumb);
          orders[orderNumb]=jsonObj['field37'].concat(jsonObj.field10);
        }
    })
    .on('end',()=>{
      stream.unpipe();
      let query_data={};
      query_data.fields="id,order_number,fulfillments";
      query_data.status="any";
      if(ordersList.length>0){
        loopList(ordersList,orders,0,ordersList.length-1,query_data,file); 
      }else{
        getNextFileOrDie();
      }
    })
    .on('error',(err)=>{
        console.log(err)
        stream.unpipe();
        c.end();
    });
  });
}

function getNextFileOrDie(){
  fileIndex+=1;
  if(fileIndex<filesList.length){
    getFile();
  }else{
    process.exit()
  }
}
  
function loopList(list,orders,index,limit,query,file){
  console.log("INDEX:"+index);
  if(index>limit) { 
    console.log("END FILE");
    c.delete(file,(err, stream)=> {
      getNextFileOrDie();
    });
  }else{
    query.name=list[index];
    Shopify.get("/admin/orders.json",query,function(err,data,headers){ 
      if (err) return res.status(500).send(err).end();
      if(headers.http_x_shopify_shop_api_call_limit>34) sleep(1000);  
      console.log(data);

      let orderData=data.orders[0];
      if(data.orders.length>0 && orders[orderData.order_number]){
        let fulfillmentID=orderData.fulfillments[0].id;
        let pushData={
          "fulfillment": {
            "id": fulfillmentID,
            "tracking_number": orders[orderData.order_number],
            "tracking_company": "Other",
            "notify_customer":true,
            "tracking_url":"https://www.gls-italy.com//?option=com_gls&view=track_e_trace&mode=search&numero_spedizione="+orders[orderData.order_number]+"&tipo_codice=nazionale"
         } 
        }
        
        Shopify.put('/admin/orders/'+orderData.id+'/fulfillments/'+fulfillmentID+'.json',pushData,function(err,data,headers){ 
          if(headers.http_x_shopify_shop_api_call_limit>35) sleep(1000);
          if(err)console.log(err);    
          console.log("SENT:"+index+"/"+limit);
          loopList(list,orders,index+1,limit,query,file);
        });
      }else{
        loopList(list,orders,index+1,limit,query,file);
      }
    });
  }
}
