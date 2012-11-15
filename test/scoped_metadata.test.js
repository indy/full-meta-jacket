var assert = require('assert');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');

// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.fullBuild('test/files/metadata');

exports['scoped_metadata.test.js'] = {

  'beatle value from file header' : function (test) {
    var scoped = metadata.scopedBuild(m, 'beatles-a/index.html');
    test.equal(scoped.javascripts.length, 2);
    test.equal(scoped.beatle, "ringo");
    test.done();
  },

  'beatle value from template header' : function (test) {
    var scoped = metadata.scopedBuild(m, 'beatles-a/index2.html');
    test.equal(scoped.javascripts.length, 5);
    test.equal(scoped.beatle, "george");
    test.done();
  },

  'beatle value from _vars' : function (test) {
    var scoped = metadata.scopedBuild(m, 'beatles-b/index3.html');
    test.equal(scoped.javascripts.length, 5);
    test.equal(scoped.beatle, "john");
    test.done();
  },

  'scopedBuild index.html' : function (test) {
    var scoped = metadata.scopedBuild(m, '/index.html');
    test.equal(scoped.email, "murmur@example.com");
    test.equal(scoped._filename, "/index.imd");
    test.equal(scoped.siteName, "FakeSite");
    test.done();
  },

  'scopedBuild journal/a1.html' : function (test) {
    var scoped = metadata.scopedBuild(m, '/journal/a1.html');
    test.equal(scoped.posts.length, 3);
    test.equal(scoped['journal-title'], "A journal");

    test.deepEqual(scoped.date, new Date(2011, 7, 16));
    test.equal(scoped._filename, "/journal/_posts/a1.imd");
    test.equal(scoped.publishedFilename, "a1.html");
    test.equal(scoped.names.length, 3);

    test.equal(scoped.siteName, "FakeSite");

    test.done();
  },

  'scopedBuild journal/c3.html' : function (test) {
    var scoped = metadata.scopedBuild(m, '/journal/c3.html');
    test.equal(scoped.posts.length, 3);
    // shadowing the journal scope variable with a c3 specific one
    test.equal(scoped['journal-title'], "custom title");

    test.deepEqual(scoped.date, new Date(2011, 9, 16));
    test.equal(scoped._filename, "/journal/_posts/c3.imd");
    test.equal(scoped.publishedFilename, "c3.html");
    test.equal(scoped.names.length, 3);

    test.equal(scoped.siteName, "FakeSite");

    test.done();
  },

  'scopedBuild for simple content' : function (test) {
    var scoped = metadata.scopedBuild(m, '/simple/simple.html');
    test.equal(scoped._filename, '/simple/simple.html');

    scoped = metadata.scopedBuild(m, '/simple/simple.png');
    test.equal(scoped._directCopy, true);

    test.done();
  },

  'building scoped metadata' : function (test) {

    var lm = {a: { _locals: {z: 1},
                   b: { _locals: {y: 2}}}};

    var scoped = metadata.scopedBuild(lm, '/a/b/');
    test.deepEqual(scoped.z, 1);
    test.deepEqual(scoped.y, 2);

//    scoped = metadata.scopedBuild(lm, '/a/whoops/b/');
//    test.notEqual(e, null);
    test.done();
  }
};

