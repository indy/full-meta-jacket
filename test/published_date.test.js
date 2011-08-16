var assert = require('assert');
var site = require('../lib/site');
var fs = require('fs');


exports['published date'] = function() {

  // render the published_date test folder
  site.build('test/files/published_date', 'test/tmp');

  // compare the results

  // load layouts once, test multiple aspects
//  var layouts = layout.build('test/files/layout');
//  assert.equal(utils.objectSize(layouts), 3);

}
