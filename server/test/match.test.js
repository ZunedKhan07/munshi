import test from "node:test";
import assert from "node:assert/strict";
import { chooseMatch, escapeRegex } from "../src/utils/match.js";
const rows = [
  { name: "Sharma Ji", aliases: ["Sharmaji", "शर्मा जी"] },
  { name: "Verma Ji", aliases: ["Verma"] },
];
test("fuzzy matches aliases", () => {
  assert.equal(chooseMatch("Sharmaji", rows).status, "match");
});
test("returns none for unrelated text", () => {
  assert.equal(chooseMatch("Potato", rows).status, "none");
});
test("escapes regex metacharacters", () => {
  assert.equal(escapeRegex("a.b"), "a\.b");
});
