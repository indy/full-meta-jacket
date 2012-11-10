var assert = require('assert');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');

// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.fullBuild('test/files/metadata');
// utils.writeMeta('../traverse-1-meta.js', m);


exports['metadata.test.js'] = {
  'number of files in a folder' : function(test) {
    test.deepEqual(1, m._files.length);
    test.deepEqual(2, m.simple._files.length);
    test.done();
  },

  'number of subdirectories, ignoring layouts directory' : function(test) {
    test.deepEqual(6, m._directories.length);
    test.done();
  },

  'mark all directories correctly' : function(test) {
    test.ok(m._isDirectory);
    test.ok(m.journal._isDirectory);
    test.ok(m.simple._isDirectory);

    test.ok(!m['index.html']._isDirectory);
    test.ok(!m.journal['a1.html']._isDirectory);
    test.done();
  },

  'implicit file metadata' : function(test) {
    var j = m.journal;
    test.deepEqual("/journal/_posts/a1.imd", j['a1.html']._locals._filename);
    test.deepEqual("/journal/_posts/b2.imd", j['b2.html']._locals._filename);
    test.deepEqual("/journal/_posts/c3.imd", j['c3.html']._locals._filename);

    test.deepEqual("/index.html", m['index.html']._locals.uri);
    test.deepEqual("/simple/simple.png", m.simple['simple.png']._locals.uri);
    test.deepEqual("/journal/a1.html", j['a1.html']._locals.uri);
    test.deepEqual("/journal/b2.html", j['b2.html']._locals.uri);
    test.deepEqual("/journal/c3.html", j['c3.html']._locals.uri);
    test.done();
  },

  'explicit file metadata' : function(test) {
    var j = m.journal;
    test.deepEqual(3, j['a1.html']._locals.names.length);
    test.done();
  },

  'top-level zonal metadata' : function(test) {
    test.deepEqual("Catch-22", m._locals['book-title']);
    test.done();
  },

  'zonal metadata in a sub-directory' : function(test) {
    test.deepEqual("A journal", m.journal._locals['journal-title']);
    test.done();
  },

  'less files correctly marked as css' : function(test) {
    var lessCSS = m.css["style.css"]._locals;

    // some metadata attributes related to css rendering
    var expected = {"_filename": "/css/style.less",
                    "_useImbue": false,
                    "_outFileExt": "css",
                    "_useLess": true,
                    "publishedFilename": "style.css",
                    "uri": "/css/style.css",
                    "_directCopy": false,
                    "title": "style"};

    test.expect(expected.length);
    for(var i in expected) {
      test.deepEqual(expected[i], lessCSS[i]);
    }
    test.done();
  },

  'stylus files correctly marked as css' : function(test) {
    var stylusCSS = m.css["design.css"]._locals;

    // some metadata attributes related to css rendering
    var expected = {"_filename": "/css/design.stylus",
                    "_useImbue": false,
                    "_outFileExt": "css",
                    "_useStylus": true,
                    "publishedFilename": "design.css",
                    "uri": "/css/design.css",
                    "_directCopy": false};

    test.expect(expected.length);
    for(var i in expected) {
      test.deepEqual(expected[i], stylusCSS[i]);
    }
    test.done();
  },


  'posts metadata' : function(test) {
    var postsMeta = m['journal']['_locals']['posts'];

    test.equal(postsMeta.length, 3);
    test.done();
  },

  'local variables in file' : function(test) {
    test.equal("murmur@example.com", m['index.html']._locals.email);
    test.done();
  },


  'metadata structured around served content' : function(test) {
    test.ok(m['index.html']);

    // also check that posts are in the right place
    test.ok(m['journal']['a1.html']);
    test.ok(m['journal']['b2.html']);
    test.ok(m['journal']['c3.html']);
    test.done();
  }

};
