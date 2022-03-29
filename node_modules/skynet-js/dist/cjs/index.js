"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSkynetPortalUrl = exports.URI_SKYNET_PREFIX = exports.URI_HANDSHAKE_PREFIX = exports.getFullDomainUrlForPortal = exports.extractDomainForPortal = exports.DEFAULT_SKYNET_PORTAL_URL = exports.defaultPortalUrl = exports.uint8ArrayToStringUtf8 = exports.stringToUint8ArrayUtf8 = exports.MAX_REVISION = exports.getRootDirectory = exports.getRelativeFilePath = exports.isSkylinkV2 = exports.isSkylinkV1 = exports.parseSkylink = exports.convertSkylinkToBase64 = exports.convertSkylinkToBase32 = exports.getOrCreateSkyDBRegistryEntry = exports.DELETION_ENTRY_DATA = exports.ExecuteRequestError = exports.validateRegistryProof = exports.signEntry = exports.getEntryUrlForPortal = exports.getEntryLink = exports.deriveDiscoverableFileTweak = exports.deriveEncryptedFileSeed = exports.ENCRYPTION_PATH_SEED_FILE_LENGTH = exports.ENCRYPTION_PATH_SEED_DIRECTORY_LENGTH = exports.ENCRYPTED_JSON_RESPONSE_VERSION = exports.encryptJSONFile = exports.deriveEncryptedPathSeed = exports.deriveEncryptedFileTweak = exports.deriveEncryptedFileKeyEntropy = exports.decryptJSONFile = exports.mySkyDomain = exports.mySkyDevDomain = exports.MYSKY_DEV_DOMAIN = exports.MYSKY_DOMAIN = exports.MySky = exports.MAX_ENTRY_LENGTH = exports.DacLibrary = exports.getSkylinkUrlForPortal = exports.SIGNATURE_LENGTH = exports.PRIVATE_KEY_LENGTH = exports.PUBLIC_KEY_LENGTH = exports.genKeyPairFromSeed = exports.genKeyPairAndSeed = exports.deriveChildSeed = exports.HASH_LENGTH = exports.SkynetClient = void 0;
exports.PermLegacySkyID = exports.PermDiscoverable = exports.PermHidden = exports.PermWrite = exports.PermRead = exports.PermType = exports.PermCategory = exports.Permission = exports.uriSkynetPrefix = exports.uriHandshakePrefix = void 0;
// Main exports.
var client_1 = require("./client");
Object.defineProperty(exports, "SkynetClient", { enumerable: true, get: function () { return client_1.SkynetClient; } });
var crypto_1 = require("./crypto");
Object.defineProperty(exports, "HASH_LENGTH", { enumerable: true, get: function () { return crypto_1.HASH_LENGTH; } });
Object.defineProperty(exports, "deriveChildSeed", { enumerable: true, get: function () { return crypto_1.deriveChildSeed; } });
Object.defineProperty(exports, "genKeyPairAndSeed", { enumerable: true, get: function () { return crypto_1.genKeyPairAndSeed; } });
Object.defineProperty(exports, "genKeyPairFromSeed", { enumerable: true, get: function () { return crypto_1.genKeyPairFromSeed; } });
Object.defineProperty(exports, "PUBLIC_KEY_LENGTH", { enumerable: true, get: function () { return crypto_1.PUBLIC_KEY_LENGTH; } });
Object.defineProperty(exports, "PRIVATE_KEY_LENGTH", { enumerable: true, get: function () { return crypto_1.PRIVATE_KEY_LENGTH; } });
Object.defineProperty(exports, "SIGNATURE_LENGTH", { enumerable: true, get: function () { return crypto_1.SIGNATURE_LENGTH; } });
var download_1 = require("./download");
Object.defineProperty(exports, "getSkylinkUrlForPortal", { enumerable: true, get: function () { return download_1.getSkylinkUrlForPortal; } });
var mysky_1 = require("./mysky");
Object.defineProperty(exports, "DacLibrary", { enumerable: true, get: function () { return mysky_1.DacLibrary; } });
Object.defineProperty(exports, "MAX_ENTRY_LENGTH", { enumerable: true, get: function () { return mysky_1.MAX_ENTRY_LENGTH; } });
Object.defineProperty(exports, "MySky", { enumerable: true, get: function () { return mysky_1.MySky; } });
Object.defineProperty(exports, "MYSKY_DOMAIN", { enumerable: true, get: function () { return mysky_1.MYSKY_DOMAIN; } });
Object.defineProperty(exports, "MYSKY_DEV_DOMAIN", { enumerable: true, get: function () { return mysky_1.MYSKY_DEV_DOMAIN; } });
// Deprecated.
Object.defineProperty(exports, "mySkyDevDomain", { enumerable: true, get: function () { return mysky_1.mySkyDevDomain; } });
Object.defineProperty(exports, "mySkyDomain", { enumerable: true, get: function () { return mysky_1.mySkyDomain; } });
var encrypted_files_1 = require("./mysky/encrypted_files");
Object.defineProperty(exports, "decryptJSONFile", { enumerable: true, get: function () { return encrypted_files_1.decryptJSONFile; } });
Object.defineProperty(exports, "deriveEncryptedFileKeyEntropy", { enumerable: true, get: function () { return encrypted_files_1.deriveEncryptedFileKeyEntropy; } });
Object.defineProperty(exports, "deriveEncryptedFileTweak", { enumerable: true, get: function () { return encrypted_files_1.deriveEncryptedFileTweak; } });
Object.defineProperty(exports, "deriveEncryptedPathSeed", { enumerable: true, get: function () { return encrypted_files_1.deriveEncryptedPathSeed; } });
Object.defineProperty(exports, "encryptJSONFile", { enumerable: true, get: function () { return encrypted_files_1.encryptJSONFile; } });
Object.defineProperty(exports, "ENCRYPTED_JSON_RESPONSE_VERSION", { enumerable: true, get: function () { return encrypted_files_1.ENCRYPTED_JSON_RESPONSE_VERSION; } });
Object.defineProperty(exports, "ENCRYPTION_PATH_SEED_DIRECTORY_LENGTH", { enumerable: true, get: function () { return encrypted_files_1.ENCRYPTION_PATH_SEED_DIRECTORY_LENGTH; } });
Object.defineProperty(exports, "ENCRYPTION_PATH_SEED_FILE_LENGTH", { enumerable: true, get: function () { return encrypted_files_1.ENCRYPTION_PATH_SEED_FILE_LENGTH; } });
// Deprecated.
Object.defineProperty(exports, "deriveEncryptedFileSeed", { enumerable: true, get: function () { return encrypted_files_1.deriveEncryptedFileSeed; } });
var tweak_1 = require("./mysky/tweak");
Object.defineProperty(exports, "deriveDiscoverableFileTweak", { enumerable: true, get: function () { return tweak_1.deriveDiscoverableFileTweak; } });
var registry_1 = require("./registry");
Object.defineProperty(exports, "getEntryLink", { enumerable: true, get: function () { return registry_1.getEntryLink; } });
Object.defineProperty(exports, "getEntryUrlForPortal", { enumerable: true, get: function () { return registry_1.getEntryUrlForPortal; } });
Object.defineProperty(exports, "signEntry", { enumerable: true, get: function () { return registry_1.signEntry; } });
Object.defineProperty(exports, "validateRegistryProof", { enumerable: true, get: function () { return registry_1.validateRegistryProof; } });
// Have to export `ExecuteRequestError` as a value instead of as a type or the
// consumer cannot use `instanceof`.
var request_1 = require("./request");
Object.defineProperty(exports, "ExecuteRequestError", { enumerable: true, get: function () { return request_1.ExecuteRequestError; } });
var skydb_v2_1 = require("./skydb_v2");
Object.defineProperty(exports, "DELETION_ENTRY_DATA", { enumerable: true, get: function () { return skydb_v2_1.DELETION_ENTRY_DATA; } });
Object.defineProperty(exports, "getOrCreateSkyDBRegistryEntry", { enumerable: true, get: function () { return skydb_v2_1.getOrCreateSkyDBRegistryEntry; } });
var format_1 = require("./skylink/format");
Object.defineProperty(exports, "convertSkylinkToBase32", { enumerable: true, get: function () { return format_1.convertSkylinkToBase32; } });
Object.defineProperty(exports, "convertSkylinkToBase64", { enumerable: true, get: function () { return format_1.convertSkylinkToBase64; } });
var parse_1 = require("./skylink/parse");
Object.defineProperty(exports, "parseSkylink", { enumerable: true, get: function () { return parse_1.parseSkylink; } });
var sia_1 = require("./skylink/sia");
Object.defineProperty(exports, "isSkylinkV1", { enumerable: true, get: function () { return sia_1.isSkylinkV1; } });
Object.defineProperty(exports, "isSkylinkV2", { enumerable: true, get: function () { return sia_1.isSkylinkV2; } });
var file_1 = require("./utils/file");
Object.defineProperty(exports, "getRelativeFilePath", { enumerable: true, get: function () { return file_1.getRelativeFilePath; } });
Object.defineProperty(exports, "getRootDirectory", { enumerable: true, get: function () { return file_1.getRootDirectory; } });
var number_1 = require("./utils/number");
Object.defineProperty(exports, "MAX_REVISION", { enumerable: true, get: function () { return number_1.MAX_REVISION; } });
var string_1 = require("./utils/string");
Object.defineProperty(exports, "stringToUint8ArrayUtf8", { enumerable: true, get: function () { return string_1.stringToUint8ArrayUtf8; } });
Object.defineProperty(exports, "uint8ArrayToStringUtf8", { enumerable: true, get: function () { return string_1.uint8ArrayToStringUtf8; } });
var url_1 = require("./utils/url");
Object.defineProperty(exports, "defaultPortalUrl", { enumerable: true, get: function () { return url_1.defaultPortalUrl; } });
Object.defineProperty(exports, "DEFAULT_SKYNET_PORTAL_URL", { enumerable: true, get: function () { return url_1.DEFAULT_SKYNET_PORTAL_URL; } });
Object.defineProperty(exports, "extractDomainForPortal", { enumerable: true, get: function () { return url_1.extractDomainForPortal; } });
Object.defineProperty(exports, "getFullDomainUrlForPortal", { enumerable: true, get: function () { return url_1.getFullDomainUrlForPortal; } });
Object.defineProperty(exports, "URI_HANDSHAKE_PREFIX", { enumerable: true, get: function () { return url_1.URI_HANDSHAKE_PREFIX; } });
Object.defineProperty(exports, "URI_SKYNET_PREFIX", { enumerable: true, get: function () { return url_1.URI_SKYNET_PREFIX; } });
// Deprecated.
Object.defineProperty(exports, "defaultSkynetPortalUrl", { enumerable: true, get: function () { return url_1.defaultSkynetPortalUrl; } });
Object.defineProperty(exports, "uriHandshakePrefix", { enumerable: true, get: function () { return url_1.uriHandshakePrefix; } });
Object.defineProperty(exports, "uriSkynetPrefix", { enumerable: true, get: function () { return url_1.uriSkynetPrefix; } });
// Re-export Permission API.
var skynet_mysky_utils_1 = require("skynet-mysky-utils");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return skynet_mysky_utils_1.Permission; } });
Object.defineProperty(exports, "PermCategory", { enumerable: true, get: function () { return skynet_mysky_utils_1.PermCategory; } });
Object.defineProperty(exports, "PermType", { enumerable: true, get: function () { return skynet_mysky_utils_1.PermType; } });
Object.defineProperty(exports, "PermRead", { enumerable: true, get: function () { return skynet_mysky_utils_1.PermRead; } });
Object.defineProperty(exports, "PermWrite", { enumerable: true, get: function () { return skynet_mysky_utils_1.PermWrite; } });
Object.defineProperty(exports, "PermHidden", { enumerable: true, get: function () { return skynet_mysky_utils_1.PermHidden; } });
Object.defineProperty(exports, "PermDiscoverable", { enumerable: true, get: function () { return skynet_mysky_utils_1.PermDiscoverable; } });
Object.defineProperty(exports, "PermLegacySkyID", { enumerable: true, get: function () { return skynet_mysky_utils_1.PermLegacySkyID; } });
