import { initialState, step } from "./simulation";
import { guidedControls } from "./learning";

/** Screens of the curiosity-led course that sits in front of the 3D lab. */
export type CourseScreen =
  | "intro"
  | "map"
  | "energy"
  | "chain"
  | "puzzle"
  | "equation"
  | "evidence"
  | "cooling"
  | "shutdown";
export type Curve = "A" | "B" | "C" | "D";
export type CourseProgress = {
  sealed: { curve: Curve; confidence: number; reason: string } | null;
  chainSolved: boolean;
  controlSolved: boolean;
  explanation: string;
  /** Deep dives for 01, 04 and 05 record completion and the locked-in prediction here. */
  solved: Record<string, boolean>;
  predictions: Record<string, number>;
};
export const courseKey = "core-course-v1";
export const emptyCourse = (): CourseProgress => ({
  sealed: null,
  chainSolved: false,
  controlSolved: false,
  explanation: "",
  solved: {},
  predictions: {},
});
export function readCourse(): CourseProgress {
  try {
    const raw = localStorage.getItem(courseKey);
    return raw ? { ...emptyCourse(), ...JSON.parse(raw) } : emptyCourse();
  } catch {
    return emptyCourse();
  }
}
export function saveCourse(p: CourseProgress) {
  try {
    localStorage.setItem(courseKey, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

/** Which deep-dive screen, if any, opens each investigation. */
export const deepDive: Record<string, CourseScreen> = {
  energy: "energy",
  neutrons: "chain",
  control: "puzzle",
  cooling: "cooling",
  shutdown: "shutdown",
};
export function deepDiveCleared(p: CourseProgress, id: string) {
  if (id === "neutrons") return p.chainSolved;
  if (id === "control") return p.controlSolved;
  return !!p.solved[id];
}

export type Mystery = {
  headline: string;
  intro: string;
  card: string;
  teaser: string;
  clue: string;
};
export const mysteries: Record<string, Mystery> = {
  energy: {
    headline: "3,000 MW of heat. 1,000 MW of electricity. Where’s the rest?",
    intro:
      "Follow the energy from a splitting nucleus to the socket. Most of it leaves the plant, on purpose.",
    card: "Heat to electricity",
    teaser: "Most of a power station’s heat never becomes electricity. Why?",
    clue: "About a third of the heat becomes electricity; the rest must leave through the condenser. Heat crosses between circuits — water doesn’t.",
  },
  neutrons: {
    headline: "Each fission frees about 2.4 neutrons. Why no runaway?",
    intro:
      "Most neutrons never cause another fission: they leak out, or something absorbs them. It all comes down to the neutron budget.",
    card: "The chain reaction",
    teaser: "A slowed-down neutron makes fission more likely, not less. How?",
    clue: "Moderated is not absorbed. A slow neutron can still cause fission.",
  },
  control: {
    headline: "Power drops in a second. The fuel doesn’t. Why?",
    intro:
      "Push the rods in and fission power falls at once, yet the fuel cools slowly. Something is storing energy.",
    card: "The temperature lag",
    teaser: "The rods go in. Why doesn’t the fuel cool straight away?",
    clue: "Temperature tracks stored energy, not power. Its slope is set by generation minus transfer.",
  },
  cooling: {
    headline: "A hotter core, making less power?",
    intro:
      "Less flow means each kilogram of water carries more heat. Then the core regulates itself.",
    card: "Moving the heat",
    teaser: "Slow the pump, and the fuel heats up while power falls.",
    clue: "A temperature rise is not evidence of more fission. Check heat removal too.",
  },
  shutdown: {
    headline: "Every rod is in. Why is it still hot?",
    intro:
      "Shutdown stops the chain reaction, not the heat. What keeps it going, and for how long?",
    card: "Heat after shutdown",
    teaser: "A shut-down core still makes megawatts. From what?",
    clue: "Cooling is still needed after a successful shutdown: decay heat and stored heat remain.",
  },
};

export const openQuestions = [
  {
    text: "If a neutron is slowed down, why does that make more fission happen — not less?",
    where: "Explored in 02 · chain lab",
    tone: "blue",
  },
  {
    text: "The fuel gets hotter, yet the reactor produces less power. How can both be true?",
    where: "Answered in 04",
    tone: "amber",
  },
  {
    text: "Fewer than 1 in 100 neutrons arrive late. Why does that make a reactor controllable at all?",
    where: "Bonus question in 02",
    tone: "neutral",
  },
] as const;

/* ---------- The recorded run used by the puzzle and the evidence screen ---------- */
export type RunPoint = {
  t: number;
  power: number;
  fission: number;
  fuel: number;
  decay: number;
};
/** Runs the lab model's own control-rod experiment (rods 50% → 65%). */
export const controlRun = (seconds = 20, dt = 0.5) =>
  modelRun("control", seconds, dt);
/** Runs one of the lab model's guided experiments with its fixed setting. */
export function modelRun(id: string, seconds: number, dt = 0.5): RunPoint[] {
  const controls = guidedControls(id);
  let s = initialState();
  const out: RunPoint[] = [];
  for (let t = 0; t <= seconds + 1e-9; t += dt) {
    out.push({
      t: s.time,
      power: s.thermal * 100,
      fission: s.neutrons * 95,
      fuel: s.fuel,
      decay: s.decay.reduce((a, b) => a + b, 0) * 100,
    });
    s = step(s, controls, dt);
  }
  return out;
}
export const runAt = (run: RunPoint[], t: number) =>
  run.reduce((best, p) =>
    Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best,
  );

/* Chart geometry shared by the puzzle and evidence charts (viewBox 640 × 230). */
export const chart = {
  x: (t: number) => 60 + (t / 20) * 565,
  powerY: (p: number) => 30 + (100 - p) * 8, // 100% → 30, 80% → 190
  fuelY: (f: number) => 30 + (600 - f) * 5, // 600 °C → 30, 570 °C → 180
};
function path(run: RunPoint[], y: (p: RunPoint) => number) {
  return (
    `M40 ${y(run[0]).toFixed(1)} ` +
    run.map((p) => `L${chart.x(p.t).toFixed(1)} ${y(p).toFixed(1)}`).join(" ")
  );
}
export const powerPath = (run: RunPoint[]) =>
  path(run, (p) => chart.powerY(p.power));
export const fuelPath = (run: RunPoint[]) =>
  path(run, (p) => chart.fuelY(p.fuel));

export const curveOptions: { id: Curve; label: string; path?: string }[] = [
  {
    id: "A",
    label: "Drops sharply, mirroring the power",
    path: "M40 30 H60 L89 110 C120 128 220 140 625 175",
  },
  { id: "B", label: "Falls steadily, with no sudden drop" },
  {
    id: "C",
    label: "Holds flat for a while, then plunges",
    path: "M40 30 H360 C420 30 450 150 625 172",
  },
  {
    id: "D",
    label: "Briefly rises, then falls",
    path: "M40 30 H60 C100 4 150 8 210 30 C300 70 450 110 625 140",
  },
];
export const confidenceLevels = [
  "Guessing",
  "Unsure",
  "Leaning",
  "Fairly sure",
  "Certain",
];
export const verdicts: Record<
  Curve,
  { title: string; body: string; ok: boolean }
> = {
  A: {
    title: "The fuel didn’t follow the power.",
    body: "Power fell 9 points in one second; the fuel fell less than 1 °C. The fuel holds so much stored energy that one second of deficit barely dents it. Your sketch treated temperature like power — the most common mistake there is.",
    ok: false,
  },
  B: {
    title: "Your sketch matches the data.",
    body: "No sudden drop: the fuel loses stored energy at a rate set by generation minus transfer. Now push further: by 10 s power had almost settled, yet the fuel was still falling more than 1 °C every second. Which part of the balance is still off?",
    ok: true,
  },
  C: {
    title: "There was no flat delay.",
    body: "The fuel started cooling at once, just slowly. The moment generation fell below transfer, dT/dt went negative.",
    ok: false,
  },
  D: {
    title: "Nothing pushed the temperature up.",
    body: "Generation dropped below transfer, so dT/dt was negative from the first instant. A rise would need P > Q̇.",
    ok: false,
  },
};

/* ---------- Numerical checking with misconception-specific feedback ---------- */
export type Verdict = { ok: boolean; message: string };
type Rule = [target: number, tolerance: number, ok: boolean, message: string];
export type NumericPart = {
  id: string;
  question: string;
  unit: string;
  rules: Rule[];
  fallback: string;
};
export function parseNumber(input: string): number | null {
  const s = input
    .trim()
    .replace(/−/g, "-")
    .replace(/[,\s%]/g, "");
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
export function judge(part: NumericPart, input: string): Verdict {
  if (!input.trim()) return { ok: false, message: "Type a number first." };
  const n = parseNumber(input);
  if (n === null)
    return { ok: false, message: "Use digits only — for example -1.5" };
  const hit = part.rules.find(([x, tol]) => Math.abs(n - x) <= tol);
  return hit
    ? { ok: hit[2], message: hit[3] }
    : { ok: false, message: part.fallback };
}

export const heatChallenge: NumericPart[] = [
  {
    id: "a",
    question: "What is dT_f/dt just after the rods go in?",
    unit: "K/s",
    rules: [
      [
        -0.5,
        0.01,
        true,
        "Right: (90 + 5 − 105) / 20 = −0.5 K/s. The fuel is losing stored energy.",
      ],
      [
        0.5,
        0.01,
        false,
        "Right size, wrong sign. Transfer is bigger than generation, so which way must it go?",
      ],
      [
        -0.75,
        0.01,
        false,
        "You left out decay heat. The rods can’t switch P_d off.",
      ],
      [
        -10,
        0.01,
        false,
        "That’s the net power in MW. Divide by C_f to turn it into K/s.",
      ],
    ],
    fallback:
      "Not yet. Write the balance out in MW first, then use a hint if you’re stuck.",
  },
  {
    id: "b",
    question:
      "If that rate held for 8 s, how much would the fuel temperature change?",
    unit: "K",
    rules: [
      [
        -4,
        0.05,
        true,
        "Right: −0.5 K/s × 8 s = −4 K. Only 4 degrees — though fission power fell 10%.",
      ],
      [4, 0.05, false, "Check the sign: the fuel is cooling."],
      [-0.5, 0.01, false, "That’s the rate. How much changes over 8 seconds?"],
    ],
    fallback:
      "Not yet. A rate in K/s multiplied by a time in s gives a change in K.",
  },
  {
    id: "c",
    question:
      "The fuel cools, so Q̇ falls. At what value of Q̇ does the cooling stop?",
    unit: "MW",
    rules: [
      [
        95,
        0.5,
        true,
        "Right: cooling stops when Q̇ = P_f + P_d = 95 MW. That’s where the temperature will eventually level off.",
      ],
      [90, 0.5, false, "Decay heat still counts: generation is 90 + 5."],
      [
        105,
        0.5,
        false,
        "At 105 MW the fuel is still cooling. Where is the balance point?",
      ],
    ],
    fallback:
      "Not yet. Steady means dT/dt = 0. What must be true of the two sides?",
  },
];
export const heatHints = [
  "Add both heat sources before you subtract anything.",
  "Net = (90 + 5) − 105 MW. Now divide by 20 MJ/K.",
  "Steady means dT/dt = 0, so generation equals transfer.",
];

export const chainChallenge: NumericPart[] = [
  {
    id: "a",
    question: "Calculate k_eff for this core.",
    unit: "",
    rules: [
      [
        1.008,
        0.0015,
        true,
        "Right: 2.50 × 0.96 × 0.42 = 1.008. Just over 1, so the chain slowly grows.",
      ],
      [
        0.42,
        0.005,
        false,
        "That’s the fraction that cause fission. Multiply by the neutrons each fission makes.",
      ],
      [1.05, 0.005, false, "You missed the leakage factor (1 − 0.04)."],
      [
        2.4,
        0.005,
        false,
        "You left out capture: only 42% of the remaining neutrons cause fission.",
      ],
    ],
    fallback:
      "Not yet. Follow 100 neutrons through leakage, then capture, then fission.",
  },
  {
    id: "b",
    question: "What capture percentage would make k_eff exactly 1?",
    unit: "%",
    rules: [
      [
        58.3,
        0.15,
        true,
        "Right: 1 − 1 / (2.50 × 0.96) = 0.583, so 58.3%. Just 0.3 points separates growing from steady.",
      ],
      [
        41.7,
        0.15,
        false,
        "That’s the fraction that must cause fission. The question asks for capture.",
      ],
      [
        60,
        0.3,
        false,
        "Too much: that would make k fall below 1. Solve 2.50 × 0.96 × (1 − C) = 1.",
      ],
    ],
    fallback: "Not yet. Set k = 1 and solve for C.",
  },
  {
    id: "c",
    question:
      "With your k from (a), how many neutrons do 1,000 become after 10 generations?",
    unit: "",
    rules: [
      [
        1083,
        3,
        true,
        "Right: 1,000 × 1.008¹⁰ ≈ 1,083. Only 8% growth over 10 generations — now try the mind-bender below.",
      ],
      [
        1080,
        0.5,
        false,
        "That adds 0.8% ten times. Growth compounds: use a power, not multiplication.",
      ],
      [1008, 1, false, "That’s one generation. You need ten."],
    ],
    fallback: "Not yet. Each generation multiplies by k.",
  },
];

export const pumpPart: NumericPart = {
  id: "pump",
  question:
    "How fast does the fuel temperature change at first? Include the sign.",
  unit: "K/s",
  rules: [
    [
      2,
      0.01,
      true,
      "Right: (106 − 70) / 18 = +2 K/s. Less heat leaves, so the fuel warms — with no change in fission at all.",
    ],
    [
      -2,
      0.01,
      false,
      "Right size, wrong sign. Is more energy entering or leaving the fuel?",
    ],
    [
      30 / 18,
      0.01,
      false,
      "Close — you dropped the decay heat. It still adds 6 MW.",
    ],
    [36, 0.01, false, "36 MW is the imbalance. Divide by C_f to get K/s."],
  ],
  fallback: "Not yet. Write the imbalance in MW first.",
};
export const feedbackOptions = [
  {
    text: "Hotter fuel and water reduce reactivity, so the chain shrinks: negative temperature feedback.",
    feedback:
      "Yes — the core regulates itself. Investigation 04 measures how strongly.",
    ok: true,
  },
  {
    text: "The slower water absorbs more neutrons, the way a control rod does.",
    feedback:
      "Water slows neutrons; the rods are what absorb them. Look at temperature instead.",
    ok: false,
  },
  {
    text: "Decay heat cancels part of the fission power.",
    feedback: "Decay heat adds to fission power — it never subtracts.",
    ok: false,
  },
];

/* ---------- Model relations used by the interactive labs ---------- */
export const heatRate = (
  gen: number,
  decay: number,
  removal: number,
  cap: number,
) => (gen + decay - removal) / cap;
export const neutronsPerFission = 2.43;
export const kEff = (nu: number, leakPct: number, capturePct: number) =>
  nu * (1 - leakPct / 100) * (1 - capturePct / 100);
export function chainState(k: number): "sub" | "crit" | "super" {
  return Math.abs(k - 1) < 0.005 ? "crit" : k < 1 ? "sub" : "super";
}
export function signed(n: number, digits = 2) {
  const r = Number(n.toFixed(digits));
  if (r === 0) return (0).toFixed(digits);
  return (r > 0 ? "+" : "−") + Math.abs(r).toFixed(digits);
}

/** Spots (but does not grade) the ideas a strong explanation tends to use. */
export function explanationIdeas(text: string) {
  const t = text.toLowerCase();
  return [
    {
      label: "Names stored thermal energy in the fuel",
      ok: /stor|heat capacity|c_f|\bcf\b/.test(t),
    },
    {
      label: "Compares generation with heat transfer to the coolant",
      ok:
        /(transfer|coolant|remov|carried|q̇|\bq\b)/.test(t) &&
        /(generat|fission|p_f|power|produc)/.test(t),
    },
    {
      label: "Treats temperature change as a rate (slope, per second)",
      ok: /(rate|slope|per second|dt|k\/s)/.test(t),
    },
    { label: "Remembers decay heat keeps coming", ok: /decay/.test(t) },
  ];
}
export const explanationBlocks = [
  {
    text: "C_f dT_f/dt = P − Q̇",
    tone: "text",
    phrase: "Using C_f dT_f/dt = P_f + P_d − Q̇, ",
  },
  {
    text: "generation < transfer",
    tone: "blue",
    phrase: "generation fell below transfer to the coolant, so ",
  },
  {
    text: "stored energy",
    tone: "amber",
    phrase: "the fuel’s stored thermal energy ",
  },
  {
    text: "decay heat continues",
    tone: "amber2",
    phrase: "decay heat kept adding energy ",
  },
  {
    text: "Q̇ falls as fuel cools",
    tone: "blue2",
    phrase: "as the fuel cooled, Q̇ fell too, ",
  },
] as const;

/* ---------- Deep dives for investigations 01, 04 and 05 ---------- */
export type PredictOption = { text: string; ok: boolean; feedback: string };

/** Carnot ceiling for a heat engine between two Celsius temperatures. */
export const carnot = (hotC: number, coldC: number) =>
  1 - (coldC + 273.15) / (hotC + 273.15);
/** Temperature rise of water carrying `heatMW` at `flow` kg/s. */
export const coolantRise = (heatMW: number, flow: number, cp = 5500) =>
  (heatMW * 1e6) / (flow * cp);
/** Decay power of one isolated population after `t` seconds. */
export const decayPower = (p0: number, halfLife: number, t: number) =>
  p0 * Math.pow(2, -t / halfLife);
export const decayPopulations = [
  { name: "Short-lived", p0: 6, halfLife: 20 },
  { name: "Long-lived", p0: 2, halfLife: 200 },
];

export const energyPredict: PredictOption[] = [
  {
    text: "They are destroyed in the turbine",
    ok: false,
    feedback:
      "Energy can’t be destroyed. Every second, those 2,000 MJ have to go somewhere.",
  },
  {
    text: "They build up inside the reactor",
    ok: false,
    feedback:
      "If 2,000 MW stayed inside, the core would heat up without limit. At steady state, what comes in must go out.",
  },
  {
    text: "They leave as heat in the condenser’s cooling water",
    ok: true,
    feedback:
      "Right. About two-thirds of the heat leaves the plant on purpose. A steam cycle needs a cold end to work at all.",
  },
  {
    text: "They escape as radiation",
    ok: false,
    feedback:
      "Radiation carries away a tiny fraction. The big outflow is warm water.",
  },
];
export const energyChallenge: NumericPart[] = [
  {
    id: "a",
    question:
      "A plant takes in 3,400 MW of heat at η = 33%. What is its electrical output?",
    unit: "MW",
    rules: [
      [1122, 2, true, "Right: 0.33 × 3,400 = 1,122 MW of electricity."],
      [
        10303,
        5,
        false,
        "You divided by η. Output = η × input, and it must be less than 3,400 MW.",
      ],
      [112200, 50, false, "Use η as a fraction (0.33), not as 33."],
    ],
    fallback: "Not yet. Rearrange η = P_e / P_th for P_e.",
  },
  {
    id: "b",
    question:
      "At steady state, how much heat leaves through the condenser every second?",
    unit: "MW",
    rules: [
      [
        2278,
        3,
        true,
        "Right: 3,400 − 1,122 = 2,278 MW leaves as heat — about twice the electricity.",
      ],
      [
        1122,
        2,
        false,
        "That’s the electricity. Where does the rest of the 3,400 MW go?",
      ],
      [
        3400,
        1,
        false,
        "That’s everything going in. Some of it left as electricity.",
      ],
    ],
    fallback: "Not yet. Energy in = electricity out + heat rejected.",
  },
  {
    id: "c",
    question:
      "Steam enters at 285 °C; the condenser sits at 35 °C. What is the Carnot ceiling η_max, in %?",
    unit: "%",
    rules: [
      [
        44.8,
        0.3,
        true,
        "Right: 1 − 308 K / 558 K ≈ 44.8%. Real plants reach about 33%: friction, pumping and finite temperature differences use up the gap.",
      ],
      [
        87.7,
        0.3,
        false,
        "You used °C. The Carnot ratio needs absolute temperatures: add 273.",
      ],
      [
        0.448,
        0.003,
        false,
        "Right value as a fraction. The question asks for a percentage.",
      ],
      [55.2, 0.3, false, "That’s T_c / T_h. Subtract it from 1."],
    ],
    fallback:
      "Not yet. Convert both temperatures to kelvin, then use η_max = 1 − T_c / T_h.",
  },
];

export const coolingPredict: PredictOption[] = [
  {
    text: "Rises — hotter fuel makes more fission",
    ok: false,
    feedback:
      "Hotter fuel and water push reactivity down in this core. The power fell.",
  },
  {
    text: "Falls — even though the fuel is hotter",
    ok: true,
    feedback:
      "Right. Heat removal fell, so the fuel warmed. Warmer fuel and water then reduced reactivity, and fission power fell on its own.",
  },
  {
    text: "Stays the same — nobody moved the rods",
    ok: false,
    feedback:
      "Rods aren’t the only thing that changes the neutron balance. Temperature does too.",
  },
];
export const coolingChallenge: NumericPart[] = [
  {
    id: "a",
    question:
      "A 3,000 MW core is cooled by 18,000 kg/s of water with c_p = 5,500 J/(kg·K). What is the temperature rise across the core?",
    unit: "K",
    rules: [
      [30.3, 0.2, true, "Right: 3×10⁹ W / (18,000 × 5,500) ≈ 30.3 K."],
      [0.0303, 0.001, false, "Check the power: 3,000 MW is 3,000,000,000 W."],
      [
        0.0000303,
        0.000001,
        false,
        "Convert MW to W before dividing: 3,000 MW = 3×10⁹ W.",
      ],
    ],
    fallback: "Not yet. Rearrange to ΔT = Q̇ / (ṁ c_p), with Q̇ in watts.",
  },
  {
    id: "b",
    question:
      "The pumps slow to 12,000 kg/s and the heat load stays at 3,000 MW. What is the new temperature rise?",
    unit: "K",
    rules: [
      [
        45.5,
        0.3,
        true,
        "Right: 3×10⁹ / (12,000 × 5,500) ≈ 45.5 K. Each kilogram now has to carry 50% more heat.",
      ],
      [
        20.2,
        0.3,
        false,
        "Less flow can’t mean a smaller rise: each kilogram carries more heat, not less.",
      ],
      [
        30.3,
        0.2,
        false,
        "The flow changed but the heat load didn’t. Which term has to grow?",
      ],
    ],
    fallback: "Not yet. Heat load fixed, ṁ smaller — so ΔT must be larger.",
  },
  {
    id: "c",
    question:
      "Instead, hold the rise at 30.3 K with 12,000 kg/s. How much heat can the water carry, in MW?",
    unit: "MW",
    rules: [
      [
        2000,
        6,
        true,
        "Right: 12,000 × 5,500 × 30.3 ≈ 2,000 MW. A third less heat removed. That mismatch is why the fuel heated up in the run.",
      ],
      [3000, 6, false, "That would need the original 18,000 kg/s."],
      [
        4500,
        10,
        false,
        "Less flow at the same rise must carry less heat, not more.",
      ],
    ],
    fallback: "Not yet. Q̇ = ṁ c_p ΔT, then divide watts by 10⁶.",
  },
];

export const shutdownPredict: PredictOption[] = [
  {
    text: "Almost nothing — under 1% of the starting power",
    ok: false,
    feedback:
      "The chain reaction collapses, but the heat doesn’t. Something keeps producing several percent.",
  },
  {
    text: "A few percent of the starting power",
    ok: true,
    feedback:
      "Right. Fission collapses within a second, but delayed neutrons and decay heat keep a few percent coming.",
  },
  {
    text: "About half — it takes minutes to fall",
    ok: false,
    feedback:
      "The drop is fast at first: most of the power is gone within a second. It’s the last few percent that linger.",
  },
];
export const shutdownChallenge: NumericPart[] = [
  {
    id: "a",
    question:
      "A population produces 8 MW with a half-life of 20 s. What is its decay power after 50 s?",
    unit: "MW",
    rules: [
      [1.414, 0.01, true, "Right: 8 × 2^(−50/20) = 8 × 2^(−2.5) ≈ 1.41 MW."],
      [
        1.5,
        0.01,
        false,
        "Decay isn’t a straight line between half-lives. Use 2^(−2.5).",
      ],
      [
        3.2,
        0.01,
        false,
        "Dividing by the number of half-lives isn’t halving. Halve 2.5 times.",
      ],
    ],
    fallback:
      "Not yet. Work out t / T½ first, then use P_d = P_d,0 × 2^(−t/T½).",
  },
  {
    id: "b",
    question:
      "Two populations: 6 MW with T½ = 20 s, and 2 MW with T½ = 200 s. What is their total decay power after 100 s?",
    unit: "MW",
    rules: [
      [
        1.6,
        0.01,
        true,
        "Right: 6 × 2^(−5) + 2 × 2^(−0.5) = 0.19 + 1.41 = 1.60 MW. The slow population now supplies almost 90%.",
      ],
      [
        0.1875,
        0.005,
        false,
        "That’s only the short-lived population. The long-lived one is still going strong.",
      ],
      [
        1.414,
        0.005,
        false,
        "That’s only the long-lived population. Add the short-lived one.",
      ],
      [
        0.25,
        0.005,
        false,
        "You can’t merge them into one half-life. Decay each population separately, then add.",
      ],
    ],
    fallback: "Not yet. Decay each population on its own clock, then add them.",
  },
  {
    id: "c",
    question:
      "How long until the long-lived population alone is down to 0.25 MW?",
    unit: "s",
    rules: [
      [
        600,
        1,
        true,
        "Right: 2 → 1 → 0.5 → 0.25 MW is three half-lives, so 3 × 200 s = 600 s.",
      ],
      [
        1600,
        1,
        false,
        "0.25 MW is one-eighth of 2 MW. That’s 3 halvings, not 8.",
      ],
      [400, 1, false, "Count again: 2 → 1 → 0.5 → 0.25 is three halvings."],
    ],
    fallback: "Not yet. How many times must 2 MW halve to reach 0.25 MW?",
  },
];

/* ---------- Course intro ---------- */
export const outcomes: { id: string; text: string }[] = [
  {
    id: "energy",
    text: "Trace energy through separate water circuits and calculate thermal-to-electrical efficiency.",
  },
  {
    id: "neutrons",
    text: "Distinguish fission, moderation and capture; interpret a neutron multiplication factor.",
  },
  {
    id: "control",
    text: "Use an energy balance to explain why temperature lags behind a power change.",
  },
  {
    id: "cooling",
    text: "Relate coolant flow to heat transport, stating what is held fixed.",
  },
  {
    id: "shutdown",
    text: "Distinguish decay heat from stored thermal energy and apply a simple half-life model.",
  },
];
export const courseSteps = [
  {
    name: "Puzzle",
    text: "Start from something surprising the reactor does.",
  },
  { name: "Predict", text: "Commit to an answer before you see the data." },
  { name: "Equation", text: "Meet the law that explains it, term by term." },
  {
    name: "Evidence",
    text: "Test your prediction against the lab model, then apply it somewhere new.",
  },
];
