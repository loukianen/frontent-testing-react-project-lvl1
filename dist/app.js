"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _debug = _interopRequireDefault(require("debug"));

require("axios-debug-log");

var _fs = _interopRequireDefault(require("fs"));

var _promises = _interopRequireDefault(require("fs/promises"));

var _path = _interopRequireDefault(require("path"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _PageLoaderNetError = _interopRequireDefault(require("./errors/PageLoaderNetError"));

var _PageLoaderFsError = _interopRequireDefault(require("./errors/PageLoaderFsError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debugCommon = (0, _debug.default)('page-loader');
/*
const debugHttpFiles = debug('page-loader:http:files');
const debugHttpMain = debug('page-loader:http:main');
const debugFs = debug('page-loader:fs:');
*/

const defaultDir = process.cwd();
const tags = ['img', 'link', 'script'];

const createFile = async (source, filepath) => {
  let response;

  try {
    debugCommon('GET %s', source); // debugHttpFiles('GET %s', source);

    const request = _axios.default.create({
      baseURL: source,
      method: 'GET',
      responseType: 'stream'
    });

    response = await request();
  } catch (e) {
    throw new _PageLoaderNetError.default(e, source);
  }

  try {
    debugCommon('Create source file %s', filepath);
    await response.data.pipe(_fs.default.createWriteStream(filepath));
    return true;
  } catch (e) {
    throw new _PageLoaderFsError.default(e, filepath);
  }
};

const getAttrName = tag => {
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

const getName = url => {
  const nameFromHostName = `${url.hostname.split('.').join('-')}`;
  const nameFromPath = url.pathname.length > 1 ? `${url.pathname.split('/').join('-')}` : '';
  return `${nameFromHostName}${nameFromPath}`;
};

const getFilePath = (sourceUrl, baseUrl) => {
  const name = `${getName(baseUrl)}_files/${getName(sourceUrl)}`;
  const isSourceDirectory = _path.default.extname(sourceUrl.href) === '';
  return isSourceDirectory ? `${name}.html` : name;
};

const getSourcesInfo = (html, tagNames, baseUrl) => {
  const foundLinks = tagNames.reduce((acc, tag) => {
    const links = [];

    _cheerio.default.load(html)(tag).each((i, el) => {
      links[i] = {
        tag,
        origin: (0, _cheerio.default)(el).attr(getAttrName(tag))
      };
    });

    return [...acc, ...links];
  }, []);
  console.log(foundLinks);
  const linksForComparison = foundLinks.map(link => ({ ...link,
    normalized: new URL(link.origin, baseUrl)
  }));
  const localLinks = linksForComparison.filter(({
    normalized,
    origin
  }) => origin && normalized.host === baseUrl.host);
  return localLinks.map(item => ({ ...item,
    newFilePath: getFilePath(item.normalized, baseUrl)
  }));
};

const getNewHtml = (sourcesData, html) => {
  const $ = _cheerio.default.load(html);

  sourcesData.forEach(({
    tag,
    origin,
    newFilePath
  }) => {
    const attrName = getAttrName(tag);
    $(`${tag}[${attrName}="${origin}"]`).attr(attrName, newFilePath);
  });
  return $.html();
};

var _default = async (requestUrl, dir = defaultDir) => {
  const url = new URL(requestUrl);
  const pageName = getName(url);
  const filepath = `${dir}/${pageName}.html`;
  const filesDirName = `${dir}/${pageName}_files`;
  let html;
  let newHtml;
  let filesSource;

  try {
    debugCommon('GET %s', url.href); // debugHttpMain('GET %s', url.href);

    const {
      data
    } = await _axios.default.get(url.href);
    html = data;
    console.log(html);
  } catch (e) {
    throw new _PageLoaderNetError.default(e, url.href);
  }

  try {
    filesSource = getSourcesInfo(html, tags, url);
    console.log(filesSource);
    newHtml = getNewHtml(filesSource, html);
  } catch (e) {
    throw new Error('Failed to parse loaded data. Write us, please');
  }

  try {
    await _promises.default.access(_path.default.dirname(dir));
    await _promises.default.mkdir(dir, {
      recursive: true
    });
  } catch (e) {
    throw new _PageLoaderFsError.default(e, _path.default.dirname(dir));
  }

  try {
    debugCommon('Create file %s', filepath, dir); // debugFs('Create file %s', filepath, dir);

    await _promises.default.writeFile(filepath, newHtml, 'utf-8');
  } catch (e) {
    throw new _PageLoaderFsError.default(e, dir);
  }

  try {
    debugCommon('Create directory %s', filesDirName); // debugFs('Create directory %s', filesDirName);

    await _promises.default.mkdir(filesDirName, {
      recursive: true
    });
  } catch (e) {
    throw new _PageLoaderFsError.default(e, dir);
  }

  filesSource.forEach(item => {
    createFile(item.normalized.href, `${dir}/${item.newFilePath}`);
  });
  return filepath;
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2FwcC9hcHAuanMiXSwibmFtZXMiOlsiZGVidWdDb21tb24iLCJkZWZhdWx0RGlyIiwicHJvY2VzcyIsImN3ZCIsInRhZ3MiLCJjcmVhdGVGaWxlIiwic291cmNlIiwiZmlsZXBhdGgiLCJyZXNwb25zZSIsInJlcXVlc3QiLCJheGlvcyIsImNyZWF0ZSIsImJhc2VVUkwiLCJtZXRob2QiLCJyZXNwb25zZVR5cGUiLCJlIiwiUGFnZUxvYWRlck5ldEVycm9yIiwiZGF0YSIsInBpcGUiLCJmcyIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiUGFnZUxvYWRlckZzRXJyb3IiLCJnZXRBdHRyTmFtZSIsInRhZyIsIkVycm9yIiwiZ2V0TmFtZSIsInVybCIsIm5hbWVGcm9tSG9zdE5hbWUiLCJob3N0bmFtZSIsInNwbGl0Iiwiam9pbiIsIm5hbWVGcm9tUGF0aCIsInBhdGhuYW1lIiwibGVuZ3RoIiwiZ2V0RmlsZVBhdGgiLCJzb3VyY2VVcmwiLCJiYXNlVXJsIiwibmFtZSIsImlzU291cmNlRGlyZWN0b3J5IiwicGF0aCIsImV4dG5hbWUiLCJocmVmIiwiZ2V0U291cmNlc0luZm8iLCJodG1sIiwidGFnTmFtZXMiLCJmb3VuZExpbmtzIiwicmVkdWNlIiwiYWNjIiwibGlua3MiLCJjaGVlcmlvIiwibG9hZCIsImVhY2giLCJpIiwiZWwiLCJvcmlnaW4iLCJhdHRyIiwiY29uc29sZSIsImxvZyIsImxpbmtzRm9yQ29tcGFyaXNvbiIsIm1hcCIsImxpbmsiLCJub3JtYWxpemVkIiwiVVJMIiwibG9jYWxMaW5rcyIsImZpbHRlciIsImhvc3QiLCJpdGVtIiwibmV3RmlsZVBhdGgiLCJnZXROZXdIdG1sIiwic291cmNlc0RhdGEiLCIkIiwiZm9yRWFjaCIsImF0dHJOYW1lIiwicmVxdWVzdFVybCIsImRpciIsInBhZ2VOYW1lIiwiZmlsZXNEaXJOYW1lIiwibmV3SHRtbCIsImZpbGVzU291cmNlIiwiZ2V0IiwicHJvbWlzZXMiLCJhY2Nlc3MiLCJkaXJuYW1lIiwibWtk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LFVBQU0sSUFBSU0sMEJBQUosQ0FBc0JOLENBQXRCLEVBQXlCMkQsR0FBekIsQ0FBTjtBQUNEOztBQUVELE1BQUk7QUFDRjFFLElBQUFBLFdBQVcsQ0FBQyxxQkFBRCxFQUF3QjRFLFlBQXhCLENBQVgsQ0FERSxDQUNnRDs7QUFDbEQsVUFBTUksa0JBQVNHLEtBQVQsQ0FBZVAsWUFBZixFQUE2QjtBQUFFUSxNQUFBQSxTQUFTLEVBQUU7QUFBYixLQUE3QixDQUFOO0FBQ0QsR0FIRCxDQUdFLE9BQU9yRSxDQUFQLEVBQVU7QUFDVixVQUFNLElBQUlNLDBCQUFKLENBQXNCTixDQUF0QixFQUF5QjJELEdBQXpCLENBQU47QUFDRDs7QUFFREksRUFBQUEsV0FBVyxDQUFDUCxPQUFaLENBQXFCTCxJQUFELElBQVU7QUFDNUI3RCxJQUFBQSxVQUFVLENBQUM2RCxJQUFJLENBQUNMLFVBQUwsQ0FBZ0JwQixJQUFqQixFQUF3QixHQUFFaUMsR0FBSSxJQUFHUixJQUFJLENBQUNDLFdBQVksRUFBbEQsQ0FBVjtBQUNELEdBRkQ7QUFHQSxTQUFPNUQsUUFBUDtBQUNELEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCAnYXhpb3MtZGVidWctbG9nJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcHJvbWlzZXMgZnJvbSAnZnMvcHJvbWlzZXMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJztcbmltcG9ydCBQYWdlTG9hZGVyTmV0RXJyb3IgZnJvbSAnLi9lcnJvcnMvUGFnZUxvYWRlck5ldEVycm9yJztcbmltcG9ydCBQYWdlTG9hZGVyRnNFcnJvciBmcm9tICcuL2Vycm9ycy9QYWdlTG9hZGVyRnNFcnJvcic7XG5cbmNvbnN0IGRlYnVnQ29tbW9uID0gZGVidWcoJ3BhZ2UtbG9hZGVyJyk7XG4vKlxuY29uc3QgZGVidWdIdHRwRmlsZXMgPSBkZWJ1ZygncGFnZS1sb2FkZXI6aHR0cDpmaWxlcycpO1xuY29uc3QgZGVidWdIdHRwTWFpbiA9IGRlYnVnKCdwYWdlLWxvYWRlcjpodHRwOm1haW4nKTtcbmNvbnN0IGRlYnVnRnMgPSBkZWJ1ZygncGFnZS1sb2FkZXI6ZnM6Jyk7XG4qL1xuXG5jb25zdCBkZWZhdWx0RGlyID0gcHJvY2Vzcy5jd2QoKTtcbmNvbnN0IHRhZ3MgPSBbJ2ltZycsICdsaW5rJywgJ3NjcmlwdCddO1xuXG5jb25zdCBjcmVhdGVGaWxlID0gYXN5bmMgKHNvdXJjZSwgZmlsZXBhdGgpID0+IHtcbiAgbGV0IHJlc3BvbnNlO1xuICB0cnkge1xuICAgIGRlYnVnQ29tbW9uKCdHRVQgJXMnLCBzb3VyY2UpOyAvLyBkZWJ1Z0h0dHBGaWxlcygnR0VUICVzJywgc291cmNlKTtcbiAgICBjb25zdCByZXF1ZXN0ID0gYXhpb3MuY3JlYXRlKHtcbiAgICAgIGJhc2VVUkw6IHNvdXJjZSxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICByZXNwb25zZVR5cGU6ICdzdHJlYW0nLFxuICAgIH0pO1xuICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdCgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IFBhZ2VMb2FkZXJOZXRFcnJvcihlLCBzb3VyY2UpO1xuICB9XG4gIHRyeSB7XG4gICAgZGVidWdDb21tb24oJ0NyZWF0ZSBzb3VyY2UgZmlsZSAlcycsIGZpbGVwYXRoKTtcbiAgICBhd2FpdCByZXNwb25zZS5kYXRhLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZmlsZXBhdGgpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBQYWdlTG9hZGVyRnNFcnJvcihlLCBmaWxlcGF0aCk7XG4gIH1cbn07XG5cbmNvbnN0IGdldEF0dHJOYW1lID0gKHRhZykgPT4ge1xuICBzd2l0Y2ggKHRhZykge1xuICAgIGNhc2UgJ2ltZyc6XG4gICAgICByZXR1cm4gJ3NyYyc7XG4gICAgY2FzZSAnbGluayc6XG4gICAgICByZXR1cm4gJ2hyZWYnO1xuICAgIGNhc2UgJ3NjcmlwdCc6XG4gICAgICByZXR1cm4gJ3NyYyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biB0YWcgbmFtZScpO1xuICB9XG59O1xuXG5jb25zdCBnZXROYW1lID0gKHVybCkgPT4ge1xuICBjb25zdCBuYW1lRnJvbUhvc3ROYW1lID0gYCR7dXJsLmhvc3RuYW1lLnNwbGl0KCcuJykuam9pbignLScpfWA7XG4gIGNvbnN0IG5hbWVGcm9tUGF0aCA9IHVybC5wYXRobmFtZS5sZW5ndGggPiAxID8gYCR7dXJsLnBhdGhuYW1lLnNwbGl0KCcvJykuam9pbignLScpfWAgOiAnJztcbiAgcmV0dXJuIGAke25hbWVGcm9tSG9zdE5hbWV9JHtuYW1lRnJvbVBhdGh9YDtcbn07XG5cbmNvbnN0IGdldEZpbGVQYXRoID0gKHNvdXJjZVVybCwgYmFzZVVybCkgPT4ge1xuICBjb25zdCBuYW1lID0gYCR7Z2V0TmFtZShiYXNlVXJsKX1fZmlsZXMvJHtnZXROYW1lKHNvdXJjZVVybCl9YDtcbiAgY29uc3QgaXNTb3VyY2VEaXJlY3RvcnkgPSBwYXRoLmV4dG5hbWUoc291cmNlVXJsLmhyZWYpID09PSAnJztcbiAgcmV0dXJuIGlzU291cmNlRGlyZWN0b3J5ID8gYCR7bmFtZX0uaHRtbGAgOiBuYW1lO1xufTtcblxuY29uc3QgZ2V0U291cmNlc0luZm8gPSAoaHRtbCwgdGFnTmFtZXMsIGJhc2VVcmwpID0+IHtcbiAgY29uc3QgZm91bmRMaW5rcyA9IHRhZ05hbWVzLnJlZHVjZSgoYWNjLCB0YWcpID0+IHtcbiAgICBjb25zdCBsaW5rcyA9IFtdO1xuICAgIGNoZWVyaW8ubG9hZChodG1sKSh0YWcpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICBsaW5rc1tpXSA9IHsgdGFnLCBvcmlnaW46IGNoZWVyaW8oZWwpLmF0dHIoZ2V0QXR0ck5hbWUodGFnKSkgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gWy4uLmFjYywgLi4ubGlua3NdO1xuICB9LCBbXSk7XG4gIGNvbnNvbGUubG9nKGZvdW5kTGlua3MpO1xuICBjb25zdCBsaW5rc0ZvckNvbXBhcmlzb24gPSBmb3VuZExpbmtzXG4gICAgLm1hcCgobGluaykgPT4gKHsgLi4ubGluaywgbm9ybWFsaXplZDogbmV3IFVSTChsaW5rLm9yaWdpbiwgYmFzZVVybCkgfSkpO1xuICBjb25zdCBsb2NhbExpbmtzID0gbGlua3NGb3JDb21wYXJpc29uXG4gICAgLmZpbHRlcigoeyBub3JtYWxpemVkLCBvcmlnaW4gfSkgPT4gb3JpZ2luICYmIG5vcm1hbGl6ZWQuaG9zdCA9PT0gYmFzZVVybC5ob3N0KTtcbiAgcmV0dXJuIGxvY2FsTGlua3NcbiAgICAubWFwKChpdGVtKSA9PiAoeyAuLi5pdGVtLCBuZXdGaWxlUGF0aDogZ2V0RmlsZVBhdGgoaXRlbS5ub3JtYWxpemVkLCBiYXNlVXJsKSB9KSk7XG59O1xuXG5jb25zdCBnZXROZXdIdG1sID0gKHNvdXJjZXNEYXRhLCBodG1sKSA9PiB7XG4gIGNvbnN0ICQgPSBjaGVlcmlvLmxvYWQoaHRtbCk7XG4gIHNvdXJjZXNEYXRhLmZvckVhY2goKHsgdGFnLCBvcmlnaW4sIG5ld0ZpbGVQYXRoIH0pID0+IHtcbiAgICBjb25zdCBhdHRyTmFtZSA9IGdldEF0dHJOYW1lKHRhZyk7XG4gICAgJChgJHt0YWd9WyR7YXR0ck5hbWV9PVwiJHtvcmlnaW59XCJdYCkuYXR0cihhdHRyTmFtZSwgbmV3RmlsZVBhdGgpO1xuICB9KTtcbiAgcmV0dXJuICQuaHRtbCgpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcXVlc3RVcmwsIGRpciA9IGRlZmF1bHREaXIpID0+IHtcbiAgY29uc3QgdXJsID0gbmV3IFVSTChyZXF1ZXN0VXJsKTtcbiAgY29uc3QgcGFnZU5hbWUgPSBnZXROYW1lKHVybCk7XG4gIGNvbnN0IGZpbGVwYXRoID0gYCR7ZGlyfS8ke3BhZ2VOYW1lfS5odG1sYDtcbiAgY29uc3QgZmlsZXNEaXJOYW1lID0gYCR7ZGlyfS8ke3BhZ2VOYW1lfV9maWxlc2A7XG4gIGxldCBodG1sO1xuICBsZXQgbmV3SHRtbDtcbiAgbGV0IGZpbGVzU291cmNlO1xuXG4gIHRyeSB7XG4gICAgZGVidWdDb21tb24oJ0dFVCAlcycsIHVybC5ocmVmKTsgLy8gZGVidWdIdHRwTWFpbignR0VUICVzJywgdXJsLmhyZWYpO1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgYXhpb3MuZ2V0KHVybC5ocmVmKTtcbiAgICBodG1sID0gZGF0YTtcbiAgICBjb25zb2xlLmxvZyhodG1sKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBQYWdlTG9hZGVyTmV0RXJyb3IoZSwgdXJsLmhyZWYpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBmaWxlc1NvdXJjZSA9IGdldFNvdXJjZXNJbmZvKGh0bWwsIHRhZ3MsIHVybCk7XG4gICAgY29uc29sZS5sb2coZmlsZXNTb3VyY2UpO1xuICAgIG5ld0h0bWwgPSBnZXROZXdIdG1sKGZpbGVzU291cmNlLCBodG1sKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHBhcnNlIGxvYWRlZCBkYXRhLiBXcml0ZSB1cywgcGxlYXNlJyk7XG4gIH1cblxuICB0cnkge1xuICAgIGF3YWl0IHByb21pc2VzLmFjY2VzcyhwYXRoLmRpcm5hbWUoZGlyKSk7XG4gICAgYXdhaXQgcHJvbWlzZXMubWtkaXIoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBQYWdlTG9hZGVyRnNFcnJvcihlLCBwYXRoLmRpcm5hbWUoZGlyKSk7XG4gIH1cblxuICB0cnkge1xuICAgIGRlYnVnQ29tbW9uKCdDcmVhdGUgZmlsZSAlcycsIGZpbGVwYXRoLCBkaXIpOyAvLyBkZWJ1Z0ZzKCdDcmVhdGUgZmlsZSAlcycsIGZpbGVwYXRoLCBkaXIpO1xuICAgIGF3YWl0IHByb21pc2VzLndyaXRlRmlsZShmaWxlcGF0aCwgbmV3SHRtbCwgJ3V0Zi04Jyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgUGFnZUxvYWRlckZzRXJyb3IoZSwgZGlyKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgZGVidWdDb21tb24oJ0NyZWF0ZSBkaXJlY3RvcnkgJXMnLCBmaWxlc0Rpck5hbWUpOyAvLyBkZWJ1Z0ZzKCdDcmVhdGUgZGlyZWN0b3J5ICVzJywgZmlsZXNEaXJOYW1lKTtcbiAgICBhd2FpdCBwcm9taXNlcy5ta2RpcihmaWxlc0Rpck5hbWUsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IFBhZ2VMb2FkZXJGc0Vycm9yKGUsIGRpcik7XG4gIH1cblxuICBmaWxlc1NvdXJjZS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgY3JlYXRlRmlsZShpdGVtLm5vcm1hbGl6ZWQuaHJlZiwgYCR7ZGlyfS8ke2l0ZW0ubmV3RmlsZVBhdGh9YCk7XG4gIH0pO1xuICByZXR1cm4gZmlsZXBhdGg7XG59O1xuIl19