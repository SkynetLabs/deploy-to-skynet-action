function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { ReadStream } from 'fs';
import isStream from 'is-stream';
import BufferSource from './sources/BufferSource';
import FileSource from './sources/FileSource';
import StreamSource from './sources/StreamSource';

var FileReader = /*#__PURE__*/function () {
  function FileReader() {
    _classCallCheck(this, FileReader);
  }

  _createClass(FileReader, [{
    key: "openFile",
    value: function openFile(input, chunkSize) {
      if (Buffer.isBuffer(input)) {
        return Promise.resolve(new BufferSource(input));
      }

      if (input instanceof ReadStream && input.path != null) {
        return Promise.resolve(new FileSource(input));
      }

      if (isStream.readable(input)) {
        return Promise.resolve(new StreamSource(input, chunkSize));
      }

      return Promise.reject(new Error('source object may only be an instance of Buffer or Readable in this environment'));
    }
  }]);

  return FileReader;
}();

export { FileReader as default };