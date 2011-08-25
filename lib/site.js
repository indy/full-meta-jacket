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

  var meta = metadata.fullBuild(folder);
//  utils.writeMeta("/Users/indy/mem/meta.js", meta);


  meta['layouts'] = layout.build(utils.fileJoin(folder, layout.folder));


  // wish I could call this fullMetaJacket
  fullMetaRender(meta, meta, '/', destination);


  // will have to traverse the metadata rather than the folder structure
  // saving the results into destination
  

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

// render the contents of 
function fullMetaRender(meta, localMeta, uriPath, destination) {
  utils.ensureDirectoryExists(destination);

  var processFile = function(f, pathfilename) {
    var localMeta;
    var outputfilename;

    if(!isIgnoredFile(f)) {
      console.log('file: ' + f + ' : ' + pathfilename);

      /*
      localMeta = imbue.mergeMeta(metaAbs, metaRelative);

      if(shouldCopyDirectly(f)) {
        outputfilename = utils.fileJoin(destination, f);
        directCopyFile(pathfilename, outputfilename);
      } else {
        renderFile(localMeta, pathfilename, f, destination);
      }
      */
    }
  };

  var processFolder = function(f, pathfilename) {
    var localMeta, subfolder;

    if(!isIgnoredFolder(f)) {
      console.log('folder: ' + f + ' : ' + pathfilename);

      if(f === '_posts') {
        // don't create a '_posts' directory in the destination
        // just place the posts in the parent
        subfolder = destination;
        // merge metaRelative with metaRelative[f]
//        localMeta = imbue.mergeMeta(metaRelative[f], metaRelative);
      } else {
        subfolder = utils.fileJoin(destination, f);
//        localMeta = metaRelative[f];
      }


      renderFolder(meta, pathfilename, subfolder);
    }
  };

  var isPrivateProperty = function(name) {
    return name[0] === '_';
  }

  var scopedMeta;

  if(localMeta.isDirectory) {
    for(var o in localMeta) {
      if(!isPrivateProperty(localMeta[o])) {
        fullMetaRender(meta, localMeta[o], uriPath + '/' + o, destination);
      }
    }
  } else {
    scopedMeta = metadata.scopedBuild(meta, uriPath);

    // get the pathFilename of the resource from localMeta
    // fullPath = meta._sourceDirectory + '/' + localMeta._pathFilename
    // render the page
    // page.evalFile(scopedMeta, fullPath);
  }


}






// renders the contents of **folder** into **destination** using the supplied **metadata**
function renderFolder2(metaAbs, metaRelative, folder, destination) {
  utils.ensureDirectoryExists(destination);

  var processFile = function(f, pathfilename) {
    var localMeta;
    var outputfilename;

    if(!isIgnoredFile(f)) {
      localMeta = imbue.mergeMeta(metaAbs, metaRelative);

//      if(shouldCopyDirectly(f)) {
//        outputfilename = utils.fileJoin(destination, f);
//        directCopyFile(pathfilename, outputfilename);
//      } else {
        renderFile(localMeta, pathfilename, f, destination);
//      }

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

function renderFile(meta, pathfilename, f, destination) {
  var outputFilename;

  var content = page.evalFile(meta, pathfilename);

  // work out the output filename
  var segs = f.split('.');
  var newf;

  if(segs.length > 1) {
    newf = segs.slice(0, -1).join('.') + '.' + meta._outFileExt;    
  } else {
    // no extension
    newf = f;
  }

  outputFilename = utils.fileJoin(destination, newf);

  fs.writeFile(outputFilename, content, function (err) {
    if (err) throw err;
  });
}
