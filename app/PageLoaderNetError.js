const getCaseText = (code) => {
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

const getReason = (err) => (err.response
  ? `; - ${getCaseText(err.response.status)}.` : '.');

export default class extends Error {
  constructor(error, sourcePath = '') {
    super(error.name, error.fileName, error.lineNumber);
    this.name = 'Page-loader Network Error';
    this.error = error;
    this.sourcePath = sourcePath;
    this.message = `\nFailed to load data from ${this.sourcePath}${getReason(this.error)}\n`;
  }
}
