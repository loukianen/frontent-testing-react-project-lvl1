import axios from 'axios';
import debug from 'debug';
import fs from 'fs';
import promises from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';

const debugHttpFiles = debug('page-loader:http:files');
const debugHttpMain = debug('page-loader:http:main');
const debugFs = debug('page-loader:fs:');
const debug$ = debug('page-loader:$:');

const defaultDir = process.cwd();
const tags = ['img', 'link', 'script'];

const createFile = async (source, filepath) => {
  debugHttpFiles('GET %s', source);
  const response = await axios({
    url: source,
    method: 'GET',
    responseType: 'stream',
  });
  debugFs('Create file %s', filepath);
  await response.data.pipe(fs.createWriteStream(filepath));
  return true;
};

const getAttr = (tag) => {
  switch (tag) {
    case 'img':
      return 'src';
    case 'link':
      return 'href';
    case 'script':
      return 'src';
    default:
      throw new Error('Unknown tag name');
  }
};

const getName = (url) => {
  const nameFromHostName = `${url.hostname.split('.').join('-')}`;
  const nameFromPath = url.pathname.length > 1 ? `${url.pathname.split('/').join('-')}` : '';
  return `${nameFromHostName}${nameFromPath}`;
};

export default async (requestUrl, dir = defaultDir) => {
  const url = new URL(requestUrl);
  const pageName = getName(url);
  const filesDirName = `${dir}/${pageName}_files`;

  // getting a content
  debugHttpMain('GET %s', url.href);
  const answer = await axios.get(url.href);
  const $ = cheerio.load(answer.data);

  const filesSource = [];
  // choose source for local files and swapping source names
  tags.forEach((tag) => {
    debug$('Proccess tag %s', tag);
    $(tag).map((i, el) => {
      const attr = getAttr(tag);
      const newEl = { ...el };
      const curFileName = el.attribs[attr];
      const sourceUrl = new URL(curFileName, url);
      if (sourceUrl.host === url.host) {
        const name = `${pageName}_files/${getName(sourceUrl)}`;
        const isSourceDirectory = path.extname(sourceUrl.href) === '';
        const newFileName = isSourceDirectory ? `${name}.html` : name;
        newEl.attribs[attr] = newFileName;
        filesSource.push({ sourceUrl, newFileName });
      }
      return newEl;
    });
  });

  // creating a main local html-file
  const filepath = `${dir}/${pageName}.html`;
  debugFs('Create file %s', filepath);
  await promises.writeFile(filepath, $.html(), 'utf-8');

  // loading and creating local files
  debugFs('Create directory %s', filesDirName);
  await promises.mkdir(filesDirName, { recursive: true });
  filesSource.forEach((item) => {
    createFile(item.sourceUrl.href, `${dir}/${item.newFileName}`);
  });
  return filepath;
};
