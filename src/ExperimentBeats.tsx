import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import type { Sample } from "./simulation";
import { units, type BeatPanel, type ExperimentBeatsDesign } from "./beats";

type Beat = "ran" | "reveal" | "marked";
const ink = "#253b34";

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceStep(raw: number) {
  const power = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw)!;
}

function describe(panel: BeatPanel, samples: Sample[], marker?: Sample) {
  const first = samples[0],
    last = samples.at(-1)!;
  const lines = panel.series.map(
    (s) =>
      `${s.label} from ${first[s.key].toFixed(1)}${units[s.key]} to ${last[s.key].toFixed(1)}${units[s.key]}`,
  );
  return `${lines.join("; ")}.${marker ? ` Marked at ${marker.time.toFixed(1)} model seconds.` : ""}`;
}

function BeatChart({
  panel,
  samples,
  duration,
  marker,
  xAxis,
}: {
  panel: BeatPanel;
  samples: Sample[];
  duration: number;
  marker?: Sample;
  xAxis: boolean;
}) {
  const [ref, width] = useWidth();
  const clip = useId();
  const [low, high] = panel.range;
  const height = xAxis ? 180 : 160,
    left = 44,
    right = width - 12,
    top = 28,
    bottom = 150;
  const x = (t: number) =>
    left + (Math.min(t, duration) / duration) * (right - left);
  const y = (v: number) => bottom - ((v - low) / (high - low)) * (bottom - top);
  const step = niceStep((high - low) / 4);
  const ticks: number[] = [];
  for (let v = Math.ceil(low / step) * step; v <= high; v += step)
    ticks.push(v);
  const path = (k: BeatPanel["series"][number]["key"]) =>
    samples
      .map(
        (s, i) =>
          `${i ? "L" : "M"}${x(s.time).toFixed(1)},${y(s[k]).toFixed(1)}`,
      )
      .join(" ");
  const markLeft = marker && x(marker.time) > left + 0.6 * (right - left);
  return (
    <div ref={ref} className="beats-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={describe(panel, samples, marker)}
      >
        <defs>
          <clipPath id={clip}>
            <rect
              x={left}
              y={top - 4}
              width={right - left}
              height={bottom - top + 8}
            />
          </clipPath>
        </defs>
        <text x={left} y={14} className="beats-chart-title">
          {panel.title}
        </text>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="#e3e8e0" />
            <text x={left - 8} y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <g clipPath={`url(#${clip})`}>
          {panel.series.map((s) => (
            <path
              key={s.key}
              d={path(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth="3"
              strokeDasharray={s.dashed ? "7 5" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </g>
        {marker && (
          <g>
            <line
              x1={x(marker.time)}
              x2={x(marker.time)}
              y1={top - 6}
              y2={bottom}
              stroke={ink}
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
            {panel.series
              .filter((s) => marker[s.key] >= low && marker[s.key] <= high)
              .map((s) => (
                <circle
                  key={s.key}
                  cx={x(marker.time)}
                  cy={y(marker[s.key])}
                  r="6"
                  fill="#fff"
                  stroke={ink}
                  strokeWidth="2.5"
                />
              ))}
            {panel.mark && (
              <text
                x={x(marker.time) + (markLeft ? -10 : 10)}
                y={top + 4}
                textAnchor={markLeft ? "end" : "start"}
                className="beats-chart-mark"
              >
                {panel.mark}
              </text>
            )}
          </g>
        )}
        {xAxis &&
          [0, 0.25, 0.5, 0.75, 1].map((f) => (
            <text
              key={f}
              x={x(f * duration)}
              y={height - 6}
              textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"}
            >
              {f === 1 ? `${duration} s` : (f * duration).toFixed(0)}
            </text>
          ))}
      </svg>
    </div>
  );
}

/** A guided run released one beat at a time: predict, run and watch one line,
 * reveal the lines that explain it, then mark the moment that matters. */
export default function ExperimentBeats({
  design,
  action,
  duration,
  samples,
  running,
  started,
  observed,
  onRun,
  onToggle,
  onDone,
}: {
  design: ExperimentBeatsDesign;
  action: string;
  duration: number;
  samples: Sample[];
  running: boolean;
  started: boolean;
  observed: boolean;
  onRun: () => void;
  onToggle: () => void;
  onDone: () => void;
}) {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [beat, setBeat] = useState<Beat>("ran");
  const heading = useRef<HTMLHeadingElement>(null);
  const phase = !started ? "predict" : !observed ? "running" : beat;
  useEffect(() => {
    heading.current?.focus();
  }, [phase]);
  const run = samples.filter((s) => s.time <= duration + 1e-6);
  const first = run[0],
    last = run.at(-1)!;
  const moment = observed ? design.moment(run) : undefined;
  const time = Math.min(last.time, duration);
  const showReveal = phase === "reveal" || phase === "marked";
  const marker = phase === "marked" ? moment : undefined;
  const title =
    phase === "predict"
      ? `Over the next ${duration} model seconds, ${design.question}`
      : phase === "running"
        ? design.watch
        : phase === "ran"
          ? design.ran(first, last, moment)
          : phase === "reveal"
            ? design.explore
            : design.found;
  const panels = !showReveal
    ? [design.primary]
    : design.revealAbove
      ? [design.reveal, design.primary]
      : [design.primary, design.reveal];
  const series = [...design.primary.series, ...design.reveal.series];
  const readings = [
    ...new Set([
      ...[0, 0.25, 0.5, 0.75, 1].map((f) =>
        run.reduce((a, b) =>
          Math.abs(b.time - f * duration) < Math.abs(a.time - f * duration)
            ? b
            : a,
        ),
      ),
      ...(moment ? [moment] : []),
    ]),
  ].sort((a, b) => a.time - b.time);
  return (
    <section className="beats" aria-label="Focused experiment">
      <p className="beats-change">{action} · nothing else changes</p>
      {prediction !== null && (phase === "running" || phase === "ran") && (
        <p className="beats-note">
          You predicted: {design.choices[prediction].toLowerCase()}.
        </p>
      )}
      <h2 id="guided-stage-title" ref={heading} tabIndex={-1}>
        {title}
      </h2>

      {phase === "marked" && moment && (
        <>
          <p>{design.explain(first, last, moment)}</p>
          {design.balanceEquation && (
            <p
              className="beats-equation"
              aria-label="C times the rate of temperature change equals heat in minus heat out"
            >
              <i>C</i> × d<i>T</i>/d<i>t</i> ={" "}
              <span className="beats-in">heat in</span> −{" "}
              <span className="beats-out">heat out</span>
            </p>
          )}
        </>
      )}

      {phase === "predict" && (
        <>
          <div className="beats-choices">
            {design.choices.map((c, i) => (
              <button
                key={c}
                aria-pressed={prediction === i}
                onClick={() => setPrediction(i)}
              >
                {c}
              </button>
            ))}
          </div>
          {prediction !== null && (
            <button className="beats-action" onClick={onRun}>
              <Play size={18} /> Run it
            </button>
          )}
        </>
      )}

      {phase === "running" && (
        <div className="beats-progress">
          <progress
            aria-label="Model seconds observed"
            max={duration}
            value={time}
          />
          <span>
            {time.toFixed(0)} / {duration} model seconds
          </span>
          <button className="beats-secondary" onClick={onToggle}>
            {running ? <Pause size={15} /> : <Play size={15} />}{" "}
            {running ? "Pause" : "Continue"}
          </button>
        </div>
      )}

      {phase !== "predict" && (
        <div className="beats-charts">
          {panels.map((panel, i) => (
            <div key={panel.title} className="beats-panel">
              {panel.series.length > 1 && (
                <div className="beats-legend">
                  {panel.series.map((s) => (
                    <span key={s.key}>
                      <i
                        style={{
                          borderColor: s.color,
                          borderTopStyle: s.dashed ? "dashed" : "solid",
                        }}
                      />
                      {s.label}
                    </span>
                  ))}
                </div>
              )}
              <BeatChart
                panel={panel}
                samples={run}
                duration={duration}
                marker={marker}
                xAxis={i === panels.length - 1}
              />
            </div>
          ))}
        </div>
      )}

      {phase === "ran" && (
        <button className="beats-action" onClick={() => setBeat("reveal")}>
          {design.revealButton}
        </button>
      )}
      {phase === "reveal" && (
        <button className="beats-action" onClick={() => setBeat("marked")}>
          I’ve looked. Show me.
        </button>
      )}
      {phase === "marked" && (
        <button className="beats-action" onClick={onDone}>
          Explain what happened <ArrowRight size={18} />
        </button>
      )}

      {showReveal && (
        <div className="beats-more">
          <details>
            <summary>What do these lines measure?</summary>
            <p>{design.measures}</p>
          </details>
          <details>
            <summary>Show the numbers</summary>
            <div className="table-scroll">
              <table>
                <caption>Recorded readings from this run</caption>
                <thead>
                  <tr>
                    <th>Model s</th>
                    {series.map((s) => (
                      <th key={s.key}>
                        {s.label} {units[s.key]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r) => (
                    <tr key={r.time}>
                      <td>
                        {r.time.toFixed(1)}
                        {r === first
                          ? " (before the change)"
                          : r === moment
                            ? " (marked)"
                            : ""}
                      </td>
                      {series.map((s) => (
                        <td key={s.key}>{r[s.key].toFixed(1)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
