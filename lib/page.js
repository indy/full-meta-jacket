/*!
 * full-meta-jacket: page
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */


// page renders the requested metadata+path combo and returns the result as a string

var fs = require('fs');
var path = require('path');
var less = require('less');
var stylus = require('stylus');

var imbue = require('./imbue');
var utils = require('./utils');
var metadata = require('./metadata');

function renderImbueContent(hb, scopedMeta) {
  var dest = scopedMeta._destination;
  var filename = scopedMeta.publishedFilename;

  scopedMeta._jade_filename = path.join(dest, "__temp", filename);

  return imbue.render(scopedMeta, hb.body);
}

function evalImbueContent(scopedMeta, content, resolve, reject) {
  var hb;

  try {
    hb = imbue.parse(content);
  } catch (e) {
    console.error(e.message);
    console.error("error eval'ing imbue content");
    reject(e);
    return;
  }

  var res;

  if (hb.imbued === false) {
    // not an imbue file, just return the contents
    res = content;
  } else {
    res = renderImbueContent(hb, scopedMeta);
  }

  resolve(res.trim());
}

function evalLessContent(additional_path, content, resolve, reject) {
  var parser = new(less.Parser)({
    paths: ['.', additional_path] // search paths for @import directives
  });

  parser.parse(content, function (e, root) {
    if (e) {
      console.error("less rendering failed");
      reject(e);
    } else {
      resolve(root.toCSS({}));
    }
  });
}

// add paths and discover, how to invoke this func
function evalStylusContent(additional_path, content, resolve, reject) {
  stylus(content)
    .set('paths', ['.', additional_path])
    .render(function (err, css) {
      if (err) {
        console.error("stylus rendering failed");
        reject(err);
      } else {
        resolve(css);
      }
    });
}

function evalFile(pathFilename, scopedMeta, resolve, reject) {

  fs.readFile(pathFilename, 'utf8', (err, data) => {
    if(err) {
      reject(Error(err));
      return;
    }

    if (scopedMeta._useLess) {
      evalLessContent(scopedMeta._base, data, resolve, reject);
    } else if (scopedMeta._useStylus) {
      evalStylusContent(scopedMeta._base, data, resolve, reject);
    } else if (scopedMeta._useImbue) {
      evalImbueContent(scopedMeta, data, resolve, reject);
    } else {
      reject('unknown action for ' + pathFilename);
    }
  });
}

function render(meta, uriPath) {
  return new Promise((resolve, reject) => {

    // build up a metadata structure for *uriPath*
    // containing the appropriate local variables
    var scopedMeta = metadata.scopedBuild(meta, uriPath);

    var pathFilename = path.join(meta._base, scopedMeta._filename);

    if (scopedMeta._directCopy) {
      fs.readFile(pathFilename, (err, data) => {
        if(err) {
          reject(Error(err));
        }
        resolve(data);
      });
    } else {
      evalFile(pathFilename, scopedMeta, resolve, reject);
    }
  });
}

exports.render = function (meta, uriPath) {
  return render(meta, uriPath);
};
