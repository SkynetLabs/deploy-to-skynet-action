"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinSkylink = exports.DEFAULT_PIN_OPTIONS = void 0;
const format_1 = require("./skylink/format");
const parse_1 = require("./skylink/parse");
const options_1 = require("./utils/options");
const validation_1 = require("./utils/validation");
exports.DEFAULT_PIN_OPTIONS = {
    ...options_1.DEFAULT_BASE_OPTIONS,
    endpointPin: "/skynet/pin",
};
/**
 * Re-pins the given skylink.
 *
 * @param this - SkynetClient
 * @param skylinkUrl - 46-character skylink, or a valid skylink URL.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned JSON and revision number.
 * @throws - Will throw if the returned signature does not match the returned entry, or if the skylink in the entry is invalid.
 */
async function pinSkylink(skylinkUrl, customOptions) {
    const skylink = (0, validation_1.validateSkylinkString)("skylinkUrl", skylinkUrl, "parameter");
    const opts = { ...exports.DEFAULT_PIN_OPTIONS, ...this.customOptions, ...customOptions };
    // Don't include the path since the endpoint doesn't support it.
    const path = (0, parse_1.parseSkylink)(skylinkUrl, { onlyPath: true });
    if (path) {
        throw new Error("Skylink string should not contain a path");
    }
    const response = await this.executeRequest({
        ...opts,
        endpointPath: opts.endpointPin,
        method: "post",
        extraPath: skylink,
    });
    // Sanity check.
    validatePinResponse(response);
    // Get the skylink.
    let returnedSkylink = response.headers["skynet-skylink"];
    // Format the skylink.
    returnedSkylink = (0, format_1.formatSkylink)(returnedSkylink);
    return { skylink: returnedSkylink };
}
exports.pinSkylink = pinSkylink;
/**
 * Validates the pin response.
 *
 * @param response - The pin response.
 * @throws - Will throw if not a valid pin response.
 */
function validatePinResponse(response) {
    try {
        if (!response.headers) {
            throw new Error("response.headers field missing");
        }
        (0, validation_1.validateString)('response.headers["skynet-skylink"]', response.headers["skynet-skylink"], "pin response field");
    }
    catch (err) {
        throw new Error(`Did not get a complete pin response despite a successful request. Please try again and report this issue to the devs if it persists. ${err}`);
    }
}
