/*!
 * full-meta-jacket: page
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var layout = require('./layout');
var fs = require('fs');

/*
  given site metadata and the contents of a file **evalFile** returns the final contents ready to be served/written to disk
 */

exports.evalFile = function(meta, pathFilename) {
  return evalFile(meta, pathFilename);
}



exports.renderFile = function(meta, pathFilename, destination) {
  var content = renderString(meta, pathFilename);
  fs.writeFile(destination, content, function (err) {
    if (err) throw err;
  });
}

exports.renderString = function(meta, pathFilename) {
  return renderString(meta, pathFilename);
}

function renderString(meta, pathFilename) {

  var content = fs.readFileSync(pathFilename, 'utf8');

  return meta._directCopy ? content : evalFile(meta, content);
}


function evalFile(meta, content) {

  var hb = imbue.parse(content);
  var res;

  if(hb.imbued === false) {
    // not an imbue file, so just copy it across
    res = content;
  } else if(hasValidLayout(meta)) {
    // an imbue file with a layout
    res = renderWithLayout(hb, meta);
  } else {
    // no layout, just do a simple imbue render
    res = imbue.render(imbue.mergeMeta(hb.header, meta), hb.body);
  }

  return res.trim();
}

function hasValidLayout(meta) {
  var layouts = meta._fullMeta._layouts;
  return layouts[meta.layout]
}

function renderWithLayout(hb, meta) {

  var header = hb.header;
  var body = hb.body;
  var content;
  var mergedMeta;

  // merge the metadata of all the nested layouts
  mergedMeta = layout.mergeMetadata(meta);

  // expand EJS with the mergedMeta and render the markdown content
  mergedMeta.content = imbue.render(mergedMeta, body);

  // layouts can't be defined with markdown
  mergedMeta._useMarkdown = false;


  var fullMeta = meta._fullMeta;

  // go up the layout chain, expanding the ejs
  do {
    var lay = fullMeta._layouts[header.layout];
    header = lay.header;
    body = lay.body;
    mergedMeta.content = imbue.render(mergedMeta, body);
  } while(header.layout && fullMeta._layouts[header.layout])

  return mergedMeta.content;
}