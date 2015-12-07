/*!
 * full-meta-jacket
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

"use strict";

const fs = require('fs');
const path = require('path');

exports.writeMeta = (filename, meta) => {
  fs.writeFile(filename, JSON.stringify(meta, null, 4), err => {
    if(err) {
      console.log(err, "error writing metadata to " + filename);
    } else {
      console.log("saved metadata in " + filename);
    }
  });
};

// **pathExtension**: returns the file extension of *pathfilename*
exports.pathExtension = pathfilename => {
  const segs = pathfilename.split('.');
  return segs.length > 1 ? segs.slice(-1)[0].toLowerCase() : '';
};

// **changeExtension**: change the extension of
// *pathfilename* to *newExt*
exports.changeExtension = (pathfilename, newExt) => {
  let segs = pathfilename.split('.');
  if (segs.length > 1) {
    segs = segs.slice(0, -1);
  }
  segs.push(newExt);
  return segs.join('.');
};

// Sorts the contents of **folder** into alphabetical order before returning them in a promise
exports.mapFolderContents = folder => {
  return new Promise((resolve, reject) => {
    fs.readdir(folder, (err, files) => {
      if(err) {
        reject(Error("fooked"));
      }
      resolve(files.sort());
    });
  });
};

exports.objectSize = o => {
  let c = 0;
  for (let i in o) {
    if (o.hasOwnProperty(i)) {
      c += 1;
    }
  }
  return c;
};

exports.ensureDirectoryExists = directory => {
  return new Promise((resolve, reject) => {
    try {
      fs.mkdir(directory, e => {
        (e && e.code != 'EEXIST') ? reject(Error(e)) : resolve();
      });
    } catch (err) {
      reject();
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
  });
};
