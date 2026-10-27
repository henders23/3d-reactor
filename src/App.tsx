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
  Download,
  Expand,
  Eye,
  Focus,
  Home,
  Info,
  Layers,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Target,
  X,
} from "lucide-react";
import ReactorScene, { type View } from "./ReactorScene";
import Schematic from "./Schematic";
import FissionDiagram from "./FissionDiagram";
import TrendChart from "./TrendChart";
import { ScienceTour, ExplanationHelp } from "./ScienceUI";
import { misconceptionFeedback, explanationSupport } from "./science";
import { Welcome, LearningFocus, RunEvidence } from "./LearningUI";
import { Disclosure, Confidence } from "./ui";
import ExperimentBeats from "./ExperimentBeats";
import { experimentBeats } from "./beats";
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
  const lesson = lessons[lessonIndex],
    part = parts.find((p) => p.id === selected)!;
  // Staged experiments replace the whole workbench with one focused column.
  const beats =
    mode === "investigate" && stage === "observe"
      ? experimentBeats[lesson.id]
      : undefined;
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
      document.getElementById("guided-stage-title")?.focus();
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
    setFlat(l.id === "energy");
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
      `# CORE — learning summary\n\nPHYSM0047 companion · conceptual PWR model\n\n${lessons
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
  const quantitative = learning[lesson.id].duration > 0;
  const stageOrder = ["predict", "observe", "explain", "check", "complete"];
  const stageIndex = stageOrder.indexOf(stage);
  const correct = answer === learning[lesson.id].transferCorrect;
  const sceneCaption =
    flat || webglFailed
      ? "System schematic · not to scale"
      : view === "plant"
        ? "Energy pathway · not to scale"
        : view === "core"
          ? "Inside the pressure vessel"
          : "Particles enlarged · illustrative paths";

  const sceneCard = (
    <section className="scene-card" aria-label="Reactor visualisation">
      <div className="scene-toolbar">
        <div className="segmented" role="group" aria-label="Scale of model">
          {(["plant", "core", "fission"] as View[]).map((v, i) => (
            <button
              key={v}
              aria-pressed={view === v && !flat}
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
          className="chip-button"
          aria-pressed={flat}
          disabled={webglFailed}
          onClick={() => setFlat((v) => !v)}
        >
          <Layers size={15} aria-hidden="true" />
          {webglFailed ? "2D mode" : flat ? "3D view" : "2D diagram"}
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
              mode === "investigate" ? learning[lesson.id].focus : undefined
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
          <p className="fission-stage">
            {reduced
              ? "Fission outcomes"
              : state.time % 12 < 3
                ? "1 · A neutron reaches the fuel"
                : state.time % 12 < 5
                  ? "2 · The nucleus splits"
                  : state.time % 12 < 8
                    ? "3 · Neutrons are released"
                    : "4 · Absorbed, slowed or another fission"}
          </p>
        )}
        {!flat && !webglFailed && (
          <div className="camera-tools">
            <button
              aria-label="Zoom in"
              onClick={() => setZoomTick((v) => Math.abs(v) + 1)}
            >
              <Plus size={17} aria-hidden="true" />
            </button>
            <button
              aria-label="Zoom out"
              onClick={() => setZoomTick((v) => -Math.abs(v) - 1)}
            >
              <Minus size={17} aria-hidden="true" />
            </button>
            <button
              aria-label="Return to overview"
              onClick={() => setHomeTick((t) => t + 1)}
            >
              <Home size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div className="scene-foot">
        <span className="scene-caption">{sceneCaption}</span>
        {mode === "investigate" && !quantitative && (
          <button className="text-button" onClick={() => setRunning((v) => !v)}>
            {running ? (
              <Pause size={15} aria-hidden="true" />
            ) : (
              <Play size={15} aria-hidden="true" />
            )}
            {running ? "Pause animation" : "Play animation"}
          </button>
        )}
      </div>
      {mode === "explore" && !flat && !webglFailed && view !== "fission" && (
        <Disclosure summary="View options" className="view-options">
          <div className="toggle-row">
            <button
              aria-pressed={cutaway}
              onClick={() => setCutaway((v) => !v)}
            >
              <Eye size={15} aria-hidden="true" />
              Cutaway
            </button>
            <button
              aria-pressed={exploded}
              onClick={() => setExploded((v) => !v)}
            >
              <Expand size={15} aria-hidden="true" />
              Explode
            </button>
            <button aria-pressed={labels} onClick={() => setLabels((v) => !v)}>
              Labels
            </button>
          </div>
          <div className="toggle-row" role="group" aria-label="Overlay">
            {(["flow", "temperature", "neutrons"] as const).map((l, i) => (
              <button
                key={l}
                aria-pressed={layer === l}
                onClick={() => setLayer(l)}
              >
                <i className={`dot ${["teal", "amber", "violet"][i]}`} />
                {["Flow", "Fuel temperature", "Neutrons"][i]}
              </button>
            ))}
          </div>
          <p className="quiet">Drag to orbit · scroll or pinch to zoom.</p>
        </Disclosure>
      )}
    </section>
  );

  const componentPanel = (
    <aside className="part-panel" aria-label="Component information">
      <div className="part-head">
        <span className="part-swatch" style={{ background: part.color }} />
        <span className="eyebrow">{part.group}</span>
      </div>
      <h2>{part.name}</h2>
      <p className="part-subtitle">{part.subtitle}</p>
      <p>{part.purpose}</p>
      <div className="part-actions">
        <button
          className="button secondary"
          disabled={webglFailed}
          onClick={() => {
            if (flat) setFlat(false);
            if (view === "fission") setView("plant");
            setTimeout(() => setFocusTick((t) => t + 1), 30);
          }}
        >
          <Focus size={16} aria-hidden="true" />
          Take a closer look
        </button>
        {selected === "fuel" && (
          <button
            className="button secondary"
            onClick={() => {
              setView("core");
              setCutaway(true);
              setLabels(true);
              setHomeTick((t) => t + 1);
            }}
          >
            Pellets & cladding
          </button>
        )}
        {selected === "pressuriser" && (
          <button
            className="button secondary"
            onClick={() => setModal("pressure")}
          >
            Pressure & boiling
          </button>
        )}
      </div>
      <div className="disclosures">
        <Disclosure summary="Why it matters">
          <p>{part.why}</p>
        </Disclosure>
        <Disclosure summary="How it connects">
          <p>{part.connection}</p>
        </Disclosure>
        <Disclosure summary="The physics">
          <p>{part.physics}</p>
        </Disclosure>
        <Disclosure summary="A common mix-up">
          <p>{part.misconception}</p>
        </Disclosure>
        <Disclosure summary="All components">
          <nav className="component-nav" aria-label="Reactor components">
            {parts.map((p) => (
              <button
                key={p.id}
                aria-pressed={selected === p.id}
                onClick={() => choose(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.name}
              </button>
            ))}
          </nav>
        </Disclosure>
      </div>
      <button className="investigation-cta" onClick={() => startLesson(0)}>
        <span>
          <small>Put the ideas to work</small>
          <strong>Start an investigation</strong>
        </span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </aside>
  );

  const explore = (
    <div className="lab">
      <div className="lab-head">
        <h1>Explore the reactor</h1>
        <p>Select a part to see what it does. Change one control and watch.</p>
      </div>
      {sceneCard}
      {componentPanel}
      <section className="readouts" aria-label="Current model readings">
        <div className="readout-grid">
          <div>
            <span>Thermal power</span>
            <strong>
              {(state.thermal * 100).toFixed(1)}
              <small>%</small>
            </strong>
          </div>
          <div>
            <span>Fuel</span>
            <strong>
              {state.fuel.toFixed(0)}
              <small>°C</small>
            </strong>
          </div>
          <div>
            <span>Coolant</span>
            <strong>
              {state.coolant.toFixed(0)}
              <small>°C</small>
            </strong>
          </div>
          <div>
            <span>Electrical</span>
            <strong>
              {(state.electric * 100).toFixed(0)}
              <small>%</small>
            </strong>
          </div>
        </div>
        <Disclosure summary="What these readings mean">
          <dl className="readout-notes">
            <div>
              <dt>Thermal power</dt>
              <dd>Fission plus decay heat. The starting value is 100%.</dd>
            </div>
            <div>
              <dt>Fuel</dt>
              <dd>One lumped temperature for the whole core.</dd>
            </div>
            <div>
              <dt>Coolant</dt>
              <dd>A representative average for the primary water.</dd>
            </div>
            <div>
              <dt>Electrical</dt>
              <dd>A relative output index, not megawatts.</dd>
            </div>
          </dl>
        </Disclosure>
      </section>
      <section className="controls-card" aria-labelledby="controls-title">
        <div className="card-head">
          <h2 id="controls-title">Experiment</h2>
          <span className={`status-pill ${running ? "running" : ""}`}>
            <i />
            {modelStatus}
          </span>
        </div>
        <div className="sliders">
          <label>
            <span>
              Control rods <strong>{controls.rods}%</strong>
            </span>
            <input
              aria-label="Control-rod insertion"
              type="range"
              min="0"
              max="100"
              value={controls.rods}
              onChange={(e) => changeControl("rods", +e.target.value)}
            />
            <small>
              Withdrawn <span>Inserted</span>
            </small>
          </label>
          <label>
            <span>
              Circulation <strong>{controls.flow}%</strong>
            </span>
            <input
              aria-label="Coolant circulation"
              type="range"
              min="30"
              max="130"
              value={controls.flow}
              onChange={(e) => changeControl("flow", +e.target.value)}
            />
            <small>
              Less <span>More</span>
            </small>
          </label>
          <label>
            <span>
              Heat removal <strong>{controls.sink}%</strong>
            </span>
            <input
              aria-label="Heat removal at sink"
              type="range"
              min="50"
              max="120"
              value={controls.sink}
              onChange={(e) => changeControl("sink", +e.target.value)}
            />
            <small>
              Less <span>More</span>
            </small>
          </label>
        </div>
        <div className="playback">
          <button
            className="button primary"
            disabled={rangeStop}
            aria-label={running ? "Pause simulation" : "Run simulation"}
            onClick={() => setRunning((v) => !v)}
          >
            {running ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            {running ? "Pause" : "Run"}
          </button>
          <button
            className="text-button"
            onClick={() => {
              reset(false);
              setNotice(
                "Reset to the starting state. Your saved comparison is kept.",
              );
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
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
          <span className="model-time">{state.time.toFixed(1)} model s</span>
          <button
            className="button warning"
            onClick={() => {
              changeControl("rods", 100);
              if (!rangeStop) setRunning(true);
              setNotice(
                "All rods inserted. Watch the heat that remains while circulation continues.",
              );
            }}
          >
            <ArrowDown size={15} aria-hidden="true" />
            Insert all rods
          </button>
        </div>
        {rangeStop && (
          <p className="range-notice" role="alert">
            The model has reached its valid range and paused. Reset to continue.
            This is a model boundary, not a plant safety limit.
          </p>
        )}
      </section>
      <div className="lab-chart">
        <TrendChart samples={samples} baseline={baseline} event={graphEvent} />
        <div className="chart-actions">
          <button className="text-button" onClick={saveBaseline}>
            <Plus size={15} aria-hidden="true" />
            Save run for comparison
          </button>
          {baseline.length > 0 && (
            <button className="text-button" onClick={() => setBaseline([])}>
              Clear comparison
            </button>
          )}
          <button className="text-button" onClick={exportData}>
            <Download size={15} aria-hidden="true" />
            Export data
          </button>
        </div>
      </div>
    </div>
  );

  const stageBody =
    stage === "predict" ? (
      <>
        <h2>{lesson.question}</h2>
        <div className="choices">
          {lesson.choices.map((c, i) => (
            <button
              key={c}
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
        <Confidence
          legend="How sure are you?"
          value={predictionConfidence}
          onChange={setPredictionConfidence}
        />
        {!predictionSent ? (
          <button
            className="button primary"
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
            Record prediction
          </button>
        ) : (
          <div className="stage-next">
            <p className="quiet" role="status">
              Recorded. Now test it.
            </p>
            <button className="button primary" onClick={beginExperiment}>
              Begin experiment <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </>
    ) : stage === "observe" ? (
      <>
        <h2>Follow the pathway.</h2>
        <p className="quiet" role="status">
          {observed
            ? "You have visited every part. Now explain what you noticed."
            : "Visit each part, here or in the model."}
        </p>
        <div className="part-checklist">
          {(lesson.id === "energy"
            ? ["fuel", "steam", "turbine", "condenser"]
            : ["fuel", "water", "rods"]
          ).map((id) => (
            <button
              key={id}
              aria-pressed={selected === id}
              onClick={() => choose(id as PartID)}
            >
              {visited.includes(id as PartID) ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <span className="todo-dot" aria-hidden="true" />
              )}
              {parts.find((p) => p.id === id)?.name}
            </button>
          ))}
        </div>
        <button
          className="button primary"
          disabled={!observed}
          onClick={() => {
            setRunning(false);
            setStage("explain");
          }}
        >
          Explain my observations <ArrowRight size={16} aria-hidden="true" />
        </button>
        <button
          className="text-button"
          onClick={() => {
            reset(true);
            setVisited([lesson.focus]);
            setObserved(false);
            setNotice("Restarted from the beginning.");
          }}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Restart experiment
        </button>
        <LearningFocus id={lesson.id} />
      </>
    ) : stage === "explain" ? (
      <>
        <h2>What happened, and why?</h2>
        <p className="quiet">Name a part, a process and something you saw.</p>
        {revising && (
          <div className="callout">
            <h3>Use the feedback</h3>
            <p>{misconceptionFeedback[lesson.id][answer ?? 0]}</p>
            <Disclosure summary="The model’s explanation">
              <p>{explanationSupport[lesson.id].deeper}</p>
            </Disclosure>
            <Disclosure summary="My first explanation">
              <p>{records[lesson.id]?.firstExplanation}</p>
            </Disclosure>
          </div>
        )}
        <label className="field-label" htmlFor="reflection">
          Your explanation
        </label>
        <textarea
          id="reflection"
          rows={5}
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
        <ExplanationHelp key={lesson.id} id={lesson.id} />
        <button
          className="button primary"
          disabled={!reflection.trim()}
          onClick={() => {
            setRecords((r) => ({
              ...r,
              [lesson.id]: {
                ...r[lesson.id],
                prediction: lesson.choices[prediction ?? 0],
                explanation: reflection,
                completed: r[lesson.id]?.completed || false,
                firstExplanation: r[lesson.id]?.firstExplanation ?? reflection,
                evidence: quantitative
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
          {revising ? "Save revision and try again" : "Test my explanation"}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <p className="quiet small">Short is fine. Your writing isn’t graded.</p>
        {quantitative ? (
          <Disclosure
            summary="Look at your run again"
            className="evidence-drawer"
          >
            <RunEvidence id={lesson.id} state={state} samples={samples} />
          </Disclosure>
        ) : (
          <Disclosure summary="Revisit the pathway" open={revising}>
            <ScienceTour id={lesson.id} selected={selected} onSelect={choose} />
          </Disclosure>
        )}
        <LearningFocus id={lesson.id} />
      </>
    ) : stage === "check" ? (
      <>
        <p className="eyebrow">A new situation · from memory</p>
        <h2>{learning[lesson.id].transfer}</h2>
        <div className="choices">
          {learning[lesson.id].transferChoices.map((c, i) => (
            <button
              key={c}
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
        <Confidence
          legend="How sure are you now?"
          value={confidence}
          onChange={setConfidence}
        />
        <button
          className="button primary"
          disabled={answer === null}
          onClick={() => setAnswerSent(true)}
        >
          Check understanding
        </button>
        {answerSent && (
          <div className={`feedback-card ${correct ? "good" : "retry"}`}>
            <h3 role="status">
              {correct ? "That’s right." : "Not quite yet."}
            </h3>
            <p>{misconceptionFeedback[lesson.id][answer ?? 0]}</p>
            <p className="quiet">
              {correct
                ? confidence === "confident"
                  ? "Keep the evidence behind your answer in mind."
                  : "Your answer is sound. Revisit the evidence to build confidence."
                : confidence === "confident"
                  ? "A confident answer can still need revising."
                  : "Uncertainty is useful here. Revisit the evidence."}
            </p>
            {!correct && <p>{lesson.retry}</p>}
            <Disclosure summary="Compare with your prediction">
              <p>{lesson.explanation}</p>
              <p>
                <strong>
                  You predicted (
                  {predictionConfidence === "tentative"
                    ? "fairly sure"
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
            </Disclosure>
            <div className="stage-next">
              {correct && (
                <button className="button primary" onClick={completeLesson}>
                  Complete investigation <Check size={16} aria-hidden="true" />
                </button>
              )}
              <button
                className="button secondary"
                onClick={() => {
                  setRevising(true);
                  setStage("explain");
                }}
              >
                Revisit evidence and revise
              </button>
            </div>
          </div>
        )}
      </>
    ) : (
      <div className="complete">
        <CheckCircle2 size={44} strokeWidth={1.6} aria-hidden="true" />
        <h2>Investigation complete.</h2>
        <p>Your explanation is saved on this device. It isn’t graded.</p>
        {lessonIndex < 4 ? (
          <button
            className="button primary"
            onClick={() => startLesson(lessonIndex + 1)}
          >
            Next investigation <ArrowRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <button className="button primary" onClick={() => setMode("check")}>
            Check your understanding <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        <p className="quiet">Tomorrow, try explaining this idea from memory.</p>
        <Disclosure summary="Your explanation">
          <blockquote>“{reflection}”</blockquote>
          {records[lesson.id]?.revised && <p>Revised after feedback.</p>}
        </Disclosure>
        <button className="text-button" onClick={exportLearning}>
          <Download size={15} aria-hidden="true" />
          Export your learning summary
        </button>
      </div>
    );

  const investigation = (
    <div className={`investigation stage-${stage}`}>
      <nav className="lesson-stepper" aria-label="Investigations">
        <ol>
          {lessons.map((l, i) => (
            <li key={l.id}>
              <button
                aria-label={`${i + 1}. ${l.name}${records[l.id]?.completed ? ", done" : ""}`}
                aria-current={i === lessonIndex ? "step" : undefined}
                onClick={() => startLesson(i)}
              >
                <span className="lesson-dot">
                  {records[l.id]?.completed ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="lesson-name">{l.name}</span>
              </button>
            </li>
          ))}
        </ol>
        {storageFailed && (
          <p className="quiet small">
            Progress can’t be saved in this browser. Export your summary.
          </p>
        )}
      </nav>
      <div className="investigation-body">
        <aside className="stage-panel" aria-label="Guided investigation">
          <header className="stage-head">
            <p className="eyebrow">Investigation {lessonIndex + 1} of 5</p>
            <h1 tabIndex={-1} id="guided-stage-title">
              {lesson.name}
            </h1>
            <p className="stage-goal">{learning[lesson.id].goal}</p>
            <ol className="stage-progress" aria-label="Steps">
              {["Predict", "Observe", "Explain", "Check"].map((s, i) => (
                <li
                  key={s}
                  aria-current={i === stageIndex ? "step" : undefined}
                  className={
                    i < stageIndex ? "done" : i === stageIndex ? "current" : ""
                  }
                >
                  {s}
                </li>
              ))}
            </ol>
          </header>
          <div className="stage-body">{stageBody}</div>
        </aside>
        {stage === "observe" && !quantitative && (
          <div className="observe-lab">
            {sceneCard}
            <ScienceTour
              id={lesson.id}
              selected={selected}
              onSelect={(id) => {
                choose(id);
                if (!flat && !webglFailed && view !== "fission")
                  setFocusTick((t) => t + 1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  const quiz = (
    <section className="quiz">
      <p className="eyebrow">Connect what you have learned</p>
      <h1>Explain the system.</h1>
      <p className="quiet">Five questions about how the parts work together.</p>
      <div className="recall-card">
        <label htmlFor="recall">
          Before seeing answer choices, explain one relationship from memory.
        </label>
        <textarea
          id="recall"
          value={recall}
          placeholder="For example: why can fuel stay hot after shutdown?"
          onChange={(e) => setRecall(e.target.value)}
        />
        <button
          className="button secondary"
          disabled={recalled}
          onClick={() => setRecalled(true)}
        >
          {recalled
            ? "Answer choices revealed"
            : "Reveal the questions when ready"}
        </button>
      </div>
      {recalled &&
        lessons.map((l, i) => (
          <fieldset key={l.id} className="quiz-question">
            <legend>
              <span>{i + 1}</span>
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
                <span>{choice}</span>
              </label>
            ))}
            {quizSubmitted && (
              <p
                className={`quiz-feedback ${quizAnswers[l.id] === l.checkCorrect ? "good" : ""}`}
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
        <div className="stage-next">
          <button
            className="button primary"
            disabled={Object.keys(quizAnswers).length < 5}
            onClick={() => setQuizSubmitted(true)}
          >
            Check my answers <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button
            className="button secondary"
            onClick={() => setMode("explore")}
          >
            Return to the model
          </button>
        </div>
      )}
      {quizSubmitted && (
        <p className="quiz-score" role="status">
          {lessons.filter((l) => quizAnswers[l.id] === l.checkCorrect).length} /
          5 correct. Review the explanations, then try again.
        </p>
      )}
    </section>
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
      className={`app mode-${mode} stage-${stage}${beats ? " focus-stage" : ""}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
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
          <Atom size={24} strokeWidth={1.6} aria-hidden="true" />
          <span>CORE</span>
        </button>
        <nav className="main-nav" aria-label="Learning mode">
          {(["explore", "investigate", "check"] as Mode[]).map((m, i) => (
            <button
              key={m}
              aria-label={["Explore", "Investigate", "Check understanding"][i]}
              aria-current={mode === m ? "page" : undefined}
              onClick={() =>
                m === "investigate" && mode !== "investigate"
                  ? startLesson(lessonIndex)
                  : (setMode(m), setRunning(false))
              }
            >
              {
                [
                  <Layers size={16} aria-hidden="true" />,
                  <BookOpen size={16} aria-hidden="true" />,
                  <Target size={16} aria-hidden="true" />,
                ][i]
              }
              <span className="nav-long">
                {["Explore", "Investigate", "Check understanding"][i]}
              </span>
              <span className="nav-short" aria-hidden="true">
                {["Explore", "Investigate", "Check"][i]}
              </span>
            </button>
          ))}
        </nav>
        <button
          className="icon-button"
          aria-label="How to use the laboratory"
          onClick={() => setModal("help")}
        >
          <Info size={20} aria-hidden="true" />
        </button>
      </header>
      <main id="main" className="main-content" tabIndex={-1}>
        {mode === "check" ? (
          quiz
        ) : beats ? (
          <ExperimentBeats
            key={lesson.id}
            design={beats}
            action={learning[lesson.id].action!}
            duration={learning[lesson.id].duration}
            samples={samples}
            running={running}
            started={guidedStarted}
            observed={observed}
            onRun={runGuided}
            onToggle={() => setRunning((v) => !v)}
            onDone={() => {
              setRunning(false);
              setStage("explain");
            }}
          />
        ) : mode === "investigate" ? (
          investigation
        ) : (
          explore
        )}
      </main>
      <footer className="app-footer">
        <span>CORE · a simplified teaching model of a PWR</span>
        <button className="text-button" onClick={() => setModal("science")}>
          Model & sources
        </button>
        <label className="motion-toggle">
          <input
            type="checkbox"
            checked={reduced}
            onChange={(e) => setReduced(e.target.checked)}
          />
          Reduce motion
        </label>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          {notice}
        </div>
      )}
      {modal === "help" && (
        <Modal title="How to use CORE" onClose={() => setModal(null)}>
          <ol className="help-steps">
            <li>
              <strong>Look inside</strong>
              <span>Drag to orbit, scroll to zoom, or select a part.</span>
            </li>
            <li>
              <strong>Change one thing</strong>
              <span>Move one slider and watch the response.</span>
            </li>
            <li>
              <strong>Compare</strong>
              <span>Save a run, reset, change a setting, compare.</span>
            </li>
            <li>
              <strong>Explain</strong>
              <span>Five investigations: predict, observe, explain.</span>
            </li>
          </ol>
          <Disclosure summary="Other ways in">
            <p>
              The 2D diagram, component list and data table are alternatives to
              the 3D view. Every control works with a keyboard. Progress is
              stored on this device and can be exported.
            </p>
          </Disclosure>
          <button
            className="button primary"
            onClick={() => {
              setModal(null);
              startLesson(0);
            }}
          >
            Start the first investigation{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </Modal>
      )}
      {modal === "pressure" && (
        <Modal title="Why pressurise the water?" onClose={() => setModal(null)}>
          <p>Higher pressure raises water’s boiling temperature.</p>
          <label className="pressure-slider">
            <span>
              Pressure <strong>{pressure.toFixed(1)} MPa</strong>
            </span>
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
            <span>boiling point at this pressure</span>
          </div>
          <Disclosure summary="About these numbers">
            <p>
              At about 0.1 MPa water boils near 100°C; at 15.5 MPa, near 345°C.
              That is how primary water stays liquid at high temperature. This
              demonstration interpolates rounded reference points; it is not a
              steam-table calculator and does not change the main model.
            </p>
          </Disclosure>
        </Modal>
      )}
      {modal === "science" && (
        <Modal
          title="The science behind the model"
          onClose={() => setModal(null)}
        >
          <p>
            A conceptual PWR companion for PHYSM0047. It has not been mapped to
            a verified assessment specification.
          </p>
          <div className="equations">
            <span>Change in stored heat = heat generated − heat removed</span>
            <span>Total thermal power = fission power + decay heat</span>
          </div>
          <Disclosure summary="What is calculated">
            <p>
              A simplified, deliberately slowed neutron-balance model coupled to
              fuel and coolant energy balances. Control rods and negative
              temperature feedback change reactivity. Three illustrative decay
              inventories keep producing heat after shutdown.
            </p>
          </Disclosure>
          <Disclosure summary="What is illustrative">
            <p>
              Geometry, particle paths, timescales, transfer coefficients and
              starting temperatures are teaching choices. “Model seconds” are
              not predictions for a real reactor. The fuel colour is a visual
              aid, not a calculated heat map. Electrical output is a lagged
              relative index with a fixed efficiency.
            </p>
          </Disclosure>
          <Disclosure summary="What is held fixed or left out">
            <p>
              Primary pressure and secondary saturation temperature are fixed.
              There is no detailed fluid flow, boiling, spatial neutron
              transport, burnup, xenon, soluble boron, protection system or
              accident progression. The model pauses outside its teaching range.
            </p>
          </Disclosure>
          <Disclosure summary="For teaching use">
            <p>
              A nuclear-science lecturer should review the model and activities
              before formal use. In an AGR, graphite is the fixed moderator and
              separate absorbing rods move; this PWR uses water as moderator.
            </p>
          </Disclosure>
          <Disclosure summary="References">
            <ul className="source-list">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Disclosure>
        </Modal>
      )}
    </div>
  );
}
