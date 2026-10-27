# Model specification

## Purpose and boundary

The model supports qualitative undergraduate explanations of neutron balance, control, thermal inertia, heat removal and decay heat. It deliberately excludes numerical predictions for an actual plant. Relative power is normalised to the initial state. Temperatures and coefficients are illustrative, and time is labelled **model seconds** throughout the UI.

The neutron and thermal state is computed independently of the Three.js scene. All displays, CSV samples, moving rods and flow indicators read this shared state. Particle paths are explanatory graphics, not a Monte Carlo neutron-transport calculation.

## Neutron balance

One effective delayed-neutron group is used:

```
dn/dt = ((rho - beta) / L) n + lambda C
dC/dt = (beta / L) n - lambda C
```

- `n`: normalised neutron population/fission rate, initially 1.
- `C`: effective precursor inventory, initially `beta / (lambda L)`.
- `beta = 0.0065`, `lambda = 0.08 per model second`.
- `L = 0.005 model seconds`: an artificially lengthened effective prompt generation time. It must not be interpreted as a real PWR value.

With insertion percentage `r`:

```
rho_rods = (50 - r) * 0.00006 - 0.024 * (max(0, r - 70) / 30)^2
rho = rho_rods - 0.000012 * (T_fuel - 600) - 0.000018 * (T_coolant - 310)
```

The chosen rod-worth curve is illustrative, including a stronger shutdown region above 70% insertion. It is not a real rod-bank worth curve. Full insertion remains subcritical as the model cools. These fixed negative temperature coefficients represent a chosen teaching state; actual moderator coefficients vary with design and operating conditions.

## Thermal model

Three effective decay-heat inventories track recent fission history:

```
dD_i/dt = (a_i * n - D_i) / tau_i
a = [0.01, 0.02, 0.02]
tau = [6, 60, 600] model seconds
Q_total = 0.95 * n + sum(D_i)
```

These inventories illustrate continuing heat generation after shutdown. They do not reproduce an evaluated decay-heat curve, isotope inventory, irradiation history or ANS standard. The initial decay contribution is 5% of the normalised initial thermal power; it is a teaching assumption.

With flow fraction `f` and heat-sink factor `s`:

```
Q_fuel_to_water = (T_fuel - T_coolant) / 290 * f^0.55
Q_removed = (T_coolant - 270) / 40 * f^0.7 * s
dT_fuel/dt = (Q_total - Q_fuel_to_water) / 0.09
dT_coolant/dt = (Q_fuel_to_water - Q_removed) / 0.30
```

The effective heat capacities are expressed relative to normalised power; they are not material heat-capacity data. Secondary saturation temperature is held at 270°C. The heat-sink slider represents an aggregate heat-removal factor, not a real condenser control.

At the initial state, `T_fuel = 600°C`, `T_coolant = 310°C`, `f = s = 1`, and each heat transfer equals the unit heat input. This equilibrium is checked over 300 model seconds.

The relative electrical output follows `Q_removed` through an eight-model-second lag with a fixed assumed efficiency. It is normalised to initial **electrical** output, while thermal output is normalised to initial **thermal** output. Two readings of 100% do not mean equal absolute power or 100% conversion efficiency. Absolute MW are deliberately not displayed.

## Integration and validity range

Explicit integration subdivides each elapsed interval into steps of at most 0.02 model seconds. UI updates are independent of rendering frame rate. Long inactive-tab gaps are capped to avoid large unintended simulation jumps. A model state outside any of the following bounds pauses the application:

- Fuel temperature above 900°C.
- Representative coolant temperature above 340°C or below 270°C.
- Neutron population above 2.5 times the initial value.
- Non-finite model values.

These bounds are software/model validity boundaries, **not plant safety thresholds**. They are not a simulation of protection systems. The coolant ceiling is below the approximate saturation temperature at the chosen pressure; the model has no boiling closure and must not be used to infer boiling onset. Pressure is held fixed in the main model.

