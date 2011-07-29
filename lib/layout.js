/*!
 * murmur: layout
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var utils = require('./utils');
var fs = require('fs');

/*
  read all files in the layour folder into a hash
  this will be added to metadata structure
 */

exports.build = function(folder) {
  var layouts = {}
  var contents, name;
  utils.eachFile(folder, function(f) {
    contents = fs.readFileSync(utils.fileJoin(folder, f), 'utf8');
    name = f.split('.')[0];

    layouts[name] = contents;
  });

  return layouts;
}

exports.folder = 'layouts';