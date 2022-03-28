import { SkynetClient } from "./client";
import { EntryData } from "./mysky";
import { CustomGetEntryOptions, RegistryEntry } from "./registry";
import { CustomGetJSONOptions, CustomSetEntryDataOptions, CustomSetJSONOptions, JSONResponse, RawBytesResponse } from "./skydb_v2";
import { JsonData } from "./utils/types";
/**
 * Gets the JSON object corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned JSON and corresponding data link.
 * @throws - Will throw if the returned signature does not match the returned entry, or if the skylink in the entry is invalid.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `client.dbV2.getJSON` is recommended.
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
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `client.dbV2.setJSON` is recommended.
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
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `client.dbV2.deleteJSON` is recommended.
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
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `client.dbV2.setDataLink` is recommended.
 */
export declare function setDataLink(this: SkynetClient, privateKey: string, dataKey: string, dataLink: string, customOptions?: CustomSetEntryDataOptions): Promise<void>;
/**
 * Gets the raw registry entry data at the given public key and data key.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The data key.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `client.dbV2.getEntryData` is recommended.
 */
export declare function getEntryData(this: SkynetClient, publicKey: string, dataKey: string, customOptions?: CustomGetEntryOptions): Promise<EntryData>;
/**
 * Sets the raw entry data at the given private key and data key.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The data key.
 * @param data - The raw entry data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 * @throws - Will throw if the length of the data is > 70 bytes.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `client.dbV2.setEntryData` is recommended.
 */
export declare function setEntryData(this: SkynetClient, privateKey: string, dataKey: string, data: Uint8Array, customOptions?: CustomSetEntryDataOptions): Promise<EntryData>;
/**
 * Deletes the entry data at the given private key and data key. Trying to
 * access the data again with e.g. getEntryData will result in null.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The data key.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `client.dbV2.deleteEntryData` is recommended.
 */
export declare function deleteEntryData(this: SkynetClient, privateKey: string, dataKey: string, customOptions?: CustomSetEntryDataOptions): Promise<void>;
/**
 * Gets the raw bytes corresponding to the publicKey and dataKey. The caller is responsible for setting any metadata in the bytes.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned bytes.
 * @throws - Will throw if the returned signature does not match the returned entry, or if the skylink in the entry is invalid.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `client.dbV2.getRawBytes` is recommended.
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
//# sourceMappingURL=skydb.d.ts.map