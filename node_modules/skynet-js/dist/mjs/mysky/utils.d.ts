import { SkynetClient } from "../client";
/**
 * Constructs the full URL for the given component domain,
 * e.g. "dac.hns" => "https://dac.hns.siasky.net"
 *
 * @param this - SkynetClient
 * @param domain - Component domain.
 * @returns - The full URL for the component.
 */
export declare function getFullDomainUrl(this: SkynetClient, domain: string): Promise<string>;
/**
 * Extracts the domain from the current portal URL,
 * e.g. ("dac.hns.siasky.net") => "dac.hns"
 *
 * @param this - SkynetClient
 * @param fullDomain - Full URL.
 * @returns - The extracted domain.
 */
export declare function extractDomain(this: SkynetClient, fullDomain: string): Promise<string>;
/**
 * Create a new popup window. From SkyID.
 *
 * @param url - The URL to open.
 * @param title - The title of the popup window.
 * @param w - The width of the popup window.
 * @param h - the height of the popup window.
 * @returns - The window.
 * @throws - Will throw if the window could not be opened.
 */
export declare function popupCenter(url: string, title: string, w: number, h: number): Window;
//# sourceMappingURL=utils.d.ts.map