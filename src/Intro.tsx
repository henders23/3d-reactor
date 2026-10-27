import {
  ArrowRight,
  Calculator,
  FlaskConical,
  Gauge,
  Lightbulb,
  Ruler,
  Sigma,
  Thermometer,
} from "lucide-react";
import { lessons } from "./content";
import { courseSteps, outcomes } from "./course";
import { Brand, Law, type CourseProps } from "./CourseKit";
import { PlantVisual } from "./DeepDives";

const stepIcons = [
  <Lightbulb size={22} key="p" />,
  <Gauge size={22} key="r" />,
  <Sigma size={22} key="e" />,
  <FlaskConical size={22} key="v" />,
];

/** The first screen: what this is, why it matters, how it works and what students will be able to do. */
export function IntroScreen({ go, onExplore }: CourseProps) {
  return (
    <>
      <header className="c-header c-header--line">
        <Brand />
      </header>

      <section className="c-hero">
        <div className="c-stack c-stack--lg">
          <h1 className="c-h1" tabIndex={-1}>
            How does a nuclear power station work?
          </h1>
          <p className="c-lead">
            In a pressurised-water reactor (PWR), splitting uranium nuclei heat
            water. That heat makes steam, and the steam spins a generator.
            Nuclear power supplies about a tenth of the world’s electricity, and
            most of it comes from reactors of this type.
          </p>
          <p className="c-lead">
            You’ll work through five investigations, each built around one
            question and one equation, using a working model of the plant.
          </p>
          <div className="c-actions">
            <button className="c-btn c-btn--primary" onClick={() => go("map")}>
              Start the course <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button className="c-btn c-btn--ghost" onClick={onExplore}>
              Explore freely
            </button>
          </div>
          <p className="c-meta">
            Five investigations · 35–45 minutes in total · progress is saved on
            this device
          </p>
        </div>
        <div className="c-stack c-stack--sm">
          <div className="c-visual">
            <PlantVisual />
          </div>
          <p className="c-note">
            Heat moves between three separate water circuits; the water itself
            never crosses between them.
          </p>
        </div>
      </section>

      <section className="c-section" aria-labelledby="c-how-title">
        <h2 id="c-how-title" className="c-h2">
          How each investigation works
        </h2>
        <ol className="c-steps">
          {courseSteps.map((s, i) => (
            <li key={s.name}>
              <span className="c-steps-icon" aria-hidden="true">
                {stepIcons[i]}
              </span>
              <strong>
                {i + 1} · {s.name}
              </strong>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="c-section c-outcomes"
        aria-labelledby="outcomes-title"
      >
        <h2 id="outcomes-title" className="c-h2">
          Learning outcomes
        </h2>
        <p className="c-sub">By the end of the course you’ll be able to:</p>
        <ol>
          {outcomes.map((o, i) => (
            <li key={o.id}>
              <span className="c-outcome-tag">
                0{i + 1} · {lessons[i].name}
              </span>
              <span>{o.text}</span>
              <Law id={o.id} size="card" />
            </li>
          ))}
        </ol>
      </section>

      <section className="c-section" aria-labelledby="c-know-title">
        <h2 id="c-know-title" className="c-h2">
          Useful to know
        </h2>
        <div className="c-know">
          <div>
            <Calculator size={22} aria-hidden="true" />
            <strong>Maths</strong>
            <p>
              Basic ratios, percentages and algebra. A derivative here just
              means “rate of change”, and every equation comes with a worked
              example.
            </p>
          </div>
          <div>
            <Ruler size={22} aria-hidden="true" />
            <strong>Energy and power</strong>
            <p>
              Energy is an amount, in joules. Power is energy per second, in
              watts. 1 MW is a million joules every second.
            </p>
          </div>
          <div>
            <Thermometer size={22} aria-hidden="true" />
            <strong>Temperature</strong>
            <p>
              Temperature (°C or K) says how hot something is, not how much heat
              it stores. That difference matters in Investigation 03.
            </p>
          </div>
        </div>
        <p className="c-note">
          Everything runs on a simplified teaching model of a generic PWR, not a
          real plant. Its colours, particles and timing explain ideas; they are
          not measurements.
        </p>
      </section>
    </>
  );
}
