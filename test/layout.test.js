var assert = require('assert');
var layout = require('../lib/layout');
var utils = require('../lib/utils');
var fs = require('fs');

// load layouts once, test multiple aspects
var layouts = layout.build('test/files/layout');

exports['read all layouts'] = function() {
  assert.equal(utils.objectSize(layouts), 3);
}
