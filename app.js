const fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env;


const express = require('express'),
      credentials = require('./utils/credentials.js'),
      logger = require('morgan'),
      BigNumber = require('bignumber.js'),
      JSONbig = require('json-bigint'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      shopifyAPI = require('shopify-node-api');

const routes = require('./routes/index'),
      install = require('./routes/install'),
      tracking = require('./routes/tracking'),
      print = require('./routes/print'),
      printui = require('./routes/printui');




var app = express();

var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));


// OPENSHIFT PAGES 
app.get('/health',function(req,res, next){
  res.writeHead(200); 
  res.end();
});

app.get('/info/gen',function(req,res, next){
  res.writeHead(200); bres.end();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.end(JSON.stringify(sysInfo[url.slice(6)]()));
});

app.get('/info/poll',function(req,res, next){
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.end(JSON.stringify(sysInfo[url.slice(6)]()));
});
// END OPENSHIFT PAGES 



app.use('/', routes);
app.use('/install', install);
app.use('/tracking', tracking),
app.use('/print', print),
app.use('/printui', printui),

module.exports = app;
