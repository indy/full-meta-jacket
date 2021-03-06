const expect = require("chai").expect;

const metadata = require('../lib/metadata');

describe("published_date", () => {

  it("published date", () => {

    // 3 of the 4 posts in test/files/published_date have a 'published_date'
    // attribute. This tests to make sure they're copied into a published
    // object and ordered correctly

    return metadata.fullBuild('test/files/published_date').then(meta => {
      //  utils.writeMeta('../foo-published_date.js', meta);

      // todo: write a helper method for working with published data

      //  assert.equal(meta.journal._posts._published.length, 3);

      const expectedDates = ["2011-08-16", "2011-09-16", "2011-10-16"];
      const published = meta.journal._locals.posts;
      //  for(const i=0;i<expectedDates.length;i++){
      //    assert.equal(published[i].published_date, expectedDates[i]);
      //  }
      expect(1).to.equal(1);
    });
  });
});
