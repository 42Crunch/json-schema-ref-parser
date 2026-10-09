import { describe, it, expect } from "vitest";
import $RefParser from "../../../lib";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";

describe("Schema with direct circular (recursive) external $refs", () => {
  it("should parse successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.parse(path.rel("specs/circular-external-direct/circular-external-direct-root.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(parsedSchema.schema);
    expect(parser.$refs.paths()).toEqual([path.abs("specs/circular-external-direct/circular-external-direct-root.yaml")]);
    // The "circular" flag should NOT be set
    // (it only gets set by `dereference`)
    expect(parser.$refs.circular).toBe(false);
  });

  it("should dereference successfully", async () => {
    let parser = new $RefParser();
    const schema = await parser.dereference(path.rel("specs/circular-external-direct/circular-external-direct-root.yaml"));
    expect(schema).toBe(parser.schema);
    expect(schema).toEqual(dereferencedSchema);
    // The "circular" flag should be set
    expect(parser.$refs.circular).toBe(true);
  });
});
