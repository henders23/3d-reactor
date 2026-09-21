import test from "node:test";
import assert from "node:assert/strict";
import {
  defaults,
  initialState,
  run,
  step,
  outsideRange,
} from "../src/simulation.ts";
test("initial equilibrium conserves the coupled heat balance for five minutes", () => {
  const s = run(defaults, 300);
  assert.ok(Math.abs(s.fuel - 600) < 1e-8);
  assert.ok(Math.abs(s.coolant - 310) < 1e-8);
  assert.ok(Math.abs(s.thermal - s.removed) < 1e-8);
  assert.equal(s.neutrons, 1);
});
test("rod insertion initially reduces fission; temperatures lag behind power", () => {
  const s = run({ ...defaults, rods: 65 }, 1);
  assert.ok(s.neutrons < 0.95);
  assert.ok(s.fuel > 595);
  assert.ok(s.coolant > 309);
});
test("reduced flow raises fuel temperature while feedback reduces power", () => {
  const s = run({ ...defaults, flow: 65 }, 20);
  assert.ok(s.fuel > 610);
  assert.ok(s.neutrons < 1);
  assert.ok(!outsideRange(s));
});
test("full insertion remains subcritical after cooling; decay heat persists", () => {
  const s = run({ ...defaults, rods: 100 }, 120);
  assert.ok(s.neutrons < 0.002);
  assert.ok(s.thermal > 0.01);
  assert.ok(s.decay.reduce((a, b) => a + b, 0) > s.neutrons);
  const later = run({ ...defaults, rods: 100 }, 600);
  assert.ok(later.neutrons < 1e-7);
  assert.ok(later.thermal > 0);
  assert.ok(later.thermal < s.thermal);
});
test("higher heat removal initially cools the coolant", () => {
  const s = run({ ...defaults, sink: 120 }, 3);
  assert.ok(s.coolant < 310);
});
test("substepping produces consistent outcomes independent of display cadence", () => {
  let a = initialState(),
    b = initialState();
  for (let i = 0; i < 300; i++) a = step(a, { ...defaults, rods: 70 }, 0.1);
  for (let i = 0; i < 60; i++) b = step(b, { ...defaults, rods: 70 }, 0.5);
  assert.ok(Math.abs(a.thermal - b.thermal) < 0.0001);
  assert.ok(Math.abs(a.fuel - b.fuel) < 0.01);
});
test("representative allowed-control combinations remain finite until the validity boundary", () => {
  for (const rods of [0, 50, 100])
    for (const flow of [30, 100, 130])
      for (const sink of [50, 100, 120]) {
        let s = initialState();
        for (let i = 0; i < 600; i++) {
          s = step(s, { rods, flow, sink }, 0.2);
          assert.ok(
            [s.fuel, s.coolant, s.thermal, s.neutrons].every(Number.isFinite),
          );
          assert.ok(s.neutrons >= 0);
          if (outsideRange(s)) break;
        }
      }
});
test("reset creates independent precursor and decay inventories", () => {
  const a = initialState(),
    b = initialState();
  a.decay[0] = 99;
  assert.equal(b.decay[0], 0.01);
});
