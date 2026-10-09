import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import internalRefsParsedSchema from "../internal/parsed";
import internalRefsDereferencedSchema from "../internal/dereferenced";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Object sources (instead of file paths)", () => {
  it("should dereference a single object", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(helper.cloneDeep(internalRefsParsedSchema));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(internalRefsDereferencedSchema);
    // The schema path should be the current directory
    let expectedPaths = [
      path.cwd()
    ];
    expect([...parser.$refs.paths()].sort()).toEqual([...expectedPaths].sort());
    expect(Object.keys(parser.$refs.values()).sort()).toEqual([...expectedPaths].sort());
    // Reference equality
    expect(schema.properties.name).toBe(schema.definitions.name);
    expect(schema.definitions.requiredString).toBe(schema.definitions.name.properties.first);
    expect(schema.definitions.requiredString).toBe(schema.definitions.name.properties.last);
    expect(schema.definitions.requiredString).toBe(schema.properties.name.properties.first);
    expect(schema.definitions.requiredString).toBe(schema.properties.name.properties.last);
  });

  it("should dereference an object that references external files", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(helper.cloneDeep(parsedSchema.schema));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // The schema path should be the current directory, and all other paths should be absolute
    let expectedPaths = [
      path.cwd(),
      path.abs("specs/object-source/definitions/definitions.json"),
      path.abs("specs/object-source/definitions/name.yaml"),
      path.abs("specs/object-source/definitions/required-string.yaml")
    ];
    expect([...parser.$refs.paths()].sort()).toEqual([...expectedPaths].sort());
    expect(Object.keys(parser.$refs.values()).sort()).toEqual([...expectedPaths].sort());
    // Reference equality
    expect(schema.properties.name).toBe(schema.definitions.name);
    expect(schema.definitions.requiredString).toBe(schema.definitions.name.properties.first);
    expect(schema.definitions.requiredString).toBe(schema.definitions.name.properties.last);
    expect(schema.definitions.requiredString).toBe(schema.properties.name.properties.first);
    expect(schema.definitions.requiredString).toBe(schema.properties.name.properties.last);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle an object that references external files", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(helper.cloneDeep(parsedSchema.schema));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
    // The schema path should be the current directory, and all other paths should be absolute
    let expectedPaths = [
      path.cwd(),
      path.abs("specs/object-source/definitions/definitions.json"),
      path.abs("specs/object-source/definitions/name.yaml"),
      path.abs("specs/object-source/definitions/required-string.yaml")
    ];
    expect([...parser.$refs.paths()].sort()).toEqual([...expectedPaths].sort());
    expect(Object.keys(parser.$refs.values()).sort()).toEqual([...expectedPaths].sort());
  });
});
