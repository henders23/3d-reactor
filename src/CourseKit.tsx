import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Atom } from "lucide-react";
import {
  judge,
  type CourseProgress,
  type CourseScreen,
  type NumericPart,
  type Verdict,
} from "./course";

export type Go = (screen: CourseScreen) => void;
export type SetProgress = (
  update: (p: CourseProgress) => CourseProgress,
) => void;
export type CourseProps = {
  screen: CourseScreen;
  go: Go;
  progress: CourseProgress;
  setProgress: SetProgress;
  cleared: string[];
  onLearn: () => void;
  onExplore: () => void;
  onLesson: (index: number) => void;
};

export const tones = {
  text: "#E8F1EE",
  text2: "#C9D8D4",
  amber: "#FFB648",
  amber2: "#FFD48A",
  blue: "#5CD6FF",
  blue2: "#A8E9FF",
} as const;

/* ---------- Typesetting helpers ---------- */
/** Renders “P_f”, “dT_f/dt”, “k_eff” style tokens with real subscripts. */
export function withSubs(text: string): ReactNode {
  return text
    .split(/(_[a-z→]+)/)
    .map((part, i) =>
      part.startsWith("_") ? <sub key={i}>{part.slice(1)}</sub> : part,
    );
}
export function Sym({
  b,
  s,
  tone,
}: {
  b: ReactNode;
  s?: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span className="c-sym" style={tone ? { color: tones[tone] } : undefined}>
      {b}
      {s !== undefined && <sub>{s}</sub>}
    </span>
  );
}
export function Frac({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <span className="c-frac">
      <span>{top}</span>
      <span>{bottom}</span>
    </span>
  );
}
export const Op = ({ children }: { children: ReactNode }) => (
  <span className="c-op">{children}</span>
);
export const laws: Record<
  string,
  { label: string; eq: ReactNode; legend: [string, keyof typeof tones][] }
> = {
  energy: {
    label: "eta equals P sub e over P sub th",
    eq: (
      <>
        <Sym b="η" tone="text2" />
        <Op>=</Op>
        <Frac
          top={<Sym b="P" s="e" tone="amber" />}
          bottom={<Sym b="P" s="th" tone="blue" />}
        />
      </>
    ),
    legend: [
      ["efficiency", "text2"],
      ["electrical power out", "amber"],
      ["thermal power in", "blue"],
    ],
  },
  neutrons: {
    label: "k eff equals N sub g plus 1 over N sub g",
    eq: (
      <>
        <Sym b="k" s="eff" tone="blue" />
        <Op>=</Op>
        <Frac top={<Sym b="N" s="g+1" />} bottom={<Sym b="N" s="g" />} />
      </>
    ),
    legend: [
      ["multiplication factor", "blue"],
      ["next generation ÷ this generation", "text2"],
    ],
  },
  control: {
    label:
      "C sub f times d T sub f over d t equals P sub f plus P sub d minus Q dot from fuel to coolant",
    eq: (
      <>
        <Sym b="C" s="f" tone="text2" />
        <Frac
          top={
            <>
              dT<sub>f</sub>
            </>
          }
          bottom="dt"
        />
        <Op>=</Op>
        <Sym b="P" s="f" tone="amber" />
        <Op>+</Op>
        <Sym b="P" s="d" tone="amber2" />
        <Op>−</Op>
        <Sym b="Q̇" s="f→c" tone="blue" />
      </>
    ),
    legend: [
      ["stored energy changing", "text2"],
      ["made by fission", "amber"],
      ["made by decay", "amber2"],
      ["carried away", "blue"],
    ],
  },
  cooling: {
    label: "Q dot equals m dot c sub p delta T",
    eq: (
      <>
        <Sym b="Q̇" tone="blue" />
        <Op>=</Op>
        <Sym b="ṁ" tone="blue2" />
        <Sym b="c" s="p" />
        <Sym b="ΔT" tone="amber" />
      </>
    ),
    legend: [
      ["heat carried per second", "blue"],
      ["mass flow", "blue2"],
      ["temperature rise", "amber"],
    ],
  },
  shutdown: {
    label:
      "P sub d of t equals P sub d zero times 2 to the minus t over T half",
    eq: (
      <>
        <Sym b="P" s="d" tone="amber2" />
        <Op>=</Op>
        <Sym b="P" s="d,0" tone="amber2" />
        <Op>·</Op>
        <span className="c-sym">
          2<sup>−t/T½</sup>
        </span>
      </>
    ),
    legend: [
      ["decay power", "amber2"],
      ["halves every half-life", "text2"],
    ],
  },
};
export function Law({ id, size }: { id: string; size: "hero" | "card" }) {
  return (
    <div
      className={`c-eq c-eq--${size}`}
      role="img"
      aria-label={laws[id].label}
    >
      {laws[id].eq}
    </div>
  );
}

