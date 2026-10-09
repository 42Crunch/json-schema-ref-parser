import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Schema with internal $refs", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/internal/internal.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/internal/internal.yaml")]);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/internal/internal.yaml"),
    path.abs("specs/internal/internal.yaml"), parsedSchema
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/internal/internal.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // Reference equality
    expect(schema.properties.name).toBe(schema.definitions.name);
    expect(schema.definitions.requiredString).toBe(schema.definitions.name.properties.first);
    expect(schema.definitions.requiredString).toBe(schema.definitions.name.properties.last);
    expect(schema.definitions.requiredString).toBe(schema.properties.name.properties.first);
    expect(schema.definitions.requiredString).toBe(schema.properties.name.properties.last);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/internal/internal.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
  });
});
