/*!
 * full-meta-jacket: page
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

'use strict';

// page renders the requested metadata+path combo
// and returns the result as a string

const fs = require('fs');
const path = require('path');
const less = require('less');
const stylus = require('stylus');

const imbue = require('./imbue');
const metadata = require('./metadata');

function renderImbueContent(hb, scopedMeta) {
  const dest = scopedMeta._destination;
  const filename = scopedMeta.publishedFilename;

  scopedMeta._jade_filename = path.join(dest, '__temp', filename);

  return imbue.render(scopedMeta, hb.body);
}

function evalImbueContent(scopedMeta, content) {
  return new Promise((resolve, reject) => {
    try {
      const hb = imbue.parse(content);
      const res = hb.imbued ? renderImbueContent(hb, scopedMeta) : content;
      resolve(res.trim());
    } catch (e) {
      console.error(e.message);
      console.error('error evaluating imbue content');
      reject(e);
    }
  });
}

function evalLessContent(additional_path, content) {
  return new Promise((resolve, reject) => {
    const parser = new(less.Parser)({
      paths: ['.', additional_path] // search paths for @import directives
    });

    parser.parse(content, (e, root) => {
      if (e) {
        console.error('less rendering failed');
        reject(e);
      } else {
        resolve(root.toCSS({}));
      }
    });
  });
}

// add paths and discover, how to invoke this func
function evalStylusContent(additional_path, content) {
  return new Promise((resolve, reject) => {
    stylus(content)
      .set('paths', ['.', additional_path])
      .render((err, css) => {
        if (err) {
          console.error('stylus rendering failed');
          reject(err);
        } else {
          resolve(css);
        }
      });
  });
}

function evalFile(pathFilename, scopedMeta) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathFilename, 'utf8', (err, data) => {
      if (err) {
        reject(Error(err));
        return;
      }

      if (scopedMeta._useLess) {
        evalLessContent(scopedMeta._base, data).then(resolve).catch(reject);
      } else if (scopedMeta._useStylus) {
        evalStylusContent(scopedMeta._base, data).then(resolve).catch(reject);
      } else if (scopedMeta._useImbue) {
        evalImbueContent(scopedMeta, data).then(resolve).catch(reject);
      } else {
        reject(`unknown action for ${pathFilename}`);
      }
    });
  });
}

function render(meta, uriPath) {
  return new Promise((resolve, reject) => {
    // build up a metadata structure for *uriPath*
    // containing the appropriate local variables
    const scopedMeta = metadata.scopedBuild(meta, uriPath);
    const pathFilename = path.join(meta._base, scopedMeta._filename);

    if (scopedMeta._directCopy) {
      fs.readFile(pathFilename, (err, data) => {
        if (err) {
          reject(Error(err));
        }
        resolve(data);
      });
    } else {
      evalFile(pathFilename, scopedMeta).then(resolve).catch(reject);
    }
  });
}

exports.render = (meta, uriPath) => {
  return render(meta, uriPath);
};
