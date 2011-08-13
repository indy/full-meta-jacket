/*!
 * murmur: metadata
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var layout = require('./layout');
var fs = require('fs');

// a list of folders that don't need to be traversed
var blacklist = [layout.folder, '.git'];


exports.implicitFileMetadata = function(pathfilename) {
  return implicitFileMetadata(pathfilename);
}

function implicitFileMetadata(pathfilename) {
  var obj = {};
  var ext = pathfilename.split('.').slice(-1)[0];

  obj.pathfilename = pathfilename;

  if(ext === 'imd') {
    obj._useMarkdown = true;
    obj._outFileExt = 'html'
  } else {
    obj._useMarkdown = false;
    obj._outFileExt = ext;
  }

  return obj;
}

// Traverse a folder and return all the metadata associated with it's contents
exports.build = function(folder) {
  var meta = buildMetadata(folder);

// post process the metadata, building an array of published projects for the front page

  var published = [];
  for(var o in meta) {
    if(meta[o]['published']) {
      published.push(meta[o]);
    }
  }
  // todo: sort according to publish date

  meta._published = published;

  return meta;
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
      s = addFileMetadata(s, folder, f);
    } else if(stats.isDirectory()) {
      s = addDirectoryMetadata(s, folder, f);
    } else {
      // raise an error
    }
  });

  return s;
}

// Add metadata about the given file to the structure **s**
function addFileMetadata(s, folder, f) {
  if(f === '_vars') {
    // use _vars file as the directory's metadata
    s = imbue.mergeMeta(s, readFileHeader(folder, f).page);
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
  var str = fs.readFileSync(path, 'utf8');
  var hb = imbue.parse(str);
  return hb.header;
}

// Return all explicit and implicit metadata associated with the file
function readFileMetadata(folder, f) {
  var header = readFileHeader(folder, f);
  var basics = {filename: f};
  return imbue.mergeMeta(header, basics);
}

