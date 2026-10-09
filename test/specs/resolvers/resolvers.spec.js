import { describe, it, expect } from "vitest";
import $RefParser from "../../..";
import helper from "../../utils/helper";
import path from "../../utils/path";
import parsedSchema from "./parsed";
import dereferencedSchema from "./dereferenced";
import { ResolverError, UnmatchedResolverError, JSONParserErrorGroup } from "../../../lib/util/errors";

describe("options.resolve", () => {
  it('should not resolve external links if "resolve.external" is disabled', async () => {
    const schema = await $RefParser
      .dereference(path.abs("specs/resolvers/resolvers.yaml"), { resolve: { external: false }});
    expect(schema).toEqual(parsedSchema);
  });

  it("should throw an error for unrecognized protocols", async () => {
    try {
      await $RefParser.dereference(path.abs("specs/resolvers/resolvers.yaml"));
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).toBeInstanceOf(SyntaxError);
      expect(err.message).toBe('Unable to resolve $ref pointer "foo://bar.baz"');
    }
  });

  it("should use a custom resolver with static values", async () => {
    const schema = await $RefParser
      .dereference(path.abs("specs/resolvers/resolvers.yaml"), {
        resolve: {
          // A custom resolver for "foo://" URLs
          foo: {
            canRead: /^foo\:\/\//i,
            read: { bar: { baz: "hello world" }}
          }
        }
      });
    expect(schema).toEqual(dereferencedSchema);
  });

  it("should use a custom resolver that returns a value", async () => {
    const schema = await $RefParser
      .dereference(path.abs("specs/resolvers/resolvers.yaml"), {
        resolve: {
          // A custom resolver for "foo://" URLs
          foo: {
            canRead: /^foo\:\/\//i,
            read (_file) {
              return { bar: { baz: "hello world" }};
            }
          }
        }
      });
    expect(schema).toEqual(dereferencedSchema);
  });

  it("should use a custom resolver that calls a callback", async () => {
    const schema = await $RefParser
      .dereference(path.abs("specs/resolvers/resolvers.yaml"), {
        resolve: {
          // A custom resolver for "foo://" URLs
          foo: {
            canRead: /^foo\:\/\//i,
            read (_file, callback) {
              callback(null, { bar: { baz: "hello world" }});
            }
          }
        }
      });
    expect(schema).toEqual(dereferencedSchema);
  });

  if (typeof Promise === "function") {
    it("should use a custom resolver that returns a promise", async () => {
      const schema = await $RefParser
        .dereference(path.abs("specs/resolvers/resolvers.yaml"), {
          resolve: {
            // A custom resolver for "foo://" URLs
            foo: {
              canRead: /^foo\:\/\//i,
              read (_file) {
                return Promise.resolve({ bar: { baz: "hello world" }});
              }
            }
          }
        });
      expect(schema).toEqual(dereferencedSchema);
    });
  }

  it("should continue resolving if a custom resolver fails", async () => {
    const schema = await $RefParser
      .dereference(path.abs("specs/resolvers/resolvers.yaml"), {
        resolve: {
          // A custom resolver that always fails
          badResolver: {
            order: 1,
            canRead: true,
            read (_file) {
              throw new Error("BOMB!!!");
            }
          },
          // A custom resolver for "foo://" URLs
          foo: {
            canRead: /^foo\:\/\//i,
            read: { bar: { baz: "hello world" }}
          }
        }
      });
    expect(schema).toEqual(dereferencedSchema);
  });

  it("should normalize errors thrown by resolvers", async () => {
    try {
      await $RefParser.dereference({ $ref: path.abs("specs/resolvers/resolvers.yaml") }, {
        resolve: {
          // A custom resolver that always fails
          file: {
            order: 1,
            canRead: true,
            parse () {
              throw new Error("Woops");
            }
          }
        }
      });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).toBeInstanceOf(ResolverError);
      expect(err.message).toContain("Error opening file");
    }
  });

  it("should throw an error if no resolver returned a result", async () => {
    try {
      await $RefParser.dereference(path.rel("specs/resolvers/resolvers.yaml"), {
        resolve: {
          http: false,
          file: {
            order: 1,
            canRead: true,
            read () {

            }
          }
        }
      });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      // would time out otherwise
      expect(err).toBeInstanceOf(ResolverError);
    }
  });

  it("should throw a grouped error if no resolver can be matched and continueOnError is true", async () => {
    const parser = new $RefParser();
    try {
      await parser.dereference(path.abs("specs/resolvers/resolvers.yaml"), {
        resolve: {
          file: false,
          http: false,
        },
        continueOnError: true,
      });
      helper.shouldNotGetCalled();
    }
    catch (err) {
      expect(err).toBeInstanceOf(JSONParserErrorGroup);
      expect(err.errors.length).toBe(1);
      expect(err.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: UnmatchedResolverError.name,
          message: expect.toSatisfy(message => message.startsWith("Could not find resolver for")),
          path: [],
          source: expect.toSatisfy(message => message.endsWith("specs/resolvers/resolvers.yaml")),
        }),
      ]));
    }
  });
});
