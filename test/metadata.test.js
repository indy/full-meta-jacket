var assert = require('assert');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');

// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.fullBuild('test/files/traverse-1');
//utils.writeMeta('../traverse-1-meta.js', m);

exports['number of files in a folder'] = function() {
  assert.eql(3, m._files.length);
  assert.eql(1, m.foo._files.length);
}

exports['number of subdirectories, ignoring layouts directory'] = function() {
  assert.eql(2, m._directories.length);
}

exports['implicit file metadata'] = function() {
  assert.eql("a1", m.a1._locals.filename);
  assert.eql("b2", m.b2._locals.filename);
  assert.eql("c3", m.c3._locals.filename);
}

exports['explicit file metadata'] = function() {
  assert.eql(3, m.a1._locals.names.length);
}

exports['implicit file metadata (in a sub-directory)'] = function() {
  assert.eql("d4", m.foo.d4._locals.filename);
}

exports['top-level zonal metadata'] = function() {
  assert.eql("Catch-22", m._locals['book-title']);
}

exports['zonal metadata in a sub-directory'] = function() {
  assert.eql("A journal", m.journal._locals['journal-title']);
}

  // sub-directory posts
