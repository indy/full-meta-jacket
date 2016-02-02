/*!
 * full-meta-jacket: template
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

'use strict';

const imbue = require('./imbue');
const fs = require('fs');
const path = require('path');

exports.folder = '_templates';

function templateBuild(folder, f) {
  const fullpath = path.join(folder, f);

  return new Promise((resolve, reject) => {
    fs.stat(fullpath, (e, stats) => {
      if (e) {
        reject(Error(e));
      }

      if (stats.isFile()) {

        fs.readFile(fullpath, 'utf8', (err, contents) => {
          if (err) {
            reject(Error(err));
          }

          const name = f.split('.')[0];
          const data = imbue.parse(contents);

          resolve([name, data]);
        });
      } else {
        // not a file, but we don't want to reject this and
        // cause the Promise.all to fail
        resolve([false, false]);
      }
    });
  });
}

/*
  read all files in the layour folder into a hash
  this will be added to metadata structure
 */
exports.build = folder =>
  new Promise((resolve, reject) => {
    const templates = {};

    try {
      fs.readdir(folder, (err, files) => {

        if (err) {
          reject(err);
        }

        const promises = files.sort().map(f => templateBuild(folder, f));
        Promise.all(promises).then(res => {

          // add data to templates
          res.forEach(a  => {
            const name = a[0];
            const data = a[1];
            if (name && data) {
              templates[name] = data;
            }
          });

          resolve(templates);

        }).catch(reject);
      });
    } catch (e) {
      // todo: this try/catch statement is a substitute for
      // a 'doesFolderExist' function that needs to be written
      //    console.log(e);
      reject(Error(e));
    }
  });
