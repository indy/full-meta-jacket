/*!
 * full-meta-jacket: page
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */


// page renders the requested metadata+path combo and returns the result as a string 

var fs = require('fs');
var imbue = require('imbue');
var less = require('less');

var utils = require('./utils');
var layout = require('./layout');
var metadata = require('./metadata');


exports.render = function(meta, uriPath, callback) {

  return render(meta, uriPath, callback);

}

function render(meta, uriPath, callback) {

  // build up a metadata structure for *uriPath*
  // containing the appropriate local variables
  metadata.scopedBuild(meta, uriPath, function(e, scopedMeta) {

    if(e) {
      callback(e);
      return;
    }

    // also provide a reference to the full metadata
    scopedMeta._fullMeta = meta;

    var pathFilename = meta._base + scopedMeta._filename;

    if(scopedMeta._directCopy) {
      fs.readFile(pathFilename, function(err, data) {
        if(err) {
          console.error("direct copy of " + pathFilename + " failed");
          callback(err);
        } else {
          callback(null, data);
        }
      });
    } else {
      evalFile(pathFilename, scopedMeta, callback);
    }

  });

}

function evalFile(pathFilename, scopedMeta, callback) {
  fs.readFile(pathFilename, 'utf8', function(e, data) {
    if(e) {
      console.error("reading " + pathFilename + " failed");
      callback(e);
    } else {
      if(scopedMeta._useLess) {
        evalLessContent(scopedMeta._fullMeta._base, data, callback);
      } else if(scopedMeta._useImbue) {
        evalImbueContent(scopedMeta, data, callback);
      } else {
        console.error('unknown action for ' + pathFilename);
      }
    }
  });
}


function evalLessContent(additional_path, content, callback) {
  var parser = new(less.Parser)({
    paths: ['.', additional_path], // search paths for @import directives
  });

  parser.parse(content, function (e, root) {
    if(e) {
      console.error("less rendering failed");
      callback(e);
    } else {
      callback(e, root.toCSS({}));
    }
  });
}

function evalImbueContent(scopedMeta, content, callback) {
  var hb;

  try {
    hb = imbue.parse(content);
  } catch(e) {
    console.error(e.message);
    console.error("error eval'ing imbue content");
    throw e;
  }

  var res;

  if(hb.imbued === false) {
    // not an imbue file, just return the contents
    res = content;
  } else {
    res = renderImbueContent(hb, scopedMeta);
  }

  callback(null, res.trim());
}

function renderImbueContent(hb, scopedMeta) {

  var res;
  var validLayout = hasValidLayout(scopedMeta);

  if(validLayout) {
    // merge the metadata of all the nested layouts
    scopedMeta = layout.mergeMetadata(scopedMeta);
  } 

  res = imbue.render(scopedMeta, hb.body, scopedMeta._useMarkdown);

  if(validLayout) {
    scopedMeta.content = res;

    var fullMeta = scopedMeta._fullMeta;
    var header = hb.header;
    var body = hb.body;

    // go up the layout chain, expanding the ejs
    do {
      var lay = fullMeta._layouts[header.layout];
      header = lay.header;
      body = lay.body;
      // layouts can't be defined with markdown
      scopedMeta.content = imbue.render(scopedMeta, body, false);
    } while(header.layout && fullMeta._layouts[header.layout])
    
    res = scopedMeta.content;
  }

  return res;
}

function hasValidLayout(scopedMeta) {
  var layouts = scopedMeta._fullMeta._layouts;
  return layouts[scopedMeta.layout];
}
