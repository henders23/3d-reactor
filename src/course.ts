import { initialState, step } from "./simulation";
import { guidedControls } from "./learning";

/** Screens of the curiosity-led course that sits in front of the 3D lab. */
export type CourseScreen = "map" | "chain" | "puzzle" | "equation" | "evidence";
export type Curve = "A" | "B" | "C" | "D";
export type CourseProgress = {
  sealed: { curve: Curve; confidence: number; reason: string } | null;
  chainSolved: boolean;
  controlSolved: boolean;
  explanation: string;
};
export const courseKey = "core-course-v1";
export const emptyCourse = (): CourseProgress => ({
  sealed: null,
  chainSolved: false,
  controlSolved: false,
  explanation: "",
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
export const deepDive: Record<string, CourseScreen | undefined> = {
  neutrons: "chain",
  control: "puzzle",
};

export type Mystery = {
  headline: string;
  intro: string;
  card: string;
  teaser: string;
  clue: string;
};
export const mysteries: Record<string, Mystery> = {
  energy: {
    headline:
      "A reactor makes 3,000 MW of heat. Only about a third becomes electricity. Where does the rest go?",
    intro:
      "Follow the energy from a splitting nucleus to the power socket. Somewhere along the way, most of it leaves the plant — on purpose.",
    card: "How much heat becomes electricity?",
    teaser: "Most of a power station’s heat never becomes electricity. Why?",
    clue: "Heat crosses the steam-generator wall. The water never does.",
  },
  neutrons: {
    headline:
      "Each fission releases about 2.4 neutrons. So why doesn’t every reactor run away?",
    intro:
      "Most neutrons never cause another fission. They leak out, or something swallows them. The whole game is the neutron budget.",
    card: "Will the chain sustain itself?",
    teaser: "A slowed-down neutron makes fission more likely, not less. How?",
    clue: "Moderated is not absorbed. A slow neutron can still cause fission.",
  },
  control: {
    headline:
      "Power drops in one second. The fuel takes its time. Where is the energy hiding?",
    intro:
      "Push the control rods in and fission power falls almost at once — yet the fuel cools as if it hadn’t heard. Something is storing energy. Find it, measure it, then write the law that governs it.",
    card: "Why does temperature lag behind power?",
    teaser: "The rods go in. Why doesn’t the fuel cool straight away?",
    clue: "Temperature tracks stored energy, not power. Its slope is set by generation minus transfer.",
  },
  cooling: {
    headline:
      "Slow the pump and the fuel heats up — while the power falls. How can both be true?",
    intro:
      "Less water flowing means each kilogram has to carry more heat. Then the core starts regulating itself.",
    card: "Can a hotter core make less power?",
    teaser: "Slow the pump, and the fuel heats up while power falls.",
    clue: "A temperature rise is not evidence of more fission. Check heat removal too.",
  },
  shutdown: {
    headline:
      "Every rod is in. The chain reaction is over. The core still makes megawatts. From what?",
    intro:
      "Shutting a reactor down stops the chain reaction, not the heat. Find out what keeps glowing, and for how long.",
    card: "Every rod is in. Why is the core still hot?",
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
  fuel: number;
  decay: number;
};
/** Runs the lab model's own control-rod experiment (rods 50% → 65%). */
export function controlRun(seconds = 20, dt = 0.5): RunPoint[] {
  const controls = guidedControls("control");
  let s = initialState();
  const out: RunPoint[] = [];
  for (let t = 0; t <= seconds + 1e-9; t += dt) {
    out.push({
      t: s.time,
      power: s.thermal * 100,
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
  { tag: string; title: string; body: string; ok: boolean }
> = {
  A: {
    tag: "SURPRISE",
    title: "The fuel didn’t follow the power.",
    body: "Power fell 9 points in one second; the fuel fell less than 1 °C. The fuel holds so much stored energy that one second of deficit barely dents it. Your sketch treated temperature like power — the most common mistake there is.",
    ok: false,
  },
  B: {
    tag: "MATCH",
    title: "Your sketch matches the data.",
    body: "No sudden drop: the fuel loses stored energy at a rate set by generation minus transfer. Now push further: by 10 s power had almost settled, yet the fuel was still falling more than 1 °C every second. Which part of the balance is still off?",
    ok: true,
  },
  C: {
    tag: "CLOSE, BUT",
    title: "There was no flat delay.",
    body: "The fuel started cooling at once, just slowly. The moment generation fell below transfer, dT/dt went negative.",
    ok: false,
  },
  D: {
    tag: "SURPRISE",
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
