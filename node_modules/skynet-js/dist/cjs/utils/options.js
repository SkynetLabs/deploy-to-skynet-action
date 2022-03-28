"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractOptions = exports.DEFAULT_BASE_OPTIONS = void 0;
// TODO: Move to client.ts.
/**
 * The default base custom options.
 */
exports.DEFAULT_BASE_OPTIONS = {
    APIKey: "",
    skynetApiKey: "",
    customUserAgent: "",
    customCookie: "",
    onDownloadProgress: undefined,
    onUploadProgress: undefined,
    loginFn: undefined,
};
/**
 * Extract only the model's custom options from the given options.
 *
 * @param opts - The given options.
 * @param model - The model options.
 * @returns - The extracted custom options.
 * @throws - If the given opts don't contain all properties of the model.
 */
function extractOptions(opts, model) {
    const result = {};
    for (const property in model) {
        /* istanbul ignore next */
        if (!Object.prototype.hasOwnProperty.call(model, property)) {
            continue;
        }
        // Throw if the given options don't contain the model's property.
        if (!Object.prototype.hasOwnProperty.call(opts, property)) {
            throw new Error(`Property '${property}' not found`);
        }
        result[property] = opts[property];
    }
    return result;
}
exports.extractOptions = extractOptions;
