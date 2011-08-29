var assert = require('assert');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');

// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.fullBuild('test/files/metadata');
//utils.writeMeta('../traverse-1-meta.js', m);



exports['number of files in a folder'] = function() {
  assert.eql(1, m._files.length);
  assert.eql(2, m.simple._files.length);
}

exports['number of subdirectories, ignoring layouts directory'] = function() {
  assert.eql(3, m._directories.length);
}

exports['mark all directories correctly'] = function() {
  assert.ok(m._isDirectory);
  assert.ok(m.journal._isDirectory);
  assert.ok(m.simple._isDirectory);

  assert.ok(!m['index.html']._isDirectory);
  assert.ok(!m.journal['a1.html']._isDirectory);
}

exports['implicit file metadata'] = function() {
  var j = m.journal;
  assert.eql("/journal/_posts/a1.imd", j['a1.html']._locals._filename);
  assert.eql("/journal/_posts/b2.imd", j['b2.html']._locals._filename);
  assert.eql("/journal/_posts/c3.imd", j['c3.html']._locals._filename);

  assert.eql("/index.html", m['index.html']._locals.uri);
  assert.eql("/simple/simple.png", m.simple['simple.png']._locals.uri);
  assert.eql("/journal/a1.html", j['a1.html']._locals.uri);
  assert.eql("/journal/b2.html", j['b2.html']._locals.uri);
  assert.eql("/journal/c3.html", j['c3.html']._locals.uri);
}

exports['explicit file metadata'] = function() {
  var j = m.journal;
  assert.eql(3, j['a1.html']._locals.names.length);
}

exports['top-level zonal metadata'] = function() {
  assert.eql("Catch-22", m._locals['book-title']);
}

exports['zonal metadata in a sub-directory'] = function() {
  assert.eql("A journal", m.journal._locals['journal-title']);
}

  // sub-directory posts
