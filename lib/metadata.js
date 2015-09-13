/*!
 * full-meta-jacket: metadata
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

var fn = require('./fn');
var imbue = require('./imbue');
var utils = require('./utils');
var template = require('./template');
var fs = require('fs');
var path = require('path');


// A list of folders that don't need to be traversed
var blacklist = [template.folder, '.git'];
var postsDirectory = "_posts";

// Recursively merges **b** into **a**, returning the mutated **a** object.
function deepMerge(a, b) {
  if (a instanceof Array && b instanceof Array) {
    return a;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    for (var bProp in b) {
      if (a.hasOwnProperty(bProp)) {
        a[bProp] = deepMerge(a[bProp], b[bProp]);
      } else {
        a[bProp] = b[bProp];
      }
    }
  }
  return a;
}

// private export of deepMerge used by imbue.test.js
exports._deepMerge = function (a, b) {
  // start by merging a into an empty object, then do a further merge with b
  return deepMerge(deepMerge({}, a), b);
};


function sortByDate(arr) {
  // sort according to *date* with the most
  // recent appearing first
  arr.sort(function (a, b) {
    if (a.date > b.date) {
      return -1;
    } else if (a.date < b.date) {
      return 1;
    } else {
      return 0;
    }
  });
  return arr;
}

function fullUri(folder, publishedFilename) {

  var posts = '/' + postsDirectory;
  if (folder.slice(folder.length - posts.length) === posts) {
    folder = folder.slice(0, folder.length - posts.length);
  }

  return folder + '/' + publishedFilename;

}

var dateInFilenameRE = /^(\d{4})-(\d{2})-(\d{2})-(.*)/;

function hasDateInFilename(f) {
  return dateInFilenameRE.test(f);
}

// checks if it's possible for this filetype to contain header information
function useImbue(f) {
  var ext = utils.pathExtension(f);
  var allowed = ['imd', 'html', 'txt', 'xml'];

  return allowed.some(function (b) {
    var r = new RegExp("^" + b + "$", "i");
    return r.test(ext);
  });
}

// given a filename title (e.g. some-post.imd or hello.html) remove the extension(s) and replace hyphens with spaces.
function sanitiseTitle(filenameTitle) {
  var name = filenameTitle.split('.')[0];

  // a double hyphen in the filename is translated into a single hyphen
  var components = name.split('-').map(function (i) {
    return i === '' ? '-' : i;
  });

  return components.join(' ').replace(' - ', '-');
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
  if (meta) {
    // newSM should be an object that has copies of meta's local properties
    var newSM = deepMerge({}, meta._locals);
    return scopedMeta(deepMerge(newSM, sm),
                      meta[segs[0]],
                      segs.slice(1));
  } else {
    return sm;
  }
}

function addListsMetadata(meta) {
  var lists = {};
  var listname;

  for (var o in meta) {
    if (meta[o]._locals && meta[o]._locals.list) {
      // hoist these lists up into the local variable 'lists'
      for (var ll in meta[o]._locals.list) {
        if (lists.hasOwnProperty(ll)) {
          lists[ll] = lists[ll].concat(meta[o]._locals.list[ll]);
        } else {
          lists[ll] = meta[o]._locals.list[ll];
        }
      }
    }

    if (meta[o]._locals && meta[o]._locals["in-list"]) {
      listname = meta[o]._locals["in-list"];

      if (lists.hasOwnProperty(listname)) {
        lists[listname].push(meta[o]._locals);
      } else {
        lists[listname] = [meta[o]._locals];
      }
    }
  }

  meta._locals.list = {};

  for (var k in lists) {
    if (lists.hasOwnProperty(k)) {
      sortByDate(lists[k]);
      meta._locals.list[k] = lists[k];
    }
  }

  return meta;
}

// Return the header information specified in the file
function readFileHeader(pathFilename) {
  var str = fs.readFileSync(pathFilename, 'utf8');
  var hb;
  
  try {
    hb = imbue.parse(str);
  } catch (e) {
    console.error(e.message);
    console.error("error parsing " + pathFilename);
    throw e;
  }

  var header = hb.header;

  // special case check for date declaration
  // convert these into Date objects
  if (header.date) {
    var d = header.date.split('-');
    header.date = new Date(d[0], d[1] - 1, d[2]);
  }

  return header;
}

function joinFolder(folder, f) {
  return folder === "" ? path.sep + f : path.join(folder, f);
}

function deriveMetadata(folder, f) {

  var basics = {};

  basics._filename = joinFolder(folder, f);
  basics._useImbue = useImbue(f);

  var ext = utils.pathExtension(f).toLowerCase();

  if (ext === 'imd') {
    // imd files will have their content parsed as Markdown
    basics._useMarkdown = true;
    basics._outFileExt = 'html';
  } else if (ext === 'less') {
    basics._useLess = true;
    basics._outFileExt = 'css';
  } else if ((ext === 'styl') || (ext === 'stylus')) {
    basics._useStylus = true;
    basics._outFileExt = 'css';
  } else {
    basics._outFileExt = utils.pathExtension(f);
  }

  basics.publishedFilename = utils.changeExtension(f, basics._outFileExt);

  if (hasDateInFilename(f)) {
    var r = dateInFilenameRE.exec(f);
    basics.date = new Date(r[1], r[2] - 1, r[3]);
    basics.title = sanitiseTitle(r[4]);
  } else if (f.split('.')[0] !== 'index') {
    // if the filename is just index.html or index.imd don't give
    // it the title of 'index'. It's better to use a title defined
    // in a higher level _vars file
    basics.title = sanitiseTitle(f);
  }

  basics.uri = fullUri(folder, basics.publishedFilename);

  return basics;
}

// **addFileMetadata**: add metadata about file *f* into *meta*
function addFileMetadata(base, folder, f) {

  var pathFilename = path.join(base, folder, f);

  var meta = {};
  meta._files = [];
  meta._directories = [];
  meta._locals = {};


  // *-vars* files are special, their metdata should
  // be added directly to *meta*
  if (f === '_vars') {
    var fh = readFileHeader(pathFilename);
    // the uri will be for the 'top-level' index.html of this folder
    fh.uri = folder + "/";
    meta._locals = fh;
  } else {

    var fileMeta = deriveMetadata(folder, f);

    if ((fileMeta._useLess) || (fileMeta._useStylus)) {
      fileMeta._directCopy = false;
    } else if (fileMeta._useImbue) {
      // look inside the file and merge any metadata
      fileMeta = deepMerge(readFileHeader(pathFilename), fileMeta);
      fileMeta._directCopy = false;
    } else {
      // if the files are binary just copy them directly
      // across without trying to read header information
      fileMeta._directCopy = true;
    }

    // always reference the site structure by using the published names
    meta[fileMeta.publishedFilename] = { _locals: fileMeta};

  }
  return meta;
}



function metaBuild(base, folder, f) {
  return new Promise((resolve, reject) => {
    var pathFilename = path.join(base, folder, f);
    var stats = fs.statSync(pathFilename);
    var meta = {};

    meta._files = [];
    meta._directories = [];
    meta._locals = {};

    if (stats.isFile()) {
      meta = addFileMetadata(base, folder, f);
      // todo: build a meta._files array of all non-'_vars' files
      return resolve(meta);
    } else if (stats.isDirectory()) {
      addDirectoryMetadata(base, folder, f).then(meta => {
        return resolve(meta);
      }).catch(reject);
    }
  });
}

// **buildMetadata**: builds a complete metadata structure
// for *folder*
function buildMetadata(base, folder) {

  return new Promise((resolve, reject) => {
    var meta = {};
    var stats;
    var pathFilename;

    meta._files = [];
    meta._directories = [];
    meta._locals = {};

    fs.readdir(path.join(base, folder), (err, files) => {
      if(err) {
        return reject(err);
      }
      var promises = files.sort().map(f => metaBuild(base, folder, f));
      Promise.all(promises).then(res => {
        res.reduce((a, b) => {
          return deepMerge(a, b);
        }, meta);
        return resolve(addListsMetadata(meta));
      });
    });
  });
}

function addPostsDirectoryMetadata(base, folder) {

  return new Promise((resolve, reject) => {
    var meta = {};

    meta._files = [];
    meta._directories = [];
    meta._locals = {};

    buildMetadata(base, joinFolder(folder, postsDirectory)).then(postsMeta => {
      var allContainDates;

      meta._locals.posts = [];
      allContainDates = true;

      // any file within the -posts directory that begins with an
      // underscore or the word 'draft' shouldn't be published
      var isPrivate = /^_/;
      var isDraft = /^draft/;

      for (var o in postsMeta) {
        if (isPrivate.test(o) === false && isDraft.test(o) === false) {
          // make the page findable by it's published path
          meta[o] = postsMeta[o];
          // also add the page to locals for iteration purposes
          var pageInfo = postsMeta[o]._locals;
          pageInfo.publishedFilename = o;
          meta._locals.posts.push(pageInfo);
          if (pageInfo.date === undefined) {
            allContainDates = false;
          }
        }
      }

      // the posts will be in alphabetical order, however if they
      // contain 'date' metadata order them by date, with the most
      // recent appearing first
      if (allContainDates === true) {
        sortByDate(meta._locals.posts);
      }

      resolve(meta);
    });
  });
}

// Add metadata about the given directory to the structure **s**
function addDirectoryMetadata(base, folder, f) {
  return new Promise((resolve, reject) => {
    var meta = {};
    meta._files = [];
    meta._directories = [];
    meta._locals = {};

    // don't traverse any of the folders in the blacklist
    if (blacklist.indexOf(f) > -1) {
      return resolve(meta);
    }

    if (f === postsDirectory) {
      addPostsDirectoryMetadata(base, folder).then(m => {
        return resolve(m);
      });
    } else {
      buildMetadata(base, joinFolder(folder, f)).then(m => {
        meta[f] = m;
        meta[f]._isDirectory = true;
        return resolve(meta);
      });
    }
  });
}

function isValidPath(meta, segs) {
  if (segs.length === 0) {
    return true;
  } else {
    if (meta[segs[0]]) {
      return isValidPath(meta[segs[0]], segs.slice(1));
    } else {
      return false;
    }
  }
}

function hasValidTemplate(scopedMeta) {
  var templates = scopedMeta._templates;
  if (templates === undefined) {
    return undefined;
  }
  return templates[scopedMeta.template];
}

function mergeTemplateMetadata(metadata) {

  var templates = metadata._templates;

  var fn = function (meta) {
    var templateName = meta.template;

    if (templateName && templates[templateName]) {
      return deepMerge(meta, fn(templates[templateName].header));
    } else {
      return meta;
    }
  };

  return fn(metadata);
}


// **fullBuild**: returning a metadata structure with
// information on every file contained within the
// *base* folder
exports.fullBuild = function (base) {
  // recursively build the metadata
  var meta = buildMetadata(base, '');
  // add template information to the top of the metadata
  meta._templates = template.build(path.join(base, template.folder));
  meta._base = base;
  meta._isDirectory = true;
  return meta;
};

// **fullBuild**: returning a metadata structure with
// information on every file contained within the
// *base* folder
exports.fullBuildPromise = function (base) {
  return new Promise((resolve, reject) => {

    var meta;

    buildMetadata(base, '').then(m => {
      meta = m;
      return template.buildPromise(path.join(base, template.folder));
    }).then(templates => {
      meta._templates = templates;
      meta._base = base;
      meta._isDirectory = true;
      return resolve(meta);
    }).catch(e => {
      reject(e);
    });

/*
    // recursively build the metadata
    var meta = buildMetadata(base, '');
    // add template information to the top of the metadata

    template.buildPromise(path.join(base, template.folder)).then(templates => {
      meta._templates = templates;
      meta._base = base;
      meta._isDirectory = true;
      return resolve(meta);
    });
 */

  });
};

// **scopedBuild**: generate a scoped metadata structure by
// traversing through *meta* with the given *uriPath*
exports.scopedBuild = function (meta, uriPath) {
  var segs = splitPath(uriPath);

  if (isValidPath(meta, segs) === false) {
    throw "invalid path: " + uriPath;
  }

  var newMeta = deepMerge({}, meta);
  newMeta.fn = fn.getFunctions();
  var scoped = scopedMeta(newMeta, meta, segs);


  return hasValidTemplate(scoped) ? mergeTemplateMetadata(scoped) : scoped;
};

// export a bunch of 'private' functions for testing purposes
exports._fn = {
  deriveMetadata: deriveMetadata,
//  useMarkdown: useMarkdown,
  hasDateInFilename: hasDateInFilename,
  sanitiseTitle: sanitiseTitle,
  fullUri: fullUri
};
