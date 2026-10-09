import { describe, it, expect } from "vitest";
import { host } from "@jsdevtools/host-environment";
import $RefParser from "../../lib";
import helper from "../utils/helper";
import path from "../utils/path";
import parsedSchema from "./external/parsed";
import dereferencedSchema from "./external/dereferenced";
import bundledSchema from "./external/bundled";

describe("$Refs object", () => {
  describe("paths", () => {
    it("should only contain the main file when calling `parse()`", async () => {
      let parser = new $RefParser();
      await parser.parse(path.abs("specs/external/external.yaml"));
      let paths = parser.$refs.paths();
      expect([...paths].sort()).toEqual([
        path.abs("specs/external/external.yaml")
      ].sort());
    });

    it("should contain all files when calling `resolve()`", async () => {
      let parser = new $RefParser();
      const $refs = await parser.resolve(path.abs("specs/external/external.yaml"));
      expect($refs).toBe(parser.$refs);
      let paths = $refs.paths();
      expect([...paths].sort()).toEqual([
        path.abs("specs/external/external.yaml"),
        path.abs("specs/external/definitions/definitions.json"),
        path.abs("specs/external/definitions/name.yaml"),
        path.abs("specs/external/definitions/required-string.yaml")
      ].sort());
    });

    it("should return only local files", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      let paths = $refs.paths("file");
      if (host.node) {
        expect([...paths].sort()).toEqual([
          path.abs("specs/external/external.yaml"),
          path.abs("specs/external/definitions/definitions.json"),
          path.abs("specs/external/definitions/name.yaml"),
          path.abs("specs/external/definitions/required-string.yaml")
        ].sort());
      }
      else {
        expect(paths).toEqual([]);
      }
    });

    it("should return only URLs", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      let paths = $refs.paths(["http"]);
      if (host.browser) {
        expect([...paths].sort()).toEqual([
          path.url("specs/external/external.yaml"),
          path.url("specs/external/definitions/definitions.json"),
          path.url("specs/external/definitions/name.yaml"),
          path.url("specs/external/definitions/required-string.yaml")
        ].sort());
      }
      else {
        expect(paths).toEqual([]);
      }
    });
  });

  describe("values", () => {
    it("should be the same as `toJSON()`", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      expect($refs.values).toBe($refs.toJSON);
    });

    it("should return the paths and values of all resolved files", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      let expected = {};
      expected[path.abs("specs/external/external.yaml")] = parsedSchema.schema;
      expected[path.abs("specs/external/definitions/definitions.json")] = parsedSchema.definitions;
      expected[path.abs("specs/external/definitions/name.yaml")] = parsedSchema.name;
      expected[path.abs("specs/external/definitions/required-string.yaml")] = parsedSchema.requiredString;
      let values = $refs.values();
      expect(values).toEqual(expected);
    });

    it("should return the paths and values of all dereferenced files", async () => {
      let parser = new $RefParser();
      await parser.dereference(path.abs("specs/external/external.yaml"));
      let expected = {};
      expected[path.abs("specs/external/external.yaml")] = dereferencedSchema;
      expected[path.abs("specs/external/definitions/definitions.json")] = dereferencedSchema.definitions;
      expected[path.abs("specs/external/definitions/name.yaml")] = dereferencedSchema.definitions.name;
      expected[path.abs("specs/external/definitions/required-string.yaml")] = dereferencedSchema.definitions["required string"];
      let values = parser.$refs.values();
      expect(values).toEqual(expected);
    });

    it("should return the paths and values of all bundled files", async () => {
      let parser = new $RefParser();
      await parser.bundle(path.abs("specs/external/external.yaml"));
      let expected = {};
      expected[path.abs("specs/external/external.yaml")] = bundledSchema;
      expected[path.abs("specs/external/definitions/definitions.json")] = bundledSchema.definitions;
      expected[path.abs("specs/external/definitions/name.yaml")] = bundledSchema.definitions.name;
      expected[path.abs("specs/external/definitions/required-string.yaml")] = bundledSchema.definitions["required string"];
      let values = parser.$refs.values();
      expect(values).toEqual(expected);
    });

    it("should return only local files and values", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      let values = $refs.values("file");
      if (host.node) {
        let expected = {};
        expected[path.abs("specs/external/external.yaml")] = parsedSchema.schema;
        expected[path.abs("specs/external/definitions/definitions.json")] = parsedSchema.definitions;
        expected[path.abs("specs/external/definitions/name.yaml")] = parsedSchema.name;
        expected[path.abs("specs/external/definitions/required-string.yaml")] = parsedSchema.requiredString;
        values = $refs.values();
        expect(values).toEqual(expected);
      }
      else {
        expect(values).toEqual({});
      }
    });

    it("should return only URLs and values", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      let values = $refs.values(["http"]);
      if (host.browser) {
        let expected = {};
        expected[path.url("specs/external/external.yaml")] = parsedSchema.schema;
        expected[path.url("specs/external/definitions/definitions.json")] = parsedSchema.definitions;
        expected[path.url("specs/external/definitions/name.yaml")] = parsedSchema.name;
        expected[path.url("specs/external/definitions/required-string.yaml")] = parsedSchema.requiredString;
        values = $refs.values();
        expect(values).toEqual(expected);
      }
      else {
        expect(values).toEqual({});
      }
    });
  });

  describe("exists", () => {
    it("should work with absolute paths", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      expect($refs.exists(path.abs("specs/external/external.yaml"))).toBe(true);
      expect($refs.exists(path.abs("specs/external/definitions/definitions.json"))).toBe(true);
      expect($refs.exists(path.abs("specs/external/definitions/name.yaml"))).toBe(true);
      expect($refs.exists(path.abs("specs/external/definitions/required-string.yaml"))).toBe(true);
    });

    it("should work with relative paths", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      expect($refs.exists("external.yaml")).toBe(true);
      expect($refs.exists("definitions/definitions.json")).toBe(true);
      expect($refs.exists("definitions/name.yaml")).toBe(true);
      expect($refs.exists("definitions/required-string.yaml")).toBe(true);
    });

    it("should return false if the $ref does not exist", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      expect($refs.exists("foo bar")).toBe(false);
    });
  });

  describe("get", () => {
    it("should work with absolute paths", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      expect($refs.get(path.abs("specs/external/external.yaml"))).toEqual(parsedSchema.schema);
      expect($refs.get(path.abs("specs/external/definitions/definitions.json"))).toEqual(parsedSchema.definitions);
      expect($refs.get(path.abs("specs/external/definitions/name.yaml"))).toEqual(parsedSchema.name);
      expect($refs.get(path.abs("specs/external/definitions/required-string.yaml"))).toEqual(parsedSchema.requiredString);
    });

    it("should work with relative paths", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      expect($refs.get("external.yaml")).toEqual(parsedSchema.schema);
      expect($refs.get("definitions/definitions.json")).toEqual(parsedSchema.definitions);
      expect($refs.get("definitions/name.yaml")).toEqual(parsedSchema.name);
      expect($refs.get("definitions/required-string.yaml")).toEqual(parsedSchema.requiredString);
    });

    it("should get the entire file if there is no hash", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      let value = $refs.get("definitions/name.yaml");
      expect(value).toEqual(parsedSchema.name);
    });

    it("should get the entire file if the hash is empty", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      let value = $refs.get("definitions/name.yaml#");
      expect(value).toEqual(parsedSchema.name);
    });

    it('should try to get an empty key if the hash is "#/"', async () => {
      const $refs = await $RefParser.resolve(path.abs("specs/external/external.yaml"));

      try {
        $refs.get("definitions/name.yaml#/");
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Token "" does not exist.');
      }
    });

    it("should resolve values across multiple files if necessary", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      expect($refs.get("external.yaml#/properties/name/properties/first")).toEqual({
        title: "required string",
        type: "string",
        minLength: 1
      });
      expect($refs.get("external.yaml#/properties/name/properties/first/title")).toBe("required string");
    });

    it("should throw an error if the file does not exist", async () => {
      const $refs = await $RefParser.resolve(path.abs("specs/external/external.yaml"));

      try {
        $refs.get("foo-bar.yaml#/some/value");
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('Error resolving $ref pointer "foo-bar.yaml#/some/value".');
        expect(err.message).toContain('foo-bar.yaml" not found.');
      }
    });

    it("should throw an error if the JSON Pointer path does not exist", async () => {
      const $refs = await $RefParser.resolve(path.abs("specs/external/external.yaml"));

      try {
        $refs.get("external.yaml#/foo/bar");
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Token "foo" does not exist.');
      }
    });
  });

  describe("set", () => {
    it("should work with absolute paths", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      let $ref = path.abs("specs/external/external.yaml") + "#/properties/name";
      $refs.set($ref, { foo: "bar" });
      expect($refs.get("external.yaml#/properties/name")).toEqual({ foo: "bar" });
    });

    it("should work with relative paths", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      $refs.set("external.yaml#/properties/name", { foo: "bar" });
      expect($refs.get("external.yaml#/properties/name")).toEqual({ foo: "bar" });
    });

    it("should resolve values across multiple files if necessary", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      $refs.set("external.yaml#/properties/name/properties/first/title", "foo bar");
      expect($refs.get("external.yaml#/properties/name/properties/first/title")).toBe("foo bar");
    });

    it("should throw an error if the file does not exist", async () => {
      const $refs = await $RefParser.resolve(path.abs("specs/external/external.yaml"));

      try {
        $refs.set("foo-bar.yaml#/some/path", "some value");
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('Error resolving $ref pointer "foo-bar.yaml#/some/path".');
        expect(err.message).toContain('foo-bar.yaml" not found.');
      }
    });

    it("should NOT throw an error if the JSON Pointer path does not exist (it creates the new value instead)", async () => {
      const $refs = await $RefParser
        .resolve(path.abs("specs/external/external.yaml"));
      $refs.set("external.yaml#/foo/bar/baz", { hello: "world" });
      expect($refs.get("external.yaml#/foo/bar/baz")).toEqual({ hello: "world" });
    });
  });

});
