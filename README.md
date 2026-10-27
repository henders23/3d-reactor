# CORE — Reactor laboratory

A browser-based, interactive pressurised-water reactor learning environment, developed as a companion for **Nuclear Science** teaching.

Students can select components, orbit and zoom into a procedural 3D plant, reveal its internal structure, manipulate experiment controls and use the resulting graphs to explain what happened. All geometry, teaching content and simulation code are included. No API keys, external model downloads, accounts or backend are needed.

## Run locally

Requires Node.js 22.12+ (Node 24 also supported).

```bash
npm ci
npm run dev
```

Open the local address printed by Vite. If a managed environment cannot enumerate network interfaces, run `npm run dev -- --host 127.0.0.1`.

```bash
npm test                 # model invariants and learner-workflow tests
npm run build            # type check and build a deployable static site
npm run preview          # inspect the production build
npm run build:standalone # produce standalone/index.html with bundled scripts, CSS and fonts
```

The standalone HTML can be downloaded and opened in a normal desktop browser. Browser policies may restrict local-file storage; learning summaries and CSV export remain available. A WebGL-capable browser is required for the 3D view. The app provides a selectable 2D alternative when WebGL is unavailable.

## Learning design

Start with the essentials for a guided route: one goal, a prediction, a focused observation, your explanation and a new situation to test it. Guided experiments change one variable, pause automatically and show before/after evidence. Feedback follows the attempt. Free exploration retains the full 3D model, sliders and comparison tools.

The student-review revision adds a calm entry, optional key terms, clearer attention cues, larger type and controls, annotated graphs, autosaved short reflections and recall prompts. See the [adversarial review and research rationale](docs/STUDENT-REVIEW.md). These improvements have automated workflow coverage; learner efficacy and visual device validation remain untested.

The [second student review](docs/STUDENT-REVIEW-2.md) adds three further improvements: numbered science annotations, recorded evidence checkpoints with a fuel energy balance, and misconception-specific feedback with revision of the original explanation. It also corrects the distinction between neutron absorption and non-fission capture, and makes all power readouts use one explicit reference.

The [equations and cognitive-load review](docs/REVIEW-COGNITIVE-LOAD.md) restores the supplied checkpoint-based version, adds explicit context and outcomes, and introduces one equation per investigation through meaning, a worked example and ungraded practice. Focused energy and neutron diagrams reduce competing detail; the full equipment layout and 3D exploration remain available.

The curiosity-led course is now the entry point. A course map opens each investigation with a puzzle and shows the equation it will earn. Two investigations have deep-dive screens. The chain lab (02) has an interactive neutron budget, a generation chart and a three-part challenge. Investigation 03 runs in six acts: puzzle, sealed prediction, equation lab, evidence, explanation and a new situation. Its evidence comes from the lab model's own control-rod run. Challenges ask for typed numbers and give feedback on common errors. The guided 3D-lab route and free exploration remain one click away. Course progress is kept in local storage (`core-course-v1`).

## What is included

- Whole-plant, reactor-core and microscopic schematic views.
- Ten component explanations: function, purpose, connections, physics and common misconceptions.
- Orbit, zoom, focus, home camera, vessel cutaway, exploded head and labels.
- Moving control rods; schematic coolant flow and neutron activity; fuel-temperature colour overlay.
- A coupled, deliberately slowed neutron/thermal model with circulation, heat-sink and rod controls.
- Full rod insertion, pause, reset and labelled simulation speed.
- Power and temperature graphs, saved-run comparison, a data table and CSV export including control settings.
- Five investigations: energy pathway, core roles, control rods, cooling and shutdown heat.
- Prediction, evidence gathering, written reflection, corrective feedback and retry.
- A five-question understanding check and downloadable learning summaries.
- Local progress persistence; bundled fonts; reduced motion; keyboard controls; responsive CSS and a 2D fallback.
- A separate pressure/boiling demonstration and primary-source links.

## Suggested teaching sequence

1. Explore the whole plant and identify where heat is generated, transferred, converted and rejected.
2. Distinguish fuel, water moderation and neutron absorption in the core.
3. Predict and observe the response to a small control-rod change.
4. Reduce circulation and explain why fuel temperature can rise while fission power falls.
5. Insert all rods and distinguish suppressed fission, decay heat and stored thermal energy.

See [the teaching guide](docs/TEACHING.md) for prompts and lecturer review points, and [the model specification](docs/MODEL.md) for the equations, coefficients and omissions.

## Scientific scope

This is a **conceptual teaching model**, not a plant-calibrated engineering simulator. Model time, transfer coefficients, lumped temperatures and particle paths are illustrative. The reactor is a generic PWR, not a specific plant. Water is its moderator; graphite would belong to a different reactor design, such as an AGR.

Current assessment requirements were not available for verification during development. This is not a claim of approval or complete syllabus coverage. A nuclear-science lecturer should review the content and assumptions before formal use.

## Project structure

```text
src/App.tsx             Application state, controls and learning workflow
src/Course.tsx          Course map, puzzle, equation lab, evidence and chain lab screens
src/course.ts           Course content, challenge checking and the recorded model run
src/course.css          Dark course theme and animations
src/ReactorScene.tsx    Procedural Three.js geometry, picking and camera controls
src/Schematic.tsx       Keyboard-accessible plant diagram
src/FissionDiagram.tsx  Accessible explanation of neutron outcomes
src/simulation.ts       Pure simulation model, independent of rendering
src/content.ts          Editable components, lessons and references
src/learning.ts         Goals, focused experiments and transfer questions
src/LearningUI.tsx      Orientation, attention cues and before/after evidence
src/science.ts         Scientific annotations, hints and misconception feedback
src/ScienceUI.tsx      Science pathways, evidence inspection and writing support
src/EquationLesson.tsx  Equation meaning, worked examples and retryable practice
src/equations.ts        Equation definitions, assumptions and numerical checks
src/EnergyPath.tsx      Responsive energy map with separate water circuits
src/TrendChart.tsx      Traces and equivalent data table
src/styles.css         Responsive interface styling
tests/                 Model and DOM-based integration tests
docs/                  Science, teaching and validation documentation
```

## Build and hosting

`npm run build` creates `dist/`, which can be served on any static host. Relative asset paths support subdirectory hosting. GitHub Actions runs the tests and build and uploads both the website and standalone HTML as the `core-reactor-laboratory` artifact. Hosting is not automatically enabled by this repository.

## Validation status

Automated model tests and DOM-based learner-workflow tests are included. Type checking and production bundling are part of CI. The development environment blocked local browser previews, so actual WebGL rendering, mobile layout, screen-reader behaviour and device performance still require visual/manual verification. See [VALIDATION.md](docs/VALIDATION.md).

## Dependencies and privacy

React, Three.js, Lucide and bundled DM Sans, Manrope, Space Grotesk, IBM Plex Sans and STIX Two Text fonts. Font licences remain with their installed packages. Original geometry is generated in code. No analytics, tracking, cloud student-data collection or AI service calls are included. Predictions and reflections stay in local storage until the student exports them.
