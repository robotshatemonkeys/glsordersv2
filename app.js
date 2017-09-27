var express = require('express'),
    morgan  = require('morgan'),
    app = express();

/*var routes = require('./routes/index'),
    install = require('./routes/install'),
    tracking = require('./routes/tracking'),
    print = require('./routes/print'),
    printui = require('./routes/printui');*/

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

app.use(morgan('combined'));
app.engine('html', require('ejs').renderFile);


app.get('/', function (req, res) {
  console.log("inside");
  res.render('index.html', { pageCountMessage : null});
  /*if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }*/
});

app.get('/pagecount', function (req, res) {
  res.status(200);
  /*
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
  */
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});



console.log('Server running on http://%s:%s', ip, port);

/*
app.use('/', routes);
app.use('/install', install);
app.use('/tracking', tracking),
app.use('/print', print),
app.use('/printui', printui)*/

module.exports = app;
