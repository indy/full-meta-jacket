var assert = require('assert');
var layout = require('../lib/layout');
var utils = require('../lib/utils');
var fs = require('fs');

exports['build layout hash'] = function() {
  var layouts = layout.build('test/files/layout');

  assert.equal(utils.objectSize(layouts), 3);
}
