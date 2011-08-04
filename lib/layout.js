/*!
 * murmur: layout
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var fs = require('fs');



exports.folder = 'layouts';

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
    layouts[name] = imbue.getHeaderAndBody(contents);
  });

  return layouts;
}


exports.mergeMetadata = function(metadata, header) {

  var m = utils.deepMerge({}, header);
  var mm = utils.deepMerge(m, metadata);


  var layouts = metadata['layouts'];

  var fn = function(meta) {
    var l = meta.page.layout;

    if(l && layouts[l]) {
      return utils.deepMerge(meta, fn(layouts[l].header));
    } else {
      return meta;
    }
  }

  return fn(mm);
}
