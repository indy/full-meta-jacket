/*!
 * full-meta-jacket: metadata
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');
var utils = require('./utils');
var layout = require('./layout');
var fs = require('fs');


// A list of folders that don't need to be traversed
var blacklist = [layout.folder, '.git'];


// **fullBuild**: returning a metadata structure with 
// information on every file contained within the 
// *base* folder
exports.fullBuild = function(base) {
  // recursively build the metadata
  var meta = buildMetadata(base, '');
  // add layout information to the top of the metadata
  meta._layouts = layout.build(utils.fileJoin(base, layout.folder));
  meta._base = base;
  meta._isDirectory = true;
  return meta;
}


// **scopedBuild**: generate a scoped metadata structure by 
// traversing through *meta* with the given *uriPath*
exports.scopedBuild = function(meta, uriPath, callback) {
  var segs = splitPath(uriPath);

  if(isValidPath(meta, segs)) {
    callback(null, scopedMeta({}, meta, segs));
  } else {
    callback("invalid path: " + uriPath);
  }

}

function isValidPath(meta, segs) {
  if(segs.length == 0) {
    return true;
  } else {
    if(meta[segs[0]]) {
      return isValidPath(meta[segs[0]], segs.slice(1));
    } else {
      return false;
    }
  }

}

// **splitPath**: splits the uriPath string into an array
function splitPath(uriPath) {
  var s = uriPath.split('/');
  // remove the first item if it's empty
  s = s[0] === '' ? s.slice(1) : s;
  // remove the last item if it's empty
  s = s[s.length - 1] === '' ? s.slice(0, -1) : s;
  return s;
}

// **scopedMeta**: recursively build up the scoped metadata 
// structure *sm* by weaving through *meta* using *segs* and
// merging together the _locals that are on every node 
function scopedMeta(sm, meta, segs) {
  return meta ? scopedMeta(imbue.mergeMeta(meta._locals, sm),
                           meta[segs[0]],
                           segs.slice(1)) : sm;

}

// **buildMetadata**: builds a complete metadata structure 
// for *folder*
function buildMetadata(base, folder) {

  var meta = {};
  var stats;
  var pathFilename;

  meta._files = [];
  meta._directories = [];
  meta._locals = {};

  utils.mapContents(base + folder, function(f) {
    pathFilename = utils.fileJoin(base + folder, f);
    stats = fs.statSync(pathFilename);

    if(stats.isFile()) {
      meta = addFileMetadata(meta, base, folder, f);
    } else if(stats.isDirectory()) {
      meta = addDirectoryMetadata(meta, base, folder, f);
    }
  });

  return addPublishedMetadata(meta);
}


function sortByDate(arr) {
  // sort according to *date* with the most 
  // recent appearing first
  arr.sort(function(a, b) {
    if(a.date > b.date) {
      return -1;
    } else if(a.date < b.date) {
      return 1;
    } else 
      return 0;
  });
  return arr;
}

// **addPublishedMetadata**: any nodes within meta that 
// have a published property should be added into
// *meta.published*. This will be available to the 
// rendered page where it can be used for things like 
// listing projects.
function addPublishedMetadata(meta) {
  var published = [];
  for(var o in meta) {
    if(meta[o]._locals && meta[o]._locals.published) {
      published.push(meta[o]._locals);
    }
  }

  sortByDate(published);

  // only add the *published* property to *meta* if 
  // it's non-empty 
  if(published.length > 0) {
    meta._locals.published = published;
  }

  return meta;
}


// **addFileMetadata**: add metadata about file *f* into *meta*
function addFileMetadata(meta, base, folder, f) {

  var pathFilename = utils.fileJoin(base + folder, f);

  // *_vars* files are special, their metdata should 
  // be added directly to *meta*
  if(f === '_vars') {
    meta = imbue.mergeMeta(meta, {_locals: readFileHeader(pathFilename)});
  } else {

    var fileMeta = deriveMetadata(folder, f);
    
    if(shouldCopyDirectly(fileMeta.publishedFilename)) {
      // if the files are binary just copy them directly 
      // across without trying to read header information
      fileMeta._directCopy = true;
    } else {
      // look inside the file and merge any metadata
      fileMeta = imbue.mergeMeta(readFileHeader(pathFilename), fileMeta);
    }

    // always reference the site structure by using the published names
    meta[fileMeta.publishedFilename] = { _locals: fileMeta};
    meta._files.push(f);
  }
  return meta;
}

// **shouldCopyDirectly**: some files should be copied 
// directly over
function shouldCopyDirectly(filename) {
  var ext = utils.pathExtension(filename);
  var bins = ['png', 'jpg', 'jpeg', 'ico'];

  return bins.some(function(b) { return b == ext});
}

function fullUri(folder, publishedFilename) {

  var posts = '/_posts';
  if(folder.slice(folder.length - posts.length) === posts) {
    folder = folder.slice(0, folder.length - posts.length);
  }

  return folder + '/' + publishedFilename;

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
  var allContainDates;

  s._locals.posts = [];
  allContainDates = true;

  // any file within the _posts directory that begins with an 
  // underscore or the word 'draft' shouldn't be published
  var isPrivate = /^_/;
  var isDraft = /^draft/;

  for(var o in postsMeta) {
    if(isPrivate.test(o) === false && isDraft.test(o) === false) {
      // make the page findable by it's published path
      s[o] = postsMeta[o];
      // also add the page to locals for iteration purposes
      var pageInfo = postsMeta[o]._locals;
      pageInfo.publishedFilename = o;
      s._locals.posts.push(pageInfo);
      if(pageInfo.date === undefined) {
        allContainDates = false;
      }
    }
  }

  // the posts will be in alphabetical order, however if they 
  // contain 'date' metadata order them by date, with the most
  // recent appearing first
  if(allContainDates === true) {
    sortByDate(s._locals.posts);
  }

  return s;
}

// Return the header information specified in the file
function readFileHeader(pathFilename) {
  var str = fs.readFileSync(pathFilename, 'utf8');
  var hb;
  
  try {
    hb = imbue.parse(str);
  } catch(e) {
    console.error(e.message);
    console.error("error parsing " + pathFilename);
    throw e;
  }

  var header = hb.header;

  // special case check for date declaration
  // convert these into Date objects
  if(header.date) {
    var d = header.date.split('-');
    header.date = new Date(d[0], d[1] - 1, d[2]);
  }

  return header;
}

var dateInFilenameRE = /^(\d{4})-(\d{2})-(\d{2})-(.*)/;

function hasDateInFilename(f) {
  return dateInFilenameRE.test(f);
}


function useMarkdown(f) {
  var ext = utils.pathExtension(f);
  return /^imd$/i.test(ext);
}

// given a filename title (e.g. some-post.imd or hello.html) remove the extension(s) and replace hyphens with spaces.
function sanitiseTitle(filenameTitle) {
  var name = filenameTitle.split('.')[0];

  // a double hyphen in the filename is translated into a single hyphen
  var components = name.split('-').map(function(i) {
    return i == '' ? '-' : i;
  });

  return components.join(' ').replace(' - ', '-');;
}

function deriveMetadata(folder, f) {

  var basics = {};

  // the path relative to base
  basics._filename = utils.fileJoin(folder, f);

  basics._useMarkdown = !!useMarkdown(f);

  var ext = utils.pathExtension(f);

  if(basics._useMarkdown) {
    basics._outFileExt = 'html'
  } else {
    if(ext === 'less') {
      basics._outFileExt = 'css';
      basics._useLess = true;
    } else {
      basics._outFileExt = ext;
    }
  }

  basics.publishedFilename = utils.changeExtension(f, basics._outFileExt);

  if(hasDateInFilename(f)) {
    var r = dateInFilenameRE.exec(f);
    basics.date = new Date(r[1], r[2]-1, r[3]);
    basics.title = sanitiseTitle(r[4]);
  } else if(f.split('.')[0] !== 'index') {
    // if the filename is just index.html or index.imd don't give 
    // it the title of 'index'. It's better to use a title defined 
    // in a higher level _vars file
    basics.title = sanitiseTitle(f);
  }

  basics.uri = fullUri(folder, basics.publishedFilename);

  return basics;
}


// export a bunch of 'private' functions for testing purposes
exports._fn = {
  deriveMetadata: deriveMetadata,
  useMarkdown: useMarkdown,
  hasDateInFilename: hasDateInFilename,
  sanitiseTitle: sanitiseTitle,
  fullUri: fullUri
};
