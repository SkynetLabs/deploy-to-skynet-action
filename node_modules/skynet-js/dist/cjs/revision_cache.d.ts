import { Mutex } from "async-mutex";
/**
 * An abstraction over the client's revision number cache. Provides a cache,
 * keyed by public key and data key and protected by a mutex to guard against
 * concurrent access to the cache. Each cache entry also has its own mutex, to
 * protect against concurrent access to that entry.
 */
export declare class RevisionNumberCache {
    private mutex;
    private cache;
    /**
     * Creates the `RevisionNumberCache`.
     */
    constructor();
    /**
     * Gets the revision cache key for the given public key and data key.
     *
     * @param publicKey - The given public key.
     * @param dataKey - The given data key.
     * @returns - The revision cache key.
     */
    static getCacheKey(publicKey: string, dataKey: string): string;
    /**
     * Gets an object containing the cached revision and the mutex for the entry.
     * The revision and mutex will be initialized if the entry is not yet cached.
     *
     * @param publicKey - The given public key.
     * @param dataKey - The given data key.
     * @returns - The cached revision entry object.
     */
    getRevisionAndMutexForEntry(publicKey: string, dataKey: string): Promise<CachedRevisionNumber>;
    /**
     * Calls `exclusiveFn` with exclusive access to the given cached entry. The
     * revision number of the entry can be safely updated in `exclusiveFn`.
     *
     * @param publicKey - The given public key.
     * @param dataKey - The given data key.
     * @param exclusiveFn - A function to call with exclusive access to the given cached entry.
     * @returns - A promise containing the result of calling `exclusiveFn`.
     */
    withCachedEntryLock<T>(publicKey: string, dataKey: string, exclusiveFn: (cachedRevisionEntry: CachedRevisionNumber) => Promise<T>): Promise<T>;
}
/**
 * An object containing a cached revision and a corresponding mutex. The
 * revision can be internally updated and it will reflect in the client's cache.
 */
export declare class CachedRevisionNumber {
    mutex: Mutex;
    revision: bigint;
    /**
     * Creates a `CachedRevisionNumber`.
     */
    constructor();
}
//# sourceMappingURL=revision_cache.d.ts.map