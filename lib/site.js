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
var page = require('./page');

exports.build = function(folder, destination) {
  var meta = metadata.build(folder);
  meta['layouts'] = layout.build(utils.fileJoin(folder, layout.folder));

  renderFolder(meta, folder, destination);
}

// renders the contents of **folder** into **destination** using the supplied **metadata**
function renderFolder(metadata, folder, destination) {

  utils.ensureDirectoryExists(destination);

  utils.mapContents(folder, function(f) {
    pathfilename = utils.fileJoin(folder, f);
    stats = fs.statSync(pathfilename);

    if(stats.isFile()) {
      if(f === '_zonal') {
        // don't render _zonal files
      } else {
        renderFile(metadata, pathfilename, f, destination);
      }
    } else if(stats.isDirectory()) {
      if(f === layout.folder) {
        // ignore the layout folder
      } else {
        var subfolder = utils.fileJoin(destination, f);
        renderFolder(metadata, pathfilename, subfolder);
      }
    } else {
      // raise an error
    }
  });
}


function renderFile(metadata, pathfilename, f, destination) {

  var str = fs.readFileSync(pathfilename, 'utf8');
  var content = page.evalFile(metadata, str);

  var outputFilename = utils.fileJoin(destination, f);
  fs.writeFile(outputFilename, content, function (err) {
    if (err) throw err;
  });
}
