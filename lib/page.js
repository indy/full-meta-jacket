/*!
 * murmur: page
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var fs = require('fs');

/*
  given metadata and a path/filename renders the contents
  also applies the appropriate layouts until final file is 
  ready to be saved to disk
 */

exports.evalFile = function(meta, layouts, folder, file) {
  
}

function evalFile(metadata, filename) {
  return imbue.renderFile(metadata, filename);
}
