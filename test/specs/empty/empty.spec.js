import { describe, it, expect } from "vitest";
import $RefParser from "../../../lib";
import helper from "../../utils/helper";
import path from "../../utils/path";

describe("Empty schema", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/empty/empty.json"));
    expect(schema).toBeTypeOf("object");
    expect(schema).toEqual({});
    expect(parser.schema).toBe(schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/empty/empty.json")]);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/empty/empty.json"),
    path.abs("specs/empty/empty.json"), {}
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/empty/empty.json"));
    expect(schema).toBeTypeOf("object");
    expect(schema).toEqual({});
    expect(parser.schema).toBe(schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/empty/empty.json")]);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/empty/empty.json"));
    expect(schema).toBeTypeOf("object");
    expect(schema).toEqual({});
    expect(parser.schema).toBe(schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/empty/empty.json")]);
  });

  it('should throw an error if "parse.json.allowEmpty" is disabled', async () => {
    try {
      await $RefParser.parse(path.rel("specs/empty/empty.json"), { parse: { json: { allowEmpty: false }}});
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).toBeInstanceOf(SyntaxError);
      expect(err.message).toContain("Error parsing ");
      expect(err.message).toContain('empty/empty.json"');
      expect(err.message).toContain("Parsed value is empty");
    }
  });
});
