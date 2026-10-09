import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Schema with deeply-nested $refs", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/deep/deep.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/deep/deep.yaml")]);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/deep/deep.yaml"),
    path.abs("specs/deep/deep.yaml"), parsedSchema.schema,
    path.abs("specs/deep/definitions/name.yaml"), parsedSchema.name,
    path.abs("specs/deep/definitions/required-string.yaml"), parsedSchema.requiredString
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/deep/deep.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // Reference equality
    expect(schema.properties.name.type).toBe(schema.properties["level 1"].properties.name.type);
    expect(schema.properties.name.type).toBe(schema.properties["level 1"].properties["level 2"].properties.name.type);
    expect(schema.properties.name.type).toBe(schema.properties["level 1"].properties["level 2"].properties["level 3"].properties.name.type);
    expect(schema.properties.name.type).toBe(schema.properties["level 1"].properties["level 2"].properties["level 3"].properties["level 4"].properties.name.type);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/deep/deep.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
  });
});
