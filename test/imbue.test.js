var temp = require('temp');
var path = require('path');
var site = require('../lib/site');

var assert = require("assert");
var imbue = require("../lib/imbue");
var utils = require("../lib/utils");
var fs = require("fs");

var prefix = "test/files/imbue/";
var postfix = ".expected";

// rather than this simple file comparison it would be better to
// parse the resultant html and do a DOM compare

function dbgOutput(fn, data, filename) {
  var input = fs.readFileSync(prefix + filename, "utf8");
  console.log(fn(input, data));
}

function compare(filename, data) {
  var input = fs.readFileSync(prefix + filename, "utf8");
  var expected = fs.readFileSync(prefix + filename + postfix, "utf8");

  var hb = imbue.parse(input);
  hb.header._filename = filename;
  var res = imbue.render(utils.deepMerge(hb.header, data),
                         hb.body); // use markdown was here


  assert.equal(res.trim(), expected.trim());
}

exports["a simple imbue file with no header information"] = function() {
  compare("jaded1.imd", {});
};

exports["an imbue file with a layout"] = function() {
  compare("with-layout.imd", {
    // set the path so that it"s treated as though it"s in the same
    // directory as the processed jade files
    _jade_filename: "test/files/imbue/jade/with-layout.imd"});
};

exports["an imbue file with a nested layout"] = function() {
  compare("with-nested-layout.imd", {
    _jade_filename: "test/files/imbue/jade/with-nested-layout.imd"
  });
};