## Pressure demonstration

A separate slider linearly interpolates rounded saturation reference points: approximately `(0.1 MPa, 100°C)`, `(1 MPa, 180°C)`, `(5 MPa, 264°C)`, `(15.5 MPa, 345°C)`. It illustrates the pressure/boiling relationship and is clearly identified as an approximation, not a steam-table calculator. It does not alter the main model.

## Visual interpretation

- Cutaways and exploded geometry reveal component relationships; they are not operating configurations.
- Tube routing and proportions are illustrative. Primary, secondary and external cooling circuits are distinct.
- Fuel temperature is one lumped value, so its colour overlay is uniform rather than a spatial temperature field.
- Neutron counts, sizes, trajectories and speeds on screen are schematic.
- The fission view shows selected possible outcomes: fission, moderation and absorption. It is not a claim that every released neutron causes fission.
- Reduced-motion mode freezes decorative travel and camera interpolation; rods still reflect their selected position.

## Omitted processes

Spatial neutron transport, detailed hydraulics/CFD, boiling/voiding, xenon and samarium, burnup, fuel enrichment changes, soluble boron control, actual control-system logic, turbine thermodynamics, protection systems, emergency cooling, structural analysis and accident progression.

## Source basis

- [US DOE: How does a nuclear reactor work?](https://www.energy.gov/ne/articles/nuclear-101-how-does-nuclear-reactor-work) — PWR energy pathway, fuel, moderator and control rods.
- [US NRC: Pressurised-water reactors](https://www.nrc.gov/reactors/power/pwrs) — PWR components.
- [US NRC: Spent fuel storage](https://www.nrc.gov/facilities-safety/storage-of-spent-nuclear-fuel/spent-fuel-storage-in-pools-and-dry-casks-key-points-and-questions-answers) — continuing decay heat after shutdown.
- [EDF: Graphite cores](https://www.edfenergy.com/about/nuclear/graphite-core) — the distinction between fixed graphite moderator and moving absorbers in AGRs.
- [IAPWS IF97](https://iapws.org/relguide/IF97-Rev.html) — water/steam property reference. The application uses rounded teaching points rather than implementing this formulation.

The coefficients above are explicit teaching design choices, not values attributed to these sources. Subject-specialist review is outstanding.

## Displayed energy balance and recorded checkpoints

`heatBalance(state, controls)` provides the instantaneous fission, decay, total generation, fuel-to-coolant transfer and external removal rates used by the model. Fuel energy accumulates at generation minus fuel-to-coolant transfer. This is distinct from net energy accumulation across the entire model, which also includes the coolant.

Recorded samples now include fission power, transfer to coolant and net power into the fuel. Every power percentage uses initial total thermal power as its reference. Stored thermal energy itself is not plotted as a percentage or directly as temperature. The starting 95/5 fission/decay split is illustrative.

The evidence inspector selects actual recorded samples: the initial state, the first sample at or beyond two model seconds, and the final sample. It labels the actual selected time and updates graph markers and readings. It does not interpolate invented measurements or rewind the 3D view.

The numerical equations and coefficients are unchanged by the second science review. Power readouts are now evaluated at the returned end-of-step state, correcting a one-substep reporting offset in the original implementation.

## Learner-facing equations

`src/equations.ts` and `src/EquationLesson.tsx` add physical relationships to the Explain stage. They do not replace or recalibrate the numerical model above. The dimensional worked examples are separate from live normalised powers and model seconds. In particular, the UI does not infer efficiency from the two percentage indices, does not derive outlet/inlet temperatures from the average coolant state, and does not fit the three decay inventories to the isolated-population half-life example. The displayed current-state heat-balance connection is computed with the same `heatBalance` function as the simulator.

See [the review](REVIEW-COGNITIVE-LOAD.md) for assumptions and scientific references for each taught relation.
