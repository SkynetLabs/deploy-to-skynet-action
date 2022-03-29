/**
 * The string length of the Skylink after it has been encoded using base32.
 */
export declare const BASE32_ENCODED_SKYLINK_SIZE = 55;
/**
 * The string length of the Skylink after it has been encoded using base64.
 */
export declare const BASE64_ENCODED_SKYLINK_SIZE = 46;
/**
 * Returned when a string could not be decoded into a Skylink due to it having
 * an incorrect size.
 */
export declare const ERR_SKYLINK_INCORRECT_SIZE = "skylink has incorrect size";
/**
 * The raw size in bytes of the data that gets put into a link.
 */
export declare const RAW_SKYLINK_SIZE = 34;
/**
 * An empty skylink.
 */
export declare const EMPTY_SKYLINK: Uint8Array;
/**
 * An object containing the skylink bitfield and merkleroot. Corresponds to the
 * `Skylink` struct found in `skyd`.
 */
export declare class SiaSkylink {
    bitfield: number;
    merkleRoot: Uint8Array;
    /**
     * Creates a `SiaSkylink`.
     *
     * @param bitfield - The bitfield.
     * @param merkleRoot - The merkle root.
     */
    constructor(bitfield: number, merkleRoot: Uint8Array);
    /**
     * Returns the byte array encoding of the skylink.
     *
     * @returns - The byte array encoding.
     */
    toBytes(): Uint8Array;
    /**
     * Converts the skylink to a string.
     *
     * @returns - The skylink as a string.
     */
    toString(): string;
    /**
     * Loads the given raw data and returns the result. Based on sl.LoadBytes in
     * skyd.
     *
     * @param data - The raw bytes to load.
     * @returns - The sia skylink.
     * @throws - Will throw if the data has an unexpected size.
     */
    static fromBytes(data: Uint8Array): SiaSkylink;
    /**
     * Converts from a string and returns the result. Based on sl.LoadString in
     * skyd.
     *
     * @param skylink - The skylink string to load.
     * @returns - The sia skylink.
     * @throws - Will throw if the data has an unexpected size.
     */
    static fromString(skylink: string): SiaSkylink;
}
/**
 * Checks if the given string is a V1 skylink.
 *
 * @param skylink - The skylink to check.
 * @returns - Whether the skylink is a V1 skylink.
 */
export declare function isSkylinkV1(skylink: string): boolean;
/**
 * Checks if the given string is a V2 skylink.
 *
 * @param skylink - The skylink to check.
 * @returns - Whether the skylink is a V2 skylink.
 */
export declare function isSkylinkV2(skylink: string): boolean;
/**
 * Returns a specifier for given name, a specifier can only be 16 bytes so we
 * panic if the given name is too long.
 *
 * @param name - The name.
 * @returns - The specifier, if valid.
 */
export declare function newSpecifier(name: string): Uint8Array;
/**
 * The sia public key object. Corresponds to the struct in `skyd`.
 */
declare class SiaPublicKey {
    algorithm: Uint8Array;
    key: Uint8Array;
    /**
     * Creates a `SiaPublicKey`.
     *
     * @param algorithm - The algorithm.
     * @param key - The public key, as a byte array.
     */
    constructor(algorithm: Uint8Array, key: Uint8Array);
    /**
     * Encodes the public key as a byte array.
     *
     * @returns - The encoded byte array.
     */
    marshalSia(): Uint8Array;
}
/**
 * Creates a new sia public key. Matches Ed25519PublicKey in sia.
 *
 * @param publicKey - The hex-encoded public key.
 * @returns - The SiaPublicKey.
 */
export declare function newEd25519PublicKey(publicKey: string): SiaPublicKey;
/**
 * Creates a new v2 skylink. Matches `NewSkylinkV2` in skyd.
 *
 * @param siaPublicKey - The public key as a SiaPublicKey.
 * @param tweak - The hashed tweak.
 * @returns - The v2 skylink.
 */
export declare function newSkylinkV2(siaPublicKey: SiaPublicKey, tweak: Uint8Array): SiaSkylink;
/**
 * A helper function that decodes the given string representation of a skylink
 * into raw bytes. It either performs a base32 decoding, or base64 decoding,
 * depending on the length.
 *
 * @param encoded - The encoded string.
 * @returns - The decoded raw bytes.
 * @throws - Will throw if the skylink is not a V1 or V2 skylink string.
 */
export declare function decodeSkylink(encoded: string): Uint8Array;
export {};
//# sourceMappingURL=sia.d.ts.map