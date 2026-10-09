import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";

describe("Schema with circular (recursive) $refs", () => {
  describe("$ref to self", () => {
    it("should parse successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.parse(path.rel("specs/circular/circular-self.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.self);
      expect(parser.$refs.paths()).toEqual([path.abs("specs/circular/circular-self.yaml")]);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/circular/circular-self.yaml"),
      path.abs("specs/circular/circular-self.yaml"), parsedSchema.self
    ));

    it("should dereference successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular/circular-self.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.self);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.child.properties.pet).toBe(schema.definitions.pet);
    });

    it("should double dereference successfully", async () => {
      const firstPassSchema = await $RefParser.dereference(path.rel("specs/circular/circular-self.yaml"));
      let parser = new $RefParser();
      const schema = await parser.dereference(firstPassSchema);
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.self);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.child.properties.pet).toBe(schema.definitions.pet);
    });

    it('should produce the same results if "options.$refs.circular" is "ignore"', async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular/circular-self.yaml"), { dereference: { circular: "ignore" }});
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.self);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
    });

    it('should throw an error if "options.$refs.circular" is false', async () => {
      let parser = new $RefParser();

      try {
        await parser.dereference(path.rel("specs/circular/circular-self.yaml"), { dereference: { circular: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        // A ReferenceError should have been thrown
        expect(err).toBeInstanceOf(ReferenceError);
        expect(err.message).toContain("Circular $ref pointer found at ");
        expect(err.message).toContain("specs/circular/circular-self.yaml#/definitions/thing");

        // $Refs.circular should be true
        expect(parser.$refs.circular).toBe(true);
      }
    });

    it("should bundle successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.bundle(path.rel("specs/circular/circular-self.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.self);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });
  });

  describe("$ref to ancestor", () => {
    it("should parse successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.parse(path.rel("specs/circular/circular-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.ancestor);
      expect(parser.$refs.paths()).toEqual([path.abs("specs/circular/circular-ancestor.yaml")]);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/circular/circular-ancestor.yaml"),
      path.abs("specs/circular/circular-ancestor.yaml"), parsedSchema.ancestor
    ));

    it("should dereference successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular/circular-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.ancestor.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.person.properties.spouse).toBe(schema.definitions.person);
      expect(schema.definitions.person.properties.pet).toBe(schema.definitions.pet);
    });

    it("should double dereference successfully", async () => {
      let parser = new $RefParser();
      const firstPassSchema = await $RefParser.dereference(path.rel("specs/circular/circular-ancestor.yaml"));
      const schema = await parser.dereference(firstPassSchema);
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.ancestor.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.person.properties.spouse).toBe(schema.definitions.person);
      expect(schema.definitions.person.properties.pet).toBe(schema.definitions.pet);
    });

    it('should not dereference circular $refs if "options.$refs.circular" is "ignore"', async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular/circular-ancestor.yaml"), { dereference: { circular: "ignore" }});
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.ancestor.ignoreCircular$Refs);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.person.properties.pet).toBe(schema.definitions.pet);
    });

    it('should throw an error if "options.$refs.circular" is false', async () => {
      let parser = new $RefParser();

      try {
        await parser.dereference(path.rel("specs/circular/circular-ancestor.yaml"), { dereference: { circular: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        // A ReferenceError should have been thrown
        expect(err).toBeInstanceOf(ReferenceError);
        expect(err.message).toContain("Circular $ref pointer found at ");
        expect(err.message).toContain("specs/circular/circular-ancestor.yaml#/definitions/person/properties/spouse");

        // $Refs.circular should be true
        expect(parser.$refs.circular).toBe(true);
      }
    });

    it("should bundle successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.bundle(path.rel("specs/circular/circular-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.ancestor);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });
  });

  describe("indirect circular $refs", () => {
    it("should parse successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.parse(path.rel("specs/circular/circular-indirect.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.indirect);
      expect(parser.$refs.paths()).toEqual([path.abs("specs/circular/circular-indirect.yaml")]);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/circular/circular-indirect.yaml"),
      path.abs("specs/circular/circular-indirect.yaml"), parsedSchema.indirect
    ));

    it("should dereference successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular/circular-indirect.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirect.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.parent.properties.children.items).toBe(schema.definitions.child);
      expect(schema.definitions.child.properties.parents.items).toBe(schema.definitions.parent);
    });

    it("should double dereference successfully", async () => {
      let parser = new $RefParser();
      const firstPassSchema = await $RefParser.dereference(path.rel("specs/circular/circular-indirect.yaml"));
      const schema = await parser.dereference(firstPassSchema);
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirect.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.parent.properties.children.items).toBe(schema.definitions.child);
      expect(schema.definitions.child.properties.parents.items).toBe(schema.definitions.parent);
    });

    it('should not dereference circular $refs if "options.$refs.circular" is "ignore"', async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular/circular-indirect.yaml"), { dereference: { circular: "ignore" }});
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirect.ignoreCircular$Refs);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.child.properties.pet).toBe(schema.definitions.pet);
    });

    it('should throw an error if "options.$refs.circular" is false', async () => {
      let parser = new $RefParser();

      try {
        await parser.dereference(path.rel("specs/circular/circular-indirect.yaml"), { dereference: { circular: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        // A ReferenceError should have been thrown
        expect(err).toBeInstanceOf(ReferenceError);
        expect(err.message).toContain("Circular $ref pointer found at ");
        expect(err.message).toContain("specs/circular/circular-indirect.yaml#/definitions/child/properties/parents/items");

        // $Refs.circular should be true
        expect(parser.$refs.circular).toBe(true);
      }
    });

    it("should bundle successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.bundle(path.rel("specs/circular/circular-indirect.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.indirect);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });
  });

  describe("indirect circular and ancestor $refs", () => {
    it("should parse successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.parse(path.rel("specs/circular/circular-indirect-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.indirectAncestor);
      expect(parser.$refs.paths()).toEqual([path.abs("specs/circular/circular-indirect-ancestor.yaml")]);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/circular/circular-indirect-ancestor.yaml"),
      path.abs("specs/circular/circular-indirect-ancestor.yaml"), parsedSchema.indirectAncestor
    ));

    it("should dereference successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular/circular-indirect-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirectAncestor.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.parent.properties.child).toBe(schema.definitions.child);
      expect(schema.definitions.child.properties.children.items).toBe(schema.definitions.child);
    });

    it("should double dereference successfully", async () => {
      let parser = new $RefParser();
      const firstPassSchema = await parser.dereference(path.rel("specs/circular/circular-indirect-ancestor.yaml"));
      const schema = await parser.dereference(firstPassSchema);
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirectAncestor.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.parent.properties.child).toBe(schema.definitions.child);
      expect(schema.definitions.child.properties.children.items).toBe(schema.definitions.child);
    });

    it('should not dereference circular $refs if "options.$refs.circular" is "ignore"', async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular/circular-indirect-ancestor.yaml"), { dereference: { circular: "ignore" }});
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirectAncestor.ignoreCircular$Refs);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.child.properties.pet).toBe(schema.definitions.pet);
    });

    it('should throw an error if "options.$refs.circular" is false', async () => {
      let parser = new $RefParser();

      try {
        await parser.dereference(path.rel("specs/circular/circular-indirect-ancestor.yaml"), { dereference: { circular: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        // A ReferenceError should have been thrown
        expect(err).toBeInstanceOf(ReferenceError);
        expect(err.message).toContain("Circular $ref pointer found at ");
        expect(err.message).toContain("specs/circular/circular-indirect-ancestor.yaml#/definitions/child/properties");

        // $Refs.circular should be true
        expect(parser.$refs.circular).toBe(true);
      }
    });

    it("should bundle successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.bundle(path.rel("specs/circular/circular-indirect-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.indirectAncestor);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });
  });

});
