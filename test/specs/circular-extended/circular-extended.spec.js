import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import bundledSchema from "./bundled";

describe("Schema with circular $refs that extend each other", () => {
  describe("$ref to self", () => {
    it("should parse successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.parse(path.rel("specs/circular-extended/circular-extended-self.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.self);
      expect(parser.$refs.paths()).toEqual([path.abs("specs/circular-extended/circular-extended-self.yaml")]);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/circular-extended/circular-extended-self.yaml"),
      path.abs("specs/circular-extended/circular-extended-self.yaml"), parsedSchema.self,
      path.abs("specs/circular-extended/definitions/thing.yaml"), parsedSchema.thing
    ));

    it("should dereference successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular-extended/circular-extended-self.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.self);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
    });

    it('should not dereference circular $refs if "options.$refs.circular" is "ignore"', async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular-extended/circular-extended-self.yaml"), { dereference: { circular: "ignore" }});
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.self);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
    });

    it('should throw an error if "options.$refs.circular" is false', async () => {
      let parser = new $RefParser();

      try {
        await parser.dereference(path.rel("specs/circular-extended/circular-extended-self.yaml"), { dereference: { circular: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        // A ReferenceError should have been thrown
        expect(err).toBeInstanceOf(ReferenceError);
        expect(err.message).toContain("Circular $ref pointer found at ");
        expect(err.message).toContain("specs/circular-extended/circular-extended-self.yaml#/definitions/thing");

        // $Refs.circular should be true
        expect(parser.$refs.circular).toBe(true);
      }
    });

    it("should bundle successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.bundle(path.rel("specs/circular-extended/circular-extended-self.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(bundledSchema.self);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });
  });

  describe("$ref to ancestor", () => {
    it("should parse successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.parse(path.rel("specs/circular-extended/circular-extended-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.ancestor);
      expect(parser.$refs.paths()).toEqual([path.abs("specs/circular-extended/circular-extended-ancestor.yaml")]);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/circular-extended/circular-extended-ancestor.yaml"),
      path.abs("specs/circular-extended/circular-extended-ancestor.yaml"), parsedSchema.ancestor,
      path.abs("specs/circular-extended/definitions/person-with-spouse.yaml"), parsedSchema.personWithSpouse,
      path.abs("specs/circular-extended/definitions/pet.yaml"), parsedSchema.pet,
      path.abs("specs/circular-extended/definitions/animals.yaml"), parsedSchema.animals
    ));

    it("should dereference successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular-extended/circular-extended-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.ancestor.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.person.properties.spouse.properties).toBe(schema.definitions.person.properties);
      expect(schema.definitions.person.properties.pet.properties).toBe(schema.definitions.pet.properties);
    });

    it('should not dereference circular $refs if "options.$refs.circular" is "ignore"', async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular-extended/circular-extended-ancestor.yaml"), { dereference: { circular: "ignore" }});
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.ancestor.ignoreCircular$Refs);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
    });

    it('should throw an error if "options.$refs.circular" is false', async () => {
      let parser = new $RefParser();

      try {
        await parser.dereference(path.rel("specs/circular-extended/circular-extended-ancestor.yaml"), { dereference: { circular: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        // A ReferenceError should have been thrown
        expect(err).toBeInstanceOf(ReferenceError);
        expect(err.message).toContain("Circular $ref pointer found at ");
        expect(err.message).toContain("specs/circular-extended/definitions/person-with-spouse.yaml#/properties/spouse");

        // $Refs.circular should be true
        expect(parser.$refs.circular).toBe(true);
      }
    });

    it("should bundle successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.bundle(path.rel("specs/circular-extended/circular-extended-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(bundledSchema.ancestor);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });
  });

  describe("indirect circular $refs", () => {
    it("should parse successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.parse(path.rel("specs/circular-extended/circular-extended-indirect.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.indirect);
      expect(parser.$refs.paths()).toEqual([path.abs("specs/circular-extended/circular-extended-indirect.yaml")]);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/circular-extended/circular-extended-indirect.yaml"),
      path.abs("specs/circular-extended/circular-extended-indirect.yaml"), parsedSchema.indirect,
      path.abs("specs/circular-extended/definitions/parent-with-children.yaml"), parsedSchema.parentWithChildren,
      path.abs("specs/circular-extended/definitions/child-with-parents.yaml"), parsedSchema.childWithParents,
      path.abs("specs/circular-extended/definitions/pet.yaml"), parsedSchema.pet,
      path.abs("specs/circular-extended/definitions/animals.yaml"), parsedSchema.animals
    ));

    it("should dereference successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular-extended/circular-extended-indirect.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirect.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.parent.properties.children.items.properties).toBe(schema.definitions.child.properties);
      expect(schema.definitions.child.properties.parents.items.properties).toBe(schema.definitions.parent.properties);
      expect(schema.definitions.child.properties.pet.properties).toBe(schema.definitions.pet.properties);
    });

    it('should not dereference circular $refs if "options.$refs.circular" is "ignore"', async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular-extended/circular-extended-indirect.yaml"), { dereference: { circular: "ignore" }});
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirect.ignoreCircular$Refs);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
    });

    it('should throw an error if "options.$refs.circular" is false', async () => {
      let parser = new $RefParser();

      try {
        await parser.dereference(path.rel("specs/circular-extended/circular-extended-indirect.yaml"), { dereference: { circular: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        // A ReferenceError should have been thrown
        expect(err).toBeInstanceOf(ReferenceError);
        expect(err.message).toContain("Circular $ref pointer found at ");
        expect(err.message).toContain("specs/circular-extended/definitions/child-with-parents.yaml#/properties/parents/items");

        // $Refs.circular should be true
        expect(parser.$refs.circular).toBe(true);
      }
    });

    it("should bundle successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.bundle(path.rel("specs/circular-extended/circular-extended-indirect.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(bundledSchema.indirect);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });
  });

  describe("indirect circular and ancestor $refs", () => {
    it("should parse successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.parse(path.rel("specs/circular-extended/circular-extended-indirect-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(parsedSchema.indirectAncestor);
      expect(parser.$refs.paths()).toEqual([path.abs("specs/circular-extended/circular-extended-indirect-ancestor.yaml")]);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/circular-extended/circular-extended-indirect-ancestor.yaml"),
      path.abs("specs/circular-extended/circular-extended-indirect-ancestor.yaml"), parsedSchema.indirectAncestor,
      path.abs("specs/circular-extended/definitions/parent-with-child.yaml"), parsedSchema.parentWithChild,
      path.abs("specs/circular-extended/definitions/child-with-children.yaml"), parsedSchema.childWithChildren,
      path.abs("specs/circular-extended/definitions/pet.yaml"), parsedSchema.pet,
      path.abs("specs/circular-extended/definitions/animals.yaml"), parsedSchema.animals
    ));

    it("should dereference successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular-extended/circular-extended-indirect-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirectAncestor.fullyDereferenced);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
      // Reference equality
      expect(schema.definitions.parent.properties.child.properties).toBe(schema.definitions.child.properties);
      expect(schema.definitions.child.properties.children.items.properties).toBe(schema.definitions.child.properties);
      expect(schema.definitions.pet.properties).toBe(schema.definitions.child.properties.pet.properties);
    });

    it('should not dereference circular $refs if "options.$refs.circular" is "ignore"', async () => {
      let parser = new $RefParser();
      const schema = await parser.dereference(path.rel("specs/circular-extended/circular-extended-indirect-ancestor.yaml"), { dereference: { circular: "ignore" }});
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(dereferencedSchema.indirectAncestor.ignoreCircular$Refs);
      // The "circular" flag should be set
      expect(parser.$refs.circular).toBe(true);
    });

    it('should throw an error if "options.$refs.circular" is false', async () => {
      let parser = new $RefParser();

      try {
        await parser.dereference(path.rel("specs/circular-extended/circular-extended-indirect-ancestor.yaml"), { dereference: { circular: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        // A ReferenceError should have been thrown
        expect(err).toBeInstanceOf(ReferenceError);
        expect(err.message).toContain("Circular $ref pointer found at ");
        expect(err.message).toContain("specs/circular-extended/definitions/child-with-children.yaml#/properties");

        // $Refs.circular should be true
        expect(parser.$refs.circular).toBe(true);
      }
    });

    it("should bundle successfully", async () => {
      let parser = new $RefParser();
      const schema = await parser.bundle(path.rel("specs/circular-extended/circular-extended-indirect-ancestor.yaml"));
      expect(schema).toBe(parser.schema);
      expect(schema).toEqual(bundledSchema.indirectAncestor);
      // The "circular" flag should NOT be set
      // (it only gets set by `dereference`)
      expect(parser.$refs.circular).toBe(false);
    });
  });

});
