var assert = require('assert');
var metadata = require('../lib/metadata');

exports['build metadata'] = function() {
  var m = metadata.build('test/files/traverse-1');

  // number of files in a folder
  assert.eql(3, m._files.length);
  assert.eql(1, m.foo._files.length);

  // number of subdirectories, ignoring the 'layouts' directory
  assert.eql(2, m._directories.length);

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
