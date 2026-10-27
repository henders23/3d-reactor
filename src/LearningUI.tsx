import { useState, useEffect } from "react";
import { EvidenceInspector, CheckpointControls } from "./ScienceUI";
import { checkpoints } from "./science";
import { ArrowRight, Eye, RotateCcw, Play, Pause } from "lucide-react";
import type { State, Sample } from "./simulation";
import { learning, guidedEvidence } from "./learning";
import TrendChart from "./TrendChart";
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
  const [selectedIndex, setSelectedIndex] = useState(2);
  useEffect(() => {
    if (!observed) setSelectedIndex(2);
  }, [observed]);
  const inspected = observed
    ? checkpoints(samples)[selectedIndex]?.sample
    : undefined;
  const readings = guidedEvidence(state).map((row) => ({
    ...row,
    now: !inspected
      ? row.now
      : row.label === "Total thermal power"
        ? inspected.power
        : row.label === "Fuel temperature"
          ? inspected.fuel
          : inspected.decay,
  }));
  const d = learning[id];
  return (
    <section className="guided-experiment" aria-label="Focused experiment">
      <div className="guided-experiment-heading">
        <div>
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
              ? "Observation captured. Compare the starting reading with a selected recorded moment."
              : "Watch the response. It will pause automatically so you can inspect the evidence."}
          </p>
          {observed && (
            <CheckpointControls
              samples={samples}
              selectedIndex={selectedIndex}
              onInspect={setSelectedIndex}
            />
          )}
          <p className="power-definition">
            Total thermal power = fission power + decay heat. It is a rate of
            heat generation, not temperature or electrical output. All power
            percentages use the initial total thermal power as 100%.
          </p>
          <div
            className="evidence-readings"
            aria-label="Before and after evidence"
          >
            {readings
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
            key={`trend-${id}`}
            samples={samples}
            baseline={[]}
            preferredMetric={d.metric}
            inspection={inspected}
            event={{ time: 0, label: d.action! }}
          />
          {observed && (
            <EvidenceInspector
              key={`inspector-${id}`}
              id={id}
              samples={samples}
              selectedIndex={selectedIndex}
            />
          )}
          <p className="model-time-note">
            The model uses illustrative, slowed physical responses, replayed at
            3× here. The percentages compare with the starting state.
          </p>
        </>
      )}
    </section>
  );
}
