var assert = require('assert');
var site = require('../lib/site');
var fs = require('fs');

var prefix = 'test/files/';

exports['build metadata'] = function() {
  var m = site.buildMetadata('test/files/traverse-1');

  // number of files in a folder
  assert.eql(3, m._files.length);
  assert.eql(1, m.foo._files.length);
  // implicit file metadata
  assert.eql("a1", m.a1.filename);
  assert.eql("b2", m.b2.filename);
  assert.eql("c3", m.c3.filename);
  // implicit file metadata (in a sub-directory)
  assert.eql("d4", m.foo.d4.filename);

  // top-level zonal metadata
  assert.eql("Catch-22", m['book-title']);
  // zonal metadata in a sub-directory
  assert.eql("A journal", m.journal['journal-title']);

  // sub-directory posts

}

exports['eval file'] = function() {

  var meta = site.buildMetadata('test/files/eval-file');
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