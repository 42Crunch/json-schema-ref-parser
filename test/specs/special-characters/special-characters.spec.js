import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import { createRequire } from "module";

// Vite can't import modules whose path contains "%" or "#", so load these fixtures natively
const require = createRequire(import.meta.url);
const parsedSchema = require("../__({[ % & $ # @ ` ~ ,)}]__/parsed");
const dereferencedSchema = require("../__({[ % & $ # @ ` ~ ,)}]__/dereferenced");

describe("File names with special characters", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/__({[ % & $ # @ ` ~ ,)}]__/__({[ % & $ # @ ` ~ ,)}]__.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/__({[ % & $ # @ ` ~ ,)}]__/__({[ % & $ # @ ` ~ ,)}]__.yaml")]);
  });

  it("should resolve successfully", helper.testResolve(
    path.rel("specs/__({[ % & $ # @ ` ~ ,)}]__/__({[ % & $ # @ ` ~ ,)}]__.yaml"),
    path.abs("specs/__({[ % & $ # @ ` ~ ,)}]__/__({[ % & $ # @ ` ~ ,)}]__.yaml"), parsedSchema.schema,
    path.abs("specs/__({[ % & $ # @ ` ~ ,)}]__/__({[ % & $ # @ ` ~ ,)}]__/__({[ % & $ # @ ` ~ ,)}]__.json"), parsedSchema.file
  ));

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/__({[ % & $ # @ ` ~ ,)}]__/__({[ % & $ # @ ` ~ ,)}]__.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).toBe(false);
  });

  it("should bundle successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.bundle(path.rel("specs/__({[ % & $ # @ ` ~ ,)}]__/__({[ % & $ # @ ` ~ ,)}]__.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
  });
});
