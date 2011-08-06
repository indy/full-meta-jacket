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

function evalFile(metadata, str) {
  var hb = imbue.getHeaderAndBody(str);
  var header = hb.header;
  var body = hb.body;

  var content;

  if(hb.imbued == false) {
    // not an imbue file, so just copy it across
    content = str;
  } else if(header.page.layout && metadata['layouts'][header.page.layout]) {
    // an imbue file with a layout

    // merge the metadata of all the nested layouts
    var mergedMeta = layout.mergeMetadata(metadata, header);

    // expand EJS with the mergedMeta and render the markdown content
    mergedMeta.content = imbue.renderBody(mergedMeta, body);

    // go up the layout chain, expanding the ejs
    do {
      var lay = metadata['layouts'][header.page.layout];
      header = lay.header;
      body = lay.body;
      mergedMeta.content = imbue.renderBodyEJS(mergedMeta, body);
    } while(header.page.layout && metadata['layouts'][header.page.layout])
    content = mergedMeta.content;

  } else {
    // no layout, just do a simple imbue render
    content = imbue.renderString(metadata, str);
  }

  return content.trim();
}
