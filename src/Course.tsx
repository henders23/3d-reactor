import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, Lock, Star } from "lucide-react";
import { lessons } from "./content";
import {
  chainChallenge,
  chainState,
  chart,
  confidenceLevels,
  controlRun,
  curveOptions,
  deepDive,
  explanationBlocks,
  explanationIdeas,
  feedbackOptions,
  fuelPath,
  heatChallenge,
  heatHints,
  heatRate,
  judge,
  kEff,
  mysteries,
  neutronsPerFission,
  openQuestions,
  powerPath,
  pumpPart,
  runAt,
  signed,
  verdicts,
  type CourseScreen,
  type Curve,
  type Verdict,
} from "./course";
import {
  Brand,
  ChartFrame,
  Frac,
  InnerHeader,
  Law,
  NumericCard,
  Op,
  Sym,
  laws,
  tones,
  useChallenge,
  useOnce,
  withSubs,
  type CourseProps,
} from "./CourseKit";
import { deepDiveScreens } from "./DeepDives";
import { IntroScreen } from "./Intro";
export type { CourseProps } from "./CourseKit";

/* ---------- Course map ---------- */
function CoreVisual() {
  return (
    <svg
      viewBox="0 0 520 470"
      width="100%"
      role="img"
      aria-label="Animated cross-section of a reactor core: control rods slide down between glowing fuel rods while neutrons scatter outward through the water"
    >
      <defs>
        <radialGradient id="c-cher" cx="50%" cy="52%" r="50%">
          <stop offset="0%" stopColor="#5CD6FF" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#1C6E8A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0D1918" stopOpacity="0" />
        </radialGradient>
        <clipPath id="c-core">
          <circle cx="260" cy="245" r="176" />
        </clipPath>
      </defs>
      <circle
        cx="260"
        cy="245"
        r="200"
        fill="none"
        stroke="#24403D"
        strokeWidth="2"
      />
      <circle
        cx="260"
        cy="245"
        r="190"
        fill="none"
        stroke="#36605A"
        strokeWidth="8"
      />
      <circle
        className="c-a-glow"
        cx="260"
        cy="245"
        r="176"
        fill="url(#c-cher)"
      />
      <g clipPath="url(#c-core)">
        <path
          className="c-a-flow"
          d="M74 420 V70"
          stroke="#5CD6FF"
          strokeWidth="2"
          opacity=".5"
        />
        <path
          className="c-a-flow"
          d="M446 420 V70"
          stroke="#5CD6FF"
          strokeWidth="2"
          opacity=".5"
        />
        <g fill="#FFB648">
          {[
            [146, 130, 230, true, 0],
            [190, 110, 270, false, 0],
            [234, 100, 290, true, 0.4],
            [278, 100, 290, false, 0],
            [322, 110, 270, true, 0.7],
            [366, 130, 230, false, 0],
            [102, 160, 170, false, 0],
            [410, 160, 170, false, 0],
          ].map(([x, y, h, hot, delay], i) => (
            <rect
              key={i}
              className={hot ? "c-a-hot" : undefined}
              x={x as number}
              y={y as number}
              width="22"
              height={h as number}
              rx="11"
              opacity={hot ? undefined : 0.7}
              style={
                delay
                  ? { animationDelay: `${(delay as number) / 2.5}s` }
                  : undefined
              }
            />
          ))}
        </g>
        <g className="c-a-rod">
          {[
            [169, 90],
            [257, 80],
            [345, 90],
          ].map(([x, y]) => (
            <rect
              key={x}
              x={x}
              y={y}
              width="18"
              height="230"
              rx="3"
              fill="#2B3B3A"
              stroke="#7F9893"
              strokeWidth="1.5"
            />
          ))}
        </g>
        <g fill="#A8E9FF">
          <circle className="c-a-n1" cx="245" cy="260" r="4.5" />
          <circle className="c-a-n2" cx="289" cy="230" r="4.5" />
          <circle className="c-a-n3" cx="245" cy="210" r="4.5" />
          <circle className="c-a-n4" cx="333" cy="270" r="4.5" />
          <circle
            className="c-a-n1"
            cx="201"
            cy="300"
            r="4"
            style={{ animationDelay: ".26s" }}
          />
          <circle
            className="c-a-n3"
            cx="377"
            cy="230"
            r="4"
            style={{ animationDelay: ".06s" }}
          />
        </g>
      </g>
      <g fontFamily="Space Grotesk, sans-serif" fontSize="13" fill="#C9D8D4">
        <path d="M396 140 L452 92 H500" stroke="#7F9893" fill="none" />
        <text x="440" y="84">
          control rod
        </text>
        <path d="M160 330 L96 420 H30" stroke="#7F9893" fill="none" />
        <text x="22" y="440">
          fuel rod
        </text>
        <path d="M430 360 L470 420 H505" stroke="#7F9893" fill="none" />
        <text x="420" y="440">
          water
        </text>
      </g>
    </svg>
  );
}
function MapScreen({ cleared, go, onLearn, onExplore, onLesson }: CourseProps) {
  const run = useOnce(() => controlRun());
  const first = runAt(run, 1);
  const currentIndex = lessons.findIndex((l) => !cleared.includes(l.id));
  const current = currentIndex === -1 ? null : lessons[currentIndex];
  const open = (i: number) => go(deepDive[lessons[i].id]);
  const clues = lessons.filter((l) => cleared.includes(l.id));
  return (
    <>
      <header className="c-header c-header--line">
        <Brand />
        <nav aria-label="Progress" className="c-header-tools">
          <div className="c-progress">
            <span className="c-segs" aria-hidden="true">
              {lessons.map((l, i) => (
                <span
                  key={l.id}
                  className={
                    cleared.includes(l.id)
                      ? "done"
                      : i === currentIndex
                        ? "now"
                        : ""
                  }
                />
              ))}
            </span>
            <span>{cleared.length} of 5 cleared</span>
          </div>
          <button className="c-overview-link" onClick={() => go("intro")}>
            Course overview
          </button>
          <a className="c-notebook-link" href="#notebook">
            <BookOpen size={18} aria-hidden="true" />
            Notebook
            <span className="c-count">{clues.length}</span>
          </a>
        </nav>
      </header>

      <section className="c-hero">
        <div className="c-stack c-stack--lg">
          {current ? (
            <>
              <h1 className="c-h1" tabIndex={-1}>
                {mysteries[current.id].headline}
              </h1>
              <p className="c-lead">{mysteries[current.id].intro}</p>
              <div className="c-law">
                <Law id={current.id} size="hero" />
                <div className="c-chips">
                  {laws[current.id].legend.map(([text, tone]) => (
                    <span key={text} className={`c-chip c-chip--${tone}`}>
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="c-h1" tabIndex={-1}>
                All five solved.
              </h1>
              <p className="c-lead">
                Replay any investigation, or design your own experiment in the
                3D lab.
              </p>
            </>
          )}
          <div className="c-actions">
            {current && (
              <button
                className="c-btn c-btn--primary"
                onClick={() => open(currentIndex)}
              >
                Open the puzzle <ArrowRight size={18} aria-hidden="true" />
              </button>
            )}
            {/* The guided route through the 3D lab stays available alongside the deep dives. */}
            <button className="c-btn c-btn--ghost" onClick={onLearn}>
              {cleared.length
                ? "Continue learning"
                : "Start with the essentials"}
            </button>
            <button className="c-btn c-btn--ghost" onClick={onExplore}>
              Explore freely
            </button>
          </div>
          <p className="c-meta">
            Five short investigations · allow 35–45 minutes including equation
            practice · go at your own pace
            {cleared.length ? ` · ${cleared.length}/5 completed` : ""}
          </p>
        </div>
        <div className="c-stack">
          <div className="c-visual">
            <CoreVisual />
          </div>
          <div className="c-spark-row">
            <div className="c-spark">
              <span>Fission power, rods in</span>
              <svg viewBox="0 0 200 64" width="100%" aria-hidden="true">
                <path
                  className="c-a-draw"
                  d="M0 10 H40 C46 10 48 34 56 38 C80 44 140 47 200 49"
                  fill="none"
                  stroke="#E8F1EE"
                  strokeWidth="2.5"
                />
              </svg>
              <strong>
                −{(100 - first.power).toFixed(0)}% in the first second
              </strong>
            </div>
            <div className="c-spark">
              <span>Fuel temperature, same moment</span>
              <svg viewBox="0 0 200 64" width="100%" aria-hidden="true">
                <path
                  className="c-a-draw"
                  d="M0 10 H40 C90 12 150 26 200 40"
                  fill="none"
                  stroke="#FFB648"
                  strokeWidth="2.5"
                  strokeDasharray="6 5"
                />
              </svg>
              <strong>
                −{(600 - first.fuel).toFixed(1)} °C in the first second
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="c-section" aria-labelledby="c-route-title">
        <div className="c-section-head">
          <div className="c-stack c-stack--sm">
            <h2 id="c-route-title" className="c-h2">
              Your route
            </h2>
            <p className="c-sub">
              Each one opens with a puzzle and ends with an equation.
            </p>
          </div>
        </div>
        <svg
          viewBox="0 0 1200 12"
          width="100%"
          height="12"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="c-a-flow"
            d="M0 6 H1200"
            stroke="#5CD6FF"
            strokeWidth="3"
            opacity=".7"
          />
        </svg>
        <ol className="c-route">
          {lessons.map((l, i) => {
            const status = cleared.includes(l.id)
              ? "cleared"
              : i === currentIndex
                ? "current"
                : "locked";
            return (
              <li key={l.id} className={`c-station c-station--${status}`}>
                <div className="c-station-top">
                  <span className="c-station-num">0{i + 1}</span>
                  <span className="c-station-status">
                    {status === "cleared"
                      ? "Cleared"
                      : status === "current"
                        ? "Up next"
                        : "Later"}
                  </span>
                </div>
                <h3>{mysteries[l.id].card}</h3>
                <div
                  className={
                    status === "locked" ? "c-station-eq c-blur" : "c-station-eq"
                  }
                  aria-hidden={status === "locked" ? true : undefined}
                >
                  <Law id={l.id} size="card" />
                </div>
                {status === "cleared" && (
                  <p>Clue earned: {mysteries[l.id].clue}</p>
                )}
                {status === "locked" && <p>{mysteries[l.id].teaser}</p>}
                {status === "current" && (
                  <button
                    className="c-btn c-btn--primary c-btn--small"
                    onClick={() => open(i)}
                  >
                    Open the puzzle
                  </button>
                )}
                {status === "cleared" && (
                  <button className="c-link" onClick={() => open(i)}>
                    {l.id === "neutrons"
                      ? "Replay the chain lab"
                      : "Replay the puzzle"}
                  </button>
                )}
                {status === "locked" && (
                  <button className="c-link" onClick={() => open(i)}>
                    Jump ahead
                  </button>
                )}
                {status !== "locked" && (
                  <button className="c-link" onClick={() => onLesson(i)}>
                    Run it in the 3D lab
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="c-section" aria-labelledby="c-q-title">
        <h2 id="c-q-title" className="c-h2">
          Can you answer these?
        </h2>
        <div className="c-questions">
          {openQuestions.map((q) => (
            <div key={q.text} className={`c-question c-question--${q.tone}`}>
              <span>{q.text}</span>
              <small>{q.where}</small>
            </div>
          ))}
        </div>
      </section>

      <section id="notebook" className="c-section" aria-labelledby="c-nb-title">
        <h2 id="c-nb-title" className="c-h2 c-h2--sm">
          Notebook
        </h2>
        <div className="c-clues">
          {clues.map((l) => (
            <div key={l.id} className="c-clue">
              <h3>Clue 0{lessons.indexOf(l) + 1}</h3>
              <p>{mysteries[l.id].clue}</p>
            </div>
          ))}
          {current && (
            <div className="c-clue c-clue--hidden">
              <h3>Clue 0{currentIndex + 1}</h3>
              <p>Found in Investigation 0{currentIndex + 1}.</p>
            </div>
          )}
        </div>
        <p className="c-note">
          This is a simplified learning model. Its colours, particles and timing
          help explain ideas; they are not measurements of a real plant.
        </p>
      </section>
    </>
  );
}

/* ---------- Investigation 03 · Acts 1–2 ---------- */
function PuzzleScreen({ go, progress, setProgress }: CourseProps) {
  const run = useOnce(() => controlRun());
  const fuel = fuelPath(run);
  const sealed = progress.sealed;
  const [choice, setChoice] = useState<Curve | null>(sealed?.curve ?? null);
  const [conf, setConf] = useState<number | null>(sealed?.confidence ?? null);
  const [reason, setReason] = useState(sealed?.reason ?? "");
  const pathOf = (c: Curve) =>
    curveOptions.find((o) => o.id === c)?.path ?? fuel;
  const first = runAt(run, 1);
  return (
    <>
      <InnerHeader go={go} back={["Course map", "map"]} now={2} />
      <section className="c-intro">
        <h1 className="c-h1" tabIndex={-1}>
          Rods in: power falls {(100 - first.power).toFixed(0)}% in a second.
          And the fuel?
        </h1>
        <p className="c-lead">
          This is the lab model’s real trace, with the temperature hidden.
          Sketch it first: a wrong prediction you can explain beats a lucky
          guess.
        </p>
      </section>
      <section className="c-grid2">
        <div className="c-panel c-stack">
          <div className="c-runlabel">
            <span>Lab model run: rods 50% → 65% over 20 s</span>
            <span className="c-live">
              <span className="c-dot c-dot--blue" /> recorded
            </span>
          </div>
          <div className="c-stack c-stack--xs">
            <span className="c-chart-title">Total thermal power</span>
            <ChartFrame
              label={`Power stays at 100% until the rods move, drops to ${first.power.toFixed(1)}% within one second, then declines slowly to ${run[run.length - 1].power.toFixed(1)}% at 20 seconds`}
              axis={["100%", "90%", "80%"]}
            >
              <path
                className="c-a-draw-long"
                d={powerPath(run)}
                fill="none"
                stroke="#E8F1EE"
                strokeWidth="3"
              />
            </ChartFrame>
          </div>
          <div className="c-stack c-stack--xs">
            <span className="c-chart-title">
              Fuel temperature <span className="c-amber">· your sketch</span>
            </span>
            <ChartFrame
              label={
                choice
                  ? `Your predicted fuel temperature: ${curveOptions.find((o) => o.id === choice)?.label}`
                  : "Fuel temperature hidden until you predict"
              }
              axis={["600°C", "585°C", "570°C"]}
            >
              {choice ? (
                <path
                  key={choice}
                  className="c-a-draw-long"
                  d={pathOf(choice)}
                  fill="none"
                  stroke="#FFB648"
                  strokeWidth="3"
                  strokeDasharray="9 6"
                />
              ) : (
                <>
                  <path d="M40 30 H60" stroke="#FFB648" strokeWidth="3" />
                  <text
                    className="c-a-q"
                    x="300"
                    y="140"
                    fontFamily="Space Grotesk, sans-serif"
                    fontSize="96"
                    fontWeight="700"
                    fill="#FFB648"
                  >
                    ?
                  </text>
                </>
              )}
            </ChartFrame>
          </div>
        </div>

        <div className="c-stack c-stack--lg">
          {!sealed ? (
            <>
              <fieldset className="c-fieldset">
                <legend>1 · Pick a curve</legend>
                <div className="c-options">
                  {curveOptions.map((o) => (
                    <button
                      key={o.id}
                      className={`c-option ${choice === o.id ? "on" : ""}`}
                      aria-pressed={choice === o.id}
                      onClick={() => setChoice(o.id)}
                    >
                      <strong>{o.id}</strong>
                      <svg
                        viewBox="0 0 640 200"
                        width="100%"
                        height="56"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d={pathOf(o.id)}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                        />
                      </svg>
                      <span>{o.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="c-fieldset">
                <legend>2 · How sure are you?</legend>
                <div className="c-confidence">
                  {confidenceLevels.map((label, i) => (
                    <button
                      key={label}
                      className={conf === i ? "on" : ""}
                      aria-pressed={conf === i}
                      onClick={() => setConf(i)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="c-stack c-stack--sm">
                <label htmlFor="c-why" className="c-legend">
                  3 · Because…
                </label>
                <textarea
                  id="c-why"
                  className="c-textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="When fission power falls, the fuel… because the energy already inside it…"
                />
              </div>
              <button
                className="c-btn c-btn--primary c-btn--wide"
                disabled={!(choice && conf !== null)}
                onClick={() =>
                  choice &&
                  conf !== null &&
                  setProgress((p) => ({
                    ...p,
                    sealed: { curve: choice, confidence: conf, reason },
                  }))
                }
              >
                <Lock size={18} aria-hidden="true" /> Seal my prediction
              </button>
            </>
          ) : (
            <div className="c-sealed" role="status">
              <strong>
                Sealed: curve {sealed.curve},{" "}
                {confidenceLevels[sealed.confidence].toLowerCase()}
              </strong>
              <p>
                It stays locked until you compare it with the recorded data.
                First, the equation that sets how fast the temperature changes.
              </p>
              <div className="c-actions">
                <button
                  className="c-btn c-btn--primary"
                  onClick={() => go("equation")}
                >
                  Next: the equation
                </button>
                {!progress.controlSolved && (
                  <button
                    className="c-btn c-btn--ghost"
                    onClick={() => setProgress((p) => ({ ...p, sealed: null }))}
                  >
                    Change my mind
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="c-tips">
            <div className="c-tip c-tip--blue">
              <p>
                Switch off a kettle. Is the water cold one second later? What
                would have to be true for it to be?
              </p>
            </div>
            <div className="c-tip">
              <p>
                Power is a rate: 1 MW means 1 MJ every second. Temperature is
                not a rate.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Investigation 03 · Act 3 ---------- */
const terms = {
  C: {
    name: "C_f · Fuel heat capacity",
    tone: "text2",
    unit: "J/K (here MJ/K)",
    meaning:
      "The energy needed to warm the whole fuel by one kelvin. It sets how sluggish the temperature is.",
    trap: "It isn’t specific heat per kilogram. A bigger C_f doesn’t change which way the fuel goes — only how fast.",
  },
  T: {
    name: "dT_f/dt · Rate of temperature change",
    tone: "text",
    unit: "K/s",
    meaning:
      "How fast the fuel temperature is changing right now: the slope of the temperature graph.",
    trap: "It’s a slope, not a temperature. Fuel at 600 °C can have dT/dt = 0, and the slope can be negative while the fuel is still very hot.",
  },
  Pf: {
    name: "P_f · Fission power",
    tone: "amber",
    unit: "W (here MW)",
    meaning:
      "Energy released by fission each second. The control rods act on this term, and it responds within seconds.",
    trap: "Cutting P_f does not cut the temperature. It changes the slope, not the value.",
  },
  Pd: {
    name: "P_d · Decay heat",
    tone: "amber2",
    unit: "W (here MW)",
    meaning:
      "Energy from radioactive decay of fission products. It keeps coming after fission is suppressed.",
    trap: "Rods can’t switch it off. Forget it, and every answer about shutdown is wrong.",
  },
  Q: {
    name: "Q̇_f→c · Heat to coolant",
    tone: "blue",
    unit: "W (here MW)",
    meaning:
      "Energy crossing from fuel into the water each second. The dot means it is a rate.",
    trap: "It isn’t fixed. It depends on how much hotter the fuel is than the water, so it falls as the fuel cools. Hold that thought.",
  },
} as const;
type TermID = keyof typeof terms;
function EquationScreen({ go }: CourseProps) {
  const [term, setTerm] = useState<TermID>("T");
  const [gen, setGen] = useState(90);
  const [decay, setDecay] = useState(5);
  const [removal, setRemoval] = useState(105);
  const [cap, setCap] = useState(20);
  const [hints, setHints] = useState(0);
  const challenge = useChallenge(heatChallenge);
  const rate = heatRate(gen, decay, removal, cap);
  const dir = Math.abs(rate) < 0.005 ? "steady" : rate > 0 ? "up" : "down";
  const total = gen + decay;
  const dots = (flow: number) => {
    // Five times the original design's speed: 52 / flow seconds per crossing.
    const dur = Math.max(0.12, Math.min(1.2, 52 / Math.max(flow, 1)));
    return Array.from({ length: 5 }, (_, i) => ({
      animationDuration: `${dur.toFixed(2)}s`,
      animationDelay: `${(-(dur * i) / 5).toFixed(2)}s`,
    }));
  };
  const t = terms[term];
  const termButton = (
    id: TermID,
    content: ReactNode,
    label: string,
    tone: keyof typeof tones,
  ) => (
    <button
      className={`c-term ${term === id ? "on" : ""}`}
      style={{ color: tones[tone] }}
      aria-pressed={term === id}
      aria-label={label}
      onClick={() => setTerm(id)}
    >
      {content}
    </button>
  );
  const slider = (
    label: ReactNode,
    tone: keyof typeof tones,
    value: number,
    set: (n: number) => void,
    min: number,
    max: number,
    unit: string,
    name: string,
  ) => (
    <label className="c-range">
      <span>
        <span style={{ color: tones[tone] }}>{label}</span>
        <b>
          {value} {unit}
        </b>
      </span>
      <input
        type="range"
        aria-label={name}
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => set(+e.target.value)}
      />
    </label>
  );
  return (
    <>
      <InnerHeader
        go={go}
        back={["Your sealed prediction", "puzzle"]}
        now={3}
      />
      <section className="c-intro c-intro--center">
        <h1 className="c-h1 c-h1--md" tabIndex={-1}>
          Energy in minus energy out
        </h1>
        <p className="c-sub">
          Tap a term to see what it means, and a common trap.
        </p>
        <div className="c-bigeq">
          {termButton(
            "C",
            <Sym b="C" s="f" />,
            "C sub f, fuel heat capacity",
            "text2",
          )}
          {termButton(
            "T",
            <Frac
              top={
                <>
                  dT<sub>f</sub>
                </>
              }
              bottom="dt"
            />,
            "d T sub f over d t, rate of temperature change",
            "text",
          )}
          <Op>=</Op>
          {termButton(
            "Pf",
            <Sym b="P" s="f" />,
            "P sub f, fission power",
            "amber",
          )}
          <Op>+</Op>
          {termButton(
            "Pd",
            <Sym b="P" s="d" />,
            "P sub d, decay heat",
            "amber2",
          )}
          <Op>−</Op>
          {termButton(
            "Q",
            <Sym b="Q̇" s="f→c" />,
            "Q dot, heat to coolant",
            "blue",
          )}
        </div>
        <div className="c-termgrid" aria-live="polite">
          <div className="c-termcard">
            <h3 style={{ color: tones[t.tone] }}>{withSubs(t.name)}</h3>
            <p>{t.meaning}</p>
            <small>Unit · {t.unit}</small>
          </div>
          <div className="c-termcard c-termcard--trap">
            <h3>The trap</h3>
            <p>{withSubs(t.trap)}</p>
          </div>
        </div>
      </section>

      <section className="c-section" aria-labelledby="c-bal-title">
        <div className="c-stack c-stack--sm">
          <h2 id="c-bal-title" className="c-h2">
            Play with the balance
          </h2>
          <p className="c-sub">
            The fuel is a reservoir of thermal energy. Change what flows in and
            out, and watch which way it moves.
          </p>
        </div>
        <div className="c-grid2">
          <div className="c-panel c-panel--tight">
            <svg
              viewBox="0 0 640 430"
              width="100%"
              role="img"
              aria-label={`Energy reservoir: ${total} MW flowing in, ${removal} MW flowing out; fuel temperature ${dir === "up" ? "rising" : dir === "down" ? "falling" : "steady"}`}
            >
              <defs>
                <clipPath id="c-tank">
                  <rect x="225" y="70" width="190" height="300" rx="22" />
                </clipPath>
              </defs>
              <rect
                x="20"
                y="96"
                width="210"
                height="28"
                rx="14"
                fill="#1F1A10"
                stroke="#5A4A2A"
              />
              <g fill="#FFB648">
                {dots(total).map((s, i) => (
                  <circle
                    key={i}
                    className="c-a-pipe"
                    cx="30"
                    cy="110"
                    r="7"
                    style={s}
                  />
                ))}
              </g>
              <text
                x="24"
                y="80"
                fontFamily="STIX Two Text, serif"
                fontStyle="italic"
                fontSize="24"
                fill="#FFB648"
              >
                P
                <tspan fontSize="14" dy="5">
                  f
                </tspan>
                <tspan dy="-5"> + P</tspan>
                <tspan fontSize="14" dy="5">
                  d
                </tspan>
              </text>
              <text
                x="24"
                y="156"
                fontFamily="Space Grotesk, sans-serif"
                fontSize="16"
                fill="#FFD48A"
              >
                {total} MW in
              </text>
              <rect
                x="410"
                y="316"
                width="210"
                height="28"
                rx="14"
                fill="#0F2630"
                stroke="#1C6E8A"
              />
              <g fill="#5CD6FF">
                {dots(removal).map((s, i) => (
                  <circle
                    key={i}
                    className="c-a-pipe"
                    cx="420"
                    cy="330"
                    r="7"
                    style={s}
                  />
                ))}
              </g>
              <text
                x="430"
                y="300"
                fontFamily="STIX Two Text, serif"
                fontStyle="italic"
                fontSize="24"
                fill="#5CD6FF"
              >
                Q̇
                <tspan fontSize="14" dy="5">
                  f→c
                </tspan>
              </text>
              <text
                x="430"
                y="378"
                fontFamily="Space Grotesk, sans-serif"
                fontSize="16"
                fill="#A8E9FF"
              >
                {removal} MW out
              </text>
              <rect
                x="225"
                y="70"
                width="190"
                height="300"
                rx="22"
                fill="#0A1312"
                stroke="#36605A"
                strokeWidth="3"
              />
              <g clipPath="url(#c-tank)">
                <g className={`c-a-lvl-${dir}`}>
                  <rect
                    x="225"
                    y="190"
                    width="190"
                    height="400"
                    fill="#FFB648"
                    opacity=".85"
                  />
                  <rect x="225" y="190" width="190" height="6" fill="#FFD48A" />
                </g>
              </g>
              <text
                x="320"
                y="56"
                textAnchor="middle"
                fontFamily="Space Grotesk, sans-serif"
                fontSize="15"
                fill="#C9D8D4"
              >
                fuel · stored thermal energy
              </text>
              <g className={`c-a-ar-${dir}`}>
                <text
                  x="320"
                  y="190"
                  textAnchor="middle"
                  fontFamily="Space Grotesk, sans-serif"
                  fontSize="56"
                  fontWeight="700"
                  fill="#0A1312"
                >
                  {dir === "up" ? "↑" : dir === "down" ? "↓" : "="}
                </text>
              </g>
              <text
                x="320"
                y="410"
                textAnchor="middle"
                fontFamily="Space Grotesk, sans-serif"
                fontSize="15"
                fill="#9DB3AE"
              >
                a bigger C
                <tspan fontSize="11" dy="4">
                  f
                </tspan>
                <tspan dy="-4"> makes the level move more slowly</tspan>
              </text>
            </svg>
          </div>
          <div className="c-stack">
            <div className={`c-readout c-readout--${dir}`} role="status">
              <span className="c-label">
                Fuel temperature is{" "}
                {dir === "up"
                  ? "rising"
                  : dir === "down"
                    ? "falling"
                    : "steady"}
              </span>
              <div className="c-readout-main">
                <span className="c-eqtext">
                  dT<sub>f</sub>/dt =
                </span>
                <strong>{signed(rate)}</strong>
                <span>K/s</span>
              </div>
              <span className="c-eqtext c-eqtext--sm">
                = ({gen} + {decay} − {removal}) MW ÷ {cap} MJ/K
              </span>
            </div>
            <div className="c-ranges">
              {slider(
                <>
                  Fission power P<sub>f</sub>
                </>,
                "amber",
                gen,
                setGen,
                40,
                140,
                "MW",
                "Fission power",
              )}
              {slider(
                <>
                  Decay heat P<sub>d</sub>
                </>,
                "amber2",
                decay,
                setDecay,
                0,
                20,
                "MW",
                "Decay heat",
              )}
              {slider(
                <>To coolant Q̇</>,
                "blue",
                removal,
                setRemoval,
                40,
                140,
                "MW",
                "Heat to coolant",
              )}
              {slider(
                <>
                  Heat capacity C<sub>f</sub>
                </>,
                "text2",
                cap,
                setCap,
                5,
                40,
                "MJ/K",
                "Fuel heat capacity",
              )}
            </div>
            <div className="c-regimes">
              {[
                ["P > Q̇", "warms", "up"],
                ["P = Q̇", "holds steady", "steady"],
                ["P < Q̇", "cools", "down"],
              ].map(([rule, label, d]) => (
                <div key={d} className={`c-regime ${dir === d ? "on" : ""}`}>
                  <span className="c-eqtext">{rule}</span>
                  <small>{label}</small>
                </div>
              ))}
            </div>
            <p className="c-sub">
              Try it: drag{" "}
              <span className="c-amber">
                P<sub>f</sub>
              </span>{" "}
              down sharply. Now double C<sub>f</sub>. What happens to how fast
              the fuel cools — and does the direction change?
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" aria-labelledby="c-we-title">
        <h2 id="c-we-title" className="c-h2">
          Worked example
        </h2>
        <ol className="c-ladder">
          <li>
            <span>1 · GIVEN</span>
            <p>
              Generation 120 MW. Transfer to coolant 100 MW. Fuel heat capacity
              20 MJ/K.
            </p>
          </li>
          <li>
            <span>2 · REARRANGE</span>
            <p className="c-eqtext c-eqtext--lg">dT/dt = (P − Q̇) / C</p>
          </li>
          <li>
            <span>3 · SUBSTITUTE</span>
            <p className="c-eqtext c-eqtext--lg c-upright">
              (120 − 100) / 20 = <span className="c-amber">+1 K/s</span>
            </p>
          </li>
          <li>
            <span>4 · INTERPRET</span>
            <p>
              The fuel warms by 1 kelvin each second right now. That is a slope,
              not a temperature: MW ÷ MJ/K leaves K/s.
            </p>
          </li>
        </ol>
      </section>

      <section className="c-challenge" aria-labelledby="c-ch-title">
        <div className="c-section-head">
          <div className="c-stack c-stack--xs">
            <h2 id="c-ch-title" className="c-h2 c-h2--sm">
              After the rods drop
            </h2>
          </div>
          <span className="c-score">{challenge.solved} of 3 solved</span>
        </div>
        <p className="c-brief">
          At steady state a core makes <b className="c-amber">100 MW</b> of
          fission power plus <b className="c-amber2">5 MW</b> of decay heat, and{" "}
          <b className="c-blue">105 MW</b> flows to the coolant. The rods drop
          fission power to <b className="c-amber">90 MW</b> almost at once. For
          the next few seconds, transfer to the coolant stays near 105 MW.{" "}
          <b>
            C<sub>f</sub> = 20 MJ/K.
          </b>
        </p>
        <div className="c-parts">
          {heatChallenge.map((p) => challenge.card(p, "heat"))}
        </div>
        <div className="c-hints">
          <button
            className="c-btn c-btn--ghost c-btn--small"
            disabled={hints >= heatHints.length}
            onClick={() => setHints((h) => Math.min(heatHints.length, h + 1))}
          >
            {hints >= heatHints.length
              ? "All hints shown"
              : `Show hint ${hints + 1} of 3`}
          </button>
          {heatHints.slice(0, hints).map((h) => (
            <span key={h} className="c-hint">
              {h}
            </span>
          ))}
        </div>
        {challenge.all && (
          <div className="c-next">
            <p>
              Part c is the key. As the fuel cools, Q̇ shrinks toward 95 MW, so
              the cooling must eventually slow and level off. How soon? The
              recorded run will tell you.
            </p>
            <button
              className="c-btn c-btn--primary"
              onClick={() => go("evidence")}
            >
              Act 4 · Unseal the data
            </button>
          </div>
        )}
        {!challenge.all && (
          <button className="c-link" onClick={() => go("evidence")}>
            Skip to the evidence
          </button>
        )}
      </section>
    </>
  );
}

/* ---------- Investigation 03 · Acts 4–6 ---------- */
function EvidenceScreen({ go, progress, setProgress }: CourseProps) {
  const run = useOnce(() => controlRun());
  const [pick, setPick] = useState<Curve | null>(
    progress.sealed?.curve ?? null,
  );
  const [pump, setPump] = useState("");
  const [pumpResult, setPumpResult] = useState<Verdict | undefined>();
  const [why, setWhy] = useState<number | null>(null);
  const curve = progress.sealed?.curve ?? pick;
  const v = curve ? verdicts[curve] : null;
  const at = (t: number) => runAt(run, t);
  const [p0, p1, p10, p20] = [at(0), at(1), at(10), at(20)];
  const ideas = explanationIdeas(progress.explanation);
  const transferDone =
    !!pumpResult?.ok && why !== null && feedbackOptions[why].ok;
  useEffect(() => {
    if (transferDone && !progress.controlSolved)
      setProgress((p) => ({ ...p, controlSolved: true }));
  }, [transferDone, progress.controlSolved, setProgress]);
  const sketch = curve
    ? (curveOptions.find((o) => o.id === curve)?.path ?? fuelPath(run))
    : null;
  const badges = [
    {
      name: "Calibrated",
      how: "sealed the matching curve",
      on: progress.sealed?.curve === "B",
    },
    {
      name: "Fluent",
      how: "all 4 ideas in your words",
      on: ideas.every((i) => i.ok),
    },
    {
      name: "Transfer",
      how: "solved the pump problem",
      on: transferDone || progress.controlSolved,
    },
  ];
  const fmt = (n: number, d = 1) => n.toFixed(d);
  return (
    <>
      <InnerHeader go={go} back={["Equation lab", "equation"]} now={4} />
      <section
        className="c-section c-section--first"
        aria-labelledby="c-ev-title"
      >
        <h1 id="c-ev-title" className="c-h1 c-h1--md" tabIndex={-1}>
          Sketch vs data
        </h1>
        {!progress.sealed && (
          <div className="c-picker">
            <span className="c-sub">
              You didn’t seal a prediction. Which curve would you have drawn?
            </span>
            {curveOptions.map((o) => (
              <button
                key={o.id}
                className={pick === o.id ? "on" : ""}
                aria-pressed={pick === o.id}
                onClick={() => setPick(o.id)}
                aria-label={`Curve ${o.id}: ${o.label}`}
              >
                {o.id}
              </button>
            ))}
          </div>
        )}
        <div className="c-grid2">
          <div className="c-panel c-stack c-stack--sm">
            <div className="c-legend-row">
              <span>
                <svg width="28" height="6" aria-hidden="true">
                  <path d="M0 3H28" stroke="#FFB648" strokeWidth="3" />
                </svg>
                Recorded fuel temperature
              </span>
              {sketch && (
                <span>
                  <svg width="28" height="6" aria-hidden="true">
                    <path
                      d="M0 3H28"
                      stroke="#E8F1EE"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                    />
                  </svg>
                  Your sketch ({curve})
                </span>
              )}
            </div>
            <ChartFrame
              label={`Recorded fuel temperature falls steadily from ${fmt(p0.fuel)} to ${fmt(p20.fuel)} degrees Celsius over 20 seconds, with no sudden drop.${curve ? ` Your sketch, curve ${curve}, is dashed.` : ""}`}
              axis={["600°C", "585°C", "570°C"]}
            >
              {sketch && (
                <path
                  d={sketch}
                  fill="none"
                  stroke="#E8F1EE"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  opacity=".8"
                />
              )}
              <path
                className="c-a-draw-ev"
                d={fuelPath(run)}
                fill="none"
                stroke="#FFB648"
                strokeWidth="3.5"
              />
              <circle
                cx={chart.x(p20.t)}
                cy={chart.fuelY(p20.fuel)}
                r="6"
                fill="#FFB648"
              />
              <text
                x="520"
                y={chart.fuelY(p20.fuel) + 28}
                fontFamily="Space Grotesk, sans-serif"
                fontSize="13"
                fill="#FFB648"
              >
                {fmt(p20.fuel)} °C
              </text>
            </ChartFrame>
          </div>
          <div className="c-stack">
            {v ? (
              <div
                className={`c-verdict ${v.ok ? "is-ok" : "is-retry"}`}
                role="status"
              >
                <strong>{v.title}</strong>
                <p>{v.body}</p>
              </div>
            ) : (
              <div className="c-verdict">
                <p>Choose a curve above to compare it with the data.</p>
              </div>
            )}
            <table className="c-table">
              <caption>Recorded in the lab model</caption>
              <thead>
                <tr>
                  <th scope="col">Quantity</th>
                  <th scope="col">0 s</th>
                  <th scope="col">1 s</th>
                  <th scope="col">20 s</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Total thermal power</th>
                  <td>{fmt(p0.power)}%</td>
                  <td className="c-strong">{fmt(p1.power)}%</td>
                  <td>{fmt(p20.power)}%</td>
                </tr>
                <tr>
                  <th scope="row">Fuel temperature</th>
                  <td>{fmt(p0.fuel)} °C</td>
                  <td className="c-strong c-amber">{fmt(p1.fuel)} °C</td>
                  <td>{fmt(p20.fuel)} °C</td>
                </tr>
                <tr>
                  <th scope="row">Decay heat</th>
                  <td>{fmt(p0.decay, 2)}%</td>
                  <td>{fmt(p1.decay, 2)}%</td>
                  <td>{fmt(p20.decay, 2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="c-grid2 c-grid2--narrow">
          <div className="c-tip c-tip--blue c-tip--big">
            <p className="c-eqtext c-eqtext--md c-upright">
              In the first second, power fell <b>{fmt(p0.power - p1.power)}</b>{" "}
              points but the fuel fell only <b>{fmt(p0.fuel - p1.fuel)} °C</b>.
              Between 10 s and 20 s, power fell just{" "}
              {fmt(p10.power - p20.power)} points — yet the fuel fell{" "}
              <b>{fmt(p10.fuel - p20.fuel)} °C</b>.
            </p>
            <p>
              Which term in{" "}
              <i className="c-eqtext c-eqtext--inline">
                C<sub>f</sub> dT<sub>f</sub>/dt = P − Q̇
              </i>{" "}
              explains why the fuel keeps falling after power has almost
              settled?
            </p>
          </div>
          <div className="c-clue c-clue--earned">
            <h3>Clue 03</h3>
            <p className="c-clue-big">{mysteries.control.clue}</p>
          </div>
        </div>
      </section>

      <section className="c-section" aria-labelledby="c-exp-title">
        <h2 id="c-exp-title" className="c-h2">
          Why the lag?
        </h2>
        <div className="c-grid2 c-grid2--narrow">
          <div className="c-stack c-stack--sm">
            <div className="c-blocks">
              <span className="c-sub">Add a building block:</span>
              {explanationBlocks.map((b) => (
                <button
                  key={b.text}
                  style={{ color: tones[b.tone], borderColor: tones[b.tone] }}
                  onClick={() =>
                    setProgress((p) => ({
                      ...p,
                      explanation:
                        (p.explanation
                          ? p.explanation.replace(/\s*$/, " ")
                          : "") + b.phrase,
                    }))
                  }
                >
                  + {withSubs(b.text)}
                </button>
              ))}
            </div>
            <label htmlFor="c-exp" className="c-sub">
              Your explanation
            </label>
            <textarea
              id="c-exp"
              className="c-textarea"
              rows={6}
              value={progress.explanation}
              onChange={(e) =>
                setProgress((p) => ({ ...p, explanation: e.target.value }))
              }
              placeholder="When the rods went in, fission power fell quickly. The fuel temperature…"
            />
          </div>
          <div className="c-panel c-stack c-stack--sm">
            <div className="c-section-head">
              <h3>Ideas a strong answer uses</h3>
              <span className="c-score c-amber">
                {ideas.filter((i) => i.ok).length}/4
              </span>
            </div>
            <ul className="c-rubric">
              {ideas.map((i) => (
                <li key={i.label} className={i.ok ? "ok" : ""}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={i.ok ? "#5CD6FF" : "#5A6B67"}
                    strokeWidth="2.2"
                    role="img"
                    aria-label={i.ok ? "present" : "not yet"}
                  >
                    <circle cx="12" cy="12" r="10" />
                    {i.ok && <path d="M7 12.5l3.2 3.2L17 9" />}
                  </svg>
                  {i.label}
                </li>
              ))}
            </ul>
            <small className="c-sub">
              This only spots the ideas. Whether they’re connected correctly is
              your call — reread it as a sceptic would.
            </small>
          </div>
        </div>
      </section>

      <section className="c-challenge" aria-labelledby="c-tr-title">
        <h2 id="c-tr-title" className="c-h2 c-h2--sm">
          A pump slows down
        </h2>
        <p className="c-brief">
          A core is steady at{" "}
          <b className="c-amber">
            P<sub>f</sub> = 100 MW
          </b>{" "}
          and{" "}
          <b className="c-amber2">
            P<sub>d</sub> = 6 MW
          </b>
          . The pump slows and heat transfer to the coolant drops to{" "}
          <b className="c-blue">Q̇ = 70 MW</b>.{" "}
          <b>
            C<sub>f</sub> = 18 MJ/K.
          </b>
        </p>
        <div className="c-parts">
          <NumericCard
            part={{ ...pumpPart, id: "1" }}
            tag="pump"
            value={pump}
            result={pumpResult}
            onInput={setPump}
            onCheck={() => setPumpResult(judge(pumpPart, pump))}
          />
          <fieldset
            className={`c-part ${why === null ? "" : feedbackOptions[why].ok ? "is-ok" : "is-retry"}`}
          >
            <legend>
              <b className="c-tag c-tag--amber">2</b> A few seconds later,
              fission power starts to fall — though nobody moved the rods. Why?
            </legend>
            {feedbackOptions.map((o, i) => (
              <button
                key={o.text}
                className={`c-choice ${why === i ? "on" : ""}`}
                aria-pressed={why === i}
                onClick={() => setWhy(i)}
              >
                {o.text}
              </button>
            ))}
            <p className="c-feedback" aria-live="polite">
              {why === null ? "" : feedbackOptions[why].feedback}
            </p>
          </fieldset>
        </div>
      </section>

      <section className="c-grid2 c-grid2--narrow c-section">
        <div className="c-panel c-stack">
          <h3>Badges</h3>
          <div className="c-badges">
            {badges.map((b) => (
              <div key={b.name} className={`c-badge ${b.on ? "on" : ""}`}>
                <Star size={32} strokeWidth={1.6} aria-hidden="true" />
                <strong>{b.name}</strong>
                <small>{b.how}</small>
              </div>
            ))}
          </div>
        </div>
        <button className="c-nextcard" onClick={() => go("cooling")}>
          <strong>Next: can less flow carry the same heat?</strong>
          <Law id="cooling" size="card" />
          <small>Open Investigation 04 →</small>
        </button>
      </section>
    </>
  );
}

/* ---------- Investigation 02 · chain lab ---------- */
function ChainScreen({ go, progress, setProgress }: CourseProps) {
  const [leak, setLeak] = useState(5);
  const [capture, setCapture] = useState(60);
  const challenge = useChallenge(chainChallenge);
  useEffect(() => {
    if (challenge.all && !progress.chainSolved)
      setProgress((p) => ({ ...p, chainSolved: true }));
  }, [challenge.all, progress.chainSolved, setProgress]);
  const nu = neutronsPerFission;
  const k = kEff(nu, leak, capture);
  const state = chainState(k);
  const color =
    state === "sub" ? tones.blue : state === "crit" ? tones.text : tones.amber;
  const N = useMemo(
    () => Array.from({ length: 9 }, (_, g) => 1000 * Math.pow(k, g)),
    [k],
  );
  const max = Math.max(1400, ...N);
  const leaked = leak;
  const captured = (100 - leak) * (capture / 100);
  const fission = 100 - leaked - captured;
  return (
    <>
      <InnerHeader go={go} back={["Course map", "map"]} />
      <section className="c-hero c-hero--tight">
        <div className="c-stack c-stack--lg">
          <h1 className="c-h1" tabIndex={-1}>
            {mysteries.neutrons.headline}
          </h1>
          <p className="c-lead">{mysteries.neutrons.intro}</p>
          <div className="c-law">
            <div
              className="c-eq c-eq--hero"
              role="img"
              aria-label="k eff equals N sub g plus 1 over N sub g, equals nu times one minus L times one minus C"
            >
              <Sym b="k" s="eff" tone="blue" />
              <Op>=</Op>
              <Frac top={<Sym b="N" s="g+1" />} bottom={<Sym b="N" s="g" />} />
              <Op>=</Op>
              <Sym b="ν" tone="amber" />
              <span className="c-upright">
                (1 − <i>L</i>)(1 − <i style={{ color: tones.blue2 }}>C</i>)
              </span>
            </div>
            <p className="c-sub">
              Right-hand side: a simplified neutron life cycle. ν = neutrons per
              fission, L = fraction that leaks out, C = fraction of the rest
              captured without fission (rods, water, other nuclei).
            </p>
          </div>
        </div>
        <div className="c-visual">
          <svg
            viewBox="0 0 520 380"
            width="100%"
            role="img"
            aria-label="Animation: a neutron strikes a uranium-235 nucleus, which wobbles and splits into two fragments while three new neutrons fly out"
          >
            <circle
              className="c-a-flash"
              cx="260"
              cy="190"
              r="90"
              fill="#FFB648"
              opacity="0"
            />
            <circle className="c-a-in" cx="260" cy="190" r="9" fill="#A8E9FF" />
            <g className="c-a-nuc">
              <g className="c-a-wob">
                <circle
                  cx="260"
                  cy="190"
                  r="46"
                  fill="#2A2111"
                  stroke="#FFB648"
                  strokeWidth="3"
                />
                <text
                  x="260"
                  y="198"
                  textAnchor="middle"
                  fontFamily="Space Grotesk, sans-serif"
                  fontSize="20"
                  fontWeight="600"
                  fill="#FFB648"
                >
                  U-235
                </text>
              </g>
            </g>
            <circle
              className="c-a-fragA"
              cx="260"
              cy="190"
              r="30"
              fill="#2A2111"
              stroke="#FFB648"
              strokeWidth="3"
            />
            <circle
              className="c-a-fragB"
              cx="260"
              cy="190"
              r="26"
              fill="#2A2111"
              stroke="#FFD48A"
              strokeWidth="3"
            />
            <circle className="c-a-o1" cx="260" cy="190" r="8" fill="#A8E9FF" />
            <circle className="c-a-o2" cx="260" cy="190" r="8" fill="#A8E9FF" />
            <circle className="c-a-o3" cx="260" cy="190" r="8" fill="#A8E9FF" />
            <text
              x="24"
              y="356"
              fontFamily="Space Grotesk, sans-serif"
              fontSize="14"
              fill="#9DB3AE"
            >
              1 neutron in → 2 fragments + energy + 2–3 neutrons out
            </text>
          </svg>
        </div>
      </section>

      <section className="c-section" aria-labelledby="c-budget-title">
        <h2 id="c-budget-title" className="c-h2">
          Balance the budget
        </h2>
        <div className="c-grid2">
          <div className="c-panel c-stack c-stack--lg">
            <div className="c-ranges">
              <label className="c-range c-range--blue">
                <span>
                  <span>Leakage L</span>
                  <b>{leak}%</b>
                </span>
                <input
                  type="range"
                  aria-label="Leakage"
                  min={0}
                  max={12}
                  step={0.5}
                  value={leak}
                  onChange={(e) => setLeak(+e.target.value)}
                />
              </label>
              <label className="c-range c-range--blue">
                <span>
                  <span style={{ color: tones.blue2 }}>Capture C</span>
                  <b>{capture}%</b>
                </span>
                <input
                  type="range"
                  aria-label="Capture"
                  min={40}
                  max={70}
                  step={0.5}
                  value={capture}
                  onChange={(e) => setCapture(+e.target.value)}
                />
              </label>
            </div>
            <div className="c-stack c-stack--sm">
              <span className="c-chart-title">
                Follow 100 neutrons born in one generation
              </span>
              <div className="c-budget" aria-hidden="true">
                <span
                  style={{ width: `${leaked}%` }}
                  className="c-budget-leak"
                />
                <span
                  style={{ width: `${captured}%` }}
                  className="c-budget-cap"
                >
                  {Math.round(captured)}
                </span>
                <span style={{ width: `${fission}%` }} className="c-budget-fis">
                  {Math.round(fission)}
                </span>
              </div>
              <p className="c-budget-key">
                <span>■ {Math.round(leaked)} leak</span>
                <span className="c-blue">
                  ■ {Math.round(captured)} captured
                </span>
                <span className="c-amber">
                  ■ {Math.round(fission)} cause fission → × {nu} ={" "}
                  {Math.round(fission * nu)} new neutrons
                </span>
              </p>
            </div>
            <div className="c-stack c-stack--sm">
              <span className="c-chart-title">
                Neutrons per generation, starting from 1,000
              </span>
              <div
                className="c-bars"
                role="img"
                aria-label={`Neutron count by generation: ${N.map((n) => Math.round(n)).join(", ")}`}
              >
                {N.map((n, g) => (
                  <div key={g}>
                    <small>
                      {n >= 9999 ? `${Math.round(n / 1000)}k` : Math.round(n)}
                    </small>
                    <span
                      style={{
                        height: Math.max(3, Math.round((n / max) * 170)),
                        background: color,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="c-axis">
                <span>g = 0</span>
                <span>g = 8</span>
              </div>
            </div>
          </div>
          <div className="c-stack">
            <div className={`c-kstate c-kstate--${state}`} role="status">
              <span className="c-label" style={{ color }}>
                {state === "sub"
                  ? "Subcritical: the chain shrinks"
                  : state === "crit"
                    ? "Critical: self-sustaining"
                    : "Supercritical: the chain grows"}
              </span>
              <div className="c-readout-main">
                <span className="c-eqtext">
                  k<sub>eff</sub> =
                </span>
                <strong style={{ color }}>{k.toFixed(3)}</strong>
              </div>
              <span className="c-eqtext c-eqtext--sm">
                = {nu} × {(1 - leak / 100).toFixed(3)} ×{" "}
                {(1 - capture / 100).toFixed(3)}
              </span>
              <p>
                {state === "sub"
                  ? "Each generation is smaller than the last. Without a change, the fission rate dies away."
                  : state === "crit"
                    ? "Each generation replaces itself. This is normal, steady operation — not an emergency."
                    : "Each generation is bigger. Power rises until something — rods, or temperature feedback — brings k back down."}
              </p>
            </div>
            <div className="c-tip c-tip--blue">
              <p>
                Try to hit exactly 1.000. A tiny change in C flips the chain
                from dying to growing: that knife-edge is what the control rods
                ride.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="c-challenge" aria-labelledby="c-cc-title">
        <div className="c-section-head">
          <div className="c-stack c-stack--xs">
            <h2 id="c-cc-title" className="c-h2 c-h2--sm">
              A different core
            </h2>
          </div>
          <span className="c-score">{challenge.solved} of 3 solved</span>
        </div>
        <p className="c-brief">
          In this core each fission releases <b className="c-amber">ν = 2.50</b>{" "}
          neutrons. <b>4%</b> leak out. Of the rest,{" "}
          <b className="c-blue2">58%</b> are captured without causing fission.
        </p>
        <div className="c-parts">
          {chainChallenge.map((p) => challenge.card(p, "chain", "blue"))}
        </div>
      </section>

      <section className="c-grid2 c-grid2--narrow c-section">
        <div className="c-tip c-tip--amber c-tip--big">
          <p className="c-clue-big">
            In a water-cooled reactor, one neutron generation can last about a
            ten-thousandth of a second. At k = 1.008, how many neutrons would
            1,000 become after one second?
          </p>
          <p className="c-eqtext c-eqtext--lg c-amber2">
            1000 × 1.008<sup>10 000</sup> ≈ ?
          </p>
          <p>
            Work it out — it’s a number with more than 30 digits. Real reactors
            don’t do this. Something about roughly 0.65% of the neutrons changes
            everything.
          </p>
        </div>
        <div className="c-clue c-clue--earned">
          <h3>Clue 02</h3>
          <p className="c-clue-big">
            “Critical” means k = 1: steady and self-sustaining. It is the normal
            operating state, not an emergency.
          </p>
          <button className="c-link" onClick={() => go("puzzle")}>
            Continue to Investigation 03 →
          </button>
        </div>
      </section>
    </>
  );
}

const screens: Record<CourseScreen, (p: CourseProps) => ReactNode> = {
  intro: IntroScreen,
  map: MapScreen,
  puzzle: PuzzleScreen,
  equation: EquationScreen,
  evidence: EvidenceScreen,
  chain: ChainScreen,
  ...deepDiveScreens,
};
export default function Course(props: CourseProps) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Start each screen at the top, with focus on its heading.
    document.documentElement.scrollTop = 0;
    root.current
      ?.querySelector<HTMLElement>("h1")
      ?.focus({ preventScroll: true });
  }, [props.screen]);
  const Screen = screens[props.screen];
  return (
    <div className="course" ref={root}>
      <main className="c-wrap" key={props.screen}>
        <Screen {...props} />
      </main>
    </div>
  );
}
