/**
 * Parse skylink options.
 *
 * @property [fromSubdomain] - Whether to parse the skylink as a base32 subdomain in a URL.
 * @property [includePath] - Whether to include the path after the skylink, e.g. /<skylink>/foo/bar.
 * @property [onlyPath] - Whether to parse out just the path, e.g. /foo/bar. Will still return null if the string does not contain a skylink.
 */
export declare type ParseSkylinkOptions = {
    fromSubdomain?: boolean;
    includePath?: boolean;
    onlyPath?: boolean;
};
/**
 * Parses the given string for a base64 skylink, or base32 if opts.fromSubdomain is given. If the given string is prefixed with sia:, sia://, or a portal URL, those will be removed and the raw skylink returned.
 *
 * @param skylinkUrl - Plain skylink, skylink with URI prefix, or URL with skylink as the first path element.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The base64 (or base32) skylink, optionally with the path included.
 * @throws - Will throw on invalid combination of options.
 */
export declare function parseSkylink(skylinkUrl: string, customOptions?: ParseSkylinkOptions): string | null;
/**
 * Helper function that parses the given string for a base32 skylink.
 *
 * @param skylinkUrl - Base32 skylink.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The base32 skylink.
 */
export declare function parseSkylinkBase32(skylinkUrl: string, customOptions?: ParseSkylinkOptions): string | null;
//# sourceMappingURL=parse.d.ts.map