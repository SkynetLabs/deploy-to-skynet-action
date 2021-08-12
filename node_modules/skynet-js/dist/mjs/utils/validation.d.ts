/**
 * Validates the given value as a bigint.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid bigint.
 */
export declare function validateBigint(name: string, value: unknown, valueKind: string): void;
/**
 * Validates the given value as a boolean.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid boolean.
 */
export declare function validateBoolean(name: string, value: unknown, valueKind: string): void;
/**
 * Validates the given value as an object.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid object.
 */
export declare function validateObject(name: string, value: unknown, valueKind: string): void;
/**
 * Validates the given value as an optional object.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @param model - A model object that contains all possible fields. 'value' does not need to have all fields, but it may not have any fields not contained in 'model'.
 * @throws - Will throw if not a valid optional object.
 */
export declare function validateOptionalObject(name: string, value: unknown, valueKind: string, model: Record<string, unknown>): void;
/**
 * Validates the given value as a number.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid number.
 */
export declare function validateNumber(name: string, value: unknown, valueKind: string): void;
/**
 * Validates the given value as a skylink string.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @returns - The validated and parsed skylink.
 * @throws - Will throw if not a valid skylink string.
 */
export declare function validateSkylinkString(name: string, value: unknown, valueKind: string): string;
/**
 * Validates the given value as a string.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid string.
 */
export declare function validateString(name: string, value: unknown, valueKind: string): void;
/**
 * Validates the given value as a string of the given length.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @param len - The length to check.
 * @throws - Will throw if not a valid string of the given length.
 */
export declare function validateStringLen(name: string, value: unknown, valueKind: string, len: number): void;
/**
 * Validates the given value as a hex-encoded string.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid hex-encoded string.
 */
export declare function validateHexString(name: string, value: unknown, valueKind: string): void;
/**
 * Validates the given value as a uint8array.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid uint8array.
 */
export declare function validateUint8Array(name: string, value: unknown, valueKind: string): void;
/**
 * Validates the given value as a uint8array of the given length.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @param len - The length to check.
 * @throws - Will throw if not a valid uint8array of the given length.
 */
export declare function validateUint8ArrayLen(name: string, value: unknown, valueKind: string, len: number): void;
/**
 * Throws an error for the given value
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @param expected - The expected aspect of the value that could not be validated (e.g. "type 'string'" or "non-null").
 * @throws - Will always throw.
 */
export declare function throwValidationError(name: string, value: unknown, valueKind: string, expected: string): void;
//# sourceMappingURL=validation.d.ts.map