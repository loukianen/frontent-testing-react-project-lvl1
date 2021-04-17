import nock from 'nock';
import fs from 'fs';
import promises from 'fs/promises';
import os from 'os';
import path from 'path';
import app from '../app/app.mjs';

const url = new URL('https://ru.hexlet.io/courses');
const pageName = 'ru-hexlet-io-courses';
const contentPath = `${process.cwd()}/__fixtures__/fakeCoursesPage.html`;
const proccessedContentPath = `${process.cwd()}/__fixtures__/gaugeLocalCoursesPage.html`;
const pngSource = '/assets/professions/nodejs.png';
const pngFileName = '/ru-hexlet-io-assets-professions-nodejs.png';

let content;
let proccessedContent;
let tmpdir;

const getData = (type, filePath) => {
  const mapping = {
    definedDir: () => [tmpdir, [filePath, tmpdir]],
    defaultDir: () => [process.cwd(), [filePath]],
  };
  return mapping[type]();
};

beforeAll(async () => Promise.all([
  promises.readFile(contentPath, 'utf-8'),
  promises.readFile(proccessedContentPath, 'utf-8'),
  promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-')),
]).then(([fakeHtlm, proccessedHtml, tmpdirName]) => {
  content = fakeHtlm;
  proccessedContent = proccessedHtml;
  tmpdir = tmpdirName;
}));

test.each(['definedDir', 'defaultDir'])('write file to (%s)', async (dirType) => {
  nock(url.origin)
    .get(url.pathname)
    .reply(200, content);
  nock(url.origin).get(pngSource)
    .reply(200, () => fs.createReadStream(`__fixtures__${pngSource}`), { responseType: 'steam' });
  const [dir, args] = getData(dirType, url.href);
  const filepath = await app(...args); // main html
  const fileContent = await promises.readFile(`${dir}/${pageName}.html`, 'utf-8');

  // checking that app return filename
  expect(filepath).toBe(`${dir}/${pageName}.html`);

  // checking main htlm-file content
  expect(fileContent).toBe(proccessedContent);

  // checking that directory and files exists
  expect(await promises.access(`${dir}/${pageName}_files`)).toBeUndefined();
  expect(await promises.access(`${dir}/${pageName}_files${pngFileName}`)).toBeUndefined();
});

afterAll(async () => {
  await promises.rmdir(tmpdir, { recursive: true });
  await promises.rmdir(`${process.cwd()}/${pageName}_files`, { recursive: true });
  await promises.rm(`${process.cwd()}/${pageName}.html`, { forse: true });
});
