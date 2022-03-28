import { Upload } from "@skynetlabs/tus-js-client";
import { getFileMimeType } from "./utils/file";
import { DEFAULT_BASE_OPTIONS } from "./utils/options";
import { formatSkylink } from "./skylink/format";
import { throwValidationError, validateObject, validateOptionalObject, validateString } from "./utils/validation";
import { buildRequestHeaders, buildRequestUrl } from "./request";
/**
 * The tus chunk size is (4MiB - encryptionOverhead) * dataPieces, set in skyd.
 */
const TUS_CHUNK_SIZE = (1 << 22) * 10;
/**
 * A number indicating how many parts should be uploaded in parallel, by
 * default.
 */
const TUS_PARALLEL_UPLOADS = 2;
/**
 * The retry delays, in ms. Data is stored in skyd for up to 20 minutes, so the
 * total delays should not exceed that length of time.
 */
const DEFAULT_TUS_RETRY_DELAYS = [0, 5000, 15000, 60000, 300000, 600000];
/**
 * The portal file field name.
 */
const PORTAL_FILE_FIELD_NAME = "file";
/**
 * The portal directory file field name.
 */
const PORTAL_DIRECTORY_FILE_FIELD_NAME = "files[]";
export const DEFAULT_UPLOAD_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointUpload: "/skynet/skyfile",
    endpointLargeUpload: "/skynet/tus",
    customFilename: "",
    errorPages: undefined,
    largeFileSize: TUS_CHUNK_SIZE,
    numParallelUploads: TUS_PARALLEL_UPLOADS,
    retryDelays: DEFAULT_TUS_RETRY_DELAYS,
    tryFiles: undefined,
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
export async function uploadFile(file, customOptions) {
    // Validation is done in `uploadSmallFileRequest` or `uploadLargeFileRequest`.
    const opts = { ...DEFAULT_UPLOAD_OPTIONS, ...this.customOptions, ...customOptions };
    if (file.size < opts.largeFileSize) {
        return this.uploadSmallFile(file, opts);
    }
    else {
        return this.uploadLargeFile(file, opts);
    }
}
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
export async function uploadSmallFile(file, customOptions) {
    const response = await this.uploadSmallFileRequest(file, customOptions);
    // Sanity check.
    validateUploadResponse(response);
    const skylink = formatSkylink(response.data.skylink);
    return { skylink };
}
/**
 * Makes a request to upload a small file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointPath="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact.
 * @returns - The upload response.
 */
export async function uploadSmallFileRequest(file, customOptions) {
    validateFile("file", file, "parameter");
    validateOptionalObject("customOptions", customOptions, "parameter", DEFAULT_UPLOAD_OPTIONS);
    const opts = { ...DEFAULT_UPLOAD_OPTIONS, ...this.customOptions, ...customOptions };
    const formData = new FormData();
    file = ensureFileObjectConsistency(file);
    if (opts.customFilename) {
        formData.append(PORTAL_FILE_FIELD_NAME, file, opts.customFilename);
    }
    else {
        formData.append(PORTAL_FILE_FIELD_NAME, file);
    }
    const response = await this.executeRequest({
        ...opts,
        endpointPath: opts.endpointUpload,
        method: "post",
        data: formData,
    });
    return response;
}
/* istanbul ignore next */
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
export async function uploadLargeFile(file, customOptions) {
    // Validation is done in `uploadLargeFileRequest`.
    const response = await this.uploadLargeFileRequest(file, customOptions);
    // Sanity check.
    validateLargeUploadResponse(response);
    // Get the skylink.
    let skylink = response.headers["skynet-skylink"];
    // Format the skylink.
    skylink = formatSkylink(skylink);
    return { skylink };
}
/* istanbul ignore next */
/**
 * Makes a request to upload a file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointLargeUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact.
 * @returns - The upload response.
 */
