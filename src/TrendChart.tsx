import { useEffect, useId, useRef, useState } from "react";
import type { Sample } from "./simulation";
type Metric = "power" | "temperature";
export default function TrendChart({
  samples,
  baseline,
  preferredMetric = "power",
  event,
}: {
  samples: Sample[];
  baseline: Sample[];
  preferredMetric?: Metric;
  event?: { time: number; label: string };
}) {
  const [metric, setMetric] = useState<Metric>(preferredMetric);
  const clip = useId();
  const chart = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const element = chart.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(260, entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const data = samples.slice(-300),
    base = baseline;
  const keys =
    metric === "power"
      ? (["power", "decay"] as const)
      : (["fuel", "coolant"] as const);
  const names =
    metric === "power" ? ["Thermal output", "Decay heat"] : ["Fuel", "Coolant"];
  const all = [...data, ...base];
  const max =
    metric === "power"
      ? Math.max(125, ...all.map((s) => s.power)) * 1.05
      : Math.ceil(Math.max(650, ...all.map((s) => s.fuel)) / 100) * 100;
  const min =
    metric === "power"
      ? 0
      : Math.floor(Math.min(200, ...all.map((s) => s.coolant)) / 100) * 100;
  const start = data[0]?.time ?? 0,
    end = Math.max(start + 30, data.at(-1)?.time ?? 30);
  const height = 185,
    left = 48,
    right = width - 22,
    top = 25,
    bottom = 146;
  const x = (t: number) =>
    left + ((t - start) / (end - start)) * (right - left);
  const y = (n: number) => bottom - ((n - min) / (max - min)) * (bottom - top);
  const line = (a: Sample[], key: (typeof keys)[number]) =>
    a.map((s, i) => `${i ? "L" : "M"}${x(s.time)},${y(s[key])}`).join(" ");
  const last = data.at(-1);
  return (
    <section ref={chart} className="trend" aria-label="Experiment graphs">
      <div className="trend-head">
        <div className="small-heading">OBSERVE THE RESPONSE</div>
        <div className="segmented small" aria-label="Graph measurement">
          <button
            aria-pressed={metric === "power"}
            className={metric === "power" ? "active" : ""}
            onClick={() => setMetric("power")}
          >
            Power
          </button>
          <button
            aria-pressed={metric === "temperature"}
            className={metric === "temperature" ? "active" : ""}
            onClick={() => setMetric("temperature")}
          >
            Temperature
          </button>
        </div>
      </div>
      {event && (
        <p className="graph-event">
          <strong>Control changed at {event.time.toFixed(1)} model s:</strong>{" "}
          {event.label}
        </p>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          metric === "power"
            ? "Thermal output and decay heat over model time, as percentages of initial thermal output"
            : "Fuel and coolant temperatures over model time, in degrees Celsius"
        }
      >
        <defs>
          <clipPath id={clip}>
            <rect
              x={left}
              y={top - 2}
              width={right - left}
              height={bottom - top + 4}
            />
          </clipPath>
        </defs>
        <text x={left} y="14" fontSize="12" fill="#45594d">
          {metric === "power"
            ? "% of initial thermal output"
            : "Temperature (°C)"}
        </text>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1={left}
              x2={right}
              y1={y(min + f * (max - min))}
              y2={y(min + f * (max - min))}
              stroke="#c6d0c4"
              strokeDasharray="3 4"
            />
            <text
              x={left - 8}
              y={y(min + f * (max - min)) + 4}
              textAnchor="end"
              fill="#45594d"
              fontSize="12"
            >
              {Math.round(min + f * (max - min))}
            </text>
          </g>
        ))}
        <g clipPath={`url(#${clip})`}>
          {base.length > 1 && (
            <path
              d={line(base, keys[0])}
              stroke="#6c766f"
              strokeWidth="2"
              strokeDasharray="2 5"
              fill="none"
            />
          )}
          {event && event.time >= start && event.time <= end && (
            <line
              x1={x(event.time) + 1}
              x2={x(event.time) + 1}
              y1={top}
              y2={bottom}
              stroke="#5d6754"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}
          {keys.map((k, i) => (
            <path
              key={k}
              d={line(data, k)}
              fill="none"
              stroke={i ? "#287575" : "#ab5b1f"}
              strokeWidth="3"
              strokeDasharray={i ? "8 4" : undefined}
              strokeLinejoin="round"
            />
          ))}
        </g>
        {[0, 0.5, 1].map((f) => (
          <text
            key={f}
            x={x(start + f * (end - start))}
            y={bottom + 18}
            textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"}
            fill="#45594d"
            fontSize="12"
          >
            {(start + f * (end - start)).toFixed(0)}
          </text>
        ))}
        <text
          x={(left + right) / 2}
          y="182"
          textAnchor="middle"
          fill="#45594d"
          fontSize="12"
        >
          Elapsed model time (seconds)
        </text>
      </svg>
      <div className="chart-legend">
        {keys.map((k, i) => (
          <span key={k}>
            <i className={`line-key ${i ? "secondary" : ""}`} />
            {names[i]}: {last?.[k].toFixed(1) ?? "—"}
            {metric === "power" ? "%" : "°C"}
          </span>
        ))}
        {baseline.length > 1 && (
          <span>
            <i className="dash" />
            Saved run · elapsed time aligned
          </span>
        )}
      </div>
      <details className="chart-table">
        <summary>View data table</summary>
        <div className="table-scroll">
          <table>
            <caption>Latest ten recorded measurements</caption>
            <thead>
              <tr>
                <th>Model s</th>
                <th>Thermal %</th>
                <th>Decay %</th>
                <th>Fuel °C</th>
                <th>Coolant °C</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-10).map((s, i) => (
                <tr key={i}>
                  <td>{s.time.toFixed(1)}</td>
                  <td>{s.power.toFixed(1)}</td>
                  <td>{s.decay.toFixed(1)}</td>
                  <td>{s.fuel.toFixed(1)}</td>
                  <td>{s.coolant.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
