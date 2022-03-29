"use strict";
/* istanbul ignore file: Much of this functionality is only testable from a browser */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connector = exports.DEFAULT_CONNECTOR_OPTIONS = void 0;
const post_me_1 = require("post-me");
const skynet_mysky_utils_1 = require("skynet-mysky-utils");
const url_1 = require("../utils/url");
exports.DEFAULT_CONNECTOR_OPTIONS = {
    dev: false,
    debug: false,
    alpha: false,
    handshakeMaxAttempts: skynet_mysky_utils_1.defaultHandshakeMaxAttempts,
    handshakeAttemptsInterval: skynet_mysky_utils_1.defaultHandshakeAttemptsInterval,
};
/**
 * The object that connects to a child iframe and keeps track of information
 * about it.
 */
class Connector {
    /**
     * Creates a `Connector`.
     *
     * @param url - The iframe URL.
     * @param client - The Skynet Client.
     * @param childFrame - The iframe handle.
     * @param connection - The postmessage handshake connection.
     * @param options - The custom options.
     */
    constructor(url, client, childFrame, connection, options) {
        this.url = url;
        this.client = client;
        this.childFrame = childFrame;
        this.connection = connection;
        this.options = options;
    }
    // Static initializer
    /**
     * Initializes a `Connector` instance.
     *
     * @param client - The Skynet Client.
     * @param domain - The MySky domain to open.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @returns - The `Connector`.
     */
    static async init(client, domain, customOptions) {
        const opts = { ...exports.DEFAULT_CONNECTOR_OPTIONS, ...customOptions };
        // Get the URL for the domain on the current portal.
        let domainUrl = await client.getFullDomainUrl(domain);
        if (opts.dev) {
            domainUrl = (0, url_1.addUrlQuery)(domainUrl, { dev: "true" });
        }
        if (opts.debug) {
            domainUrl = (0, url_1.addUrlQuery)(domainUrl, { debug: "true" });
        }
        if (opts.alpha) {
            domainUrl = (0, url_1.addUrlQuery)(domainUrl, { alpha: "true" });
        }
        // Create the iframe.
        const childFrame = (0, skynet_mysky_utils_1.createIframe)(domainUrl, domainUrl);
        // The frame window should always exist. Sanity check + make TS happy.
        if (!childFrame.contentWindow) {
            throw new Error("'childFrame.contentWindow' was null");
        }
        const childWindow = childFrame.contentWindow;
        // Connect to the iframe.
        const messenger = new post_me_1.WindowMessenger({
            localWindow: window,
            remoteWindow: childWindow,
            remoteOrigin: "*",
        });
        const connection = await (0, post_me_1.ParentHandshake)(messenger, {}, opts.handshakeMaxAttempts, opts.handshakeAttemptsInterval);
        // Construct the component connector.
        return new Connector(domainUrl, client, childFrame, connection, opts);
    }
    /**
     * Calls the given method with the given arguments.
     *
     * @param method - The remote method to call over the connection.
     * @param args - The list of optional arguments.
     * @returns - The result of the call.
     */
    async call(method, ...args) {
        return this.connection.remoteHandle().call(method, ...args);
    }
}
exports.Connector = Connector;
