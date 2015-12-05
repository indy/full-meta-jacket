/*!
 * imbue
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

"use strict";

// Filesystem required for reading imbue files
const fs = require('fs');
const utils = require('./utils');

const jade = require('jade');
const markdown = require('markdown');

// Returns the position of the closing delimiter that separates the header from the body.
function headerDelimiterPos(inputRem) {
  const patt = /-{3}/;
  const endHeader = inputRem.search(patt);
//  if (endHeader === -1) {
    // TODO: raise an error
//  }
  return endHeader;
}

// Given the start of the header data and it's closing
// delimiter, parse the JSON contents of the header
function parseHeader(dataString) {

  // make sure all lines in the header are comma separated
  const commaLines = dataString.split("\n").reduce((a, b) => {
    const r = b.trim();
    if (r.length !== 0) {  // ignore empty lines
      a.push(r.slice(-1) === "," ? r : r + ",");
    }
    return a;
  }, []);

  // remove comma at end
  const joinedLines = commaLines.join("\n").slice(0, -1);
  const wrapped = "{" + joinedLines + "}";
  let json;

  try {
    json = JSON.parse(wrapped);
  } catch (e) {
    throw {data: wrapped,
           e: e,
           message: "failed to parse the JSON header"};
  }

  return json;
}

// Split the **input** into a header and body, returning
// both sections in a single object
function headerAndBody(input) {
  let imbued = false;
  let header = {};
  let body = input;
  const headerMarkerLength = 3;

  if (input.slice(0, headerMarkerLength) === '---') {
    const inputRem = input.slice(headerMarkerLength);
    const endHeader = headerDelimiterPos(inputRem);
    header = parseHeader(inputRem.slice(0, endHeader));
    body = inputRem.slice(endHeader + headerMarkerLength);
    imbued = true;
  }

  return {
    header: header,
    body: body,
    imbued: imbued
  };
}


function indentLines(body) {
  return "  " + body.replace(/\n/g, "\n  ");
}

function wrapAsMarkdown(body) {
  return ":markdown\n" + indentLines(body);
}

// when using templates, jade needs the 'filename' in options filled out and
// the template should be relative to the current file
function embedInTemplate(bindings, body) {
  if (bindings.template === undefined) {
    return body;
  }
  const blockname = bindings.template + "-content";
  return "extends " + bindings.template + "\nblock " + blockname + "\n" + indentLines(body);
}

// copies body of srcFile into destFile, appending 'extends' if srcFile's
// header specified a template
exports.copyBodyToFile = function (srcFile, destFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(srcFile, 'utf8', (err, data) => {
      if(err) {
        reject(err);
      }
      const res = headerAndBody(data);
      fs.writeFile(destFile, embedInTemplate(res.header, res.body), (err) => {
        if(err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  });
};

// Return the parsed contents of the header in **str**
exports.parse = function (str) {
  return headerAndBody(str);
};

exports.render = function (bindings, body) {
  const options = {};

  // need a filename for includes and extends
  if (bindings._jade_filename) {
    options.filename = bindings._jade_filename;
  }

  // treat the body of imd files as though they're wrapped in a markdown tag
  if (bindings._filename && utils.pathExtension(bindings._filename) === 'imd') {
    body = wrapAsMarkdown(body.trim());
  }
  body = embedInTemplate(bindings, body);
  const jadeFn = jade.compile(body, options);
  return jadeFn(bindings);
};

