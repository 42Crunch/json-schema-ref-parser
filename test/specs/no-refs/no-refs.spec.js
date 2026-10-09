import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";

describe("Schema without any $refs", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/no-refs/no-refs.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/no-refs/no-refs.yaml")]);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/no-refs/no-refs.yaml"),
    path.abs("specs/no-refs/no-refs.yaml"), parsedSchema
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/no-refs/no-refs.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/no-refs/no-refs.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema);
  });
});
