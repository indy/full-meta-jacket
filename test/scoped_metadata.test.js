var assert = require('assert');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');

// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.fullBuild('test/files/metadata');



exports['scopedBuild project/index.html'] = function() {
  metadata.scopedBuild(m, 'project/index.html', function(e, scoped) {
//    utils.writeMeta('../project-1-meta.js', scoped);
    assert.ifError(e);
    assert.equal(scoped.javascripts.length, 2);
  });
}

exports['scopedBuild index.html'] = function() {
  metadata.scopedBuild(m, '/index.html', function(e, scoped) {
    assert.ifError(e);
    assert.equal(scoped.email, "murmur@example.com");
    assert.equal(scoped._filename, "/index.imd");
    assert.equal(scoped.siteName, "FakeSite");
  });
}

exports['scopedBuild journal/a1.html'] = function() {
  metadata.scopedBuild(m, '/journal/a1.html', function(e, scoped) {
    assert.ifError(e);
    assert.equal(scoped.posts.length, 3);
    assert.equal(scoped['journal-title'], "A journal");

    assert.eql(scoped["date"], new Date(2011, 07, 16));
    assert.equal(scoped._filename, "/journal/_posts/a1.imd");
    assert.equal(scoped["publishedFilename"], "a1.html");
    assert.equal(scoped.names.length, 3);

    assert.equal(scoped.siteName, "FakeSite");
  });
}

exports['scopedBuild journal/c3.html'] = function() {
  metadata.scopedBuild(m, '/journal/c3.html', function(e, scoped) {
    assert.ifError(e);
    assert.equal(scoped.posts.length, 3);
    // shadowing the journal scope variable with a c3 specific one
    assert.equal(scoped['journal-title'], "custom title");

    assert.eql(scoped["date"], new Date(2011, 9, 16));
    assert.equal(scoped._filename, "/journal/_posts/c3.imd");
    assert.equal(scoped["publishedFilename"], "c3.html");
    assert.equal(scoped.names.length, 3);

    assert.equal(scoped.siteName, "FakeSite");
  });
}

exports['scopedBuild for simple content'] = function() {
  metadata.scopedBuild(m, '/simple/simple.html', function(e, scoped) {
    assert.ifError(e);
    assert.equal(scoped._filename, '/simple/simple.html');
  });

  metadata.scopedBuild(m, '/simple/simple.png', function(e, scoped) {
    assert.ifError(e);
    assert.equal(scoped._directCopy, true);
  });

}

exports['building scoped metadata'] = function() {

  var lm = {a: { _locals: {z: 1},
                 b: { _locals: {y: 2}}}};

  metadata.scopedBuild(lm, '/a/b/', function(e, scoped) {
    assert.ifError(e);
    assert.eql(scoped.z, 1);
    assert.eql(scoped.y, 2);
  });

  metadata.scopedBuild(lm, '/a/whoops/b/', function(e, scoped) {
    assert.notEqual(e, null);
  });

}

