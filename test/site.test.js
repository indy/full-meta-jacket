var temp = require('temp');
var path = require('path');

var assert = require('assert');
var site = require('../lib/site');
var fs = require('fs');


var srcPrefix = path.join('test', 'sites');
var compPrefix = path.join('test', 'correct-sites');

// compare all the files generated by site.build against 
// a set of known correct ones
function compareAllGeneratedFiles(folder) {
  temp.mkdir(folder, function(err, destPath) {

    var srcPath = path.join(srcPrefix, folder);
    var compPath = path.join(compPrefix, folder);

    site.build(srcPath, destPath, function(uriPath) {
      // read the file generated by site
      var generated = fs.readFileSync(path.join(destPath, uriPath), 'utf8');
      var correct = fs.readFileSync(path.join(compPath, uriPath), 'utf8');

      assert.equal(generated, correct);
    });
    
  });
}

exports['check basic-stylus'] = function() {
  compareAllGeneratedFiles('basic-stylus');
}

