"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commander = require("commander");

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _app = _interopRequireDefault(require("../app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pkg = JSON.parse(_fs.default.readFileSync(_path.default.resolve(__dirname, '../../package.json')));

var _default = () => {
  _commander.program.version(pkg.version);

  _commander.program.description('downloads a page from the network and puts it in the specified directory (by default, in the program launch directory).');

  _commander.program.option('-o, --output [dir]', 'output dir (default: "/").');

  _commander.program.arguments('<url>');

  _commander.program.action((url, options) => (0, _app.default)(url, options.output));

  _commander.program.parse(process.argv);
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9jbGkvaW5kZXguanMiXSwibmFtZXMiOlsicGtnIiwiSlNPTiIsInBhcnNlIiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJwYXRoIiwicmVzb2x2ZSIsIl9fZGlybmFtZSIsInByb2dyYW0iLCJ2ZXJzaW9uIiwiZGVzY3JpcHRpb24iLCJvcHRpb24iLCJhcmd1bWVudHMiLCJhY3Rpb24iLCJ1cmwiLCJvcHRpb25zIiwib3V0cHV0IiwicHJvY2VzcyIsImFyZ3YiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLEdBQUcsR0FBR0MsSUFBSSxDQUFDQyxLQUFMLENBQVdDLFlBQUdDLFlBQUgsQ0FBZ0JDLGNBQUtDLE9BQUwsQ0FBYUMsU0FBYixFQUF3QixvQkFBeEIsQ0FBaEIsQ0FBWCxDQUFaOztlQUVlLE1BQU07QUFDbkJDLHFCQUFRQyxPQUFSLENBQWdCVCxHQUFHLENBQUNTLE9BQXBCOztBQUNBRCxxQkFBUUUsV0FBUixDQUFvQix5SEFBcEI7O0FBQ0FGLHFCQUFRRyxNQUFSLENBQWUsb0JBQWYsRUFBcUMsNEJBQXJDOztBQUNBSCxxQkFBUUksU0FBUixDQUFrQixPQUFsQjs7QUFDQUoscUJBQVFLLE1BQVIsQ0FBZSxDQUFDQyxHQUFELEVBQU1DLE9BQU4sS0FBa0Isa0JBQVdELEdBQVgsRUFBZ0JDLE9BQU8sQ0FBQ0MsTUFBeEIsQ0FBakM7O0FBQ0FSLHFCQUFRTixLQUFSLENBQWNlLE9BQU8sQ0FBQ0MsSUFBdEI7QUFDRCxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcHJvZ3JhbSB9IGZyb20gJ2NvbW1hbmRlcic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGFnZUxvYWRlciBmcm9tICcuLi9hcHAnO1xuXG5jb25zdCBwa2cgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZS5qc29uJykpKTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuICBwcm9ncmFtLnZlcnNpb24ocGtnLnZlcnNpb24pO1xuICBwcm9ncmFtLmRlc2NyaXB0aW9uKCdkb3dubG9hZHMgYSBwYWdlIGZyb20gdGhlIG5ldHdvcmsgYW5kIHB1dHMgaXQgaW4gdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgKGJ5IGRlZmF1bHQsIGluIHRoZSBwcm9ncmFtIGxhdW5jaCBkaXJlY3RvcnkpLicpO1xuICBwcm9ncmFtLm9wdGlvbignLW8sIC0tb3V0cHV0IFtkaXJdJywgJ291dHB1dCBkaXIgKGRlZmF1bHQ6IFwiL1wiKS4nKTtcbiAgcHJvZ3JhbS5hcmd1bWVudHMoJzx1cmw+Jyk7XG4gIHByb2dyYW0uYWN0aW9uKCh1cmwsIG9wdGlvbnMpID0+IHBhZ2VMb2FkZXIodXJsLCBvcHRpb25zLm91dHB1dCkpO1xuICBwcm9ncmFtLnBhcnNlKHByb2Nlc3MuYXJndik7XG59O1xuIl19