"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDomainForPortal = exports.getFullDomainUrlForPortal = exports.makeUrl = exports.ensureUrlPrefix = exports.addUrlQuery = exports.addUrlSubdomain = exports.addPath = exports.defaultPortalUrl = exports.uriSkynetPrefix = exports.URI_SKYNET_PREFIX = exports.uriHandshakePrefix = exports.URI_HANDSHAKE_PREFIX = exports.defaultSkynetPortalUrl = exports.DEFAULT_SKYNET_PORTAL_URL = void 0;
const skynet_mysky_utils_1 = require("skynet-mysky-utils");
const url_join_1 = __importDefault(require("url-join"));
const url_parse_1 = __importDefault(require("url-parse"));
const string_1 = require("./string");
const validation_1 = require("./validation");
exports.DEFAULT_SKYNET_PORTAL_URL = "https://siasky.net";
/**
 * @deprecated please use DEFAULT_SKYNET_PORTAL_URL.
 */
exports.defaultSkynetPortalUrl = exports.DEFAULT_SKYNET_PORTAL_URL;
exports.URI_HANDSHAKE_PREFIX = "hns://";
/**
 * @deprecated please use URI_HANDSHAKE_PREFIX.
 */
exports.uriHandshakePrefix = exports.URI_HANDSHAKE_PREFIX;
exports.URI_SKYNET_PREFIX = "sia://";
/**
 * @deprecated please use URI_SKYNET_PREFIX.
 */
exports.uriSkynetPrefix = exports.URI_SKYNET_PREFIX;
// TODO: This will be smarter. See
// https://github.com/SkynetLabs/skynet-docs/issues/5.
/**
 * Returns the default portal URL.
 *
 * @returns - The portal URL.
 */
function defaultPortalUrl() {
    /* istanbul ignore next */
    if (typeof window === "undefined")
        return "/"; // default to path root on ssr
    return window.location.origin;
}
exports.defaultPortalUrl = defaultPortalUrl;
/**
 * Adds a path to the given URL.
 *
 * @param url - The URL.
 * @param path - The given path.
 * @returns - The final URL.
 */
function addPath(url, path) {
    (0, validation_1.validateString)("url", url, "parameter");
    (0, validation_1.validateString)("path", path, "parameter");
    path = (0, string_1.trimForwardSlash)(path);
    let str;
    if (url === "localhost") {
        // Special handling for localhost.
        str = `localhost/${path}`;
    }
    else {
        // Construct a URL object and set the pathname property.
        const urlObj = new URL(url);
        urlObj.pathname = path;
        str = urlObj.toString();
    }
    return (0, string_1.trimSuffix)(str, "/");
}
exports.addPath = addPath;
/**
 * Adds a subdomain to the given URL.
 *
 * @param url - The URL.
 * @param subdomain - The subdomain to add.
 * @returns - The final URL.
 */
function addUrlSubdomain(url, subdomain) {
    const urlObj = new URL(url);
    urlObj.hostname = `${subdomain}.${urlObj.hostname}`;
    const str = urlObj.toString();
    return (0, string_1.trimSuffix)(str, "/");
}
exports.addUrlSubdomain = addUrlSubdomain;
/**
 * Adds a query to the given URL.
 *
 * @param url - The URL.
 * @param query - The query parameters.
 * @returns - The final URL.
 */
function addUrlQuery(url, query) {
    const parsed = (0, url_parse_1.default)(url, true);
    // Combine the desired query params with the already existing ones.
    query = { ...parsed.query, ...query };
    parsed.set("query", query);
    return parsed.toString();
}
exports.addUrlQuery = addUrlQuery;
/**
 * Ensures that the given string is a URL with a protocol prefix.
 *
 * @param url - The given string.
 * @returns - The URL.
 */
