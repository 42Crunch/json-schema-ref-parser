import { describe, it, expect } from "vitest";
import $RefParser from "../../lib";
import helper from "../utils/helper";
import path from "../utils/path";
import { ParserError } from "../../lib/util/errors";

describe("Callback & Promise syntax", () => {
  for (let method of ["parse", "resolve", "dereference", "bundle"]) {
    describe(method + " method", () => {
      it("should call the callback function upon success", testCallbackSuccess(method));
      it("should call the callback function upon failure", testCallbackError(method));
      it("should resolve the Promise upon success", testPromiseSuccess(method));
      it("should reject the Promise upon failure", testPromiseError(method));
    });
  }

  function testCallbackSuccess (method) {
    return () => new Promise((resolve, reject) => {
      let parser = new $RefParser();
      parser[method](path.rel("specs/internal/internal.yaml"), (err, result) => {
        try {
          expect(err).toBe(null);
          expect(result).toBeTypeOf("object");

          if (method === "resolve") {
            expect(result).toBe(parser.$refs);
          }
          else {
            expect(result).toBe(parser.schema);
          }
          resolve();
        }
        catch (e) {
          reject(e);
        }
      });
    });
  }

  function testCallbackError (method) {
    return () => new Promise((resolve, reject) => {
      $RefParser[method](path.rel("specs/invalid/invalid.yaml"), (err, result) => {
        try {
          expect(err).toBeInstanceOf(ParserError);
          expect(result).toBe(undefined);
          resolve();
        }
        catch (e) {
          reject(e);
        }
      });
    });
  }

  function testPromiseSuccess (method) {
    return function () {
      let parser = new $RefParser();
      return parser[method](path.rel("specs/internal/internal.yaml"))
        .then((result) => {
          expect(result).toBeTypeOf("object");

          if (method === "resolve") {
            expect(result).toBe(parser.$refs);
          }
          else {
            expect(result).toBe(parser.schema);
          }
        });
    };
  }

  function testPromiseError (method) {
    return function () {
      return $RefParser[method](path.rel("specs/invalid/invalid.yaml"))
        .then(helper.shouldNotGetCalled)
        .catch((err) => {
          expect(err).toBeInstanceOf(ParserError);
        });
    };
  }
});
