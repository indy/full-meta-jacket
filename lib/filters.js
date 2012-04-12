/*!
 * full-meta-jacket: filters
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('imbue');

var utils = require('./utils');
var fs = require('fs');
var path = require('path');

var partials = {};

exports.setup = function(folder) {
  // load any partials that could be used by the filters
  var partialDirectory = utils.fileJoin(folder, '_partials');
  if(path.existsSync(partialDirectory)) {
    partials = loadPartials(partialDirectory);
  }

  // add fmj specific filters to imbue  
  imbue.addFilters(fmjFilters);

  // add site specific filters
  var siteFiltersFile = utils.fileJoin(process.cwd(), folder, '_filters.js');
  var specific;
  if(path.existsSync(siteFiltersFile)) {
    specific = require(siteFiltersFile);
    imbue.addFilters(specific);
  }
}

var fmjFilters = { 
  eachWith: function(arr, snip) {
    return renderPartials(arr, snip);
  },
  listWith: function(arr, snip) {
    return wrapTag("ul", renderPartials(arr, snip));
  },
  paste: function(snip) {
    return partials[snip];
  }
};

// render each element in the array *arr* using the partial 
// named *snippet*
function renderPartials(arr, snippet) {
  if(partials[snippet] === undefined) {
    throw "Error: unknown partial: " + snippet;
  }
  return arr.reduce(function(res, e) {
    return res += imbue.render(e, partials[snippet], false);
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
