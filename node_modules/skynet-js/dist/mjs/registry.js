import { Buffer } from "buffer";
import { sign } from "tweetnacl";
import { assertUint64 } from "./utils/number";
import { DEFAULT_BASE_OPTIONS } from "./utils/options";
import { ensurePrefix, hexToUint8Array, isHexString, toHexString, trimPrefix, trimUriPrefix } from "./utils/string";
import { addUrlQuery, makeUrl, URI_SKYNET_PREFIX } from "./utils/url";
import { hashDataKey, hashRegistryEntry, PUBLIC_KEY_LENGTH, SIGNATURE_LENGTH } from "./crypto";
import { throwValidationError, validateBigint, validateHexString, validateObject, validateOptionalObject, validateString, validateUint8Array, validateUint8ArrayLen, } from "./utils/validation";
import { newEd25519PublicKey, newSkylinkV2 } from "./skylink/sia";
import { formatSkylink } from "./skylink/format";
import { toByteArray } from "base64-js";
import { encodeSkylinkBase64 } from "./utils/encoding";
export const DEFAULT_GET_ENTRY_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointGetEntry: "/skynet/registry",
    hashedDataKeyHex: false,
};
export const DEFAULT_SET_ENTRY_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointSetEntry: "/skynet/registry",
    hashedDataKeyHex: false,
};
const DEFAULT_GET_ENTRY_TIMEOUT = 5; // 5 seconds
/**
 * Regex for JSON revision value without quotes.
 */
export const REGEX_REVISION_NO_QUOTES = /"revision":\s*([0-9]+)/;
/**
 * The type of an entry that doesn't contain a pubkey. All of the data is
 * considered to be arbitrary.
 */
export const REGISTRY_TYPE_WITHOUT_PUBKEY = 1;
/**
 * The type of an entry which is expected to have a RegistryPubKeyHashSize long
 * hash of a host's pubkey at the beginning of its data. The key is used to
 * determine whether an entry is considered a primary or secondary entry on a
 * host.
 */
