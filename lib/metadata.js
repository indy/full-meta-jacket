/*!
 * murmur: metadata
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var layout = require('./layout');
var fs = require('fs');

// a list of folders that don't need to be traversed
var blacklist = [layout.folder, '.git'];


// Traverse a folder and return all the metadata associated with it's contents
exports.fullBuild = function(base) {
  var meta = buildMetadata(base, '');
  meta._layouts = layout.build(utils.fileJoin(base, layout.folder));
  meta._base = base;
  meta._isDirectory = true;
  return meta;
}


// generate a metadata structure for the subset of *meta* specified by *path*
exports.scopedBuild = function(meta, path) {
  return scopedMeta({}, meta, splitPath(path));
}

function splitPath(path) {
  var s = path.split('/');
  // remove the first item if it's empty
  s = s[0] === '' ? s.slice(1) : s;
  // remove the last item if it's empty
  s = s[s.length - 1] === '' ? s.slice(0, -1) : s;
  return s;
}

function scopedMeta(sm, meta, segs) {
  return meta ? scopedMeta(imbue.mergeMeta(meta._locals, sm),
                           meta[segs[0]],
                           segs.slice(1)) : sm;

}

function changeExtension(pathfilename, newExt) {
  var segs = pathfilename.split('.');
  if(segs.length > 1) {
    segs = segs.slice(0, -1)
  }
  segs.push(newExt);
  return segs.join('.');
}

function fileExtension(pathfilename) {
  var segs = pathfilename.split('.');
  return segs.length > 1 ? segs.slice(-1)[0] : '';
}

function buildMetadata(base, folder) {

  var s = {};
  var stats;
  var pathFilename;

  s._files = [];
  s._directories = [];
  s._locals = {};

  utils.mapContents(base + folder, function(f) {
    pathFilename = utils.fileJoin(base + folder, f);
    stats = fs.statSync(pathFilename);

    if(stats.isFile()) {
      s = addFileMetadata(s, base, folder, f);
    } else if(stats.isDirectory()) {
      s = addDirectoryMetadata(s, base, folder, f);
    } else {
      // raise an error
    }
  });

  return addPublishedMetadata(s);
}

function addPublishedMetadata(s) {
  var published = [];
  for(var o in s) {
    if(s[o] && s[o].published_date) {
      published.push(s[o]);
    }
  }

  // sort according to published date
  published.sort(function(a, b) {
    if(a.published_date < b.published_date) {
      return -1;
    } 
    if(a.published_date > b.published_date) {
      return 1;
    }
    return 0;
  });

  if(published.length > 0) {
    s._published = published;
  }

  return s;
}

function shouldCopyDirectly(filename) {
  var ext = filename.split('.').slice(-1)[0].toLowerCase();
  var bins = ['png', 'jpg', 'jpeg', 'ico'];

  return bins.some(function(b) { return b == ext});
}


// Add metadata about the given file to the structure **s**
function addFileMetadata(s, base, folder, f) {

  if(f === '_vars') {
    // use _vars file as the directory's metadata
    var pathFilename = utils.fileJoin(base + folder, f);
    s = imbue.mergeMeta(s, {_locals: readFileHeader(pathFilename)});
  } else {
    
    var publishedFilename;
    if(fileExtension(f) === 'imd') {
      publishedFilename = changeExtension(f, 'html');
    } else {
      publishedFilename = f;
    }

    if(shouldCopyDirectly(publishedFilename)) {
      s[publishedFilename] = {
        _locals: {
          _directCopy: true,
          _filename: utils.fileJoin(folder, f)
        }
      };
    } else {
      s[publishedFilename] = readFileMetadata(base, folder, f);
    }

    s = addUri(s, folder, publishedFilename);

    s._files.push(f);
  }
  return s;
}

function addUri(s, folder, publishedFilename) {

  var posts = '/_posts';
  if(folder.slice(folder.length - posts.length) === posts) {
    folder = folder.slice(0, folder.length - posts.length);
  }

  // todo: reverse the folder's separator character if we're on Windows

  s[publishedFilename]._locals.uri = folder + '/' + publishedFilename;

  return s;
}

// Add metadata about the given directory to the structure **s**
function addDirectoryMetadata(s, base, folder, f) {

  // don't traverse any of the folders in the blacklist
  if(blacklist.indexOf(f) > -1) {
    return s;
  }

  var path;

  if(f === '_posts') {
    s = addPostsDirectoryMetadata(s, base, folder);
  } else {
    path = utils.fileJoin(folder, f);
    s[f] = buildMetadata(base, path);
    s[f]._isDirectory = true;
  }

  s._directories.push(f);

  return s;
}


function addPostsDirectoryMetadata(s, base, folder) {

  var path = utils.fileJoin(folder, '_posts');

  var postsMeta = buildMetadata(base, path);

  s._locals.posts = [];
  // hoist up any fields that don't begin with an underscore
  for(var o in postsMeta) {
    if(o[0] !== '_') {
      // make the page findable by it's published path
      s[o] = postsMeta[o];
      // also add the page to locals for iteration purposes
      var pageInfo = postsMeta[o]._locals;
      pageInfo.publishedFilename = o;
      s._locals.posts.push(pageInfo);
    }
  }
  return s;
}

// Return the header information specified in the file
function readFileHeader(pathFilename) {
  var str = fs.readFileSync(pathFilename, 'utf8');
  var hb = imbue.parse(str);
  return hb.header;
}

// Return all explicit and implicit metadata associated with the file
function readFileMetadata(base, folder, f) {

  var pathFilename = utils.fileJoin(base + folder, f);

  var header = readFileHeader(pathFilename);
  var basics = {};

  // the path relative to base
  basics._filename = utils.fileJoin(folder, f);

  var ext = fileExtension(f);
  if(ext === 'imd') {
    basics._useMarkdown = true;
    basics._outFileExt = 'html'
  } else {
    basics._useMarkdown = false;
    basics._outFileExt = ext;
  }



  return {_locals: imbue.mergeMeta(header, basics)};
}


