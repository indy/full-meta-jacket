/*!
 * full-meta-jacket: fmj
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

"use strict";

const program = require('commander');
const http = require('http');
const url = require('url');
const connect = require('connect');
const favicon = require('serve-favicon');
const errorhandler = require('errorhandler');

const metadata = require('./metadata');
const page = require('./page');
const fn = require('./fn');
const utils = require('./utils');
const site = require('./site');

const version = '0.8.0';

program
  .version(version)
  .option('-o, --output <string>', 'destination for static files')
  .option('-p, --port <n>', 'port', parseInt)
  .option('-m, --meta <string>', 'location to save meta file (for debugging)')
  .parse(process.argv);

function main() {

  const path = program.args.shift() || '.';

  if(program.output) {
    staticSite(path, program.output);
  } else {

    const port = program.port ? program.port : 3000;

    const options = {};
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

  const destination = ".";
  site.prepareTemplates(folder, destination).then(res => {
    return fn.setup(folder);
  }).then(functions => {
    console.log("finished preparation");
  }).catch(error => {
    console.log("failed: ", error);
  });


  let meta;
  // don't bother rebuilding the metadata for certain url requests
  const shouldRebuildMeta = function (url) {
    const ext = utils.pathExtension(url);
    const nobuild = ['css', 'js', 'png', 'jpg', 'jpeg', 'ico'];
    return nobuild.every(function (b) { return b !== ext; });
  };

  const mainHandler = function (req, res) {

    const path = url.parse(req.url, true).pathname;
    if (path.slice(-1) === '/') {
      path += 'index.html';
    }

    const rend = function(m, path) {
      page.render(m, path).then(content => {
        // res.writeHead(200, {'Content-Type': connect['static'].mime.lookup(path)});
        res.writeHead(200);
        res.end(content);
      }).catch(e => {
        throw e;
      });
    };

    if (shouldRebuildMeta(path) === true) {
      metadata.fullBuild(folder).then(m => {
        meta = m;
        meta._destination = destination;

        if (options.metaLocation) {
          //console.log(meta);
          utils.writeMeta(options.metaLocation, meta);
        }
        rend(meta, path);
      });
    } else {
      rend(meta, path);
    }
  };

  const app = connect()
//    .use(connect.favicon())
    .use(mainHandler)
    .use(errorhandler());

  http.createServer(app).listen(port, "127.0.0.1");
  console.log('Development server running at http://127.0.0.1:' + port + '/');
};

exports.version = version;
exports.main = main;
