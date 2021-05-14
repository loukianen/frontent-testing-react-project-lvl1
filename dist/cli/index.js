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

  _commander.program.option('-o, --output [dir]', 'output dir (default: "/").', process.cwd());

  _commander.program.arguments('<url>');

  _commander.program.action((url, options) => (0, _app.default)(url, options.output));

  _commander.program.parse(process.argv);
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9jbGkvaW5kZXguanMiXSwibmFtZXMiOlsicGtnIiwiSlNPTiIsInBhcnNlIiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJwYXRoIiwicmVzb2x2ZSIsIl9fZGlybmFtZSIsInByb2dyYW0iLCJ2ZXJzaW9uIiwiZGVzY3JpcHRpb24iLCJvcHRpb24iLCJwcm9jZXNzIiwiY3dkIiwiYXJndW1lbnRzIiwiYWN0aW9uIiwidXJsIiwib3B0aW9ucyIsIm91dHB1dCIsImFyZ3YiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLEdBQUcsR0FBR0MsSUFBSSxDQUFDQyxLQUFMLENBQVdDLFlBQUdDLFlBQUgsQ0FBZ0JDLGNBQUtDLE9BQUwsQ0FBYUMsU0FBYixFQUF3QixvQkFBeEIsQ0FBaEIsQ0FBWCxDQUFaOztlQUVlLE1BQU07QUFDbkJDLHFCQUFRQyxPQUFSLENBQWdCVCxHQUFHLENBQUNTLE9BQXBCOztBQUNBRCxxQkFBUUUsV0FBUixDQUFvQix5SEFBcEI7O0FBQ0FGLHFCQUFRRyxNQUFSLENBQWUsb0JBQWYsRUFBcUMsNEJBQXJDLEVBQW1FQyxPQUFPLENBQUNDLEdBQVIsRUFBbkU7O0FBQ0FMLHFCQUFRTSxTQUFSLENBQWtCLE9BQWxCOztBQUNBTixxQkFBUU8sTUFBUixDQUFlLENBQUNDLEdBQUQsRUFBTUMsT0FBTixLQUFrQixrQkFBV0QsR0FBWCxFQUFnQkMsT0FBTyxDQUFDQyxNQUF4QixDQUFqQzs7QUFDQVYscUJBQVFOLEtBQVIsQ0FBY1UsT0FBTyxDQUFDTyxJQUF0QjtBQUNELEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwcm9ncmFtIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYWdlTG9hZGVyIGZyb20gJy4uL2FwcCc7XG5cbmNvbnN0IHBrZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlLmpzb24nKSkpO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIHByb2dyYW0udmVyc2lvbihwa2cudmVyc2lvbik7XG4gIHByb2dyYW0uZGVzY3JpcHRpb24oJ2Rvd25sb2FkcyBhIHBhZ2UgZnJvbSB0aGUgbmV0d29yayBhbmQgcHV0cyBpdCBpbiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeSAoYnkgZGVmYXVsdCwgaW4gdGhlIHByb2dyYW0gbGF1bmNoIGRpcmVjdG9yeSkuJyk7XG4gIHByb2dyYW0ub3B0aW9uKCctbywgLS1vdXRwdXQgW2Rpcl0nLCAnb3V0cHV0IGRpciAoZGVmYXVsdDogXCIvXCIpLicsIHByb2Nlc3MuY3dkKCkpO1xuICBwcm9ncmFtLmFyZ3VtZW50cygnPHVybD4nKTtcbiAgcHJvZ3JhbS5hY3Rpb24oKHVybCwgb3B0aW9ucykgPT4gcGFnZUxvYWRlcih1cmwsIG9wdGlvbnMub3V0cHV0KSk7XG4gIHByb2dyYW0ucGFyc2UocHJvY2Vzcy5hcmd2KTtcbn07XG4iXX0=