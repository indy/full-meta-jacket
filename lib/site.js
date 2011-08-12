/*!
 * murmur: site
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var filters = require('./filters');
var metadata = require('./metadata');
var layout = require('./layout');
var fs = require('fs');
var page = require('./page');

exports.build = function(folder, destination) {

  imbue.addFilters(filters);

  var meta = metadata.build(folder);
//  writeMeta("/home/indy/mem/meta.meta", meta);

  meta['layouts'] = layout.build(utils.fileJoin(folder, layout.folder));
  renderFolder(meta, meta, folder, destination);
}

function writeMeta(filename, meta) {
  fs.writeFileSync(filename, JSON.stringify(meta, null, 4));
}

function isIgnoredFolder(f) {
  return f === layout.folder || f === '.git';
}

function isIgnoredFile(f) {
  return f === '_vars';
}

// renders the contents of **folder** into **destination** using the supplied **metadata**
function renderFolder(metadata, metaRelative, folder, destination) {
  var localMeta
  var subfolder;

  utils.ensureDirectoryExists(destination);

  utils.mapContents(folder, function(f) {
    pathfilename = utils.fileJoin(folder, f);
    stats = fs.statSync(pathfilename);

    if(stats.isFile()) {
      if(!isIgnoredFile(f)) {
        localMeta = imbue.mergeMeta(metadata, {page: metaRelative});
        renderFile(localMeta, pathfilename, f, destination);
      }
    } else if(stats.isDirectory()) {
      if(!isIgnoredFolder(f)) {
        if(f === '_posts') {
          // don't create a '_posts' directory in the destination
          // just place the posts in the parent
          subfolder = destination;
          // merge metaRelative with metaRelative[f]
          localMeta = imbue.mergeMeta(metaRelative[f], metaRelative);
        } else {
          subfolder = utils.fileJoin(destination, f);
          localMeta = metaRelative[f];
        }

        renderFolder(metadata, localMeta, pathfilename, subfolder);
      }
    } else {
      // raise an error
    }
  });
}


function shouldCopyDirectly(filename) {
  var ext = filename.split('.').slice(-1)[0].toLowerCase();
  var bins = ['png', 'jpg', 'jpeg', 'ico'];
  return bins.some(function(b) { return b == ext});
}

function renderFile(metadata, pathfilename, f, destination) {

  var outputFilename;

  // binary files should be copied over directly
  if(shouldCopyDirectly(f)) {
    //console.log("directly copying " + pathfilename + " : " + f);
    outputFilename = utils.fileJoin(destination, f);
    fs.writeFileSync(outputFilename,
                     fs.readFileSync(pathfilename), 
                     function (err) {
                       if (err) throw err;
                     });
    return;
  } 

  // build up implicit metadata. (currenly this will just be filename, extension etc)
  var implicitMeta = page.implicitFileMetadata(pathfilename);
  var meta = imbue.mergeMeta(implicitMeta, metadata);

  var content = page.evalFile(meta, pathfilename);

  // work out the output filename
  var newf = f.split('.').slice(0, -1).join('.') + '.' + meta._outFileExt;
  outputFilename = utils.fileJoin(destination, newf);
  fs.writeFile(outputFilename, content, function (err) {
    if (err) throw err;
  });

}
