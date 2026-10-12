import { describe, it, expect } from "vitest";
import { host } from "@jsdevtools/host-environment";
import $RefParser from "../../../lib";
import helper from "../../utils/helper";
import path from "../../utils/path";
import { JSONParserErrorGroup, ParserError, ResolverError } from "../../../lib/util/errors";

describe("Invalid syntax", () => {
  describe("in main file", () => {
    it("should throw an error for an invalid file path", async () => {
      try {
        await $RefParser.dereference("this file does not exist");
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(ResolverError);
        if (host.node) {
          expect(err.ioErrorCode).toBe("ENOENT");
          expect(err.message).toContain("Error opening file ");
        }
      }
    });

    it("should throw an error for an invalid YAML file", async () => {
      try {
        await $RefParser.dereference(path.rel("specs/invalid/invalid.yaml"));
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(ParserError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("invalid/invalid.yaml");
      }
    });

    it("should throw an error for an invalid JSON file", async () => {
      try {
        await $RefParser.dereference(path.rel("specs/invalid/invalid.json"));
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(ParserError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("invalid/invalid.json");
      }
    });

    it("should throw an error for an invalid JSON file with YAML disabled", async () => {
      try {
        await $RefParser.dereference(path.rel("specs/invalid/invalid.json"), { parse: { yaml: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(ParserError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("invalid/invalid.json");
      }
    });

    it("should throw an error for an invalid YAML file with JSON and YAML disabled", async () => {
      try {
        await $RefParser.dereference(path.rel("specs/invalid/invalid.yaml"), { parse: { yaml: false, json: false }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(SyntaxError);
        expect(err.message).toContain('invalid/invalid.yaml" is not a valid JSON Schema');
      }
    });

    describe("when continueOnError is true", () => {
      it("should throw a grouped error for an invalid file path", async () => {
        const parser = new $RefParser();
        try {
          await parser.dereference("this file does not exist", { continueOnError: true });
          helper.shouldNotGetCalled();
        }
        catch (err) {
          expect(err).toBeInstanceOf(JSONParserErrorGroup);
          expect(err.files).toBe(parser);
          expect(err.message).toContain("1 error occurred while reading '");
          expect(err.message).toContain("this file does not exist'");
          expect(err.errors.length).toBe(1);
          expect(err.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
              name: ResolverError.name,
              message: expect.toSatisfy(message => message.startsWith("Error opening file") || message.endsWith("HTTP ERROR 404")),
              path: [],
              source: expect.toSatisfy(message => message.endsWith("this file does not exist") || message.startsWith("http://localhost")),
            })
          ]));
        }
      });

      it("should throw a grouped error for an invalid YAML file", async () => {
        const parser = new $RefParser();
        try {
          await parser.dereference(path.rel("specs/invalid/invalid.yaml"), { continueOnError: true });
          helper.shouldNotGetCalled();
        }
        catch (err) {
          expect(err).toBeInstanceOf(JSONParserErrorGroup);
          expect(err.files).toBe(parser);
          expect(err.message).toBe(`1 error occurred while reading '${path.abs("specs/invalid/invalid.yaml")}'`);
          expect(err.errors.length).toBe(1);
          expect(err.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
              name: ParserError.name,
              message: expect.toSatisfy(message => (
                message.includes("invalid.yaml: Flow sequence in block collection must be sufficiently indented and end with a ] (2:1)")
              )),
              path: [],
              source: expect.toSatisfy(message => message.endsWith("test/specs/invalid/invalid.yaml")),
            }),
          ]));
        }
      });

      it("should throw a grouped error for an invalid JSON file", async () => {
        const parser = new $RefParser();
        try {
          await parser.dereference(path.rel("specs/invalid/invalid.json"), { continueOnError: true });
          helper.shouldNotGetCalled();
        }
        catch (err) {
          expect(err).toBeInstanceOf(JSONParserErrorGroup);
          expect(err.files).toBe(parser);
          expect(err.message).toBe(`1 error occurred while reading '${path.abs("specs/invalid/invalid.json")}'`);
          expect(err.errors.length).toBe(1);
          expect(err.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
              name: ParserError.name,
              message: expect.toSatisfy(message => (
                message.includes("invalid.json: Flow map must end with a } (2:1)")
              )),
              path: [],
              source: expect.toSatisfy(message => message.endsWith("test/specs/invalid/invalid.json")),
            })
          ]));
        }
      });

      it("should throw a grouped error for an invalid JSON file with YAML disabled", async () => {
        const parser = new $RefParser();
        try {
          await parser.dereference(path.rel("specs/invalid/invalid.json"), { continueOnError: true, parse: { yaml: false }});
          helper.shouldNotGetCalled();
        }
        catch (err) {
          expect(err).toBeInstanceOf(JSONParserErrorGroup);
          expect(err.files).toBe(parser);
          expect(err.message).toBe(`1 error occurred while reading '${path.abs("specs/invalid/invalid.json")}'`);
          expect(err.errors.length).toBe(1);
          expect(err.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
              name: ParserError.name,
              message: expect.toSatisfy(message => (
                message.includes("invalid.json: Unexpected end of JSON input") ||
                message.includes("invalid.json: Expected property name or '}' in JSON") ||                    // Node 20+
                message.includes("invalid.json: JSON.parse: end of data while reading object contents") ||    // Firefox
                message.includes("invalid.json: JSON Parse error: Expected '}'") ||                           // Safari
                message.includes("invalid.json: JSON.parse Error: Invalid character") ||                      // Edge
                message.includes("invalid.json: Syntax error")                                                // IE
              )),
              path: [],
              source: expect.toSatisfy(message => message.endsWith("test/specs/invalid/invalid.json")),
            })
          ]));
        }
      });

      it("should not throw an error for an invalid YAML file with JSON and YAML disabled", async () => {
        const parser = new $RefParser();
        const result = await parser.dereference(path.rel("specs/invalid/invalid.yaml"), { continueOnError: true, parse: { yaml: false, json: false }});
        expect(result).toBe(null);
      });
    });
  });

  describe("in referenced files", () => {
    it("should throw an error for an invalid YAML file", async () => {
      try {
        await $RefParser.dereference({ foo: { $ref: path.rel("specs/invalid/invalid.yaml") }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(ParserError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("invalid/invalid.yaml");
      }
    });

    it("should throw an error for an invalid JSON file", async () => {
      try {
        await $RefParser.dereference({ foo: { $ref: path.rel("specs/invalid/invalid.json") }});
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(ParserError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("invalid/invalid.json");
      }
    });

    it("should throw an error for an invalid JSON file with YAML disabled", async () => {
      try {
        await $RefParser.dereference({ foo: { $ref: path.rel("specs/invalid/invalid.json") }}, {
          parse: { yaml: false }
        });
        helper.shouldNotGetCalled();
      }
      catch (err) {
        expect(err).toBeInstanceOf(ParserError);
        expect(err.message).toContain("Error parsing ");
        expect(err.message).toContain("invalid/invalid.json");
      }
    });

    it("should throw a grouped error for an invalid YAML file with JSON and YAML disabled", async () => {
      const schema = await $RefParser
        .dereference({ foo: { $ref: path.rel("specs/invalid/invalid.yaml") }}, {
          parse: { yaml: false, json: false }
        });

      // Because the JSON and YAML parsers were disabled, the invalid YAML file got parsed as plain text
      expect(schema).toEqual({
        foo: "foo: [bar\n"
      });
    });

    describe("when continueOnError is true", () => {
      it("should throw a grouped error for an invalid file path", async () => {
        try {
          const parser = new $RefParser();
          await parser.dereference({ foo: { $ref: "this file does not exist" }}, { continueOnError: true });
          helper.shouldNotGetCalled();
        }
        catch (err) {
          expect(err).toBeInstanceOf(JSONParserErrorGroup);
          expect(err.files.$refs._root$Ref.value).toEqual({ foo: null });
          expect(err.errors.length).toBe(1);
          expect(err.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
              name: ResolverError.name,
              message: expect.toSatisfy(message => message.startsWith("Error opening file") || message.endsWith("HTTP ERROR 404")),
              path: ["foo"],
              source: expect.toSatisfy(message => message.endsWith("/test/") || message.startsWith("http://localhost")),
            })
          ]));
        }
      });

      it("should throw a grouped error for an invalid YAML file", async () => {
        try {
          const parser = new $RefParser();
          await parser.dereference({ foo: { $ref: path.rel("specs/invalid/invalid.yaml") }}, { continueOnError: true });
          helper.shouldNotGetCalled();
        }
        catch (err) {
          expect(err).toBeInstanceOf(JSONParserErrorGroup);
          expect(err.files.$refs._root$Ref.value).toEqual({ foo: null });
          expect(err.errors.length).toBe(1);
          expect(err.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
              name: ParserError.name,
              message: expect.toSatisfy(message => (
                message.includes("invalid.yaml: Flow sequence in block collection must be sufficiently indented and end with a ] (2:1)")
              )),
              path: ["foo"],
              source: expect.toSatisfy(message => message.endsWith("/test/") || message.startsWith("http://localhost")),
            }),
          ]));
        }
      });

      it("should throw a grouped error for an invalid JSON file", async () => {
        try {
          const parser = new $RefParser();
          await parser.dereference({ foo: { $ref: path.rel("specs/invalid/invalid.json") }}, { continueOnError: true });
          helper.shouldNotGetCalled();
        }
        catch (err) {
          expect(err).toBeInstanceOf(JSONParserErrorGroup);
          expect(err.files.$refs._root$Ref.value).toEqual({ foo: null });
          expect(err.errors.length).toBe(1);
          expect(err.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
              name: ParserError.name,
              message: expect.toSatisfy(message => (
                message.includes("invalid.json: Flow map must end with a } (2:1)")
              )),
              path: ["foo"],
              source: expect.toSatisfy(message => message.endsWith("/test/") || message.startsWith("http://localhost")),
            })
          ]));
        }
      });

      it("should throw a grouped error for an invalid JSON file with YAML disabled", async () => {
        try {
          const parser = new $RefParser();
          await parser.dereference({ foo: { $ref: path.rel("specs/invalid/invalid.json") }}, { continueOnError: true, parse: { yaml: false }});
          helper.shouldNotGetCalled();
        }
        catch (err) {
          expect(err).toBeInstanceOf(JSONParserErrorGroup);
          expect(err.files.$refs._root$Ref.value).toEqual({ foo: null });
          expect(err.errors.length).toBe(1);
          expect(err.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
              name: ParserError.name,
              message: expect.toSatisfy(message => (
                message.includes("invalid.json: Unexpected end of JSON input") ||
                message.includes("invalid.json: Expected property name or '}' in JSON") ||                    // Node 20+
                message.includes("invalid.json: JSON.parse: end of data while reading object contents") ||    // Firefox
                message.includes("invalid.json: JSON Parse error: Expected '}'") ||                           // Safari
                message.includes("invalid.json: JSON.parse Error: Invalid character") ||                      // Edge
                message.includes("invalid.json: Syntax error")                                                // IE
              )),
              path: ["foo"],
              source: expect.toSatisfy(message => message.endsWith("/test/") || message.startsWith("http://localhost")),
            })
          ]));
        }
      });

      it("should not throw an error for an invalid YAML file with JSON and YAML disabled", async () => {
        const parser = new $RefParser();
        const result = await parser.dereference({ foo: { $ref: path.rel("specs/invalid/invalid.yaml") }}, { continueOnError: true, parse: { yaml: false, json: false }});
        expect(result).toEqual({ foo: "foo: [bar\n" });
      });
    });
  });
});
