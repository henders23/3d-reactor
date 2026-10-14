import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  defaults,
  outsideRange,
  sample,
} from "../src/simulation";
import {
  advanceGuided,
  guidedControls,
  guidedEvidence,
  learning,
} from "../src/learning";
import { temperaturePeak } from "../src/science";
test("cooling: fuel temperature peaks where heat in meets heat out, inside the staged chart ranges", () => {
  const controls = guidedControls("cooling");
  let state = initialState();
  const samples = [sample(state)];
  while (state.time < learning.cooling.duration - 1e-8) {
    state = advanceGuided(state, "cooling", 0.5);
    samples.push(sample(state, controls));
  }
  const peak = temperaturePeak(samples);
  assert.ok(peak, "fuel temperature should rise and then turn back");
  assert.ok(peak.time > 25 && peak.time < 35);
  assert.ok(Math.abs(peak.power - peak.transfer) < 0.5);
  const { temperature, power } = learning.cooling.beats!;
  for (const s of samples) {
    assert.ok(s.fuel >= temperature[0] && s.fuel <= temperature[1]);
    for (const v of [s.power, s.transfer])
      assert.ok(v >= power[0] && v <= power[1]);
  }
});
for (const id of ["control", "cooling", "shutdown"]) {
  test(`${id}: evidence captures the intended response at the same model time across playback rates`, () => {
    const results = [0.1, 0.3, 0.73].map((dt) => {
      let state = initialState();
      for (
        let i = 0;
        i < 1000 && state.time < learning[id].duration - 1e-8;
        i++
      )
        state = advanceGuided(state, id, dt);
      assert.ok(Math.abs(state.time - learning[id].duration) < 1e-8);
      assert.equal(outsideRange(state), false);
      return state;
    });
    for (const state of results) {
      if (id === "cooling") {
        assert.ok(state.fuel > 600);
        assert.ok(state.thermal < 1);
      } else {
        assert.ok(state.thermal < 1);
        assert.ok(state.fuel < 600);
      }
      if (id === "shutdown")
        assert.ok(state.decay.reduce((a, b) => a + b, 0) > 0);
      const evidence = guidedEvidence(state);
      assert.equal(evidence[0].now, state.thermal * 100);
      assert.ok(Math.abs(state.fuel - results[0].fuel) < 0.5);
    }
    const changed = Object.keys(defaults).filter(
      (k) =>
        guidedControls(id)[k as keyof typeof defaults] !==
        defaults[k as keyof typeof defaults],
    );
    assert.deepEqual(changed, id === "cooling" ? ["flow"] : ["rods"]);
  });
}
