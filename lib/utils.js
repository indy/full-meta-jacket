/*!
 * full-meta-jacket
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

var fs = require('fs');
var path = require('path');

// Recursively merges **b** into **a**, returning the mutated **a** object.
function _deepMerge(a, b) {
  if(a instanceof Array && b instanceof Array) {
    return a;
  }
  if(typeof a === 'object' && typeof b === 'object') {
    for(var bProp in b) {
      if(a.hasOwnProperty(bProp)) {
        a[bProp] = _deepMerge(a[bProp], b[bProp]);
      }
      else {
        a[bProp] = b[bProp];
      }
    }
  }
  return a;
}

// Public interface to _deepMerge
exports.deepMerge = function(a, b) {
  // start by merging a into an empty object, then do a further merge with b
  return _deepMerge(_deepMerge({},a), b);
};

exports.writeMeta = function(filename, meta) {
  fs.writeFileSync(filename, JSON.stringify(meta, null, 4));
  console.log("saved metadata in " + filename);
};

// **pathExtension**: returns the file extension of *pathfilename*
exports.pathExtension = function(pathfilename) {
  var segs = pathfilename.split('.');
  return segs.length > 1 ? segs.slice(-1)[0].toLowerCase() : '';
};

// **changeExtension**: change the extension of
// *pathfilename* to *newExt*
exports.changeExtension = function(pathfilename, newExt) {
  var segs = pathfilename.split('.');
  if(segs.length > 1) {
    segs = segs.slice(0, -1);
  }
  segs.push(newExt);
  return segs.join('.');
};

// Sorts the contents of **folder** into alphabetical order before passing each of them into **fn**
exports.mapContents = function(folder, fn) {
  fs.readdirSync(folder).sort().map(fn);
};

// Sorts all files in **folder**  before passing their filenames into **fn**
exports.eachFile = function(folder, fn) {
  fs.readdirSync(folder).sort().map(function(f) {
    var stats = fs.statSync(path.join(folder, f));
    if(stats.isFile()) {
      fn(f);
    }
  });
};

exports.objectSize = function(o) {
  var c = 0;
  for(var i in o) {
    if(o.hasOwnProperty(i)) {
      c += 1;
    }
  }
  return c;
};

exports.ensureDirectoryExists = function(directory) {
  try {
    fs.mkdirSync(directory);    // mkdirSync defaults to 0777 for the 2nd param
  } catch(err) {
    // already exists
  }
};

