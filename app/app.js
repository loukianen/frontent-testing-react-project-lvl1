import axios from 'axios';
import debug from 'debug';
import 'axios-debug-log';
import fs from 'fs';
import promises from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import PageLoaderNetError from './PageLoaderNetError';
import PageLoaderFsError from './PageLoaderFsError';

const debugHttpFiles = debug('page-loader:http:files');
const debugHttpMain = debug('page-loader:http:main');
const debugFs = debug('page-loader:fs:');

const defaultDir = process.cwd();
const tags = ['img', 'link', 'script'];

const createFile = async (source, filepath) => {
  let response;
  try {
    debugHttpFiles('GET %s', source);
    const request = axios.create({
      baseURL: source,
      method: 'GET',
      responseType: 'stream',
    });
    response = await request();
  } catch (e) {
    throw new PageLoaderNetError(e, source);
  }
  try {
    await response.data.pipe(fs.createWriteStream(filepath));
    return true;
  } catch (e) {
    throw new PageLoaderFsError(e, filepath);
  }
};

const getAttrName = (tag) => {
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

const getFilePath = (sourceUrl, baseUrl) => {
  const name = `${getName(baseUrl)}_files/${getName(sourceUrl)}`;
  const isSourceDirectory = path.extname(sourceUrl.href) === '';
  return isSourceDirectory ? `${name}.html` : name;
};

const getSourcesInfo = (html, tagNames, baseUrl) => {
  const foundLinks = tagNames.reduce((acc, tag) => {
    const links = [];
    cheerio.load(html)(tag).each((i, el) => {
      links[i] = { tag, origin: cheerio(el).attr(getAttrName(tag)) };
    });
    return [...acc, ...links];
  }, []);
  const linksForComparison = foundLinks
    .map((link) => ({ ...link, normalized: new URL(link.origin, baseUrl) }));
  const localLinks = linksForComparison
    .filter(({ normalized, origin }) => origin && normalized.host === baseUrl.host);
  return localLinks
    .map((item) => ({ ...item, newFilePath: getFilePath(item.normalized, baseUrl) }));
};

const getNewHtml = (sourcesData, html) => {
  const $ = cheerio.load(html);
  sourcesData.forEach(({ tag, origin, newFilePath }) => {
    const attrName = getAttrName(tag);
    $(`${tag}[${attrName}="${origin}"]`).attr(attrName, newFilePath);
  });
  return $.html();
};

export default async (requestUrl, dir = defaultDir) => {
  const url = new URL(requestUrl);
  const pageName = getName(url);
  const filepath = `${dir}/${pageName}.html`;
  const filesDirName = `${dir}/${pageName}_files`;
  let html;
  let newHtml;
  let filesSource;

  try {
    debugHttpMain('GET %s', url.href);
    const { data } = await axios.get(url.href);
    html = data;
  } catch (e) {
    throw new PageLoaderNetError(e, url.href);
  }

  try {
    filesSource = getSourcesInfo(html, tags, url);
    newHtml = getNewHtml(filesSource, html);
  } catch (e) {
    throw new Error('Failed to parse loaded data. Write us, please');
  }

  try {
    await promises.access(path.dirname(dir));
    await promises.mkdir(dir, { recursive: true });
  } catch (e) {
    throw new PageLoaderFsError(e, path.dirname(dir));
  }

  try {
    debugFs('Create file %s', filepath, dir);
    await promises.writeFile(filepath, newHtml, 'utf-8');
  } catch (e) {
    throw new PageLoaderFsError(e, dir);
  }

  try {
    // debugFs('Create directory %s', filesDirName);
    await promises.mkdir(filesDirName, { recursive: true });
  } catch (e) {
    throw new PageLoaderFsError(e, dir);
  }

  filesSource.forEach((item) => {
    createFile(item.normalized.href, `${dir}/${item.newFilePath}`);
  });
  return filepath;
};
