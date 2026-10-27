# Adversarial review: equations, orientation and diagrams

27 October 2026 · CORE companion

## Verdict

The attached version has a useful prediction–observation–explanation cycle, but it asks a novice to infer too much: what they should learn, how a changing display becomes a quantitative explanation, and which lines represent water rather than energy. Adding a formula sheet would increase that burden. The revision instead connects one equation to each investigation, teaches its use with a worked example, and separates conceptual diagrams from equipment detail.

This is a heuristic review from cognitive load theory and a simulated undergraduate perspective. It is **not** an observation of actual students, a measured reduction in cognitive load, or a validation of learning gains. The student quotations below are deliberately adversarial prompts, not participant data.

## Which version was reviewed and replaced?

The supplied `CORE-reactor-laboratory.html` is byte-for-byte identical to a standalone rebuild of source commit `6cafd2de16f01b6b98cf6c9ec22de2b75702c37b`.

SHA-256: `7c6dfcb297091ca3c9baf1f24a10d81c5c9ed5f2a50274dd04ea6281f15b13fb`.

The repository had subsequently introduced beat-by-beat experiment displays in commits `71e3357` and `8c3ee9d`. This revision deliberately restores the attachment's checkpoint workflow and builds on it, as requested. The replacement is a new commit after the existing main branch, retaining history. Three-dimensional exploration, controls, automatic observation stops, evidence checkpoints and reflection/retry remain available.

## Findings and response

| Priority | Student challenge                                             | Cognitive or scientific problem                                                                                                                       | Revision                                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | “What am I supposed to be able to do afterwards?”             | The initial question is engaging, but task completion can replace a learning goal. Prior knowledge is implicit.                                       | Visible context and five observable outcomes before entry. Optional primer on ratios, energy, power, temperature and rates. Time estimate includes equation practice.                                          |
| High     | “I can describe the graph, but which equation explains it?”   | Qualitative descriptions do not automatically transfer to symbolic reasoning. A dense set of equations would introduce too many interacting elements. | One relevant relation in each Explain step. Meaning → worked substitution → one changed case, followed by a physical interpretation.                                                                           |
| High     | “Which symbol is which? Is this number from my run?”          | Separate definitions create search and integration demands. Normalised model readings can be mistaken for dimensional measurements.                   | Definitions beside the relation, stated units, explicit illustrative-number labels and assumptions. Only the fuel heat-balance connection uses actual model-state rates, labelled with the current model time. |
| High     | “Does the primary water go into the turbine?”                 | A visually connected route can suggest fluid continuity across heat exchangers. Colour alone is insufficient.                                         | An energy map names three separate circuits and two wall boundaries. Fluid circulation and cross-wall heat use different symbols and text labels. Detailed equipment layout remains optional.                  |
| Medium   | “Do these three pictures happen in this order?”               | Three adjacent neutron images invite a false sequence; line segments do not clearly encode direction or particle identity.                            | A single selected interaction with arrowheads, particle labels and a caption beside it. Explicitly alternative outcomes, with capture and leakage acknowledged.                                                |
| High     | “Can I divide the two 100% readings and get 100% efficiency?” | Electrical and thermal indices use different baselines. This would be a quantitatively wrong conclusion.                                              | Efficiency uses explicitly dimensional illustrative MW inputs; the percentage-ratio trap is stated in the lesson.                                                                                              |
| High     | “If I halve the flow, does power always halve?”               | The flow relation is conditional. Steady flow, constant specific heat, phase and what stays fixed all matter.                                         | Distinguish fixed temperature rise from fixed heat load. Explain why a transient need not satisfy either imposed comparison.                                                                                   |
| High     | “After a half-life, is the reactor cool?”                     | Radioactive population, decay power, stored energy and temperature are different quantities.                                                          | Separate ongoing heat generation from stored thermal energy. The half-life calculation is explicitly one hypothetical isolated population, not the simulator's decay law.                                      |
| Medium   | “Where should I look while writing?”                          | Adding equations beside an active model, graph and annotation would compete for attention.                                                            | Explain defaults to the equation. Recorded evidence can be reopened; revision restores it. The equation precedes the writing task in DOM order and on narrow layouts.                                          |

## Why these decisions fit the evidence

