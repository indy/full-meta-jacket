const expect = require("chai").expect;

const template = require('../lib/template');
const utils = require('../lib/utils');

// load layouts once, test multiple aspects
const layouts = template.build('test/files/template');

describe("template", () => {
  it('read all layouts', () =>
     layouts.then(l => expect(utils.objectSize(l)).to.equal(3)));
});
