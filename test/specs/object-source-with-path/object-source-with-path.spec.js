import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import internalRefsParsedSchema from "../internal/parsed";
import internalRefsDereferencedSchema from "../internal/dereferenced";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Object sources with file paths", () => {
  it("should dereference a single object", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(
      // This file doesn't actually need to exist. But its path will be used to resolve external $refs
      path.abs("path/that/does/not/exist.yaml"),
      // This schema object does not contain any external $refs
      helper.cloneDeep(internalRefsParsedSchema),
      // An options object MUST be passed (even if it's empty)
      {});
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(internalRefsDereferencedSchema);
    // The schema path should match the one we pass-in
    let expectedPaths = [
      path.abs("path/that/does/not/exist.yaml")
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
    const schema = await parser.dereference(
      // This file doesn't actually need to exist. But its path will be used to resolve external $refs
      path.abs("specs/object-source-with-path/schema-file-that-does-not-exist.yaml"),
      // This schema object contains external $refs
      helper.cloneDeep(parsedSchema.schema),
      // An options object MUST be passed (even if it's empty)
      {});
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // The schema path should match the one we passed-in.
    // All other paths should be the actual paths of referenced files.
    let expectedPaths = [
      path.abs("specs/object-source-with-path/schema-file-that-does-not-exist.yaml"),
      path.abs("specs/object-source-with-path/definitions/definitions.json"),
      path.abs("specs/object-source-with-path/definitions/name.yaml"),
      path.abs("specs/object-source-with-path/definitions/required-string.yaml")
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
    const schema = await parser.bundle(
      // This file doesn't actually need to exist. But its path will be used to resolve external $refs
      path.rel("specs/object-source-with-path/schema-file-that-does-not-exist.yaml"),
      // This schema object contains external $refs
      helper.cloneDeep(parsedSchema.schema),
      // An options object MUST be passed (even if it's empty)
      {});
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
    // The schema path should match the one we passed-in.
    // All other paths should be the actual paths of referenced files.
    let expectedPaths = [
      path.abs("specs/object-source-with-path/schema-file-that-does-not-exist.yaml"),
      path.abs("specs/object-source-with-path/definitions/definitions.json"),
      path.abs("specs/object-source-with-path/definitions/name.yaml"),
      path.abs("specs/object-source-with-path/definitions/required-string.yaml")
    ];
    expect([...parser.$refs.paths()].sort()).toEqual([...expectedPaths].sort());
    expect(Object.keys(parser.$refs.values()).sort()).toEqual([...expectedPaths].sort());
  });
});
