var assert = require('assert');
var template = require('../lib/template');
var utils = require('../lib/utils');
var fs = require('fs');

// load layouts once, test multiple aspects
var layouts = template.build('test/files/template');

exports['read all layouts'] = function() {
  assert.equal(utils.objectSize(layouts), 3);
}
