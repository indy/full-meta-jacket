/*!
 * full-meta-jacket: site
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

'use strict';

const imbue = require('./imbue');
const fn = require('./fn');
const utils = require('./utils');
const template = require('./template');
const metadata = require('./metadata');
const fs = require('fs');
const path = require('path');
const checksum = require('checksum');
const page = require('./page');

// todo: prepareTemplates should use temp
//let temp = require('temp');



// does the file at destination already contain content?
function destinationHasContent(destination, content) {
  return new Promise((resolve, reject) => {

    try {
      fs.statSync(destination);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // file doesn't exist so return false as destination
        // doesn't have the content
        resolve(false);
      } else {
        reject(Error(err));
      }
    }

    checksum.file(destination, (err, sum) => {
      if (err) {
        reject(Error(err));
        return;
      }
      const contentChecksum = checksum(content);
      if (sum === contentChecksum) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// **renderToFile** renders the resource at uriPath to the
// appropriate destination in the filesystem
function renderToFile(meta, uriPath, writtenCallback) {
  return new Promise((resolve, reject) => {
    const fullDest = path.join(meta._destination, uriPath);
    page.render(meta, uriPath).then(content => {
      destinationHasContent(fullDest, content).then(hasContent => {
        if (hasContent) {
          // the destination already has the required content
          resolve(uriPath);
        } else {
          fs.writeFile(fullDest, content, err => {
            if (err) {
              reject(Error(err));
              return;
            }
            if (typeof(writtenCallback) === 'function') {
              // call the optional writtenCallback
              // (very useful when testing)
              writtenCallback(uriPath);
            }
            console.log('site::renderToFile', uriPath);
            resolve(uriPath);
          });
        }
      });
    }).catch(e => {
      console.error(`error rendering ${uriPath}`);
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
      const promises = [];
      const destPath = path.join(meta._destination, uriPath);
      utils.ensureDirectoryExists(destPath).then(() => {
        for (const o in localMeta) {
          if (isPublicProperty(o)) {
            promises.push(fullMetaRender(meta,
                                         localMeta[o],
                                         `${uriPath}/${o}`,
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
    const templateFolder = path.join(folder, template.folder);
    const tempFolder = path.join(destination, '__temp');

    // todo: write a proper ensureDirectoryExists
    const directories = [utils.ensureDirectoryExists(destination),
                         utils.ensureDirectoryExists(tempFolder)];

    Promise.all(directories)
      .then(() => utils.mapFolderContents(templateFolder))
      .then(filenames => filenames.map(filename => {
        const srcFile = path.join(templateFolder, filename);
        const destFile = `${path.join(tempFolder, filename)}.jade`;
        return imbue.copyBodyToFile(srcFile, destFile);
      }))
      .then(promises => Promise.all(promises))
      .then(resolve)
      .catch(reject);
  });
}

exports.prepareTemplates = prepareTemplates;

exports.renderToFile = renderToFile;

// **site.build** acts like a traditional static site generator,
// processing input from *folder* and writing the output
// to *destination*
exports.build = function(folder, destination, writtenCallback) {
  prepareTemplates(folder, destination)
    .then(() => fn.setup(folder))
    .then(() => metadata.fullBuild(folder))
    .then(meta => {
      meta._destination = destination;
      return fullMetaRender(meta, meta, '', writtenCallback);
    }).catch(error => {
      console.log('failed: ', error);
    });
};
