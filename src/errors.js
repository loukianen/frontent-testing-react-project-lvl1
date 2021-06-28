const getNetCaseText = (code) => {
  let text = 'info';
  if (code >= 300) {
    text = 'request was redirected';
  }
  if (code >= 400) {
    text = 'request was wrong';
  }
  if (code >= 500) {
    text = 'was error on the server';
  }
  return `${text}, code: ${code}`;
};

const getFsCaseText = (code) => {
  switch (code) {
    case -2:
      return 'no such file or directory';
    default:
      return 'was unknown error. Write us, please';
  }
};

const getReason = (err) => {
  if (err.response) {
    return `; - ${getNetCaseText(err.response.status)}.`;
  }
  if (err.errno) {
    return `; - ${getFsCaseText(err.errno)}.`;
  }
  return '.';
};

const getCommonParts = (errorType) => {
  switch (errorType) {
    case 'fs':
      return {
        name: 'Page-loader file system Error',
        message: 'Failed to write data into',
      };
    case 'net':
      return {
        name: 'Page-loader Network Error',
        message: 'Failed to load data fromFailed to load data from',
      };
    default:
      throw new Error('Unknown page-loader error type');
  }
};

export default (error, sourcePath = '', errorType) => {
  const pageloaderError = error;
  const { name, message } = getCommonParts(errorType);

  pageloaderError.name = name;
  pageloaderError.message = `\n${message} ${sourcePath}${getReason(error)}\n`;

  return pageloaderError;
};
