const expect = require("chai").expect;

const m = require('../lib/metadata');

const filenameA = '2020-11-16-future-post.html';
const filenameB = 'another-post.html';
const filenameC = 'another-post.jade';

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
    const expectedA = { _useImbue: true,
                        _outFileExt: 'html',
                        _filename: '/journal/2020-11-16-future-post.html',
                        date: new Date(2020, 10, 16), // 16th November 2020
                        title: 'future post',
                        uri: '/journal/2020-11-16-future-post.html',
                        publishedFilename: '2020-11-16-future-post.html'
                      };

    const expectedB = {_useImbue: true,
                       _outFileExt: 'html',
                       _filename: '/journal/another-post.jade',
                       title: 'another post',
                       uri: '/journal/another-post.html',
                       publishedFilename: 'another-post.html'
                      };

    const folder = '/journal';
    const actualA = m._fn.deriveMetadata(folder, filenameA);
    const actualB = m._fn.deriveMetadata(folder, filenameC);

    expect(expectedA).to.deep.equal(actualA);
    expect(expectedB).to.deep.equal(actualB);
  });
});
