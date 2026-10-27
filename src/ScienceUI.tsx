import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { PartID } from "./content";
import type { Sample } from "./simulation";
import {
  tours,
  explanationSupport,
  checkpoints,
  describeBalance,
} from "./science";
import { Disclosure } from "./ui";
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
        <h2>The pathway</h2>
        <span>
          {index >= 0 ? `${index + 1} of ${steps.length}` : "Choose a step"}
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
          <p>{current.notice}</p>
          <p>{current.mechanism}</p>
          <p className="science-distinction">{current.distinction}</p>
          {id === "energy" && current.part === "steam" && <BoundaryDiagram />}
          <div className="tour-actions">
            {index < steps.length - 1 && (
              <button
                className="button secondary"
                onClick={() => onSelect(steps[index + 1].part)}
              >
                Next relationship <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
            <a href={current.source} target="_blank" rel="noreferrer">
              Source <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : (
        <p className="tour-outside">
          This part is outside the pathway. Choose a numbered step.
        </p>
      )}
    </section>
  );
}
function BoundaryDiagram() {
  return (
    <figure className="boundary-diagram">
      <div className="boundary-columns">
        <div>
          <strong>Primary water</strong>
          <span>Hot liquid inside tubes</span>
        </div>
        <div className="solid-wall">
          <strong>Tube wall</strong>
          <span>Solid metal</span>
        </div>
        <div>
          <strong>Secondary water</strong>
          <span>Boils outside tubes</span>
        </div>
      </div>
      <p className="heat-arrow">
        Energy as heat <ArrowRight aria-hidden="true" size={22} />
        <span>through the wall</span>
      </p>
      <figcaption>
        No fluid crosses the intact wall. This is a section through one tube,
        not another water circuit.
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
      <h3>Choose a moment</h3>
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
  if (!point) return null;
  const s = point.sample;
  return (
    <section
      className="evidence-inspector"
      aria-label="Interpret the captured evidence"
    >
      <div className="snapshot-readings">
        <span>
          Fission power <strong>{s.fission.toFixed(1)}%</strong>
        </span>
        <span>
          Decay heat <strong>{s.decay.toFixed(1)}%</strong>
        </span>
        <span>
          Fuel temperature <strong>{s.fuel.toFixed(1)}°C</strong>
        </span>
      </div>
      <Disclosure
        summary="Why is the fuel warming or cooling?"
        open={id === "cooling"}
        className="heat-balance"
      >
        <p className="balance-equation">
          Rate of change of stored energy = generation − transfer to coolant
        </p>
        <dl>
          <div>
            <dt>Generated in fuel</dt>
            <dd>{s.power.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Transferred to coolant</dt>
            <dd>{s.transfer.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Net into fuel</dt>
            <dd>
              {s.netFuel >= 0 ? "+" : ""}
              {s.netFuel.toFixed(1)}%
            </dd>
          </div>
        </dl>
        <p>{describeBalance(s)}</p>
      </Disclosure>
      <Disclosure summary="Help me connect these readings">
        <p>{explanationSupport[id].deeper}</p>
      </Disclosure>
      <Disclosure summary="What can these numbers tell me?">
        <p>
          Directions of change and energy balance. The 95% fission / 5% decay
          starting split, temperatures and response times are illustrative, not
          measurements or predictions for a real plant. “Net into fuel” is a
          rate of energy accumulation, not an amount of heat.
        </p>
      </Disclosure>
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
      <Disclosure summary="Help me structure my explanation">
        <ol>
          <li>
            <strong>Claim:</strong> what changed, or what relationship did you
            find?
          </li>
          <li>
            <strong>Evidence:</strong> a reading, or a labelled pathway.
          </li>
          <li>
            <strong>Reasoning:</strong> the physical process that connects them.
          </li>
        </ol>
        <p>Check your own explanation:</p>
        <ul>
          {d.checks.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Disclosure>
    </div>
  );
}
