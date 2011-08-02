/*!
 * murmur: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var metadata = require('./metadata');
var layout = require('./layout');
var fs = require('fs');

exports.build = function(folder, destination) {
  var meta = metadata.build(folder);
  meta['layouts'] = layout.build(utils.fileJoin(folder, layout.folder));
  renderFolder(meta, folder, destination);
}

exports.renderFolder = function(metadata, folder, destination) {
  renderFolder(metadata, folder, destination);
}

exports.evalFile = function(metadata, filename) {
  return evalFile(metadata, filename);
}

function evalFile(metadata, filename) {
  return imbue.renderFile(metadata, filename);
}


// renders the contents of **folder** into **destination** using the supplied **metadata**
function renderFolder(metadata, folder, destination) {

  utils.mapContents(folder, function(f) {
    pathfilename = utils.fileJoin(folder, f);
    stats = fs.statSync(pathfilename);

    if(stats.isFile()) {
      if(f === '_zonal') {
      } else {
        renderFile(metadata, pathfilename, f, destination);
      }
    } else if(stats.isDirectory()) {
      if(f === layout.folder) {
      } else {
        renderDirectory(metadata, pathfilename, utils.fileJoin(destination, f));
      }
    } else {
      // raise an error
    }
  });
}


function renderFile(metadata, pathfilename, f, destination) {

  var str = fs.readFileSync(pathfilename, 'utf8');

  var hb = imbue.getHeaderAndBody(str);
  var header = hb.header;
  var body = hb.body;

  var content;

  if(hb.imbued == false) {
    // not an imbue file, so just copy it across
    content = str;
  } else if(header.layout && metadata['layouts'][header.layout]) {
    // an imbue file with a layout

    // merge the metadata of all the nested layouts
    var mergedMeta = layout.mergeMetadata(metadata, header);

    // go up the layout chain, expanding the ejs
    mergedMeta.content = imbue.renderBodyEJS(mergedMeta, body);

    do {
      var lay = metadata['layouts'][header.layout];
      header = lay.header;
      body = lay.body;

      mergedMeta.content = imbue.renderBodyEJS(mergedMeta, body);
      
    } while(header.layout && metadata['layouts'][header.layout])

    // now pass mergeMeta.content through the markdown
    content = imbue.renderMarkdown(mergedMeta.content);
  } else {
    // no layout, just do a simple imbue render
    content = imbue.renderString(metadata, str);
  }

  var outputFilename = utils.fileJoin(destination, f);
  fs.writeFile(outputFilename, content, function (err) {
    if (err) throw err;
  });

}

function renderDirectory(metadata, path, destination) {
  // create folder if required?
  fs.mkdirSync(destination, 0777);
  renderFolder(metadata, path, destination);
}



