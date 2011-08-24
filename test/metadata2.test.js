var assert = require('assert');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');


// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.fullBuild('test/files/traverse-2');
utils.writeMeta('../new-meta.js', m);

exports['scopedBuild index.html'] = function() {
  var scoped = metadata.scopedBuild(m, '/index.html');
  assert.eql(scoped.email, "murmur@example.com");
  assert.eql(scoped.filename, "index.imd");
  assert.eql(scoped.siteName, "FakeSite");
}

exports['scopedBuild journal/a1.html'] = function() {
  var scoped = metadata.scopedBuild(m, '/journal/a1.html');

  assert.eql(scoped.posts.length, 3);
  assert.eql(scoped['journal-title'], "A journal");

  assert.eql(scoped["published_date"], "2011-08-16");
  assert.eql(scoped["filename"], "a1.imd");
  assert.eql(scoped["publishedFilename"], "a1.html");
  assert.eql(scoped.names.length, 3);

  assert.eql(scoped.siteName, "FakeSite");
}

exports['scopedBuild journal/c3.html'] = function() {
  var scoped = metadata.scopedBuild(m, '/journal/c3.html');

  assert.eql(scoped.posts.length, 3);
  // shadowing the journal scope variable with a c3 specific one
  assert.eql(scoped['journal-title'], "custom title");

  assert.eql(scoped["published_date"], "2011-10-16");
  assert.eql(scoped["filename"], "c3.imd");
  assert.eql(scoped["publishedFilename"], "c3.html");
  assert.eql(scoped.names.length, 3);

  assert.eql(scoped.siteName, "FakeSite");
}

exports['scopedBuild for simple content'] = function() {
  var scoped = metadata.scopedBuild(m, '/simple/simple.html');
  assert.eql(scoped['filename'], 'simple.html');

  scoped = metadata.scopedBuild(m, '/simple/simple.png');
  assert.eql(scoped['_directCopy'], true);
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

  assert.eql(postsMeta.length, 3);
}

// note: filters that iterate through posts will need to check published_date


exports['local variables in file'] = function() {
  assert.eql("murmur@example.com", m['index.html']._locals.email);
}

