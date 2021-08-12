import { parseSkylink } from "../skylink/parse";
import { isHexString } from "./string";
/**
 * Validates the given value as a bigint.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid bigint.
 */
export function validateBigint(name, value, valueKind) {
    if (typeof value !== "bigint") {
        throwValidationError(name, value, valueKind, "type 'bigint'");
    }
}
/**
 * Validates the given value as a boolean.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid boolean.
 */
export function validateBoolean(name, value, valueKind) {
    if (typeof value !== "boolean") {
        throwValidationError(name, value, valueKind, "type 'boolean'");
    }
}
/**
 * Validates the given value as an object.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid object.
 */
export function validateObject(name, value, valueKind) {
    if (typeof value !== "object") {
        throwValidationError(name, value, valueKind, "type 'object'");
    }
    if (value === null) {
        throwValidationError(name, value, valueKind, "non-null");
    }
}
/**
 * Validates the given value as an optional object.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @param model - A model object that contains all possible fields. 'value' does not need to have all fields, but it may not have any fields not contained in 'model'.
 * @throws - Will throw if not a valid optional object.
 */
export function validateOptionalObject(name, value, valueKind, model) {
    if (!value) {
        // This is okay, the object is optional.
        return;
    }
    validateObject(name, value, valueKind);
    // Check if all given properties of value also exist in the model.
    for (const property in value) {
        if (!(property in model)) {
            throw new Error(`Object ${valueKind} '${name}' contains unexpected property '${property}'`);
        }
    }
}
/**
 * Validates the given value as a number.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid number.
 */
export function validateNumber(name, value, valueKind) {
    if (typeof value !== "number") {
        throwValidationError(name, value, valueKind, "type 'number'");
    }
}
/**
 * Validates the given value as a skylink string.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @returns - The validated and parsed skylink.
 * @throws - Will throw if not a valid skylink string.
 */
export function validateSkylinkString(name, value, valueKind) {
    validateString(name, value, valueKind);
    const parsedSkylink = parseSkylink(value);
    if (parsedSkylink === null) {
        throw throwValidationError(name, value, valueKind, `valid skylink of type 'string'`);
    }
    return parsedSkylink;
}
/**
 * Validates the given value as a string.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid string.
 */
export function validateString(name, value, valueKind) {
    if (typeof value !== "string") {
        throwValidationError(name, value, valueKind, "type 'string'");
    }
}
/**
 * Validates the given value as a string of the given length.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @param len - The length to check.
 * @throws - Will throw if not a valid string of the given length.
 */
export function validateStringLen(name, value, valueKind, len) {
    validateString(name, value, valueKind);
    const actualLen = value.length;
    if (actualLen !== len) {
        throwValidationError(name, value, valueKind, `type 'string' of length ${len}, was length ${actualLen}`);
    }
}
/**
 * Validates the given value as a hex-encoded string.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid hex-encoded string.
 */
export function validateHexString(name, value, valueKind) {
    validateString(name, value, valueKind);
    if (!isHexString(value)) {
        throwValidationError(name, value, valueKind, "a hex-encoded string");
    }
}
/**
 * Validates the given value as a uint8array.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid uint8array.
 */
export function validateUint8Array(name, value, valueKind) {
    if (!(value instanceof Uint8Array)) {
        throwValidationError(name, value, valueKind, "type 'Uint8Array'");
    }
}
/**
 * Validates the given value as a uint8array of the given length.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @param len - The length to check.
 * @throws - Will throw if not a valid uint8array of the given length.
 */
export function validateUint8ArrayLen(name, value, valueKind, len) {
    validateUint8Array(name, value, valueKind);
    const actualLen = value.length;
    if (actualLen !== len) {
        throwValidationError(name, value, valueKind, `type 'Uint8Array' of length ${len}, was length ${actualLen}`);
    }
}
/**
 * Throws an error for the given value
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @param expected - The expected aspect of the value that could not be validated (e.g. "type 'string'" or "non-null").
 * @throws - Will always throw.
 */
export function throwValidationError(name, value, valueKind, expected) {
    let actualValue;
    if (value === undefined) {
        actualValue = "type 'undefined'";
    }
    else if (value === null) {
        actualValue = "type 'null'";
    }
    else {
        actualValue = `type '${typeof value}', value '${value}'`;
    }
    throw new Error(`Expected ${valueKind} '${name}' to be ${expected}, was ${actualValue}`);
}
