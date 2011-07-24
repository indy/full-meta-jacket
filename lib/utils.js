/*!
 * murmur
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

// The file separator 
var separator = '/';

// Append **filename** to **folder**
exports.fileJoin = function(folder, filename) {
  return [folder, filename].join(separator);
}

// Public interface to _deepMerge
exports.deepMerge = function(a, b) {
  return _deepMerge(a, b);
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
