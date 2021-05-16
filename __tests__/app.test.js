import nock from 'nock';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import debug from 'debug';
import app from '../src/app';

const debugCommon = debug('page-loader');

const url = new URL('https://ru.hexlet.io/courses');
const fixturesPath = path.join(__dirname, '..', '__fixtures__');

const pageName = 'ru-hexlet-io-courses';
const contentPath = `${fixturesPath}/fakeCoursesPage.html`;
const sourceFilesData = [
  {
    sourceName: 'nodejs.png',
    sourcePath: '/assets/professions/nodejs.png',
    localName: 'ru-hexlet-io-assets-professions-nodejs.png',
  },
  {
    sourceName: 'application.css',
    sourcePath: '/assets/application.css',
    localName: 'ru-hexlet-io-assets-application.css',
  },
  {
    sourceName: 'runtime.js',
    sourcePath: '/packs/js/runtime.js',
    localName: 'ru-hexlet-io-packs-js-runtime.js',
  },
  {
    sourceName: 'index.html',
    sourcePath: '/courses',
    localName: 'ru-hexlet-io-courses.html',
  },
];

const getSourceScopes = () => Promise.all(sourceFilesData.map(
  ({ sourceName, sourcePath }) => fs.readFile(`${fixturesPath}/expected/${sourceName}`)
    .then((content) => nock(url.origin).get(sourcePath).reply(200, content)),
));

describe('testing function app', () => {
  let tmpdir;
  let content;
  let scope;
  let sourceScopes;
  let localFileName;

  beforeAll(async () => {
    debugCommon('Make temporary directory %s', path.join(os.tmpdir()));
    tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    content = await fs.readFile(contentPath, 'utf-8');
    scope = nock(url.origin).get(url.pathname).reply(200, content);
    sourceScopes = await getSourceScopes();
    localFileName = await app(url.href, tmpdir);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    debugCommon('Remove temporary directory %s', tmpdir);
    await fs.rmdir(tmpdir, { recursive: true });
  });

  test('check main html-files', async () => {
    const expectedContent = await fs
      .readFile(`${fixturesPath}/expected/gaugeLocalCoursesPage.html`, 'utf-8');
    const loadedContent = await fs
      .readFile(`${tmpdir}/${pageName}.html`, 'utf-8');

    expect(localFileName).toBe(`${tmpdir}/${pageName}.html`);
    expect(loadedContent).toBe(expectedContent);
  });

  test.each(sourceFilesData)('check source file (%#)', async ({ sourceName, localName }) => {
    const expectedContent = await fs
      .readFile(`${fixturesPath}/expected/${sourceName}`);
    const loadedContent = await fs
      .readFile(`${tmpdir}/${pageName}_files/${localName}`);

    expect(loadedContent).toEqual(expectedContent);
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
    htmlContent = await fs.readFile(contentPath, 'utf-8');
  });

  afterAll(async () => {
    await fs.rmdir(`${fixturesPath}/page`, { recursive: true });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('unexists directory', async () => {
    const scope = nock(url.origin).get(url.pathname).times(2).reply(200, htmlContent);
    const sourceScopes = await getSourceScopes();
    await app(url.href, `${fixturesPath}/page`);

    await expect(fs.access(`${fixturesPath}/page`)).resolves.toBeUndefined();
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

  const errorsData = [
    [404, `Failed to load data from ${url.href}; - request was wrong, code: 404.`],
    [503, `Failed to load data from ${url.href}; - was error on the server, code: 503.`],
  ];

  test.each(errorsData)('errors from server %s', async (errorCode, errorText) => {
    debugCommon('Http request', url);
    const scope = nock(url.origin).get(url.pathname).reply(errorCode);
    await expect(app(url.href)).rejects.toThrow(errorText);
    expect(scope.isDone()).toBeTruthy();
  });

  test('net error', async () => {
    nock.disableNetConnect();
    await expect(app(url.href)).rejects.toThrow(`Failed to load data from ${url.href}.`);
  });
});
