import axios from 'axios';
import fs from 'fs';
import promises from 'fs/promises';
import cheerio from 'cheerio';

const defaultDir = process.cwd();

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

const getPageName = (url) => {
  const nameFromHostName = `${url.hostname.split('.').join('-')}`;
  const nameFromPath = url.pathname.length > 1 ? `${url.pathname.split('/').join('-')}` : '';
  return `${nameFromHostName}${nameFromPath}`;
};

const getFileName = (host, path) => {
  const nameFromHostName = `${host.split('.').join('-')}`;
  const nameFromPath = path.length > 1 ? `${path.split('/').join('-')}` : '';
  return `${nameFromHostName}${nameFromPath}`;
};

export default async (requestUrl, dir = defaultDir) => {
  const url = new URL(requestUrl);
  const pageName = getPageName(url);

  // creatig a directory for local files
  const filesDirName = `${dir}/${pageName}_files`;
  await promises.mkdir(filesDirName, { recursive: true });

  // getting a content
  const answer = await axios.get(url.href);
  const $ = cheerio.load(answer.data);

  // creating local source files for img-tags and swapping file names
  $('img').map((i, el) => {
    const newEl = { ...el };
    const curFileName = el.attribs.src;
    const newFileName = `${pageName}_files/${getFileName(url.hostname, curFileName)}`;
    newEl.attribs.src = newFileName;
    createFile(`${url.origin}${curFileName}`, `${dir}/${newFileName}`);
    return newEl;
  });

  // creating a main local html-file
  const filepath = `${dir}/${pageName}.html`;
  await promises.writeFile(filepath, $.html(), 'utf-8');

  return filepath;
};
