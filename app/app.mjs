import axios from 'axios';
import fs from 'fs/promises';

const defaultDir = process.cwd();

export default async (requestUrl, dir = defaultDir) => {
  const url = new URL(requestUrl);
  const nameFromHostName = `${url.hostname.split('.').join('-')}`;
  const nameFromPath = `${url.pathname.split('/').join('-')}`;
  const fileName = `${nameFromHostName}${nameFromPath}.html`;
  const answer = await axios.get(url.href);
  const filepath = `${dir}/${fileName}`;
  await fs.writeFile(filepath, answer.data, 'utf-8');
  console.log(filepath);
  return filepath;
};
