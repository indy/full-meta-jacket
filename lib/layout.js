/*!
 * murmur: layout
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var fs = require('fs');

/*
  go through the layout folder, read all the files enclosing them in further layouts if needed

  these will then be stored within the metadata structure
 */

exports.build = function(folder) {
  var layouts = []
  utils.eachFile(folder, function(f) {
    
  });
}

