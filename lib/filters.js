/*!
 * full-meta-jacket: filters
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');

var utils = require('./utils');
var fs = require('fs');

var partials = {};

exports.setup = function(folder) {
  var directory = utils.fileJoin(folder, '_partials');
  // todo: check that folder exists
  partials = loadPartials(directory);
}

exports.publicFilters = { 
  olPartial: function(arr, snip) {
    return wrapTag("ol", renderPartials(arr, snip));
  },
  ulPartial: function(arr, snip) {
    return wrapTag("ul", renderPartials(arr, snip));
  }
};

// render each element in the array *arr* using the partial 
// named *snippet*
function renderPartials(arr, snippet) {
  return arr.reduce(function(res, e) {
    return res += imbue.render(imbue.mergeMeta({_useMarkdown: false}, e), 
                               partials[snippet]);
  }, "");
}

function wrapTag(tag, content) {
  return "<" + tag + ">" + content + "</" + tag + ">\n";
}

function loadPartials(folder) {

  var res = {};
  var key = "";
  var pathfilename;

  utils.eachFile(folder, function(f) {
    key = f.split('.')[0];
    pathfilename = utils.fileJoin(folder, f);
    res[key] = fs.readFileSync(pathfilename, 'utf8');;
  });

  return res;
}
