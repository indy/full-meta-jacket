/*!
 * murmur: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var fs = require('fs');

exports.renderFolder = function(metadata, folder, destination) {
  renderFolder(metadata, folder, destination);
}

exports.evalFile = function(metadata, filename) {
  return evalFile(metadata, filename);
}

function evalFile(metadata, filename) {
  return imbue.renderFile(metadata, filename);
}


// renders the contents of **folder** into **destination** using the supplied **metadata**
function renderFolder(folder, metadata, destination) {
  utils.mapContents(folder, function(f) {
    path = utils.fileJoin(folder, f);
    stats = fs.statSync(path);

    if(stats.isFile()) {
      renderFile(metadata, path, destination);
    } else if(stats.isDirectory()) {
      if(f === 'layout') {
        
      } else {
        renderDirectory(metadata, path, utils.fileJoin(destination, f));
      }
    } else {
      // raise an error
    }
  });
}

function renderFile(metadata, filename, destination) {
  contents = imbue.renderFile(metadata, filename);
  // todo: embed contents within any layouts

  var outputFilename = utils.fileJoin(destination, filename);
  fs.writeFile(outputFilename, contents, function (err) {
    if (err) throw err;
  });
}

function renderDirectory(metadata, path, destination) {
  // create folder if required?
  fs.mkdirSync(destination, 0777);
  renderFolder(metadata, path, destination);
}



