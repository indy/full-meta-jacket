/*!
 * murmur
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */


var separator = '/';

exports.fileJoin = function(folder, filename) {
  return [folder, filename].join(separator);
}

exports.deepMerge = function(a, b) {
  return _deepMerge(a, b);
}

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
