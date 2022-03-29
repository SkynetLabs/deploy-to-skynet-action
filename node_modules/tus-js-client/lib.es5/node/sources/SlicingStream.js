"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stream = require("stream");

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

var SlicingStream = /*#__PURE__*/function (_Transform) {
  _inherits(SlicingStream, _Transform);

  var _super = _createSuper(SlicingStream);

  function SlicingStream(bytesToSkip, bytesToRead, source) {
    var _this;

    _classCallCheck(this, SlicingStream);

    _this = _super.call(this); // The number of bytes we have to discard before we start emitting data.

    _this._bytesToSkip = bytesToSkip; // The number of bytes we will emit in the data events before ending this stream.

    _this._bytesToRead = bytesToRead; // Points to the StreamSource object which created this SlicingStream.
    // This reference is used for manipulating the _bufLen and _buf properties
    // directly.

    _this._source = source;
    return _this;
  }

  _createClass(SlicingStream, [{
    key: "_transform",
    value: function _transform(chunk, encoding, callback) {
      // Calculate the number of bytes we still have to skip before we can emit data.
      var bytesSkipped = Math.min(this._bytesToSkip, chunk.length);
      this._bytesToSkip -= bytesSkipped; // Calculate the number of bytes we can emit after we skipped enough data.

      var bytesAvailable = chunk.length - bytesSkipped; // If no bytes are available, because the entire chunk was skipped, we can
      // return earily.

      if (bytesAvailable === 0) {
        callback(null);
        return;
      }

      var bytesToRead = Math.min(this._bytesToRead, bytesAvailable);
      this._bytesToRead -= bytesToRead;

      if (bytesToRead !== 0) {
        var data = chunk.slice(bytesSkipped, bytesSkipped + bytesToRead);
        this._source._bufLen += data.copy(this._source._buf, this._source._bufLen);
        this.push(data);
      } // If we do not have to read any more bytes for this transform stream, we
      // end it and also unpipe our source, to avoid calls to _transform in the
      // future


      if (this._bytesToRead === 0) {
        this._source._stream.unpipe(this);

        this.end();
      } // If we did not use all the available data, we return it to the source
      // so the next SlicingStream can handle it.


      if (bytesToRead !== bytesAvailable) {
        var unusedChunk = chunk.slice(bytesSkipped + bytesToRead);

        this._source._stream.unshift(unusedChunk);
      }

      callback(null);
    }
  }]);

  return SlicingStream;
}(_stream.Transform);

exports.default = SlicingStream;