import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Schema with circular (recursive) external $refs", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/circular-external/circular-external.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/circular-external/circular-external.yaml")]);
    // The "circular" flag should NOT be set
    // (it only gets set by `dereference`)
    expect(parser.$refs.circular).toBe(false);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/circular-external/circular-external.yaml"),
    path.abs("specs/circular-external/circular-external.yaml"), parsedSchema.schema,
    path.abs("specs/circular-external/definitions/pet.yaml"), parsedSchema.pet,
    path.abs("specs/circular-external/definitions/child.yaml"), parsedSchema.child,
    path.abs("specs/circular-external/definitions/parent.yaml"), parsedSchema.parent,
    path.abs("specs/circular-external/definitions/person.yaml"), parsedSchema.person
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/circular-external/circular-external.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // The "circular" flag should be set
    expect(parser.$refs.circular).toBe(true);
    // Reference equality
    expect(schema.definitions.person.properties.spouse).toBe(schema.definitions.person);
    expect(schema.definitions.parent.properties.children.items).toBe(schema.definitions.child);
    expect(schema.definitions.child.properties.parents.items).toBe(schema.definitions.parent);
  });

  it('should throw an error if "options.$refs.circular" is false', async () => {
    let parser = new $RefParser();

    try {
      await parser.dereference(path.rel("specs/circular-external/circular-external.yaml"), { dereference: { circular: false }});
      helper.shouldNotGetCalled();
    }
    catch (err) {
      // A ReferenceError should have been thrown
      expect(err).toBeInstanceOf(ReferenceError);
      expect(err.message).toContain("Circular $ref pointer found at ");
      expect(err.message).toContain("specs/circular-external/circular-external.yaml#/definitions/thing");

      // $Refs.circular should be true
      expect(parser.$refs.circular).toBe(true);
    }
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/circular-external/circular-external.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(bundledSchema);
    // The "circular" flag should NOT be set
    // (it only gets set by `dereference`)
    expect(parser.$refs.circular).toBe(false);
  });
});
