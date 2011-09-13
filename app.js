
/**
 * Module dependencies.
 */

var express = require('express');
var imbue = require('imbue');

var metadata = require('./lib/metadata');
var page = require('./lib/page');
var filters = require('./lib/filters');
var utils = require('./lib/utils');

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




var folder = '../indy.io';

// filters may need to load in snippets from the input folder
//
filters.setup(folder);

// add common filters to imbue
imbue.addFilters(filters.publicFilters);

var meta = metadata.fullBuild(folder);

//utils.writeMeta('../foobar.meta.js', meta);

// maybe add some routes here to get the js/css files

app.get('*', function(req, res){

  var path = req.params[0];
  if(path.slice(-1) === '/') {
    path += 'index.html';
  }

  var headers = path.slice(-3) === 'css' ? {'Content-Type': 'text/css' } : {};  
  var content = page.render(meta, path);

  res.send(content, headers);

});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
