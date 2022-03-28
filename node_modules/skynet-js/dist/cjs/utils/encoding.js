"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeUtf8String = exports.encodePrefixedBytes = exports.encodeBigintAsUint64 = exports.encodeNumber = exports.encodeSkylinkBase64 = exports.decodeSkylinkBase64 = exports.encodeSkylinkBase32 = exports.decodeSkylinkBase32 = void 0;
const base32_decode_1 = __importDefault(require("base32-decode"));
const base32_encode_1 = __importDefault(require("base32-encode"));
const base64_js_1 = require("base64-js");
const number_1 = require("./number");
const sia_1 = require("../skylink/sia");
const string_1 = require("./string");
const validation_1 = require("./validation");
const BASE32_ENCODING_VARIANT = "RFC4648-HEX";
/**
 * Decodes the skylink encoded using base32 encoding to bytes.
 *
 * @param skylink - The encoded skylink.
 * @returns - The decoded bytes.
 */
function decodeSkylinkBase32(skylink) {
    (0, validation_1.validateStringLen)("skylink", skylink, "parameter", sia_1.BASE32_ENCODED_SKYLINK_SIZE);
    skylink = skylink.toUpperCase();
    const bytes = (0, base32_decode_1.default)(skylink, BASE32_ENCODING_VARIANT);
    return new Uint8Array(bytes);
}
exports.decodeSkylinkBase32 = decodeSkylinkBase32;
/**
 * Encodes the bytes to a skylink encoded using base32 encoding.
 *
 * @param bytes - The bytes to encode.
 * @returns - The encoded skylink.
 */
function encodeSkylinkBase32(bytes) {
    return (0, base32_encode_1.default)(bytes, BASE32_ENCODING_VARIANT, { padding: false }).toLowerCase();
}
exports.encodeSkylinkBase32 = encodeSkylinkBase32;
/**
 * Decodes the skylink encoded using base64 raw URL encoding to bytes.
 *
 * @param skylink - The encoded skylink.
 * @returns - The decoded bytes.
 */
function decodeSkylinkBase64(skylink) {
    (0, validation_1.validateStringLen)("skylink", skylink, "parameter", sia_1.BASE64_ENCODED_SKYLINK_SIZE);
    // Add padding.
    skylink = `${skylink}==`;
    // Convert from URL encoding.
    skylink = skylink.replace(/-/g, "+").replace(/_/g, "/");
    return (0, base64_js_1.toByteArray)(skylink);
}
exports.decodeSkylinkBase64 = decodeSkylinkBase64;
/**
 * Encodes the bytes to a skylink encoded using base64 raw URL encoding.
 *
 * @param bytes - The bytes to encode.
 * @returns - The encoded skylink.
 */
function encodeSkylinkBase64(bytes) {
    let base64 = (0, base64_js_1.fromByteArray)(bytes);
    // Convert to URL encoding.
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_");
    // Remove trailing "==". This will always be present as the skylink encoding
    // gets padded so that the string is a multiple of 4 characters in length.
    return base64.slice(0, -2);
}
exports.encodeSkylinkBase64 = encodeSkylinkBase64;
/**
 * Converts the given number into a uint8 array. Uses little-endian encoding.
 *
 * @param num - Number to encode.
 * @returns - Number encoded as a byte array.
 */
function encodeNumber(num) {
    const encoded = new Uint8Array(8);
    for (let index = 0; index < encoded.length; index++) {
        const byte = num & 0xff;
        encoded[index] = byte;
        num = num >> 8;
    }
    return encoded;
}
exports.encodeNumber = encodeNumber;
/**
 * Encodes the given bigint into a uint8 array. Uses little-endian encoding.
 *
 * @param int - Bigint to encode.
 * @returns - Bigint encoded as a byte array.
 * @throws - Will throw if the int does not fit in 64 bits.
 */
function encodeBigintAsUint64(int) {
    // Assert the input is 64 bits.
    (0, number_1.assertUint64)(int);
    const encoded = new Uint8Array(8);
    for (let index = 0; index < encoded.length; index++) {
        const byte = int & BigInt(0xff);
        encoded[index] = Number(byte);
        int = int >> BigInt(8);
    }
    return encoded;
}
exports.encodeBigintAsUint64 = encodeBigintAsUint64;
/**
 * Encodes the uint8array, prefixed by its length.
 *
 * @param bytes - The input array.
 * @returns - The encoded byte array.
 */
function encodePrefixedBytes(bytes) {
    const len = bytes.length;
    const buf = new ArrayBuffer(8 + len);
    const view = new DataView(buf);
    // Sia uses setUint64 which is unavailable in JS.
    view.setUint32(0, len, true);
    const uint8Bytes = new Uint8Array(buf);
    uint8Bytes.set(bytes, 8);
    return uint8Bytes;
}
exports.encodePrefixedBytes = encodePrefixedBytes;
/**
 * Encodes the given UTF-8 string into a uint8 array containing the string length and the string.
 *
 * @param str - String to encode.
 * @returns - String encoded as a byte array.
 */
function encodeUtf8String(str) {
    const byteArray = (0, string_1.stringToUint8ArrayUtf8)(str);
    const encoded = new Uint8Array(8 + byteArray.length);
    encoded.set(encodeNumber(byteArray.length));
    encoded.set(byteArray, 8);
    return encoded;
}
exports.encodeUtf8String = encodeUtf8String;
