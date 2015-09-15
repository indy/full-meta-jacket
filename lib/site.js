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

// **renderToFile** renders the resource at uriPath to the
// appropriate destination in the filesystem
function renderToFile(meta, uriPath, writtenCallback) {
  return new Promise((resolve, reject) => {
    var fullDest = path.join(meta._destination, uriPath);
    page.render(meta, uriPath).then(content => {
      fs.writeFile(fullDest, content, (err) => {
        if(err) {
          reject(Error(err));
          return;
        }
        if (typeof(writtenCallback) === "function") {
          // call the optional writtenCallback
          // (very useful when testing)
          writtenCallback(uriPath);
        }
        resolve(uriPath);
      });
    }).catch(e => {
      console.error('error rendering ' + uriPath);
      reject(Error(e));
    });
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
  return new Promise((resolve, reject) => {
    if (localMeta._isDirectory === true) {
      var promises = [];
      var destPath = path.join(meta._destination, uriPath);
      utils.ensureDirectoryExists(destPath).then(()=> {
        for (var o in localMeta) {
          if (isPublicProperty(o)) {
            promises.push(fullMetaRender(meta,
                                         localMeta[o],
                                         uriPath + '/' + o,
                                         writtenCallback));
          }
        }
        Promise.all(promises).then(resolve).catch(reject);
      });
    } else {
      renderToFile(meta, uriPath, writtenCallback).then(resolve).catch(reject);
    }
  });
}

function prepareTemplates(folder, destination) {
  return new Promise((resolve, reject) => {
    var templateFolder = path.join(folder, template.folder);
    var tempFolder = path.join(destination, "__temp");

    // todo: write a proper ensureDirectoryExists
    var directories = [utils.ensureDirectoryExists(destination),
                       utils.ensureDirectoryExists(tempFolder)];

    Promise.all(directories).then(() => {

      utils.mapFolderContents(templateFolder).then(filenames => {

        return Promise.all(filenames.map(f => {
          return imbue.copyBodyToFile(path.join(templateFolder, f),
                                      path.join(tempFolder, f) + '.jade');
        }));

      }).then(resolve).catch(reject);
    });
  });
}

// **site.build** acts like a traditional static site generator,
// processing input from *folder* and writing the output
// to *destination*
exports.build = function (folder, destination, writtenCallback) {
  prepareTemplates(folder, destination).then(res => {
    return fn.setup(folder);
  }).then(functions => {
    return metadata.fullBuild(folder);
  }).then(meta => {
    meta._destination = destination;
    //  utils.writeMeta('../indy.io.meta.js', meta);
    return fullMetaRender(meta, meta, '', writtenCallback);
  }).then(res => {
    console.log('all done');
  }).catch(error => {
    console.log("failed: ", error);
  });
};
