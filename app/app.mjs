import axios from 'axios';
import fs from 'fs';
import promises from 'fs/promises';
import cheerio from 'cheerio';

const defaultDir = process.cwd();
const tags = ['img', 'link', 'script'];

const createFile = async (source, filepath) => {
  try {
    const response = await axios({
      url: source,
      method: 'GET',
      responseType: 'stream',
    });
    await response.data.pipe(fs.createWriteStream(filepath));
    return true;
  } catch (e) {
    return e;
  }
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

  // creatig a directory for local files
  const filesDirName = `${dir}/${pageName}_files`;
  await promises.mkdir(filesDirName, { recursive: true });

  // getting a content
  const answer = await axios.get(url.href);
  const $ = cheerio.load(answer.data);

  const filesSource = [];
  // creating local source files for img-tags and swapping file names
  tags.forEach((tag) => {
    $(tag).map((i, el) => {
      const attr = getAttr(tag);
      const newEl = { ...el };
      const curFileName = el.attribs[attr];
      const sourceUrl = new URL(curFileName, url);
      if (sourceUrl.host === url.host) {
        const newFileName = sourceUrl.href === url.href
          ? `${pageName}_files/${getName(sourceUrl)}.html`
          : `${pageName}_files/${getName(sourceUrl)}`;
        newEl.attribs[attr] = newFileName;
        filesSource.push({ sourceUrl, newFileName });
      }
      return newEl;
    });
  });

  // creating a main local html-file
  const filepath = `${dir}/${pageName}.html`;
  await promises.writeFile(filepath, $.html(), 'utf-8');

  // loading and creating local files
  filesSource.forEach((item) => {
    createFile(item.sourceUrl.href, `${dir}/${item.newFileName}`);
  });
  return filepath;
};
