import type { Sample } from "./simulation";
import { temperaturePeak } from "./science";

/** How each guided run releases its evidence, one beat at a time: predict,
 * run and watch one line, reveal the lines that explain it, then mark the
 * moment that matters. Text that quotes results is computed from the run. */
export type SeriesKey = "power" | "fission" | "decay" | "transfer" | "fuel";
export type BeatPanel = {
  title: string;
  range: [number, number];
  series: { key: SeriesKey; label: string; color: string; dashed?: boolean }[];
  /** Label drawn beside the marked moment in this panel. */
  mark?: string;
  /** Values above the range are clipped on purpose, to show small ones. */
  zoomed?: boolean;
};
export type ExperimentBeatsDesign = {
  /** Completes "Over the next N model seconds, …". */
  question: string;
  choices: string[];
  watch: string;
  primary: BeatPanel;
  reveal: BeatPanel;
  revealAbove?: boolean;
  revealButton: string;
  explore: string;
  moment: (samples: Sample[]) => Sample | undefined;
  ran: (first: Sample, last: Sample, moment?: Sample) => string;
  found: string;
  explain: (first: Sample, last: Sample, moment: Sample) => string;
  balanceEquation?: boolean;
  measures: string;
};
export const units: Record<SeriesKey, string> = {
  power: "%",
  fission: "%",
  decay: "%",
  transfer: "%",
  fuel: "°C",
};
const heatIn = "#ab5b1f",
  heatOut = "#2f6690",
  ink = "#253b34",
  neutrons = "#5f4b9b";
const slowedModel = "The model is a slowed teaching model, not a real plant.";
export const experimentBeats: Record<string, ExperimentBeatsDesign> = {
  control: {
    question: "what will thermal power do?",
    choices: [
      "Drop to a new level at once, then hold steady",
      "Drop quickly at first, then keep falling slowly",
      "Fall at the same steady rate throughout",
    ],
    watch: "Watch the thermal power.",
    primary: {
      title: "THERMAL POWER · %",
      range: [70, 105],
      series: [{ key: "power", label: "Thermal power", color: heatIn }],
      mark: "fast drop",
    },
    reveal: {
      title: "FUEL TEMPERATURE · °C",
      range: [570, 605],
      series: [{ key: "fuel", label: "Fuel temperature", color: ink }],
    },
    revealButton: "Show fuel temperature",
    explore: "Compare the first two seconds. How much did each one change?",
    moment: (samples) => samples.find((s) => s.time >= 2),
    ran: (_first, last, m) =>
      m
        ? `It dropped to ${m.power.toFixed(0)}% in the first few seconds, then slid to ${last.power.toFixed(0)}%. Did the fuel cool as quickly?`
        : `It ended at ${last.power.toFixed(0)}%. Did the fuel cool as quickly?`,
    found: "Power fell fast. Temperature barely moved.",
    explain: (first, _last, m) =>
      `After ${m.time.toFixed(1)} model seconds, thermal power had fallen from ${first.power.toFixed(1)}% to ${m.power.toFixed(1)}%, but fuel temperature had only fallen from ${first.fuel.toFixed(1)} to ${m.fuel.toFixed(1)} °C. The rods cut fission within seconds; the energy stored in the fuel drains away much more slowly.`,
    measures: `Thermal power is the total heat generated in the fuel, fission plus decay heat, as a percentage of its starting value. Fuel temperature is one value for the whole core. ${slowedModel}`,
  },
  cooling: {
    question: "what will fuel temperature do?",
    choices: [
      "Keep rising the whole time",
      "Rise, then stop and turn back",
      "Drop back to its starting value straight away",
    ],
    watch: "Watch the fuel temperature.",
    primary: {
      title: "FUEL TEMPERATURE · °C",
      range: [595, 635],
      series: [{ key: "fuel", label: "Fuel temperature", color: ink }],
      mark: "peak",
    },
    reveal: {
      title: "HEAT FLOWS · %",
      range: [75, 105],
      series: [
        { key: "power", label: "Heat in", color: heatIn },
        { key: "transfer", label: "Heat out", color: heatOut },
      ],
      mark: "cross",
    },
    revealAbove: true,
    revealButton: "Show heat in and heat out",
    explore:
      "Look where the temperature peaks. What are heat in and heat out doing there?",
    moment: temperaturePeak,
    ran: (_first, last, m) =>
      m
        ? `It rose to ${m.fuel.toFixed(0)} °C, then turned back. Why did it turn?`
        : `It ended at ${last.fuel.toFixed(0)} °C. What set its course?`,
    found: "They cross.",
    explain: (_first, _last, m) =>
      `At ${m.time.toFixed(1)} model seconds, heat in is ${m.power.toFixed(1)}% and heat out is ${m.transfer.toFixed(1)}%. With the flows equal, stored energy stops growing, so the temperature stops rising. Heat in was falling the whole time.`,
    balanceEquation: true,
    measures: `Heat in is the total thermal power generated in the fuel: fission plus decay heat. Heat out is the rate heat transfers from the fuel to the coolant. Both are percentages of the starting total thermal power. ${slowedModel}`,
  },
  shutdown: {
    question: "what will the heat generated in the fuel do?",
    choices: [
      "Drop to zero almost at once",
      "Drop fast, but a small amount keeps going",
      "Stay high until the fuel has cooled",
    ],
    watch: "Watch the heat generated in the fuel.",
    primary: {
      title: "HEAT GENERATED · %",
      range: [0, 105],
      series: [{ key: "power", label: "Heat generated", color: heatIn }],
    },
    reveal: {
      title: "ZOOMED IN · 0–20%",
      range: [0, 20],
      zoomed: true,
      series: [
        { key: "fission", label: "Fission", color: neutrons },
        { key: "decay", label: "Decay heat", color: heatIn, dashed: true },
      ],
      mark: "decay overtakes",
    },
    revealButton: "Split it into fission and decay heat",
    explore: "Look at the last seconds. Which part is making more of the heat?",
    moment: (samples) => samples.find((s, i) => i > 0 && s.decay >= s.fission),
    ran: (_first, last) =>
      `It fell to ${last.power.toFixed(1)}%, not to zero. What is still making heat?`,
    found: "Decay heat takes over.",
    explain: (_first, last, m) =>
      `From ${m.time.toFixed(1)} model seconds, radioactive decay makes more heat than fission does. Fission keeps fading, decay heat falls only slowly, and the fuel is still at ${last.fuel.toFixed(0)} °C. Cooling is still needed after shutdown.`,
    measures: `Heat generated is fission plus decay heat, as a percentage of the starting total. Fission fades once the chain reaction is suppressed; decay heat comes from radioactive fission products and fades slowly. The decay-heat curve here is illustrative. ${slowedModel}`,
  },
};
