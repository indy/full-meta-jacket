var assert = require('assert');
var site = require('../lib/site');
var fs = require('fs');

var prefix = 'test/files/';

exports['traverse filesystem'] = function() {
  var res = site.traverse('test/files/traverse-1');

  assert.eql(res, 42);
}
