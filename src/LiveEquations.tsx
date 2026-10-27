import type { ReactNode } from "react";
import { heatBalance, type Controls, type State } from "./simulation";
import { Frac, Op, Sym } from "./CourseKit";

/* Live equation cards: the lab model's own relations, with its current numbers in every term. */

const pct = (x: number, d = 1) => (x * 100).toFixed(d);
const signedPct = (x: number) =>
  `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}`;

function Card({
  title,
  status,
  tone,
  focus,
  equation,
  label,
  children,
}: {
  title: string;
  status: string;
  tone: "up" | "down" | "steady";
  focus?: boolean;
  equation: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <article className={`live-card${focus ? " is-focus" : ""}`}>
      <header>
        <h3>{title}</h3>
        <span className={`live-status live-status--${tone}`}>{status}</span>
      </header>
      <div className="live-eq" role="img" aria-label={label}>
        {equation}
      </div>
      {children}
    </article>
  );
}

/** Fuel heat balance: what the fission and decay put in, minus what the coolant takes out. */
export function HeatBalanceCard({
  fission,
  decay,
  toCoolant,
  fuel,
  focus,
  title = "Fuel heat balance",
}: {
  fission: number;
  decay: number;
  toCoolant: number;
  fuel: number;
  focus?: boolean;
  title?: string;
}) {
  const net = fission + decay - toCoolant;
  const tone = net > 0.002 ? "up" : net < -0.002 ? "down" : "steady";
  const scale = Math.max(fission + decay, toCoolant, 1.2);
  return (
    <Card
      title={title}
      focus={focus}
      tone={tone}
      status={
        tone === "up"
          ? "Fuel warming"
          : tone === "down"
            ? "Fuel cooling"
            : "Fuel steady"
      }
      label={`C f d T f over d t equals P f plus P d minus Q dot: ${pct(fission)} plus ${pct(decay)} minus ${pct(toCoolant)} equals ${signedPct(net)} percent`}
      equation={
        <>
          <Sym b="C" s="f" tone="text2" />
          <Frac
            top={
              <>
                dT<sub>f</sub>
              </>
            }
            bottom="dt"
          />
          <Op>=</Op>
          <Sym b="P" s="f" tone="amber" />
          <Op>+</Op>
          <Sym b="P" s="d" tone="amber2" />
          <Op>−</Op>
          <Sym b="Q̇" s="f→c" tone="blue" />
        </>
      }
    >
      <p className="live-sub">
        <span className="c-amber">{pct(fission)}</span> +{" "}
        <span className="c-amber2">{pct(decay)}</span> −{" "}
        <span className="c-blue">{pct(toCoolant)}</span> ={" "}
        <strong>{signedPct(net)}</strong> %
      </p>
      <div className="live-bars" aria-hidden="true">
        <span
          className="live-bar live-bar--in"
          style={{ width: `${((fission + decay) / scale) * 100}%` }}
        />
        <span
          className="live-bar live-bar--out"
          style={{ width: `${(toCoolant / scale) * 100}%` }}
        />
      </div>
      <p className="live-foot">
        Heat in (fission + decay) vs heat out to the coolant · fuel{" "}
        <strong>{fuel.toFixed(0)} °C</strong>
      </p>
    </Card>
  );
}

/** Reactivity from the rods and from temperature feedback sets k_eff. */
export function ChainCard({
  state,
  controls,
  focus,
}: {
  state: State;
  controls: Controls;
  focus?: boolean;
}) {
  const rods =
    (50 - controls.rods) * 0.00006 -
    0.024 * Math.pow(Math.max(0, controls.rods - 70) / 30, 2);
  const temperature =
    -(state.fuel - 600) * 0.000012 - (state.coolant - 310) * 0.000018;
  const rho = rods + temperature;
  const k = 1 / (1 - rho);
  const tone = k > 1.00005 ? "up" : k < 0.99995 ? "down" : "steady";
  // Gauge spans k = 0.99 … 1.01; values beyond pin to the ends.
  const marker = Math.max(0, Math.min(100, ((k - 0.99) / 0.02) * 100));
  return (
    <Card
      title="Chain reaction"
      focus={focus}
      tone={tone}
      status={
        tone === "up"
          ? "Growing"
          : tone === "down"
            ? "Shrinking"
            : "Steady (critical)"
      }
      label={`k eff equals 1 over 1 minus rho, rho equals ${rho.toFixed(5)}, k eff equals ${k.toFixed(4)}`}
      equation={
        <>
          <Sym b="k" s="eff" tone="blue" />
          <Op>=</Op>
          <Frac top="1" bottom={<>1 − ρ</>} />
          <Op>=</Op>
          <span className="live-big">{k.toFixed(4)}</span>
        </>
      }
    >
      <div className="live-gauge" aria-hidden="true">
        <span className="live-gauge-mid" />
        <span className="live-gauge-marker" style={{ left: `${marker}%` }} />
        <small>0.99</small>
        <small>1</small>
        <small>1.01</small>
      </div>
      <p className="live-foot">
        ρ = rods{" "}
        <strong>
          {rods >= 0 ? "+" : "−"}
          {Math.abs(rods).toFixed(4)}
        </strong>{" "}
        + temperature feedback{" "}
        <strong>
          {temperature >= 0 ? "+" : "−"}
          {Math.abs(temperature).toFixed(4)}
        </strong>
      </p>
    </Card>
  );
}

