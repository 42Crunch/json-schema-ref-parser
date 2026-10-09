import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { host } from "@jsdevtools/host-environment";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";

describe("Blank files", () => {
  let windowOnError, testDone;

  beforeEach(() => {
    // Some old Webkit browsers throw an error when downloading zero-byte files.
    windowOnError = host.global.onerror;
    host.global.onerror = function () {
      testDone();
      return true;
    };
  });

  afterEach(() => {
    host.global.onerror = windowOnError;
  });

  describe("main file", () => {
    it("should throw an error for a blank YAML file", async () => {
      try {
        await $RefParser.parse(path.rel("specs/blank/files/blank.yaml"));
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(SyntaxError);
        expect(err.message).toContain("blank/files/blank.yaml");
        expect(err.message).toContain("is not a valid JSON Schema");
      }
    });

    it('should throw a different error if "parse.yaml.allowEmpty" is disabled', async () => {
      try {
        await $RefParser.parse(path.rel("specs/blank/files/blank.yaml"), { parse: { yaml: { allowEmpty: false }}});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(SyntaxError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("blank/files/blank.yaml");
        expect(err.message).toContain("Parsed value is empty");
      }
    });

    it("should throw an error for a blank JSON file", async () => {
      try {
        await $RefParser.parse(path.rel("specs/blank/files/blank.json"), { parse: { json: { allowEmpty: false }}});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(SyntaxError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("blank/files/blank.json");
      }
    });
  });

  describe("referenced files", () => {
    it("should parse successfully", async () => {
      let schema = await $RefParser.parse(path.rel("specs/blank/blank.yaml"));
      expect(schema).toEqual(parsedSchema.schema);
    });

    it("should resolve successfully", helper.testResolve(
      path.rel("specs/blank/blank.yaml"),
      path.abs("specs/blank/blank.yaml"), parsedSchema.schema,
      path.abs("specs/blank/files/blank.yaml"), parsedSchema.yaml,
      path.abs("specs/blank/files/blank.json"), parsedSchema.json,
      path.abs("specs/blank/files/blank.txt"), parsedSchema.text,
      path.abs("specs/blank/files/blank.png"), parsedSchema.binary,
      path.abs("specs/blank/files/blank.foo"), parsedSchema.unknown
    ));

    it("should dereference successfully", async () => {
      let schema = await $RefParser.dereference(path.rel("specs/blank/blank.yaml"));
      schema.binary = helper.convertNodeBuffersToPOJOs(schema.binary);
      expect(schema).toEqual(dereferencedSchema);
    });

    it("should bundle successfully", async () => {
      let schema = await $RefParser.bundle(path.rel("specs/blank/blank.yaml"));
      schema.binary = helper.convertNodeBuffersToPOJOs(schema.binary);
      expect(schema).toEqual(dereferencedSchema);
    });

    it('should throw an error if "allowEmpty" is disabled', async () => {
      try {
        await $RefParser.dereference(path.rel("specs/blank/blank.yaml"), { parse: { binary: { allowEmpty: false }}});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(SyntaxError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("blank/files/blank.png");
        expect(err.message).toContain("Parsed value is empty");
      }
    });
  });
});
