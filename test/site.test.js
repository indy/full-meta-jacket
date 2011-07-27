var assert = require('assert');
var site = require('../lib/site');
var metadata = require('../lib/metadata');
var fs = require('fs');

var prefix = 'test/files/';

exports['eval file'] = function() {

  var meta = metadata.build('test/files/eval-file');
  var res = site.evalFile(meta, 'test/files/eval-file/a1');
//  console.log(meta);
//  console.log(res);
  var expected = fs.readFileSync('test/files/eval-file-expected/a1', 'utf8');
  assert.equal(res, expected);
}

/*
exports['layout file'] = function() {

  var meta = site.buildMetadata('test/files/layout-file');
  var res = site.evalFile(meta, 'test/files/layout-file/a1');
  // var layout = site.layoutForFile('test/files/layout-file/a1');
  site.layout(layout, res);
  var expected = fs.readFileSync('test/files/layout-file-expected/a1', 'utf8');
//  assert.equal(res, expected);
}
  */



/*
  3 stages are:
    build metadata
    eval file using metadata
    layout file
 */