"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPathComponent = exports.splitPath = exports.DiscoverableBucketTweak = exports.deriveDiscoverableFileTweak = void 0;
const crypto_1 = require("../crypto");
const string_1 = require("../utils/string");
const DISCOVERABLE_BUCKET_TWEAK_VERSION = 1;
/**
 * Derives the discoverable file tweak for the given path.
 *
 * @param path - The given path.
 * @returns - The hex-encoded tweak.
 */
function deriveDiscoverableFileTweak(path) {
    const dbt = new DiscoverableBucketTweak(path);
    const bytes = dbt.getHash();
    return (0, string_1.toHexString)(bytes);
}
exports.deriveDiscoverableFileTweak = deriveDiscoverableFileTweak;
/**
 * The tweak for the discoverable bucket for the given path.
 */
class DiscoverableBucketTweak {
    /**
     * Creates a new `DiscoverableBucketTweak`.
     *
     * @param path - The MySky data path.
     */
    constructor(path) {
        const paths = splitPath(path);
        const pathHashes = paths.map(hashPathComponent);
        this.version = DISCOVERABLE_BUCKET_TWEAK_VERSION;
        this.path = pathHashes;
    }
    /**
     * Encodes the tweak into a byte array.
     *
     * @returns - The encoded byte array.
     */
    encode() {
        const size = 1 + 32 * this.path.length;
        const buf = new Uint8Array(size);
        buf.set([this.version]);
        let offset = 1;
        for (const pathLevel of this.path) {
            buf.set(pathLevel, offset);
            offset += 32;
        }
        return buf;
    }
    /**
     * Gets the hash of the tweak.
     *
     * @returns - The hash.
     */
    getHash() {
        const encoding = this.encode();
        return (0, crypto_1.hashAll)(encoding);
    }
}
exports.DiscoverableBucketTweak = DiscoverableBucketTweak;
/**
 * Splits the path by forward slashes.
 *
 * @param path - The path to split.
 * @returns - An array of path components.
 */
function splitPath(path) {
    return path.split("/");
}
exports.splitPath = splitPath;
/**
 * Hashes the path component.
 *
 * @param component - The component extracted from the path.
 * @returns - The hash.
 */
// TODO: Can we replace with hashString?
function hashPathComponent(component) {
    return (0, crypto_1.hashAll)((0, string_1.stringToUint8ArrayUtf8)(component));
}
exports.hashPathComponent = hashPathComponent;
