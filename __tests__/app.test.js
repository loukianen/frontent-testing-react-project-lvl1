import nock from 'nock';
import fs from 'fs';
import promises from 'fs/promises';
import os from 'os';
import path from 'path';
import debug from 'debug';
import app from '../app/app';
import filesName from '../__fixtures__/filesName';
import filesPath from '../__fixtures__/filesPath';

const debugCommon = debug('page-loader');

const url = new URL('https://ru.hexlet.io/courses');
const fixturesPath = path.join(__dirname, '..', '__fixtures__');

const pageName = 'ru-hexlet-io-courses';
const contentPath = `${fixturesPath}/fakeCoursesPage.html`;

const getSourceScopes = (time = 1) => filesName.map((localName) => {
  debugCommon('Http request %s', filesName);
  const sourceScope = nock(url.origin)
    .get(filesPath[localName].source)
    .times(time)
    .reply(
      200,
      fs.readFileSync(`${fixturesPath}/expected${filesPath[localName].fileName}`),
      { responseType: 'steam' },
    );
  return sourceScope;
});

describe('testing function app', () => {
  let tmpdir;
  let content;
  let scope;
  let sourceScopes;
  let definedDirFileName;
  let defaultDirFileName;

  beforeAll(async () => {
    debugCommon('Make temporary directory %s', path.join(os.tmpdir()));
    tmpdir = await promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    content = await promises.readFile(contentPath, 'utf-8');
    scope = nock(url.origin).get(url.pathname).times(2).reply(200, content);
    sourceScopes = getSourceScopes(2);
    definedDirFileName = await app(url.href, tmpdir);
    defaultDirFileName = await app(url.href);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    debugCommon(
      'Remove temporary directory %s',
      tmpdir,
      `${process.cwd()}/${pageName}_files`,
      `${process.cwd()}/${pageName}.html`,
    );
    await promises.rmdir(tmpdir, { recursive: true });
    await promises.rmdir(`${process.cwd()}/${pageName}_files`, { recursive: true });
    await promises.rm(`${process.cwd()}/${pageName}.html`, { forse: true });
  });

  test('check main html-files', async () => {
    const expectedContent = await promises
      .readFile(`${fixturesPath}/expected/gaugeLocalCoursesPage.html`, 'utf-8');
    const definedDirContent = await promises
      .readFile(`${tmpdir}/${pageName}.html`, 'utf-8');
    const defaultDirContent = await promises
      .readFile(`${process.cwd()}/${pageName}.html`, 'utf-8');

    expect(definedDirFileName).toBe(`${tmpdir}/${pageName}.html`);
    expect(defaultDirFileName).toBe(`${process.cwd()}/${pageName}.html`);
    expect(definedDirContent).toBe(expectedContent);
    expect(defaultDirContent).toBe(expectedContent);
  });

  test.each(filesName)('check source file (%s)', async (localName) => {
    const expectedContent = await promises
      .readFile(`${fixturesPath}/expected${filesPath[localName].fileName}`);
    const definedDirContent = await promises
      .readFile(`${tmpdir}/${pageName}_files${localName}`);
    const defaultDirContent = await promises
      .readFile(`${process.cwd()}/${pageName}_files${localName}`);

    expect(definedDirContent).toEqual(expectedContent);
    expect(defaultDirContent).toEqual(expectedContent);
  });

  test('testing scopes', () => {
    expect(scope.isDone()).toBeTruthy();
    sourceScopes.forEach((item) => expect(item.isDone()).toBeTruthy());
  });
});

describe('testing errors', () => {
  let htmlContent;

  beforeAll(async () => {
    debugCommon('Make temporary directory %s', path.join(os.tmpdir()));
    htmlContent = await promises.readFile(contentPath, 'utf-8');
  });

  afterAll(async () => {
    await promises.rmdir(`${fixturesPath}/page`, { recursive: true });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('unexists directory', async () => {
    const scope = nock(url.origin).get(url.pathname).times(2).reply(200, htmlContent);
    const sourceScopes = getSourceScopes();
    await app(url.href, `${fixturesPath}/page`);

    await expect(promises.access(`${fixturesPath}/page`)).resolves.toBeUndefined();
    await expect(app(url.href, `${fixturesPath}/unexists/page`)).rejects
      .toThrow(`Failed to write data into ${fixturesPath}/unexists; - no such file or directory`);

    expect(scope.isDone()).toBeTruthy();
    sourceScopes.forEach((item) => expect(item.isDone()).toBeTruthy());
  });

  test('errors with permision denied', async () => {
    const scope = nock(url.origin).get(url.pathname).reply(200, htmlContent);

    await expect(app(url.href, '/sys')).rejects
      .toThrow('Failed to write data into /sys; - was unknown error. Write us, please');

    expect(scope.isDone()).toBeTruthy();
  });

  test('errors from server', async () => {
    debugCommon('Http request', url);
    const scopes = [102, 302, 404, 503]
      .map((item) => nock(url.origin).get(url.pathname).reply(item));

    await expect(app(url.href)).rejects
      .toThrow(`Failed to load data from ${url.href}; - info, code: 102.`);

    await expect(app(url.href)).rejects
      .toThrow(`Failed to load data from ${url.href}; - request was redirected, code: 302.`);

    await expect(app(url.href)).rejects
      .toThrow(`Failed to load data from ${url.href}; - request was wrong, code: 404.`);

    await expect(app(url.href)).rejects
      .toThrow(`Failed to load data from ${url.href}; - was error on the server, code: 503.`);

    scopes.forEach((item) => expect(item.isDone()).toBeTruthy());
  });

  test('net error', async () => {
    nock.disableNetConnect();
    await expect(app(url.href)).rejects.toThrow(`Failed to load data from ${url.href}.`);
  });
});