Split attention is a risk when learners must mentally combine essential information from separated sources. This motivates putting symbols, units and the relation together, and attaching descriptions to the relevant diagram. It does not imply that all text and all diagrams should be displayed simultaneously. [Ayres & Sweller, 2014](https://doi.org/10.1017/CBO9781139547369.011).

Worked examples can reduce unproductive search, but their presentation matters: a disjoint example can itself impose integration demands. That supports a compact substitution with its interpretation, followed by a similar practice case. It does not establish the effectiveness of this particular application. [Ward & Sweller, 1990](https://doi.org/10.1207/s1532690xci0701_1).

These principles motivate design choices; they do not justify removing all difficulty. Students still predict, interpret signs, state assumptions, explain mechanisms and apply ideas to a new conceptual case. Clicking, animation and a correct arithmetic answer are not substitutes for those activities.

## Equations now taught

| Investigation | Relation                            | Learning purpose                                                        | Boundary on interpretation                                                                                                |
| ------------- | ----------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Energy        | `η = P_e / P_th`                    | Connect electricity output to heat input and heat rejection.            | Same steady period and compatible power units; never divide the model's two percentage indices.                           |
| Neutrons      | `k_eff = N_(g+1) / N_g`             | Relate losses and production to shrinking, sustained or growing chains. | Fixed-condition generation picture with a settled distribution; not instantaneous dot counts or a time scale.             |
| Control rods  | `C_f dT_f/dt = P_f + P_d − Q̇_(f→c)` | Explain a temperature trend from net stored-energy change.              | One lumped fuel temperature; dimensional example constants are separate from slowed model coefficients.                   |
| Cooling       | `Q̇ = ṁ c_p (T_out − T_in)`          | Connect mass flow, temperature rise and energy transport.               | Steady single-phase approximation, constant specific heat; use enthalpy across phase changes.                             |
| Shutdown      | `P_d(t) = P_d,0 × 2^(−t/T½)`        | Interpret a half-life without assuming heat becomes zero.               | One isolated population with fixed deposited energy per decay, no production or daughter feeding; real fuel is a mixture. |

Each lesson supplies symbol definitions, an example, a short numerical task, retry feedback, a reflection prompt and a primary-source link. The numerical exercises check a result within an explicit tolerance, not the reasoning used to obtain it. They are ungraded, optional and not stored as a mastery record. Existing conceptual transfer checks and written explanations remain the principal learning cycle.

## Second-pass critique of the revision

1. **The welcome is longer.** Five outcomes and the three-job primer add reading before interaction. The prerequisites are collapsible and the entry buttons remain prominent, but testing may show the outcomes need further compression. Do not assume more orientation always helps.
2. **The energy map simplifies geometry.** Its vertical path is an energy story; the labelled circulation returns are not a piping drawing. The equipment view and 3D view are still needed to study spatial structure. Small components such as pumps are less prominent in the conceptual route.
3. **The equation steps can become button clicking.** The practice is deliberately optional and learners can go directly to it. A student who skips examples may still understand the material; a student who completes every step may not. Do not gate conceptual progress on arithmetic alone.
4. **Worked examples can produce imitation.** A near-transfer numerical problem is not a strong mastery measure. Follow with a different set of values and a request to explain why the equation applies, without displaying the worked substitution.
5. **Assumptions add reading load.** They are essential to scientific honesty, but novices may ignore them. Ask students to identify just the assumption relevant to their claim, rather than memorising every limitation.
6. **Checkpoint evidence remains dense.** Restoring the requested attachment also restores its simultaneous readings, graph and heat balance. The equation view hides this until requested, but the observation stage still deserves a think-aloud test for attention switching.
7. **Visual and accessibility quality are not established by code.** DOM tests cover selection, labels and the learner flow. They cannot certify actual WebGL output, mobile legibility, browser zoom or screen-reader experience.

## Validation and next study

The revised automated suite has 27 passing tests. It checks model invariants, a complete guided workflow, misconception revision, diagram–annotation selection, equation feedback for all five activities, unit/sign mistakes, invalid input and equation concealment during the conceptual check. Type checking, production and standalone builds are recorded in `VALIDATION.md`.

Before class use, run a formative think-aloud with 5–8 students spanning confidence levels. This sample can reveal usability problems; it cannot establish an efficacy claim. Ask each student to:

- trace a parcel of primary water and explain why it cannot reach the turbine through an intact exchanger;
- interpret a neutron multiplication factor without treating the animation as data;
- explain a case where fuel warms while fission power falls;
- solve an unseen equation case and state the key assumption;
- distinguish decay heat from stored thermal energy after shutdown.

Record wrong inferences, prompts needed, diagram/definition searches and reasons for revisiting evidence. Use a short mental-effort rating after each activity as a subjective measure, not an objective load reading. Re-test the key explanations after a delay. For a learning-gain comparison, use matched prior-knowledge groups and a suitable study design rather than comparing completion times alone.

## Scientific sources checked

- [NRC: Pressurized Water Reactors](https://www.nrc.gov/reactors/power/pwrs): system-level energy path and primary/secondary separation.
- [NRC: Condenser](https://www.nrc.gov/education-regulatory-research/glossary/condenser): heat rejection to a circulating cooling-water system.
- [DOE Thermodynamics, volume 1](https://www.energy.gov/documents/doe-hdbk-1012-92vol1): conservation of energy, efficiency and single-phase heat transport. The teaching examples and unit conversions are authored for this app.
- [DOE Nuclear Physics and Reactor Theory, volume 2](https://www.energy.gov/documents/doe-hdbk-1019-93vol2): multiplication factor, criticality and decay-heat context.
- [DOE Nuclear Physics and Reactor Theory, volume 1](https://www.energy.gov/sites/default/files/2026-04/DOE-HDBK-1019-93_VOL1.pdf): radioactive decay and half-life. Applying the decay law to power additionally assumes fixed deposited energy per decay.

The science model is still conceptual, not plant-calibrated. No curriculum approval, lecturer sign-off or student validation is implied.
