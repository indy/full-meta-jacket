const expect = require('chai').expect;

const imbue = require('../lib/imbue');
const metadata = require('../lib/metadata');
const fs = require('fs');

const prefix = 'test/files/imbue/';
const postfix = '.expected';

// rather than this simple file comparison it would be better to
// parse the resultant html and do a DOM compare

function compare(filename, data) {
  const input = fs.readFileSync(prefix + filename, 'utf8');
  const expected = fs.readFileSync(prefix + filename + postfix, 'utf8');

  const hb = imbue.parse(input);

  hb.header._filename = filename;
  const res = imbue.render(metadata._deepMerge(hb.header, data),
                         hb.body); // use markdown was here
  expect(res.trim()).to.equal(expected.trim());
}

describe('imbue', function() {
  it('a simple imbue file with no header information', () => {
    compare('jaded1.html', {});
  });

  it('an imbue file with a layout', () => {
    compare('with-layout.html', {
      // set the path so that it's treated as though it's in the same
      // directory as the processed jade files
      _jade_filename: 'test/files/imbue/jade/with-layout.html'
    });
  });

  it('an imbue file with a nested layout', () => {
    compare('with-nested-layout.html', {
      _jade_filename: 'test/files/imbue/jade/with-nested-layout.html'
    });
  });
});
