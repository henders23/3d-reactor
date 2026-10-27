# Teaching with CORE

## Intended learning outcomes

After the investigations, a student should be able to trace energy through separate circuits and calculate efficiency; distinguish fission, moderation and capture and interpret a multiplication factor; use a fuel energy balance to explain power/temperature lag; relate mass flow to heat transport while stating what is fixed; and distinguish decay heat from stored thermal energy while applying a simple half-life model. These outcomes appear before entry.

PHYSM0047 provides the project context supplied by the user. Current unit-level outcomes and assessments have not been verified. This companion addresses selected nuclear-reactor concepts, not the whole nuclear-science curriculum.

## A 35–45 minute session

1. **Orient (5 minutes).** Ask: “Where is the electricity actually made?” Use the calm welcome screen to distinguish making heat, moving heat and making electricity. The energy and neutron investigations start with focused 2D diagrams; students can switch to 3D.
2. **Investigate (20–25 minutes).** Use the five activities in sequence or assign contrasting activities to pairs. Students make their own prediction before touching controls.
3. **Explain and calculate (5–10 minutes, distributed across activities).** Students connect each observation to its equation, inspect the worked example and try one changed case. They then connect a component, a physical process and an observation. Compare explanations in pairs before revealing the app’s explanation.
4. **Transfer (5 minutes).** Use the understanding check and an unfamiliar case: “Can fuel become hotter while fission power falls?”

Avoid equating completing the interface with mastering the physics. The app checks factual multiple-choice responses and whether required observations were attempted. It does not grade the quality of written explanations.

## Investigations

| Activity            | Evidence to inspect                                                | Productive follow-up                                               |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Follow the energy   | Separate primary and secondary paths; condenser heat rejection     | Where does energy leave the system other than as electricity?      |
| Meet the core       | Fuel, water and absorbers; schematic neutron outcomes              | How is slowing a neutron different from removing one?              |
| Change the reaction | Rod insertion, power and temperature traces                        | Why is rod position not a fixed power setting?                     |
| Move the heat       | Reduced circulation, fuel warming and subsequent feedback          | Which changes are direct and which are mediated by temperature?    |
| After shutdown      | Falling fission contribution, remaining decay heat and temperature | Which energy is being generated now, and which was already stored? |

## Differentiation

- Use the component list and 2D diagram for spatial orientation or keyboard access.
- Ask students to explain the direction of change before interpreting numerical magnitudes.
- Open “Explain the physics” for more detail, then inspect `MODEL.md` for the mathematical assumptions.
- For advanced students, critique the lumped model, artificially slowed kinetics and omitted processes.
- Let students submit an annotated graph and their exported learning summary. Progress stays on their device, with no central student record.

## Evidence and feedback

The activity sequence is prediction → observation → explanation → a conceptual check. Guided quantitative activities use one experiment button: the relevant control changes from equilibrium, other settings remain fixed and the response pauses automatically after 20 or 30 model seconds. Before/after readings and intervention markers support comparison. Students write a brief explanation before answering a new transfer situation. Feedback and the reference explanation appear only after an attempt. Written responses autosave without an arbitrary length requirement. Confidence choices support reflection, not grading.

The cumulative check starts with an optional written recall attempt before answer choices appear. Suggest returning the next day to explain a relationship from memory. In free exploration, students can change all controls, compare saved runs and export data. Guided lesson entry starts a fresh baseline; comparison runs belong to free exploration.

The data export includes model time, thermal and decay-heat percentages, fuel and coolant temperatures, and the sampled rod/flow/heat-sink settings. Samples are retained in a rolling buffer of 600 observations; the display uses the latest 300. For long runs, export before earlier samples are discarded.

See [STUDENT-REVIEW.md](STUDENT-REVIEW.md) for the adversarial review, research rationale, implemented changes and proposed student try-out.

## Using the added explanation support

Use the numbered pathway annotations when learners can name components but cannot connect their roles. The steam-generator section separates fluid movement from energy transfer; the neutron pathway distinguishes scattering, capture and fission.

After a quantitative run, compare the before-change, early-response and final-response checkpoints. Ask students to explain a direction before opening the causal explanation. In the circulation activity, use the fuel energy balance to distinguish lower generation from lower transfer to coolant. All power percentages refer to the initial total thermal power.

After a wrong transfer answer, use “Revisit evidence and revise”. Optional hints and the claim/evidence/reasoning scaffold support an improved explanation. The export retains the first draft, latest draft and captured evidence; this is suitable for a discussion of changed reasoning, not automated marking. See [the second review](STUDENT-REVIEW-2.md).

## Lecturer review before class

- Confirm the chosen PWR emphasis and terminology against the current unit materials.
- Verify conceptual explanations, diagrams and circuit boundaries.
- Review the rod-worth curve and the illustrative delayed-neutron and decay-heat parameters.
- Check that the stated experiment outcomes are appropriate to the model and teaching goals.
- Test the 3D cutaway, label legibility, rod positions, focus controls and alternative 2D views on actual devices.
- Check keyboard order, screen-reader experience, 200% zoom and narrow-screen layout.
- Run every investigation from prediction to completion and download both export formats.
- Have representative students attempt the tasks and explain their reasoning aloud.

Those reviews remain to be completed by a lecturer and representative learners; no such sign-off is claimed by the repository.

## Equation practice

The Explain step introduces one relation at a time: efficiency, neutron multiplication, fuel energy balance, single-phase heat transport and an isolated-population half-life law. Learners can navigate between meaning, example and practice, reopen recorded evidence and write a physical explanation. The relation and definitions remain close together; advanced numerical kinetics remain in the model documentation.

Ask “what is held fixed?” before the cooling calculation and “what does the sign mean?” after the fuel balance. Never calculate efficiency by dividing the electrical and thermal indices. The half-life task is a hypothetical population, not a prediction of the simulated shutdown curve. Practice is optional, ungraded and not persisted; completion status does not demonstrate mathematical mastery. The expected 35–45 minute pace is an estimate, not a measured student completion time.

See [the cognitive-load review](REVIEW-COGNITIVE-LOAD.md) for the equation-to-outcome mapping, scientific assumptions and remaining student risks.
