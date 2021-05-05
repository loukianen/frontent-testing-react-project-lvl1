const getCaseText = (code) => {
  switch (code) {
    case -2:
      return 'no such file or directory';
    default:
      return 'was unknown error. Write us, please';
  }
};

const getReason = (err) => (err.errno
  ? `; - ${getCaseText(err.errno)}.` : '.');

export default class extends Error {
  constructor(error, sourcePath = '') {
    super(error.name, error.fileName, error.lineNumber);
    this.name = 'Page-loader file system Error';
    this.error = error;
    this.sourcePath = sourcePath;
    this.message = `\nFailed to write data into ${this.sourcePath}${getReason(this.error)}\n`;
  }
}
