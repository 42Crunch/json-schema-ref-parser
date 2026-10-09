import { describe, it, expect } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const commonJSExport = require("../../");
const {
  default: defaultExport,
  JSONParserError,
  InvalidPointerError,
  MissingPointerError,
  ResolverError,
  ParserError,
  UnmatchedParserError,
  UnmatchedResolverError,
} = commonJSExport;

describe("json-schema-ref-parser package exports", () => {

  function is$RefParser (parser) {
    expect(parser).toBeTypeOf("function");
    expect(parser).toHaveProperty("name", "$RefParser");
    expect(parser.parse).toBeTypeOf("function");
    expect(parser.parse).toHaveProperty("name", "parse");
    expect(parser.prototype.parse).toBeTypeOf("function");
    expect(parser.prototype.parse).toHaveProperty("name", "parse");
    expect(parser.resolve).toBeTypeOf("function");
    expect(parser.resolve).toHaveProperty("name", "resolve");
    expect(parser.prototype.resolve).toBeTypeOf("function");
    expect(parser.prototype.resolve).toHaveProperty("name", "resolve");
    expect(parser.dereference).toBeTypeOf("function");
    expect(parser.dereference).toHaveProperty("name", "dereference");
    expect(parser.prototype.dereference).toBeTypeOf("function");
    expect(parser.prototype.dereference).toHaveProperty("name", "dereference");
    expect(parser.bundle).toBeTypeOf("function");
    expect(parser.bundle).toHaveProperty("name", "bundle");
    expect(parser.prototype.bundle).toBeTypeOf("function");
    expect(parser.prototype.bundle).toHaveProperty("name", "bundle");
    return true;
  }

  it("should export the $RefParser class as the default CommonJS export", async () => {
    expect(commonJSExport).toSatisfy(is$RefParser);
  });

  it("should export the $RefParser class as the default ESM export", async () => {
    expect(defaultExport).toSatisfy(is$RefParser);
  });

  it("should export the JSONParserError class as a named ESM export", async () => {
    expect(JSONParserError).toBeTypeOf("function");
    expect(JSONParserError.name).toBe("JSONParserError");
  });

  it("should export the InvalidPointerError class as a named ESM export", async () => {
    expect(InvalidPointerError).toBeTypeOf("function");
    expect(InvalidPointerError.name).toBe("InvalidPointerError");
  });

  it("should export the MissingPointerError class as a named ESM export", async () => {
    expect(MissingPointerError).toBeTypeOf("function");
    expect(MissingPointerError.name).toBe("MissingPointerError");
  });

  it("should export the ResolverError class as a named ESM export", async () => {
    expect(ResolverError).toBeTypeOf("function");
    expect(ResolverError.name).toBe("ResolverError");
  });

  it("should export the ParserError class as a named ESM export", async () => {
    expect(ParserError).toBeTypeOf("function");
    expect(ParserError.name).toBe("ParserError");
  });

  it("should export the UnmatchedParserError class as a named ESM export", async () => {
    expect(UnmatchedParserError).toBeTypeOf("function");
    expect(UnmatchedParserError.name).toBe("UnmatchedParserError");
  });

  it("should export the UnmatchedResolverError class as a named ESM export", async () => {
    expect(UnmatchedResolverError).toBeTypeOf("function");
    expect(UnmatchedResolverError.name).toBe("UnmatchedResolverError");
  });

  it("should not export anything else", async () => {
    expect(Object.keys(commonJSExport).sort()).toEqual([
      "default",
      "parse",
      "resolve",
      "dereference",
      "bundle",
      "JSONParserError",
      "InvalidPointerError",
      "MissingPointerError",
      "ResolverError",
      "ParserError",
      "UnmatchedParserError",
      "UnmatchedResolverError",
    ].sort());
  });

});
