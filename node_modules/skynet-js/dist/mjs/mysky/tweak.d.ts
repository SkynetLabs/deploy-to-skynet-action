/**
 * Derives the discoverable file tweak for the given path.
 *
 * @param path - The given path.
 * @returns - The hex-encoded tweak.
 */
export declare function deriveDiscoverableFileTweak(path: string): string;
/**
 * The tweak for the discoverable bucket for the given path.
 */
export declare class DiscoverableBucketTweak {
    version: number;
    path: Array<Uint8Array>;
    /**
     * Creates a new `DiscoverableBucketTweak`.
     *
     * @param path - The MySky data path.
     */
    constructor(path: string);
    /**
     * Encodes the tweak into a byte array.
     *
     * @returns - The encoded byte array.
     */
    encode(): Uint8Array;
    /**
     * Gets the hash of the tweak.
     *
     * @returns - The hash.
     */
    getHash(): Uint8Array;
}
/**
 * Splits the path by forward slashes.
 *
 * @param path - The path to split.
 * @returns - An array of path components.
 */
export declare function splitPath(path: string): Array<string>;
/**
 * Hashes the path component.
 *
 * @param component - The component extracted from the path.
 * @returns - The hash.
 */
export declare function hashPathComponent(component: string): Uint8Array;
//# sourceMappingURL=tweak.d.ts.map