import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Atom,
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Expand,
  Eye,
  Focus,
  Home,
  Info,
  Layers,
  Maximize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Target,
  X,
} from "lucide-react";
import ReactorScene, { type View } from "./ReactorScene";
import Schematic from "./Schematic";
import EquationLesson from "./EquationLesson";
import type { EquationID } from "./equations";
import FissionDiagram from "./FissionDiagram";
import TrendChart from "./TrendChart";
import { ScienceTour, ExplanationHelp } from "./ScienceUI";
import { misconceptionFeedback, explanationSupport } from "./science";
import { Welcome, LearningFocus, GuidedExperiment } from "./LearningUI";
import { learning, guidedControls, advanceGuided } from "./learning";
import { parts, lessons, sources, type PartID } from "./content";
import {
  defaults,
  initialState,
  outsideRange,
  sample,
  step,
  type Controls,
  type Sample,
  type State,
} from "./simulation";
type Mode = "explore" | "investigate" | "check";
type Stage = "predict" | "observe" | "explain" | "check" | "complete";
type RecordEntry = {
  prediction: string;
  explanation: string;
  completed: boolean;
  firstExplanation?: string;
  evidence?: string;
  revised?: boolean;
};
type Records = Record<string, RecordEntry>;
const storageKey = "core-reactor-learning-v1";
function readRecords(): Records {
  try {
    const d = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (d && typeof d === "object" && !Array.isArray(d)) {
      return Object.fromEntries(
        Object.entries(d).filter(
          ([k, v]) =>
            lessons.some((l) => l.id === k) &&
            v &&
            typeof v === "object" &&
            typeof (v as RecordEntry).explanation === "string" &&
            typeof (v as RecordEntry).completed === "boolean",
        ),
      ) as Records;
    }
  } catch {}
  return {};
}
function saveFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      aria-labelledby="modal-title"
    >
      <div className="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function App() {
  const [started, setStarted] = useState(false);
  const [revising, setRevising] = useState(false);
  const [reviewEvidence, setReviewEvidence] = useState(false);
  const [guidedStarted, setGuidedStarted] = useState(false);
  const guidedRun = useRef<string | null>(null);
  const [recalled, setRecalled] = useState(false);
  const [recall, setRecall] = useState("");
  const [confidence, setConfidence] = useState("unsure");
  const [predictionConfidence, setPredictionConfidence] = useState("unsure");
  const [graphEvent, setGraphEvent] = useState<
    { time: number; label: string } | undefined
  >();
  const [mode, setMode] = useState<Mode>("explore"),
    [view, setView] = useState<View>("plant"),
    [selected, setSelected] = useState<PartID>("fuel");
  const [state, setState] = useState(initialState),
    [controls, setControls] = useState<Controls>({ ...defaults }),
    [running, setRunning] = useState(false),
    [speed, setSpeed] = useState(1);
  const engine = useRef(state),
    controlRef = useRef(controls);
  controlRef.current = controls;
  const [samples, setSamples] = useState<Sample[]>([sample(state)]),
    [baseline, setBaseline] = useState<Sample[]>([]);
  const [cutaway, setCutaway] = useState(true),
    [exploded, setExploded] = useState(false),
    [labels, setLabels] = useState(true),
    [layer, setLayer] = useState<"flow" | "temperature" | "neutrons">("flow");
  const [flat, setFlat] = useState(false),
    [reduced, setReduced] = useState(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [webglFailed, setWebglFailed] = useState(false);
  const [focusTick, setFocusTick] = useState(0),
    [homeTick, setHomeTick] = useState(0),
    [zoomTick, setZoomTick] = useState(0);
  const [modal, setModal] = useState<"science" | "help" | "pressure" | null>(
      null,
    ),
    [pressure, setPressure] = useState(15.5);
  const [notice, setNotice] = useState(""),
    [rangeStop, setRangeStop] = useState(false),
    [records, setRecords] = useState<Records>(readRecords),
    [storageFailed, setStorageFailed] = useState(false);
  const [lessonIndex, setLessonIndex] = useState(0),
    [stage, setStage] = useState<Stage>("predict"),
    [prediction, setPrediction] = useState<number | null>(null),
    [predictionSent, setPredictionSent] = useState(false),
    [reflection, setReflection] = useState(""),
    [answer, setAnswer] = useState<number | null>(null),
    [answerSent, setAnswerSent] = useState(false);
  const [visited, setVisited] = useState<PartID[]>(["fuel"]),
    [seenFission, setSeenFission] = useState(false),
    [observed, setObserved] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({}),
    [quizSubmitted, setQuizSubmitted] = useState(false);
  useEffect(() => {
    if (mode !== "investigate" || !started) guidedRun.current = null;
  }, [mode, started]);
  useEffect(() => {
    setReviewEvidence(false);
  }, [stage, lessonIndex]);
  const lesson = lessons[lessonIndex],
    part = parts.find((p) => p.id === selected)!;
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  }, [records]);
  useEffect(() => {
    if (!running) return;
    let last = performance.now(),
      lastSample = engine.current.time;
    const timer = setInterval(() => {
      const now = performance.now(),
        dt = Math.min((now - last) / 1000, 0.3) * speed;
      last = now;
      const next = guidedRun.current
        ? advanceGuided(engine.current, guidedRun.current, dt)
        : step(engine.current, controlRef.current, dt);
      engine.current = next;
      setState(next);
      if (next.time - lastSample >= 0.5) {
        setSamples((a) => [...a, sample(next, controlRef.current)].slice(-600));
        lastSample = next.time;
      }
      if (
        guidedRun.current &&
        next.time >= learning[guidedRun.current].duration - 1e-6
      ) {
        setSamples((a) =>
          [
            ...a.filter((x) => x.time < next.time),
            sample(next, controlRef.current),
          ].slice(-600),
        );
        guidedRun.current = null;
        setObserved(true);
        setRunning(false);
      }
      if (outsideRange(next)) {
        setRunning(false);
        setRangeStop(true);
        setNotice(
          "The experiment reached the model’s validity limit. Reset to start a new run.",
        );
      }
    }, 100);
    return () => clearInterval(timer);
  }, [running, speed]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (mode !== "investigate" || stage !== "observe") {
      return;
    }
    const enough =
      lesson.id === "energy"
        ? ["fuel", "steam", "turbine", "condenser"].every((id) =>
            visited.includes(id as PartID),
          )
        : lesson.id === "neutrons"
          ? seenFission &&
            ["fuel", "rods", "water"].every((id) =>
              visited.includes(id as PartID),
            )
          : false;
    if (enough) setObserved(true);
  }, [mode, stage, lesson.id, visited, seenFission]);
  useEffect(() => {
    if (started && mode === "investigate")
      document
        .getElementById(
          stage === "explain" ? "equation-title" : "guided-stage-title",
        )
        ?.focus();
  }, [stage, lesson.id, mode, started]);
  const reset = useCallback((play = false) => {
    const s = initialState();
    engine.current = s;
    setState(s);
    setSamples([sample(s)]);
    setControls({ ...defaults });
    setRunning(play);
    setRangeStop(false);
    guidedRun.current = null;
    setGuidedStarted(false);
    setGraphEvent(undefined);
    setObserved(false);
  }, []);
  const choose = useCallback((id: PartID) => {
    setSelected(id);
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
  }, []);
  function switchView(v: View) {
    setView(v);
    if (v === "fission") setSeenFission(true);
    setExploded(false);
  }
  function startLesson(index: number) {
    const l = lessons[index];
    setLessonIndex(index);
    setRevising(false);
    setSpeed(1);
    setMode("investigate");
    setStarted(true);
    setRecalled(false);
    setConfidence("unsure");
    setPredictionConfidence("unsure");
    setStage("predict");
    setPrediction(null);
    setPredictionSent(false);
    setReflection(records[l.id]?.explanation || "");
    setAnswer(null);
    setAnswerSent(false);
    setObserved(false);
    setVisited([l.focus]);
    setSeenFission(l.view === "fission");
    setSelected(l.focus);
    setView(l.view);
    setExploded(false);
    setFlat(l.id === "energy" || l.id === "neutrons");
    setBaseline([]);
    reset(false);
  }
  function beginExperiment() {
    reset(learning[lesson.id].duration === 0);
    setStage("observe");
    setLayer(lesson.id === "neutrons" ? "neutrons" : "flow");
  }
  function runGuided() {
    reset(false);
    setControls(guidedControls(lesson.id));
    setGuidedStarted(true);
    guidedRun.current = lesson.id;
    setSpeed(3);
    setRunning(true);
    setSelected(lesson.focus);
    setGraphEvent({ time: 0, label: learning[lesson.id].action! });
  }
  function changeControl(key: keyof Controls, value: number) {
    setControls((c) => ({ ...c, [key]: value }));
    setGraphEvent({
      time: engine.current.time,
      label: `${key === "rods" ? "Rod insertion" : key === "flow" ? "Circulation" : "Heat removal"} → ${value}%`,
    });
  }
  function saveBaseline() {
    const a =
      samples.length > 1
        ? [...samples]
        : [samples[0], { ...samples[0], time: samples[0].time + 30 }];
    setBaseline(a);
    setNotice(
      "Run saved for comparison. Reset and change one setting to compare traces.",
    );
  }
  function exportData() {
    saveFile(
      "core-reactor-results.csv",
      "model_seconds,thermal_percent,fission_percent,decay_percent,transfer_to_coolant_percent,net_into_fuel_percent,fuel_celsius,coolant_celsius,rod_insertion_percent,flow_percent,sink_percent\n" +
        samples
          .map((s) =>
            [
              s.time,
              s.power,
              s.fission,
              s.decay,
              s.transfer,
              s.netFuel,
              s.fuel,
              s.coolant,
              s.rods,
              s.flow,
              s.sink,
            ]
              .map((n) => n.toFixed(3))
              .join(","),
          )
          .join("\n"),
      "text/csv",
    );
    setNotice("Experiment data exported.");
  }
  function exportLearning() {
    saveFile(
      "core-learning-summary.md",
      `# CORE — learning summary\n\nConceptual PWR model\n\n${lessons
        .map((l) => {
          const r = records[l.id];
          return `## ${l.name}\nStatus: ${r?.completed ? "completed" : "not completed"}\nPrediction: ${r?.prediction || "not recorded"}\nEvidence: ${r?.evidence || "not captured"}\nFirst explanation: ${r?.firstExplanation || r?.explanation || "not recorded"}\nLatest explanation: ${r?.explanation || "not recorded"}\nRevised after feedback: ${r?.revised ? "yes" : "no"}\n`;
        })
        .join(
          "\n",
        )}\nThese activities use a simplified teaching model. Written explanations are self-reflections, not automatically graded.\n`,
      "text/markdown",
    );
  }
  function completeLesson() {
    setRecords((r) => ({
      ...r,
      [lesson.id]: {
        ...r[lesson.id],
        prediction: lesson.choices[prediction ?? 0],
        explanation: reflection,
        completed: true,
      },
    }));
    setStage("complete");
    setRunning(false);
  }
  const count = Object.values(records).filter((r) => r.completed).length;
  const modelStatus = rangeStop
    ? "Model limit"
    : !running
      ? "Paused"
      : controls.rods === 100
        ? "Shutdown response"
        : "Experiment running";
  const saturation =
    pressure <= 1
      ? 100 + ((pressure - 0.1) / 0.9) * 80
      : pressure <= 5
        ? 180 + ((pressure - 1) / 4) * 84
        : 264 + ((pressure - 5) / 10.5) * 81;
  const inspectorPanel = (
    <aside
      className="inspector"
      aria-label={
        mode === "investigate"
          ? "Guided investigation"
          : "Component information"
      }
    >
      {mode === "investigate" ? (
        <>
          <div className="inspector-top">
            <span className="eyebrow">
              INVESTIGATION {String(lessonIndex + 1).padStart(2, "0")}
            </span>
            <h2 tabIndex={-1} id="guided-stage-title">
              {lesson.name}
            </h2>
            <div className="stage-indicator">
              {["Predict", "Observe", "Explain", "Check"].map((s, i) => (
                <span
                  key={s}
                  aria-current={s.toLowerCase() === stage ? "step" : undefined}
                  className={
                    i <=
                    [
                      "predict",
                      "observe",
                      "explain",
                      "check",
                      "complete",
                    ].indexOf(stage)
                      ? "done"
                      : ""
                  }
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="inspector-content">
            {stage === "predict" && (
              <>
                <h3>First, make a prediction.</h3>
                <p>{lesson.question}</p>
                <div className="choices">
                  {lesson.choices.map((c, i) => (
                    <button
                      key={c}
                      className={prediction === i ? "chosen" : ""}
                      aria-pressed={prediction === i}
                      onClick={() => {
                        setPrediction(i);
                        setPredictionSent(false);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <label className="confidence-label">
                  How confident is your prediction?
                  <select
                    value={predictionConfidence}
                    onChange={(e) => setPredictionConfidence(e.target.value)}
                  >
                    <option value="unsure">Unsure — I want to test it</option>
                    <option value="tentative">Somewhat confident</option>
                    <option value="confident">
                      Confident — I can explain it
                    </option>
                  </select>
                </label>
                <button
                  className="primary-button wide"
                  disabled={prediction === null}
                  onClick={() => {
                    setPredictionSent(true);
                    setRecords((r) => ({
                      ...r,
                      [lesson.id]: {
                        ...r[lesson.id],
                        prediction: lesson.choices[prediction ?? 0],
                        explanation: r[lesson.id]?.explanation || "",
                        completed: r[lesson.id]?.completed || false,
                      },
                    }));
                  }}
                >
                  Record prediction <Check size={15} />
                </button>
                {predictionSent && (
                  <div className="feedback">
                    <p>
                      Your prediction is recorded. Now gather evidence from the
                      model.
                    </p>
                    <button
                      className="primary-button wide"
                      onClick={beginExperiment}
                    >
                      Begin experiment <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
            {stage === "observe" && (
              <>
                <h3>
                  {learning[lesson.id].duration
                    ? "Change one thing. Watch closely."
                    : "Follow the pathway."}
                </h3>
                <div className="observation-tip">
                  <Eye size={19} />
                  <p>
                    {observed
                      ? "You have gathered the required observations. Pause and explain what you noticed."
                      : lesson.id === "energy" || lesson.id === "neutrons"
                        ? "Visit the named components using the list below or by clicking the model."
                        : "Use the single experiment button below. Other settings stay fixed, and the run pauses automatically."}
                  </p>
                </div>
                <div className="mini-parts">
                  {(lesson.id === "energy"
                    ? ["fuel", "steam", "turbine", "condenser"]
                    : lesson.id === "neutrons"
                      ? ["fuel", "water", "rods"]
                      : [lesson.focus]
                  ).map((id) => (
                    <button
                      key={id}
                      aria-pressed={selected === id}
                      onClick={() => choose(id as PartID)}
                    >
                      {visited.includes(id as PartID) ? (
                        <Check size={13} />
                      ) : (
                        <Focus size={13} />
                      )}{" "}
                      {parts.find((p) => p.id === id)?.name}
                    </button>
                  ))}
                </div>
                {learning[lesson.id].duration > 0 && (
                  <p className="selected-excerpt">
                    <strong>{part.name}</strong>
                    {part.purpose}
                  </p>
                )}
                <button
                  className="primary-button wide"
                  disabled={!observed}
                  onClick={() => {
                    setRunning(false);
                    setStage("explain");
                  }}
                >
                  Explain my observations <ArrowRight size={15} />
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    reset(learning[lesson.id].duration === 0);
                    setVisited([lesson.focus]);
                    setObserved(false);
                    setNotice("Experiment restarted at equilibrium.");
                  }}
                >
                  <RotateCcw size={14} />
                  Restart experiment
                </button>
              </>
            )}
            {stage === "explain" && (
              <>
                <h3>What happened, and why?</h3>
                <p>
                  Connect your observation to the equation, then explain it
                  using a component and a physical process. The calculation is
                  practice, not a requirement to continue.
                </p>
                {revising && (
                  <div className="revision-context">
                    <h3>Use the feedback to improve your explanation</h3>
                    <p>{misconceptionFeedback[lesson.id][answer ?? 0]}</p>
                    <p>{explanationSupport[lesson.id].deeper}</p>
                    <details>
                      <summary>My first explanation</summary>
                      <p>{records[lesson.id]?.firstExplanation}</p>
                    </details>
                  </div>
                )}
                <ExplanationHelp key={lesson.id} id={lesson.id} />
                <label className="reflection-label" htmlFor="reflection">
                  Your explanation
                </label>
                <textarea
                  id="reflection"
                  rows={4}
                  value={reflection}
                  onChange={(e) => {
                    const value = e.target.value;
                    setReflection(value);
                    setRecords((r) => ({
                      ...r,
                      [lesson.id]: {
                        ...r[lesson.id],
                        prediction: lesson.choices[prediction ?? 0],
                        explanation: value,
                        completed: r[lesson.id]?.completed || false,
                      },
                    }));
                  }}
                  placeholder={learning[lesson.id].starter}
                />
                <small className="subtle">
                  A short explanation is enough. Link what changed to a physical
                  process. This is a reflection, not an automatically graded
                  answer.
                </small>
                <button
                  className="primary-button wide"
                  disabled={!reflection.trim()}
                  onClick={() => {
                    setRecords((r) => ({
                      ...r,
                      [lesson.id]: {
                        ...r[lesson.id],
                        prediction: lesson.choices[prediction ?? 0],
                        explanation: reflection,
                        completed: r[lesson.id]?.completed || false,
                      },
                    }));
                    setRecords((r) => ({
                      ...r,
                      [lesson.id]: {
                        ...r[lesson.id],
                        firstExplanation:
                          r[lesson.id]?.firstExplanation ?? reflection,
                        evidence: learning[lesson.id].duration
                          ? `At ${state.time.toFixed(1)} model s: total thermal power ${(state.thermal * 100).toFixed(1)}% of its initial value; fuel ${state.fuel.toFixed(1)}°C; fission ${(state.neutrons * 95).toFixed(1)}% of initial total thermal power.`
                          : `Inspected: ${visited.map((id) => parts.find((p) => p.id === id)?.name).join(", ")}.`,
                        revised:
                          r[lesson.id]?.revised ||
                          (revising &&
                            reflection.trim() !==
                              r[lesson.id]?.firstExplanation?.trim()),
                      },
                    }));
                    setAnswer(null);
                    setAnswerSent(false);
                    setRevising(false);
                    setStage("check");
                  }}
                >
                  {revising
                    ? "Save revision and try again"
                    : "Test my explanation"}{" "}
                  <ArrowRight size={15} />
                </button>
              </>
            )}
            {stage === "check" && (
              <>
                <p className="retrieval-prompt">
                  Try this new situation from memory before checking the
                  explanation.
                </p>
                <h3>{learning[lesson.id].transfer}</h3>
                <div className="choices">
                  {learning[lesson.id].transferChoices.map((c, i) => (
                    <button
                      key={c}
                      className={answer === i ? "chosen" : ""}
                      aria-pressed={answer === i}
                      onClick={() => {
                        setAnswer(i);
                        setAnswerSent(false);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <label className="confidence-label">
                  How confident are you now?
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                  >
                    <option value="unsure">Unsure</option>
                    <option value="tentative">Somewhat confident</option>
                    <option value="confident">Confident</option>
                  </select>
                </label>
                <button
                  className="primary-button wide"
                  disabled={answer === null}
                  onClick={() => setAnswerSent(true)}
                >
                  Check understanding
                </button>
                {answerSent && (
                  <div className="explanation-card">
                    <span className="eyebrow">COMPARE YOUR REASONING</span>
                    <p>{lesson.explanation}</p>
                    <p>
                      <strong>
                        Your original prediction (
                        {predictionConfidence === "tentative"
                          ? "somewhat confident"
                          : predictionConfidence}
                        ):
                      </strong>{" "}
                      {lesson.choices[prediction ?? 0]}
                    </p>
                    <p>
                      {prediction === lesson.correct
                        ? "Your prediction fits this model. Which observation supports it?"
                        : "Your prediction needs revising. Which observation changed your mind?"}
                    </p>
                  </div>
                )}
                {answerSent && (
                  <div
                    className={`feedback ${answer === learning[lesson.id].transferCorrect ? "good" : ""}`}
                  >
                    <p>
                      {answer === learning[lesson.id].transferCorrect
                        ? "That’s right. "
                        : "Try that again. "}
                      {misconceptionFeedback[lesson.id][answer ?? 0]}
                    </p>
                    <p>
                      {answer === learning[lesson.id].transferCorrect
                        ? confidence === "confident"
                          ? "Keep the evidence behind your answer in mind."
                          : "Your answer is sound. Revisit the evidence to strengthen your confidence."
                        : confidence === "confident"
                          ? "A confident answer can still need revision. Use the explanation to locate the mistaken link."
                          : "Uncertainty is useful here. Revisit the relevant part and try again."}
                    </p>
                    <button
                      className="secondary-button wide"
                      onClick={() => {
                        setRevising(true);
                        setStage("explain");
                      }}
                    >
                      Revisit evidence and revise
                    </button>
                    {answer === learning[lesson.id].transferCorrect ? (
                      <button
                        className="primary-button wide"
                        onClick={completeLesson}
                      >
                        Complete investigation <Check size={15} />
                      </button>
                    ) : (
                      <p>{lesson.retry}</p>
                    )}
                  </div>
                )}
              </>
            )}
            {stage === "complete" && (
              <div className="complete-card">
                <CheckCircle2 size={40} />
                <h3>Investigation complete.</h3>
                <p>
                  You recorded an explanation and answered the transfer
                  question. Compare your written reasoning with the feedback; it
                  has not been automatically graded.
                </p>
                <details>
                  <summary>Review my explanation</summary>
                  <p className="reflection-quote">“{reflection}”</p>
                  {records[lesson.id]?.revised && (
                    <p>Revised after feedback.</p>
                  )}
                </details>
                <p className="revisit-prompt">
                  Tomorrow, explain the same idea without opening the model
                  first. Then return to check your reasoning.
                </p>
                {lessonIndex < 4 ? (
                  <button
                    className="primary-button wide"
                    onClick={() => startLesson(lessonIndex + 1)}
                  >
                    Next investigation <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    className="primary-button wide"
                    onClick={() => setMode("check")}
                  >
                    Check your understanding
                  </button>
                )}
                <button className="text-button" onClick={exportLearning}>
                  <Download size={14} />
                  Export your learning summary
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="inspector-top">
            <div className="part-category">
              <span className="eyebrow">{part.group.toUpperCase()}</span>
              <span className="part-badge">
                {String(parts.indexOf(part) + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="component-illustration">
              <Atom size={64} strokeWidth={0.8} />
              <span style={{ background: part.color }} />
            </div>
            <h2>{part.name}</h2>
            <p className="part-subtitle">{part.subtitle}</p>
          </div>
          <div className="inspector-content">
            <h3>What it does</h3>
            <p>{part.purpose}</p>
            <h3>Why it matters</h3>
            <p>{part.why}</p>
            <div className="connection-card">
              <span className="eyebrow">CONNECTED TO THE SYSTEM</span>
              <p>{part.connection}</p>
            </div>
            <button
              className="secondary-button wide"
              disabled={webglFailed}
              onClick={() => {
                if (flat) setFlat(false);
                if (view === "fission") setView("plant");
                setTimeout(() => setFocusTick((t) => t + 1), 30);
              }}
            >
              <Focus size={15} />
              Take a closer look
            </button>
            {selected === "fuel" && (
              <button
                className="secondary-button wide"
                onClick={() => {
                  setView("core");
                  setCutaway(true);
                  setLabels(true);
                  setHomeTick((t) => t + 1);
                }}
              >
                Inspect pellets & cladding <ArrowRight size={15} />
              </button>
            )}
            {selected === "pressuriser" && (
              <button
                className="secondary-button wide"
                onClick={() => setModal("pressure")}
              >
                Explore pressure & boiling <ArrowRight size={15} />
              </button>
            )}
            <details className="physics-detail">
              <summary>
                Explain the physics <Plus size={14} />
              </summary>
              <p>{part.physics}</p>
            </details>
            <div className="misconception">
              <Info size={16} />
              <p>{part.misconception}</p>
            </div>
            {mode === "explore" && (
              <button
                className="investigation-cta"
                onClick={() => startLesson(0)}
              >
                <span>
                  <small>PUT THE IDEAS TO WORK</small>
                  <strong>Start an investigation</strong>
                </span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </>
      )}
    </aside>
  );
  if (!started)
    return (
      <Welcome
        completed={count}
        onLearn={() =>
          startLesson(
            Math.max(
              0,
              lessons.findIndex((l) => !records[l.id]?.completed),
            ),
          )
        }
        onExplore={() => {
          setMode("explore");
          setStarted(true);
          setRunning(false);
        }}
      />
    );
  return (
    <div
      className={`app mode-${mode} stage-${stage} ${learning[lesson.id].duration > 0 ? "quantitative" : "qualitative"}`}
    >
      <a className="skip-link" href="#main">
        Skip to reactor laboratory
      </a>
      <header className="app-header">
        <button
          className="brand"
          onClick={() => {
            setRunning(false);
            setStarted(false);
          }}
          aria-label="Learning home"
        >
          <span className="brand-icon">
            <Atom size={27} strokeWidth={1.4} />
          </span>
          <span>
            CORE<span className="brand-divider">/</span>
            <small>Reactor laboratory</small>
          </span>
        </button>
        <nav className="main-nav" aria-label="Learning mode">
          {(["explore", "investigate", "check"] as Mode[]).map((m, i) => (
            <button
              key={m}
              className={mode === m ? "active" : ""}
              onClick={() =>
                m === "investigate" && mode !== "investigate"
                  ? startLesson(lessonIndex)
                  : (setMode(m), setRunning(false))
              }
            >
              {
                [
                  <Layers size={15} />,
                  <BookOpen size={15} />,
                  <Target size={15} />,
                ][i]
              }
              {["Explore", "Investigate", "Check understanding"][i]}
            </button>
          ))}
        </nav>
        <div className="header-meta">
          <button
            className="icon-button"
            aria-label="How to use the laboratory"
            onClick={() => setModal("help")}
          >
            <Info size={19} />
          </button>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-top">
            <span className="eyebrow">THE VIRTUAL LAB</span>
            <h2>Inside a reactor.</h2>
            <p>
              Explore the parts.
              <br />
              Discover the connections.
            </p>
          </div>
          {mode === "investigate" ? (
            <>
              <div className="section-label">
                YOUR INVESTIGATIONS <span>{count}/5</span>
              </div>
              <div className="lesson-nav">
                {lessons.map((l, i) => (
                  <button
                    key={l.id}
                    className={i === lessonIndex ? "selected" : ""}
                    onClick={() => startLesson(i)}
                  >
                    <span className="lesson-number">
                      {records[l.id]?.completed ? (
                        <Check size={14} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <span>
                      <strong>{l.name}</strong>
                      <small>{l.minutes}</small>
                    </span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
              <div className="progress-track">
                <span style={{ width: `${(count / 5) * 100}%` }} />
              </div>
              <p className="sidebar-note">
                {storageFailed
                  ? "Progress cannot be saved in this browser. Export your summary."
                  : "Progress is saved on this device."}
              </p>
              <button
                className="text-button summary-export"
                onClick={exportLearning}
              >
                <Download size={14} />
                Export learning summary
              </button>
            </>
          ) : (
            <>
              <div className="section-label">
                COMPONENTS <span>10</span>
              </div>
              <nav className="component-nav" aria-label="Reactor components">
                {parts.map((p, i) => (
                  <button
                    key={p.id}
                    className={selected === p.id ? "selected" : ""}
                    onClick={() => choose(p.id)}
                  >
                    <span className="part-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{p.name}</span>
                    <span
                      className="part-dot"
                      style={{ background: p.color }}
                    />
                  </button>
                ))}
              </nav>
            </>
          )}
          <div className="sidebar-bottom">
            <div className="reactor-tag">
              <span className="dot teal" />
              PRESSURISED-WATER REACTOR
            </div>
            <button className="text-button" onClick={() => setModal("science")}>
              <BookOpen size={14} />
              The science & sources <ArrowRight size={14} />
            </button>
            <label className="motion-toggle">
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />
              Reduce visual motion
            </label>
          </div>
        </aside>
        <main id="main" className="main-content" tabIndex={-1}>
          {mode === "check" ? (
            <section className="quiz">
              <span className="eyebrow">CONNECT WHAT YOU HAVE LEARNED</span>
              <h1>Explain the system.</h1>
              <p>
                Five questions about the relationships inside a PWR. Use the
                model whenever you need to revisit an idea.
              </p>
              <div className="retrieval-before-quiz">
                <label htmlFor="recall">
                  Before seeing answer choices, explain one relationship from
                  memory.
                </label>
                <textarea
                  id="recall"
                  value={recall}
                  placeholder="For example: why can fuel remain hot after shutdown?"
                  onChange={(e) => setRecall(e.target.value)}
                />
                <button
                  className="secondary-button"
                  onClick={() => setRecalled(true)}
                >
                  {recalled
                    ? "Answer choices revealed"
                    : "Reveal the questions when ready"}
                </button>
              </div>
              {recalled &&
                lessons.map((l, i) => (
                  <fieldset key={l.id}>
                    <legend>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {l.check}
                    </legend>
                    {l.checkChoices.map((choice, j) => (
                      <label
                        key={choice}
                        className={`quiz-choice ${quizSubmitted && j === l.checkCorrect ? "correct" : ""}`}
                      >
                        <input
                          type="radio"
                          name={l.id}
                          checked={quizAnswers[l.id] === j}
                          onChange={() => {
                            setQuizAnswers((a) => ({ ...a, [l.id]: j }));
                            setQuizSubmitted(false);
                          }}
                        />
                        {choice}
                      </label>
                    ))}
                    {quizSubmitted && (
                      <p
                        className={`feedback ${quizAnswers[l.id] === l.checkCorrect ? "good" : ""}`}
                      >
                        {quizAnswers[l.id] === l.checkCorrect
                          ? "Correct. "
                          : "Revisit this idea. "}
                        {l.feedback}
                      </p>
                    )}
                  </fieldset>
                ))}
              {recalled && (
                <div className="quiz-actions">
                  <button
                    className="primary-button"
                    disabled={Object.keys(quizAnswers).length < 5}
                    onClick={() => setQuizSubmitted(true)}
                  >
                    Check my answers <ArrowRight size={16} />
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => setMode("explore")}
                  >
                    Return to the model
                  </button>
                </div>
              )}
              {quizSubmitted && (
                <p className="quiz-score" role="status">
                  {
                    lessons.filter((l) => quizAnswers[l.id] === l.checkCorrect)
                      .length
                  }{" "}
                  / 5 correct. Review the explanations, then try again.
                </p>
              )}
            </section>
          ) : (
            <>
              {mode === "investigate" && (
                <>
                  {stage !== "check" && stage !== "complete" && (
                    <LearningFocus
                      id={lesson.id}
                      showWatch={stage === "observe" || stage === "explain"}
                    />
                  )}
                  {stage !== "explain" && inspectorPanel}
                </>
              )}
              <section className="lab-intro">
                <div>
                  <div className="eyebrow">
                    NUCLEAR SCIENCE <span>/</span> INTERACTIVE STUDY 01
                  </div>
                  <h1>
                    {mode === "investigate"
                      ? lesson.name
                      : "Small changes. Visible consequences."}
                  </h1>
                  <p>
                    {mode === "investigate"
                      ? lesson.short
                      : "Look inside a PWR and discover how its systems work together."}
                  </p>
                </div>
                <button
                  className="intro-help"
                  onClick={() => setModal("help")}
                  aria-label="View navigation help"
                >
                  <Maximize2 size={18} />
                </button>
              </section>
              <div
                className="lab-workbench"
                hidden={
                  mode === "investigate" &&
                  ["predict", "check", "complete"].includes(stage)
                }
              >
                {mode !== "investigate" && (
                  <div className="metrics" aria-label="Current model readings">
                    <div>
                      <span>TOTAL THERMAL POWER</span>
                      <strong>
                        {(state.thermal * 100).toFixed(1)}
                        <small>%</small>
                      </strong>
                      <small>fission + decay heat; initial = 100%</small>
                    </div>
                    <div>
                      <span>FUEL TEMPERATURE</span>
                      <strong>
                        {state.fuel.toFixed(0)}
                        <small>°C</small>
                      </strong>
                      <small>lumped fuel temperature</small>
                    </div>
                    <div>
                      <span>PRIMARY COOLANT</span>
                      <strong>
                        {state.coolant.toFixed(0)}
                        <small>°C</small>
                      </strong>
                      <small>representative average</small>
                    </div>
                    <div>
                      <span>ELECTRICAL OUTPUT</span>
                      <strong>
                        {(state.electric * 100).toFixed(0)}
                        <small>%</small>
                      </strong>
                      <small>relative output index</small>
                    </div>
                  </div>
                )}
                {mode === "investigate" && stage === "explain" && (
                  <>
                    <EquationLesson
                      key={lesson.id}
                      id={lesson.id as EquationID}
                      state={state}
                      controls={controls}
                    />
                    {!revising && (
                      <button
                        className="secondary-button"
                        aria-expanded={reviewEvidence}
                        onClick={() => setReviewEvidence((v) => !v)}
                      >
                        {reviewEvidence
                          ? "Hide the observed diagram and evidence"
                          : "Review the observed diagram or graph"}
                      </button>
                    )}
                  </>
                )}
                <section
                  hidden={
                    mode === "investigate" &&
                    stage === "explain" &&
                    !reviewEvidence &&
                    !revising
                  }
                  className="scene-card"
                  aria-label="Reactor visualisation"
                >
                  <div className="scene-toolbar">
                    <div className="segmented" aria-label="Scale of model">
                      {(["plant", "core", "fission"] as View[]).map((v, i) => (
                        <button
                          key={v}
                          className={view === v && !flat ? "active" : ""}
                          onClick={() => {
                            setFlat(false);
                            switchView(v);
                          }}
                        >
                          {["Whole plant", "Reactor core", "Fission"][i]}
                        </button>
                      ))}
                    </div>
                    <button
                      className={`diagram-button ${flat ? "active" : ""}`}
                      disabled={webglFailed}
                      onClick={() => setFlat((v) => !v)}
                    >
                      <Layers size={14} />
                      {webglFailed
                        ? "2D mode"
                        : flat
                          ? "3D view"
                          : "2D diagram"}
                    </button>
                  </div>
                  <div className="scene-area">
                    {(flat || webglFailed) && view === "fission" ? (
                      <FissionDiagram selected={selected} onSelect={choose} />
                    ) : flat || webglFailed ? (
                      <Schematic
                        selected={selected}
                        onSelect={choose}
                        state={state}
                        controls={controls}
                        focused={
                          mode === "investigate" && lesson.id === "energy"
                        }
                      />
                    ) : (
                      <ReactorScene
                        view={view}
                        selected={selected}
                        onSelect={choose}
                        state={state}
                        controls={controls}
                        cutaway={cutaway}
                        exploded={exploded}
                        labels={labels}
                        focusParts={
                          mode === "investigate"
                            ? learning[lesson.id].focus
                            : undefined
                        }
                        layer={layer}
                        reduced={reduced}
                        focusTick={focusTick}
                        homeTick={homeTick}
                        zoomTick={zoomTick}
                        onError={() => {
                          setWebglFailed(true);
                          setNotice(
                            "3D is unavailable in this browser. The interactive 2D diagram is ready.",
                          );
                        }}
                      />
                    )}
                    {view === "fission" && !flat && !webglFailed && (
                      <div className="fission-stage">
                        <span>
                          {reduced
                            ? "Fission outcomes"
                            : state.time % 12 < 3
                              ? "01 · A neutron reaches the fuel"
                              : state.time % 12 < 5
                                ? "02 · The nucleus splits"
                                : state.time % 12 < 8
                                  ? "03 · Neutrons are released"
                                  : "04 · Absorption, moderation or further fission"}
                        </span>
                        <small>
                          Selected outcomes · not every neutron causes fission
                        </small>
                      </div>
                    )}
                    <div className="scene-caption">
                      <span className="eyebrow">
                        {flat || webglFailed
                          ? "SYSTEM SCHEMATIC"
                          : view === "plant"
                            ? "THE ENERGY PATHWAY"
                            : view === "core"
                              ? "INSIDE THE PRESSURE VESSEL"
                              : "FISSION · MODERATION · ABSORPTION"}
                      </span>
                      <p>
                        {view === "fission" && !flat
                          ? "Particles enlarged · motion slowed · illustrative paths"
                          : "Simplified teaching model · geometry not to scale"}
                      </p>
                    </div>
                    {!flat && !webglFailed && (
                      <div className="camera-tools">
                        <button
                          aria-label="Zoom in"
                          onClick={() => setZoomTick((v) => Math.abs(v) + 1)}
                        >
                          <Plus size={17} />
                        </button>
                        <button
                          aria-label="Zoom out"
                          onClick={() => setZoomTick((v) => -Math.abs(v) - 1)}
                        >
                          <Minus size={17} />
                        </button>
                        <span />
                        <button
                          aria-label="Return to overview"
                          onClick={() => setHomeTick((t) => t + 1)}
                        >
                          <Home size={16} />
                        </button>
                      </div>
                    )}
                    {!flat && !webglFailed && view !== "fission" && (
                      <div className="scene-options advanced-display">
                        <button
                          className={cutaway ? "active" : ""}
                          onClick={() => setCutaway((v) => !v)}
                          aria-pressed={cutaway}
                        >
                          <Eye size={14} />
                          Cutaway
                        </button>
                        <button
                          className={exploded ? "active" : ""}
                          onClick={() => setExploded((v) => !v)}
                          aria-pressed={exploded}
                        >
                          <Expand size={14} />
                          Explode
                        </button>
                        <button
                          className={labels ? "active" : ""}
                          onClick={() => setLabels((v) => !v)}
                          aria-pressed={labels}
                        >
                          Labels
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="scene-bottom advanced-display">
                    <div className="layer-select">
                      <span>SHOW</span>
                      {(["flow", "temperature", "neutrons"] as const).map(
                        (l, i) => (
                          <button
                            key={l}
                            className={layer === l ? "active" : ""}
                            onClick={() => setLayer(l)}
                          >
                            <i
                              className={`dot ${["teal", "amber", "dark"][i]}`}
                            />
                            {["Flow", "Fuel temperature", "Neutrons"][i]}
                          </button>
                        ),
                      )}
                    </div>
                    <span className="navigation-hint">
                      Drag to orbit · scroll to zoom
                    </span>
                  </div>
                </section>
                {mode === "investigate" &&
                  (stage !== "explain" || reviewEvidence || revising) &&
                  learning[lesson.id].duration === 0 && (
                    <ScienceTour
                      id={lesson.id}
                      selected={selected}
                      onSelect={(id) => {
                        choose(id);
                        if (!flat && !webglFailed && view !== "fission")
                          setFocusTick((t) => t + 1);
                      }}
                    />
                  )}
                {mode === "investigate" &&
                  (stage !== "explain" || reviewEvidence || revising) &&
                  learning[lesson.id].duration > 0 && (
                    <GuidedExperiment
                      id={lesson.id}
                      state={state}
                      samples={samples}
                      running={running}
                      started={guidedStarted}
                      observed={observed}
                      onRun={runGuided}
                      onToggle={() => setRunning((v) => !v)}
                    />
                  )}
                {mode === "investigate" &&
                  (stage !== "explain" || reviewEvidence || revising) &&
                  learning[lesson.id].duration === 0 && (
                    <button
                      className="secondary-button motion-control"
                      onClick={() => setRunning((v) => !v)}
                    >
                      {running ? "Pause animation" : "Play animation"}
                    </button>
                  )}
                {mode !== "investigate" && (
                  <>
                    <section className="experiment-panel">
                      <div className="experiment-heading">
                        <h2>
                          <SlidersHorizontal size={16} />
                          Experiment controls
                        </h2>
                        <span
                          className={`status-pill ${running ? "running" : ""}`}
                        >
                          <i />
                          {modelStatus}
                        </span>
                      </div>
                      <div className="sliders">
                        <label>
                          <span>
                            Control-rod insertion
                            <strong>{controls.rods}%</strong>
                          </span>
                          <input
                            aria-label="Control-rod insertion"
                            type="range"
                            min="0"
                            max="100"
                            value={controls.rods}
                            onChange={(e) =>
                              changeControl("rods", +e.target.value)
                            }
                          />
                          <small>
                            Withdrawn <span>Fully inserted</span>
                          </small>
                        </label>
                        <label>
                          <span>
                            Coolant circulation<strong>{controls.flow}%</strong>
                          </span>
                          <input
                            aria-label="Coolant circulation"
                            type="range"
                            min="30"
                            max="130"
                            value={controls.flow}
                            onChange={(e) =>
                              changeControl("flow", +e.target.value)
                            }
                          />
                          <small>
                            Reduced flow <span>Increased flow</span>
                          </small>
                        </label>
                        <label>
                          <span>
                            Heat removal at sink
                            <strong>{controls.sink}%</strong>
                          </span>
                          <input
                            aria-label="Heat removal at sink"
                            type="range"
                            min="50"
                            max="120"
                            value={controls.sink}
                            onChange={(e) =>
                              changeControl("sink", +e.target.value)
                            }
                          />
                          <small>Simplified external cooling</small>
                        </label>
                      </div>
                      <div className="playback">
                        <button
                          className="play-button"
                          disabled={rangeStop}
                          aria-label={
                            running ? "Pause simulation" : "Run simulation"
                          }
                          onClick={() => setRunning((v) => !v)}
                        >
                          {running ? <Pause size={15} /> : <Play size={15} />}{" "}
                          {running ? "Pause" : "Run"}
                        </button>
                        <button
                          className="text-button"
                          onClick={() => {
                            reset(false);
                            setNotice(
                              "Reset to initial equilibrium. Your saved comparison is retained.",
                            );
                          }}
                        >
                          <RotateCcw size={14} />
                          Reset
                        </button>
                        <label className="speed-select">
                          <span>Speed</span>
                          <select
                            aria-label="Simulation speed"
                            value={speed}
                            onChange={(e) => setSpeed(+e.target.value)}
                          >
                            <option value={0.5}>0.5×</option>
                            <option value={1}>1×</option>
                            <option value={3}>3×</option>
                            <option value={5}>5×</option>
                          </select>
                        </label>
                        <span className="model-time">
                          {state.time.toFixed(1)} model s
                        </span>
                        <button
                          className="shutdown-button"
                          onClick={() => {
                            changeControl("rods", 100);
                            if (!rangeStop) setRunning(true);
                            setNotice(
                              "All rods inserted. Observe the remaining heat while circulation continues.",
                            );
                          }}
                        >
                          <ArrowDown size={14} />
                          Insert all rods
                        </button>
                      </div>
                      {rangeStop && (
                        <p className="range-notice" role="alert">
                          This simplified model has reached its valid range. The
                          simulation is paused; reset to continue. This is a
                          model boundary, not a plant safety threshold.
                        </p>
                      )}
                    </section>
                    <TrendChart
                      samples={samples}
                      baseline={baseline}
                      event={graphEvent}
                    />
                    <div className="chart-actions">
                      <button className="text-button" onClick={saveBaseline}>
                        <Plus size={14} />
                        Save run for comparison
                      </button>
                      {baseline.length > 0 && (
                        <button
                          className="text-button"
                          onClick={() => setBaseline([])}
                        >
                          Clear comparison
                        </button>
                      )}
                      <button className="text-button" onClick={exportData}>
                        <Download size={14} />
                        Export data
                      </button>
                    </div>
                  </>
                )}
              </div>
              {mode === "investigate" && stage === "explain" && inspectorPanel}
            </>
          )}
          <footer className="lab-footer">
            <span>
              <Atom size={13} />
              CORE · A nuclear science learning environment
            </span>
            <button onClick={() => setModal("science")}>
              Model assumptions & references <ArrowRight size={12} />
            </button>
          </footer>
        </main>
        {mode === "explore" && inspectorPanel}
      </div>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}
      {modal === "help" && (
        <Modal
          title="Make the model your laboratory."
          onClose={() => setModal(null)}
        >
          <p>
            Start with a component, then follow its connections. Try a guided
            investigation when you are ready to test an idea.
          </p>
          <div className="help-grid">
            <div>
              <strong>01 · Look inside</strong>
              <p>
                Drag to orbit, scroll to zoom, or use the + / − buttons. Select
                a component from the left-hand list and choose “Take a closer
                look”.
              </p>
            </div>
            <div>
              <strong>02 · Run an experiment</strong>
              <p>
                Change one slider. Watch the output and temperature graphs.
                Pause to inspect the results and reset to repeat.
              </p>
            </div>
            <div>
              <strong>03 · Compare evidence</strong>
              <p>
                Save a run, reset, change a setting and compare the traces.
                Export the data for further analysis.
              </p>
            </div>
            <div>
              <strong>04 · Explain what you see</strong>
              <p>
                Five investigations ask you to predict, observe and explain.
                Your progress is stored on this device and can be exported.
              </p>
            </div>
          </div>
          <p>
            The 2D diagram, component list and data table provide alternatives
            to the 3D view. All experiment controls work with a keyboard.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              setModal(null);
              startLesson(0);
            }}
          >
            Start the first investigation <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {modal === "pressure" && (
        <Modal title="Why pressurise the water?" onClose={() => setModal(null)}>
          <p>
            Increasing pressure raises water’s boiling temperature. Move the
            slider to compare a few rounded reference conditions.
          </p>
          <label className="pressure-slider">
            Pressure <strong>{pressure.toFixed(1)} MPa</strong>
            <input
              aria-label="Demonstration pressure"
              type="range"
              min=".1"
              max="15.5"
              step=".1"
              value={pressure}
              onChange={(e) => setPressure(+e.target.value)}
            />
          </label>
          <div className="pressure-reading">
            <strong>≈ {Math.round(saturation)}°C</strong>
            <span>illustrative saturation temperature</span>
          </div>
          <p>
            At atmospheric pressure (about 0.1 MPa), water boils near 100°C. At
            15.5 MPa, it boils near 345°C. This helps explain how primary water
            can stay liquid while carrying heat at much higher temperatures.
          </p>
          <p className="model-note">
            This separate demonstration interpolates between rounded reference
            points; it is not a steam-table calculator. It does not change
            pressure in the main simulation, which is held fixed.
          </p>
        </Modal>
      )}
      {modal === "science" && (
        <Modal
          title="The science behind the model"
          onClose={() => setModal(null)}
        >
          <p>
            CORE is a conceptual PWR companion for nuclear science. The lesson
            sequence covers reactor components, energy pathways, neutron
            balance, heat transfer and shutdown heat. It has not been mapped to
            a verified current unit assessment specification.
          </p>
          <h3>What is calculated</h3>
          <p>
            A simplified, deliberately slowed neutron-balance model is coupled
            to fuel and coolant energy balances. Control rods and negative
            temperature feedback change reactivity. Three illustrative decay
            inventories continue producing heat after shutdown.
          </p>
          <div className="equations">
            Change in stored heat = heat generated − heat removed
            <br />
            Heat transfer increases with temperature difference and circulation
            <br />
            Total thermal power = fission power + decay heat
          </div>
          <h3>What is illustrative</h3>
          <p>
            Geometry, particle paths, timescales, transfer coefficients and
            baseline temperatures are teaching choices. “Model seconds” are not
            predictions of a real reactor’s response. The fuel-temperature
            colour is a visual aid, not a calculated spatial heat map.
            Electrical output is a lagged relative index with a fixed efficiency
            assumption.
          </p>
          <h3>What is held fixed or omitted</h3>
          <p>
            Primary pressure and secondary saturation temperature are fixed. The
            app does not calculate detailed fluid flow, boiling, spatial neutron
            transport, fuel burnup, xenon, soluble boron control, protection
            systems or accident progression. It pauses outside its declared
            teaching range.
          </p>
          <h3>For teaching use</h3>
          <p>
            A nuclear-science lecturer should review the model and activities
            before they are used for formal teaching or assessment. In an AGR,
            graphite is the fixed moderator and separate absorbing control rods
            move; this PWR uses water as moderator.
          </p>
          <h3>References</h3>
          <ul className="source-list">
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.name} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="subtle">
            The repository includes the equations, assumptions, test cases and a
            lecturer review checklist.
          </p>
        </Modal>
      )}
    </div>
  );
}
