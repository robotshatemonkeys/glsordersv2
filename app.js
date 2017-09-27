var express = require('express'),
    morgan  = require('morgan'),
    path    = require('path'),
    app = express();

var routes = require('./routes/index'),
    install = require('./routes/install');/*
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
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, './public')));


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




app.use('/', routes);
app.use('/install', install);
/*
app.use('/tracking', tracking);
app.use('/print', print);
app.use('/printui', printui);*/

module.exports = app;
