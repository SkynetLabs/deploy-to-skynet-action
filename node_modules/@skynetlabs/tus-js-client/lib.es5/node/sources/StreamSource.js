"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SlicingStream = _interopRequireDefault(require("./SlicingStream"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var StreamSource = /*#__PURE__*/function () {
  function StreamSource(stream, chunkSize) {
    var _this = this;

    _classCallCheck(this, StreamSource); // Ensure that chunkSize is an integer and not something else or Infinity.


    chunkSize = +chunkSize;

    if (!isFinite(chunkSize)) {
      throw new Error('cannot create source for stream without a finite value for the `chunkSize` option');
    }

    this._stream = stream; // Setting the size to null indicates that we have no calculation available
    // for how much data this stream will emit requiring the user to specify
    // it manually (see the `uploadSize` option).

    this.size = null;
    stream.pause();
    this._done = false;
    stream.on('end', function () {
      return _this._done = true;
    });
    this._buf = Buffer.alloc(chunkSize);
    this._bufPos = null;
    this._bufLen = 0;
  }

  _createClass(StreamSource, [{
    key: "slice",
    value: function slice(start, end) {
      // Always attempt to drain the buffer first, even if this means that we
      // return less data, then the caller requested.
      if (start >= this._bufPos && start < this._bufPos + this._bufLen) {
        var bufStart = start - this._bufPos;
        var bufEnd = Math.min(this._bufLen, end - this._bufPos);

        var buf = this._buf.slice(bufStart, bufEnd);

        buf.size = buf.length;
        return Promise.resolve({
          value: buf
        });
      } // Fail fast if the caller requests a proportion of the data which is not
      // available any more.


      if (start < this._bufPos) {
        return Promise.reject(new Error('cannot slice from position which we already seeked away'));
      }

      if (this._done) {
        return Promise.resolve({
          value: null,
          done: this._done
        });
      }

      var bytesToSkip = start - (this._bufPos + this._bufLen);
      this._bufLen = 0;
      this._bufPos = start;
      var bytesToRead = end - start;
      var slicingStream = new _SlicingStream.default(bytesToSkip, bytesToRead, this);

      this._stream.pipe(slicingStream);

      return Promise.resolve({
        value: slicingStream
      });
    }
  }, {
    key: "close",
    value: function close() {// not implemented
    }
  }]);

  return StreamSource;
}();

exports.default = StreamSource;