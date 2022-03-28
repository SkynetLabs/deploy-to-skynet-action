/**
 * Prepends the prefix to the given string only if the string does not already start with the prefix.
 *
 * @param str - The string.
 * @param prefix - The prefix.
 * @returns - The prefixed string.
 */
export declare function ensurePrefix(str: string, prefix: string): string;
/**
 * Removes slashes from the beginning and end of the string.
 *
 * @param str - The string to process.
 * @returns - The processed string.
 */
export declare function trimForwardSlash(str: string): string;
/**
 * Removes a prefix from the beginning of the string.
 *
 * @param str - The string to process.
 * @param prefix - The prefix to remove.
 * @param [limit] - Maximum amount of times to trim. No limit by default.
 * @returns - The processed string.
 */
export declare function trimPrefix(str: string, prefix: string, limit?: number): string;
/**
 * Removes a suffix from the end of the string.
 *
 * @param str - The string to process.
 * @param suffix - The suffix to remove.
 * @param [limit] - Maximum amount of times to trim. No limit by default.
 * @returns - The processed string.
 */
export declare function trimSuffix(str: string, suffix: string, limit?: number): string;
/**
 * Removes a URI prefix from the beginning of the string.
 *
 * @param str - The string to process.
 * @param prefix - The prefix to remove. Should contain double slashes, e.g. sia://.
 * @returns - The processed string.
 */
export declare function trimUriPrefix(str: string, prefix: string): string;
/**
 * Converts a UTF-8 string to a uint8 array containing valid UTF-8 bytes.
 *
 * @param str - The string to convert.
 * @returns - The uint8 array.
 * @throws - Will throw if the input is not a string.
 */
export declare function stringToUint8ArrayUtf8(str: string): Uint8Array;
/**
 * Converts a uint8 array containing valid utf-8 bytes to a string.
 *
 * @param array - The uint8 array to convert.
 * @returns - The string.
 */
export declare function uint8ArrayToStringUtf8(array: Uint8Array): string;
/**
 * Converts a hex encoded string to a uint8 array.
 *
 * @param str - The string to convert.
 * @returns - The uint8 array.
 * @throws - Will throw if the input is not a valid hex-encoded string or is an empty string.
 */
export declare function hexToUint8Array(str: string): Uint8Array;
/**
 * Returns true if the input is a valid hex-encoded string.
 *
 * @param str - The input string.
 * @returns - True if the input is hex-encoded.
 * @throws - Will throw if the input is not a string.
 */
export declare function isHexString(str: string): boolean;
/**
 * Convert a byte array to a hex string.
 *
 * @param byteArray - The byte array to convert.
 * @returns - The hex string.
 * @see {@link https://stackoverflow.com/a/44608819|Stack Overflow}
 */
export declare function toHexString(byteArray: Uint8Array): string;
//# sourceMappingURL=string.d.ts.map