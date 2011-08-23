var assert = require('assert');
var site = require('../lib/site');
var metadata = require('../lib/metadata');
var fs = require('fs');

function writeMeta(filename, meta) {
  fs.writeFileSync(filename, JSON.stringify(meta, null, 4));
}


exports['published date'] = function() {

  // 3 of the 4 posts in test/files/published_date have a 'published_date'
  // attribute. This tests to make sure they're copied into a published
  // object and ordered correctly

  var meta = metadata.fullBuild('test/files/published_date');

  writeMeta("/Users/indy/mem/meta.js", meta);

  assert.equal(meta.journal._posts._published.length, 3);

  var expectedDates = ["2011-08-16", "2011-09-16", "2011-10-16"];
  var published = meta.journal._posts._published;
  for(var i=0;i<expectedDates.length;i++){
    assert.equal(published[i].published_date, expectedDates[i]);
  }

}
