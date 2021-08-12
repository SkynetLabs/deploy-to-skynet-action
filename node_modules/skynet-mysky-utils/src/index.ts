export { getPathDomain, getParentPath, sanitizePath } from "./paths";
export {
  Permission,
  PermCategory,
  PermType,
  permCategoryToString,
  permTypeToString,
  // Constants
  PermDiscoverable,
  PermHidden,
  PermLegacySkyID,
  PermRead,
  PermWrite,
} from "./permissions";
export {
  createFullScreenIframe,
  createIframe,
  ensureUrl,
  removeAdjacentChars,
  trimSuffix,
} from "./utils";
export {
  dispatchedErrorEvent,
  errorWindowClosed,
  monitorWindowError,
} from "./window-listener";

import { Permission } from "./permissions";

export const defaultHandshakeMaxAttempts = 150;
export const defaultHandshakeAttemptsInterval = 100;

export type CheckPermissionsResponse = {
  grantedPermissions: Permission[];
  failedPermissions: Permission[];
};

/**
 * Custom options for mySky.userID().
 *
 * @property [legacyAppID] - Deprecated. The legacy app ID. For compatibility with SkyID.
 */
export type CustomUserIDOptions = {
  legacyAppID?: string;
};
