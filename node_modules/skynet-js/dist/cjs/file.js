"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJSONEncrypted = exports.getEntryData = exports.getEntryLink = exports.getJSON = void 0;
const encrypted_files_1 = require("./mysky/encrypted_files");
const tweak_1 = require("./mysky/tweak");
const registry_1 = require("./registry");
const skydb_v2_1 = require("./skydb_v2");
const validation_1 = require("./utils/validation");
// ====
// JSON
// ====
/**
 * Gets Discoverable JSON set with MySky at the given data path for the given
 * public user ID.
 *
 * @param this - SkynetClient
 * @param userID - The MySky public user ID.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 */
async function getJSON(userID, path, customOptions) {
    (0, validation_1.validateString)("userID", userID, "parameter");
    (0, validation_1.validateString)("path", path, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", skydb_v2_1.DEFAULT_GET_JSON_OPTIONS);
    const opts = {
        ...skydb_v2_1.DEFAULT_GET_JSON_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    const dataKey = (0, tweak_1.deriveDiscoverableFileTweak)(path);
    opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.
    return await this.dbV2.getJSON(userID, dataKey, opts);
}
exports.getJSON = getJSON;
// =====
// Entry
// =====
/**
 * Gets the entry link for the entry set with MySky at the given data path, for
 * the given public user ID. This is a v2 skylink. This link stays the same even
 * if the content at the entry changes.
 *
 * @param this - SkynetClient
 * @param userID - The MySky public user ID.
 * @param path - The data path.
 * @returns - The entry link.
 */
async function getEntryLink(userID, path) {
    (0, validation_1.validateString)("userID", userID, "parameter");
    (0, validation_1.validateString)("path", path, "parameter");
    const dataKey = (0, tweak_1.deriveDiscoverableFileTweak)(path);
    // Do not hash the tweak anymore.
    const opts = { ...registry_1.DEFAULT_GET_ENTRY_OPTIONS, hashedDataKeyHex: true };
    return (0, registry_1.getEntryLink)(userID, dataKey, opts);
}
exports.getEntryLink = getEntryLink;
/**
 * Gets the entry data for the entry set with MySky at the given data path, for
 * the given public user ID.
 *
 * @param this - SkynetClient
 * @param userID - The MySky public user ID.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 */
async function getEntryData(userID, path, customOptions) {
    (0, validation_1.validateString)("userID", userID, "parameter");
    (0, validation_1.validateString)("path", path, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", registry_1.DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...registry_1.DEFAULT_GET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    const dataKey = (0, tweak_1.deriveDiscoverableFileTweak)(path);
    opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.
    return await this.dbV2.getEntryData(userID, dataKey, opts);
}
exports.getEntryData = getEntryData;
// ===============
// Encrypted Files
// ===============
/**
 * Gets Encrypted JSON set with MySky for the given file path seed for the given
 * public user ID.
 *
 * @param this - SkynetClient
 * @param userID - The MySky public user ID.
 * @param pathSeed - The share-able secret file path seed.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the decrypted json data.
 */
async function getJSONEncrypted(userID, pathSeed, 
// TODO: Take a new options type?
customOptions) {
    (0, validation_1.validateString)("userID", userID, "parameter");
    // Full validation of the path seed is in `deriveEncryptedFileKeyEntropy` below.
    (0, validation_1.validateString)("pathSeed", pathSeed, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", skydb_v2_1.DEFAULT_GET_JSON_OPTIONS);
    const opts = {
        ...skydb_v2_1.DEFAULT_GET_JSON_OPTIONS,
        ...this.customOptions,
        ...customOptions,
        hashedDataKeyHex: true, // Do not hash the tweak anymore.
    };
    // Validate the path seed and get the key.
    const key = (0, encrypted_files_1.deriveEncryptedFileKeyEntropy)(pathSeed);
    // Fetch the raw encrypted JSON data.
    const dataKey = (0, encrypted_files_1.deriveEncryptedFileTweak)(pathSeed);
    const { data } = await this.dbV2.getRawBytes(userID, dataKey, opts);
    if (data === null) {
        return { data: null };
    }
    const json = (0, encrypted_files_1.decryptJSONFile)(data, key);
    return { data: json };
}
exports.getJSONEncrypted = getJSONEncrypted;
