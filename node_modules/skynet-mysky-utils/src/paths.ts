import { removeAdjacentChars, trimSuffix } from "./utils";

/**
 * Gets the root path domain for the given path.
 *
 * @param path - The given path.
 * @returns - The path domain.
 */
export function getPathDomain(path: string): string {
  return path.split("/")[0];
}

/**
 * Gets the parent path for the given path.
 *
 * @param path - The given path.
 * @returns - The parent path, or null if no parent.
 */
export function getParentPath(path: string): string | null {
  path = sanitizePath(path);
  const pathArray = path.split("/");

  if (pathArray.length <= 1) {
    return null;
  }

  pathArray.pop();
  path = pathArray.join("/");
  return path;
}

/**
 * Sanitizes the path by removing trailing slashes and removing repeating adjacent slashes.
 *
 * @param path - The given path
 * @returns - The sanitized path.
 */
export function sanitizePath(path: string): string {
  // Remove trailing slashes.
  path = trimSuffix(path, "/");

  // Remove duplicate adjacent slashes.
  path = removeAdjacentChars(path, "/");

  return path;
}
