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
import { experimentBeats } from "../src/beats";
function recordedRun(id: string) {
  const controls = guidedControls(id);
  let state = initialState();
  const samples = [sample(state)];
  while (state.time < learning[id].duration - 1e-8) {
    state = advanceGuided(state, id, 0.5);
    samples.push(sample(state, controls));
  }
  return samples;
}
for (const id of ["control", "cooling", "shutdown"]) {
  test(`${id}: the staged run marks the moment its explanation claims, inside its chart ranges`, () => {
    const design = experimentBeats[id];
    const samples = recordedRun(id);
    const first = samples[0],
      last = samples.at(-1)!;
    const m = design.moment(samples);
    assert.ok(m, "the marked moment should occur during the run");
    assert.ok(m !== first && m !== last);
    if (id === "control") {
      assert.ok(m.time >= 2 && m.time < 2.6);
      assert.ok(first.power - m.power > 8, "power falls fast");
      assert.ok(first.fuel - m.fuel < 3, "temperature lags");
    } else if (id === "cooling") {
      assert.ok(m.time > 25 && m.time < 35);
      assert.ok(Math.abs(m.power - m.transfer) < 0.5, "heat flows cross");
      assert.equal(m.fuel, Math.max(...samples.map((s) => s.fuel)));
    } else {
      assert.ok(m.decay >= m.fission, "decay heat overtakes fission");
      assert.ok(m.time > 20, "with time left to see it");
      assert.ok(last.power > 2, "heat generation has not stopped");
      assert.ok(last.fuel > 350, "the fuel is still hot");
    }
    for (const panel of [design.primary, design.reveal].filter(
      (p) => !p.zoomed,
    ))
      for (const s of samples)
        for (const { key } of panel.series)
          assert.ok(
            s[key] >= panel.range[0] && s[key] <= panel.range[1],
            `${id} ${key} ${s[key]} outside ${panel.range}`,
          );
  });
}
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
