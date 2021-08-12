/// <reference types="node" />
import { RegistryEntry } from "./registry";
export declare type Signature = Buffer;
/**
 * Key pair.
 *
 * @property publicKey - The public key.
 * @property privateKey - The private key.
 */
export declare type KeyPair = {
    publicKey: string;
    privateKey: string;
};
/**
 * Key pair and seed.
 *
 * @property seed - The secure seed.
 */
export declare type KeyPairAndSeed = KeyPair & {
    seed: string;
};
export declare const HASH_LENGTH = 32;
/**
 * Derives a child seed from the given master seed and sub seed.
 *
 * @param masterSeed - The master seed to derive from.
 * @param seed - The sub seed for the derivation.
 * @returns - The child seed derived from `masterSeed` using `seed`.
 * @throws - Will throw if the inputs are not strings.
 */
export declare function deriveChildSeed(masterSeed: string, seed: string): string;
/**
 * Generates a master key pair and seed.
 *
 * @param [length=64] - The number of random bytes for the seed. Note that the string seed will be converted to hex representation, making it twice this length.
 * @returns - The generated key pair and seed.
 */
export declare function genKeyPairAndSeed(length?: number): KeyPairAndSeed;
/**
 * Generates a public and private key from a provided, secure seed.
 *
 * @param seed - A secure seed.
 * @returns - The generated key pair.
 * @throws - Will throw if the input is not a string.
 */
export declare function genKeyPairFromSeed(seed: string): KeyPair;
/**
 * Takes all given arguments and hashes them.
 *
 * @param args - Byte arrays to hash.
 * @returns - The final hash as a byte array.
 */
export declare function hashAll(...args: Uint8Array[]): Uint8Array;
/**
 * Hash the given data key.
 *
 * @param dataKey - Data key to hash.
 * @returns - Hash of the data key.
 */
export declare function hashDataKey(dataKey: string): Uint8Array;
/**
 * Hashes the given registry entry.
 *
 * @param registryEntry - Registry entry to hash.
 * @param hashedDataKeyHex - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 * @returns - Hash of the registry entry.
 */
export declare function hashRegistryEntry(registryEntry: RegistryEntry, hashedDataKeyHex: boolean): Uint8Array;
/**
 * Hashes the given string or byte array using sha512.
 *
 * @param message - The string or byte array to hash.
 * @returns - The resulting hash.
 */
export declare function sha512(message: Uint8Array | string): Uint8Array;
//# sourceMappingURL=crypto.d.ts.map