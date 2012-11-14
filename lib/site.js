/*!
 * full-meta-jacket: site
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('./imbue');
var fn = require('./fn');
var utils = require('./utils');
var template = require('./template');
var metadata = require('./metadata');
var fs = require('fs');
var path = require('path');
var page = require('./page');

// todo: prepareTemplates should use temp
//var temp = require('temp');

// copy the bodies of all the templates into a temp folder
function prepareTemplates(folder, destination) {
  var templateFolder = path.join(folder, template.folder);

  var tempFolder = path.join(destination, "__temp");

  var templateFilename;
  var tempFilename;

  // todo: write a proper ensureDirectoryExists

  utils.ensureDirectoryExists(destination);
  utils.ensureDirectoryExists(tempFolder);

  utils.mapContents(templateFolder, function (f) {
    templateFilename = path.join(templateFolder, f);
    tempFilename = path.join(tempFolder, f) + '.jade';
    imbue.copyBodyToFile(templateFilename, tempFilename);
  });
}

// **renderToFile** renders the resource at uriPath to the
// appropriate destination in the filesystem
function renderToFile(meta, uriPath, writtenCallback) {

  var fullDest = path.join(meta._destination, uriPath);

  page.render(meta, uriPath, function (e, content) {
    if (e) {
      console.error('error rendering ' + uriPath);
    } else {
      fs.writeFile(fullDest, content, function (err) {
        if (err) {
          throw err;
        }
        if (typeof(writtenCallback) === "function") {
          // call the optional writtenCallback
          // (very useful when testing)
          writtenCallback(uriPath);
        }
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

// **fullMetaRender** recursively renders all the files
// described by the metadata
function fullMetaRender(meta, localMeta, uriPath, writtenCallback) {

  if (localMeta._isDirectory === true) {

    utils.ensureDirectoryExists(path.join(meta._destination, uriPath));

    for (var o in localMeta) {
      if (isPublicProperty(o)) {
        fullMetaRender(meta,
                       localMeta[o],
                       uriPath + '/' + o,
                       writtenCallback);
      }
    }

  } else {
    renderToFile(meta, uriPath, writtenCallback);
  }

}

// **site.build** acts like a traditional static site generator,
// processing input from *folder* and writing the output
// to *destination*
exports.build = function (folder, destination, writtenCallback) {

  prepareTemplates(folder, destination);
  fn.setup(folder);

  // build up a comprehensive metadata structure describing
  // every file in *folder*
  var meta = metadata.fullBuild(folder);
  meta._destination = destination;
//  utils.writeMeta('../indy.io.meta.js', meta);

  // render all the files in folder to destination
  fullMetaRender(meta, meta, '', writtenCallback);
};

