import { Connection } from "post-me";
import { SkynetClient } from "../client";
/**
 * Custom connector options.
 *
 * @property [dev] - Whether to use the dev build of mysky. It is functionally equivalent to the default production mysky, except that all permissions are granted automatically and data lives in a separate sandbox from production.
 * @property [debug] - Whether to tell mysky and DACs to print debug messages.
 * @property [alpha] - Whether to use the alpha build of mysky. This is the build where development occurs and it can be expected to break. This takes precedence over the 'dev' option if that is also set.
 * @property [handshakeMaxAttempts=150] - The amount of handshake attempts to make when starting a connection.
 * @property [handshakeAttemptsInterval=100] - The time interval to wait between handshake attempts.
 */
export declare type CustomConnectorOptions = {
    dev?: boolean;
    debug?: boolean;
    alpha?: boolean;
    handshakeMaxAttempts?: number;
    handshakeAttemptsInterval?: number;
};
export declare const DEFAULT_CONNECTOR_OPTIONS: {
    dev: boolean;
    debug: boolean;
    alpha: boolean;
    handshakeMaxAttempts: number;
    handshakeAttemptsInterval: number;
};
/**
 * The object that connects to a child iframe and keeps track of information
 * about it.
 */
export declare class Connector {
    url: string;
    client: SkynetClient;
    childFrame: HTMLIFrameElement;
    connection: Connection;
    options: CustomConnectorOptions;
    /**
     * Creates a `Connector`.
     *
     * @param url - The iframe URL.
     * @param client - The Skynet Client.
     * @param childFrame - The iframe handle.
     * @param connection - The postmessage handshake connection.
     * @param options - The custom options.
     */
    constructor(url: string, client: SkynetClient, childFrame: HTMLIFrameElement, connection: Connection, options: CustomConnectorOptions);
    /**
     * Initializes a `Connector` instance.
     *
     * @param client - The Skynet Client.
     * @param domain - The MySky domain to open.
     * @param [customOptions] - Additional settings that can optionally be set.
     * @returns - The `Connector`.
     */
    static init(client: SkynetClient, domain: string, customOptions?: CustomConnectorOptions): Promise<Connector>;
    /**
     * Calls the given method with the given arguments.
     *
     * @param method - The remote method to call over the connection.
     * @param args - The list of optional arguments.
     * @returns - The result of the call.
     */
    call(method: string, ...args: unknown[]): Promise<unknown>;
}
//# sourceMappingURL=connector.d.ts.map