import { Atom, ArrowRight, Eye, RotateCcw, Play, Pause } from "lucide-react";
import type { State, Sample } from "./simulation";
import { learning, guidedEvidence } from "./learning";
import TrendChart from "./TrendChart";
export function Welcome({
  onLearn,
  onExplore,
  completed,
}: {
  onLearn: () => void;
  onExplore: () => void;
  completed: number;
}) {
  return (
    <main className="welcome">
      <div className="welcome-brand">
        <Atom size={32} />
        <strong>CORE</strong>
        <span>PHYSM0047 · Nuclear Science</span>
      </div>
      <div className="welcome-content">
        <span className="eyebrow">A QUESTION TO START WITH</span>
        <h1>
          If the reactor shuts down,
          <br />
          why does it still need cooling?
        </h1>
        <p>
          Explore a pressurised-water reactor and discover how its parts work
          together. You will make a prediction, change one thing and use the
          evidence to explain what happened.
        </p>
        <div className="welcome-actions">
          <button className="primary-button" onClick={onLearn}>
            {completed ? "Continue learning" : "Start with the essentials"}{" "}
            <ArrowRight size={18} />
          </button>
          <button className="secondary-button" onClick={onExplore}>
            Explore freely
          </button>
        </div>
        <p className="welcome-time">
          Five short investigations · about 25–30 minutes · go at your own pace
          {completed > 0 ? ` · ${completed}/5 completed` : ""}
        </p>
        <div className="pretraining">
          <h2>Three jobs to keep separate</h2>
          <div>
            <article>
              <span>01</span>
              <h3>Make heat</h3>
              <p>Fission in the fuel releases energy.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Move heat</h3>
              <p>Circulating coolant carries energy away.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Make electricity</h3>
              <p>Steam drives a turbine connected to a generator.</p>
            </article>
          </div>
        </div>
        <p className="welcome-note">
          This is a simplified learning model. Its colours, particles and timing
          help explain ideas; they are not measurements of a real plant.
        </p>
      </div>
    </main>
  );
}
export function LearningFocus({
  id,
  showWatch,
}: {
  id: string;
  showWatch: boolean;
}) {
  const d = learning[id];
  return (
    <section className="learning-focus" aria-label="Learning focus">
      <div>
        <span className="eyebrow">YOUR GOAL</span>
        <p>{d.goal}</p>
      </div>
      {showWatch && (
        <div>
          <Eye size={20} />
          <p>
            <strong>Look here</strong>
            {d.watch}
          </p>
        </div>
      )}
      <details>
        <summary>Key terms for this investigation</summary>
        <dl>
          {d.terms.map(([term, meaning]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
export function GuidedExperiment({
  id,
  state,
  samples,
  running,
  started,
  observed,
  onRun,
  onToggle,
}: {
  id: string;
  state: State;
  samples: Sample[];
  running: boolean;
  started: boolean;
  observed: boolean;
  onRun: () => void;
  onToggle: () => void;
}) {
  const d = learning[id];
  return (
    <section className="guided-experiment" aria-label="Focused experiment">
      <div className="guided-experiment-heading">
        <div>
          <span className="eyebrow">CHANGE ONE VARIABLE</span>
          <h2>{d.action}</h2>
          <p>
            {id === "cooling"
              ? "Rod insertion and external heat removal stay at their starting settings."
              : "Circulation and external heat removal stay at their starting settings."}
          </p>
        </div>
        <button
          className="primary-button"
          onClick={onRun}
          disabled={started && !observed}
        >
          {started ? <RotateCcw size={16} /> : <Play size={16} />}{" "}
          {observed ? "Repeat this experiment" : d.action}
        </button>
      </div>
      {started && (
        <>
          <div className="observation-progress">
            <progress
              aria-label="Observation progress"
              max={d.duration}
              value={Math.min(state.time, d.duration)}
            />
            <span>
              {Math.min(state.time, d.duration).toFixed(0)} / {d.duration} model
              seconds
            </span>
            {!observed && (
              <button className="secondary-button" onClick={onToggle}>
                {running ? <Pause size={14} /> : <Play size={14} />}{" "}
                {running ? "Pause observation" : "Continue observation"}
              </button>
            )}
          </div>
          <p className="observation-status" role="status">
            {observed
              ? "Observation captured. Compare the starting and final readings below."
              : "Watch the response. It will pause automatically so you can inspect the evidence."}
          </p>
          <div
            className="evidence-readings"
            aria-label="Before and after evidence"
          >
            {guidedEvidence(state)
              .filter((x) => id === "shutdown" || x.label !== "Decay heat")
              .map((x) => (
                <article key={x.label}>
                  <h3>{x.label}</h3>
                  <p>
                    <span>
                      {x.before.toFixed(1)}
                      {x.unit}
                    </span>
                    <ArrowRight size={15} />
                    <strong>
                      {x.now.toFixed(1)}
                      {x.unit}
                    </strong>
                  </p>
                  <small>
                    {x.now - x.before >= 0 ? "+" : ""}
                    {(x.now - x.before).toFixed(1)} {x.deltaUnit} from the
                    starting value
                  </small>
                </article>
              ))}
          </div>
          <TrendChart
            key={id}
            samples={samples}
            baseline={[]}
            preferredMetric={d.metric}
            event={{ time: 0, label: d.action! }}
          />
          <p className="model-time-note">
            The model uses illustrative, slowed physical responses, replayed at
            3× here. The percentages compare with the starting state.
          </p>
        </>
      )}
    </section>
  );
}
