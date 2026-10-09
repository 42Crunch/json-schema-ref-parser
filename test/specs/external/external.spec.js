import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Schema with external $refs", () => {
  it("should parse successfully from an absolute path", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.abs("specs/external/external.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/external/external.yaml")]);
  });

  it("should parse successfully from a relative path", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/external/external.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/external/external.yaml")]);
  });

  it("should parse successfully from a url", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.url("specs/external/external.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.url("specs/external/external.yaml")]);
  });

  it("should resolve successfully from an absolute path", helper.testResolve(
    path.abs("specs/external/external.yaml"),
    path.abs("specs/external/external.yaml"), parsedSchema.schema,
    path.abs("specs/external/definitions/definitions.json"), parsedSchema.definitions,
    path.abs("specs/external/definitions/name.yaml"), parsedSchema.name,
    path.abs("specs/external/definitions/required-string.yaml"), parsedSchema.requiredString
  ));

  it("should resolve successfully from a relative path", helper.testResolve(
    path.rel("specs/external/external.yaml"),
    path.abs("specs/external/external.yaml"), parsedSchema.schema,
    path.abs("specs/external/definitions/definitions.json"), parsedSchema.definitions,
    path.abs("specs/external/definitions/name.yaml"), parsedSchema.name,
    path.abs("specs/external/definitions/required-string.yaml"), parsedSchema.requiredString
  ));

  it("should resolve successfully from a url", helper.testResolve(
    path.url("specs/external/external.yaml"),
    path.url("specs/external/external.yaml"), parsedSchema.schema,
    path.url("specs/external/definitions/definitions.json"), parsedSchema.definitions,
    path.url("specs/external/definitions/name.yaml"), parsedSchema.name,
    path.url("specs/external/definitions/required-string.yaml"), parsedSchema.requiredString
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/external/external.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // Reference equality
    expect(schema.properties.name).toBe(schema.definitions.name);
    expect(schema.definitions["required string"]).toBe(schema.definitions.name.properties.first);
    expect(schema.definitions["required string"]).toBe(schema.definitions.name.properties.last);
    expect(schema.definitions["required string"]).toBe(schema.properties.name.properties.first);
    expect(schema.definitions["required string"]).toBe(schema.properties.name.properties.last);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/external/external.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
  });
});
