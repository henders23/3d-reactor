import test from "node:test";
import assert from "node:assert/strict";
import { checkEquation } from "../src/equations";

test("practice checks the physical result in the requested units, including cooling sign", () => {
  assert.equal(checkEquation("energy", String((900 / 3000) * 100)), "correct");
  assert.equal(checkEquation("energy", "0.3"), "retry");
  assert.equal(checkEquation("neutrons", String(1020 / 1000)), "correct");
  assert.equal(checkEquation("neutrons", "102"), "retry");
  assert.equal(
    checkEquation("control", String((80e6 - 100e6) / 20e6)),
    "correct",
  );
  assert.equal(checkEquation("control", "1"), "retry");
  assert.equal(checkEquation("control", "−1"), "correct");
  assert.equal(
    checkEquation("cooling", String((50 * 4200 * 20) / 1e6)),
    "correct",
  );
  assert.equal(checkEquation("cooling", "4200000"), "retry");
  assert.equal(
    checkEquation("shutdown", String(8 * 2 ** (-60 / 20))),
    "correct",
  );
  assert.equal(checkEquation("shutdown", "0"), "retry");
});
test("empty, non-finite and unit-suffixed entries cannot be mistaken for correct answers", () => {
  for (const input of ["", " "])
    assert.equal(checkEquation("shutdown", input), "empty");
  for (const input of ["NaN", "Infinity", "1e999", "1 MW", "0x1"])
    assert.equal(checkEquation("shutdown", input), "invalid");
  assert.equal(checkEquation("shutdown", "1e0"), "correct");
});
