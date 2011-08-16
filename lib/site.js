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
  writeMeta("/Users/indy/mem/meta.js", meta);


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

function directCopyFile(pathfilename, outputfilename) {
  fs.writeFileSync(outputfilename,
                   fs.readFileSync(pathfilename), 
                   function (err) {
                     if (err) throw err;
                   });
}

// renders the contents of **folder** into **destination** using the supplied **metadata**
function renderFolder(metaAbs, metaRelative, folder, destination) {
  utils.ensureDirectoryExists(destination);

  var processFile = function(f, pathfilename) {
    var localMeta;
    var outputfilename;

    if(!isIgnoredFile(f)) {
      localMeta = imbue.mergeMeta(metaAbs, {page: metaRelative});

      if(shouldCopyDirectly(f)) {
        outputfilename = utils.fileJoin(destination, f);
        directCopyFile(pathfilename, outputfilename);
      } else {
        renderFile(localMeta, pathfilename, f, destination);
      }

    }
  };

  var processFolder = function(f, pathfilename) {
    var localMeta, subfolder;

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
      renderFolder(metaAbs, localMeta, pathfilename, subfolder);
    }
  };

  utils.mapContents(folder, function(f) {
    pathfilename = utils.fileJoin(folder, f);
    stats = fs.statSync(pathfilename);

    if(stats.isFile()) {
      processFile(f, pathfilename);
    } else if(stats.isDirectory()) {
      processFolder(f, pathfilename);
    } else {
      throw "unknown fs element";
    }
  });
}

function shouldCopyDirectly(filename) {
  var ext = filename.split('.').slice(-1)[0].toLowerCase();
  var bins = ['png', 'jpg', 'jpeg', 'ico'];

  return bins.some(function(b) { return b == ext});
}

function renderFile(meta, pathfilename, f, destination) {
  var outputFilename;

  // build up implicit metadata. (currenly this will just be filename, extension etc)
  var implicitMeta = metadata.implicitFileMetadata(pathfilename);
  var mergedMeta = imbue.mergeMeta(implicitMeta, meta);

  var content = page.evalFile(mergedMeta, pathfilename);

  // work out the output filename
  var segs = f.split('.');
  var newf;

  if(segs.length > 1) {
    newf = segs.slice(0, -1).join('.') + '.' + mergedMeta._outFileExt;    
  } else {
    // no extension
    newf = f;
  }

  outputFilename = utils.fileJoin(destination, newf);

  fs.writeFile(outputFilename, content, function (err) {
    if (err) throw err;
  });
}
