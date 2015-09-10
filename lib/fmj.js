/*!
 * full-meta-jacket: fmj
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

// var express = require('express');
var program = require('commander');
var http = require('http');
var url = require('url');
var connect = require('connect');

var metadata = require('./metadata');
var page = require('./page');
var fn = require('./fn');
var utils = require('./utils');
var site = require('./site');

var version = '0.8.0';

program
  .version(version)
  .option('-o, --output <string>', 'destination for static files')
  .option('-p, --port <n>', 'port', parseInt)
  .option('-m, --meta <string>', 'location to save meta file (for debugging)')
  .parse(process.argv);

function main() {

  var path = program.args.shift() || '.';

  if(program.output) {
    staticSite(path, program.output);
  } else {

    var port = program.port ? program.port : 3000;

    var options = {};
    options.metaLocation = program.meta;

    liveSite(path, port, options);
  }
};


function staticSite(path, destination) {
  site.build(path, destination);
};

// a 'development' mode that serves the site, rebuilding
// the metadata on each request for generated content
function liveSite(folder, port, options) {

  var destination = ".";
  site.prepareTemplates(folder, destination);
  fn.setup(folder);

  var meta;
  // don't bother rebuilding the metadata for certain url requests
  var shouldRebuildMeta = function (url) {
    var ext = utils.pathExtension(url);
    var nobuild = ['css', 'js', 'png', 'jpg', 'jpeg', 'ico'];
    return nobuild.every(function (b) { return b !== ext; });
  };

  var mainHandler = function (req, res) {

    var path = url.parse(req.url, true).pathname;
    if (path.slice(-1) === '/') {
      path += 'index.html';
    }

    if (shouldRebuildMeta(path) === true) {
      meta = metadata.fullBuild(folder);
      meta._destination = destination;

      if (options.metaLocation) {
        utils.writeMeta(options.metaLocation, meta);
      }
    }

    page.render(meta, path, function (e, content) {
      if (e) {
        throw e;
      }
      res.writeHead(200, {'Content-Type': connect['static'].mime.lookup(path)});
      res.end(content);
    });
  };

  var app = connect()
    .use(connect.favicon())
    .use(mainHandler)
    .use(connect.errorHandler());

  http.createServer(app).listen(port, "127.0.0.1");
  console.log('Development server running at http://127.0.0.1:' + port + '/');
};

exports.version = version;
exports.main = main;
