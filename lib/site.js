/*!
 * full-meta-jacket: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var filters = require('./filters');
var metadata = require('./metadata');
var fs = require('fs');
var page = require('./page');


// **site.build** acts like a traditional static site generator, 
// processing input from *folder* and writing the output 
// to *destination*
exports.build = function(folder, destination) {

  // filters may need to load in snippets from the input folder
  //
  filters.setup(folder);

  // add common filters to imbue
  imbue.addFilters(filters.publicFilters);

  // build up a comprehensive metadata structure describing 
  // every file in *folder*
  var meta = metadata.fullBuild(folder);
  meta._destination = destination;

//  utils.writeMeta('../indy.io.meta.js', meta);

  // render all the files in folder to destination
  fullMetaRender(meta, meta, '');
}


// **fullMetaRender** recursively renders all the files 
// described by the metadata
function fullMetaRender(meta, localMeta, uriPath) {

  if(localMeta._isDirectory === true) {

    utils.ensureDirectoryExists(meta._destination + uriPath);

    for(var o in localMeta) {
      if(isPublicProperty(o)) {
        fullMetaRender(meta, localMeta[o], uriPath + '/' + o);
      }
    }

  } else {
    renderToFile(meta, uriPath);
  }

}

// **renderToFile** renders the resource at uriPath to the 
// appropriate destination in the filesystem
function renderToFile(meta, uriPath) {

  var fullDest = meta._destination + uriPath;

  page.render(meta, uriPath, function(e, content) {
    if(e) {
      console.error('error rendering ' + uriPath);
    } else {
      fs.writeFile(fullDest, content, function (err) {
        if (err) throw err;
      });
    }
  });
}

// **isPublicProperty**: any metadata items whose label 
// begins with an underscore are private, everything 
// else can be passed on to the page being rendered
function isPublicProperty(name) {
  return name[0] !== '_';
}
