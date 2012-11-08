/*!
 * full-meta-jacket: template
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('./imbue');
var utils = require('./utils');
var fs = require('fs');
var path = require('path');

exports.folder = '_templates';

/*
  read all files in the layour folder into a hash
  this will be added to metadata structure
 */

exports.build = function(folder) {
  var templates = {}
  var contents, name;

  try {
    utils.eachFile(folder, function(f) {
      contents = fs.readFileSync(path.join(folder, f), 'utf8');
      name = f.split('.')[0];
      templates[name] = imbue.parse(contents);
    });
  } catch(e) {
    // todo: this try/catch statement is a substitute for a 'doesFolderExist' function that needs to be written
//    console.log(e);
  }

  return templates;
}
