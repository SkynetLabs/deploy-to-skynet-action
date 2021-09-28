import { removeAdjacentChars, trimSuffix } from "./utils";

/**
 * Gets the root path domain for the given path.
 *
 * @param path - The given path.
 * @returns - The path domain.
 */
export function getPathDomain(path: string): string | null {
  // Sanitize the path.
  const sanitizedPath = sanitizePath(path);
  if (sanitizedPath === null) {
    return null;
  }

  // Split the string and extract the domain. If there are no slashes, the first
  // element will contain the entire string.
  const [domain] = sanitizedPath.split("/");
  if (domain === "") {
    return null;
  }
  return domain;
}

/**
 * Gets the parent path for the given path.
 *
 * @param path - The given path.
 * @returns - The parent path, or null if no parent.
 */
export function getParentPath(path: string): string | null {
  // Sanitize the path.
  const sanitizedPath = sanitizePath(path);
  if (sanitizedPath === null) {
    return null;
  }

  // Split the path.
  const pathArray = sanitizedPath.split("/");
  if (pathArray.length <= 1) {
    return null;
  }

  // Get the parent path.
  pathArray.pop();
  const parentPath = pathArray.join("/");
  if (parentPath === "") {
    return null;
  }
  return parentPath;
}

/**
 * Sanitizes the path by removing trailing slashes and removing repeating adjacent slashes.
 *
 * @param path - The given path
 * @returns - The sanitized path.
 */
export function sanitizePath(path: string): string | null {
  // Trim the path.
  path = path.trim();

  // Paths starting with a slash are invalid.
  if (path.startsWith("/")) {
    return null;
  }

  // Remove trailing slashes.
  path = trimSuffix(path, "/");

  // Remove duplicate adjacent slashes.
  path = removeAdjacentChars(path, "/");

  // Convert the domain to lowercase.
  const pathArray = path.split("/");
  pathArray[0] = pathArray[0].toLowerCase();

  // Get the sanitized path.
  const sanitizedPath = pathArray.join("/");
  if (sanitizedPath === "") {
    return null;
  }
  return sanitizedPath;
}
