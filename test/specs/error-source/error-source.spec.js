import { describe, it, expect } from "vitest";

import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import { InvalidPointerError, ResolverError, MissingPointerError } from "../../../lib/util/errors";


describe("Report correct error source and path for", () => {
  it("schema with broken reference", async () => {
    const parser = new $RefParser();
    try {
      await parser.dereference({ foo: { bar: { $ref: "I do not exist" }}}, { continueOnError: true });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: ResolverError.name,
          source: expect.toSatisfy(source => typeof source === "string"),
          path: ["foo", "bar"],
          message: expect.toSatisfy(message => typeof message === "string"),
        }),
      ]));
    }
  });

  it("schema with a local reference pointing at property with broken external reference", async () => {
    const parser = new $RefParser();
    try {
      await parser.dereference(path.abs("specs/error-source/broken-external.json"), { continueOnError: true });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: ResolverError.name,
          source: path.unixify(path.abs("specs/error-source/broken-external.json")),
          path: ["components", "schemas", "testSchema", "properties", "test"],
          message: expect.toSatisfy(message => typeof message === "string"),
        }),
      ]));
    }
  });

  it("schema with a missing local pointer and reference pointing at external file with broken external", async () => {
    const parser = new $RefParser();
    try {
      await parser.dereference(path.abs("specs/error-source/invalid-external.json"), { continueOnError: true });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: MissingPointerError.name,
          source: path.unixify(path.abs("specs/error-source/invalid-external.json")),
          path: [],
          message: expect.toSatisfy(message => typeof message === "string"),
        }),
        expect.objectContaining({
          name: ResolverError.name,
          source: path.unixify(path.abs("specs/error-source/broken-external.json")),
          path: ["components", "schemas", "testSchema", "properties", "test"],
          message: expect.toSatisfy(message => typeof message === "string"),
        }),
      ]));
    }
  });

  it("schema with an invalid pointer", async () => {
    const parser = new $RefParser();
    try {
      await parser.dereference(path.abs("specs/error-source/invalid-pointer.json"), { continueOnError: true });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: InvalidPointerError.name,
          source: path.unixify(path.abs("specs/error-source/invalid-pointer.json")),
          path: [],
          message: expect.toSatisfy(message => typeof message === "string"),
        }),
      ]));
    }
  });
});
