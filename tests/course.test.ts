import test from "node:test";
import assert from "node:assert/strict";
import {
  chainChallenge,
  chainState,
  controlRun,
  explanationIdeas,
  heatChallenge,
  heatRate,
  judge,
  kEff,
  parseNumber,
  pumpPart,
  runAt,
} from "../src/course";

test("challenge answers match the physics they are built on", () => {
  const [a, b, c] = heatChallenge;
  const rate = heatRate(90, 5, 105, 20);
  assert.equal(judge(a, String(rate)).ok, true);
  assert.equal(judge(b, String(rate * 8)).ok, true);
  assert.equal(judge(c, String(90 + 5)).ok, true);
  const k = kEff(2.5, 4, 58);
  assert.equal(judge(chainChallenge[0], k.toFixed(3)).ok, true);
  assert.equal(
    judge(chainChallenge[1], String((1 - 1 / (2.5 * 0.96)) * 100)).ok,
    true,
  );
  assert.equal(
    judge(chainChallenge[2], String(1000 * Math.pow(k, 10))).ok,
    true,
  );
  assert.equal(judge(pumpPart, String(heatRate(100, 6, 70, 18))).ok, true);
});

test("common errors get specific feedback rather than a generic retry", () => {
  const [a, b, c] = heatChallenge;
  assert.match(judge(a, "0.5").message, /wrong sign/);
  assert.match(judge(a, "−0.75").message, /decay heat/);
  assert.match(judge(b, "-0.5").message, /rate/);
  assert.match(judge(c, "90").message, /Decay heat/);
  assert.match(judge(chainChallenge[0], "1.05").message, /leakage/);
  assert.match(judge(a, "").message, /Type a number/);
  assert.match(judge(a, "abc").message, /digits/);
  assert.equal(parseNumber("1,083"), 1083);
  assert.equal(parseNumber("58.3%"), 58.3);
});

test("the recorded run comes from the lab model: power drops fast, fuel lags", () => {
  const run = controlRun();
  const [p0, p1, p20] = [runAt(run, 0), runAt(run, 1), runAt(run, 20)];
  assert.equal(p0.power, 100);
  assert.ok(p0.power - p1.power > 5, "power falls several points in 1 s");
  assert.ok(p0.fuel - p1.fuel < 1, "fuel falls less than 1 °C in 1 s");
  assert.ok(p1.fuel > p20.fuel + 15, "fuel keeps falling over 20 s");
});

test("neutron budget classifies the chain and explanations are scanned for ideas", () => {
  assert.equal(chainState(kEff(2.43, 5, 60)), "sub");
  assert.equal(chainState(1.001), "crit");
  assert.equal(chainState(kEff(2.43, 0, 40)), "super");
  const ideas = explanationIdeas(
    "Fission power fell below transfer to the coolant, so the stored energy fell at a rate set by the gap; decay heat continued.",
  );
  assert.deepEqual(
    ideas.map((i) => i.ok),
    [true, true, true, true],
  );
  assert.equal(explanationIdeas("it got colder").filter((i) => i.ok).length, 0);
});

test("deep-dive challenges for 01, 04 and 05 agree with their equations", async () => {
  const c = await import("../src/course");
  const [ea, eb, ec] = c.energyChallenge;
  const pe = 0.33 * 3400;
  assert.equal(c.judge(ea, String(pe)).ok, true);
  assert.equal(c.judge(eb, String(3400 - pe)).ok, true);
  assert.equal(c.judge(ec, String(c.carnot(285, 35) * 100)).ok, true);
  assert.match(c.judge(ec, "87.7").message, /°C/);
  const [ca, cb, cc] = c.coolingChallenge;
  assert.equal(c.judge(ca, String(c.coolantRise(3000, 18000))).ok, true);
  assert.equal(c.judge(cb, String(c.coolantRise(3000, 12000))).ok, true);
  assert.equal(c.judge(cc, String((12000 * 5500 * 30.3) / 1e6)).ok, true);
  assert.match(c.judge(cb, "20.2").message, /each kilogram/);
  const [sa, sb, sc] = c.shutdownChallenge;
  assert.equal(c.judge(sa, String(c.decayPower(8, 20, 50))).ok, true);
  const total = c.decayPopulations.reduce(
    (sum, p) => sum + c.decayPower(p.p0, p.halfLife, 100),
    0,
  );
  assert.equal(c.judge(sb, String(total)).ok, true);
  assert.equal(c.judge(sc, String(3 * 200)).ok, true);
  assert.match(c.judge(sa, "1.5").message, /straight line/);
});

test("model runs behind the 04 and 05 puzzles show the advertised behaviour", async () => {
  const { modelRun, runAt } = await import("../src/course");
  const cooling = modelRun("cooling", 20);
  const [c0, c20] = [runAt(cooling, 0), runAt(cooling, 20)];
  assert.ok(c20.fuel > c0.fuel + 10, "fuel heats up when flow is cut");
  assert.ok(c20.power < c0.power - 5, "while thermal power falls");
  const shutdown = modelRun("shutdown", 30);
  const [s1, s30] = [runAt(shutdown, 1), runAt(shutdown, 30)];
  assert.ok(s1.power < 30, "most power is gone within a second");
  assert.ok(s30.power > 1 && s30.power < 10, "a few percent remains at 30 s");
  assert.ok(s30.decay > 2, "decay heat is a large share of what remains");
});
