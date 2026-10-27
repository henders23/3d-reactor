import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { parts, type PartID } from "./content";

/** Scroll a lab control into view so a step's instruction and its control are seen together. */
export function showTarget(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  el?.focus?.({ preventScroll: true });
}

export type GuideStep = {
  icon: ReactNode;
  title: string;
  hint: string;
  done: boolean;
  target: string;
};
/** Explore mode: three numbered things to try, ticked off as the student does them. */
export function StartGuide({ steps }: { steps: GuideStep[] }) {
  const next = steps.findIndex((s) => !s.done);
  return (
    <section className="lab-guide" aria-label="Start here">
      <ol>
        {steps.map((s, i) => (
          <li key={s.title}>
            <button
              className={`lab-guide-step ${s.done ? "done" : i === next ? "now" : ""}`}
              onClick={() => showTarget(s.target)}
            >
              <span className="lab-guide-num" aria-hidden="true">
                {s.done ? <Check size={16} /> : i + 1}
              </span>
              <span className="lab-guide-icon" aria-hidden="true">
                {s.icon}
              </span>
              <span>
                <strong>{s.title}</strong>
                <small>{s.done ? "Done" : s.hint}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      {next === -1 && (
        <p className="lab-guide-done" role="status">
          You’ve tried all three. Ready to test an idea? Open the Investigate
          tab.
        </p>
      )}
    </section>
  );
}

/** Investigate mode: the one thing to do now, and which step of four it is. */
export function NextStep({
  step,
  icon,
  text,
  detail,
}: {
  step: number;
  icon: ReactNode;
  text: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <section
      className="next-step"
      aria-label="Your next step"
      aria-live="polite"
    >
      <span className="next-step-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <small>Step {Math.min(step, 4)} of 4</small>
        <strong>{text}</strong>
        {detail && <p>{detail}</p>}
      </div>
    </section>
  );
}

/** A visible list of every part, so the model is never the only way to choose one. */
export function PartChips({
  selected,
  onSelect,
  pulse,
}: {
  selected: PartID;
  onSelect: (id: PartID) => void;
  pulse?: boolean;
}) {
  return (
    <div
      id="part-chips"
      tabIndex={-1}
      className={`part-chips ${pulse ? "is-next" : ""}`}
      role="group"
      aria-label="Choose a part"
    >
      <span className="part-chips-label">Click a part:</span>
      {parts.map((p) => (
        <button
          key={p.id}
          className={selected === p.id ? "selected" : ""}
          aria-pressed={selected === p.id}
          onClick={() => onSelect(p.id)}
        >
          <i style={{ background: p.color }} aria-hidden="true" />
          {p.name}
        </button>
      ))}
    </div>
  );
}
