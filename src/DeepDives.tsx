import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import {
  carnot,
  coolantRise,
  coolingChallenge,
  coolingPredict,
  decayPopulations,
  decayPower,
  energyChallenge,
  energyPredict,
  modelRun,
  mysteries,
  runAt,
  shutdownChallenge,
  shutdownPredict,
  type NumericPart,
  type PredictOption,
  type RunPoint,
} from "./course";
import {
  ChartFrame,
  InnerHeader,
  Law,
  useChallenge,
  useOnce,
  type CourseProps,
} from "./CourseKit";

/* ---------- Chart geometry for model traces (viewBox 640 × 230) ---------- */
const xs = (t: number, dur: number) => 60 + (t / dur) * 565;
const ys = (v: number, min: number, max: number) =>
  30 + ((max - v) / (max - min)) * 150;
function trace(
  run: RunPoint[],
  f: (p: RunPoint) => number,
  min: number,
  max: number,
  dur: number,
) {
  return (
    `M40 ${ys(f(run[0]), min, max).toFixed(1)} ` +
    run
      .map(
        (p) => `L${xs(p.t, dur).toFixed(1)} ${ys(f(p), min, max).toFixed(1)}`,
      )
      .join(" ")
  );
}
const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---------- Shared deep-dive blocks ---------- */
function useSolved(id: string, all: boolean, props: CourseProps) {
  const { progress, setProgress } = props;
  useEffect(() => {
    if (all && !progress.solved[id])
      setProgress((p) => ({ ...p, solved: { ...p.solved, [id]: true } }));
  }, [all, id, progress.solved, setProgress]);
}
function Hero({
  id,
  number,
  visual,
  note,
}: {
  id: string;
  number: string;
  visual: ReactNode;
  note?: ReactNode;
}) {
  return (
    <section className="c-hero c-hero--tight">
      <div className="c-stack c-stack--lg">
        <span className="c-eyebrow">INVESTIGATION {number} · THE MYSTERY</span>
        <h1 className="c-h1" tabIndex={-1}>
          {mysteries[id].headline}
        </h1>
        <p className="c-lead">{mysteries[id].intro}</p>
        <div className="c-law">
          <span className="c-eyebrow c-eyebrow--muted">
            THE LAW YOU’LL EARN
          </span>
          <Law id={id} size="hero" />
          {note && <p className="c-sub">{note}</p>}
        </div>
      </div>
      <div className="c-visual">{visual}</div>
    </section>
  );
}
/** Commit to an answer before the evidence appears. */
function Predict({
  id,
  prompt,
  options,
  props,
  children,
}: {
  id: string;
  prompt: ReactNode;
  options: PredictOption[];
  props: CourseProps;
  children: (revealed: boolean) => ReactNode;
}) {
  const locked = props.progress.predictions[id];
  const [choice, setChoice] = useState<number | null>(locked ?? null);
  const revealed = locked !== undefined;
  return (
    <section className="c-section" aria-labelledby={`c-pr-${id}`}>
      <span className="c-eyebrow">PREDICT FIRST</span>
      <h2 id={`c-pr-${id}`} className="c-h2">
        {prompt}
      </h2>
      <div className="c-grid2">
        <div className="c-stack">
          <div className="c-predict" role="group" aria-label="Your prediction">
            {options.map((o, i) => (
              <button
                key={o.text}
                className={`c-choice ${choice === i ? "on" : ""} ${revealed && o.ok ? "is-answer" : ""}`}
                aria-pressed={choice === i}
                disabled={revealed}
                onClick={() => setChoice(i)}
              >
                {o.text}
              </button>
            ))}
          </div>
          {!revealed ? (
            <button
              className="c-btn c-btn--primary"
              disabled={choice === null}
              onClick={() =>
                choice !== null &&
                props.setProgress((p) => ({
                  ...p,
                  predictions: { ...p.predictions, [id]: choice },
                }))
              }
            >
              <Lock size={18} aria-hidden="true" /> Lock it in and reveal
            </button>
          ) : (
            <div
              className={`c-verdict ${options[locked].ok ? "is-ok" : "is-retry"}`}
              role="status"
            >
              <span className="c-eyebrow">
                {options[locked].ok ? "YOUR PREDICTION HELD" : "SURPRISE"}
              </span>
              <p>{options[locked].feedback}</p>
            </div>
          )}
        </div>
        <div className="c-panel c-stack c-stack--sm">{children(revealed)}</div>
      </div>
    </section>
  );
}
function Ladder({ steps }: { steps: [string, ReactNode, boolean?][] }) {
  return (
    <section className="c-section" aria-label="Worked example">
      <h2 className="c-h2">Worked example</h2>
      <ol className="c-ladder">
        {steps.map(([label, body, math], i) => (
          <li key={label}>
            <span>
              {i + 1} · {label}
            </span>
            {math ? (
              <p className="c-eqtext c-eqtext--lg c-upright">{body}</p>
            ) : (
              <p>{body}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
function Challenge({
  id,
  title,
  brief,
  parts,
  props,
}: {
  id: string;
  title: string;
  brief: ReactNode;
  parts: NumericPart[];
  props: CourseProps;
}) {
  const challenge = useChallenge(parts);
  useSolved(id, challenge.all, props);
  return (
    <section className="c-challenge" aria-labelledby={`c-ch-${id}`}>
      <div className="c-section-head">
        <div className="c-stack c-stack--xs">
          <span className="c-eyebrow">
            CHALLENGE · THREE STEPS, NO MULTIPLE CHOICE
          </span>
          <h2 id={`c-ch-${id}`} className="c-h2 c-h2--sm">
            {title}
          </h2>
        </div>
        <span className="c-score">{challenge.solved} of 3 solved</span>
      </div>
      <p className="c-brief">{brief}</p>
      <div className="c-parts">{parts.map((p) => challenge.card(p, id))}</div>
    </section>
  );
}
function MindBender({
  question,
  equation,
  answer,
}: {
  question: ReactNode;
  equation: ReactNode;
  answer: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="c-tip c-tip--amber c-tip--big">
      <span>MIND-BENDER</span>
      <p className="c-clue-big">{question}</p>
      <p className="c-eqtext c-eqtext--lg c-amber2">{equation}</p>
      {open ? (
        <p role="status">{answer}</p>
      ) : (
        <button
          className="c-btn c-btn--ghost c-btn--small"
          onClick={() => setOpen(true)}
        >
          I’ve tried it — show me
        </button>
      )}
    </div>
  );
}
function Finale({
  id,
  number,
  props,
  next,
  bender,
}: {
  id: string;
  number: string;
  props: CourseProps;
  next: [string, () => void];
  bender: ReactNode;
}) {
  const solved = !!props.progress.solved[id];
  return (
    <section className="c-grid2 c-grid2--narrow c-section">
      {bender}
      <div className="c-clue c-clue--earned">
        <span>
          {solved
            ? `CLUE ${number} · IN YOUR NOTEBOOK`
            : `CLUE ${number} · SOLVE THE CHALLENGE TO KEEP IT`}
        </span>
        <p className="c-clue-big">{mysteries[id].clue}</p>
        <button className="c-link" onClick={next[1]}>
          {next[0]} →
        </button>
      </div>
    </section>
  );
}
function Readout({
  label,
  value,
  unit,
  tone,
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  tone: "up" | "down" | "steady" | "warn";
  sub?: ReactNode;
}) {
  return (
    <div className={`c-readout c-readout--${tone}`} role="status">
      <span className="c-eyebrow c-eyebrow--muted">{label}</span>
      <div className="c-readout-main">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>
      {sub && <span className="c-eqtext c-eqtext--sm">{sub}</span>}
    </div>
  );
}
function Slider({
  label,
  value,
  unit,
  min,
  max,
  step,
  set,
  name,
  blue,
}: {
  label: ReactNode;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  set: (n: number) => void;
  name: string;
  blue?: boolean;
}) {
  return (
    <label className={`c-range ${blue ? "c-range--blue" : ""}`}>
      <span>
        <span>{label}</span>
        <b>
          {value.toLocaleString("en-GB")} {unit}
        </b>
      </span>
      <input
        type="range"
        aria-label={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(+e.target.value)}
      />
    </label>
  );
}

/* ---------- Investigation 01 · Follow the energy ---------- */
function PlantVisual() {
  return (
    <svg
      viewBox="0 0 560 380"
      width="100%"
      role="img"
      aria-label="Animated plant: a primary loop carries heat from the reactor to the steam generator, steam spins the turbine and generator, and a separate cooling-water loop carries rejected heat from the condenser to a cooling tower"
    >
      <g fontFamily="Space Grotesk, sans-serif" fontSize="12" fill="#C9D8D4">
        <path
          className="c-a-flow"
          d="M130 150 H210"
          stroke="#FFB648"
          strokeWidth="6"
        />
        <path
          className="c-a-flow"
          d="M210 250 H130"
          stroke="#FFB648"
          strokeWidth="6"
        />
        <path
          className="c-a-flow"
          d="M235 92 V58 H330"
          stroke="#E8F1EE"
          strokeWidth="5"
          fill="none"
        />
        <path
          className="c-a-flow"
          d="M365 104 V196"
          stroke="#E8F1EE"
          strokeWidth="5"
          fill="none"
        />
        <path
          className="c-a-flow"
          d="M330 245 H262"
          stroke="#E8F1EE"
          strokeWidth="5"
          fill="none"
        />
        <path
          className="c-a-flow"
          d="M410 220 H476"
          stroke="#5CD6FF"
          strokeWidth="5"
          fill="none"
        />
        <path
          className="c-a-flow"
          d="M476 262 H410"
          stroke="#5CD6FF"
          strokeWidth="5"
          fill="none"
        />
        <rect
          x="40"
          y="110"
          width="90"
          height="180"
          rx="40"
          fill="#2A2111"
          stroke="#FFB648"
          strokeWidth="3"
        />
        {[62, 80, 98].map((x, i) => (
          <rect
            key={x}
            className="c-a-hot"
            x={x}
            y="150"
            width="10"
            height="100"
            rx="5"
            fill="#FFB648"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
        <text x="52" y="316">
          reactor
        </text>
        <rect
          x="210"
          y="92"
          width="52"
          height="200"
          rx="24"
          fill="#132422"
          stroke="#36605A"
          strokeWidth="3"
        />
        <text x="190" y="316">
          steam generator
        </text>
        <path
          d="M330 40 L400 26 V118 L330 104 Z"
          fill="#132422"
          stroke="#E8F1EE"
          strokeWidth="2"
        />
        <g className="c-a-spin" style={{ transformOrigin: "365px 72px" }}>
          <path
            d="M365 52 V92 M345 72 H385 M351 58 L379 86 M379 58 L351 86"
            stroke="#E8F1EE"
            strokeWidth="2.5"
          />
        </g>
        <rect
          x="418"
          y="48"
          width="56"
          height="48"
          rx="10"
          fill="#0F2630"
          stroke="#5CD6FF"
          strokeWidth="2"
        />
        <path
          className="c-a-hot"
          d="M450 56 L438 74 H448 L442 90 L460 68 H450 Z"
          fill="#FFD48A"
        />
        <path d="M474 72 H540" stroke="#FFD48A" strokeWidth="2" />
        <text x="330" y="140">
          turbine
        </text>
        <text x="420" y="116">
          generator
        </text>
        <text x="496" y="64" fill="#FFD48A">
          ≈ ⅓
        </text>
        <rect
          x="330"
          y="196"
          width="80"
          height="80"
          rx="14"
          fill="#132422"
          stroke="#36605A"
          strokeWidth="3"
        />
        <text x="334" y="296">
          condenser
        </text>
        <path
          d="M480 300 C492 260 492 230 482 196 H530 C520 230 520 260 532 300 Z"
          fill="#132422"
          stroke="#5CD6FF"
          strokeWidth="2"
        />
        <g fill="#9DB3AE" opacity=".7">
          <circle className="c-a-plume" cx="506" cy="186" r="10" />
          <circle
            className="c-a-plume"
            cx="512"
            cy="186"
            r="8"
            style={{ animationDelay: ".5s" }}
          />
          <circle
            className="c-a-plume"
            cx="500"
            cy="186"
            r="7"
            style={{ animationDelay: "1s" }}
          />
        </g>
        <text x="470" y="320" fill="#A8E9FF">
          ≈ ⅔ as heat
        </text>
      </g>
      <g fontFamily="Space Grotesk, sans-serif" fontSize="12">
        <text x="140" y="140" fill="#FFB648">
          primary
        </text>
        <text x="270" y="50" fill="#E8F1EE">
          steam
        </text>
        <text x="412" y="246" fill="#5CD6FF">
          cooling
        </text>
      </g>
    </svg>
  );
}
function Sankey({ pth, eta }: { pth: number; eta: number }) {
  const hIn = 40 + (pth / 4000) * 170;
  const y0 = 150 - hIn / 2;
  const he = hIn * eta;
  const hr = hIn - he;
  const ye = 30;
  const yr = 270 - hr;
  const band = (ya: number, h: number, yb: number) =>
    `M220 ${ya} C400 ${ya} 420 ${yb} 600 ${yb} L600 ${yb + h} C420 ${yb + h} 400 ${ya + h} 220 ${ya + h} Z`;
  const mid = (ya: number, h: number, yb: number) =>
    `M220 ${ya + h / 2} C400 ${ya + h / 2} 420 ${yb + h / 2} 600 ${yb + h / 2}`;
  const pe = pth * eta;
  return (
    <svg
      viewBox="0 0 640 300"
      width="100%"
      role="img"
      aria-label={`Energy flow: ${Math.round(pth)} MW of heat in, ${Math.round(pe)} MW of electricity and ${Math.round(pth - pe)} MW of rejected heat`}
    >
      <rect
        x="20"
        y={y0}
        width="200"
        height={hIn}
        fill="#FFB648"
        opacity=".85"
      />
      <path d={band(y0, he, ye)} fill="#E8F1EE" opacity=".9" />
      <path d={band(y0 + he, hr, yr)} fill="#5CD6FF" opacity=".75" />
      <path
        className="c-a-flow"
        d={mid(y0, he, ye)}
        stroke="#0A1312"
        strokeWidth="2"
        fill="none"
        opacity=".5"
      />
      <path
        className="c-a-flow"
        d={mid(y0 + he, hr, yr)}
        stroke="#0A1312"
        strokeWidth="2"
        fill="none"
        opacity=".5"
      />
      <g fontFamily="Space Grotesk, sans-serif" fontSize="15" fontWeight="600">
        <text x="30" y={y0 + hIn / 2 + 5} fill="#0A1312">
          {Math.round(pth).toLocaleString("en-GB")} MW heat
        </text>
        <text x="596" y={ye - 8} textAnchor="end" fill="#E8F1EE">
          {Math.round(pe).toLocaleString("en-GB")} MW electricity
        </text>
        <text x="596" y={yr + hr + 20} textAnchor="end" fill="#5CD6FF">
          {Math.round(pth - pe).toLocaleString("en-GB")} MW rejected heat
        </text>
      </g>
    </svg>
  );
}
function EnergyScreen(props: CourseProps) {
  const { go } = props;
  const [pth, setPth] = useState(3000);
  const [eta, setEta] = useState(33);
  const [hot, setHot] = useState(285);
  const [cold, setCold] = useState(35);
  const ceiling = carnot(hot, cold) * 100;
  const impossible = eta > ceiling;
  return (
    <>
      <InnerHeader
        go={go}
        back={["Course map", "map"]}
        label="INVESTIGATION 01 · FOLLOW THE ENERGY"
      />
      <Hero
        id="energy"
        number="01"
        visual={<PlantVisual />}
        note="Three separate water circuits. Heat crosses between them; the water never does."
      />
      <Predict
        id="energy"
        prompt="A plant makes 3,000 MW of heat and 1,000 MW of electricity. Where do the other 2,000 MW go?"
        options={energyPredict}
        props={props}
      >
        {(revealed) =>
          revealed ? (
            <>
              <span className="c-chart-title">
                Every second, at steady state
              </span>
              <Sankey pth={3000} eta={1 / 3} />
              <p className="c-sub">
                Energy in = electricity out + heat rejected. Nothing is
                destroyed; two-thirds of it is simply no longer useful.
              </p>
            </>
          ) : (
            <div className="c-hidden">
              <span className="c-a-q c-hidden-q" aria-hidden="true">
                ?
              </span>
              <p className="c-sub">
                Lock in your answer to see the energy flow.
              </p>
            </div>
          )
        }
      </Predict>

      <section className="c-section" aria-labelledby="c-en-ex">
        <div className="c-stack c-stack--sm">
          <h2 id="c-en-ex" className="c-h2">
            Follow every megawatt
          </h2>
          <p className="c-sub">
            Change the heat in and the efficiency. Then move the two
            temperatures — they set a ceiling no engine can beat.
          </p>
        </div>
        <div className="c-grid2">
          <div className="c-panel c-panel--tight">
            <Sankey pth={pth} eta={eta / 100} />
          </div>
          <div className="c-stack">
            <Readout
              label={
                impossible
                  ? "IMPOSSIBLE · ABOVE THE CARNOT CEILING"
                  : "ELECTRICAL OUTPUT"
              }
              value={Math.round((pth * eta) / 100).toLocaleString("en-GB")}
              unit="MW"
              tone={impossible ? "warn" : "steady"}
              sub={
                <>
                  ceiling η<sub>max</sub> = 1 − {Math.round(cold + 273)} K /{" "}
                  {Math.round(hot + 273)} K = {ceiling.toFixed(1)}%
                </>
              }
            />
            <div className="c-ranges">
              <Slider
                label={
                  <>
                    Heat in P<sub>th</sub>
                  </>
                }
                value={pth}
                unit="MW"
                min={1000}
                max={4000}
                step={50}
                set={setPth}
                name="Thermal power"
              />
              <Slider
                label="Efficiency η"
                value={eta}
                unit="%"
                min={20}
                max={60}
                step={0.5}
                set={setEta}
                name="Efficiency"
              />
              <Slider
                label={
                  <>
                    Steam T<sub>h</sub>
                  </>
                }
                value={hot}
                unit="°C"
                min={200}
                max={330}
                step={5}
                set={setHot}
                name="Steam temperature"
              />
              <Slider
                label={
                  <>
                    Condenser T<sub>c</sub>
                  </>
                }
                value={cold}
                unit="°C"
                min={10}
                max={60}
                step={1}
                set={setCold}
                name="Condenser temperature"
                blue
              />
            </div>
            <div className="c-eqlist">
              <p className="c-eqtext">
                η = P<sub>e</sub> / P<sub>th</sub>
              </p>
              <p className="c-eqtext">
                P<sub>th</sub> = P<sub>e</sub> + Q̇<sub>rej</sub>
              </p>
              <p className="c-eqtext">
                η<sub>max</sub> = 1 − T<sub>c</sub> / T<sub>h</sub>{" "}
                <small className="c-upright">(kelvin)</small>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Ladder
        steps={[
          ["GIVEN", "3,000 MW of heat in. 1,000 MW of electricity out."],
          ["EQUATION", "η = Pₑ / Pₜₕ", true],
          ["SUBSTITUTE", "1,000 / 3,000 = 0.333 = 33.3%", true],
          [
            "INTERPRET",
            "One third becomes electricity. The other 2,000 MW leaves as heat — conserved, but no longer useful.",
          ],
        ]}
      />
      <Challenge
        id="energy"
        title="From heat in to heat out — and the limit on both"
        brief="Each step uses the one before. The last asks why no plant can get anywhere near 100%."
        parts={energyChallenge}
        props={props}
      />
      <Finale
        id="energy"
        number="01"
        props={props}
        next={["Continue to Investigation 02", () => go("chain")]}
        bender={
          <MindBender
            question="That rejected heat goes into cooling water warmed by about 10 K. How many tonnes of water must flow through the condenser every second?"
            equation={<>ṁ = Q̇ / (c ΔT) = 2,278 MW / (4,180 × 10) ≈ ?</>}
            answer="About 54,500 kg/s — 54 tonnes every second, an Olympic pool roughly every 45 seconds. Q̇ = ṁcΔT is the key to Investigation 04."
          />
        }
      />
    </>
  );
}

/* ---------- Investigation 04 · Move the heat ---------- */
function Channel({ flow, outlet }: { flow: number; outlet: number }) {
  // Particle speed follows mass flow; the outlet colour deepens as ΔT grows.
  const dur = Math.max(0.5, Math.min(4, 24000 / flow / 4));
  const hotness = Math.max(0, Math.min(1, (outlet - 300) / 45));
  return (
    <svg
      viewBox="0 0 560 300"
      width="100%"
      role="img"
      aria-label={`Coolant channel: water enters at 290 °C and leaves at ${outlet.toFixed(0)} °C`}
    >
      <rect
        className="c-a-hot"
        x="40"
        y="60"
        width="480"
        height="34"
        rx="17"
        fill="#FFB648"
      />
      <rect
        className="c-a-hot"
        x="40"
        y="206"
        width="480"
        height="34"
        rx="17"
        fill="#FFB648"
        style={{ animationDelay: ".6s" }}
      />
      <rect x="40" y="104" width="480" height="92" fill="#0F2630" />
      <g>
        {Array.from({ length: 14 }, (_, i) => (
          <circle
            key={i}
            className="c-a-heatflow"
            cx="40"
            cy={118 + ((i * 29) % 64)}
            r="6"
            style={{
              animationDuration: `${dur.toFixed(2)}s`,
              animationDelay: `${(-(dur * i) / 14).toFixed(2)}s`,
            }}
          />
        ))}
      </g>
      <rect
        x="470"
        y="104"
        width="50"
        height="92"
        fill="#FFB648"
        opacity={0.15 + hotness * 0.5}
      />
      <g fontFamily="Space Grotesk, sans-serif" fontSize="14">
        <text x="40" y="44" fill="#C9D8D4">
          fuel
        </text>
        <text x="40" y="270" fill="#5CD6FF">
          290 °C in
        </text>
        <text x="520" y="270" textAnchor="end" fill="#FFB648">
          {outlet.toFixed(0)} °C out
        </text>
        <text x="280" y="44" textAnchor="middle" fill="#9DB3AE">
          heat flows into the water →
        </text>
      </g>
    </svg>
  );
}
function CoolingScreen(props: CourseProps) {
  const { go } = props;
  const run = useOnce(() => modelRun("cooling", 20));
  const [heat, setHeat] = useState(3000);
  const [flow, setFlow] = useState(18000);
  const rise = coolantRise(heat, flow);
  const outlet = 290 + rise;
  const boiling = outlet > 345;
  const [p0, p20] = [runAt(run, 0), runAt(run, 20)];
  return (
    <>
      <InnerHeader
        go={go}
        back={["Course map", "map"]}
        label="INVESTIGATION 04 · MOVE THE HEAT"
      />
      <Hero
        id="cooling"
        number="04"
        visual={<Channel flow={18000} outlet={320} />}
        note="Heat carried each second = mass flow × specific heat × temperature rise. Say what you hold fixed."
      />
      <Predict
        id="cooling"
        prompt="We cut pump flow to 65%. Nobody touches the rods. The fuel gets hotter. What does fission power do?"
        options={coolingPredict}
        props={props}
      >
        {(revealed) => (
          <>
            <div className="c-runlabel">
              <span>RUN 04-A · FLOW 100% → 65% · 20 MODEL SECONDS</span>
            </div>
            <span className="c-chart-title">Fuel temperature</span>
            <ChartFrame
              label={`Fuel temperature rises from ${p0.fuel.toFixed(1)} to ${p20.fuel.toFixed(1)} degrees Celsius over 20 seconds`}
              axis={["630°C", "615°C", "600°C"]}
            >
              <path
                className="c-a-draw-long"
                d={trace(run, (p) => p.fuel, 600, 630, 20)}
                fill="none"
                stroke="#FFB648"
                strokeWidth="3"
              />
            </ChartFrame>
            <span className="c-chart-title">Total thermal power</span>
            <ChartFrame
              label={
                revealed
                  ? `Total thermal power falls from ${p0.power.toFixed(1)}% to ${p20.power.toFixed(1)}% over 20 seconds`
                  : "Power hidden until you lock in a prediction"
              }
              axis={["100%", "90%", "80%"]}
            >
              {revealed ? (
                <path
                  className="c-a-draw-long"
                  d={trace(run, (p) => p.power, 80, 100, 20)}
                  fill="none"
                  stroke="#E8F1EE"
                  strokeWidth="3"
                />
              ) : (
                <text
                  className="c-a-q"
                  x="300"
                  y="140"
                  fontFamily="Space Grotesk, sans-serif"
                  fontSize="96"
                  fontWeight="700"
                  fill="#E8F1EE"
                >
                  ?
                </text>
              )}
            </ChartFrame>
            {revealed && (
              <p className="c-sub">
                Fuel {p0.fuel.toFixed(1)} → {p20.fuel.toFixed(1)} °C while power
                fell {p0.power.toFixed(1)} → {p20.power.toFixed(1)}%. A hotter
                core, making less power.
              </p>
            )}
          </>
        )}
      </Predict>

      <section className="c-section" aria-labelledby="c-co-ex">
        <div className="c-stack c-stack--sm">
          <h2 id="c-co-ex" className="c-h2">
            Carry the heat
          </h2>
          <p className="c-sub">
            Water enters the core at 290 °C. Choose the heat load and the pump
            flow, and watch how hot it leaves.
          </p>
        </div>
        <div className="c-grid2">
          <div className="c-panel c-panel--tight">
            <Channel flow={flow} outlet={outlet} />
          </div>
          <div className="c-stack">
            <Readout
              label={
                boiling
                  ? "PAST ~345 °C · WATER AT 15.5 MPA WOULD BOIL"
                  : "TEMPERATURE RISE ACROSS THE CORE"
              }
              value={rise.toFixed(1)}
              unit="K"
              tone={boiling ? "warn" : rise > 35 ? "up" : "down"}
              sub={
                <>
                  ΔT = {heat.toLocaleString("en-GB")} MW / (
                  {flow.toLocaleString("en-GB")} kg/s × 5,500 J/(kg·K))
                </>
              }
            />
            <div className="c-ranges">
              <Slider
                label="Heat load Q̇"
                value={heat}
                unit="MW"
                min={1000}
                max={3500}
                step={50}
                set={setHeat}
                name="Heat load"
              />
              <Slider
                label="Mass flow ṁ"
                value={flow}
                unit="kg/s"
                min={6000}
                max={24000}
                step={500}
                set={setFlow}
                name="Mass flow"
                blue
              />
            </div>
            <div className="c-regimes c-regimes--two">
              <div className="c-regime">
                <span className="c-eqtext">ṁ ÷ 2, Q̇ fixed</span>
                <small>ΔT doubles: each kilogram carries twice the heat</small>
              </div>
              <div className="c-regime">
                <span className="c-eqtext">ṁ ÷ 2, ΔT fixed</span>
                <small>Q̇ halves: the water can only carry half the heat</small>
              </div>
            </div>
            <p className="c-sub">
              c<sub>p</sub> = 5,500 J/(kg·K) is roughly right for water near 300
              °C at 15.5 MPa. These are illustrative plant numbers, not the lab
              model’s.
            </p>
          </div>
        </div>
      </section>

      <Ladder
        steps={[
          ["GIVEN", "ṁ = 18,000 kg/s, cₚ = 5,500 J/(kg·K), ΔT = 30 K."],
          ["EQUATION", "Q̇ = ṁ cₚ ΔT", true],
          ["SUBSTITUTE", "18,000 × 5,500 × 30 = 2.97 × 10⁹ W", true],
          [
            "INTERPRET",
            "About 2,970 MW. Mass flow is kilograms per second, not a speed — the size of the pipe matters as much as how fast the water moves.",
          ],
        ]}
      />
      <Challenge
        id="cooling"
        title="Slow the pumps and follow the consequences"
        brief="The same core, three ways. Watch what you hold fixed in each part."
        parts={coolingChallenge}
        props={props}
      />
      <Finale
        id="cooling"
        number="04"
        props={props}
        next={["Continue to Investigation 05", () => go("shutdown")]}
        bender={
          <MindBender
            question="Switch every pump off. Hot water is less dense, so it still rises out of the core and cooler water sinks back in. Why can that cool a reactor after shutdown — but never at full power?"
            equation={<>Q̇ = ṁ cₚ ΔT, with ṁ only a few % of normal</>}
            answer="Natural circulation moves only a few percent of the normal flow. That can match the few percent of decay heat after shutdown. At full power, the same equation would demand a temperature rise far beyond boiling."
          />
        }
      />
    </>
  );
}

/* ---------- Investigation 05 · After shutdown ---------- */
function DecayField() {
  const reduced = useOnce(reducedMotion);
  // Nucleus i decays after log2(64 / (64 − i)) half-lives; one half-life per second.
  const order = Array.from({ length: 64 }, (_, i) => (i * 37) % 64);
  return (
    <svg
      viewBox="0 0 520 380"
      width="100%"
      role="img"
      aria-label="Sixty-four radioactive nuclei. Each second, about half of those still glowing go dark: the population halves every half-life but never suddenly reaches zero"
    >
      {order.map((rank, i) => {
        const t = Math.log2(64 / (64 - rank));
        const f = Math.min(0.97, t / 6);
        return (
          <circle
            key={i}
            cx={92 + (i % 8) * 48}
            cy={40 + Math.floor(i / 8) * 40}
            r="13"
            fill="#FFB648"
          >
            {!reduced && (
              <animate
                attributeName="opacity"
                values="1;1;0.12;0.12"
                keyTimes={`0;${f.toFixed(3)};${(f + 0.02).toFixed(3)};1`}
                dur="6s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        );
      })}
      <text
        x="260"
        y="366"
        textAnchor="middle"
        fontFamily="Space Grotesk, sans-serif"
        fontSize="14"
        fill="#9DB3AE"
      >
        1 second = 1 half-life · watch half of the glowing nuclei go dark
      </text>
    </svg>
  );
}
function ShutdownScreen(props: CourseProps) {
  const { go } = props;
  const run = useOnce(() => modelRun("shutdown", 30));
  const [t, setT] = useState(100);
  const [a, b] = decayPopulations;
  const pa = decayPower(a.p0, a.halfLife, t);
  const pb = decayPower(b.p0, b.halfLife, t);
  const total = pa + pb;
  const curve = (f: (s: number) => number) =>
    Array.from({ length: 121 }, (_, i) => i * 5)
      .map(
        (s, i) =>
          `${i ? "L" : "M"}${(60 + (s / 600) * 565).toFixed(1)} ${ys(f(s), 0, 8).toFixed(1)}`,
      )
      .join(" ");
  const [p0, p1, p30] = [runAt(run, 0), runAt(run, 1), runAt(run, 30)];
  return (
    <>
      <InnerHeader
        go={go}
        back={["Course map", "map"]}
        label="INVESTIGATION 05 · AFTER SHUTDOWN"
      />
      <Hero
        id="shutdown"
        number="05"
        visual={<DecayField />}
        note="For one isolated population, decay power halves every half-life. Real fuel holds hundreds of them."
      />
      <Predict
        id="shutdown"
        prompt="Every rod drops in. Thirty seconds later, how much heat is the core still making?"
        options={shutdownPredict}
        props={props}
      >
        {(revealed) => (
          <>
            <div className="c-runlabel">
              <span>RUN 05-A · ALL RODS IN · 30 MODEL SECONDS</span>
            </div>
            <span className="c-chart-title">
              Total thermal power{" "}
              <span className="c-amber">· decay heat dashed</span>
            </span>
            <ChartFrame
              label={
                revealed
                  ? `Total thermal power falls from 100% to ${p1.power.toFixed(1)}% in one second and to ${p30.power.toFixed(1)}% at 30 seconds; decay heat is ${p30.decay.toFixed(2)}% at 30 seconds`
                  : "Power after shutdown hidden until you lock in a prediction"
              }
              axis={["100%", "50%", "0%"]}
              ticks={["0 s", "15 s", "30 s"]}
            >
              {revealed ? (
                <>
                  <path
                    className="c-a-draw-long"
                    d={trace(run, (p) => p.power, 0, 100, 30)}
                    fill="none"
                    stroke="#E8F1EE"
                    strokeWidth="3"
                  />
                  <path
                    d={trace(run, (p) => p.decay, 0, 100, 30)}
                    fill="none"
                    stroke="#FFB648"
                    strokeWidth="2.5"
                    strokeDasharray="7 5"
                  />
                </>
              ) : (
                <>
                  <path d="M40 30 H60" stroke="#E8F1EE" strokeWidth="3" />
                  <text
                    className="c-a-q"
                    x="300"
                    y="140"
                    fontFamily="Space Grotesk, sans-serif"
                    fontSize="96"
                    fontWeight="700"
                    fill="#E8F1EE"
                  >
                    ?
                  </text>
                </>
              )}
            </ChartFrame>
            {revealed && (
              <table className="c-table">
                <caption>RECORDED IN THE LAB MODEL</caption>
                <thead>
                  <tr>
                    <th scope="col">Quantity</th>
                    <th scope="col">0 s</th>
                    <th scope="col">1 s</th>
                    <th scope="col">30 s</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Total thermal power</th>
                    <td>{p0.power.toFixed(1)}%</td>
                    <td className="c-strong">{p1.power.toFixed(1)}%</td>
                    <td className="c-strong">{p30.power.toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <th scope="row">of which decay heat</th>
                    <td>{p0.decay.toFixed(2)}%</td>
                    <td>{p1.decay.toFixed(2)}%</td>
                    <td className="c-amber">{p30.decay.toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <th scope="row">Fuel temperature</th>
                    <td>{p0.fuel.toFixed(0)} °C</td>
                    <td>{p1.fuel.toFixed(0)} °C</td>
                    <td>{p30.fuel.toFixed(0)} °C</td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        )}
      </Predict>

      <section className="c-section" aria-labelledby="c-sd-ex">
        <div className="c-stack c-stack--sm">
          <h2 id="c-sd-ex" className="c-h2">
            Two clocks at once
          </h2>
          <p className="c-sub">
            Real fuel holds many radioactive populations. Here are just two: a
            fast one and a slow one. Slide through time and watch which one
            carries the heat.
          </p>
        </div>
        <div className="c-grid2">
          <div className="c-panel c-stack c-stack--sm">
            <div className="c-legend-row">
              <span>
                <svg width="28" height="6" aria-hidden="true">
                  <path d="M0 3H28" stroke="#E8F1EE" strokeWidth="3" />
                </svg>
                Total
              </span>
              <span>
                <svg width="28" height="6" aria-hidden="true">
                  <path d="M0 3H28" stroke="#FFB648" strokeWidth="3" />
                </svg>
                {a.name} (T½ = {a.halfLife} s)
              </span>
              <span>
                <svg width="28" height="6" aria-hidden="true">
                  <path
                    d="M0 3H28"
                    stroke="#5CD6FF"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                </svg>
                {b.name} (T½ = {b.halfLife} s)
              </span>
            </div>
            <ChartFrame
              label={`Decay power over 600 seconds. At ${t} s: short-lived ${pa.toFixed(2)} MW, long-lived ${pb.toFixed(2)} MW, total ${total.toFixed(2)} MW`}
              axis={["8 MW", "4 MW", "0 MW"]}
              ticks={["0 s", "300 s", "600 s"]}
            >
              <path
                d={curve((s) => decayPower(a.p0, a.halfLife, s))}
                fill="none"
                stroke="#FFB648"
                strokeWidth="2.5"
              />
              <path
                d={curve((s) => decayPower(b.p0, b.halfLife, s))}
                fill="none"
                stroke="#5CD6FF"
                strokeWidth="2.5"
                strokeDasharray="7 5"
              />
              <path
                d={curve(
                  (s) =>
                    decayPower(a.p0, a.halfLife, s) +
                    decayPower(b.p0, b.halfLife, s),
                )}
                fill="none"
                stroke="#E8F1EE"
                strokeWidth="3"
              />
              <path
                d={`M${xs(t, 600).toFixed(1)} 20 V186`}
                stroke="#FFD48A"
                strokeWidth="2"
              />
              <circle
                cx={xs(t, 600)}
                cy={ys(total, 0, 8)}
                r="6"
                fill="#E8F1EE"
              />
            </ChartFrame>
          </div>
          <div className="c-stack">
            <Readout
              label={`DECAY POWER AT t = ${t} s`}
              value={total.toFixed(2)}
              unit="MW"
              tone="up"
              sub={
                <>
                  = {pa.toFixed(2)} + {pb.toFixed(2)} MW · slow share{" "}
                  {Math.round((pb / total) * 100)}%
                </>
              }
            />
            <div className="c-ranges">
              <Slider
                label="Time since shutdown t"
                value={t}
                unit="s"
                min={0}
                max={600}
                step={5}
                set={setT}
                name="Time since shutdown"
              />
            </div>
            <div className="c-halving" aria-label="Halving ladder for 8 MW">
              {[8, 4, 2, 1, 0.5].map((v, i) => (
                <span key={v}>
                  <b>{v} MW</b>
                  <small>{i === 0 ? "start" : `after ${i} × T½`}</small>
                </span>
              ))}
            </div>
            <p className="c-sub">
              The fast population dominates at first, then vanishes. After a
              minute or two, almost all of the heat comes from the slow one —
              which is why decay heat lingers for hours in a real core.
            </p>
          </div>
        </div>
      </section>

      <Ladder
        steps={[
          [
            "GIVEN",
            "8 MW initially, half-life 20 s. Find the power after 40 s.",
          ],
          [
            "EQUATION",
            <>
              P<sub>d</sub> = P<sub>d,0</sub> · 2<sup>−t/T½</sup>
            </>,
            true,
          ],
          ["SUBSTITUTE", "8 × 2^(−40/20) = 8 / 4 = 2 MW", true],
          [
            "INTERPRET",
            "Two half-lives leave a quarter, not zero. A half-life is not the time until everything has decayed.",
          ],
        ]}
      />
      <Challenge
        id="shutdown"
        title="Read the decay clocks"
        brief="Part a needs a fractional number of half-lives. Part b needs two clocks at once. Part c runs the clock backwards."
        parts={shutdownChallenge}
        props={props}
      />
      <Finale
        id="shutdown"
        number="05"
        props={props}
        next={["Back to the course map", () => go("map")]}
        bender={
          <MindBender
            question="A rule of thumb for real cores: decay heat is about 6–7% of full power just after shutdown, and around 1% an hour later. For a 3,000 MW core, how many 3 kW kettles could that hour-later heat keep boiling?"
            equation={<>1% × 3,000 MW ÷ 3 kW ≈ ?</>}
            answer="About 30 MW — enough for 10,000 kettles, an hour after the chain reaction stopped. That’s why shutdown cooling is a safety system in its own right."
          />
        }
      />
    </>
  );
}

export const deepDiveScreens = {
  energy: EnergyScreen,
  cooling: CoolingScreen,
  shutdown: ShutdownScreen,
};
