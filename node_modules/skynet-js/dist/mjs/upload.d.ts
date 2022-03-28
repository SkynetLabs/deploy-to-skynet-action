import { AxiosResponse } from "axios";
import { BaseCustomOptions } from "./utils/options";
import { SkynetClient } from "./client";
import { JsonData } from "./utils/types";
/**
 * Custom upload options.
 *
 * @property [endpointUpload] - The relative URL path of the portal endpoint to contact.
 * @property [endpointLargeUpload] - The relative URL path of the portal endpoint to contact for large uploads.
 * @property [customFilename] - The custom filename to use when uploading files.
 * @property [largeFileSize=41943040] - The size at which files are considered "large" and will be uploaded using the tus resumable upload protocol. This is the size of one chunk by default (40 mib).
 * @property [errorPages] - Defines a mapping of error codes and subfiles which are to be served in case we are serving the respective error code. All subfiles referred like this must be defined with absolute paths and must exist.
 * @property [numParallelUploads=2] - Used to override the default number of parallel uploads. Disable parallel uploads by setting to 1. Note that each parallel upload must be chunk-aligned so the number of parallel uploads may be limited if some parts would end up empty.
 * @property [retryDelays=[0, 5_000, 15_000, 60_000, 300_000, 600_000]] - An array or undefined, indicating how many milliseconds should pass before the next attempt to uploading will be started after the transfer has been interrupted. The array's length indicates the maximum number of attempts.
 * @property [tryFiles] - Allows us to set a list of potential subfiles to return in case the requested one does not exist or is a directory. Those subfiles might be listed with relative or absolute paths. If the path is absolute the file must exist.
 */
export declare type CustomUploadOptions = BaseCustomOptions & {
    endpointUpload?: string;
    endpointLargeUpload?: string;
    customFilename?: string;
    errorPages?: JsonData;
    largeFileSize?: number;
    numParallelUploads?: number;
    retryDelays?: number[];
    tryFiles?: string[];
};
/**
 * The response to an upload request.
 *
 * @property skylink - 46-character skylink.
 */
export declare type UploadRequestResponse = {
    skylink: string;
};
export declare const DEFAULT_UPLOAD_OPTIONS: {
    endpointUpload: string;
    endpointLargeUpload: string;
    customFilename: string;
    errorPages: undefined;
    largeFileSize: number;
    numParallelUploads: number;
    retryDelays: number[];
    tryFiles: undefined;
    APIKey: string;
    skynetApiKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    loginFn: undefined;
};
/**
 * Uploads a file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointUpload="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact for small uploads.
 * @param [customOptions.endpointLargeUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact for large uploads.
 * @returns - The returned skylink.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
export declare function uploadFile(this: SkynetClient, file: File, customOptions?: CustomUploadOptions): Promise<UploadRequestResponse>;
/**
 * Uploads a small file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact.
 * @returns - The returned skylink.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
export declare function uploadSmallFile(this: SkynetClient, file: File, customOptions: CustomUploadOptions): Promise<UploadRequestResponse>;
/**
 * Makes a request to upload a small file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointPath="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact.
 * @returns - The upload response.
 */
export declare function uploadSmallFileRequest(this: SkynetClient, file: File, customOptions?: CustomUploadOptions): Promise<AxiosResponse>;
/**
 * Uploads a large file to Skynet using tus.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointLargeUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact.
 * @returns - The returned skylink.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
export declare function uploadLargeFile(this: SkynetClient, file: File, customOptions?: CustomUploadOptions): Promise<UploadRequestResponse>;
/**
 * Makes a request to upload a file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointLargeUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact.
 * @returns - The upload response.
 */
export declare function uploadLargeFileRequest(this: SkynetClient, file: File, customOptions?: CustomUploadOptions): Promise<AxiosResponse>;
/**
 * Uploads a directory to Skynet.
 *
 * @param this - SkynetClient
 * @param directory - File objects to upload, indexed by their path strings.
 * @param filename - The name of the directory.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointPath="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact.
 * @returns - The returned skylink.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
export declare function uploadDirectory(this: SkynetClient, directory: Record<string, File>, filename: string, customOptions?: CustomUploadOptions): Promise<UploadRequestResponse>;
/**
 * Makes a request to upload a directory to Skynet.
 *
 * @param this - SkynetClient
 * @param directory - File objects to upload, indexed by their path strings.
 * @param filename - The name of the directory.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointPath="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact.
 * @returns - The upload response.
 * @throws - Will throw if the input filename is not a string.
 */
export declare function uploadDirectoryRequest(this: SkynetClient, directory: Record<string, File>, filename: string, customOptions?: CustomUploadOptions): Promise<AxiosResponse>;
/**
 * Splits the size into the number of parts, aligning all but the last part on
 * chunk boundaries. Called if parallel uploads are used.
 *
 * @param totalSize - The total size of the upload.
 * @param partCount - The number of parts (equal to the value of `parallelUploads` used).
 * @returns - An array of parts with start and end boundaries.
 */
export declare function splitSizeIntoChunkAlignedParts(totalSize: number, partCount: number): Array<{
    start: number;
    end: number;
}>;
//# sourceMappingURL=upload.d.ts.map