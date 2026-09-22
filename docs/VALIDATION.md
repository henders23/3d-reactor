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

The revised suite contains 19 tests. It includes a simulated UI clock that executes the guided rod experiment through automatic stopping and replay, rather than merely checking the button exists. A floating-point comparison in the test was corrected to use a tolerance. The physical model equations are unchanged by this revision.

## Remaining manual verification

The available cloud browser rejected the local development-server URL, and its security policy also prohibited opening the generated local HTML. No workaround was attempted. Therefore the following are explicitly **unverified**:

- Actual GPU/WebGL rendering, visual composition and pointer picking.
- Narrow-screen appearance and 200% browser zoom.
- Performance on representative student laptops/tablets.
- Screen-reader behaviour and browser-specific downloads.
- Full class use or formal subject-specialist validation.

Responsive CSS, component-list alternatives, labelled sliders, data tables, reduced motion and fallback diagrams are implemented, but they should not be mistaken for a completed accessibility audit. Browser screenshots are not included because a visual review could not be performed.
