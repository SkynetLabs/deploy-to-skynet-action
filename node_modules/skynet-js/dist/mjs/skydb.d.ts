import { SkynetClient } from "./client";
import { CustomDownloadOptions } from "./download";
import { CustomGetEntryOptions, RegistryEntry, CustomSetEntryOptions } from "./registry";
import { CustomUploadOptions } from "./upload";
import { JsonData } from "./utils/types";
export declare type JsonFullData = {
    _data: JsonData;
    _v: number;
};
/**
 * Custom get JSON options. Includes the options for get entry, to get the
 * skylink; and download, to download the file from the skylink.
 *
 * @property [cachedDataLink] - The last known data link. If it hasn't changed, do not download the file contents again.
 */
export declare type CustomGetJSONOptions = CustomGetEntryOptions & CustomDownloadOptions & {
    cachedDataLink?: string;
};
/**
 * The default options for get JSON. Includes the default get entry and download
 * options.
 */
export declare const DEFAULT_GET_JSON_OPTIONS: {
    cachedDataLink: undefined;
    endpointDownload: string;
    download: boolean;
    path: undefined;
    range: undefined;
    responseType: undefined;
    subdomain: boolean;
    APIKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    endpointGetEntry: string;
    hashedDataKeyHex: boolean;
};
/**
 * Custom set JSON options. Includes the options for upload, to get the file for
 * the skylink; get JSON, to retrieve the revision; and set entry, to set the
 * entry with the skylink and revision.
 */
export declare type CustomSetJSONOptions = CustomUploadOptions & CustomGetJSONOptions & CustomSetEntryOptions;
/**
 * The default options for set JSON. Includes the default upload, get JSON, and
 * set entry options.
 */
export declare const DEFAULT_SET_JSON_OPTIONS: {
    endpointSetEntry: string;
    hashedDataKeyHex: boolean;
    APIKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    cachedDataLink: undefined;
    endpointDownload: string;
    download: boolean;
    path: undefined;
    range: undefined;
    responseType: undefined;
    subdomain: boolean;
    endpointGetEntry: string;
    endpointUpload: string;
    endpointLargeUpload: string;
    customFilename: string;
    errorPages: undefined;
    largeFileSize: number;
    retryDelays: number[];
    tryFiles: undefined;
};
export declare type JSONResponse = {
    data: JsonData | null;
    dataLink: string | null;
};
export declare type RawBytesResponse = {
    data: Uint8Array | null;
    dataLink: string | null;
};
/**
 * Gets the JSON object corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned JSON and corresponding data link.
 * @throws - Will throw if the returned signature does not match the returned entry, or if the skylink in the entry is invalid.
 */
export declare function getJSON(this: SkynetClient, publicKey: string, dataKey: string, customOptions?: CustomGetJSONOptions): Promise<JSONResponse>;
/**
 * Sets a JSON object at the registry entry corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param json - The JSON data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned JSON and corresponding data link.
 * @throws - Will throw if the input keys are not valid strings.
 */
export declare function setJSON(this: SkynetClient, privateKey: string, dataKey: string, json: JsonData, customOptions?: CustomSetJSONOptions): Promise<JSONResponse>;
/**
 * Deletes a JSON object at the registry entry corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @throws - Will throw if the input keys are not valid strings.
 */
export declare function deleteJSON(this: SkynetClient, privateKey: string, dataKey: string, customOptions?: CustomSetJSONOptions): Promise<void>;
/**
 * Sets the datalink for the entry at the given private key and data key.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The data key.
 * @param dataLink - The data link to set at the entry.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @throws - Will throw if the input keys are not valid strings.
 */
export declare function setDataLink(this: SkynetClient, privateKey: string, dataKey: string, dataLink: string, customOptions?: CustomSetJSONOptions): Promise<void>;
/**
 * Gets the raw bytes corresponding to the publicKey and dataKey. The caller is responsible for setting any metadata in the bytes.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned bytes.
 * @throws - Will throw if the returned signature does not match the returned entry, or if the skylink in the entry is invalid.
 */
export declare function getRawBytes(this: SkynetClient, publicKey: string, dataKey: string, customOptions?: CustomGetJSONOptions): Promise<RawBytesResponse>;
/**
 * Gets the registry entry for the given raw bytes or creates the entry if it doesn't exist.
 *
 * @param client - The Skynet client.
 * @param publicKey - The user public key.
 * @param dataKey - The dat akey.
 * @param data - The raw byte data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The registry entry and corresponding data link.
 * @throws - Will throw if the revision is already the maximum value.
 */
export declare function getOrCreateRawBytesRegistryEntry(client: SkynetClient, publicKey: string, dataKey: string, data: Uint8Array, customOptions?: CustomSetJSONOptions): Promise<RegistryEntry>;
/**
 * Gets the next entry for the given public key and data key, setting the data to be the given data and the revision number accordingly.
 *
 * @param client - The Skynet client.
 * @param publicKey - The user public key.
 * @param dataKey - The dat akey.
 * @param data - The data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The registry entry and corresponding data link.
 * @throws - Will throw if the revision is already the maximum value.
 */
export declare function getNextRegistryEntry(client: SkynetClient, publicKey: string, dataKey: string, data: Uint8Array, customOptions?: CustomGetEntryOptions): Promise<RegistryEntry>;
/**
 * Gets the registry entry and data link or creates the entry if it doesn't exist.
 *
 * @param client - The Skynet client.
 * @param publicKey - The user public key.
 * @param dataKey - The dat akey.
 * @param json - The JSON to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The registry entry and corresponding data link.
 * @throws - Will throw if the revision is already the maximum value.
 */
export declare function getOrCreateRegistryEntry(client: SkynetClient, publicKey: string, dataKey: string, json: JsonData, customOptions?: CustomSetJSONOptions): Promise<[RegistryEntry, string]>;
/**
 * Gets the next revision from a returned entry (or 0 if the entry was not found).
 *
 * @param entry - The returned registry entry.
 * @returns - The revision.
 * @throws - Will throw if the next revision would be beyond the maximum allowed value.
 */
export declare function getNextRevisionFromEntry(entry: RegistryEntry | null): bigint;
/**
 * Checks whether the raw data link matches the cached data link, if provided.
 *
 * @param rawDataLink - The raw, unformatted data link.
 * @param cachedDataLink - The cached data link, if provided.
 * @returns - Whether the cached data link is a match.
 * @throws - Will throw if the given cached data link is not a valid skylink.
 */
export declare function checkCachedDataLink(rawDataLink: string, cachedDataLink?: string): boolean;
//# sourceMappingURL=skydb.d.ts.map