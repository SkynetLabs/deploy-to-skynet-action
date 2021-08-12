import { Permission, PermHidden, PermWrite } from "./index";

describe("new Permission()", () => {
  it("Should reject invalid enum values", () => {
    expect(
      () => new Permission("test", "test", PermWrite, PermWrite)
    ).toThrowError("Invalid 'category' enum value 5");
    expect(
      () => new Permission("test", "test", PermHidden, PermHidden)
    ).toThrowError("Invalid 'permType' enum value 2");
  });
});
