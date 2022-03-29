"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeSkylink = exports.newSkylinkV2 = exports.newEd25519PublicKey = exports.newSpecifier = exports.isSkylinkV2 = exports.isSkylinkV1 = exports.SiaSkylink = exports.EMPTY_SKYLINK = exports.RAW_SKYLINK_SIZE = exports.ERR_SKYLINK_INCORRECT_SIZE = exports.BASE64_ENCODED_SKYLINK_SIZE = exports.BASE32_ENCODED_SKYLINK_SIZE = void 0;
const crypto_1 = require("../crypto");
const encoding_1 = require("../utils/encoding");
const string_1 = require("../utils/string");
const url_1 = require("../utils/url");
const validation_1 = require("../utils/validation");
/**
 * The string length of the Skylink after it has been encoded using base32.
 */
exports.BASE32_ENCODED_SKYLINK_SIZE = 55;
/**
 * The string length of the Skylink after it has been encoded using base64.
 */
exports.BASE64_ENCODED_SKYLINK_SIZE = 46;
/**
 * Returned when a string could not be decoded into a Skylink due to it having
 * an incorrect size.
 */
exports.ERR_SKYLINK_INCORRECT_SIZE = "skylink has incorrect size";
/**
 * The raw size in bytes of the data that gets put into a link.
 */
exports.RAW_SKYLINK_SIZE = 34;
/**
 * An empty skylink.
 */
exports.EMPTY_SKYLINK = new Uint8Array(exports.RAW_SKYLINK_SIZE);
/**
 * An object containing the skylink bitfield and merkleroot. Corresponds to the
 * `Skylink` struct found in `skyd`.
 */
class SiaSkylink {
    /**
     * Creates a `SiaSkylink`.
     *
     * @param bitfield - The bitfield.
     * @param merkleRoot - The merkle root.
     */
    constructor(bitfield, merkleRoot) {
        this.bitfield = bitfield;
        this.merkleRoot = merkleRoot;
        (0, validation_1.validateNumber)("bitfield", bitfield, "constructor parameter");
        (0, validation_1.validateUint8ArrayLen)("merkleRoot", merkleRoot, "constructor parameter", 32);
    }
    /**
     * Returns the byte array encoding of the skylink.
     *
     * @returns - The byte array encoding.
     */
    toBytes() {
        const buf = new ArrayBuffer(exports.RAW_SKYLINK_SIZE);
        const view = new DataView(buf);
        view.setUint16(0, this.bitfield, true);
        const uint8Bytes = new Uint8Array(buf);
        uint8Bytes.set(this.merkleRoot, 2);
        return uint8Bytes;
    }
    /**
     * Converts the skylink to a string.
     *
     * @returns - The skylink as a string.
     */
    toString() {
        return (0, encoding_1.encodeSkylinkBase64)(this.toBytes());
    }
    /**
     * Loads the given raw data and returns the result. Based on sl.LoadBytes in
     * skyd.
     *
     * @param data - The raw bytes to load.
     * @returns - The sia skylink.
     * @throws - Will throw if the data has an unexpected size.
     */
    static fromBytes(data) {
        (0, validation_1.validateUint8ArrayLen)("data", data, "parameter", exports.RAW_SKYLINK_SIZE);
        const view = new DataView(data.buffer);
        // Load the bitfield.
        const bitfield = view.getUint16(0, true);
        // TODO: Validate v1 bitfields.
        const merkleRoot = new Uint8Array(32);
        merkleRoot.set(data.slice(2));
        return new SiaSkylink(bitfield, merkleRoot);
    }
    /**
     * Converts from a string and returns the result. Based on sl.LoadString in
     * skyd.
     *
     * @param skylink - The skylink string to load.
     * @returns - The sia skylink.
     * @throws - Will throw if the data has an unexpected size.
     */
    static fromString(skylink) {
        const bytes = decodeSkylink(skylink);
        return SiaSkylink.fromBytes(bytes);
    }
}
exports.SiaSkylink = SiaSkylink;
/**
 * Checks if the given string is a V1 skylink.
 *
 * @param skylink - The skylink to check.
 * @returns - Whether the skylink is a V1 skylink.
 */
function isSkylinkV1(skylink) {
    const raw = decodeSkylink(skylink);
    // Load and check the bitfield.
    const view = new DataView(raw.buffer);
    const bitfield = view.getUint16(0, true);
    return isBitfieldSkylinkV1(bitfield);
}
exports.isSkylinkV1 = isSkylinkV1;
/**
 * Checks if the given string is a V2 skylink.
 *
 * @param skylink - The skylink to check.
 * @returns - Whether the skylink is a V2 skylink.
 */
function isSkylinkV2(skylink) {
    // Decode the base into raw data.
    const raw = decodeSkylink(skylink);
    // Load and check the bitfield.
    const view = new DataView(raw.buffer);
    const bitfield = view.getUint16(0, true);
    return isBitfieldSkylinkV2(bitfield);
}
exports.isSkylinkV2 = isSkylinkV2;
/**
 * Returns a boolean indicating if the Skylink is a V1 skylink
 *
 * @param bitfield - The bitfield to check.
 * @returns - Whether the bitfield corresponds to a V1 skylink.
 */
