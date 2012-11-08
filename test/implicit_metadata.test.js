var assert = require('assert');
var m = require('../lib/metadata');


var folder = '/journal';
var filenameA = '2020-11-16-future-post.imd';
var filenameB = 'another-post.html';
var filenameC = 'another-post.imd';


exports['hadDateInFilename'] = function() {
  assert.eql(m._fn.hasDateInFilename(filenameA), true);
  assert.eql(m._fn.hasDateInFilename(filenameB), false);
  assert.eql(m._fn.hasDateInFilename(filenameC), false);
};


exports['sanitiseTitle'] = function() {
  assert.eql(m._fn.sanitiseTitle('hello-world'), 'hello world');
  assert.eql(m._fn.sanitiseTitle('hello-world.txt'), 'hello world');
  assert.eql(m._fn.sanitiseTitle('hello-hip--hop.txt'), 'hello hip-hop');
};

exports['fullUri'] = function() {
  assert.eql(m._fn.fullUri('/foo', 'bar.html'), '/foo/bar.html');
  assert.eql(m._fn.fullUri('/foo/_posts', 'bar.html'), '/foo/bar.html');
};


exports['derive metadata from filenames'] = function() {

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

  assert.deepEqual(expectedA, actualA);
  assert.deepEqual(expectedB, actualB);
};

