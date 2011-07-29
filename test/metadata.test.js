var assert = require('assert');
var metadata = require('../lib/metadata');


// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.build('test/files/traverse-1');


exports['number of files in a folder'] = function() {
  assert.eql(3, m._files.length);
  assert.eql(1, m.foo._files.length);
}

exports['number of subdirectories, ignoring layouts directory'] = function() {
  assert.eql(2, m._directories.length);
}

exports['implicit file metadata'] = function() {
  assert.eql("a1", m.a1.filename);
  assert.eql("b2", m.b2.filename);
  assert.eql("c3", m.c3.filename);
}

exports['implicit file metadata (in a sub-directory)'] = function() {
  assert.eql("d4", m.foo.d4.filename);
}

exports['top-level zonal metadata'] = function() {
  assert.eql("Catch-22", m['book-title']);
}

exports['zonal metadata in a sub-directory'] = function() {
  assert.eql("A journal", m.journal['journal-title']);
}

  // sub-directory posts