/* ---------- Shared chrome ---------- */
export function useOnce<T>(make: () => T) {
  const ref = useRef<T | null>(null);
  if (ref.current === null) ref.current = make();
  return ref.current;
}
export function Brand() {
  return (
    <div className="c-brand">
      <Atom size={32} strokeWidth={1.5} aria-hidden="true" />
      <span>
        <strong>CORE</strong>
        <small>Nuclear Science</small>
      </span>
    </div>
  );
}
export const acts: [string, CourseScreen][] = [
  ["Puzzle", "puzzle"],
  ["Predict", "puzzle"],
  ["Equation", "equation"],
  ["Evidence", "evidence"],
  ["Explain", "evidence"],
  ["New situation", "evidence"],
];
export function InnerHeader({
  go,
  back,
  now,
}: {
  go: Go;
  back: [string, CourseScreen];
  now?: number;
}) {
  return (
    <header className="c-header">
      <button className="c-back" onClick={() => go(back[1])}>
        <ArrowLeft size={18} aria-hidden="true" />
        {back[0]}
      </button>
      {now && (
        <nav aria-label="Acts">
          <ol className="c-acts">
            {acts.map(([name, target], i) => (
              <li key={name}>
                <button
                  className={i + 1 < now ? "done" : i + 1 === now ? "now" : ""}
                  aria-current={i + 1 === now ? "step" : undefined}
                  onClick={() => go(target)}
                >
                  {i + 1} {name}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </header>
  );
}
export function NumericCard({
  part,
  tag,
  value,
  result,
  onInput,
  onCheck,
  tone = "amber",
}: {
  part: NumericPart;
  tag: string;
  value: string;
  result?: Verdict;
  onInput: (v: string) => void;
  onCheck: () => void;
  tone?: "amber" | "blue";
}) {
  const id = `c-q-${tag}-${part.id}`;
  return (
    <div
      className={`c-part ${result ? (result.ok ? "is-ok" : "is-retry") : ""}`}
    >
      <label htmlFor={id}>
        <b className={`c-tag c-tag--${tone}`}>{part.id}</b>{" "}
        {withSubs(part.question)}
      </label>
      <div className="c-answer">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="number"
          value={value}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCheck()}
        />
        {part.unit && <span className="c-unit">{part.unit}</span>}
        <button className={`c-check c-check--${tone}`} onClick={onCheck}>
          Check
        </button>
      </div>
      <p className="c-feedback" aria-live="polite">
        {result ? withSubs(result.message) : ""}
      </p>
    </div>
  );
}
export function useChallenge(parts: NumericPart[]) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Verdict>>({});
  const solved = parts.filter((p) => results[p.id]?.ok).length;
  return {
    solved,
    all: solved === parts.length,
    card: (p: NumericPart, tag: string, tone?: "amber" | "blue") => (
      <NumericCard
        key={p.id}
        part={p}
        tag={tag}
        tone={tone}
        value={answers[p.id] ?? ""}
        result={results[p.id]}
        onInput={(v) => setAnswers((a) => ({ ...a, [p.id]: v }))}
        onCheck={() =>
          setResults((r) => ({ ...r, [p.id]: judge(p, answers[p.id] ?? "") }))
        }
      />
    ),
  };
}

export function ChartFrame({
  label,
  axis,
  ticks = ["0 s", "10 s", "20 s"],
  children,
}: {
  label: string;
  axis: [string, string, string];
  ticks?: [string, string, string];
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 640 230" width="100%" role="img" aria-label={label}>
      <path d="M40 30 H630 M40 105 H630 M40 180 H630" stroke="#1F3532" />
      <g fontFamily="Space Grotesk, sans-serif" fontSize="12" fill="#9DB3AE">
        <text x="0" y="34">
          {axis[0]}
        </text>
        <text x="0" y="109">
          {axis[1]}
        </text>
        <text x="0" y="184">
          {axis[2]}
        </text>
        <text x="54" y="222">
          {ticks[0]}
        </text>
        <text x="324" y="222">
          {ticks[1]}
        </text>
        <text x="598" y="222">
          {ticks[2]}
        </text>
      </g>
      <path
        d="M60 14 V196"
        stroke="#FFB648"
        strokeDasharray="4 4"
        opacity=".7"
      />
      {children}
    </svg>
  );
}