function ensureUrlPrefix(url) {
    if (url === "localhost") {
        return "http://localhost/";
    }
    if (!/^https?:(\/\/)?/i.test(url)) {
        return `https://${url}`;
    }
    return url;
}
exports.ensureUrlPrefix = ensureUrlPrefix;
/**
 * Properly joins paths together to create a URL. Takes a variable number of
 * arguments.
 *
 * @param args - Array of URL parts to join.
 * @returns - Final URL constructed from the input parts.
 */
function makeUrl(...args) {
    if (args.length === 0) {
        (0, validation_1.throwValidationError)("args", args, "parameter", "non-empty");
    }
    return (0, skynet_mysky_utils_1.ensureUrl)(args.reduce((acc, cur) => (0, url_join_1.default)(acc, cur)));
}
exports.makeUrl = makeUrl;
/**
 * Constructs the full URL for the given domain,
 * e.g. ("https://siasky.net", "dac.hns/path/file") => "https://dac.hns.siasky.net/path/file"
 *
 * @param portalUrl - The portal URL.
 * @param domain - Domain.
 * @returns - The full URL for the given domain.
 */
function getFullDomainUrlForPortal(portalUrl, domain) {
    (0, validation_1.validateString)("portalUrl", portalUrl, "parameter");
    (0, validation_1.validateString)("domain", domain, "parameter");
    // Normalize the portalURL.
    portalUrl = ensureUrlPrefix((0, string_1.trimUriPrefix)(portalUrl, "http://"));
    // Normalize the domain.
    domain = (0, string_1.trimUriPrefix)(domain, exports.URI_SKYNET_PREFIX);
    domain = (0, string_1.trimForwardSlash)(domain);
    // Split on first / to get the path.
    let path;
    [domain, path] = domain.split(/\/(.+)/);
    // Add to subdomain.
    let url;
    if (domain === "localhost") {
        // Special handling for localhost.
        url = "localhost";
    }
    else {
        url = addUrlSubdomain(portalUrl, domain);
    }
    // Add back the path if there was one.
    if (path) {
        url = addPath(url, path);
    }
    return url;
}
exports.getFullDomainUrlForPortal = getFullDomainUrlForPortal;
/**
 * Extracts the domain from the given portal URL,
 * e.g. ("https://siasky.net", "dac.hns.siasky.net/path/file") => "dac.hns/path/file"
 *
 * @param portalUrl - The portal URL.
 * @param fullDomain - Full URL.
 * @returns - The extracted domain.
 */
function extractDomainForPortal(portalUrl, fullDomain) {
    (0, validation_1.validateString)("portalUrl", portalUrl, "parameter");
    (0, validation_1.validateString)("fullDomain", fullDomain, "parameter");
    let path;
    try {
        // Try to extract the domain from the fullDomain.
        const fullDomainObj = new URL(fullDomain);
        fullDomain = fullDomainObj.hostname;
        path = fullDomainObj.pathname;
        path = (0, string_1.trimForwardSlash)(path);
    }
    catch {
        // If fullDomain is not a URL, ignore the error and use it as-is.
        //
        // Trim any slashes from the input URL.
        fullDomain = (0, string_1.trimForwardSlash)(fullDomain);
        // Split on first / to get the path.
        [fullDomain, path] = fullDomain.split(/\/(.+)/);
        // Lowercase the domain to match URL parsing. Leave path as-is.
        fullDomain = fullDomain.toLowerCase();
    }
    // Get the portal domain.
    const portalUrlObj = new URL(ensureUrlPrefix(portalUrl));
    const portalDomain = (0, string_1.trimForwardSlash)(portalUrlObj.hostname);
    // Remove the portal domain from the domain.
    let domain = (0, string_1.trimSuffix)(fullDomain, portalDomain, 1);
    domain = (0, string_1.trimSuffix)(domain, ".");
    // Add back the path if there is one.
    if (path && path !== "") {
        path = (0, string_1.trimForwardSlash)(path);
        domain = `${domain}/${path}`;
    }
    return domain;
}
exports.extractDomainForPortal = extractDomainForPortal;
