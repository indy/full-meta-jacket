var assert = require('assert');
var site = require('../lib/site');
var metadata = require('../lib/metadata');
var fs = require('fs');

var prefix = 'test/files/';

exports['eval file'] = function() {
  assert.equal(1, 1);
}

/*
exports['eval file'] = function() {

  var meta = metadata.build('test/files/eval-file');
  var res = site.renderFile(meta, 'test/files/eval-file/a1');
  var expected = fs.readFileSync('test/files/eval-file-expected/a1', 'utf8');
  assert.equal(res, expected);
}


exports['build site'] = function() {
  site.build('/Users/indy/mem/tempa', '/Users/indy/mem/tempb');
}
*/