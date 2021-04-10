import nock from 'nock';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import app from '../app/app.mjs';

let dir = 'Hi';
const url = new URL('https://ru.hexlet.io/courses');
const filename = 'ru-hexlet-io-courses.html';
const content = '<p>Hello, world!</p>';

beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('write file', async () => {
  nock(url.origin).get(url.pathname).reply(200, content);
  const filepath = await app(url.href, dir);
  const fileContent = await fs.readFile(`${dir}/${filename}`, 'utf-8');
  expect(fileContent).toBe(content);
  expect(filepath).toBe(`${dir}/${filename}`);
});

test('write file to default directory', async () => {
  nock(url.origin).get(url.pathname).reply(200, content);
  const filepath = await app(url.href);
  const fileContent = await fs.readFile(`${process.cwd()}/${filename}`, 'utf-8');
  expect(fileContent).toBe(content);
  expect(filepath).toBe(`${process.cwd()}/${filename}`);
});

afterAll(async () => {
  await fs.rmdir(dir, { recursive: true });
  await fs.rm(`${process.cwd()}/${filename}`, { forse: true });
});
