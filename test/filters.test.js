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
