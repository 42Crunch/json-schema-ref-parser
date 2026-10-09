import { describe, it, expect } from "vitest";
import $RefParser from "../../../lib";
import { JSONParserErrorGroup, MissingPointerError } from "../../../lib/util/errors";
import helper from "../../utils/helper";
import path from "../../utils/path";

describe("Schema with missing pointers", () => {
  it("should throw an error for missing pointer", async () => {
    try {
      await $RefParser.dereference({ foo: { $ref: "#/baz" }});
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).toBeInstanceOf(MissingPointerError);
      expect(err.message).toContain("Token \"baz\" does not exist.");
    }
  });

  it("should throw an error for missing pointer in external file", async () => {
    try {
      await $RefParser.dereference({ foo: { $ref: path.abs("specs/missing-pointers/external-from-internal.yaml") }});
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).toBeInstanceOf(MissingPointerError);
      expect(err.message).toContain("Token \"external\" does not exist.");
    }
  });

  describe("when continueOnError is true", () => {
    it("should throw a grouped error for missing pointer", async () => {
      const parser = new $RefParser();
      try {
        await parser.dereference({ foo: { $ref: "#/baz" }}, { continueOnError: true });
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(JSONParserErrorGroup);
        expect(err.files).toBe(parser);
        expect(err.files.$refs._root$Ref.value).toEqual({ foo: null });
        expect(err.message).toContain("1 error occurred while reading '");
        expect(err.errors).toEqual(expect.arrayContaining([
          expect.objectContaining({
            name: MissingPointerError.name,
            message: "Token \"baz\" does not exist.",
            path: [],
            source: expect.toSatisfy(message => message.endsWith("/test/") || message.startsWith("http://localhost")),
          })
        ]));
      }
    });

    it("should throw an error for missing pointer in external file", async () => {
      const parser = new $RefParser();
      try {
        await parser.dereference({ foo: { $ref: path.abs("specs/missing-pointers/external-from-internal.yaml") }}, { continueOnError: true });
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(JSONParserErrorGroup);
        expect(err.files).toBe(parser);
        expect(err.files.$refs._root$Ref.value).toEqual({
          foo: {
            internal1: null,
            internal2: null,
          }
        });
        expect(err.message).toContain("3 errors occurred while reading '");
        expect(err.errors).toHaveLength(3);
        expect(err.errors).toEqual(expect.arrayContaining([
          expect.objectContaining({
            name: MissingPointerError.name,
            message: "Token \"external\" does not exist.",
            path: [],
            source: expect.toSatisfy(message => message.endsWith("missing-pointers/external-from-internal.yaml") || message.startsWith("http://localhost")),
          })
        ]));
      }
    });
  });
});
