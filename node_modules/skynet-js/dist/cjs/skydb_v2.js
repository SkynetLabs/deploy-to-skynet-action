"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEntryData = exports.checkCachedDataLink = exports.incrementRevision = exports.getOrCreateSkyDBRegistryEntry = exports.getRawBytes = exports.deleteEntryData = exports.setEntryData = exports.getEntryData = exports.setDataLink = exports.deleteJSON = exports.setJSON = exports.getJSON = exports.DEFAULT_SET_ENTRY_DATA_OPTIONS = exports.DEFAULT_SET_JSON_OPTIONS = exports.DEFAULT_GET_JSON_OPTIONS = exports.DELETION_ENTRY_DATA = void 0;
const tweetnacl_1 = require("tweetnacl");
const download_1 = require("./download");
const registry_1 = require("./registry");
const sia_1 = require("./skylink/sia");
const number_1 = require("./utils/number");
const url_1 = require("./utils/url");
const string_1 = require("./utils/string");
const format_1 = require("./skylink/format");
const upload_1 = require("./upload");
const array_1 = require("./utils/array");
const encoding_1 = require("./utils/encoding");
const options_1 = require("./utils/options");
const validation_1 = require("./utils/validation");
const mysky_1 = require("./mysky");
exports.DELETION_ENTRY_DATA = new Uint8Array(sia_1.RAW_SKYLINK_SIZE);
const JSON_RESPONSE_VERSION = 2;
const UNCACHED_REVISION_NUMBER = BigInt(-1);
/**
 * The default options for get JSON. Includes the default get entry and download
 * options.
 */
exports.DEFAULT_GET_JSON_OPTIONS = {
    ...options_1.DEFAULT_BASE_OPTIONS,
    ...registry_1.DEFAULT_GET_ENTRY_OPTIONS,
    ...download_1.DEFAULT_DOWNLOAD_OPTIONS,
    cachedDataLink: undefined,
};
/**
 * The default options for set JSON. Includes the default upload, get JSON, and
 * set entry options.
 */
exports.DEFAULT_SET_JSON_OPTIONS = {
    ...options_1.DEFAULT_BASE_OPTIONS,
    ...upload_1.DEFAULT_UPLOAD_OPTIONS,
    ...exports.DEFAULT_GET_JSON_OPTIONS,
    ...registry_1.DEFAULT_SET_ENTRY_OPTIONS,
};
/**
 * The default options for set entry data. Includes the default get entry and
 * set entry options.
 */
exports.DEFAULT_SET_ENTRY_DATA_OPTIONS = {
    ...options_1.DEFAULT_BASE_OPTIONS,
    ...registry_1.DEFAULT_GET_ENTRY_OPTIONS,
    ...registry_1.DEFAULT_SET_ENTRY_OPTIONS,
    allowDeletionEntryData: false,
};
// ====
// JSON
// ====
/**
 * Gets the JSON object corresponding to the publicKey and dataKey. If the data
 * was found, we update the cached revision number for the entry.
 *
 * NOTE: The cached revision number will be updated only if the data is found
 * (including deleted data). If there is a 404 or the entry contains deleted
 * data, null will be returned. If there is an error, the error is returned
 * without updating the cached revision number.
 *
 * Summary:
 *   - Data found: update cached revision
 *   - Parse error: don't update cached revision
 *   - Network error: don't update cached revision
 *   - Too low version error: don't update the cached revision
 *   - 404 (data not found): don't update the cached revision
 *   - Data deleted: update cached revision
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned JSON and corresponding data link.
 * @throws - Will throw if the returned signature does not match the returned entry, or if the skylink in the entry is invalid.
 */
