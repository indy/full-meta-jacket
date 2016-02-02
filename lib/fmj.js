/*!
 * full-meta-jacket: fmj
 * Copyright(c) 2012 indy <email@indy.io>
 * MIT Licensed
 */

'use strict';

const program = require('commander');
const watch = require('watch');
const path = require('path');
const metadata = require('./metadata');
const utils = require('./utils');
const site = require('./site');

const version = '0.8.4';

program
  .version(version)
  .option('-o, --output <string>', 'destination for static files')
  .option('-p, --port <n>', 'port', parseInt)
  .option('-w, --watch [value]', 'optional value to watch the source folder')
  .option('-m, --meta <string>', 'location to save meta file (for debugging)')
  .parse(process.argv);

function main() {

  const srcPath = program.args.shift() || '.';

  if (program.watch) {
    console.log('watching', srcPath);

    let meta;

    metadata.fullBuild(srcPath).then(m => {

      meta = m;
      meta._destination = program.output;
      console.log('built metadata', meta._destination);

//      console.log(meta);
//      utils.writeMeta("/Users/indy/scratch/output.json", meta);
    });

    watch.watchTree(srcPath, (f, curr, prev) => {
      if (typeof f == 'object' && prev === null && curr === null) {
        // console.log('Finished walking the tree', f);
      } else if (prev === null) {
        console.log('new file', f);
      } else if (curr.nlink === 0) {
        console.log('file removed:', f);
      } else {
        console.log('changed:', f);

        if (utils.pathExtension(f) === 'html') {
          const hardPath = filePathToUri(f);
          site.renderToFile(meta, hardPath).then(uriPath => {
            console.log('updated file', path.join(meta._destination, uriPath));
          }).catch(error => {
            console.log('failed: ', error);
          });
        } else {
          console.log('not rendering', f);
        }
      }
    });
  } else {
    console.log('building full site');
    staticSite(srcPath, program.output);
  }
}

function filePathToUri(path) {
  const uri = path.split('/')
          .slice(1)                    // remove the 'site/'
          .filter(s => s !== '_posts') // remove any _posts
          .join('/');

  return `/${uri}`;
}


function staticSite(path, destination) {
  site.build(path, destination);
}


exports.version = version;
exports.main = main;
