/*!
 * full-meta-jacket: fn
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

var fs = require('fs');
var path = require('path');

var functions = {};

functions.printDate = function (d) {
  return d.toLocaleDateString().split(',').slice(1).join(',').trim();
};

// prefixes every element in **obj** with **prefix**
//
functions.prefixWith = function (obj, prefix) {

  var pre = function (i) {
    return prefix + i;
  };

  return Array.isArray(obj) ? obj.map(pre).join('\n') : prefix + String(obj) + '\n';
};

exports.getFunctions = function () {
  return functions;
};

exports.setup = function (folder) {

  // add site specific functions
  var siteFnFile = path.join(process.cwd(), folder, '_fn.js');

  var specific;
  if (fs.existsSync(siteFnFile)) {
    specific = require(siteFnFile);

    for (var k in specific) {
      functions[k] = specific[k];
    }
  }
};