async function getJSON(publicKey, dataKey, customOptions) {
    (0, registry_1.validatePublicKey)("publicKey", publicKey, "parameter");
    (0, validation_1.validateString)("dataKey", dataKey, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_GET_JSON_OPTIONS);
    const opts = {
        ...exports.DEFAULT_GET_JSON_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    // Immediately fail if the mutex is not available.
    return await this.dbV2.revisionNumberCache.withCachedEntryLock(publicKey, dataKey, async (cachedRevisionEntry) => {
        // Lookup the registry entry.
        const getEntryOpts = (0, options_1.extractOptions)(opts, registry_1.DEFAULT_GET_ENTRY_OPTIONS);
        const entry = await getSkyDBRegistryEntryAndUpdateCache(this, publicKey, dataKey, cachedRevisionEntry, getEntryOpts);
        if (entry === null) {
            return { data: null, dataLink: null };
        }
        // Determine the data link.
        // TODO: Can this still be an entry link which hasn't yet resolved to a data link?
        const { rawDataLink, dataLink } = parseDataLink(entry.data, true);
        // If a cached data link is provided and the data link hasn't changed, return.
        if (checkCachedDataLink(rawDataLink, opts.cachedDataLink)) {
            return { data: null, dataLink };
        }
        // Download the data in the returned data link.
        const downloadOpts = (0, options_1.extractOptions)(opts, download_1.DEFAULT_DOWNLOAD_OPTIONS);
        const { data } = await this.getFileContent(dataLink, downloadOpts);
        // Validate that the returned data is JSON.
        if (typeof data !== "object" || data === null) {
            throw new Error(`File data for the entry at data key '${dataKey}' is not JSON.`);
        }
        if (!(data["_data"] && data["_v"])) {
            // Legacy data prior to skynet-js v4, return as-is.
            return { data, dataLink };
        }
        // Extract the JSON from the returned SkynetJson.
        const actualData = data["_data"];
        if (typeof actualData !== "object" || data === null) {
            throw new Error(`File data '_data' for the entry at data key '${dataKey}' is not JSON.`);
        }
        return { data: actualData, dataLink };
    });
}
exports.getJSON = getJSON;
/**
 * Sets a JSON object at the registry entry corresponding to the publicKey and
 * dataKey.
 *
 * This will use the entry revision number from the cache, so getJSON must
 * always be called first for existing entries.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param json - The JSON data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned JSON and corresponding data link.
 * @throws - Will throw if the input keys are not valid strings.
 */
async function setJSON(privateKey, dataKey, json, customOptions) {
    (0, validation_1.validateHexString)("privateKey", privateKey, "parameter");
    (0, validation_1.validateString)("dataKey", dataKey, "parameter");
    (0, validation_1.validateObject)("json", json, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_SET_JSON_OPTIONS);
    const opts = {
        ...exports.DEFAULT_SET_JSON_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    const { publicKey: publicKeyArray } = tweetnacl_1.sign.keyPair.fromSecretKey((0, string_1.hexToUint8Array)(privateKey));
    const publicKey = (0, string_1.toHexString)(publicKeyArray);
    // Immediately fail if the mutex is not available.
    return await this.dbV2.revisionNumberCache.withCachedEntryLock(publicKey, dataKey, async (cachedRevisionEntry) => {
        // Get the cached revision number before doing anything else. Increment it.
        const newRevision = incrementRevision(cachedRevisionEntry.revision);
        const [entry, dataLink] = await getOrCreateSkyDBRegistryEntry(this, dataKey, json, newRevision, opts);
        // Update the registry.
        const setEntryOpts = (0, options_1.extractOptions)(opts, registry_1.DEFAULT_SET_ENTRY_OPTIONS);
        await this.registry.setEntry(privateKey, entry, setEntryOpts);
        // Update the cached revision number.
        cachedRevisionEntry.revision = newRevision;
        return { data: json, dataLink: (0, format_1.formatSkylink)(dataLink) };
    });
}
exports.setJSON = setJSON;
/**
 * Deletes a JSON object at the registry entry corresponding to the publicKey
 * and dataKey.
 *
 * This will use the entry revision number from the cache, so getJSON must
 * always be called first.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @throws - Will throw if the input keys are not valid strings.
 */
async function deleteJSON(privateKey, dataKey, customOptions) {
    // Validation is done below in `dbV2.setEntryData`.
    const opts = {
        ...exports.DEFAULT_SET_ENTRY_DATA_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    await this.dbV2.setEntryData(privateKey, dataKey, exports.DELETION_ENTRY_DATA, { ...opts, allowDeletionEntryData: true });
}
exports.deleteJSON = deleteJSON;
// ==========
// Entry Data
// ==========
/**
 * Sets the datalink for the entry at the given private key and data key.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The data key.
 * @param dataLink - The data link to set at the entry.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @throws - Will throw if the input keys are not valid strings.
 */
async function setDataLink(privateKey, dataKey, dataLink, customOptions) {
    const parsedSkylink = (0, validation_1.validateSkylinkString)("dataLink", dataLink, "parameter");
    // Rest of validation is done below in `dbV2.setEntryData`.
    const data = (0, sia_1.decodeSkylink)(parsedSkylink);
    await this.dbV2.setEntryData(privateKey, dataKey, data, customOptions);
}
exports.setDataLink = setDataLink;
/**
 * Gets the raw registry entry data at the given public key and data key.
 *
 * If the data was found, we update the cached revision number for the entry.
 * See getJSON for behavior in other cases.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The data key.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 */
async function getEntryData(publicKey, dataKey, customOptions) {
    (0, registry_1.validatePublicKey)("publicKey", publicKey, "parameter");
    (0, validation_1.validateString)("dataKey", dataKey, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", registry_1.DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...registry_1.DEFAULT_GET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    // Immediately fail if the mutex is not available.
    return await this.dbV2.revisionNumberCache.withCachedEntryLock(publicKey, dataKey, async (cachedRevisionEntry) => {
        const entry = await getSkyDBRegistryEntryAndUpdateCache(this, publicKey, dataKey, cachedRevisionEntry, opts);
        if (entry === null) {
            return { data: null };
        }
        return { data: entry.data };
    });
}
exports.getEntryData = getEntryData;
/**
 * Sets the raw entry data at the given private key and data key.
 *
 * This will use the entry revision number from the cache, so getEntryData must
 * always be called first for existing entries.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The data key.
 * @param data - The raw entry data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 * @throws - Will throw if the length of the data is > 70 bytes.
 */
async function setEntryData(privateKey, dataKey, data, customOptions) {
    (0, validation_1.validateHexString)("privateKey", privateKey, "parameter");
    (0, validation_1.validateString)("dataKey", dataKey, "parameter");
    (0, validation_1.validateUint8Array)("data", data, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_SET_ENTRY_DATA_OPTIONS);
    const opts = {
        ...exports.DEFAULT_SET_ENTRY_DATA_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    validateEntryData(data, opts.allowDeletionEntryData);
    const { publicKey: publicKeyArray } = tweetnacl_1.sign.keyPair.fromSecretKey((0, string_1.hexToUint8Array)(privateKey));
    const publicKey = (0, string_1.toHexString)(publicKeyArray);
    // Immediately fail if the mutex is not available.
    return await this.dbV2.revisionNumberCache.withCachedEntryLock(publicKey, dataKey, async (cachedRevisionEntry) => {
        // Get the cached revision number.
        const newRevision = incrementRevision(cachedRevisionEntry.revision);
        const entry = { dataKey, data, revision: newRevision };
        const setEntryOpts = (0, options_1.extractOptions)(opts, registry_1.DEFAULT_SET_ENTRY_OPTIONS);
        await this.registry.setEntry(privateKey, entry, setEntryOpts);
        // Update the cached revision number.
        cachedRevisionEntry.revision = newRevision;
        return { data: entry.data };
    });
}
exports.setEntryData = setEntryData;
/**
 * Deletes the entry data at the given private key and data key. Trying to
 * access the data again with e.g. getEntryData will result in null.
 *
 * This will use the entry revision number from the cache, so getEntryData must
 * always be called first.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The data key.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 */
async function deleteEntryData(privateKey, dataKey, customOptions) {
    // Validation is done below in `dbV2.setEntryData`.
    await this.dbV2.setEntryData(privateKey, dataKey, exports.DELETION_ENTRY_DATA, {
        ...customOptions,
        allowDeletionEntryData: true,
    });
}
exports.deleteEntryData = deleteEntryData;
// =========
// Raw Bytes
// =========
/**
 * Gets the raw bytes corresponding to the publicKey and dataKey. The caller is responsible for setting any metadata in the bytes.
 *
 * If the data was found, we update the cached revision number for the entry.
 * See getJSON for behavior in other cases.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned bytes.
 * @throws - Will throw if the returned signature does not match the returned entry, or if the skylink in the entry is invalid.
 */
async function getRawBytes(publicKey, dataKey, 
// TODO: Take a new options type?
customOptions) {
    (0, registry_1.validatePublicKey)("publicKey", publicKey, "parameter");
    (0, validation_1.validateString)("dataKey", dataKey, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_GET_JSON_OPTIONS);
    const opts = {
        ...exports.DEFAULT_GET_JSON_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    // Immediately fail if the mutex is not available.
    return await this.dbV2.revisionNumberCache.withCachedEntryLock(publicKey, dataKey, async (cachedRevisionEntry) => {
        // Lookup the registry entry.
        const getEntryOpts = (0, options_1.extractOptions)(opts, registry_1.DEFAULT_GET_ENTRY_OPTIONS);
        const entry = await getSkyDBRegistryEntryAndUpdateCache(this, publicKey, dataKey, cachedRevisionEntry, getEntryOpts);
        if (entry === null) {
            return { data: null, dataLink: null };
        }
        // Determine the data link.
        // TODO: Can this still be an entry link which hasn't yet resolved to a data link?
        const { rawDataLink, dataLink } = parseDataLink(entry.data, false);
        // If a cached data link is provided and the data link hasn't changed, return.
        if (checkCachedDataLink(rawDataLink, opts.cachedDataLink)) {
            return { data: null, dataLink };
        }
        // Download the data in the returned data link.
        const downloadOpts = {
            ...(0, options_1.extractOptions)(opts, download_1.DEFAULT_DOWNLOAD_OPTIONS),
            responseType: "arraybuffer",
        };
        const { data: buffer } = await this.getFileContent(dataLink, downloadOpts);
        return { data: new Uint8Array(buffer), dataLink };
    });
}
exports.getRawBytes = getRawBytes;
// =======
// Helpers
// =======
/**
 * Gets the registry entry and data link or creates the entry if it doesn't
 * exist. Uses the cached revision number for the entry, or 0 if the entry has
 * not been cached.
 *
 * @param client - The Skynet client.
 * @param dataKey - The data key.
 * @param data - The JSON or raw byte data to set.
 * @param revision - The revision number to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The registry entry and corresponding data link.
 * @throws - Will throw if the revision is already the maximum value.
 */
async function getOrCreateSkyDBRegistryEntry(client, dataKey, data, revision, customOptions) {
    // Not publicly available, don't validate input.
    const opts = {
        ...exports.DEFAULT_SET_JSON_OPTIONS,
        ...client.customOptions,
        ...customOptions,
    };
    let fullData;
    if (!(data instanceof Uint8Array)) {
        // Set the hidden _data and _v fields.
        const skynetJson = buildSkynetJsonObject(data);
        fullData = JSON.stringify(skynetJson);
    }
    else {
        /* istanbul ignore next - This case is only called by setJSONEncrypted which is not tested in this repo */
        fullData = data;
    }
    // Create the data to upload to acquire its skylink.
    let dataKeyHex = dataKey;
    if (!opts.hashedDataKeyHex) {
        dataKeyHex = (0, string_1.toHexString)((0, string_1.stringToUint8ArrayUtf8)(dataKey));
    }
    const file = new File([fullData], `dk:${dataKeyHex}`, { type: "application/json" });
    // Do file upload.
    const uploadOpts = (0, options_1.extractOptions)(opts, upload_1.DEFAULT_UPLOAD_OPTIONS);
    const skyfile = await client.uploadFile(file, uploadOpts);
    // Build the registry entry.
    const dataLink = (0, string_1.trimUriPrefix)(skyfile.skylink, url_1.URI_SKYNET_PREFIX);
    const rawDataLink = (0, encoding_1.decodeSkylinkBase64)(dataLink);
    (0, validation_1.validateUint8ArrayLen)("rawDataLink", rawDataLink, "skylink byte array", sia_1.RAW_SKYLINK_SIZE);
    const entry = {
        dataKey,
        data: rawDataLink,
        revision,
    };
    return [entry, (0, format_1.formatSkylink)(dataLink)];
}
exports.getOrCreateSkyDBRegistryEntry = getOrCreateSkyDBRegistryEntry;
/**
 * Increments the given revision number and checks to make sure it is not
 * greater than the maximum revision.
 *
 * @param revision - The given revision number.
 * @returns - The incremented revision number.
 * @throws - Will throw if the incremented revision number is greater than the maximum revision.
 */
function incrementRevision(revision) {
    revision = revision + BigInt(1);
    // Throw if the revision is already the maximum value.
    if (revision > number_1.MAX_REVISION) {
        throw new Error("Current entry already has maximum allowed revision, could not update the entry");
    }
    return revision;
}
exports.incrementRevision = incrementRevision;
/**
 * Checks whether the raw data link matches the cached data link, if provided.
 *
 * @param rawDataLink - The raw, unformatted data link.
 * @param cachedDataLink - The cached data link, if provided.
 * @returns - Whether the cached data link is a match.
 * @throws - Will throw if the given cached data link is not a valid skylink.
 */
function checkCachedDataLink(rawDataLink, cachedDataLink) {
    if (cachedDataLink) {
        cachedDataLink = (0, validation_1.validateSkylinkString)("cachedDataLink", cachedDataLink, "optional parameter");
        return rawDataLink === cachedDataLink;
    }
    return false;
}
exports.checkCachedDataLink = checkCachedDataLink;
/**
 * Validates the given entry data.
 *
 * @param data - The entry data to validate.
 * @param allowDeletionEntryData - If set to false, disallows setting the entry data that marks a deletion. This is a likely developer error if it was not done through the deleteEntryData method.
 * @throws - Will throw if the data is invalid.
 */
function validateEntryData(data, allowDeletionEntryData) {
    // Check that the length is not greater than the maximum allowed.
    if (data.length > mysky_1.MAX_ENTRY_LENGTH) {
        (0, validation_1.throwValidationError)("data", data, "parameter", `'Uint8Array' of length <= ${mysky_1.MAX_ENTRY_LENGTH}, was length ${data.length}`);
    }
    // Check that we are not setting the deletion sentinel as that is probably a developer mistake.
    if (!allowDeletionEntryData && (0, array_1.areEqualUint8Arrays)(data, exports.DELETION_ENTRY_DATA)) {
        throw new Error("Tried to set 'Uint8Array' entry data that is the deletion sentinel ('Uint8Array(RAW_SKYLINK_SIZE)'), please use the 'deleteEntryData' method instead`");
    }
}
exports.validateEntryData = validateEntryData;
/**
 * Gets the registry entry, returning null if the entry was not found or if it
 * contained a sentinel value indicating deletion.
 *
 * If the data was found, we update the cached revision number for the entry.
 * See getJSON for behavior in other cases.
 *
 * @param client - The Skynet Client
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param cachedRevisionEntry - The cached revision entry object containing the revision number and the mutex.
 * @param opts - Additional settings.
 * @returns - The registry entry, or null if not found or deleted.
 */
async function getSkyDBRegistryEntryAndUpdateCache(client, publicKey, dataKey, cachedRevisionEntry, opts) {
    var _a;
    // If this throws due to a parse error or network error, exit early and do not
    // update the cached revision number.
    const { entry } = await client.registry.getEntry(publicKey, dataKey, opts);
    // Don't update the cached revision number if the data was not found (404). Return null.
    if (entry === null) {
        return null;
    }
    // Calculate the new revision.
    const newRevision = (_a = entry === null || entry === void 0 ? void 0 : entry.revision) !== null && _a !== void 0 ? _a : UNCACHED_REVISION_NUMBER + BigInt(1);
    // Don't update the cached revision number if the received version is too low.
    // Throw error.
    const cachedRevision = cachedRevisionEntry.revision;
    if (cachedRevision && cachedRevision > newRevision) {
        throw new Error("Returned revision number too low. A higher revision number for this userID and path is already cached");
    }
    // Update the cached revision.
    cachedRevisionEntry.revision = newRevision;
    // Return null if the entry contained a sentinel value indicating deletion.
    // We do this after updating the revision number cache.
    if (wasRegistryEntryDeleted(entry)) {
        return null;
    }
    return entry;
}
/**
 * Sets the hidden _data and _v fields on the given raw JSON data.
 *
 * @param data - The given JSON data.
 * @returns - The Skynet JSON data.
 */
function buildSkynetJsonObject(data) {
    return { _data: data, _v: JSON_RESPONSE_VERSION };
}
/**
 * Parses a data link out of the given registry entry data.
 *
 * @param data - The raw registry entry data.
 * @param legacy - Whether to check for possible legacy skylink data, encoded as base64.
 * @returns - The raw, unformatted data link and the formatted data link.
 * @throws - Will throw if the data is not of the expected length for a skylink.
 */
function parseDataLink(data, legacy) {
    let rawDataLink = "";
    if (legacy && data.length === sia_1.BASE64_ENCODED_SKYLINK_SIZE) {
        // Legacy data, convert to string for backwards compatibility.
        rawDataLink = (0, string_1.uint8ArrayToStringUtf8)(data);
    }
    else if (data.length === sia_1.RAW_SKYLINK_SIZE) {
        // Convert the bytes to a base64 skylink.
        rawDataLink = (0, encoding_1.encodeSkylinkBase64)(data);
    }
    else {
        (0, validation_1.throwValidationError)("entry.data", data, "returned entry data", `length ${sia_1.RAW_SKYLINK_SIZE} bytes`);
    }
    return { rawDataLink, dataLink: (0, format_1.formatSkylink)(rawDataLink) };
}
/**
 * Returns whether the given registry entry indicates a past deletion.
 *
 * @param entry - The registry entry.
 * @returns - Whether the registry entry data indicated a past deletion.
 */
function wasRegistryEntryDeleted(entry) {
    return (0, array_1.areEqualUint8Arrays)(entry.data, sia_1.EMPTY_SKYLINK);
}
