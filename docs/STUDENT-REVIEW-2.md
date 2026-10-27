# Second student review: explanation, evidence and scientific meaning

22 September 2026. This is an adversarial inspection of the current source and learner workflows, not a report of observed student preferences. It follows the first review in `STUDENT-REVIEW.md`.

## What still stood in the student's way

The calmer first revision improved entry and attention. The remaining problem was the jump from seeing a changing model to explaining the mechanism. A student could obey every instruction, select the right answer and still have an incomplete explanation of the system.

| Rank | A student's plausible question                                               | Diagnosis                                                                                                                                                                | Revision built                                                                                                                                                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | “I can identify the part, but how does it connect to the next part?”         | Names and purpose statements do not necessarily make a causal relationship visible. The circuit drawing's disconnected-looking tube paths also weakened the explanation. | Selectable, numbered science pathways explain what to notice, why it happens and which distinction matters. A tube-wall section makes the primary/secondary boundary explicit. The plant schematic now connects the tube and return paths, labels the circuits and shows flow direction. |
| 2    | “The fuel is hotter but the power is lower. What am I supposed to conclude?” | Endpoint readings conceal the early response. Total thermal power, fission power, decay heat and temperature can be conflated.                                           | Before-change, early-response and final-response checkpoints drive the readings and graph marker together. A fuel energy balance distinguishes generation, transfer to coolant and energy accumulation, with an optional causal explanation.                                             |
| 3    | “I got it wrong. How do I improve what I wrote?”                             | General corrective prose did not diagnose the selected misconception or provide a route back to the evidence.                                                            | Feedback now responds to the chosen misconception. Students can return to the captured evidence, use a hint or a claim/evidence/reasoning scaffold, revise their explanation and retry. Their first draft, latest draft and evidence remain in the learning summary.                     |

## Science corrections and clarifications

**Absorption is not synonymous with suppression of the chain.** The earlier wording could imply that every absorbed neutron was lost without further fission. Absorption in fuel can lead to fission; capture in a control rod is used to reduce the chain. One distractor (“It must be absorbed before it can cause fission”) was compatible with induced fission and was therefore not a sound incorrect option. It has been replaced. The neutron view distinguishes fission, moderation and capture, and states that water also absorbs some neutrons and that leakage is omitted from the pictured examples [1, 2].

**The PWR boundary needs to be visible.** In the annotated tube section, energy crosses solid metal while each fluid stays on its own side. The whole-plant schematic distinguishes the primary, secondary and external cooling paths. The primary pressure suppresses bulk boiling in normal operation; the pressuriser intentionally has a steam space. The drawings remain schematic, not engineering layouts [2, 3].

**Power and temperature need separate meanings.** All power percentages have one denominator: the initial total thermal power. A starting fission value of 95% therefore does not imply 95% plant efficiency. Total thermal power equals the illustrative fission contribution plus decay heat. Fuel warming or cooling follows the difference between generation and transfer to coolant. Heat transferred out of the fuel is explicitly distinguished from heat rejected by the plant.

**Decay heat and stored energy are different.** Decay heat is continuing energy release from radioactive material. Stored thermal energy is already present in the fuel and coolant. Suppressing the chain does not instantly eliminate either consideration [4].

The equations and coefficients are unchanged. Calculation and display now use the same heat-rate function, and reported rates are evaluated at the final state of each numerical step. This removes the previous one-substep offset between temperature and power readouts. Tests check both the displayed sum of fission plus decay and agreement with the fuel energy derivative.

## Explanations and annotations: student-facing decisions

- A label names a part; an annotation explains a relationship. Each pathway step has a short “Notice” and “Why”, followed by one distinction. Clicking a step selects the corresponding part. Selecting an unrelated component never silently shows a different part's annotation.
- The pathway begins at the fuel and proceeds at the student's pace. It does not introduce another automatic animation to follow.
- Mechanistic support is available during observation. Delaying all explanation until a wrong answer would leave a novice guessing. The transfer question still hides the learning panels during the first attempt; explanatory support can be revisited afterwards.
- Numerical interpretation follows the evidence. Checkpoint buttons sit before the readings and graph, and the selected time is explicit. Selecting a checkpoint does not rewind the 3D plant; the interface states that the plant remains at the final state.
- The heat balance opens by default for the cooling investigation, where it is central. Other detail remains optional. The sign description is calculated from the selected sample; it is not a fixed “fuel is warming” script.
- The first explanation is preserved. A revision is labelled as such only when the text changes after feedback. A multiple-choice success does not grade the writing.
- On narrow screens the plant schematic can scroll within its own panel, keeping labels large enough to read. The adjacent HTML annotations, component controls and neutron interaction cards provide alternatives to interpreting a dense SVG.

## What I would improve next

1. **Check retention with an unfamiliar case after a delay.** The current next-day prompt is useful but cannot establish retained understanding. A short alternate question set with a comparison to the earlier explanation would add more than another visual effect.
2. **Map examples and vocabulary to the lecturer's actual unit materials.** The PWR emphasis and conceptual depth need confirmation against the current teaching and assessment.
3. **Try the app with students and actual devices.** Use a think-aloud task and score the physical reasoning, not button completion. Include learners with limited prior nuclear physics and users navigating by keyboard or screen reader.

These are priorities for subsequent work, not claims that the three implemented changes improve attainment. No student study or visual browser verification was completed in this environment.

## References used for the scientific review

1. US Nuclear Regulatory Commission. _Reactor Concepts Manual: The Fission Process and Heat Production_. [Chapter 2](https://www.nrc.gov/sites/default/files/doc_library/cdn/legacy/reading-rm/basic-ref/students/for-educators/02.pdf). Indexed text checked; direct PDF retrieval was unavailable.
2. US Department of Energy (2025). _Nuclear 101: How Does a Nuclear Reactor Work?_ [Article](https://www.energy.gov/ne/articles/nuclear-101-how-does-nuclear-reactor-work).
3. US Nuclear Regulatory Commission. _Pressurized Water Reactors_ and _PWR Systems_. [Overview](https://www.nrc.gov/reactors/power/pwrs), [training chapter](https://www.nrc.gov/reading-rm/basic-ref/students/for-educators/04.pdf). Indexed descriptions checked; direct page/PDF retrieval was unavailable.
4. US Nuclear Regulatory Commission. _Glossary: decay heat_. [Glossary](https://www.nrc.gov/education-regulatory-research/glossary/full-text).

The learning-science rationale and its limits are documented in the first review. This revision applies that rationale to the remaining explanatory and feedback gaps; it does not claim a new efficacy evaluation.
