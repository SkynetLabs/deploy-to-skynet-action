import { SkynetClient } from "./client";
import { BaseCustomOptions } from "./utils/options";
import { Signature } from "./crypto";
/**
 * Custom get entry options.
 *
 * @property [endpointGetEntry] - The relative URL path of the portal endpoint to contact.
 * @property [hashedDataKeyHex] - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 */
export declare type CustomGetEntryOptions = BaseCustomOptions & {
    endpointGetEntry?: string;
    hashedDataKeyHex?: boolean;
};
/**
 * Custom set entry options.
 *
 * @property [endpointSetEntry] - The relative URL path of the portal endpoint to contact.
 * @property [hashedDataKeyHex] - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 */
export declare type CustomSetEntryOptions = BaseCustomOptions & {
    endpointSetEntry?: string;
    hashedDataKeyHex?: boolean;
};
/**
 * Custom validate registry proof options.
 *
 * @property [resolverSkylink] - The returned resolver skylink to verify.
 * @property [skylink] - The returned resolved skylink to verify.
 */
export declare type CustomValidateRegistryProofOptions = {
    resolverSkylink?: string;
    skylink?: string;
};
export declare const DEFAULT_GET_ENTRY_OPTIONS: {
    endpointGetEntry: string;
    hashedDataKeyHex: boolean;
    APIKey: string;
    skynetApiKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    loginFn: undefined;
};
export declare const DEFAULT_SET_ENTRY_OPTIONS: {
    endpointSetEntry: string;
    hashedDataKeyHex: boolean;
    APIKey: string;
    skynetApiKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    loginFn: undefined;
};
/**
 * Regex for JSON revision value without quotes.
 */
export declare const REGEX_REVISION_NO_QUOTES: RegExp;
/**
 * The type of an entry that doesn't contain a pubkey. All of the data is
 * considered to be arbitrary.
 */
export declare const REGISTRY_TYPE_WITHOUT_PUBKEY = 1;
/**
 * The type of an entry which is expected to have a RegistryPubKeyHashSize long
 * hash of a host's pubkey at the beginning of its data. The key is used to
 * determine whether an entry is considered a primary or secondary entry on a
 * host.
 */
export declare const REGISTRY_TYPE_WITH_PUBKEY = 2;
/**
 * Registry entry.
 *
 * @property dataKey - The key of the data for the given entry.
 * @property data - The data stored in the entry.
 * @property revision - The revision number for the entry.
 */
export declare type RegistryEntry = {
    dataKey: string;
    data: Uint8Array;
    revision: bigint;
};
/**
 * A single registry proof entry in a registry proof chain.
 */
export declare type RegistryProofEntry = {
    data: string;
    revision: number;
    datakey: string;
    publickey: {
        algorithm: string;
        key: string;
    };
    signature: string;
    type: number;
};
/**
 * Signed registry entry.
 *
 * @property entry - The registry entry.
 * @property signature - The signature of the registry entry.
 */
export declare type SignedRegistryEntry = {
    entry: RegistryEntry | null;
    signature: Signature | null;
};
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
export declare function getEntry(this: SkynetClient, publicKey: string, dataKey: string, customOptions?: CustomGetEntryOptions): Promise<SignedRegistryEntry>;
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
export declare function getEntryUrl(this: SkynetClient, publicKey: string, dataKey: string, customOptions?: CustomGetEntryOptions): Promise<string>;
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
export declare function getEntryUrlForPortal(portalUrl: string, publicKey: string, dataKey: string, customOptions?: CustomGetEntryOptions): string;
/**
 * Gets the entry link for the entry at the given public key and data key. This link stays the same even if the content at the entry changes.
 *
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry link.
 * @throws - Will throw if the given key is not valid.
 */
export declare function getEntryLink(publicKey: string, dataKey: string, customOptions?: CustomGetEntryOptions): string;
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
export declare function getEntryLinkAsync(this: SkynetClient, publicKey: string, dataKey: string, customOptions?: CustomGetEntryOptions): Promise<string>;
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
export declare function setEntry(this: SkynetClient, privateKey: string, entry: RegistryEntry, customOptions?: CustomSetEntryOptions): Promise<void>;
/**
 * Signs the entry with the given private key.
 *
 * @param privateKey - The user private key.
 * @param entry - The entry to sign.
 * @param hashedDataKeyHex - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 * @returns - The signature.
 */
export declare function signEntry(privateKey: string, entry: RegistryEntry, hashedDataKeyHex: boolean): Promise<Uint8Array>;
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
export declare function postSignedEntry(this: SkynetClient, publicKey: string, entry: RegistryEntry, signature: Uint8Array, customOptions?: CustomSetEntryOptions): Promise<void>;
/**
 * Validates the registry proof.
 *
 * @param proof - The registry proof.
 * @param [opts] - Optional custom options.
 * @returns - The resolver skylink and resolved skylink from the proof.
 * @throws - Will throw if the registry proof fails to verify.
 */
export declare function validateRegistryProof(proof: Array<RegistryProofEntry>, opts?: CustomValidateRegistryProofOptions): {
    skylink: string;
    resolverSkylink: string;
};
/**
 * Validates the given registry entry.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 */
export declare function validateRegistryEntry(name: string, value: unknown, valueKind: string): void;
/**
 * Validates the given value as a hex-encoded, potentially prefixed public key.
 *
 * @param name - The name of the value.
 * @param publicKey - The public key.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid hex-encoded public key.
 */
export declare function validatePublicKey(name: string, publicKey: string, valueKind: string): void;
//# sourceMappingURL=registry.d.ts.map