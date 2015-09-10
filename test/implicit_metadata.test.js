var expect = require("chai").expect;

var m = require('../lib/metadata');

var folder = '/journal';
var filenameA = '2020-11-16-future-post.imd';
var filenameB = 'another-post.html';
var filenameC = 'another-post.imd';

describe("implicit_metadata", function() {

  it('hadDateInFilename', () => {
    expect(m._fn.hasDateInFilename(filenameA)).to.be.true;
    expect(m._fn.hasDateInFilename(filenameB)).to.not.be.true;
    expect(m._fn.hasDateInFilename(filenameC)).to.not.be.true;
  });


  it('sanitiseTitle', () => {
    expect(m._fn.sanitiseTitle('hello-world')).to.equal('hello world');
    expect(m._fn.sanitiseTitle('hello-world.txt')).to.equal('hello world');
    expect(m._fn.sanitiseTitle('hello-hip--hop.txt')).to.equal('hello hip-hop');
  });

  it('fullUri', () => {
    expect(m._fn.fullUri('/foo', 'bar.html')).to.equal('/foo/bar.html');
    expect(m._fn.fullUri('/foo/_posts', 'bar.html')).to.equal('/foo/bar.html');
  });


  it('derive metadata from filenames', () => {
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

    expect(expectedA).to.deep.equal(actualA);
    expect(expectedB).to.deep.equal(actualB);
  });
});
