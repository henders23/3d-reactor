import { useState } from "react";
import type { Sample } from "./simulation";
export default function TrendChart({
  samples,
  baseline,
}: {
  samples: Sample[];
  baseline: Sample[];
}) {
  const [metric, setMetric] = useState<"power" | "temperature">("power");
  const data = samples.slice(-300),
    base = baseline;
  const keys =
    metric === "power"
      ? (["power", "decay"] as const)
      : (["fuel", "coolant"] as const);
  const all = [...data, ...base];
  const max =
    metric === "power"
      ? Math.max(125, ...all.map((s) => s.power)) * 1.05
      : Math.ceil(Math.max(650, ...all.map((s) => s.fuel)) / 100) * 100;
  const min = metric === "power" ? 0 : 200;
  const start = data[0]?.time ?? 0,
    end = Math.max(start + 30, data.at(-1)?.time ?? 30);
  const width = 720,
    height = 102;
  function line(a: Sample[], key: (typeof keys)[number], isBase = false) {
    return a
      .map((s, i) => {
        const time = s.time;
        return `${i ? "L" : "M"}${38 + ((time - start) / (end - start)) * (width - 50)},${height - 8 - ((s[key] - min) / (max - min)) * (height - 18)}`;
      })
      .join(" ");
  }
  return (
    <section className="trend" aria-label="Experiment graphs">
      <div className="trend-head">
        <div className="small-heading">OBSERVE THE RESPONSE</div>
        <div className="segmented small">
          <button
            className={metric === "power" ? "active" : ""}
            onClick={() => setMetric("power")}
          >
            Power
          </button>
          <button
            className={metric === "temperature" ? "active" : ""}
            onClick={() => setMetric("temperature")}
          >
            Temperature
          </button>
        </div>
      </div>
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
          <clipPath id="plotClip">
            <rect x="38" y="0" width="672" height="102" />
          </clipPath>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1="38"
              x2="710"
              y1={height - 8 - f * (height - 18)}
              y2={height - 8 - f * (height - 18)}
              stroke="#e1e6df"
              strokeDasharray="3 4"
            />
            <text
              x="30"
              y={height - 4 - f * (height - 18)}
              textAnchor="end"
              fill="#6d7973"
              fontSize="10"
            >
              {Math.round(min + f * (max - min))}
            </text>
          </g>
        ))}
        <g clipPath="url(#plotClip)">
          {base.length > 1 && (
            <path
              d={line(base, keys[0], true)}
              stroke="#8a9590"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              fill="none"
            />
          )}
          {keys.map((k, i) => (
            <path
              key={k}
              d={line(data, k)}
              fill="none"
              stroke={i ? "#5c9694" : "#c78743"}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
      <div className="chart-legend">
        <span>
          <i className="dot amber" />
          {metric === "power" ? "Thermal output" : "Fuel"}{" "}
          {metric === "power" ? "(%)" : "(°C)"}
        </span>
        <span>
          <i className="dot teal" />
          {metric === "power" ? "Decay heat (%)" : "Coolant (°C)"}
        </span>
        {baseline.length > 1 && (
          <span>
            <i className="dash" />
            Saved run · elapsed time aligned
          </span>
        )}
        <span className="chart-time">
          {start.toFixed(0)}–{end.toFixed(0)} model s
        </span>
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
