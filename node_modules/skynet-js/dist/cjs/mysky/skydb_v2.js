"use strict";
/* istanbul ignore file: Much of this functionality is only testable from a browser */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setJSONEncrypted = exports.getJSONEncrypted = exports.deleteEntryData = exports.setEntryData = exports.getEntryData = exports.setDataLink = exports.deleteJSON = exports.setJSON = exports.getEntryLink = exports.getJSON = void 0;
const __1 = require("..");
const registry_1 = require("../registry");
const skydb_v2_1 = require("../skydb_v2");
const sia_1 = require("../skylink/sia");
const options_1 = require("../utils/options");
const validation_1 = require("../utils/validation");
const encrypted_files_1 = require("./encrypted_files");
const tweak_1 = require("./tweak");
// =============
// SkyDB methods
// =============
/**
 * Gets Discoverable JSON at the given path through MySky, if the user has
 * given Discoverable Read permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 * @throws - Will throw if the user does not have Discoverable Read permission on the path.
 */
async function getJSON(path, customOptions) {
    (0, validation_1.validateString)("path", path, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", skydb_v2_1.DEFAULT_GET_JSON_OPTIONS);
    const opts = {
        ...skydb_v2_1.DEFAULT_GET_JSON_OPTIONS,
        ...this.connector.client.customOptions,
        ...customOptions,
    };
    const publicKey = await this.userID();
    const dataKey = (0, tweak_1.deriveDiscoverableFileTweak)(path);
    opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.
    return await this.connector.client.dbV2.getJSON(publicKey, dataKey, opts);
}
exports.getJSON = getJSON;
/**
 * Gets the entry link for the entry at the given path. This is a v2 skylink.
 * This link stays the same even if the content at the entry changes.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @returns - The entry link.
 */
async function getEntryLink(path) {
    (0, validation_1.validateString)("path", path, "parameter");
    const publicKey = await this.userID();
    const dataKey = (0, tweak_1.deriveDiscoverableFileTweak)(path);
    // Do not hash the tweak anymore.
    const opts = { ...registry_1.DEFAULT_GET_ENTRY_OPTIONS, hashedDataKeyHex: true };
    return (0, registry_1.getEntryLink)(publicKey, dataKey, opts);
}
exports.getEntryLink = getEntryLink;
/**
 * Sets Discoverable JSON at the given path through MySky, if the user has
 * given Discoverable Write permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param json - The json to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 */
async function setJSON(path, json, customOptions) {
    (0, validation_1.validateString)("path", path, "parameter");
    (0, validation_1.validateObject)("json", json, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", skydb_v2_1.DEFAULT_SET_JSON_OPTIONS);
    const opts = {
        ...skydb_v2_1.DEFAULT_SET_JSON_OPTIONS,
        ...this.connector.client.customOptions,
        ...customOptions,
    };
    const publicKey = await this.userID();
    const dataKey = (0, tweak_1.deriveDiscoverableFileTweak)(path);
    opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.
    // Immediately fail if the mutex is not available.
    return await this.connector.client.dbV2.revisionNumberCache.withCachedEntryLock(publicKey, dataKey, async (cachedRevisionEntry) => {
        // Get the cached revision number before doing anything else.
        const newRevision = (0, skydb_v2_1.incrementRevision)(cachedRevisionEntry.revision);
        // Call SkyDB helper to create the registry entry. We can't call SkyDB's
        // setJSON here directly because we need MySky to sign the entry, instead of
        // signing it ourselves with a given private key.
        const [entry, dataLink] = await (0, skydb_v2_1.getOrCreateSkyDBRegistryEntry)(this.connector.client, dataKey, json, newRevision, opts);
        const signature = await this.signRegistryEntry(entry, path);
        const setEntryOpts = (0, options_1.extractOptions)(opts, registry_1.DEFAULT_SET_ENTRY_OPTIONS);
        await this.connector.client.registry.postSignedEntry(publicKey, entry, signature, setEntryOpts);
        return { data: json, dataLink };
    });
}
exports.setJSON = setJSON;
/**
 * Deletes Discoverable JSON at the given path through MySky, if the user has
 * given Discoverable Write permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @throws - Will throw if the revision is already the maximum value.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 */
async function deleteJSON(path, customOptions) {
    // Validation is done below in `setEntryData`.
    const opts = {
        ...skydb_v2_1.DEFAULT_SET_ENTRY_DATA_OPTIONS,
        ...this.connector.client.customOptions,
        ...customOptions,
    };
    // We re-implement deleteJSON instead of calling SkyDB's deleteJSON so that
    // MySky can do the signing.
    await this.dbV2.setEntryData(path, __1.DELETION_ENTRY_DATA, { ...opts, allowDeletionEntryData: true });
}
exports.deleteJSON = deleteJSON;
// ==================
// Entry Data Methods
// ==================
/**
 * Sets entry at the given path to point to the data link. Like setJSON, but it doesn't upload a file.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param dataLink - The data link to set at the path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 */
async function setDataLink(path, dataLink, customOptions) {
    const parsedSkylink = (0, validation_1.validateSkylinkString)("dataLink", dataLink, "parameter");
    // Rest of validation is done below in `setEntryData`.
    const data = (0, sia_1.decodeSkylink)(parsedSkylink);
    await this.dbV2.setEntryData(path, data, customOptions);
}
exports.setDataLink = setDataLink;
/**
 * Gets the raw registry entry data for the given path, if the user has given
 * Discoverable Read permissions.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 * @throws - Will throw if the user does not have Discoverable Read permission on the path.
 */
async function getEntryData(path, customOptions) {
    (0, validation_1.validateString)("path", path, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", registry_1.DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...registry_1.DEFAULT_GET_ENTRY_OPTIONS,
        ...this.connector.client.customOptions,
        ...customOptions,
    };
    const publicKey = await this.userID();
    const dataKey = (0, tweak_1.deriveDiscoverableFileTweak)(path);
    opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.
    return await this.connector.client.dbV2.getEntryData(publicKey, dataKey, opts);
}
exports.getEntryData = getEntryData;
/**
 * Sets the raw registry entry data at the given path, if the user has given Discoverable
 * Write permissions.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param data - The raw entry data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 * @throws - Will throw if the length of the data is > 70 bytes.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 */
async function setEntryData(path, data, customOptions) {
    (0, validation_1.validateString)("path", path, "parameter");
    (0, validation_1.validateUint8Array)("data", data, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", skydb_v2_1.DEFAULT_SET_ENTRY_DATA_OPTIONS);
    const opts = {
        ...skydb_v2_1.DEFAULT_SET_ENTRY_DATA_OPTIONS,
        ...this.connector.client.customOptions,
        ...customOptions,
    };
    // We re-implement setEntryData instead of calling SkyDB's setEntryData so
    // that MySky can do the signing.
    (0, skydb_v2_1.validateEntryData)(data, opts.allowDeletionEntryData);
    const publicKey = await this.userID();
    const dataKey = (0, tweak_1.deriveDiscoverableFileTweak)(path);
    opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.
    // Immediately fail if the mutex is not available.
    return await this.connector.client.dbV2.revisionNumberCache.withCachedEntryLock(publicKey, dataKey, async (cachedRevisionEntry) => {
        // Get the cached revision number before doing anything else.
        const newRevision = (0, skydb_v2_1.incrementRevision)(cachedRevisionEntry.revision);
        const entry = { dataKey, data, revision: newRevision };
        const signature = await this.signRegistryEntry(entry, path);
        const setEntryOpts = (0, options_1.extractOptions)(opts, registry_1.DEFAULT_SET_ENTRY_OPTIONS);
        await this.connector.client.registry.postSignedEntry(publicKey, entry, signature, setEntryOpts);
        return { data: entry.data };
    });
}
exports.setEntryData = setEntryData;
/**
 * Deletes the entry data at the given path, if the user has given Discoverable
 * Write permissions.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 */
async function deleteEntryData(path, customOptions) {
    // Validation is done in `setEntryData`.
    await this.dbV2.setEntryData(path, __1.DELETION_ENTRY_DATA, { ...customOptions, allowDeletionEntryData: true });
}
exports.deleteEntryData = deleteEntryData;
// ===============
// Encrypted Files
// ===============
/**
 * Gets Encrypted JSON at the given path through MySky, if the user has given
 * Hidden Read permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the decrypted json data.
 * @throws - Will throw if the user does not have Hidden Read permission on the path.
 */
async function getJSONEncrypted(path, customOptions) {
    (0, validation_1.validateString)("path", path, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", skydb_v2_1.DEFAULT_GET_JSON_OPTIONS);
    const opts = {
        ...skydb_v2_1.DEFAULT_GET_JSON_OPTIONS,
        ...this.connector.client.customOptions,
        ...customOptions,
        hashedDataKeyHex: true, // Do not hash the tweak anymore.
    };
    // Call MySky which checks for read permissions on the path.
    const [publicKey, pathSeed] = await Promise.all([this.userID(), this.getEncryptedPathSeed(path, false)]);
    // Fetch the raw encrypted JSON data.
    const dataKey = (0, encrypted_files_1.deriveEncryptedFileTweak)(pathSeed);
    const { data } = await this.connector.client.dbV2.getRawBytes(publicKey, dataKey, opts);
    if (data === null) {
        return { data: null };
    }
    const encryptionKey = (0, encrypted_files_1.deriveEncryptedFileKeyEntropy)(pathSeed);
    const json = (0, encrypted_files_1.decryptJSONFile)(data, encryptionKey);
    return { data: json };
}
exports.getJSONEncrypted = getJSONEncrypted;
/**
 * Sets Encrypted JSON at the given path through MySky, if the user has given
 * Hidden Write permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param json - The json to encrypt and set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the original json data.
 * @throws - Will throw if the user does not have Hidden Write permission on the path.
 */
async function setJSONEncrypted(path, json, customOptions) {
    (0, validation_1.validateString)("path", path, "parameter");
    (0, validation_1.validateObject)("json", json, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", skydb_v2_1.DEFAULT_SET_JSON_OPTIONS);
    const opts = {
        ...skydb_v2_1.DEFAULT_SET_JSON_OPTIONS,
        ...this.connector.client.customOptions,
        ...customOptions,
    };
    // Call MySky which checks for read permissions on the path.
    const [publicKey, pathSeed] = await Promise.all([this.userID(), this.getEncryptedPathSeed(path, false)]);
    const dataKey = (0, encrypted_files_1.deriveEncryptedFileTweak)(pathSeed);
    opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.
    // Immediately fail if the mutex is not available.
    return await this.connector.client.dbV2.revisionNumberCache.withCachedEntryLock(publicKey, dataKey, async (cachedRevisionEntry) => {
        // Get the cached revision number before doing anything else.
        const newRevision = (0, skydb_v2_1.incrementRevision)(cachedRevisionEntry.revision);
        // Derive the key.
        const encryptionKey = (0, encrypted_files_1.deriveEncryptedFileKeyEntropy)(pathSeed);
        // Pad and encrypt json file.
        const data = (0, encrypted_files_1.encryptJSONFile)(json, { version: encrypted_files_1.ENCRYPTED_JSON_RESPONSE_VERSION }, encryptionKey);
        const [entry] = await (0, skydb_v2_1.getOrCreateSkyDBRegistryEntry)(this.connector.client, dataKey, data, newRevision, opts);
        // Call MySky which checks for write permissions on the path.
        const signature = await this.signEncryptedRegistryEntry(entry, path);
        const setEntryOpts = (0, options_1.extractOptions)(opts, registry_1.DEFAULT_SET_ENTRY_OPTIONS);
        await this.connector.client.registry.postSignedEntry(publicKey, entry, signature, setEntryOpts);
        return { data: json };
    });
}
exports.setJSONEncrypted = setJSONEncrypted;
