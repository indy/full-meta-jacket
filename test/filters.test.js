var assert = require('assert');
var imbue = require('imbue');
var filters = require('../lib/filters');
var fs = require('fs');

function filterTest(filename) {
  var folder = "test/files/filters";

  filters.setup(folder);

  var useMarkdown = false;

  var input = fs.readFileSync("test/files/filters/" + filename, 'utf8');
  var hb = imbue.parse(input);
  var res = imbue.render(hb.header, hb.body, useMarkdown)

  var expected = fs.readFileSync("test/files/filters/" + filename + ".expected", 'utf8');

  assert.equal(res, expected);
}

exports['each with'] = function() {
  filterTest("each-with.imd");
}

exports['list with'] = function() {
  filterTest("list-with.imd");
}

exports['paste'] = function() {
  filterTest("paste.imd");
}

exports['setup should work in a minimal folder'] = function() {

  // use a non-existant folder since this won't contain 
  // either a _partials subfolder nor a _filters.js file
  var folder = "test/files/non-existant-folder";

  assert.doesNotThrow(function() {
    filters.setup(folder);
  });
}
