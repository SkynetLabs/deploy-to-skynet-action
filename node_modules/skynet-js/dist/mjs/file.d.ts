import { SkynetClient } from "./client";
import { EntryData } from "./mysky";
import { EncryptedJSONResponse } from "./mysky/encrypted_files";
import { CustomGetEntryOptions } from "./registry";
import { CustomGetJSONOptions, JSONResponse } from "./skydb_v2";
/**
 * Gets Discoverable JSON set with MySky at the given data path for the given
 * public user ID.
 *
 * @param this - SkynetClient
 * @param userID - The MySky public user ID.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 */
export declare function getJSON(this: SkynetClient, userID: string, path: string, customOptions?: CustomGetJSONOptions): Promise<JSONResponse>;
/**
 * Gets the entry link for the entry set with MySky at the given data path, for
 * the given public user ID. This is a v2 skylink. This link stays the same even
 * if the content at the entry changes.
 *
 * @param this - SkynetClient
 * @param userID - The MySky public user ID.
 * @param path - The data path.
 * @returns - The entry link.
 */
export declare function getEntryLink(this: SkynetClient, userID: string, path: string): Promise<string>;
/**
 * Gets the entry data for the entry set with MySky at the given data path, for
 * the given public user ID.
 *
 * @param this - SkynetClient
 * @param userID - The MySky public user ID.
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry data.
 */
export declare function getEntryData(this: SkynetClient, userID: string, path: string, customOptions?: CustomGetEntryOptions): Promise<EntryData>;
/**
 * Gets Encrypted JSON set with MySky for the given file path seed for the given
 * public user ID.
 *
 * @param this - SkynetClient
 * @param userID - The MySky public user ID.
 * @param pathSeed - The share-able secret file path seed.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the decrypted json data.
 */
export declare function getJSONEncrypted(this: SkynetClient, userID: string, pathSeed: string, customOptions?: CustomGetJSONOptions): Promise<EncryptedJSONResponse>;
//# sourceMappingURL=file.d.ts.map