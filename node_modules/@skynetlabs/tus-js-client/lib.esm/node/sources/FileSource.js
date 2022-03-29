function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { createReadStream } from 'fs';

var FileSource = /*#__PURE__*/function () {
  function FileSource(stream) {
    _classCallCheck(this, FileSource);

    this._stream = stream;
    this._path = stream.path.toString();
  }

  _createClass(FileSource, [{
    key: "slice",
    value: function slice(start, end) {
      var stream = createReadStream(this._path, {
        start: start,
        // The `end` option for createReadStream is treated inclusively
        // (see https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options).
        // However, the Buffer#slice(start, end) and also our Source#slice(start, end)
        // method treat the end range exclusively, so we have to subtract 1.
        // This prevents an off-by-one error when reporting upload progress.
        end: end - 1,
        autoClose: true
      });
      stream.size = end - start;
      return Promise.resolve({
        value: stream
      });
    }
  }, {
    key: "close",
    value: function close() {
      this._stream.destroy();
    }
  }]);

  return FileSource;
}();

export { FileSource as default };