/*!
 * full-meta-jacket: fmj
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

//var express = require('express');
var http = require('http');
var url = require('url') ;
var imbue = require('imbue');

var metadata = require('./metadata');
var page = require('./page');
var filters = require('./filters');
var utils = require('./utils');
var site = require('./site');

exports.version = '0.1.2';

exports.staticSite = function(path, destination) {
  site.build(path, destination);
}

function errorMessage(e, path) {
  return "Error trying to render " + path;
}

function isCSS(path) {
  return path.slice(-3) === 'css';
}

// a 'development' mode that serves the site, rebuilding 
// the metadata on each request for generated content
exports.liveSite = function(folder, port, options) {

  // filters may need to load in snippets from the input folder
  //
  filters.setup(folder);

  // add common filters to imbue
  imbue.addFilters(filters.publicFilters);

  var meta;
  // don't bother rebuilding the metadata for certain url requests
  var shouldRebuildMeta = function(url) {
    var ext = utils.pathExtension(url);
    var nobuild = ['css', 'js', 'png', 'jpg', 'jpeg', 'ico'];
    return nobuild.every(function(b) { return b != ext});
  }

  http.createServer(function (req, res) {

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
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end(errorMessage(e, path));
      } else {
        res.writeHead(200, isCSS(path) ? {'Content-Type': 'text/css' } : {});
        res.end(content);
      }
    });

  }).listen(port, "127.0.0.1");
  console.log('Development server running at http://127.0.0.1:' + port + '/');
}