export async function uploadLargeFileRequest(file, customOptions) {
    var _a;
    validateFile("file", file, "parameter");
    validateOptionalObject("customOptions", customOptions, "parameter", DEFAULT_UPLOAD_OPTIONS);
    const opts = { ...DEFAULT_UPLOAD_OPTIONS, ...this.customOptions, ...customOptions };
    // TODO: Add back upload options once they are implemented in skyd.
    const url = await buildRequestUrl(this, { endpointPath: opts.endpointLargeUpload });
    const headers = buildRequestHeaders(undefined, opts.customUserAgent, opts.customCookie, opts.skynetApiKey);
    file = ensureFileObjectConsistency(file);
    let filename = file.name;
    if (opts.customFilename) {
        filename = opts.customFilename;
    }
    const onProgress = opts.onUploadProgress &&
        function (bytesSent, bytesTotal) {
            const progress = bytesSent / bytesTotal;
            // @ts-expect-error TS complains.
            opts.onUploadProgress(progress, { loaded: bytesSent, total: bytesTotal });
        };
    // Make an OPTIONS request to find out whether parallel uploads are supported.
    // TODO: Remove this once parallel uploads are fully supported and rolled-out.
    const resp = await this.executeRequest({
        ...opts,
        endpointPath: opts.endpointLargeUpload,
        method: "options",
    });
    // If concatenation is enabled, set the number of parallel uploads as well as
    // the part-split function. Note that each part has to be chunk-aligned, so we
    // may limit the number of parallel uploads.
    let parallelUploads = 1;
    let splitSizeIntoParts = undefined;
    if ((_a = resp.headers["tus-extension"]) === null || _a === void 0 ? void 0 : _a.includes("concatenation")) {
        // Use a user-provided value, if given.
        parallelUploads = opts.numParallelUploads;
        // Limit the number of parallel uploads if some parts would end up empty,
        // e.g. 50mib would be split into 1 chunk-aligned part, one unaligned part,
        // and one empty part.
        if (parallelUploads > Math.ceil(file.size / TUS_CHUNK_SIZE)) {
            parallelUploads = Math.ceil(file.size / TUS_CHUNK_SIZE);
        }
        // Set the part-split function.
        splitSizeIntoParts = splitSizeIntoChunkAlignedParts;
    }
    return new Promise((resolve, reject) => {
        const tusOpts = {
            endpoint: url,
            chunkSize: TUS_CHUNK_SIZE,
            retryDelays: opts.retryDelays,
            metadata: {
                filename,
                filetype: file.type,
            },
            parallelUploads,
            splitSizeIntoParts,
            headers,
            onProgress,
            onBeforeRequest: function (req) {
                const xhr = req.getUnderlyingObject();
                xhr.withCredentials = true;
            },
            onError: (error) => {
                // Return error body rather than entire error.
                const res = error.originalResponse;
                const newError = res ? new Error(res.getBody().trim()) || error : error;
                reject(newError);
            },
            onSuccess: async () => {
                if (!upload.url) {
                    reject(new Error("'upload.url' was not set"));
                    return;
                }
                // Call HEAD to get the metadata, including the skylink.
                try {
                    const resp = await this.executeRequest({
                        ...opts,
                        url: upload.url,
                        method: "head",
                        headers: { ...headers, "tus-resumable": "1.0.0" },
                    });
                    resolve(resp);
                }
                catch (err) {
                    reject(err);
                }
            },
        };
        const upload = new Upload(file, tusOpts);
        upload.start();
    });
}
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
export async function uploadDirectory(directory, filename, customOptions) {
    // Validation is done in `uploadDirectoryRequest`.
    const response = await this.uploadDirectoryRequest(directory, filename, customOptions);
    // Sanity check.
    validateUploadResponse(response);
    const skylink = formatSkylink(response.data.skylink);
    return { skylink };
}
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
export async function uploadDirectoryRequest(directory, filename, customOptions) {
    validateObject("directory", directory, "parameter");
    validateString("filename", filename, "parameter");
    validateOptionalObject("customOptions", customOptions, "parameter", DEFAULT_UPLOAD_OPTIONS);
    const opts = { ...DEFAULT_UPLOAD_OPTIONS, ...this.customOptions, ...customOptions };
    const formData = new FormData();
    Object.entries(directory).forEach(([path, file]) => {
        file = ensureFileObjectConsistency(file);
        formData.append(PORTAL_DIRECTORY_FILE_FIELD_NAME, file, path);
    });
    const query = { filename };
    if (opts.tryFiles) {
        query.tryfiles = JSON.stringify(opts.tryFiles);
    }
    if (opts.errorPages) {
        query.errorpages = JSON.stringify(opts.errorPages);
    }
    const response = await this.executeRequest({
        ...opts,
        endpointPath: opts.endpointUpload,
        method: "post",
        data: formData,
        query,
    });
    return response;
}
/**
 * Splits the size into the number of parts, aligning all but the last part on
 * chunk boundaries. Called if parallel uploads are used.
 *
 * @param totalSize - The total size of the upload.
 * @param partCount - The number of parts (equal to the value of `parallelUploads` used).
 * @returns - An array of parts with start and end boundaries.
 */
