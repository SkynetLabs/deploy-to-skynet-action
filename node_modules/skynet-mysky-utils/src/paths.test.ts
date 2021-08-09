import { getParentPath, getPathDomain, sanitizePath } from "./paths";

describe("getPathDomain", () => {
  const paths = [
    ["path.hns/path", "path.hns"],
    ["path.hns//path/path/", "path.hns"],
  ];

  it.each(paths)("domain for path %s should be %s", (path, pathDomain) => {
    const receivedDomain = getPathDomain(path);
    expect(receivedDomain).toEqual(pathDomain);
  });
});

describe("parentPath", () => {
  const paths: Array<[string, string | null]> = [
    ["app.hns/path/file.json", "app.hns/path"],
    ["app.hns///path///file.json", "app.hns/path"],
    ["app.hns//path", "app.hns"],
    ["app.hns/path/", "app.hns"],
    ["app.hns//", null],
  ];

  it.each(paths)("parent path for %s should be %s", (path, parentPath) => {
    const receivedPath = getParentPath(path);
    expect(receivedPath).toEqual(parentPath);
  });
});

describe("sanitizePath", () => {
  const paths = [
    ["test.hns", "test.hns"],
    ["path.hns", "path.hns"],
  ];

  it.each(paths)("path %s should be sanitized to %s", (path, sanitizedPath) => {
    const receivedPath = sanitizePath(path);
    expect(receivedPath).toEqual(sanitizedPath);
  });
});
