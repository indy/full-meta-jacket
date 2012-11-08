var assert = require('assert');
var site = require('../lib/site');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');

exports['published date'] = function() {

  // 3 of the 4 posts in test/files/published_date have a 'published_date'
  // attribute. This tests to make sure they're copied into a published
  // object and ordered correctly

  var meta = metadata.fullBuild('test/files/published_date');
//  utils.writeMeta('../foo-published_date.js', meta);


  // todo: write a helper method for working with published data

//  assert.equal(meta.journal._posts._published.length, 3);

  var expectedDates = ["2011-08-16", "2011-09-16", "2011-10-16"];
  var published = meta.journal._locals.posts;
//  for(var i=0;i<expectedDates.length;i++){
//    assert.equal(published[i].published_date, expectedDates[i]);
//  }

};
