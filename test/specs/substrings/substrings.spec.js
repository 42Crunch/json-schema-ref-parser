import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("$refs that are substrings of each other", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/substrings/substrings.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/substrings/substrings.yaml")]);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/substrings/substrings.yaml"),
    path.abs("specs/substrings/substrings.yaml"), parsedSchema.schema,
    path.abs("specs/substrings/definitions/definitions.json"), parsedSchema.definitions,
    path.abs("specs/substrings/definitions/strings.yaml"), parsedSchema.strings
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/substrings/substrings.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // Reference equality
    expect(schema.properties.firstName).toBe(schema.definitions.name);
    expect(schema.properties.middleName).toBe(schema.definitions["name-with-min-length"]);
    expect(schema.properties.lastName).toBe(schema.definitions["name-with-min-length-max-length"]);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/substrings/substrings.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
  });
});
