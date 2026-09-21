/** Dimensionless, deliberately slowed point-kinetics teaching model.
 * NOT plant-calibrated: see docs/MODEL.md for equations and limitations. */
export type Controls = { rods: number; flow: number; sink: number };
export type State = {
  time: number;
  neutrons: number;
  precursor: number;
  fuel: number;
  coolant: number;
  decay: number[];
  thermal: number;
  removed: number;
  electric: number;
  reactivity: number;
};
export const defaults: Controls = { rods: 50, flow: 100, sink: 100 };
const beta = 0.0065,
  lifetime = 0.005,
  lambda = 0.08;
export const initialState = (): State => ({
  time: 0,
  neutrons: 1,
  precursor: beta / (lambda * lifetime),
  fuel: 600,
  coolant: 310,
  decay: [0.01, 0.02, 0.02],
  thermal: 1,
  removed: 1,
  electric: 1,
  reactivity: 0,
});
export function step(state: State, c: Controls, dt: number): State {
  let s = { ...state, decay: [...state.decay] };
  const count = Math.max(1, Math.ceil(dt / 0.02));
  const h = dt / count;
  for (let i = 0; i < count; i++) {
    const rodReactivity =
      (50 - c.rods) * 0.00006 -
      0.024 * Math.pow(Math.max(0, c.rods - 70) / 30, 2);
    const rho =
      rodReactivity - (s.fuel - 600) * 0.000012 - (s.coolant - 310) * 0.000018;
    const dn = ((rho - beta) / lifetime) * s.neutrons + lambda * s.precursor;
    const dc = (beta / lifetime) * s.neutrons - lambda * s.precursor;
    const fuelTransfer =
      ((s.fuel - s.coolant) / 290) * Math.pow(c.flow / 100, 0.55);
    const removed =
      ((s.coolant - 270) / 40) * Math.pow(c.flow / 100, 0.7) * (c.sink / 100);
    const thermal = 0.95 * s.neutrons + s.decay.reduce((a, b) => a + b, 0);
    s = {
      ...s,
      time: s.time + h,
      reactivity: rho,
      neutrons: Math.max(0, s.neutrons + dn * h),
      precursor: Math.max(0, s.precursor + dc * h),
      fuel: s.fuel + ((thermal - fuelTransfer) / 0.09) * h,
      coolant: s.coolant + ((fuelTransfer - removed) / 0.3) * h,
      decay: s.decay.map(
        (d, j) =>
          d + (([0.01, 0.02, 0.02][j] * s.neutrons - d) / [6, 60, 600][j]) * h,
      ),
      thermal,
      removed,
      electric: s.electric + ((Math.max(0, removed) - s.electric) / 8) * h,
    };
  }
  return s;
}
export function outsideRange(s: State) {
  return (
    s.fuel > 900 ||
    s.coolant > 340 ||
    s.coolant < 270 ||
    s.neutrons > 2.5 ||
    ![s.neutrons, s.fuel, s.coolant, s.thermal].every(Number.isFinite)
  );
}
export type Sample = {
  time: number;
  power: number;
  fuel: number;
  coolant: number;
  decay: number;
  rods: number;
  flow: number;
  sink: number;
};
export const sample = (s: State, c: Controls = defaults): Sample => ({
  time: s.time,
  power: s.thermal * 100,
  fuel: s.fuel,
  coolant: s.coolant,
  decay: s.decay.reduce((a, b) => a + b, 0) * 100,
  rods: c.rods,
  flow: c.flow,
  sink: c.sink,
});
export function run(
  controls: Controls,
  seconds: number,
  state = initialState(),
) {
  let s = state;
  for (let t = 0; t < seconds; t += 0.1)
    s = step(s, controls, Math.min(0.1, seconds - t));
  return s;
}
