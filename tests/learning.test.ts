import test from "node:test";
import assert from "node:assert/strict";
import { initialState, defaults, outsideRange } from "../src/simulation";
import {
  advanceGuided,
  guidedControls,
  guidedEvidence,
  learning,
} from "../src/learning";
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
