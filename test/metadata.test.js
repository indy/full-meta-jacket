const expect = require("chai").expect;

const metadata = require('../lib/metadata');
const utils = require('../lib/utils');

// load metadata for one heirarchy and test multiple aspects from it
const m = metadata.fullBuild('test/files/metadata');
// utils.writeMeta('../traverse-1-meta.js', m);


describe('metadata.test.js', function() {
/*
  it('number of files in a folder', () => {
    expect(m._files.length).to.equal(1);
    expect(m.simple._files.length).to.equal(2);
  });

  it('number of subdirectories, ignoring layouts directory', () => {
    expect(m._directories.length).to.equal(6);
  });

  it('mark all directories correctly', () => {
    expect(m._isDirectory).to.be.true;
    expect(m.journal._isDirectory).to.be.true;
    expect(m.simple._isDirectory).to.be.true;

    expect(m['index.html']._isDirectory).to.not.be.true;
    expect(m.journal['a1.html']._isDirectory).to.not.be.true;
  });

  it('implicit file metadata', () => {
    const j = m.journal;
    expect(j['a1.html']._locals._filename).to.equal("/journal/_posts/a1.imd");
    expect(j['b2.html']._locals._filename).to.equal("/journal/_posts/b2.imd");
    expect(j['c3.html']._locals._filename).to.equal("/journal/_posts/c3.imd");


    expect(m['index.html']._locals.uri).to.equal("/index.html");
    expect(m.simple['simple.png']._locals.uri).to.equal("/simple/simple.png");

    expect(j['a1.html']._locals.uri).to.equal("/journal/a1.html");
    expect(j['b2.html']._locals.uri).to.equal("/journal/b2.html");
    expect(j['c3.html']._locals.uri).to.equal("/journal/c3.html");
  });

  it('explicit file metadata', () => {
    const j = m.journal;
    expect(j['a1.html']._locals.names.length).to.equal(3);
  });

  it('top-level zonal metadata', () => {
    expect(m._locals['book-title']).to.equal("Catch-22");
  });

  it('zonal metadata in a sub-directory', () => {
    expect(m.journal._locals['journal-title']).to.equal("A journal");
  });

  it('less files correctly marked as css', () => {
    const lessCSS = m.css["style.css"]._locals;

    // some metadata attributes related to css rendering
    const expected = {"_filename": "/css/style.less",
                    "_useImbue": false,
                    "_outFileExt": "css",
                    "_useLess": true,
                    "publishedFilename": "style.css",
                    "uri": "/css/style.css",
                    "_directCopy": false,
                    "title": "style"};

    for (var i in expected) {
      expect(lessCSS[i]).to.equal(expected[i]);
    }
  });


  it('stylus files correctly marked as css', () => {
    const stylusCSS = m.css["design.css"]._locals;

    // some metadata attributes related to css rendering
    const expected = {"_filename": "/css/design.stylus",
                    "_useImbue": false,
                    "_outFileExt": "css",
                    "_useStylus": true,
                    "publishedFilename": "design.css",
                    "uri": "/css/design.css",
                    "_directCopy": false};

    for (var i in expected) {
      expect(stylusCSS[i]).to.equal(expected[i]);
    }
  });


  it('posts metadata', () => {
    const postsMeta = m.journal._locals.posts;

    expect(postsMeta.length).to.equal(3);
  });

  it('local variables in file', () => {
    expect(m['index.html']._locals.email).to.equal("murmur@example.com");
  });

  it('metadata structured around served content', () => {
    expect(m['index.html']).to.be.ok;

    // also check that posts are in the right place
    expect(m.journal['a1.html']).to.be.ok;
    expect(m.journal['b2.html']).to.be.ok;
    expect(m.journal['c3.html']).to.be.ok;
  });
*/
});
