/*!
 * full-meta-jacket: fn
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

"use strict";

const fs = require('fs');
const path = require('path');

const functions = {};

functions.printDate = d => d.toLocaleDateString("en-GB", { day: "numeric",
                                                           month: "long",
                                                           year: "numeric"});

// prefixes every element in **obj** with **prefix**
//
functions.prefixWith = function (obj, prefix) {
  const pre = i => prefix + i;
  return Array.isArray(obj) ? obj.map(pre).join('\n') : prefix + String(obj) + '\n';
};

exports.getFunctions = function () {
  return functions;
};

exports.setup = function (folder) {
  return new Promise((resolve, reject) => {
    // add site specific functions
    const siteFnFile = path.join(process.cwd(), folder, '_fn.js');
    let specific;

    fs.access(siteFnFile, fs.R_OK, function(err) {
      if(err) {
        // no file or cannot be read
        resolve(functions);
      } else {
        specific = require(siteFnFile);
        for (let k in specific) {
          functions[k] = specific[k];
        }
        resolve(functions);
      }
    });
  });
};
