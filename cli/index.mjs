import pageLoader from '../index.mjs';
import { program } from 'commander';
import path from 'path'
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './package.json')));

export default () => {
  program.version(pkg.version);
  program.description('downloads a page from the network and puts it in the specified directory (by default, in the program launch directory).');
  program.option('-o, --output [dir]', 'output dir (default: "/").');
  program.arguments('<url>');
  program.action((url, options) => pageLoader(url, options.output));
  program.parse(process.argv);
};
