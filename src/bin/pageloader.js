#!/usr/bin/env node
import { program } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import pageLoader from '../app';

const start = async () => {
  const pkg = JSON.parse(await fs.readFile(path.resolve(__dirname, '../../package.json')));
  program.version(pkg.version);
  program.description('downloads a page from the network and puts it in the specified directory (by default, in the program launch directory).');
  program.option('-o, --output [dir]', 'output dir', process.cwd());
  program.arguments('<url>');
  program.action((url, options) => {
    pageLoader(url, options.output)
      .then((filepath) => console.log(`\nPage was successully downloaded into ${filepath}.\n`))
      .catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
  });
  program.parse(process.argv);
};

start();
