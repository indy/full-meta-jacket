/*!
 * murmur: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var metadata = require('./metadata');
var layout = require('./layout');
var fs = require('fs');

exports.build = function(folder, destination) {
  var meta = metadata.build(folder);
  meta['layouts'] = layout.build(utils.fileJoin(folder, layout.folder));
  renderFolder(folder, meta, destination);
}

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

    pathfilename = utils.fileJoin(folder, f);
    stats = fs.statSync(pathfilename);

    if(stats.isFile()) {
      if(f === '_zonal') {
      } else {
        renderFile(metadata, pathfilename, f, destination);
      }
    } else if(stats.isDirectory()) {
      if(f === layout.folder) {
      } else {
        renderDirectory(metadata, pathfilename, utils.fileJoin(destination, f));
      }
    } else {
      // raise an error
    }
  });
}

function renderFile(metadata, pathfilename, f, destination) {

  var str = fs.readFileSync(pathfilename, 'utf8');


  content = imbue.renderString(metadata, str);


  var header = imbue.getHeader(str);
  if(header.layout && metadata['layouts'][header.layout]) {
    console.log('using layout: ' + header.layout);
    metadata.content = content;
    var layout = metadata['layouts'][header.layout];
    console.log(layout);
    var newContent = imbue.renderString(metadata, layout);
    metadata.content = undefined;
    content = newContent;
  }


  var outputFilename = utils.fileJoin(destination, f);
  fs.writeFile(outputFilename, content, function (err) {
    if (err) throw err;
  });
}

function renderDirectory(metadata, path, destination) {
  // create folder if required?
  fs.mkdirSync(destination, 0777);
  renderFolder(metadata, path, destination);
}



