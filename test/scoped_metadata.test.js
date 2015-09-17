const expect = require("chai").expect;

const metadata = require('../lib/metadata');
const utils = require('../lib/utils');

// load metadata for one heirarchy and test multiple aspects from it
metadata.fullBuild('test/files/metadata').then(m => {

  describe("scoped_metadata", function() {

    it('beatle value from file header', () => {
      const scoped = metadata.scopedBuild(m, 'beatles-a/index.html');
      expect(scoped.javascripts.length).to.equal(2);
      expect(scoped.beatle).to.equal("ringo");
    });

    it('beatle value from template header', () => {
      const scoped = metadata.scopedBuild(m, 'beatles-a/index2.html');
      expect(scoped.javascripts.length).to.equal(5);
      expect(scoped.beatle).to.equal("george");
    });

    it('beatle value from _vars', () => {
      const scoped = metadata.scopedBuild(m, 'beatles-b/index3.html');
      expect(scoped.javascripts.length).to.equal(5);
      expect(scoped.beatle).to.equal("john");
    });

    it('scopedBuild index.html', () => {
      const scoped = metadata.scopedBuild(m, '/index.html');
      expect(scoped.email).to.equal("murmur@example.com");
      expect(scoped._filename).to.equal("/index.imd");
      expect(scoped.siteName).to.equal("FakeSite");
    });

    it('scopedBuild journal/a1.html', () => {
      const scoped = metadata.scopedBuild(m, '/journal/a1.html');
      expect(scoped.posts.length).to.equal(3);
      expect(scoped['journal-title']).to.equal("A journal");

      expect(scoped.date).to.deep.equal(new Date(2011, 7, 16));
      expect(scoped._filename).to.equal("/journal/_posts/a1.imd");
      expect(scoped.publishedFilename).to.equal("a1.html");
      expect(scoped.names.length).to.equal(3);

      expect(scoped.siteName).to.equal("FakeSite");
    });

    it('scopedBuild journal/c3.html', () => {
      const scoped = metadata.scopedBuild(m, '/journal/c3.html');
      expect(scoped.posts.length).to.equal(3);
      // shadowing the journal scope variable with a c3 specific one
      expect(scoped['journal-title']).to.equal("custom title");

      expect(scoped.date).to.deep.equal(new Date(2011, 9, 16));
      expect(scoped._filename).to.equal("/journal/_posts/c3.imd");
      expect(scoped.publishedFilename).to.equal("c3.html");
      expect(scoped.names.length).to.equal(3);

      expect(scoped.siteName).to.equal("FakeSite");
    });

    it('scopedBuild for simple content', () => {
      const scoped = metadata.scopedBuild(m, '/simple/simple.html');
      expect(scoped._filename).to.equal('/simple/simple.html');

      const scoped2 = metadata.scopedBuild(m, '/simple/simple.png');
      expect(scoped2._directCopy).to.be.true;
    });

    it('building scoped metadata', () => {

      const lm = {a: { _locals: {z: 1},
                       b: { _locals: {y: 2}}}};

      const scoped = metadata.scopedBuild(lm, '/a/b/');
      expect(scoped.z).to.equal(1);
      expect(scoped.y).to.equal(2);

      //    scoped = metadata.scopedBuild(lm, '/a/whoops/b/');
      //    test.notEqual(e, null);
    });
  });
});
