/*!
 * murmur: metadata
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var fs = require('fs');

// a list of folders that don't need to be traversed
var blacklist = ['layouts', '.git'];

// Traverse a folder and return all the metadata associated with it's contents
exports.build = function(folder) {
  return buildMetadata(folder);
}

function buildMetadata(folder) {

  var s = {};
  var stats;
  var path;

  s._files = [];
  s._directories = [];

  utils.mapContents(folder, function(f) {
    path = utils.fileJoin(folder, f);
    stats = fs.statSync(path);

    if(stats.isFile()) {
      addFileMetadata(s, folder, f);
    } else if(stats.isDirectory()) {
      addDirectoryMetadata(s, folder, f);
    } else {
      // raise an error
    }
  });

  return s;
}

// Add metadata about the given file to the structure **s**
function addFileMetadata(s, folder, f) {
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
function addDirectoryMetadata(s, folder, f) {
  // don't traverse any of the folders in the blacklist
  if(blacklist.indexOf(f) > -1) {
    return s;
  }

  var path = utils.fileJoin(folder, f);

  if(f === '_posts') {
    // todo: replace this with a more 'jekyll' like system
    s[f] = buildMetadata(path);
    s._directories.push(f);    
  } else {
    s[f] = buildMetadata(path);
    s._directories.push(f);
  }
  return s;
}

// Return the header information specified in the file
function readFileHeader(folder, f) {
  var path = utils.fileJoin(folder, f);
  return imbue.getHeaderFromFile(path);
}

// Return all explicit and implicit metadata associated with the file
function readFileMetadata(folder, f) {
  var header = readFileHeader(folder, f);
  var basics = {filename: f};
  return utils.deepMerge(header, basics);
}

