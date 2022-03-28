import { SkynetClient } from "./client";
import { CustomDownloadOptions } from "./download";
import { CustomGetEntryOptions, RegistryEntry, CustomSetEntryOptions } from "./registry";
import { CustomUploadOptions } from "./upload";
import { JsonData } from "./utils/types";
import { EntryData } from "./mysky";
export declare const DELETION_ENTRY_DATA: Uint8Array;
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
    skynetApiKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    loginFn: undefined;
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
    skynetApiKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    loginFn: undefined;
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
    numParallelUploads: number;
    retryDelays: number[];
    tryFiles: undefined;
};
/**
 * Custom set entry data options. Includes the options for get and set entry.
 */
export declare type CustomSetEntryDataOptions = CustomGetEntryOptions & CustomSetEntryOptions & {
    allowDeletionEntryData: boolean;
};
/**
 * The default options for set entry data. Includes the default get entry and
 * set entry options.
 */
export declare const DEFAULT_SET_ENTRY_DATA_OPTIONS: {
    allowDeletionEntryData: boolean;
    endpointSetEntry: string;
    hashedDataKeyHex: boolean;
    APIKey: string;
    skynetApiKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    loginFn: undefined;
    endpointGetEntry: string;
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
 * Gets the JSON object corresponding to the publicKey and dataKey. If the data
 * was found, we update the cached revision number for the entry.
 *
 * NOTE: The cached revision number will be updated only if the data is found
 * (including deleted data). If there is a 404 or the entry contains deleted
 * data, null will be returned. If there is an error, the error is returned
 * without updating the cached revision number.
 *
 * Summary:
 *   - Data found: update cached revision
 *   - Parse error: don't update cached revision
 *   - Network error: don't update cached revision
 *   - Too low version error: don't update the cached revision
 *   - 404 (data not found): don't update the cached revision
 *   - Data deleted: update cached revision
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
 * Sets a JSON object at the registry entry corresponding to the publicKey and
 * dataKey.
 *
 * This will use the entry revision number from the cache, so getJSON must
 * always be called first for existing entries.
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
 * Deletes a JSON object at the registry entry corresponding to the publicKey
 * and dataKey.
 *
 * This will use the entry revision number from the cache, so getJSON must
 * always be called first.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @throws - Will throw if the input keys are not valid strings.
 */
export declare function deleteJSON(this: SkynetClient, privateKey: string, dataKey: string, customOptions?: CustomSetEntryDataOptions): Promise<void>;
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
export declare function setDataLink(this: SkynetClient, privateKey: string, dataKey: string, dataLink: string, customOptions?: CustomSetEntryDataOptions): Promise<void>;
/**
 * Gets the raw registry entry data at the given public key and data key.
 *
 * If the data was found, we update the cached revision number for the entry.
 * See getJSON for behavior in other cases.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The data key.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 */
export declare function getEntryData(this: SkynetClient, publicKey: string, dataKey: string, customOptions?: CustomGetEntryOptions): Promise<EntryData>;
/**
 * Sets the raw entry data at the given private key and data key.
 *
 * This will use the entry revision number from the cache, so getEntryData must
 * always be called first for existing entries.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The data key.
 * @param data - The raw entry data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 * @throws - Will throw if the length of the data is > 70 bytes.
 */
export declare function setEntryData(this: SkynetClient, privateKey: string, dataKey: string, data: Uint8Array, customOptions?: CustomSetEntryDataOptions): Promise<EntryData>;
/**
 * Deletes the entry data at the given private key and data key. Trying to
 * access the data again with e.g. getEntryData will result in null.
 *
 * This will use the entry revision number from the cache, so getEntryData must
 * always be called first.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The data key.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 */
export declare function deleteEntryData(this: SkynetClient, privateKey: string, dataKey: string, customOptions?: CustomSetEntryDataOptions): Promise<void>;
/**
 * Gets the raw bytes corresponding to the publicKey and dataKey. The caller is responsible for setting any metadata in the bytes.
 *
 * If the data was found, we update the cached revision number for the entry.
 * See getJSON for behavior in other cases.
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
 * Gets the registry entry and data link or creates the entry if it doesn't
 * exist. Uses the cached revision number for the entry, or 0 if the entry has
 * not been cached.
 *
 * @param client - The Skynet client.
 * @param dataKey - The data key.
 * @param data - The JSON or raw byte data to set.
 * @param revision - The revision number to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The registry entry and corresponding data link.
 * @throws - Will throw if the revision is already the maximum value.
 */
export declare function getOrCreateSkyDBRegistryEntry(client: SkynetClient, dataKey: string, data: JsonData | Uint8Array, revision: bigint, customOptions?: CustomSetJSONOptions): Promise<[RegistryEntry, string]>;
/**
 * Increments the given revision number and checks to make sure it is not
 * greater than the maximum revision.
 *
 * @param revision - The given revision number.
 * @returns - The incremented revision number.
 * @throws - Will throw if the incremented revision number is greater than the maximum revision.
 */
export declare function incrementRevision(revision: bigint): bigint;
/**
 * Checks whether the raw data link matches the cached data link, if provided.
 *
 * @param rawDataLink - The raw, unformatted data link.
 * @param cachedDataLink - The cached data link, if provided.
 * @returns - Whether the cached data link is a match.
 * @throws - Will throw if the given cached data link is not a valid skylink.
 */
export declare function checkCachedDataLink(rawDataLink: string, cachedDataLink?: string): boolean;
/**
 * Validates the given entry data.
 *
 * @param data - The entry data to validate.
 * @param allowDeletionEntryData - If set to false, disallows setting the entry data that marks a deletion. This is a likely developer error if it was not done through the deleteEntryData method.
 * @throws - Will throw if the data is invalid.
 */
export declare function validateEntryData(data: Uint8Array, allowDeletionEntryData: boolean): void;
//# sourceMappingURL=skydb_v2.d.ts.map