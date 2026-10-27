# Validation record

## Automated checks

Run `npm test` for the current results. The suite includes:

1. Initial neutron/thermal equilibrium over five model minutes.
2. The initial direction and lag of the control-rod response.
3. Fuel warming with reduced circulation and negative reactivity feedback.
4. Sustained shutdown after cooling, with continuing and decreasing decay heat.
5. Coolant cooling when heat removal increases.
6. Independence from UI timestep segmentation within tolerance.
7. Finite model states across representative control combinations until validity limits.
8. Independent reset inventories.
9. Keyboard selection and the automatic WebGL-unavailable fallback.
10. A complete guided activity with prediction, explanation and persistence.
11. Quiz feedback and retry.
12. Reset while retaining a saved comparison.
13. Full rod insertion and resumption of the response.
14. Guided single-variable controls, completion gating, automatic pause and replay.
15. Calm entry and paused free exploration.
16. Feedback withheld until an attempt and short reflection drafts persisted.
    17–19. Each quantitative guided experiment reaches the same target model time across different playback increments, preserves the other inputs and produces the intended qualitative response.

The interface tests use React Testing Library and jsdom. They exercise application behaviour, not GPU rendering or physical device input. `npm run build` checks TypeScript and creates the production bundle. `npm run build:standalone` produces a portable single HTML file with bundled fonts.

## Issues found and corrected during development

- Full insertion in an earlier rod-worth approximation allowed temperature feedback to restore a non-zero equilibrium. Stronger illustrative shutdown worth was added and sustained shutdown is now regression-tested.
- Observation completion initially used total elapsed time. Guided runs now restart from equilibrium, apply the specified setting and stop at the exact observation duration (within floating-point tolerance).
- The baseline graph initially shifted old traces incorrectly after the display window advanced. Comparison now uses common elapsed model time.
- Reduced motion now freezes decorative neutron travel as well as flow and turbine animation.
- 3D-only controls are disabled or hidden in the WebGL fallback.
- Fonts are bundled rather than fetched from Google at runtime.

## Student-review revision

The first review suite contained 19 tests. It includes a simulated UI clock that executes the guided rod experiment through automatic stopping and replay, rather than merely checking the button exists. A floating-point comparison in the test was corrected to use a tolerance. The physical model equations are unchanged by this revision.

## Second review validation

The current suite contains 23 tests. Additional coverage checks instantaneous power accounting and agreement with the numerical fuel energy derivative; annotation-to-component selection; graph checkpoint selection; neutron-diagram selection; and a wrong-answer → evidence review → written revision → successful retry workflow with the first draft preserved.

The second review found and corrected an ambiguous neutron distractor, a one-substep power-reporting offset, and duplicate React keys for graph/inspector siblings. The PWR schematic was redrawn to connect the primary tube path and distinguish water circuits. These code and DOM checks do not validate final visual appearance.

## Remaining manual verification

The available cloud browser rejected the local development-server URL, and its security policy also prohibited opening the generated local HTML. No workaround was attempted. Therefore the following are explicitly **unverified**:

- Actual GPU/WebGL rendering, visual composition and pointer picking.
- Narrow-screen appearance and 200% browser zoom.
- Performance on representative student laptops/tablets.
- Screen-reader behaviour and browser-specific downloads.
- Full class use or formal subject-specialist validation.

Responsive CSS, component-list alternatives, labelled sliders, data tables, reduced motion and fallback diagrams are implemented, but they should not be mistaken for a completed accessibility audit. Browser screenshots are not included because a visual review could not be performed.

## Equation and diagram revision · 27 October 2026

The supplied standalone file was matched byte-for-byte to a fresh build of commit `6cafd2d` before edits. The attachment's checkpoint workflow was restored as the base for this revision. The physical simulation coefficients were not changed.

The revised suite contains 27 tests. New coverage checks numerical answers independently in the requested units, cooling signs, Unicode-minus input, invalid/non-finite entries, example-to-practice feedback for all five investigations, visible introductory outcomes, evidence reopening and equation concealment during conceptual checks. The DOM order places the equation before the reflection and moves focus to its heading. Tests re-query the active investigation panel after stage changes because it moves after the equation in Explain.

Production type checking/build and the bundled standalone build pass. A Vite advisory remains for the existing Three.js chunk size; it is not a build failure.

The three authored neutron SVGs and tube-wall SVG were rendered with Sharp and inspected as static images. This found a missing fluid arrowhead caused by two subpaths sharing one `marker-end`; the fluid paths were separated. This is diagram-only verification, not a browser screenshot or a check of the surrounding HTML/CSS. The responsive energy map, complete interface, real WebGL, device layouts and assistive-technology behaviour still need the manual verification listed above. No learning-gain study has been performed.
