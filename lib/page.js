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
  var dest = scopedMeta._fullMeta._destination;
  var filename = scopedMeta.publishedFilename;

  scopedMeta._jade_filename = path.join(dest, "__temp", filename);

  return imbue.render(scopedMeta, hb.body);
}

function evalImbueContent(scopedMeta, content, callback) {
  var hb;

  try {
    hb = imbue.parse(content);
  } catch (e) {
    console.error(e.message);
    console.error("error eval'ing imbue content");
    throw e;
  }

  var res;

  if (hb.imbued === false) {
    // not an imbue file, just return the contents
    res = content;
  } else {
    res = renderImbueContent(hb, scopedMeta);
  }

  callback(null, res.trim());
}

function evalLessContent(additional_path, content, callback) {
  var parser = new(less.Parser)({
    paths: ['.', additional_path] // search paths for @import directives
  });

  parser.parse(content, function (e, root) {
    if (e) {
      console.error("less rendering failed");
      callback(e);
    } else {
      callback(e, root.toCSS({}));
    }
  });
}

// add paths and discover, how to invoke this func
function evalStylusContent(additional_path, content, callback) {
  stylus(content)
    .set('paths', ['.', additional_path])
    .render(function (err, css) {
      if (err) {
        console.error("stylus rendering failed");
        callback(err);
      } else {
        callback(err, css);
      }
    });
}

function evalFile(pathFilename, scopedMeta, callback) {
  var data = fs.readFileSync(pathFilename, 'utf8');
  if (scopedMeta._useLess) {
    evalLessContent(scopedMeta._fullMeta._base, data, callback);
  } else if (scopedMeta._useStylus) {
    evalStylusContent(scopedMeta._fullMeta._base, data, callback);
  } else if (scopedMeta._useImbue) {
    evalImbueContent(scopedMeta, data, callback);
  } else {
    console.error('unknown action for ' + pathFilename);
  }
}

function render(meta, uriPath, callback) {
  // build up a metadata structure for *uriPath*
  // containing the appropriate local variables
  var scopedMeta = metadata.scopedBuild(meta, uriPath);

  var pathFilename = path.join(meta._base, scopedMeta._filename);

  if (scopedMeta._directCopy) {
    var data = fs.readFileSync(pathFilename);
    callback(null, data);
  } else {
    evalFile(pathFilename, scopedMeta, callback);
  }
}

exports.render = function (meta, uriPath, callback) {
  return render(meta, uriPath, callback);
};
