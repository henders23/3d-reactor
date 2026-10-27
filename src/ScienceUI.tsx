import { HeatBalanceCard } from "./LiveEquations";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { PartID } from "./content";
import type { Sample } from "./simulation";
import {
  tours,
  explanationSupport,
  checkpoints,
  describeBalance,
} from "./science";
export function ScienceTour({
  id,
  selected,
  onSelect,
}: {
  id: string;
  selected: PartID;
  onSelect: (id: PartID) => void;
}) {
  const steps = tours[id];
  if (!steps) return null;
  const index = steps.findIndex((s) => s.part === selected),
    current = steps[index];
  return (
    <section className="science-tour" aria-label="Annotated science pathway">
      <div className="tour-heading">
        <span>
          {index >= 0
            ? `${index + 1} / ${steps.length}`
            : "Choose a pathway step"}
        </span>
      </div>
      <nav aria-label="Science pathway steps">
        {steps.map((s, i) => (
          <button
            key={s.part}
            aria-pressed={i === index}
            onClick={() => onSelect(s.part)}
          >
            {s.title}
          </button>
        ))}
      </nav>
      {current ? (
        <div className="tour-annotation">
          <h3>{current.title}</h3>
          <p>
            <strong>Notice </strong>
            {current.notice}
          </p>
          <p>
            <strong>Why </strong>
            {current.mechanism}
          </p>
          <p className="science-distinction">{current.distinction}</p>
          {id === "energy" && current.part === "steam" && <BoundaryDiagram />}
          <div className="tour-actions">
            <a href={current.source} target="_blank" rel="noreferrer">
              Science source ↗
            </a>
            {index < steps.length - 1 && (
              <button
                className="secondary-button"
                onClick={() => onSelect(steps[index + 1].part)}
              >
                Next relationship <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="tour-outside">
          This component is outside this short pathway. Select a numbered step
          to return to its explanation.
        </p>
      )}
    </section>
  );
}
export function BoundaryDiagram() {
  return (
    <figure className="boundary-diagram">
      <svg
        viewBox="0 0 400 250"
        role="img"
        aria-label="Heat travels through the solid tube wall from primary liquid to secondary water. Fluid paths run beside the wall and do not cross it."
      >
        <defs>
          <marker
            id="wall-heat"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0 0L10 5L0 10Z" fill="#ffbc57" />
          </marker>
          <marker
            id="wall-water"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M0 0L10 5L0 10Z" fill="#5bd1f2" />
          </marker>
        </defs>
        <rect x="0" y="40" width="182" height="180" rx="10" fill="#312514" />
        <rect x="182" y="40" width="36" height="180" fill="#a3b9b5" />
        <rect x="218" y="40" width="182" height="180" rx="10" fill="#112f34" />
        <g fontSize="18" textAnchor="middle" fill="#d1ddda">
          <text x="85" y="24">
            Primary liquid
          </text>
          <text x="310" y="24">
            Secondary water
          </text>
          <text x="85" y="75">
            Hotter
          </text>
          <text x="310" y="75">
            Boils here
          </text>
          <text x="200" y="244">
            Solid tube wall
          </text>
        </g>
        <g
          fill="none"
          stroke="#5bd1f2"
          strokeWidth="3"
          markerEnd="url(#wall-water)"
        >
          <path d="M55 95V190" />
          <path d="M345 190V95" />
        </g>
        <path
          d="M100 130H300"
          stroke="#ffbc57"
          strokeWidth="4"
          strokeDasharray="7 4"
          markerEnd="url(#wall-heat)"
        />
        <rect x="123" y="148" width="154" height="30" rx="5" fill="#2c2212" />
        <text x="200" y="169" textAnchor="middle" fontSize="17" fill="#ffbf5e">
          Heat through wall
        </text>
      </svg>
      <figcaption>
        No fluid crosses the intact wall. Dashed arrow: heat. Solid arrows:
        example fluid directions. Local wall section; not to scale.
      </figcaption>
    </figure>
  );
}
export function CheckpointControls({
  samples,
  selectedIndex,
  onInspect,
}: {
  samples: Sample[];
  selectedIndex: number;
  onInspect: (index: number) => void;
}) {
  const points = checkpoints(samples);
  return (
    <div className="checkpoint-controls">
      <h3>Read the evidence in time order</h3>
      <p>
        Choose a recorded moment. Readings and graph marker follow your choice;
        the reactor view stays at the end of the run.
      </p>
      <div className="checkpoint-buttons">
        {points.map((p, i) => (
          <button
            key={p.label}
            aria-pressed={selectedIndex === i}
            onClick={() => onInspect(i)}
          >
            <strong>{p.label}</strong>
            <span>{p.sample.time.toFixed(1)} model s</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export function EvidenceInspector({
  samples,
  id,
  selectedIndex,
}: {
  samples: Sample[];
  id: string;
  selectedIndex: number;
}) {
  const points = checkpoints(samples),
    point = points[selectedIndex] ?? points[2];
  const [showWhy, setShowWhy] = useState(false);
  if (!point) return null;
  const s = point.sample;
  return (
    <section
      className="evidence-inspector"
      aria-label="Interpret the captured evidence"
    >
      <HeatBalanceCard
        title={`Fuel heat balance at ${s.time.toFixed(1)} model s`}
        fission={s.fission / 100}
        decay={s.decay / 100}
        toCoolant={s.transfer / 100}
        fuel={s.fuel}
        focus
      />
      <p className="balance-reading">{describeBalance(s)}</p>
      <button
        className="text-button"
        aria-expanded={showWhy}
        onClick={() => setShowWhy((v) => !v)}
      >
        {showWhy
          ? "Hide the causal explanation"
          : "Help me connect these readings"}
      </button>
      {showWhy && (
        <p className="causal-explanation">{explanationSupport[id].deeper}</p>
      )}
      <details className="model-boundary">
        <summary>What can these numbers tell me?</summary>
        <p>
          The calculation demonstrates directions of change and energy balance.
          Its initial 95% fission / 5% decay split, temperatures and response
          times are illustrative. They are not measurements, efficiency
          percentages or operating predictions for a real plant.
        </p>
      </details>
    </section>
  );
}
export function ExplanationHelp({ id }: { id: string }) {
  const [hint, setHint] = useState(false);
  const d = explanationSupport[id];
  return (
    <div className="explanation-support">
      <button
        className="text-button"
        aria-expanded={hint}
        onClick={() => setHint((v) => !v)}
      >
        {hint ? "Hide the hint" : "I need a hint"}
      </button>
      {hint && <p className="support-hint">{d.hint}</p>}
      <details>
        <summary>Help me structure my explanation</summary>
        <ol>
          <li>
            <strong>Claim:</strong> what changed, or what relationship did you
            identify?
          </li>
          <li>
            <strong>Evidence:</strong> give a reading or describe a labelled
            pathway.
          </li>
          <li>
            <strong>Reasoning:</strong> explain the physical process connecting
            them.
          </li>
        </ol>
        <p>Check your own explanation:</p>
        <ul>
          {d.checks.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
