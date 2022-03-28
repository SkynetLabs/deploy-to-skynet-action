import { EntryData, MySky } from ".";
import { EncryptedJSONResponse } from "./encrypted_files";
import { CustomGetEntryOptions } from "../registry";
import { CustomGetJSONOptions, CustomSetEntryDataOptions, CustomSetJSONOptions, JSONResponse } from "../skydb_v2";
import { JsonData } from "../utils/types";
/**
 * Gets Discoverable JSON at the given path through MySky, if the user has
 * given Discoverable Read permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 * @throws - Will throw if the user does not have Discoverable Read permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.getJSON` is recommended.
 */
export declare function getJSON(this: MySky, path: string, customOptions?: CustomGetJSONOptions): Promise<JSONResponse>;
/**
 * Gets the entry link for the entry at the given path. This is a v2 skylink.
 * This link stays the same even if the content at the entry changes.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @returns - The entry link.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.getEntryLink` is recommended.
 */
export declare function getEntryLink(this: MySky, path: string): Promise<string>;
/**
 * Sets Discoverable JSON at the given path through MySky, if the user has
 * given Discoverable Write permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param json - The json to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.setJSON` is recommended.
 */
export declare function setJSON(this: MySky, path: string, json: JsonData, customOptions?: CustomSetJSONOptions): Promise<JSONResponse>;
/**
 * Deletes Discoverable JSON at the given path through MySky, if the user has
 * given Discoverable Write permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @throws - Will throw if the revision is already the maximum value.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.deleteJSON` is recommended.
 */
export declare function deleteJSON(this: MySky, path: string, customOptions?: CustomSetEntryDataOptions): Promise<void>;
/**
 * Sets entry at the given path to point to the data link. Like setJSON, but it doesn't upload a file.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param dataLink - The data link to set at the path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.setDataLink` is recommended.
 */
export declare function setDataLink(this: MySky, path: string, dataLink: string, customOptions?: CustomSetEntryDataOptions): Promise<void>;
/**
 * Gets the raw registry entry data for the given path, if the user has given
 * Discoverable Read permissions.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 * @throws - Will throw if the user does not have Discoverable Read permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.getEntryData` is recommended.
 */
export declare function getEntryData(this: MySky, path: string, customOptions?: CustomGetEntryOptions): Promise<EntryData>;
/**
 * Sets the raw registry entry data at the given path, if the user has given Discoverable
 * Write permissions.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param data - The raw entry data to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 * @throws - Will throw if the length of the data is > 70 bytes.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.setEntryData` is recommended.
 */
export declare function setEntryData(this: MySky, path: string, data: Uint8Array, customOptions?: CustomSetEntryDataOptions): Promise<EntryData>;
/**
 * Deletes the entry data at the given path, if the user has given Discoverable
 * Write permissions.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @throws - Will throw if the user does not have Discoverable Write permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.deleteEntryData` is recommended.
 */
export declare function deleteEntryData(this: MySky, path: string, customOptions?: CustomSetEntryDataOptions): Promise<void>;
/**
 * Gets Encrypted JSON at the given path through MySky, if the user has given
 * Hidden Read permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the decrypted json data.
 * @throws - Will throw if the user does not have Hidden Read permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.getJSONEncrypted` is recommended.
 */
export declare function getJSONEncrypted(this: MySky, path: string, customOptions?: CustomGetJSONOptions): Promise<EncryptedJSONResponse>;
/**
 * Sets Encrypted JSON at the given path through MySky, if the user has given
 * Hidden Write permissions to do so.
 *
 * @param this - MySky instance.
 * @param path - The data path.
 * @param json - The json to encrypt and set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the original json data.
 * @throws - Will throw if the user does not have Hidden Write permission on the path.
 * @deprecated - Use of this method may result in data race bugs. Reworking your application to use `mySky.dbV2.setJSONEncrypted` is recommended.
 */
export declare function setJSONEncrypted(this: MySky, path: string, json: JsonData, customOptions?: CustomSetJSONOptions): Promise<EncryptedJSONResponse>;
//# sourceMappingURL=skydb.d.ts.map