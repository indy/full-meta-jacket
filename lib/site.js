/*!
 * murmur: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var fs = require('fs');

exports.traverse = function(folder, options) {

  var res = traverse(folder);
  console.log(res);

  return 42;
}

function traverse(folder) {
  var contents = fs.readdirSync(folder).sort();

  var s = {};
  var stats;
  var path;

  s._files = [];
  s._directories = [];

  contents.map(function(f) {
    path = utils.fileJoin(folder, f);
    stats = fs.statSync(path);

    if(stats.isFile()) {
      processFile(s, folder, f);
    } else if(stats.isDirectory()) {
      processDirectory(s, folder, f);
    } else {
      // raise an error
    }

  });

  return s;
}

function processFile(s, folder, f) {
  if(f === '_zonal') {
    // use _zonal file as the directory's metadata
    utils.deepMerge(s, readFileHeader(folder, f));
  } else {
    s[f] = readFileMetadata(folder, f);
    s._files.push(f);
  }
  return s;
}

function processDirectory(s, folder, f) {
  var path = utils.fileJoin(folder, f);

  if(f === '_posts') {
    // todo: replace this with a more 'jekyll' like system
    s[f] = readDirectory(path);
    s._directories.push(f);    
  } else {
    s[f] = readDirectory(path);
    s._directories.push(f);
  }
  return s;
}

function readFileHeader(folder, f) {
  var path = utils.fileJoin(folder, f);
  var header = imbue.getHeaderFromFile(path);
  return header;
}

function readFileMetadata(folder, f) {
  var header = readFileHeader(folder, f);
  var basics = {filename: f};
  return utils.deepMerge(header, basics);
}

function readDirectory(path) {
  return traverse(path);
}