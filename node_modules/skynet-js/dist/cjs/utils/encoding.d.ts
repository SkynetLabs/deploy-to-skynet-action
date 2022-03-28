/**
 * Decodes the skylink encoded using base32 encoding to bytes.
 *
 * @param skylink - The encoded skylink.
 * @returns - The decoded bytes.
 */
export declare function decodeSkylinkBase32(skylink: string): Uint8Array;
/**
 * Encodes the bytes to a skylink encoded using base32 encoding.
 *
 * @param bytes - The bytes to encode.
 * @returns - The encoded skylink.
 */
export declare function encodeSkylinkBase32(bytes: Uint8Array): string;
/**
 * Decodes the skylink encoded using base64 raw URL encoding to bytes.
 *
 * @param skylink - The encoded skylink.
 * @returns - The decoded bytes.
 */
export declare function decodeSkylinkBase64(skylink: string): Uint8Array;
/**
 * Encodes the bytes to a skylink encoded using base64 raw URL encoding.
 *
 * @param bytes - The bytes to encode.
 * @returns - The encoded skylink.
 */
export declare function encodeSkylinkBase64(bytes: Uint8Array): string;
/**
 * Converts the given number into a uint8 array. Uses little-endian encoding.
 *
 * @param num - Number to encode.
 * @returns - Number encoded as a byte array.
 */
export declare function encodeNumber(num: number): Uint8Array;
/**
 * Encodes the given bigint into a uint8 array. Uses little-endian encoding.
 *
 * @param int - Bigint to encode.
 * @returns - Bigint encoded as a byte array.
 * @throws - Will throw if the int does not fit in 64 bits.
 */
export declare function encodeBigintAsUint64(int: bigint): Uint8Array;
/**
 * Encodes the uint8array, prefixed by its length.
 *
 * @param bytes - The input array.
 * @returns - The encoded byte array.
 */
export declare function encodePrefixedBytes(bytes: Uint8Array): Uint8Array;
/**
 * Encodes the given UTF-8 string into a uint8 array containing the string length and the string.
 *
 * @param str - String to encode.
 * @returns - String encoded as a byte array.
 */
export declare function encodeUtf8String(str: string): Uint8Array;
//# sourceMappingURL=encoding.d.ts.map