/*!
 * full-meta-jacket: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var filters = require('./filters');
var metadata = require('./metadata');
var layout = require('./layout');
var fs = require('fs');
var page = require('./page');

exports.build = function(folder, destination) {

  imbue.addFilters(filters);

  var meta = metadata.fullBuild(folder);
  meta._destination = destination;

  utils.writeMeta("/Users/indy/mem/indy.io.json", meta);

  // traverse the metadata rather than the fs
  // saving results into destination
  fullMetaRender(meta, meta, '');
}


// render the contents of 
function fullMetaRender(meta, localMeta, uriPath) {

  if(localMeta._isDirectory === true) {

    utils.ensureDirectoryExists(meta._destination + uriPath);

    for(var o in localMeta) {
      if(isPublicProperty(o)) {
        fullMetaRender(meta, localMeta[o], uriPath + '/' + o);
      }
    }

  } else {
    renderPage(meta, uriPath);
  }

}

function renderPage(meta, uriPath) {
  var scopedMeta = metadata.scopedBuild(meta, uriPath);
  scopedMeta._fullMeta = meta;

  // get the pathFilename of the resource from localMeta
  var fullPath = meta._base + scopedMeta._filename;
  var fullDest = meta._destination + uriPath;

  // render the page
  page.renderFile(scopedMeta, fullPath, fullDest);
}

function isPublicProperty(name) {
  return name[0] !== '_';
}
