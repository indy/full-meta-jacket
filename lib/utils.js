/*!
 * murmur
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var fs = require('fs');

// The file separator 
var separator = '/';

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
    path = utils.fileJoin(folder, f);
    stats = fs.statSync(path);
    if(stats.isFile()) {
      fn(f);
    }
  });
}


// Public interface to _deepMerge
exports.deepMerge = function(a, b) {
  return _deepMerge(a, b);
}

function _fileJoin(folder, filename) {
  return [folder, filename].join(separator);
}

// Recursively merges **b** into **a**, returning the mutated **a** object.
function _deepMerge(a, b) {
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
