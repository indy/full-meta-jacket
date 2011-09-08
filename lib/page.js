/*!
 * full-meta-jacket: page
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */


// page renders the requested metadata+path combo and returns the result as a string 

var fs = require('fs');
var imbue = require('imbue');

var utils = require('./utils');
var layout = require('./layout');
var metadata = require('./metadata');


exports.render = function(meta, uriPath) {

  return render(meta, uriPath);

}

function render(meta, uriPath) {

  // build up a metadata structure for *uriPath*
  // containing the appropriate local variables
  var scopedMeta = metadata.scopedBuild(meta, uriPath);

  // also provide a reference to the full metadata
  scopedMeta._fullMeta = meta;

  var pathFilename = meta._base + scopedMeta._filename;

  if(scopedMeta._directCopy) {
    return fs.readFileSync(pathFilename);
  } 

  var content = fs.readFileSync(pathFilename, 'utf8');
  return evalContent(scopedMeta, content);
}

/*
  given site metadata and the contents of a file **evalContent** returns the final contents ready to be served/written to disk
 */
function evalContent(scopedMeta, content) {

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

  return res.trim();
}

function hasValidLayout(scopedMeta) {
  var layouts = scopedMeta._fullMeta._layouts;
  return layouts[scopedMeta.layout]
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