var expect = require("chai").expect;

var template = require('../lib/template');
var utils = require('../lib/utils');
var fs = require('fs');

// load layouts once, test multiple aspects
var layouts = template.build('test/files/template');

describe("template", function() {
  it('read all layouts', () => {
    expect(utils.objectSize(layouts)).to.equal(3);
  });
});
