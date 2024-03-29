import axios from 'axios';
import debug from 'debug';
import 'axios-debug-log';
import fs from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import getPageloaderError from './errors';

const debugCommon = debug('page-loader');

const tags = ['img', 'link', 'script'];
const defaultDir = process.cwd();

const createFile = async (source, filepath) => {
  let response;
  try {
    debugCommon('GET %s', source);
    const request = axios.create({
      baseURL: source,
      method: 'GET',
      responseType: 'arraybuffer',
    });
    response = await request();
  } catch (e) {
    throw getPageloaderError(e, source, 'net');
  }
  try {
    debugCommon('Create source file %s', filepath);
    await fs.writeFile(filepath, response.data);
    return true;
  } catch (e) {
    throw getPageloaderError(e, filepath, 'fs');
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
  const name = path.join(`${getName(baseUrl)}_files`, `${getName(sourceUrl)}`);
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
  const filepath = path.join(`${dir}`, `${pageName}.html`);
  const filesDirName = path.join(`${dir}`, `${pageName}_files`);
  let html;
  let newHtml;
  let filesSource;

  try {
    debugCommon('GET %s', url.href);
    const { data } = await axios.get(url.href);
    html = data;
  } catch (e) {
    throw getPageloaderError(e, url.href, 'net');
  }

  try {
    filesSource = getSourcesInfo(html, tags, url);
    newHtml = getNewHtml(filesSource, html);
  } catch (e) {
    throw new Error('Failed to parse loaded data. Write us, please');
  }

  try {
    await fs.access(path.dirname(dir));
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    throw getPageloaderError(e, path.dirname(dir), 'fs');
  }

  try {
    debugCommon('Create file %s', filepath, dir);
    await fs.writeFile(filepath, newHtml, 'utf-8');
  } catch (e) {
    throw getPageloaderError(e, dir, 'fs');
  }

  try {
    debugCommon('Create directory %s', filesDirName);
    await fs.mkdir(filesDirName, { recursive: true });
  } catch (e) {
    throw getPageloaderError(e, dir, 'fs');
  }

  filesSource.forEach((item) => {
    createFile(item.normalized.href, path.join(`${dir}`, `${item.newFilePath}`));
  });
  return filepath;
};
