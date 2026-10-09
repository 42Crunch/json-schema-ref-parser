import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Schema with multiple external $refs to different parts of a file", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.abs("specs/external-multiple/external-multiple.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/external-multiple/external-multiple.yaml")]);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/external-multiple/external-multiple.yaml"),
    path.abs("specs/external-multiple/external-multiple.yaml"), parsedSchema.schema,
    path.abs("specs/external-multiple/definitions.yaml"), parsedSchema.definitions
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/external-multiple/external-multiple.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // Reference equality
    expect(schema.properties.user.example).toBe(schema.example.user);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/external-multiple/external-multiple.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
  });
});
