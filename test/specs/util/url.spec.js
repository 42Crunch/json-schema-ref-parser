import { describe, it, expect } from "vitest";
import $url from "../../../lib/util/url";

describe("Return the extension of a URL", () => {
  it("should return an empty string if there isn't any extension", async () => {
    const extension = $url.getExtension("/file");
    expect(extension).toBe("");
  });

  it("should return the extension in lowercase", async () => {
    const extension = $url.getExtension("/file.YML");
    expect(extension).toBe(".yml");
  });

  it("should return the extension without the query", async () => {
    const extension = $url.getExtension("/file.yml?foo=bar");
    expect(extension).toBe(".yml");
  });
});
