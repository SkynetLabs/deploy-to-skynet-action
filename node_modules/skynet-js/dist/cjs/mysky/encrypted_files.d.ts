import { JsonData } from "../utils/types";
/**
 * The current response version for encrypted JSON files. Part of the metadata
 * prepended to encrypted data.
 */
export declare const ENCRYPTED_JSON_RESPONSE_VERSION = 1;
/**
 * The length of the encryption key.
 */
export declare const ENCRYPTION_KEY_LENGTH = 32;
/**
 * The length of the hidden field metadata stored along with encrypted files.
 * Note that this is hidden from the user, but not actually encrypted. It is
 * stored after the nonce.
 */
export declare const ENCRYPTION_HIDDEN_FIELD_METADATA_LENGTH = 16;
/**
 * The length of the random nonce, prepended to the encrypted bytes. It comes
 * before the unencrypted hidden field metadata.
 */
export declare const ENCRYPTION_NONCE_LENGTH = 24;
/**
 * The length of the hex-encoded share-able directory path seed.
 */
export declare const ENCRYPTION_PATH_SEED_DIRECTORY_LENGTH = 128;
/**
 * The length of the hex-encoded share-able file path seed.
 */
export declare const ENCRYPTION_PATH_SEED_FILE_LENGTH = 64;
export declare type EncryptedJSONResponse = {
    data: JsonData | null;
};
declare type EncryptedFileMetadata = {
    version: number;
};
/**
 * Decrypts the given bytes as an encrypted JSON file.
 *
 * @param data - The given raw bytes.
 * @param key - The encryption key.
 * @returns - The JSON data and metadata.
 * @throws - Will throw if the bytes could not be decrypted.
 */
export declare function decryptJSONFile(data: Uint8Array, key: Uint8Array): JsonData;
/**
 * Encrypts the given JSON data and metadata.
 *
 * @param json - The given JSON data.
 * @param metadata - The given metadata.
 * @param key - The encryption key.
 * @returns - The encrypted data.
 */
export declare function encryptJSONFile(json: JsonData, metadata: EncryptedFileMetadata, key: Uint8Array): Uint8Array;
/**
 * Derives key entropy for the given path seed.
 *
 * @param pathSeed - The given path seed.
 * @returns - The key entropy.
 */
export declare function deriveEncryptedFileKeyEntropy(pathSeed: string): Uint8Array;
/**
 * Derives the encrypted file tweak for the given path seed.
 *
 * @param pathSeed - the given path seed.
 * @returns - The encrypted file tweak.
 */
export declare function deriveEncryptedFileTweak(pathSeed: string): string;
/**
 * Derives the path seed for the relative path, given the starting path seed and
 * whether it is a directory. The path can be an absolute path if the root seed
 * is given.
 *
 * @param pathSeed - The given starting path seed.
 * @param subPath - The path.
 * @param isDirectory - Whether the path is a directory.
 * @returns - The path seed for the given path.
 * @throws - Will throw if the input sub path is not a valid path.
 * @deprecated - This function has been deprecated in favor of `mySky.deriveEncryptedPathSeed`.
 */
export declare function deriveEncryptedFileSeed(pathSeed: string, subPath: string, isDirectory: boolean): string;
/**
 * Derives the path seed for the relative path, given the starting path seed and
 * whether it is a directory. The path can be an absolute path if the root seed
 * is given.
 *
 * @param pathSeed - The given starting path seed.
 * @param subPath - The path.
 * @param isDirectory - Whether the path is a directory.
 * @returns - The path seed for the given path.
 * @throws - Will throw if the input sub path is not a valid path.
 */
export declare function deriveEncryptedPathSeed(pathSeed: string, subPath: string, isDirectory: boolean): string;
/**
 * To prevent analysis that can occur by looking at the sizes of files, all
 * encrypted files will be padded to the nearest "pad block" (after encryption).
 * A pad block is minimally 4 kib in size, is always a power of 2, and is always
 * at least 5% of the size of the file.
 *
 * For example, a 1 kib encrypted file would be padded to 4 kib, a 5 kib file
 * would be padded to 8 kib, and a 105 kib file would be padded to 112 kib.
 * Below is a short table of valid file sizes:
 *
 * ```
 *   4 KiB      8 KiB     12 KiB     16 KiB     20 KiB
 *  24 KiB     28 KiB     32 KiB     36 KiB     40 KiB
 *  44 KiB     48 KiB     52 KiB     56 KiB     60 KiB
 *  64 KiB     68 KiB     72 KiB     76 KiB     80 KiB
 *
 *  88 KiB     96 KiB    104 KiB    112 KiB    120 KiB
 * 128 KiB    136 KiB    144 KiB    152 KiB    160 KiB
 *
 * 176 KiB    192 Kib    208 KiB    224 KiB    240 KiB
 * 256 KiB    272 KiB    288 KiB    304 KiB    320 KiB
 *
 * 352 KiB    ... etc
 * ```
 *
 * Note that the first 20 valid sizes are all a multiple of 4 KiB, the next 10
 * are a multiple of 8 KiB, and each 10 after that the multiple doubles. We use
 * this method of padding files to prevent an adversary from guessing the
 * contents or structure of the file based on its size.
 *
 * @param initialSize - The size of the file.
 * @returns - The final size, padded to a pad block.
 * @throws - Will throw if the size would overflow the JS number type.
 */
export declare function padFileSize(initialSize: number): number;
/**
 * Checks if the given size corresponds to the correct padded block.
 *
 * @param size - The given file size.
 * @returns - Whether the size corresponds to a padded block.
 * @throws - Will throw if the size would overflow the JS number type.
 */
export declare function checkPaddedBlock(size: number): boolean;
/**
 * Encodes the given encrypted file metadata.
 *
 * @param metadata - The given metadata.
 * @returns - The encoded metadata bytes.
 * @throws - Will throw if the version does not fit in a byte.
 */
export declare function encodeEncryptedFileMetadata(metadata: EncryptedFileMetadata): Uint8Array;
export {};
//# sourceMappingURL=encrypted_files.d.ts.map