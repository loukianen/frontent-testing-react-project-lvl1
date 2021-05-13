"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const getCaseText = code => {
  switch (code) {
    case -2:
      return 'no such file or directory';

    default:
      return 'was unknown error. Write us, please';
  }
};

const getReason = err => err.errno ? `; - ${getCaseText(err.errno)}.` : '.';

class _default extends Error {
  constructor(error, sourcePath = '') {
    super(error.name, error.fileName, error.lineNumber);
    this.name = 'Page-loader file system Error';
    this.message = `\nFailed to write data into ${sourcePath}${getReason(error)}\n`;
  }

}

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9lcnJvcnMvUGFnZUxvYWRlckZzRXJyb3IuanMiXSwibmFtZXMiOlsiZ2V0Q2FzZVRleHQiLCJjb2RlIiwiZ2V0UmVhc29uIiwiZXJyIiwiZXJybm8iLCJFcnJvciIsImNvbnN0cnVjdG9yIiwiZXJyb3IiLCJzb3VyY2VQYXRoIiwibmFtZSIsImZpbGVOYW1lIiwibGluZU51bWJlciIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSxNQUFNQSxXQUFXLEdBQUlDLElBQUQsSUFBVTtBQUM1QixVQUFRQSxJQUFSO0FBQ0UsU0FBSyxDQUFDLENBQU47QUFDRSxhQUFPLDJCQUFQOztBQUNGO0FBQ0UsYUFBTyxxQ0FBUDtBQUpKO0FBTUQsQ0FQRDs7QUFTQSxNQUFNQyxTQUFTLEdBQUlDLEdBQUQsSUFBVUEsR0FBRyxDQUFDQyxLQUFKLEdBQ3ZCLE9BQU1KLFdBQVcsQ0FBQ0csR0FBRyxDQUFDQyxLQUFMLENBQVksR0FETixHQUNXLEdBRHZDOztBQUdlLHVCQUFjQyxLQUFkLENBQW9CO0FBQ2pDQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUUMsVUFBVSxHQUFHLEVBQXJCLEVBQXlCO0FBQ2xDLFVBQU1ELEtBQUssQ0FBQ0UsSUFBWixFQUFrQkYsS0FBSyxDQUFDRyxRQUF4QixFQUFrQ0gsS0FBSyxDQUFDSSxVQUF4QztBQUNBLFNBQUtGLElBQUwsR0FBWSwrQkFBWjtBQUNBLFNBQUtHLE9BQUwsR0FBZ0IsK0JBQThCSixVQUFXLEdBQUVOLFNBQVMsQ0FBQ0ssS0FBRCxDQUFRLElBQTVFO0FBQ0Q7O0FBTGdDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZ2V0Q2FzZVRleHQgPSAoY29kZSkgPT4ge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlIC0yOlxuICAgICAgcmV0dXJuICdubyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5JztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICd3YXMgdW5rbm93biBlcnJvci4gV3JpdGUgdXMsIHBsZWFzZSc7XG4gIH1cbn07XG5cbmNvbnN0IGdldFJlYXNvbiA9IChlcnIpID0+IChlcnIuZXJybm9cbiAgPyBgOyAtICR7Z2V0Q2FzZVRleHQoZXJyLmVycm5vKX0uYCA6ICcuJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihlcnJvciwgc291cmNlUGF0aCA9ICcnKSB7XG4gICAgc3VwZXIoZXJyb3IubmFtZSwgZXJyb3IuZmlsZU5hbWUsIGVycm9yLmxpbmVOdW1iZXIpO1xuICAgIHRoaXMubmFtZSA9ICdQYWdlLWxvYWRlciBmaWxlIHN5c3RlbSBFcnJvcic7XG4gICAgdGhpcy5tZXNzYWdlID0gYFxcbkZhaWxlZCB0byB3cml0ZSBkYXRhIGludG8gJHtzb3VyY2VQYXRofSR7Z2V0UmVhc29uKGVycm9yKX1cXG5gO1xuICB9XG59XG4iXX0=