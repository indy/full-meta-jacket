/*!
 * full-meta-jacket
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var fs = require('fs');

// The file separator 
var separator = '/';

exports.writeMeta = function(filename, meta) {
  fs.writeFileSync(filename, JSON.stringify(meta, null, 4));
  console.log("saved metadata in " + filename);
}


// **pathExtension**: returns the file extension of *pathfilename*
exports.pathExtension = function(pathfilename) {
  var segs = pathfilename.split('.');
  return segs.length > 1 ? segs.slice(-1)[0].toLowerCase() : '';
}

// **changeExtension**: change the extension of 
// *pathfilename* to *newExt*
exports.changeExtension = function(pathfilename, newExt) {
  var segs = pathfilename.split('.');
  if(segs.length > 1) {
    segs = segs.slice(0, -1)
  }
  segs.push(newExt);
  return segs.join('.');
}


// Append **filename** to **folder**
exports.fileJoin = function(folder, filename) {
  return _fileJoin(folder, filename);
}

// Sorts the contents of **folder** into alphabetical order before passing each of them into **fn**
exports.mapContents = function(folder, fn) {
  fs.readdirSync(folder).sort().map(fn);
}

// Sorts all files in **folder**  before passing their filenames into **fn**
exports.eachFile = function(folder, fn) {
  fs.readdirSync(folder).sort().map(function(f) {
    path = _fileJoin(folder, f);
    stats = fs.statSync(path);
    if(stats.isFile()) {
      fn(f);
    }
  });
}

exports.objectSize = function(o) {
  var c = 0;
  for(var i in o) {
    if(o.hasOwnProperty(i)) {
      c += 1;
    }
  }
  return c;
}

exports.ensureDirectoryExists = function(directory) {
  try {
    fs.mkdirSync(directory, 0777);
  } catch(err) {
    // already exists
  }
}

function _fileJoin(folder, filename) {
  return [folder, filename].join(separator);
}
