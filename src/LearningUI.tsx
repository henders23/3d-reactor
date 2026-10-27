import { useState } from "react";
import { EvidenceInspector, CheckpointControls } from "./ScienceUI";
import { checkpoints } from "./science";
import { Atom, ArrowRight } from "lucide-react";
import type { State, Sample } from "./simulation";
import { learning, guidedEvidence } from "./learning";
import TrendChart from "./TrendChart";
import { Disclosure } from "./ui";
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
      <header className="welcome-brand">
        <Atom size={28} strokeWidth={1.6} aria-hidden="true" />
        <strong>CORE</strong>
        <span>PHYSM0047 · Nuclear Science</span>
      </header>
      <div className="welcome-content">
        <p className="eyebrow">A question to start with</p>
        <h1>If the reactor shuts down, why does it still need cooling?</h1>
        <p className="welcome-lede">
          Predict, change one thing, and use the evidence to explain what
          happened.
        </p>
        <div className="welcome-actions">
          <button className="button primary large" onClick={onLearn}>
            {completed ? "Continue learning" : "Start with the essentials"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button className="button secondary large" onClick={onExplore}>
            Explore freely
          </button>
        </div>
        <p className="welcome-meta">
          Five short investigations · about 25–30 minutes
          {completed > 0 ? ` · ${completed} of 5 done` : ""}
        </p>
        <section className="three-jobs" aria-labelledby="jobs-title">
          <h2 id="jobs-title">Three jobs to keep separate</h2>
          <ol>
            <li>
              <strong>Make heat</strong>
              <span>Fission in the fuel</span>
            </li>
            <li>
              <strong>Move heat</strong>
              <span>Circulating coolant</span>
            </li>
            <li>
              <strong>Make electricity</strong>
              <span>Steam turns a turbine</span>
            </li>
          </ol>
        </section>
        <Disclosure summary="About this model">
          <p>
            A simplified teaching model. Its colours, particles and timing
            explain ideas; they are not measurements of a real plant.
          </p>
        </Disclosure>
      </div>
    </main>
  );
}
export function LearningFocus({ id }: { id: string }) {
  const d = learning[id];
  return (
    <section className="learning-focus" aria-label="Learning focus">
      <Disclosure summary="What to look for">
        <p>{d.watch}</p>
      </Disclosure>
      <Disclosure summary="Key terms">
        <dl>
          {d.terms.map(([term, meaning]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </Disclosure>
    </section>
  );
}
/** The recorded run, kept beside the explanation for re-reading. */
export function RunEvidence({
  id,
  state,
  samples,
}: {
  id: string;
  state: State;
  samples: Sample[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const inspected = checkpoints(samples)[selectedIndex]?.sample;
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
    <section className="run-evidence" aria-label="Your run">
      <CheckpointControls
        samples={samples}
        selectedIndex={selectedIndex}
        onInspect={setSelectedIndex}
      />
      <div className="evidence-readings" aria-label="Before and after evidence">
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
                <ArrowRight size={15} aria-hidden="true" />
                <strong>
                  {x.now.toFixed(1)}
                  {x.unit}
                </strong>
              </p>
              <small>
                {x.now - x.before >= 0 ? "+" : ""}
                {(x.now - x.before).toFixed(1)} {x.deltaUnit}
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
      <EvidenceInspector
        key={`inspector-${id}`}
        id={id}
        samples={samples}
        selectedIndex={selectedIndex}
      />
      <Disclosure summary="How to read these numbers">
        <p>
          Total thermal power is fission power plus decay heat: a rate of heat
          generation, not a temperature or electrical output. Every power
          percentage uses the starting total thermal power as 100%. The model’s
          responses are illustrative and slowed.
        </p>
      </Disclosure>
    </section>
  );
}