/** Heat carried away by the coolant depends on how much flows and how hot it is. */
export function CoolantCard({
  state,
  controls,
  focus,
}: {
  state: State;
  controls: Controls;
  focus?: boolean;
}) {
  const { removed, toCoolant } = heatBalance(state, controls);
  const net = toCoolant - removed;
  const tone = net > 0.002 ? "up" : net < -0.002 ? "down" : "steady";
  const rise = state.coolant - 270;
  return (
    <Card
      title="Heat carried away"
      focus={focus}
      tone={tone}
      status={
        tone === "up"
          ? "Coolant warming"
          : tone === "down"
            ? "Coolant cooling"
            : "Coolant steady"
      }
      label={`Q dot equals m dot c p delta T: flow ${controls.flow} percent, temperature difference ${rise.toFixed(1)} kelvin, heat removed ${pct(removed)} percent`}
      equation={
        <>
          <Sym b="Q̇" s="out" tone="blue" />
          <Op>=</Op>
          <Sym b="ṁ" tone="blue2" />
          <Sym b="c" s="p" />
          <Sym b="ΔT" tone="amber" />
        </>
      }
    >
      <p className="live-sub">
        flow <span className="c-blue2">{controls.flow}%</span> · ΔT{" "}
        <span className="c-amber">{rise.toFixed(1)} K</span> → removed{" "}
        <strong>{pct(removed)}</strong> %
      </p>
      <div className="live-bars" aria-hidden="true">
        <span
          className="live-bar live-bar--flow"
          style={{ width: `${Math.min(100, controls.flow / 1.3)}%` }}
        />
        <span
          className="live-bar live-bar--rise"
          style={{ width: `${Math.max(0, Math.min(100, (rise / 70) * 100))}%` }}
        />
      </div>
      <p className="live-foot">
        In this model the heat removed grows with flow<sup>0.7</sup> × (coolant
        − 270 °C) · electricity follows it:{" "}
        <strong>{pct(state.electric, 0)}%</strong> of initial
      </p>
    </Card>
  );
}

/** Decay heat: three radioactive inventories, each fading on its own clock. */
export function DecayCard({ state, focus }: { state: State; focus?: boolean }) {
  const [d1, d2, d3] = state.decay;
  const total = d1 + d2 + d3;
  const tone = total < 0.0495 ? "down" : total > 0.0505 ? "up" : "steady";
  return (
    <Card
      title="Decay heat"
      focus={focus}
      tone={tone}
      status={
        tone === "down" ? "Fading" : tone === "up" ? "Building" : "Steady"
      }
      label={`P d equals D 1 plus D 2 plus D 3: ${pct(d1, 2)} plus ${pct(d2, 2)} plus ${pct(d3, 2)} equals ${pct(total, 2)} percent`}
      equation={
        <>
          <Sym b="P" s="d" tone="amber2" />
          <Op>=</Op>
          <Sym b="D" s="1" />
          <Op>+</Op>
          <Sym b="D" s="2" />
          <Op>+</Op>
          <Sym b="D" s="3" />
        </>
      }
    >
      <p className="live-sub">
        {pct(d1, 2)} + {pct(d2, 2)} + {pct(d3, 2)} ={" "}
        <strong>{pct(total, 2)}</strong> %
      </p>
      <div className="live-stack" aria-hidden="true">
        {[d1, d2, d3].map((d, i) => (
          <span key={i} style={{ width: `${(d / 0.06) * 100}%` }} />
        ))}
      </div>
      <p className="live-foot">
        Fast, medium and slow inventories (6, 60 and 600 model s). Rods can’t
        switch these off.
      </p>
    </Card>
  );
}

export type LiveFocus = "heat" | "chain" | "coolant" | "decay";
/** All four cards: the whole model, written as equations that update while it runs. */
export function LiveEquations({
  state,
  controls,
  focus,
}: {
  state: State;
  controls: Controls;
  focus?: LiveFocus;
}) {
  const hb = heatBalance(state, controls);
  return (
    <section className="live-equations" aria-labelledby="live-eq-title">
      <div className="live-head">
        <h2 id="live-eq-title">The equations, live</h2>
        <p>Every number below comes from the model as it runs.</p>
      </div>
      <div className="live-grid">
        <HeatBalanceCard
          fission={hb.fission}
          decay={hb.decay}
          toCoolant={hb.toCoolant}
          fuel={state.fuel}
          focus={focus === "heat"}
        />
        <ChainCard
          state={state}
          controls={controls}
          focus={focus === "chain"}
        />
        <CoolantCard
          state={state}
          controls={controls}
          focus={focus === "coolant"}
        />
        <DecayCard state={state} focus={focus === "decay"} />
      </div>
    </section>
  );
}
