import { CustomClientOptions } from "../client";
/**
 * Base custom options for methods hitting the API.
 */
export declare type BaseCustomOptions = CustomClientOptions;
/**
 * The default base custom options.
 */
export declare const DEFAULT_BASE_OPTIONS: {
    APIKey: string;
    skynetApiKey: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    loginFn: undefined;
};
/**
 * Extract only the model's custom options from the given options.
 *
 * @param opts - The given options.
 * @param model - The model options.
 * @returns - The extracted custom options.
 * @throws - If the given opts don't contain all properties of the model.
 */
export declare function extractOptions<T extends Record<string, unknown>>(opts: Record<string, unknown>, model: T): T;
//# sourceMappingURL=options.d.ts.map