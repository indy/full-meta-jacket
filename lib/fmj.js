/*!
 * full-meta-jacket: fmj
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

//var express = require('express');
var http = require('http');
var url = require('url') ;
var imbue = require('imbue');
var connect = require('connect');

var metadata = require('./metadata');
var page = require('./page');
var filters = require('./filters');
var utils = require('./utils');
var site = require('./site');

exports.version = '0.1.8';

exports.staticSite = function(path, destination) {
  site.build(path, destination);
}

// a 'development' mode that serves the site, rebuilding 
// the metadata on each request for generated content
exports.liveSite = function(folder, port, options) {

  // setup imbue with fmj specific filters, 
  // site specific partials and site specfic filters
  //
  filters.setup(folder);

  var meta;
  // don't bother rebuilding the metadata for certain url requests
  var shouldRebuildMeta = function(url) {
    var ext = utils.pathExtension(url);
    var nobuild = ['css', 'js', 'png', 'jpg', 'jpeg', 'ico'];
    return nobuild.every(function(b) { return b != ext});
  }

  var mainHandler = function(req, res){

    var path = url.parse(req.url,true).pathname;
    if(path.slice(-1) === '/') {
      path += 'index.html';
    }

    if(shouldRebuildMeta(path) == true) {
      meta = metadata.fullBuild(folder);

      if(options.metaLocation) {
        utils.writeMeta(options.metaLocation, meta);
      }
    }

    page.render(meta, path, function(e, content) {
      if(e) {
        throw e;
      } 
      res.writeHead(200, {'Content-Type': connect.static.mime.lookup(path)});
      res.end(content);
    });
  };

  var app = connect()
    .use(connect.favicon())
    .use(mainHandler)
    .use(connect.errorHandler());

  http.createServer(app).listen(port, "127.0.0.1");
  console.log('Development server running at http://127.0.0.1:' + port + '/');
}
