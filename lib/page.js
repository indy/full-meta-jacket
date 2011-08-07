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

exports.implicitFileMetadata = function(pathfilename) {
  return implicitFileMetadata(pathfilename);
}

function implicitFileMetadata(pathfilename) {
  var obj = {};
  var ext = pathfilename.split('.').slice(-1)[0];

  obj.pathfilename = pathfilename;

  if(ext === 'imd') {
    obj._useMarkdown = true;
    obj._outFileExt = 'html'
  } else {
    obj._useMarkdown = false;
    obj._outFileExt = ext;
  }

  return obj;
}

function evalFile(meta, pathfilename) {
  var str = fs.readFileSync(pathfilename, 'utf8');

  var hb = imbue.getHeaderAndBody(str);
  var header = hb.header;
  var body = hb.body;

  var content;

/*
  if (meta._useMarkdown) {
    console.log('using markdown ' + pathfilename);
  } else {
    console.log('not using markdown ' + pathfilename);
  }
  */
  if(hb.imbued == false) {
    // not an imbue file, so just copy it across
    content = str;
  } else if(header.page.layout && meta['layouts'][header.page.layout]) {
    // an imbue file with a layout

    // merge the metadata of all the nested layouts
    var mergedMeta = layout.mergeMetadata(meta, header);

    // expand EJS with the mergedMeta and render the markdown content
    mergedMeta.content = imbue.renderBody(mergedMeta, body);

    // go up the layout chain, expanding the ejs
    do {
      var lay = meta['layouts'][header.page.layout];
      header = lay.header;
      body = lay.body;
      mergedMeta.content = imbue.renderBodyEJS(mergedMeta, body);
    } while(header.page.layout && meta['layouts'][header.page.layout])
    content = mergedMeta.content;

  } else {
    // no layout, just do a simple imbue render
    content = imbue.renderString(metadata, str);
  }

  return content.trim();
}
