//  OpenShift sample Node application
var app = require('./app');
var mongoose = require('mongoose');


Object.assign=require('object-assign')

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  let options = {
    server: {
      socketOptions: { keepAlive: 1 }
    }
  };

  mongoose.connect(mongoURL, options).then(
    () => {
      console.log('Connected to MongoDB at: %s', mongoURL);
      db = conn;
      dbDetails.databaseName = db.databaseName;
      dbDetails.url = mongoURLLabel;
      dbDetails.type = 'MongoDB';
    },
    err => {
      console.log(err);
      callback(err);
      return;
    }
  );
};

if (!db) {
  initDb(function(err){
    console.log('Error connecting to Mongo. Message:\n'+err);
  });
}
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);


// EXPORTED APP FOR TESTING. 
module.exports = app;
