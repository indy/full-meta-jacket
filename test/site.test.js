var temp = require('temp');
var path = require('path');

var assert = require('assert');
var utils = require('../lib/utils');
var site = require('../lib/site');
var fs = require('fs');

var srcPrefix = path.join('test', 'sites');
var compPrefix = path.join('test', 'correct-sites');

// compare all the files generated by site.build against
// a set of known correct ones
function compareAllGeneratedFiles(test, folder) {
  var destPath = path.join("temp", folder);
  utils.ensureDirectoryExists("temp");
  utils.ensureDirectoryExists(destPath);

  var srcPath = path.join(srcPrefix, folder);
  var compPath = path.join(compPrefix, folder);

  site.build(srcPath, destPath, function (uriPath) {
    // read the file generated by site
    var generated = fs.readFileSync(path.join(destPath, uriPath), 'utf8');
    var correct = fs.readFileSync(path.join(compPath, uriPath), 'utf8');
    test.equal(generated.trim(), correct.trim());
  });

}

exports['site.test.js'] = {

  'local-variables' : function (test) {
    test.expect(1);
    compareAllGeneratedFiles(test, 'local-variables');
    test.done();
  },

  'check imbue-site' : function (test) {
    compareAllGeneratedFiles(test, 'imbue-site');
    test.done();
  },


  'check nested-layout' : function (test) {
    compareAllGeneratedFiles(test, 'nested-layout');
    test.done();
  },

  'check jaded-1' : function (test) {
    compareAllGeneratedFiles(test, 'jaded-1');
    test.done();
  },

  'check in-list' : function (test) {
    compareAllGeneratedFiles(test, 'in-list');
    test.done();
  }


};