export const REGISTRY_TYPE_WITH_PUBKEY = 2;
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
export async function getEntry(publicKey, dataKey, customOptions) {
    // Validation is done in `getEntryUrl`.
    const opts = {
        ...DEFAULT_GET_ENTRY_OPTIONS,
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
                data = data.replace(REGEX_REVISION_NO_QUOTES, '"revision":"$1"');
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
        validateString("response.data.data", response.data.data, "entry response field");
        validateString("response.data.revision", response.data.revision, "entry response field");
        validateString("response.data.signature", response.data.signature, "entry response field");
    }
    catch (err) {
        throw new Error(`Did not get a complete entry response despite a successful request. Please try again and report this issue to the devs if it persists. Error: ${err}`);
    }
    // Convert the revision from a string to bigint.
    const revision = BigInt(response.data.revision);
    const signature = Buffer.from(hexToUint8Array(response.data.signature));
    // Use empty array if the data is empty.
    let data = new Uint8Array([]);
    if (response.data.data) {
        data = hexToUint8Array(response.data.data);
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
    const publicKeyBytes = hexToUint8Array(publicKey);
    // Verify length of signature and public key.
    validateUint8ArrayLen("signatureArray", signatureBytes, "response value", SIGNATURE_LENGTH);
    validateUint8ArrayLen("publicKeyArray", publicKeyBytes, "response value", PUBLIC_KEY_LENGTH / 2);
    if (sign.detached.verify(hashRegistryEntry(signedEntry.entry, opts.hashedDataKeyHex), signatureBytes, publicKeyBytes)) {
        return signedEntry;
    }
    // The response could not be verified.
    throw new Error("Could not verify signature from retrieved, signed registry entry -- possible corrupted entry");
}
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
export async function getEntryUrl(publicKey, dataKey, customOptions) {
    // Validation is done in `getEntryUrlForPortal`.
    const opts = {
        ...DEFAULT_GET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    const portalUrl = await this.portalUrl();
    return getEntryUrlForPortal(portalUrl, publicKey, dataKey, opts);
}
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
export function getEntryUrlForPortal(portalUrl, publicKey, dataKey, customOptions) {
    validateString("portalUrl", portalUrl, "parameter");
    validatePublicKey("publicKey", publicKey, "parameter");
    validateString("dataKey", dataKey, "parameter");
    validateOptionalObject("customOptions", customOptions, "parameter", DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...DEFAULT_GET_ENTRY_OPTIONS,
        ...customOptions,
    };
    // Hash and hex encode the given data key if it is not a hash already.
    let dataKeyHashHex = dataKey;
    if (!opts.hashedDataKeyHex) {
        dataKeyHashHex = toHexString(hashDataKey(dataKey));
    }
    const query = {
        publickey: ensurePrefix(publicKey, ED25519_PREFIX),
        datakey: dataKeyHashHex,
        timeout: DEFAULT_GET_ENTRY_TIMEOUT.toString(),
    };
    let url = makeUrl(portalUrl, opts.endpointGetEntry);
    url = addUrlQuery(url, query);
    return url;
}
/**
 * Gets the entry link for the entry at the given public key and data key. This link stays the same even if the content at the entry changes.
 *
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry link.
 * @throws - Will throw if the given key is not valid.
 */
export function getEntryLink(publicKey, dataKey, customOptions) {
    validatePublicKey("publicKey", publicKey, "parameter");
    validateString("dataKey", dataKey, "parameter");
    validateOptionalObject("customOptions", customOptions, "parameter", DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...DEFAULT_GET_ENTRY_OPTIONS,
        ...customOptions,
    };
    const siaPublicKey = newEd25519PublicKey(trimPrefix(publicKey, ED25519_PREFIX));
    let tweak;
    if (opts.hashedDataKeyHex) {
        tweak = hexToUint8Array(dataKey);
    }
    else {
        tweak = hashDataKey(dataKey);
    }
    const skylink = newSkylinkV2(siaPublicKey, tweak).toString();
    return formatSkylink(skylink);
}
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
export async function getEntryLinkAsync(publicKey, dataKey, customOptions) {
    validatePublicKey("publicKey", publicKey, "parameter");
    validateString("dataKey", dataKey, "parameter");
    validateOptionalObject("customOptions", customOptions, "parameter", DEFAULT_GET_ENTRY_OPTIONS);
    const opts = {
        ...DEFAULT_GET_ENTRY_OPTIONS,
        ...customOptions,
    };
    const siaPublicKey = newEd25519PublicKey(trimPrefix(publicKey, ED25519_PREFIX));
    let tweak;
    if (opts.hashedDataKeyHex) {
        tweak = hexToUint8Array(dataKey);
    }
    else {
        tweak = hashDataKey(dataKey);
    }
    const skylink = newSkylinkV2(siaPublicKey, tweak).toString();
    return formatSkylink(skylink);
}
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
export async function setEntry(privateKey, entry, customOptions) {
    validateHexString("privateKey", privateKey, "parameter");
    validateRegistryEntry("entry", entry, "parameter");
    validateOptionalObject("customOptions", customOptions, "parameter", DEFAULT_SET_ENTRY_OPTIONS);
    // Assert the input is 64 bits.
    assertUint64(entry.revision);
    const opts = {
        ...DEFAULT_SET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    const privateKeyArray = hexToUint8Array(privateKey);
    const signature = await signEntry(privateKey, entry, opts.hashedDataKeyHex);
    const { publicKey: publicKeyArray } = sign.keyPair.fromSecretKey(privateKeyArray);
    return await this.registry.postSignedEntry(toHexString(publicKeyArray), entry, signature, opts);
}
/**
 * Signs the entry with the given private key.
 *
 * @param privateKey - The user private key.
 * @param entry - The entry to sign.
 * @param hashedDataKeyHex - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 * @returns - The signature.
 */
export async function signEntry(privateKey, entry, hashedDataKeyHex) {
    // TODO: Publicly available, validate input.
    const privateKeyArray = hexToUint8Array(privateKey);
    // Sign the entry.
    // TODO: signature type should be Signature?
    return sign.detached(hashRegistryEntry(entry, hashedDataKeyHex), privateKeyArray);
}
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
export async function postSignedEntry(publicKey, entry, signature, customOptions) {
    validateHexString("publicKey", publicKey, "parameter");
    validateRegistryEntry("entry", entry, "parameter");
    validateUint8Array("signature", signature, "parameter");
    validateOptionalObject("customOptions", customOptions, "parameter", DEFAULT_SET_ENTRY_OPTIONS);
    const opts = {
        ...DEFAULT_SET_ENTRY_OPTIONS,
        ...this.customOptions,
        ...customOptions,
    };
    // Hash and hex encode the given data key if it is not a hash already.
    let datakey = entry.dataKey;
    if (!opts.hashedDataKeyHex) {
        datakey = toHexString(hashDataKey(datakey));
    }
    // Convert the entry data to an array from raw bytes.
    const entryData = Array.from(entry.data);
    const data = {
        publickey: {
            algorithm: "ed25519",
            key: Array.from(hexToUint8Array(publicKey)),
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
/**
 * Validates the registry proof.
 *
 * @param proof - The registry proof.
 * @param [opts] - Optional custom options.
 * @returns - The resolver skylink and resolved skylink from the proof.
 * @throws - Will throw if the registry proof fails to verify.
 */
export function validateRegistryProof(proof, opts) {
    let resolverSkylink = undefined;
    let lastSkylink = opts === null || opts === void 0 ? void 0 : opts.resolverSkylink;
    const dataLink = opts === null || opts === void 0 ? void 0 : opts.skylink;
    // Verify the proof is not empty.
    if (proof.length === 0) {
        throw new Error("Expected registry proof not to be empty");
    }
    // Verify the registry proof.
    for (const entry of proof) {
        if (entry.type !== REGISTRY_TYPE_WITHOUT_PUBKEY) {
            throw new Error(`Unsupported registry type in proof: '${entry.type}'`);
        }
        const publicKey = entry.publickey.key;
        const publicKeyBytes = toByteArray(publicKey);
        const publicKeyHex = toHexString(publicKeyBytes);
        const dataKey = entry.datakey;
        const data = entry.data;
        const signatureBytes = hexToUint8Array(entry.signature);
        // Verify the current entry corresponds to the previous skylink in the chain.
        let entryLink = getEntryLink(publicKeyHex, dataKey, { hashedDataKeyHex: true });
        entryLink = trimUriPrefix(entryLink, URI_SKYNET_PREFIX);
        if (lastSkylink && entryLink !== lastSkylink) {
            throw new Error("Could not verify registry proof chain");
        }
        // Set the resolver skylink if this is the first link in the chain.
        if (!resolverSkylink) {
            resolverSkylink = entryLink;
        }
        // Data bytes are hex-encoded raw skylink bytes.
        const rawData = hexToUint8Array(data);
        const skylink = encodeSkylinkBase64(rawData);
        // Try verifying the returned data.
        const entryToVerify = {
            dataKey,
            data: rawData,
            revision: BigInt(entry.revision),
        };
        // Verify length of signature and public key.
        validateUint8ArrayLen("signatureArray", signatureBytes, "response value", SIGNATURE_LENGTH);
        validateUint8ArrayLen("publicKeyArray", publicKeyBytes, "parameter", PUBLIC_KEY_LENGTH / 2);
        if (!sign.detached.verify(hashRegistryEntry(entryToVerify, true), signatureBytes, publicKeyBytes)) {
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
export function validateRegistryEntry(name, value, valueKind) {
    validateObject(name, value, valueKind);
    validateString(`${name}.dataKey`, value.dataKey, `${valueKind} field`);
    validateUint8Array(`${name}.data`, value.data, `${valueKind} field`);
    validateBigint(`${name}.revision`, value.revision, `${valueKind} field`);
}
/**
 * Validates the given value as a hex-encoded, potentially prefixed public key.
 *
 * @param name - The name of the value.
 * @param publicKey - The public key.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid hex-encoded public key.
 */
export function validatePublicKey(name, publicKey, valueKind) {
    if (!isHexString(trimPrefix(publicKey, ED25519_PREFIX))) {
        throwValidationError(name, publicKey, valueKind, "a hex-encoded string with a valid prefix");
    }
}
