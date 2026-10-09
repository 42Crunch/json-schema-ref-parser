import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Schema with a top-level (root) $ref", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/root/root.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/root/root.yaml")]);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/root/root.yaml"),
    path.abs("specs/root/root.yaml"), parsedSchema.schema,
    path.abs("specs/root/definitions/root.json"), parsedSchema.root,
    path.abs("specs/root/definitions/extended.yaml"), parsedSchema.extended,
    path.abs("specs/root/definitions/name.yaml"), parsedSchema.name
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/root/root.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // Reference equality
    expect(schema.properties.first).toBe(schema.properties.last);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/root/root.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
  });
});
