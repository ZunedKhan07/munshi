import test from "node:test";
import assert from "node:assert/strict";
import {
  parseHinglishNumber,
  normalizeDigits,
  normalizeUnit,
} from "../src/utils/numbers.js";
test("parses digits and Devanagari digits", () => {
  assert.equal(parseHinglishNumber("250"), 250);
  assert.equal(parseHinglishNumber("१२३"), 123);
  assert.equal(normalizeDigits("१२"), "12");
});
test("parses common Hinglish values", () => {
  assert.equal(parseHinglishNumber("dedh"), 1.5);
  assert.equal(parseHinglishNumber("dhai"), 2.5);
  assert.equal(parseHinglishNumber("sawa"), 1.25);
  assert.equal(parseHinglishNumber("paune do"), 1.75);
  assert.equal(parseHinglishNumber("sau pachas"), 150);
  assert.equal(parseHinglishNumber("do hazaar"), 2000);
  assert.equal(parseHinglishNumber("do lakh"), 200000);
});
test("normalizes units", () => {
  assert.equal(normalizeUnit("kilo"), "kg");
  assert.equal(normalizeUnit("darjan"), "dozen");
});
