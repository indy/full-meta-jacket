var assert = require('assert');
var m = require('../lib/metadata');

var folder = '/journal';
var filenameA = '2020-11-16-future-post.imd';
var filenameB = 'another-post.html';
var filenameC = 'another-post.imd';

exports['implicit_metadata.test.js'] = {

  'hadDateInFilename' : function(test) {
    test.expect(3);
    test.deepEqual(m._fn.hasDateInFilename(filenameA), true);
    test.deepEqual(m._fn.hasDateInFilename(filenameB), false);
    test.deepEqual(m._fn.hasDateInFilename(filenameC), false);
    test.done();
  },


  'sanitiseTitle' : function(test) {
    test.expect(3);
    test.deepEqual(m._fn.sanitiseTitle('hello-world'), 'hello world');
    test.deepEqual(m._fn.sanitiseTitle('hello-world.txt'), 'hello world');
    test.deepEqual(m._fn.sanitiseTitle('hello-hip--hop.txt'), 'hello hip-hop');
    test.done();
  },

  'fullUri' : function(test) {
    test.expect(2);
    test.deepEqual(m._fn.fullUri('/foo', 'bar.html'), '/foo/bar.html');
    test.deepEqual(m._fn.fullUri('/foo/_posts', 'bar.html'), '/foo/bar.html');
    test.done();
  },


  'derive metadata from filenames' : function(test) {
    var expectedA = { _useImbue: true,
                      _useMarkdown : true,
                      _outFileExt : 'html',
                      _filename : '/journal/2020-11-16-future-post.imd',
                      date : new Date(2020, 10, 16), // 16th November 2020
                      title: 'future post',
                      uri: '/journal/2020-11-16-future-post.html',
                      publishedFilename: '2020-11-16-future-post.html'
                    };

    var expectedB = {_useImbue: true,
                     _outFileExt : 'html',
                     _filename : '/journal/another-post.html',
                     title: 'another post',
                     uri: '/journal/another-post.html',
                     publishedFilename: 'another-post.html'
                    };

    var actualA = m._fn.deriveMetadata(folder, filenameA);
    var actualB = m._fn.deriveMetadata(folder, filenameB);

    test.expect(2);
    test.deepEqual(expectedA, actualA);
    test.deepEqual(expectedB, actualB);
    test.done();
  }

};



