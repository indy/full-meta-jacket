/*!
 * murmur: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var fs = require('fs');

exports.buildMetadata = function(folder, options) {
  var res = buildMetadata(folder);
//  console.log(res);
  return res;
}

// Traverse a folder and return all the metadata associated with it's contents
function buildMetadata(folder) {
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

// Add metadata about the given file to the structure **s**
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

// Add metadata about the given directory to the structure **s**
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

// Return the header information specified in the file
function readFileHeader(folder, f) {
  var path = utils.fileJoin(folder, f);
  var header = imbue.getHeaderFromFile(path);
  return header;
}

// Return all explicit and implicit metadata associated with the file
function readFileMetadata(folder, f) {
  var header = readFileHeader(folder, f);
  var basics = {filename: f};
  return utils.deepMerge(header, basics);
}

// Return all the metadata associated with the given directory and it's contents
function readDirectory(path) {
  return buildMetadata(path);
}