"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSkylink = exports.convertSkylinkToBase64 = exports.convertSkylinkToBase32 = void 0;
const sia_1 = require("./sia");
const encoding_1 = require("../utils/encoding");
const string_1 = require("../utils/string");
const url_1 = require("../utils/url");
const validation_1 = require("../utils/validation");
/**
 * Converts the given base64 skylink to base32.
 *
 * @param skylink - The base64 skylink.
 * @returns - The converted base32 skylink.
 */
function convertSkylinkToBase32(skylink) {
    skylink = (0, string_1.trimUriPrefix)(skylink, url_1.URI_SKYNET_PREFIX);
    (0, validation_1.validateStringLen)("skylink", skylink, "parameter", sia_1.BASE64_ENCODED_SKYLINK_SIZE);
    const bytes = (0, encoding_1.decodeSkylinkBase64)(skylink);
    return (0, encoding_1.encodeSkylinkBase32)(bytes);
}
exports.convertSkylinkToBase32 = convertSkylinkToBase32;
/**
 * Converts the given base32 skylink to base64.
 *
 * @param skylink - The base32 skylink.
 * @returns - The converted base64 skylink.
 */
function convertSkylinkToBase64(skylink) {
    skylink = (0, string_1.trimUriPrefix)(skylink, url_1.URI_SKYNET_PREFIX);
    (0, validation_1.validateStringLen)("skylink", skylink, "parameter", sia_1.BASE32_ENCODED_SKYLINK_SIZE);
    const bytes = (0, encoding_1.decodeSkylinkBase32)(skylink);
    return (0, encoding_1.encodeSkylinkBase64)(bytes);
}
exports.convertSkylinkToBase64 = convertSkylinkToBase64;
/**
 * Formats the skylink by adding the sia: prefix.
 *
 * @param skylink - The skylink.
 * @returns - The formatted skylink.
 */
function formatSkylink(skylink) {
    (0, validation_1.validateString)("skylink", skylink, "parameter");
    if (skylink === "") {
        return skylink;
    }
    if (!skylink.startsWith(url_1.URI_SKYNET_PREFIX)) {
        skylink = `${url_1.URI_SKYNET_PREFIX}${skylink}`;
    }
    return skylink;
}
exports.formatSkylink = formatSkylink;
