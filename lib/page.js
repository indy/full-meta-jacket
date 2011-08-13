/*!
 * murmur: page
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

exports.evalFile = function(siteMetadata, fileStr) {
  return evalFile(siteMetadata, fileStr);
}

function evalFile(meta, pathfilename) {
  var str = fs.readFileSync(pathfilename, 'utf8');
  var hb = imbue.parse(str);

  var content;
  var mergedMeta;

  if(hb.imbued == false) {
    // not an imbue file, so just copy it across
    content = str;
  } else if(hasValidLayout(hb, meta['layouts'])) {
    // an imbue file with a layout
    content = renderWithLayout(hb, meta);
  } else {
    // no layout, just do a simple imbue render
    mergedMeta = imbue.mergeMeta(hb.header, meta);
    content = imbue.render(mergedMeta, hb.body);
  }

  return content.trim();
}

function hasValidLayout(hb, layouts) {
  var header = hb.header;

  if(header.page.layout && layouts[header.page.layout]) {
    return true;
  }
  return false;
}

function renderWithLayout(hb, meta) {

  var header = hb.header;
  var body = hb.body;
  var content;
  var mergedMeta;

  // merge the metadata of all the nested layouts
  mergedMeta = layout.mergeMetadata(header, meta);

  // expand EJS with the mergedMeta and render the markdown content
  mergedMeta.content = imbue.render(mergedMeta, body);

  // layouts can't be defined with markdown
  mergedMeta._useMarkdown = false;

  // go up the layout chain, expanding the ejs
  do {
    var lay = meta['layouts'][header.page.layout];
    header = lay.header;
    body = lay.body;
    mergedMeta.content = imbue.render(mergedMeta, body);
  } while(header.page.layout && meta['layouts'][header.page.layout])

  return mergedMeta.content;
}