import nock from 'nock';
import fs from 'fs';
import promises from 'fs/promises';
import os from 'os';
import path from 'path';
import debug from 'debug';
import app from '../app/app';
import filesData from '../__fixtures__/filesData';

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

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    debugFsRm('Remove temporary directory %s', tmpdir);
    debugFsRm('Remove temporary directory %s', `${process.cwd()}/${pageName}_files`);
    debugFsRm('Remove temporary directory %s', `${process.cwd()}/${pageName}.html`);
    await promises.rmdir(tmpdir, { recursive: true });
    // await promises.rmdir(`${process.cwd()}/${pageName}_files`, { recursive: true });
    // await promises.rm(`${process.cwd()}/${pageName}.html`, { forse: true });
  });

  test.each(['definedDir'])('write file to (%s)', async (dirType) => {
    debugNock('Http request %s', url.pathname);
    const scope = nock(url.origin).get(url.pathname).times(2).reply(200, content);
    const sourceScopes = filesData.sourceIds.slice(0, 3).map((id) => {
      debugNock('Http request %s', filesData.sources[id].source);
      const sourceScope = nock(url.origin).get(filesData.sources[id].source)
        .reply(
          200,
          () => fs.createReadStream(`__fixtures__${filesData.sources[id].source}`),
          { responseType: 'steam' },
        );
      return sourceScope;
    });

    const [dir, args] = getData(dirType, url.href);
    const filepath = await app(...args); // main html
    debugFsRead('Read file %s', `${dir}/${pageName}.html`);
    const fileContent = await promises.readFile(`${dir}/${pageName}.html`, 'utf-8');

    expect(scope.isDone()).toBeTruthy();
    sourceScopes.forEach((item) => expect(item.isDone()).toBeTruthy());
    expect(filepath).toBe(`${dir}/${pageName}.html`);
    expect(fileContent).toBe(proccessedContent);
    expect(await promises.access(`${dir}/${pageName}_files`)).toBeUndefined();

    await Promise.all(filesData.sourceIds.map((id) => {
      debugFsRead('Read file %s', filesData.sources[id].fileName);
      return promises.access(`${dir}/${pageName}_files${filesData.sources[id].fileName}`);
    })).then((results) => results.forEach((result) => expect(result).toBeUndefined()));
  });

  test('errors with file system', async () => {
    const scope = nock(url.origin).get(url.pathname).times(2).reply(200, content);
    await expect(app(url.href, `${fixturesPath}/unwritable`)).rejects
      .toThrow(`Failed to write data into ${fixturesPath}/unwritable; - permission denied`);
    await expect(app(url.href, `${fixturesPath}/unexists`)).rejects
      .toThrow(`Failed to write data into ${fixturesPath}/unexists; - no such file or directory`);
    expect(scope.isDone()).toBeTruthy();
  });

  test('errors from server', async () => {
    debugNock('Http request', url);
    const scopes = [102, 302, 404, 503]
      .map((item) => nock(url.origin).get(url.pathname).reply(item));
    await expect(app(url.href, tmpdir)).rejects
      .toThrow(`Failed to load data from ${url.href}; - info, code: 102.`);
    await expect(app(url.href, tmpdir)).rejects
      .toThrow(`Failed to load data from ${url.href}; - request was redirected, code: 302.`);
    await expect(app(url.href, tmpdir)).rejects
      .toThrow(`Failed to load data from ${url.href}; - request was wrong, code: 404.`);
    await expect(app(url.href, tmpdir)).rejects
      .toThrow(`Failed to load data from ${url.href}; - was error on the server, code: 503.`);
    scopes.forEach((item) => expect(item.isDone()).toBeTruthy());
  });

  test('net error', async () => {
    nock.disableNetConnect();
    await expect(app(url.href, tmpdir)).rejects.toThrow(`Failed to load data from ${url.href}.`);
  });
});
