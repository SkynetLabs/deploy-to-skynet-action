import { getParentPath, getPathDomain, sanitizePath } from "./paths";

describe("getPathDomain", () => {
  const paths: Array<[string, string | null]> = [
    ["path.hns", "path.hns"],
    ["path.hns/path", "path.hns"],
    ["path.hns//path/path/", "path.hns"],
    ["PATH.Hns//Path/path/", "path.hns"],
    ["/path/file/", null],
    ["", null],
  ];

  it.each(paths)("domain for path '%s' should be '%s'", (path, pathDomain) => {
    const receivedDomain = getPathDomain(path);
    expect(receivedDomain).toEqual(pathDomain);
  });
});

describe("parentPath", () => {
  const paths: Array<[string, string | null]> = [
    ["app.hns/path/file.json", "app.hns/path"],
    ["app.hns///path///file.json", "app.hns/path"],
    ["APP.hns///Path///file.json", "app.hns/Path"],
    ["app.hns//path", "app.hns"],
    ["app.hns/path/", "app.hns"],
    ["/app.hns/path/", null],
    ["app.hns//", null],
    ["//app.hns//", null],
    ["//", null],
    ["", null],
  ];

  it.each(paths)("parent path for '%s' should be '%s'", (path, parentPath) => {
    const receivedPath = getParentPath(path);
    expect(receivedPath).toEqual(parentPath);
  });
});

describe("sanitizePath", () => {
  const paths: Array<[string, string | null]> = [
    ["test.hns", "test.hns"],
    [" test.hns  ", "test.hns"],
    ["path.hns", "path.hns"],
    ["Path.HNS", "path.hns"],
    ["//path/file/", null],
    ["\t//path/file/", null],
    ["path.hns//file.json//", "path.hns/file.json"],
    ["PATH.Hns//File.json//", "path.hns/File.json"],
    ["//", null],
    ["", null],
  ];

  it.each(paths)(
    "path '%s' should be sanitized to '%s'",
    (path, sanitizedPath) => {
      const receivedPath = sanitizePath(path);
      expect(receivedPath).toEqual(sanitizedPath);
    }
  );
});
