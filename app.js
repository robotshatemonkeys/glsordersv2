var express = require('express'),
    morgan  = require('morgan'),
    path    = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express();

var index = require('./routes/index'),
    install = require('./routes/install'),
    tracking = require('./routes/tracking'),
    print = require('./routes/print'),
    printui = require('./routes/printui');

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});


app.use('/',index);
app.use('/install',install);
app.use('/tracking', tracking);
app.use('/print', print);
app.use('/printui', printui);

module.exports = app;
