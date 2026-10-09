import { describe, it, expect } from "vitest";
import $RefParser from "../../../lib";
import helper from "../../utils/helper";
import path from "../../utils/path";
import { JSONParserErrorGroup, InvalidPointerError } from "../../../lib/util/errors";

describe("Schema with invalid pointers", () => {
  it("should throw an error for an invalid pointer", async () => {
    try {
      await $RefParser.dereference(path.rel("specs/invalid-pointers/invalid.json"));
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).toBeInstanceOf(InvalidPointerError);
      expect(err.message).toContain("Invalid $ref pointer \"f\". Pointers must begin with \"#/\"");
    }
  });

  it("should throw a grouped error for an invalid pointer if continueOnError is true", async () => {
    const parser = new $RefParser();
    try {
      await parser.dereference(path.rel("specs/invalid-pointers/invalid.json"), { continueOnError: true });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).toBeInstanceOf(JSONParserErrorGroup);
      expect(err.files).toBe(parser);
      expect(err.message).toBe(`1 error occurred while reading '${path.abs("specs/invalid-pointers/invalid.json")}'`);
      expect(err.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: InvalidPointerError.name,
          message: "Invalid $ref pointer \"f\". Pointers must begin with \"#/\"",
          path: ["foo"],
          source: path.unixify(path.abs("specs/invalid-pointers/invalid.json")),
        })
      ]));
    }
  });
});
