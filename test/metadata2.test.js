var assert = require('assert');
var metadata = require('../lib/metadata');
var utils = require('../lib/utils');


// load metadata for one heirarchy and test multiple aspects from it
var m = metadata.fullBuild('test/files/traverse-2');
utils.writeMeta('../new-meta.js', m);


exports['metadata structured around served content'] = function() {
  assert.ok(m['index.html']);

  // also check that posts are in the right place
  assert.ok(m['journal']['a1.html']);
  assert.ok(m['journal']['b2.html']);
  assert.ok(m['journal']['c3.html']);
}

exports['posts metadata'] = function() {
  var postsMeta = m['journal']['_locals']['posts'];

  assert.eql(postsMeta.length, 3);
}

// note: filters that iterate through posts will need to check published_date


exports['local variables in file'] = function() {
  assert.eql("murmur@example.com", m['index.html']._locals.email);
}

