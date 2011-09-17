var assert = require('assert');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');

// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.fullBuild('test/files/metadata');

exports['scopedBuild index.html'] = function() {
  var scoped = metadata.scopedBuild(m, '/index.html');
  assert.equal(scoped.email, "murmur@example.com");
  assert.equal(scoped._filename, "/index.imd");
  assert.equal(scoped.siteName, "FakeSite");
}

exports['scopedBuild journal/a1.html'] = function() {
  var scoped = metadata.scopedBuild(m, '/journal/a1.html');

  assert.equal(scoped.posts.length, 3);
  assert.equal(scoped['journal-title'], "A journal");

  assert.eql(scoped["date"], new Date(2011, 07, 16));
  assert.equal(scoped._filename, "/journal/_posts/a1.imd");
  assert.equal(scoped["publishedFilename"], "a1.html");
  assert.equal(scoped.names.length, 3);

  assert.equal(scoped.siteName, "FakeSite");
}

exports['scopedBuild journal/c3.html'] = function() {
  var scoped = metadata.scopedBuild(m, '/journal/c3.html');

  assert.equal(scoped.posts.length, 3);
  // shadowing the journal scope variable with a c3 specific one
  assert.equal(scoped['journal-title'], "custom title");

  assert.eql(scoped["date"], new Date(2011, 9, 16));
  assert.equal(scoped._filename, "/journal/_posts/c3.imd");
  assert.equal(scoped["publishedFilename"], "c3.html");
  assert.equal(scoped.names.length, 3);

  assert.equal(scoped.siteName, "FakeSite");
}

exports['scopedBuild for simple content'] = function() {
  var scoped = metadata.scopedBuild(m, '/simple/simple.html');
  assert.equal(scoped._filename, '/simple/simple.html');

  scoped = metadata.scopedBuild(m, '/simple/simple.png');
  assert.equal(scoped._directCopy, true);
}

exports['metadata structured around served content'] = function() {
  assert.ok(m['index.html']);

  // also check that posts are in the right place
  assert.ok(m['journal']['a1.html']);
  assert.ok(m['journal']['b2.html']);
  assert.ok(m['journal']['c3.html']);
}

exports['posts metadata'] = function() {
  var postsMeta = m['journal']['_locals']['posts'];

  assert.equal(postsMeta.length, 3);
}

exports['local variables in file'] = function() {
  assert.equal("murmur@example.com", m['index.html']._locals.email);
}

