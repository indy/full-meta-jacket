var assert = require('assert');
var site = require('../lib/site');
var metadata = require('../lib/metadata');
var fs = require('fs');


exports['published date'] = function() {

  // 3 of the 4 posts in test/files/published_date have a 'published_date'
  // attribute. This tests to make sure they're copied into a published
  // object and ordered correctly

  var meta = metadata.build('test/files/published_date');
  assert.equal(meta.journal._posts._published.length, 3);

  var expectedDates = ["2011-08-16", "2011-09-16", "2011-10-16"];
  var published = meta.journal._posts._published;
  for(var i=0;i<expectedDates.length;i++){
    assert.equal(published[i].page.published_date, expectedDates[i]);
  }

}
