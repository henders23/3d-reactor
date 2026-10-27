import { useId, useState } from "react";
import { equations, checkEquation, type EquationID } from "./equations";
import { heatBalance, type State, type Controls } from "./simulation";
export function EquationFormula({ id }: { id: EquationID }) {
  const formulas = {
    energy: (
      <>
        η = P<sub>e</sub> / P<sub>th</sub>
      </>
    ),
    neutrons: (
      <>
        k<sub>eff</sub> = N<sub>g+1</sub> / N<sub>g</sub>
      </>
    ),
    control: (
      <>
        C<sub>f</sub> dT<sub>f</sub>/dt = P<sub>f</sub> + P<sub>d</sub> − Q̇
        <sub>f→c</sub>
      </>
    ),
    cooling: (
      <>
        Q̇ = ṁ c<sub>p</sub> (T<sub>out</sub> − T<sub>in</sub>)
      </>
    ),
    shutdown: (
      <>
        P<sub>d</sub>(t) = P<sub>d,0</sub> × 2<sup>−t/T½</sup>
      </>
    ),
  };
  return (
    <p className="equation-formula" aria-label={equations[id].words}>
      {formulas[id]}
    </p>
  );
}
export default function EquationLesson({
  id,
  state,
  controls,
}: {
  id: EquationID;
  state: State;
  controls: Controls;
}) {
  const e = equations[id],
    uid = useId();
  const [page, setPage] = useState(0),
    [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof checkEquation> | null>(
    null,
  );
  const b = heatBalance(state, controls);
  return (
    <section
      className="equation-lesson"
      aria-label="Connect the equation to your observation"
    >
      <h2 id="equation-title" tabIndex={-1}>
        {e.title}
      </h2>
      <nav className="equation-pages" aria-label="Equation learning steps">
        {["Meaning", "Worked example", "Try it"].map((label, i) => (
          <button
            key={label}
            aria-pressed={page === i}
            onClick={() => setPage(i)}
          >
            {i + 1} · {label}
          </button>
        ))}
      </nav>
      <EquationFormula id={id} />
      <p>{e.words}</p>
      {page === 0 ? (
        <>
          <dl className="equation-symbols">
            {e.symbols.map(([symbol, meaning]) => (
              <div key={symbol}>
                <dt>{symbol}</dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>
          <div className="equation-connection">
            <strong>Connect it to what you saw</strong>
            <p>{e.observation}</p>
            {(id === "control" || id === "cooling") && (
              <p>
                At {state.time.toFixed(1)} model s (current state): generation{" "}
                {(b.generated * 100).toFixed(1)}% − transfer{" "}
                {(b.toCoolant * 100).toFixed(1)}% = net{" "}
                {(b.netFuel * 100).toFixed(1)}% of initial thermal power. The
                sign indicates{" "}
                {b.netFuel > 0.001
                  ? "warming"
                  : b.netFuel < -0.001
                    ? "cooling"
                    : "near balance"}{" "}
                at this instant.
              </p>
            )}
          </div>
          <p className="equation-assumption">
            <strong>When this applies </strong>
            {e.assumption}
          </p>
          <button className="secondary-button" onClick={() => setPage(1)}>
            See a worked example →
          </button>
        </>
      ) : page === 1 ? (
        <>
          <p className="equation-example-label">
            Illustrative numbers · separate from the live model
          </p>
          <p>
            <strong>Given </strong>
            {e.given}
          </p>
          <p className="equation-substitution">{e.substitution}</p>
          <p>
            <strong>Meaning </strong>
            {e.interpretation}
          </p>
          <details>
            <summary>Symbols and assumptions</summary>
            <dl className="equation-symbols">
              {e.symbols.map(([symbol, meaning]) => (
                <div key={symbol}>
                  <dt>{symbol}</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
            <p>{e.assumption}</p>
          </details>
          <button className="secondary-button" onClick={() => setPage(2)}>
            Try one change yourself →
          </button>
        </>
      ) : (
        <>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setResult(checkEquation(id, input));
            }}
          >
            <label htmlFor={`${uid}-answer`}>{e.question}</label>
            <div className="equation-answer">
              <input
                id={`${uid}-answer`}
                type="text"
                inputMode="decimal"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setResult(null);
                }}
                aria-describedby={`${uid}-unit ${uid}-feedback`}
                autoComplete="off"
              />
              <span id={`${uid}-unit`}>{e.unit}</span>
              <button className="primary-button" type="submit">
                Check calculation
              </button>
            </div>
            <p
              id={`${uid}-feedback`}
              role="status"
              className={`equation-feedback ${result === "correct" ? "correct" : ""}`}
            >
              {result === "correct"
                ? e.success
                : result === "retry"
                  ? `Try again. ${e.hint}`
                  : result === "empty"
                    ? "Enter a number before checking."
                    : result === "invalid"
                      ? "Enter a number only; the unit is shown beside the field."
                      : "Practice is ungraded. You can retry or revisit the example."}
            </p>
          </form>
          <details>
            <summary>Show a hint</summary>
            <p>{e.hint}</p>
          </details>
          <p className="equation-connection">
            <strong>Now explain the physics </strong>
            {e.reflect}
          </p>
        </>
      )}
      <a
        className="equation-source"
        href={e.source}
        target="_blank"
        rel="noreferrer"
      >
        Scientific background · DOE handbook ↗
      </a>
    </section>
  );
}
