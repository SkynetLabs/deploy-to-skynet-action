"use strict";
/* istanbul ignore file: Much of this functionality is only testable from a browser */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DacLibrary = void 0;
const connector_1 = require("./connector");
/**
 * The base DAC class with base and required methods.
 */
class DacLibrary {
    /**
     * Constructs the DAC.
     *
     * @param dacDomain - The domain of the DAC.
     */
    constructor(dacDomain) {
        this.dacDomain = dacDomain;
    }
    /**
     * Initializes the `Connector` with the DAC iframe and calls `init` on the
     * DAC.
     *
     * @param client - The Skynet Client.
     * @param customOptions - The custom options.
     */
    async init(client, customOptions) {
        this.connector = await connector_1.Connector.init(client, this.dacDomain, customOptions);
        await this.connector.connection.remoteHandle().call("init");
    }
    /**
     * The hook to run on user login.
     */
    async onUserLogin() {
        if (!this.connector) {
            throw new Error("init was not called");
        }
        await this.connector.connection.remoteHandle().call("onUserLogin");
    }
}
exports.DacLibrary = DacLibrary;
