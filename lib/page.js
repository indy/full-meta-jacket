/*!
 * full-meta-jacket: page
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */


// page renders the requested metadata+path combo and returns the result as a string 

var fs = require('fs');
var imbue = require('imbue');
var less = require('less');

var utils = require('./utils');
var layout = require('./layout');
var metadata = require('./metadata');


exports.render = function(meta, uriPath, callback) {

  return render(meta, uriPath, callback);

}

function render(meta, uriPath, callback) {

  // build up a metadata structure for *uriPath*
  // containing the appropriate local variables
  metadata.scopedBuild(meta, uriPath, function(e, scopedMeta) {

    if(e) {
      callback(e);
      return;
    }

    // also provide a reference to the full metadata
    scopedMeta._fullMeta = meta;

    var pathFilename = meta._base + scopedMeta._filename;

    if(scopedMeta._directCopy) {
      fs.readFile(pathFilename, function(e, data) {
        if(e) {
          console.error("direct copy of " + pathFilename + " failed");
          callback(e);
        } else {
          callback(null, data);
        }
      });
    } else {
      fs.readFile(pathFilename, 'utf8', function(e, data) {
        if(e) {
          console.error("reading " + pathFilename + " failed");
          callback(e);
        } else {
          evalContent(scopedMeta, data, callback);
        }
      });
    }

  });

}

/*
  given site metadata and the contents of a file **evalContent** returns the final contents ready to be served/written to disk
 */
function evalContent(scopedMeta, content, callback) {
  var evalFn = scopedMeta._useLess ? evalLessContent : evalImbueContent;
  evalFn(scopedMeta, content, callback);
}


function evalLessContent(scopedMeta, content, callback) {
  less.render(content, function(e, css) {
    if(e) {
      console.error("less rendering failed");
      callback(e);
    } else {
      callback(null, css);
    }
  });
}

function evalImbueContent(scopedMeta, content, callback) {

  var hb = imbue.parse(content);
  var res;

  if(hb.imbued === false) {
    // not an imbue file, just return the contents
    res = content;
  } else if(hasValidLayout(scopedMeta)) {
    // an imbue file with a layout
    res = renderWithLayout(hb, scopedMeta);
  } else {
    // no layout, just do a simple imbue render
    res = imbue.render(scopedMeta, hb.body);
  }

  callback(null, res.trim());
}

function hasValidLayout(scopedMeta) {
  var layouts = scopedMeta._fullMeta._layouts;
  return layouts[scopedMeta.layout];
}

function renderWithLayout(hb, scopedMeta) {

  var header = hb.header;
  var body = hb.body;
  var content;
  var mergedMeta;

  // merge the metadata of all the nested layouts
  mergedMeta = layout.mergeMetadata(scopedMeta);

  // expand EJS with the mergedMeta and render the markdown content
  mergedMeta.content = imbue.render(mergedMeta, body);

  // layouts can't be defined with markdown
  mergedMeta._useMarkdown = false;


  var fullMeta = scopedMeta._fullMeta;

  // go up the layout chain, expanding the ejs
  do {
    var lay = fullMeta._layouts[header.layout];
    header = lay.header;
    body = lay.body;
    mergedMeta.content = imbue.render(mergedMeta, body);
  } while(header.layout && fullMeta._layouts[header.layout])

  return mergedMeta.content;
}