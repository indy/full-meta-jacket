const expect = require("chai").expect;

const temp = require('temp');
const path = require('path');
const site = require('../lib/site');

const imbue = require("../lib/imbue");
const utils = require("../lib/utils");
const metadata = require("../lib/metadata");
const fs = require("fs");

const prefix = "test/files/imbue/";
const postfix = ".expected";

// rather than this simple file comparison it would be better to
// parse the resultant html and do a DOM compare

function dbgOutput(fn, data, filename) {
  const input = fs.readFileSync(prefix + filename, "utf8");
  console.log(fn(input, data));
}

function compare(filename, data) {
  const input = fs.readFileSync(prefix + filename, "utf8");
  const expected = fs.readFileSync(prefix + filename + postfix, "utf8");

  const hb = imbue.parse(input);
  hb.header._filename = filename;
  const res = imbue.render(metadata._deepMerge(hb.header, data),
                         hb.body); // use markdown was here

  expect(res.trim()).to.equal(expected.trim());
}

describe('imbue', function() {

  it('a simple imbue file with no header information', () => {
    compare("jaded1.imd", {});
  });

  it('an imbue file with a layout', () => {
    compare("with-layout.imd", {
      // set the path so that it"s treated as though it"s in the same
      // directory as the processed jade files
      _jade_filename: "test/files/imbue/jade/with-layout.imd"
    });
  });

  it('an imbue file with a nested layout', () => {
    compare("with-nested-layout.imd", {
      _jade_filename: "test/files/imbue/jade/with-nested-layout.imd"
    });
  });

  it('should identify an imd file that begins with source code', () => {
    compare("starts-with-source.imd", {});
  });
});
