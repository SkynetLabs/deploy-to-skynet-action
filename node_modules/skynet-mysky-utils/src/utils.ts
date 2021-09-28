/**
 * Creates an invisible iframe with the given src and adds it to the page.
 *
 * @param srcUrl - The URL to use as src for the iframe.
 * @param name - The name for the iframe element.
 * @returns - The iframe element.
 * @throws - Will throw if the iframe could not be created.
 */
export function createIframe(srcUrl: string, name: string): HTMLIFrameElement {
  srcUrl = ensureUrl(srcUrl);

  const childFrame = document.createElement("iframe");
  if (childFrame === null) {
    throw new Error("Could not create new iframe");
  }
  childFrame.src = srcUrl;
  childFrame.name = name;
  childFrame.style.display = "none";

  // Set sandbox permissions.
  // TODO: Enable sandboxing?
  // childFrame.sandbox.add("allow-same-origin");
  // childFrame.sandbox.add("allow-scripts");

  document.body.appendChild(childFrame);
  return childFrame;
}

/**
 * Creates a full-screen iframe with the given src and adds it to the page.
 *
 * @param srcUrl - The URL to use as src for the iframe.
 * @param name - The name for the iframe element.
 * @returns - The iframe element.
 * @throws - Will throw if the iframe could not be created.
 */
export function createFullScreenIframe(
  srcUrl: string,
  name: string
): HTMLIFrameElement {
  srcUrl = ensureUrl(srcUrl);

  const childFrame = document.createElement("iframe");
  if (childFrame === null) {
    throw new Error("Could not create new iframe");
  }
  childFrame.src = srcUrl;
  childFrame.name = name;

  // Set properties to make the iframe full-screen.
  childFrame.style.position = "fixed";
  childFrame.style.top = "0";
  childFrame.style.left = "0";
  childFrame.style.bottom = "0";
  childFrame.style.right = "0";
  childFrame.style.width = "100%";
  childFrame.style.height = "100%";
  childFrame.style.border = "none";
  childFrame.style.margin = "0";
  childFrame.style.padding = "0";
  childFrame.style.overflow = "hidden";
  childFrame.style.zIndex = "999999";

  // Set sandbox permissions.
  // TODO: Enable sandboxing?
  // childFrame.sandbox.add("allow-same-origin");
  // childFrame.sandbox.add("allow-scripts");

  document.body.appendChild(childFrame);
  return childFrame;
}

/**
 * Ensures that the given string is a URL.
 *
 * @param url - The given string.
 * @returns - The URL.
 */
export function ensureUrl(url: string): string {
  return ensurePrefix(url, "https://");
}

/**
 * Removes duplicate adjacent characters from the given string.
 *
 * @param str - The given string.
 * @param char - The character to remove duplicates of.
 * @returns - The string without duplicate adjacent characters.
 */
export function removeAdjacentChars(str: string, char: string): string {
  const pathArray = Array.from(str);
  for (let i = 0; i < pathArray.length - 1; ) {
    if (pathArray[i] === char && pathArray[i + 1] === char) {
      pathArray.splice(i, 1);
    } else {
      i++;
    }
  }
  return pathArray.join("");
}

/**
 * Removes a suffix from the end of the string.
 *
 * @param str - The string to process.
 * @param suffix - The suffix to remove.
 * @param [limit] - Maximum amount of times to trim. No limit by default.
 * @returns - The processed string.
 */
export function trimSuffix(
  str: string,
  suffix: string,
  limit?: number
): string {
  while (str.endsWith(suffix)) {
    if (limit !== undefined && limit <= 0) {
      break;
    }
    str = str.substring(0, str.length - suffix.length);
    if (limit) {
      limit -= 1;
    }
  }
  return str;
}

/**
 * Prepends the prefix to the given string only if the string does not already start with the prefix.
 *
 * @param str - The string.
 * @param prefix - The prefix.
 * @returns - The prefixed string.
 */
export function ensurePrefix(str: string, prefix: string): string {
  if (!str.startsWith(prefix)) {
    str = `${prefix}${str}`;
  }
  return str;
}
