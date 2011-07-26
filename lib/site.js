/*!
 * murmur: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var fs = require('fs');

exports.buildMetadata = function(folder) {
  return buildMetadata(folder);
}

exports.renderFolder = function(metadata, folder, destination) {
  renderFolder(metadata, folder, destination);
}

exports.evalFile = function(metadata, filename) {
  return evalFile(metadata, filename);
}

function evalFile(metadata, filename) {
  return imbue.renderFile(metadata, filename);  
}

// Sorts the contents of **folder** into alphabetical order before passing each of them into **fn**
function mapContents(folder, fn) {
  fs.readdirSync(folder).sort().map(fn);
}

// renders the contents of **folder** into **destination** using the supplied **metadata**
function renderFolder(folder, metadata, destination) {
  mapContents(folder, function(f) {
    path = utils.fileJoin(folder, f);
    stats = fs.statSync(path);

    if(stats.isFile()) {
      renderFile(metadata, path, destination);
    } else if(stats.isDirectory()) {
      renderDirectory(metadata, path, utils.fileJoin(destination, f));
    } else {
      // raise an error
    }
  });
}

function renderFile(metadata, filename, destination) {
  contents = imbue.renderFile(metadata, filename);
  // todo: embed contents within any layouts

  var outputFilename = utils.fileJoin(destination, filename);
  fs.writeFile(outputFilename, contents, function (err) {
    if (err) throw err;
  });
}

function renderDirectory(metadata, path, destination) {
  // create folder if required?
  fs.mkdirSync(destination, 0777);
  renderFolder(metadata, path, destination);
}


// Traverse a folder and return all the metadata associated with it's contents
function buildMetadata(folder) {

  var s = {};
  var stats;
  var path;

  s._files = [];
  s._directories = [];

  mapContents(folder, function(f) {
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