export function splitSizeIntoChunkAlignedParts(totalSize, partCount) {
    const partSizes = new Array(partCount).fill(0);
    // The leftover size that must go into the last part.
    const leftover = totalSize % TUS_CHUNK_SIZE;
    // Assign chunks to parts in order, looping back to the beginning if we get to
    // the end of the parts array.
    let lastPart = 0;
    for (let i = 0; i < Math.floor(totalSize / TUS_CHUNK_SIZE); i++) {
        partSizes[i % partCount] += TUS_CHUNK_SIZE;
        if (i > lastPart)
            lastPart = i;
    }
    // Assign the leftover to the part after the last part that was visited, or
    // the last part in the array if all parts were used.
    partSizes[Math.min(lastPart + 1, partCount - 1)] += leftover;
    // Convert sizes into parts.
    const parts = [];
    let lastBoundary = 0;
    for (let i = 0; i < partCount; i++) {
        parts.push({
            start: lastBoundary,
            end: lastBoundary + partSizes[i],
        });
        lastBoundary = parts[i].end;
    }
    return parts;
}
/**
 * Sometimes file object might have had the type property defined manually with
 * Object.defineProperty and some browsers (namely firefox) can have problems
 * reading it after the file has been appended to form data. To overcome this,
 * we recreate the file object using native File constructor with a type defined
 * as a constructor argument.
 *
 * @param file - The input file.
 * @returns - The processed file.
 */
function ensureFileObjectConsistency(file) {
    return new File([file], file.name, { type: getFileMimeType(file) });
}
/**
 * Validates the given value as a file.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid file.
 */
function validateFile(name, value, valueKind) {
    if (!(value instanceof File)) {
        throwValidationError(name, value, valueKind, "type 'File'");
    }
}
/**
 * Validates the upload response.
 *
 * @param response - The upload response.
 * @throws - Will throw if not a valid upload response.
 */
function validateUploadResponse(response) {
    try {
        if (!response.data) {
            throw new Error("response.data field missing");
        }
        validateString("skylink", response.data.skylink, "upload response field");
    }
    catch (err) {
        throw new Error(`Did not get a complete upload response despite a successful request. Please try again and report this issue to the devs if it persists. ${err}`);
    }
}
/* istanbul ignore next */
/**
 * Validates the large upload response.
 *
 * @param response - The upload response.
 * @throws - Will throw if not a valid upload response.
 */
function validateLargeUploadResponse(response) {
    try {
        if (!response.headers) {
            throw new Error("response.headers field missing");
        }
        validateString('response.headers["skynet-skylink"]', response.headers["skynet-skylink"], "upload response field");
    }
    catch (err) {
        throw new Error(`Did not get a complete upload response despite a successful request. Please try again and report this issue to the devs if it persists. Error: ${err}`);
    }
}
