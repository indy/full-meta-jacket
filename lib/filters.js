/*!
 * full-meta-jacket
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

exports.publicFilters = function() {
  return { 
    olPartial: olPartial,
    ulPartial: ulPartial
  };
}

function ulPartial(arr, snippet) {
  return wrapPartial("ul", arr, snippet);
}


function olPartial(arr, snippet) {
  return wrapPartial("ol", arr, snippet);
}

// render each element in the array *arr* using the partial 
// named *snippet*, wrapping the combined results with *tag*
function wrapPartial(tag, arr, snippet) {
  var res;

  res = "<" + tag + ">\n";

  for(var i = 0;i<arr.length;i++) {
    res +=  imbue.render(imbue.mergeMeta(arr[i], {_useMarkdown: false}), 
                         partials[snippet]);
  }
  res += "</" + tag + ">\n";

  return res;
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
