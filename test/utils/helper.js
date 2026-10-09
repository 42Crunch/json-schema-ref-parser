import { expect } from "vitest";
import $RefParser from "../../lib";
import { host } from "@jsdevtools/host-environment";

const helper = {
  /**
   * Throws an error if called.
   */
  shouldNotGetCalled () {
    throw new Error("This function should not have gotten called.");
  },

  /**
   * Tests the {@link $RefParser.resolve} method,
   * and asserts that the given file paths resolve to the given values.
   *
   * @param {string} filePath - The file path that should be resolved
   * @param {...*} [params] - The expected resolved file paths and values
   * @returns {Function}
   */
  testResolve (filePath, params) {
    let parsedSchema = arguments[2];
    let expectedFiles = [], messages = [], actualFiles;

    for (let i = 1; i < arguments.length; i += 2) {
      expectedFiles.push(arguments[i]);
      messages.push(arguments[i + 1]);
    }

    return async () => {
      let parser = new $RefParser();
      let $refs = await parser.resolve(filePath);

      expect(parser.schema).toEqual(parsedSchema);
      expect(parser.$refs).toBe($refs);

      // Resolved file paths
      try {
        expect((actualFiles = $refs.paths()).sort()).toEqual([...expectedFiles].sort());
        if (host.node) {
          expect((actualFiles = $refs.paths(["file"])).sort()).toEqual([...expectedFiles].sort());
          expect($refs.paths("http")).toEqual([]);
        }
        else {
          expect((actualFiles = $refs.paths(["http"])).sort()).toEqual([...expectedFiles].sort());
          expect($refs.paths("file")).toEqual([]);
        }
      }
      catch (e) {
        console.log("Expected Files:", JSON.stringify(expectedFiles, null, 2));
        console.log("Actual Files:", JSON.stringify(actualFiles, null, 2));
        throw e;
      }

      // Resolved values
      let values = $refs.values();
      expect(Object.keys(values).sort()).toEqual([...expectedFiles].sort());
      for (let [i, file] of expectedFiles.entries()) {
        let actual = helper.convertNodeBuffersToPOJOs(values[file]);
        let expected = messages[i];
        expect(actual, file).toEqual(expected);
      }
    };
  },

  /**
   * Converts Buffer objects to POJOs, so they can be compared using Chai
   */
  convertNodeBuffersToPOJOs (value) {
    if (value && (value._isBuffer || (value.constructor && value.constructor.name === "Buffer"))) {
      // Convert Buffers to POJOs for comparison
      value = value.toJSON();

      if (host.node && host.node.version === 0.1) {
        // Node v0.10 serializes buffers differently
        value = { type: "Buffer", data: value };
      }
    }
    return value;
  },

  /**
   * Creates a deep clone of the given value.
   */
  cloneDeep (value) {
    let clone = value;
    if (value && typeof (value) === "object") {
      clone = value instanceof Array ? [] : {};
      let keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        clone[keys[i]] = helper.cloneDeep(value[keys[i]]);
      }
    }
    return clone;
  },
};

export default helper;
