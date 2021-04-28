import nock from 'nock';
import fs from 'fs';
import promises from 'fs/promises';
import os from 'os';
import path from 'path';
import debug from 'debug';
import app from '../app/app.mjs';
import filesData from '../__fixtures__/filesData.mjs';
// import PageLoaderNetError from '../app/PageLoaderNetError.mjs';
// import PageLoaderFsError from '../app/PageLoaderFsError.mjs';

const debugFsRead = debug('page-loader:fs:read');
const debugFsWrite = debug('page-loader:fs:write');
const debugFsRm = debug('page-loader:fs:rm');
const debugNock = debug('page-loader:nock:');

const url = new URL('https://ru.hexlet.io/courses');
const pageName = 'ru-hexlet-io-courses';
const fixturesPath = `${process.cwd()}/__fixtures__`;
const contentPath = `${fixturesPath}/fakeCoursesPage.html`;
const proccessedContentPath = `${fixturesPath}/gaugeLocalCoursesPage.html`;

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
describe('testing function app', () => {
  beforeAll(async () => {
    debugFsRead('Read file %s', contentPath);
    debugFsRead('Read file %s', proccessedContentPath);
    debugFsWrite('Make temporary directory %s', path.join(os.tmpdir()));
    await Promise.all([
      promises.readFile(contentPath, 'utf-8'),
      promises.readFile(proccessedContentPath, 'utf-8'),
      promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-')),
    ]).then(([fakeHtlm, proccessedHtml, tmpdirName]) => {
      content = fakeHtlm;
      proccessedContent = proccessedHtml;
      tmpdir = tmpdirName;
    });
  });

  test.each(['definedDir', 'defaultDir'])('write file to (%s)', async (dirType) => {
    debugNock('Http request %s', url.pathname);
    nock(url.origin).get(url.pathname).times(2).reply(200, content);
    filesData.sourceIds.slice(0, 3).forEach((id) => {
      debugNock('Http request %s', filesData.sources[id].source);
      nock(url.origin).get(filesData.sources[id].source)
        .reply(
          200,
          () => fs.createReadStream(`__fixtures__${filesData.sources[id].source}`),
          { responseType: 'steam' },
        );
    });

    const [dir, args] = getData(dirType, url.href);
    const filepath = await app(...args); // main html
    debugFsRead('Read file %s', `${dir}/${pageName}.html`);
    const fileContent = await promises.readFile(`${dir}/${pageName}.html`, 'utf-8');

    expect(filepath).toBe(`${dir}/${pageName}.html`);

    expect(fileContent).toBe(proccessedContent);

    expect(await promises.access(`${dir}/${pageName}_files`)).toBeUndefined();

    await Promise.all(filesData.sourceIds.map((id) => {
      debugFsRead('Read file %s', filesData.sources[id].fileName);
      return promises.access(`${dir}/${pageName}_files${filesData.sources[id].fileName}`);
    })).then((results) => results.forEach((result) => expect(result).toBeUndefined()));
  });

  test('errors with file system', async () => {
    nock(url.origin).get(url.pathname).times(2).reply(200, content);
    await expect(() => app(url.href, `${fixturesPath}/unwritable`)).rejects.toThrow();
    await expect(() => app(url.href, `${fixturesPath}/unexists`)).rejects.toThrow();
  });

  test('errors with network', async () => {
    debugNock('Http request', url);
    nock(url.origin).get(url.pathname).reply(102, content);
    nock(url.origin).get(url.pathname).reply(302, content);
    nock(url.origin).get(url.pathname).reply(404);
    nock(url.origin).get(url.pathname).reply(503);
    await expect(() => app(url.href, tmpdir)).rejects.toThrow();
    await expect(() => app(tmpdir, url.href)).rejects.toThrow();
    await expect(() => app(tmpdir, url.href)).rejects.toThrow();
    await expect(() => app(tmpdir, url.href)).rejects.toThrow();
  });

  afterAll(async () => {
    debugFsRm('Remove temporary directory %s', tmpdir);
    debugFsRm('Remove temporary directory %s', `${process.cwd()}/${pageName}_files`);
    debugFsRm('Remove temporary directory %s', `${process.cwd()}/${pageName}.html`);
    await promises.rmdir(tmpdir, { recursive: true });
    await promises.rmdir(`${process.cwd()}/${pageName}_files`, { recursive: true });
    await promises.rm(`${process.cwd()}/${pageName}.html`, { forse: true });
  });
});
