
/**
 * Module dependencies.
 */

var express = require('express');
var imbue = require('imbue');

var metadata = require('./lib/metadata');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'imbue');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// add common filters to imbue
imbue.addFilters(filters);
var folder = '../indy.io'
var meta = metadata.fullBuild(folder);


// Routes



app.get('*', function(req, res){
  var path = req.params[0];

//  res.send(JSON.stringify(path, null, 4));

  // convert / -> /index.html and foo/bar/ -> foo/bar/index.html
  res.send(site.renderString(meta, processedPath));

});


/*
app.get('/', function(req, res){
  res.render('index', {
    title: 'murmur',
    nested: {name: 'a simple nested name'}
  });
});

app.get('/blog', function(req, res){
  res.render('index', {
    layout: false,
    title: 'blog',
    nested: {name: 'nested name from blog'}
  });
});
*/

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
