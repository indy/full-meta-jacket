/*!
 * full-meta-jacket: template
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

var imbue = require('./imbue');
var utils = require('./utils');
var fs = require('fs');
var path = require('path');

exports.folder = '_templates';

function templateBuild(folder, f) {
  var fullpath = path.join(folder, f);

  return new Promise((resolve, reject) => {
    fs.stat(fullpath, (e, stats) => {
      if(e) {
        reject(Error(e));
      }

      if (stats.isFile()) {

        fs.readFile(fullpath, 'utf8', (err, contents) => {
          if(err) {
            reject(Error(err));
          }

          var name = f.split('.')[0];
          var data = imbue.parse(contents);

          resolve([name, data]);
        });
      } else {
        // not a file, but we don't want to reject this and cause the Promise.all to fail
        resolve([false, false]);
      }
    });
  });
}

/*
  read all files in the layour folder into a hash
  this will be added to metadata structure
 */
exports.build = function (folder) {
  return new Promise((resolve, reject) => {
    var templates = {};
    var contents, name;

    try {
      fs.readdir(folder, (err, files) => {

        if(err) {
          reject(err);
        }

        var promises = files.sort().map(f => templateBuild(folder, f));
        Promise.all(promises).then(res => {

          // add data to templates
          res.forEach(a  => {
            var name = a[0];
            var data = a[1];
            if(name && data) {
              templates[name] = data;
            }
          });

          resolve(templates);

        }).catch(reject);
      });
    } catch (e) {
      // todo: this try/catch statement is a substitute for a 'doesFolderExist' function that needs to be written
      //    console.log(e);
      reject(Error(e));
    }
  });
};
