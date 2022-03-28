"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePublicKey = exports.validateRegistryEntry = exports.validateRegistryProof = exports.postSignedEntry = exports.signEntry = exports.setEntry = exports.getEntryLinkAsync = exports.getEntryLink = exports.getEntryUrlForPortal = exports.getEntryUrl = exports.getEntry = exports.REGISTRY_TYPE_WITH_PUBKEY = exports.REGISTRY_TYPE_WITHOUT_PUBKEY = exports.REGEX_REVISION_NO_QUOTES = exports.DEFAULT_SET_ENTRY_OPTIONS = exports.DEFAULT_GET_ENTRY_OPTIONS = void 0;
const buffer_1 = require("buffer");
const tweetnacl_1 = require("tweetnacl");
const number_1 = require("./utils/number");
const options_1 = require("./utils/options");
const string_1 = require("./utils/string");
const url_1 = require("./utils/url");
const crypto_1 = require("./crypto");
const validation_1 = require("./utils/validation");
const sia_1 = require("./skylink/sia");
const format_1 = require("./skylink/format");
const base64_js_1 = require("base64-js");
const encoding_1 = require("./utils/encoding");
exports.DEFAULT_GET_ENTRY_OPTIONS = {
    ...options_1.DEFAULT_BASE_OPTIONS,
    endpointGetEntry: "/skynet/registry",
    hashedDataKeyHex: false,
};
exports.DEFAULT_SET_ENTRY_OPTIONS = {
    ...options_1.DEFAULT_BASE_OPTIONS,
    endpointSetEntry: "/skynet/registry",
    hashedDataKeyHex: false,
};
const DEFAULT_GET_ENTRY_TIMEOUT = 5; // 5 seconds
/**
 * Regex for JSON revision value without quotes.
 */
exports.REGEX_REVISION_NO_QUOTES = /"revision":\s*([0-9]+)/;
/**
 * The type of an entry that doesn't contain a pubkey. All of the data is
 * considered to be arbitrary.
 */
exports.REGISTRY_TYPE_WITHOUT_PUBKEY = 1;
/**
 * The type of an entry which is expected to have a RegistryPubKeyHashSize long
 * hash of a host's pubkey at the beginning of its data. The key is used to
 * determine whether an entry is considered a primary or secondary entry on a
 * host.
 */
exports.REGISTRY_TYPE_WITH_PUBKEY = 2;
/**
 * Regex for JSON revision value with quotes.
 */
const REGEX_REVISION_WITH_QUOTES = /"revision":\s*"([0-9]+)"/;
const ED25519_PREFIX = "ed25519:";
/**
 * Gets the registry entry corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The signed registry entry.
 * @throws - Will throw if the returned signature does not match the returned entry or the provided timeout is invalid or the given key is not valid.
 */