function isBitfieldSkylinkV1(bitfield) {
    return (bitfield & 3) === 0;
}
/**
 * Returns a boolean indicating if the Skylink is a V2 skylink
 *
 * @param bitfield - The bitfield to check.
 * @returns - Whether the bitfield corresponds to a V2 skylink.
 */
function isBitfieldSkylinkV2(bitfield) {
    // We compare against 1 here because a V2 skylink only uses the version
    // bits. All other bits should be set to 0.
    return bitfield === 1;
}
const SPECIFIER_LEN = 16;
/**
 * Returns a specifier for given name, a specifier can only be 16 bytes so we
 * panic if the given name is too long.
 *
 * @param name - The name.
 * @returns - The specifier, if valid.
 */
function newSpecifier(name) {
    (0, validation_1.validateString)("name", name, "parameter");
    const specifier = new Uint8Array(SPECIFIER_LEN);
    specifier.set((0, string_1.stringToUint8ArrayUtf8)(name));
    return specifier;
}
exports.newSpecifier = newSpecifier;
const PUBLIC_KEY_SIZE = 32;
/**
 * The sia public key object. Corresponds to the struct in `skyd`.
 */
class SiaPublicKey {
    /**
     * Creates a `SiaPublicKey`.
     *
     * @param algorithm - The algorithm.
     * @param key - The public key, as a byte array.
     */
    constructor(algorithm, key) {
        this.algorithm = algorithm;
        this.key = key;
    }
    /**
     * Encodes the public key as a byte array.
     *
     * @returns - The encoded byte array.
     */
    marshalSia() {
        const bytes = new Uint8Array(SPECIFIER_LEN + 8 + PUBLIC_KEY_SIZE);
        bytes.set(this.algorithm);
        bytes.set((0, encoding_1.encodePrefixedBytes)(this.key), SPECIFIER_LEN);
        return bytes;
    }
}
/**
 * Creates a new sia public key. Matches Ed25519PublicKey in sia.
 *
 * @param publicKey - The hex-encoded public key.
 * @returns - The SiaPublicKey.
 */
function newEd25519PublicKey(publicKey) {
    (0, validation_1.validateHexString)("publicKey", publicKey, "parameter");
    const algorithm = newSpecifier("ed25519");
    const publicKeyBytes = (0, string_1.hexToUint8Array)(publicKey);
    (0, validation_1.validateUint8ArrayLen)("publicKeyBytes", publicKeyBytes, "converted publicKey", PUBLIC_KEY_SIZE);
    return new SiaPublicKey(algorithm, publicKeyBytes);
}
exports.newEd25519PublicKey = newEd25519PublicKey;
/**
 * Creates a new v2 skylink. Matches `NewSkylinkV2` in skyd.
 *
 * @param siaPublicKey - The public key as a SiaPublicKey.
 * @param tweak - The hashed tweak.
 * @returns - The v2 skylink.
 */
function newSkylinkV2(siaPublicKey, tweak) {
    const version = 2;
    const bitfield = version - 1;
    const merkleRoot = deriveRegistryEntryID(siaPublicKey, tweak);
    return new SiaSkylink(bitfield, merkleRoot);
}
exports.newSkylinkV2 = newSkylinkV2;
/**
 * A helper function that decodes the given string representation of a skylink
 * into raw bytes. It either performs a base32 decoding, or base64 decoding,
 * depending on the length.
 *
 * @param encoded - The encoded string.
 * @returns - The decoded raw bytes.
 * @throws - Will throw if the skylink is not a V1 or V2 skylink string.
 */
function decodeSkylink(encoded) {
    encoded = (0, string_1.trimUriPrefix)(encoded, url_1.URI_SKYNET_PREFIX);
    let bytes;
    if (encoded.length === exports.BASE32_ENCODED_SKYLINK_SIZE) {
        bytes = (0, encoding_1.decodeSkylinkBase32)(encoded);
    }
    else if (encoded.length === exports.BASE64_ENCODED_SKYLINK_SIZE) {
        bytes = (0, encoding_1.decodeSkylinkBase64)(encoded);
    }
    else {
        throw new Error(exports.ERR_SKYLINK_INCORRECT_SIZE);
    }
    // Sanity check the size of the given data.
    /* istanbul ignore next */
    if (bytes.length != exports.RAW_SKYLINK_SIZE) {
        throw new Error("failed to load skylink data");
    }
    return bytes;
}
exports.decodeSkylink = decodeSkylink;
/**
 * A helper to derive an entry id for a registry key value pair. Matches `DeriveRegistryEntryID` in sia.
 *
 * @param pubKey - The sia public key.
 * @param tweak - The tweak.
 * @returns - The entry ID as a hash of the inputs.
 */
function deriveRegistryEntryID(pubKey, tweak) {
    return (0, crypto_1.hashAll)(pubKey.marshalSia(), tweak);
}
