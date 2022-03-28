import { Permission } from "skynet-mysky-utils";
import { SkynetClient } from "../client";
import { Connector, CustomConnectorOptions } from "./connector";
/**
 * The base DAC class with base and required methods.
 */
export declare abstract class DacLibrary {
    protected dacDomain: string;
    protected connector?: Connector;
    /**
     * Constructs the DAC.
     *
     * @param dacDomain - The domain of the DAC.
     */
    constructor(dacDomain: string);
    /**
     * Initializes the `Connector` with the DAC iframe and calls `init` on the
     * DAC.
     *
     * @param client - The Skynet Client.
     * @param customOptions - The custom options.
     */
    init(client: SkynetClient, customOptions: CustomConnectorOptions): Promise<void>;
    /**
     * Returns the permissions required by the DAC.
     *
     * @returns - The DAC permissions.
     */
    abstract getPermissions(): Permission[];
    /**
     * The hook to run on user login.
     */
    onUserLogin(): Promise<void>;
}
//# sourceMappingURL=dac.d.ts.map