async function getEntry(publicKey, dataKey, customOptions) {
    // Validation is done in `getEntryUrl`.
    const opts = {
        ...exports.DEFAULT_GET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    const url = await this.registry.getEntryUrl(publicKey, dataKey, opts);
    let response;
    try {
        response = await this.executeRequest({
            ...opts,
            url,
            method: "get",
            // Transform the response to add quotes, since uint64 cannot be accurately
            // read by JS so the revision needs to be parsed as a string.
            transformResponse: function (data) {
                if (data === undefined) {
                    return {};
                }
                // Change the revision value from a JSON integer to a string.
                data = data.replace(exports.REGEX_REVISION_NO_QUOTES, '"revision":"$1"');
                // Try converting the JSON data to an object.
                try {
                    return JSON.parse(data);
                }
                catch {
                    // The data is not JSON, it's likely an HTML error response.
                    return data;
                }
            },
        });
    }
    catch (err) {
        // Check the executeRequest error to see if a 404 status was returned.
        return handleGetEntryErrResponse(err);
    }
    // Sanity check.
    try {
        (0, validation_1.validateString)("response.data.data", response.data.data, "entry response field");
        (0, validation_1.validateString)("response.data.revision", response.data.revision, "entry response field");
        (0, validation_1.validateString)("response.data.signature", response.data.signature, "entry response field");
    }
    catch (err) {
        throw new Error(`Did not get a complete entry response despite a successful request. Please try again and report this issue to the devs if it persists. Error: ${err}`);
    }
    // Convert the revision from a string to bigint.
    const revision = BigInt(response.data.revision);
    const signature = buffer_1.Buffer.from((0, string_1.hexToUint8Array)(response.data.signature));
    // Use empty array if the data is empty.
    let data = new Uint8Array([]);
    if (response.data.data) {
        data = (0, string_1.hexToUint8Array)(response.data.data);
    }
    const signedEntry = {
        entry: {
            dataKey,
            data,
            revision,
        },
        signature,
    };
    // Try verifying the returned data.
    const signatureBytes = new Uint8Array(signedEntry.signature);
    const publicKeyBytes = (0, string_1.hexToUint8Array)(publicKey);
    // Verify length of signature and public key.
    (0, validation_1.validateUint8ArrayLen)("signatureArray", signatureBytes, "response value", crypto_1.SIGNATURE_LENGTH);
    (0, validation_1.validateUint8ArrayLen)("publicKeyArray", publicKeyBytes, "response value", crypto_1.PUBLIC_KEY_LENGTH / 2);
    if (tweetnacl_1.sign.detached.verify((0, crypto_1.hashRegistryEntry)(signedEntry.entry, opts.hashedDataKeyHex), signatureBytes, publicKeyBytes)) {
        return signedEntry;
    }
    // The response could not be verified.
    throw new Error("Could not verify signature from retrieved, signed registry entry -- possible corrupted entry");
}
exports.getEntry = getEntry;
/**
 * Gets the registry entry URL corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The full get entry URL.
 * @throws - Will throw if the provided timeout is invalid or the given key is not valid.
 */
async function getEntryUrl(publicKey, dataKey, customOptions) {
    // Validation is done in `getEntryUrlForPortal`.
    const opts = {
        ...exports.DEFAULT_GET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    const portalUrl = await this.portalUrl();
    return getEntryUrlForPortal(portalUrl, publicKey, dataKey, opts);
}
exports.getEntryUrl = getEntryUrl;
/**
 * Gets the registry entry URL without an initialized client.
 *
 * @param portalUrl - The portal URL.
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The full get entry URL.
 * @throws - Will throw if the given key is not valid.
 */
function getEntryUrlForPortal(portalUrl, publicKey, dataKey, customOptions) {
    (0, validation_1.validateString)("portalUrl", portalUrl, "parameter");
    validatePublicKey("publicKey", publicKey, "parameter");
    (0, validation_1.validateString)("dataKey", dataKey, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...exports.DEFAULT_GET_ENTRY_OPTIONS,
        ...customOptions,
    };
    // Hash and hex encode the given data key if it is not a hash already.
    let dataKeyHashHex = dataKey;
    if (!opts.hashedDataKeyHex) {
        dataKeyHashHex = (0, string_1.toHexString)((0, crypto_1.hashDataKey)(dataKey));
    }
    const query = {
        publickey: (0, string_1.ensurePrefix)(publicKey, ED25519_PREFIX),
        datakey: dataKeyHashHex,
        timeout: DEFAULT_GET_ENTRY_TIMEOUT.toString(),
    };
    let url = (0, url_1.makeUrl)(portalUrl, opts.endpointGetEntry);
    url = (0, url_1.addUrlQuery)(url, query);
    return url;
}
exports.getEntryUrlForPortal = getEntryUrlForPortal;
/**
 * Gets the entry link for the entry at the given public key and data key. This link stays the same even if the content at the entry changes.
 *
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry link.
 * @throws - Will throw if the given key is not valid.
 */
function getEntryLink(publicKey, dataKey, customOptions) {
    validatePublicKey("publicKey", publicKey, "parameter");
    (0, validation_1.validateString)("dataKey", dataKey, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...exports.DEFAULT_GET_ENTRY_OPTIONS,
        ...customOptions,
    };
    const siaPublicKey = (0, sia_1.newEd25519PublicKey)((0, string_1.trimPrefix)(publicKey, ED25519_PREFIX));
    let tweak;
    if (opts.hashedDataKeyHex) {
        tweak = (0, string_1.hexToUint8Array)(dataKey);
    }
    else {
        tweak = (0, crypto_1.hashDataKey)(dataKey);
    }
    const skylink = (0, sia_1.newSkylinkV2)(siaPublicKey, tweak).toString();
    return (0, format_1.formatSkylink)(skylink);
}
exports.getEntryLink = getEntryLink;
/* istanbul ignore next */
/**
 * Gets the entry link for the entry at the given public key and data key. This link stays the same even if the content at the entry changes.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry link.
 * @throws - Will throw if the given key is not valid.
 * @deprecated - Please use the standalone, non-async function `getEntryLink`.
 */
async function getEntryLinkAsync(publicKey, dataKey, customOptions) {
    validatePublicKey("publicKey", publicKey, "parameter");
    (0, validation_1.validateString)("dataKey", dataKey, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...exports.DEFAULT_GET_ENTRY_OPTIONS,
        ...customOptions,
    };
    const siaPublicKey = (0, sia_1.newEd25519PublicKey)((0, string_1.trimPrefix)(publicKey, ED25519_PREFIX));
    let tweak;
    if (opts.hashedDataKeyHex) {
        tweak = (0, string_1.hexToUint8Array)(dataKey);
    }
    else {
        tweak = (0, crypto_1.hashDataKey)(dataKey);
    }
    const skylink = (0, sia_1.newSkylinkV2)(siaPublicKey, tweak).toString();
    return (0, format_1.formatSkylink)(skylink);
}
exports.getEntryLinkAsync = getEntryLinkAsync;
/**
 * Sets the registry entry.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param entry - The entry to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @throws - Will throw if the entry revision does not fit in 64 bits or the given key is not valid.
 */
async function setEntry(privateKey, entry, customOptions) {
    (0, validation_1.validateHexString)("privateKey", privateKey, "parameter");
    validateRegistryEntry("entry", entry, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_SET_ENTRY_OPTIONS);
    // Assert the input is 64 bits.
    (0, number_1.assertUint64)(entry.revision);
    const opts = {
        ...exports.DEFAULT_SET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    const privateKeyArray = (0, string_1.hexToUint8Array)(privateKey);
    const signature = await signEntry(privateKey, entry, opts.hashedDataKeyHex);
    const { publicKey: publicKeyArray } = tweetnacl_1.sign.keyPair.fromSecretKey(privateKeyArray);
    return await this.registry.postSignedEntry((0, string_1.toHexString)(publicKeyArray), entry, signature, opts);
}
exports.setEntry = setEntry;
/**
 * Signs the entry with the given private key.
 *
 * @param privateKey - The user private key.
 * @param entry - The entry to sign.
 * @param hashedDataKeyHex - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 * @returns - The signature.
 */
async function signEntry(privateKey, entry, hashedDataKeyHex) {
    // TODO: Publicly available, validate input.
    const privateKeyArray = (0, string_1.hexToUint8Array)(privateKey);
    // Sign the entry.
    // TODO: signature type should be Signature?
    return tweetnacl_1.sign.detached((0, crypto_1.hashRegistryEntry)(entry, hashedDataKeyHex), privateKeyArray);
}
exports.signEntry = signEntry;
/**
 * Posts the entry with the given public key and signature to Skynet.
 *
 * @param this - The Skynet client.
 * @param publicKey - The user public key.
 * @param entry - The entry to set.
 * @param signature - The signature.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 */
async function postSignedEntry(publicKey, entry, signature, customOptions) {
    (0, validation_1.validateHexString)("publicKey", publicKey, "parameter");
    validateRegistryEntry("entry", entry, "parameter");
    (0, validation_1.validateUint8Array)("signature", signature, "parameter");
    (0, validation_1.validateOptionalObject)("customOptions", customOptions, "parameter", exports.DEFAULT_SET_ENTRY_OPTIONS);
    const opts = {
        ...exports.DEFAULT_SET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    // Hash and hex encode the given data key if it is not a hash already.
    let datakey = entry.dataKey;
    if (!opts.hashedDataKeyHex) {
        datakey = (0, string_1.toHexString)((0, crypto_1.hashDataKey)(datakey));
    }
    // Convert the entry data to an array from raw bytes.
    const entryData = Array.from(entry.data);
    const data = {
        publickey: {
            algorithm: "ed25519",
            key: Array.from((0, string_1.hexToUint8Array)(publicKey)),
        },
        datakey,
        // Set the revision as a string here. The value may be up to 64 bits and the limit for a JS number is 53 bits.
        // We remove the quotes later in transformRequest, as JSON does support 64 bit numbers.
        revision: entry.revision.toString(),
        data: entryData,
        signature: Array.from(signature),
    };
    await this.executeRequest({
        ...opts,
        endpointPath: opts.endpointSetEntry,
        method: "post",
        data,
        // Transform the request to remove quotes, since the revision needs to be
        // parsed as a uint64 on the Go side.
        transformRequest: function (data) {
            // Convert the object data to JSON.
            const json = JSON.stringify(data);
            // Change the revision value from a string to a JSON integer.
            return json.replace(REGEX_REVISION_WITH_QUOTES, '"revision":$1');
        },
    });
}
exports.postSignedEntry = postSignedEntry;
/**
 * Validates the registry proof.
 *
 * @param proof - The registry proof.
 * @param [opts] - Optional custom options.
 * @returns - The resolver skylink and resolved skylink from the proof.
 * @throws - Will throw if the registry proof fails to verify.
 */
function validateRegistryProof(proof, opts) {
    let resolverSkylink = undefined;
    let lastSkylink = opts === null || opts === void 0 ? void 0 : opts.resolverSkylink;
    const dataLink = opts === null || opts === void 0 ? void 0 : opts.skylink;
    // Verify the proof is not empty.
    if (proof.length === 0) {
        throw new Error("Expected registry proof not to be empty");
    }
    // Verify the registry proof.
    for (const entry of proof) {
        if (entry.type !== exports.REGISTRY_TYPE_WITHOUT_PUBKEY) {
            throw new Error(`Unsupported registry type in proof: '${entry.type}'`);
        }
        const publicKey = entry.publickey.key;
        const publicKeyBytes = (0, base64_js_1.toByteArray)(publicKey);
        const publicKeyHex = (0, string_1.toHexString)(publicKeyBytes);
        const dataKey = entry.datakey;
        const data = entry.data;
        const signatureBytes = (0, string_1.hexToUint8Array)(entry.signature);
        // Verify the current entry corresponds to the previous skylink in the chain.
        let entryLink = getEntryLink(publicKeyHex, dataKey, { hashedDataKeyHex: true });
        entryLink = (0, string_1.trimUriPrefix)(entryLink, url_1.URI_SKYNET_PREFIX);
        if (lastSkylink && entryLink !== lastSkylink) {
            throw new Error("Could not verify registry proof chain");
        }
        // Set the resolver skylink if this is the first link in the chain.
        if (!resolverSkylink) {
            resolverSkylink = entryLink;
        }
        // Data bytes are hex-encoded raw skylink bytes.
        const rawData = (0, string_1.hexToUint8Array)(data);
        const skylink = (0, encoding_1.encodeSkylinkBase64)(rawData);
        // Try verifying the returned data.
        const entryToVerify = {
            dataKey,
            data: rawData,
            revision: BigInt(entry.revision),
        };
        // Verify length of signature and public key.
        (0, validation_1.validateUint8ArrayLen)("signatureArray", signatureBytes, "response value", crypto_1.SIGNATURE_LENGTH);
        (0, validation_1.validateUint8ArrayLen)("publicKeyArray", publicKeyBytes, "parameter", crypto_1.PUBLIC_KEY_LENGTH / 2);
        if (!tweetnacl_1.sign.detached.verify((0, crypto_1.hashRegistryEntry)(entryToVerify, true), signatureBytes, publicKeyBytes)) {
            // Registry proof fails to verify.
            throw new Error("Could not verify signature from retrieved, signed registry entry in registry proof");
        }
        lastSkylink = skylink;
    }
    if (dataLink && lastSkylink !== dataLink) {
        throw new Error("Could not verify registry proof chain");
    }
    // These variables are guaranteed to be defined because at least one link in
    // the chain had to have been verified by this point.
    return { skylink: lastSkylink, resolverSkylink: resolverSkylink };
}
exports.validateRegistryProof = validateRegistryProof;
/**
 * Handles error responses returned from getEntry endpoint.
 *
 * @param err - The error.
 * @returns - An empty signed registry entry if the status code is 404.
 * @throws - Will throw if the error response is malformed, or the error message otherwise if the error status code is not 404.
 */
function handleGetEntryErrResponse(err) {
    // Check if status was 404 "not found" and return null if so.
    if (err.responseStatus === 404) {
        return { entry: null, signature: null };
    }
    // Return the error message from skyd.
    throw err;
}
/**
 * Validates the given registry entry.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 */
function validateRegistryEntry(name, value, valueKind) {
    (0, validation_1.validateObject)(name, value, valueKind);
    (0, validation_1.validateString)(`${name}.dataKey`, value.dataKey, `${valueKind} field`);
    (0, validation_1.validateUint8Array)(`${name}.data`, value.data, `${valueKind} field`);
    (0, validation_1.validateBigint)(`${name}.revision`, value.revision, `${valueKind} field`);
}
exports.validateRegistryEntry = validateRegistryEntry;
/**
 * Validates the given value as a hex-encoded, potentially prefixed public key.
 *
 * @param name - The name of the value.
 * @param publicKey - The public key.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid hex-encoded public key.
 */
function validatePublicKey(name, publicKey, valueKind) {
    if (!(0, string_1.isHexString)((0, string_1.trimPrefix)(publicKey, ED25519_PREFIX))) {
        (0, validation_1.throwValidationError)(name, publicKey, valueKind, "a hex-encoded string with a valid prefix");
    }
}
exports.validatePublicKey = validatePublicKey;
