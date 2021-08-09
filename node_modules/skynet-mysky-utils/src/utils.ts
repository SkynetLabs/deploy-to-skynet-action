/**
 * Creates an invisible iframe with the given src and adds it to the page.
 */
export function createIframe(srcUrl: string, name: string): HTMLIFrameElement {
  srcUrl = ensureUrl(srcUrl);

  const childFrame = document.createElement("iframe")!;
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
 */
export function createFullScreenIframe(
  srcUrl: string,
  name: string
): HTMLIFrameElement {
  srcUrl = ensureUrl(srcUrl);

  const childFrame = document.createElement("iframe")!;
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

export function ensureUrl(url: string): string {
  return ensurePrefix(url, "https://");
}

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

function ensurePrefix(s: string, prefix: string): string {
  if (!s.startsWith(prefix)) {
    s = `${prefix}${s}`;
  }
  return s;
}
