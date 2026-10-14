import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import type { Sample } from "./simulation";
import { temperaturePeak } from "./science";

type Range = [number, number];
type Key = "fuel" | "power" | "transfer";
type Beat = "ran" | "flows" | "marker";
const heatIn = "#ab5b1f",
  heatOut = "#2f6690",
  ink = "#253b34";
const predictions = [
  "Keep rising the whole time",
  "Rise, then stop and turn back",
  "Drop back to its starting value straight away",
];

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

function BeatChart({
  title,
  label,
  samples,
  duration,
  range,
  series,
  marker,
  markerLabel,
  xAxis = false,
}: {
  title: string;
  label: string;
  samples: Sample[];
  duration: number;
  range: Range;
  series: { key: Key; color: string }[];
  marker?: Sample;
  markerLabel?: string;
  xAxis?: boolean;
}) {
  const [ref, width] = useWidth();
  const height = xAxis ? 180 : 160,
    left = 44,
    right = width - 12,
    top = 28,
    bottom = 150;
  const x = (t: number) =>
    left + (Math.min(t, duration) / duration) * (right - left);
  const y = (v: number) =>
    bottom - ((v - range[0]) / (range[1] - range[0])) * (bottom - top);
  const step = niceStep((range[1] - range[0]) / 4);
  const ticks: number[] = [];
  for (let v = Math.ceil(range[0] / step) * step; v <= range[1]; v += step)
    ticks.push(v);
  const path = (k: Key) =>
    samples
      .map(
        (s, i) =>
          `${i ? "L" : "M"}${x(s.time).toFixed(1)},${y(s[k]).toFixed(1)}`,
      )
      .join(" ");
  return (
    <div ref={ref} className="beats-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <text x={left} y={14} className="beats-chart-title">
          {title}
        </text>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="#e3e8e0" />
            <text x={left - 8} y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {series.map((s) => (
          <path
            key={s.key}
            d={path(s.key)}
            fill="none"
            stroke={s.color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
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
            {series.map((s) => (
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
            <text
              x={x(marker.time) + 10}
              y={top + 4}
              className="beats-chart-mark"
            >
              {markerLabel}
            </text>
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

/** The circulation experiment, released one beat at a time: predict, run and
 * see temperature, reveal heat in and heat out, then mark where they meet. */
export default function HeatBalanceBeats({
  action,
  duration,
  ranges,
  samples,
  running,
  started,
  observed,
  onRun,
  onToggle,
  onDone,
}: {
  action: string;
  duration: number;
  ranges: { temperature: Range; power: Range };
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
  const peak = observed ? temperaturePeak(run) : undefined;
  const time = Math.min(last.time, duration);
  const showFlows = phase === "flows" || phase === "marker";
  const marker = phase === "marker" ? peak : undefined;
  const title =
    phase === "predict"
      ? `Over the next ${duration} model seconds, what will fuel temperature do?`
      : phase === "running"
        ? "Watch the fuel temperature."
        : phase === "ran"
          ? peak
            ? `It rose to ${peak.fuel.toFixed(0)} °C, then turned back. Why did it turn?`
            : `It ended at ${last.fuel.toFixed(0)} °C. What set its course?`
          : phase === "flows"
            ? "Look where the temperature peaks. What are heat in and heat out doing there?"
            : peak
              ? "They cross."
              : "Compare heat in with heat out.";
  const readings = [0, 0.25, 0.5, 0.75, 1].map((f) =>
    run.reduce((a, b) =>
      Math.abs(b.time - f * duration) < Math.abs(a.time - f * duration) ? b : a,
    ),
  );
  return (
    <section className="beats" aria-label="Focused experiment">
      <p className="beats-change">{action} · nothing else changes</p>
      {prediction !== null && (phase === "running" || phase === "ran") && (
        <p className="beats-note">
          You predicted: {predictions[prediction].toLowerCase()}.
        </p>
      )}
      <h2 id="guided-stage-title" ref={heading} tabIndex={-1}>
        {title}
      </h2>

      {phase === "marker" && peak && (
        <>
          <p>
            At {peak.time.toFixed(1)} model seconds, heat in is{" "}
            {peak.power.toFixed(1)}% and heat out is {peak.transfer.toFixed(1)}
            %. With the flows equal, stored energy stops growing, so the
            temperature stops rising. Heat in was falling the whole time.
          </p>
          <p
            className="beats-equation"
            aria-label="C times the rate of temperature change equals heat in minus heat out"
          >
            <i>C</i> × d<i>T</i>/d<i>t</i> ={" "}
            <span className="beats-in">heat in</span> −{" "}
            <span className="beats-out">heat out</span>
          </p>
        </>
      )}

      {phase === "predict" && (
        <>
          <div className="beats-choices">
            {predictions.map((p, i) => (
              <button
                key={p}
                aria-pressed={prediction === i}
                onClick={() => setPrediction(i)}
              >
                {p}
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
          {showFlows && (
            <>
              <div className="beats-legend">
                <span>
                  <i style={{ borderColor: heatIn }} />
                  Heat in
                </span>
                <span>
                  <i style={{ borderColor: heatOut }} />
                  Heat out
                </span>
              </div>
              <BeatChart
                key="flows"
                title="HEAT FLOWS · %"
                label={`Heat in and heat out over model time, as percentages of the starting thermal power.${peak ? ` They meet at ${peak.time.toFixed(1)} model seconds.` : ""}`}
                samples={run}
                duration={duration}
                range={ranges.power}
                series={[
                  { key: "power", color: heatIn },
                  { key: "transfer", color: heatOut },
                ]}
                marker={marker}
                markerLabel="cross"
              />
            </>
          )}
          <BeatChart
            key="temperature"
            title="FUEL TEMPERATURE · °C"
            label={
              peak
                ? `Fuel temperature rises from ${first.fuel.toFixed(0)} °C to a peak of ${peak.fuel.toFixed(0)} °C at ${peak.time.toFixed(1)} model seconds, then falls to ${last.fuel.toFixed(0)} °C.`
                : "Fuel temperature over model time."
            }
            samples={run}
            duration={duration}
            range={ranges.temperature}
            series={[{ key: "fuel", color: ink }]}
            marker={marker}
            markerLabel="peak"
            xAxis
          />
        </div>
      )}

      {phase === "ran" && (
        <button className="beats-action" onClick={() => setBeat("flows")}>
          Show heat in and heat out
        </button>
      )}
      {phase === "flows" && (
        <button className="beats-action" onClick={() => setBeat("marker")}>
          I’ve looked. Show me.
        </button>
      )}
      {phase === "marker" && (
        <button className="beats-action" onClick={onDone}>
          Explain what happened <ArrowRight size={18} />
        </button>
      )}

      {showFlows && (
        <div className="beats-more">
          <details>
            <summary>What do these lines measure?</summary>
            <p>
              Heat in is the total thermal power generated in the fuel: fission
              plus decay heat. Heat out is the rate heat transfers from the fuel
              to the coolant. Both are percentages of the starting total thermal
              power. The model is a slowed teaching model, not a real plant.
            </p>
          </details>
          <details>
            <summary>Show the numbers</summary>
            <div className="table-scroll">
              <table>
                <caption>Recorded readings from this run</caption>
                <thead>
                  <tr>
                    <th>Model s</th>
                    <th>Heat in %</th>
                    <th>Heat out %</th>
                    <th>Fuel °C</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((s, i) => (
                    <tr key={i}>
                      <td>
                        {s.time.toFixed(1)}
                        {i === 0 ? " (before the change)" : ""}
                      </td>
                      <td>{s.power.toFixed(1)}</td>
                      <td>{s.transfer.toFixed(1)}</td>
                      <td>{s.fuel.toFixed(1)}</td>
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
