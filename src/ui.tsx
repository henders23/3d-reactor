import { useId, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

/** Secondary detail stays folded away until a learner asks for it. */
export function Disclosure({
  summary,
  children,
  open,
  className = "",
}: {
  summary: ReactNode;
  children: ReactNode;
  open?: boolean;
  className?: string;
}) {
  return (
    <details className={`disclosure ${className}`} open={open}>
      <summary>
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="disclosure-chev"
        />
        <span>{summary}</span>
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

const levels = [
  ["unsure", "Unsure"],
  ["tentative", "Fairly sure"],
  ["confident", "Confident"],
] as const;

/** A three-step confidence choice, used for reflection rather than grading. */
export function Confidence({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const name = useId();
  return (
    <fieldset className="confidence">
      <legend>{legend}</legend>
      <div className="pill-choice">
        {levels.map(([v, label]) => (
          <label key={v}>
            <input
              type="radio"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
