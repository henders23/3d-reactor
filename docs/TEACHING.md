# Teaching with CORE

## Intended learning outcomes

After the investigations, a student should be able to identify major PWR components and explain their purposes; trace energy across the separate circuits; distinguish fission, moderation and absorption; explain power/temperature lag; reason about heat generation versus heat removal; and distinguish decay heat from stored heat after shutdown.

PHYSM0047 provides the project context supplied by the user. Current unit-level outcomes and assessments have not been verified. This companion addresses selected nuclear-reactor concepts, not the whole nuclear-science curriculum.

## A 35–45 minute session

1. **Orient (5 minutes).** Ask: “Where is the electricity actually made?” Use the calm welcome screen to distinguish making heat, moving heat and making electricity. The essentials route starts with a 2D circuit diagram; students can switch to 3D.
2. **Investigate (20–30 minutes).** Use the five activities in sequence or assign contrasting activities to pairs. Students make their own prediction before touching controls.
3. **Explain (5 minutes).** Students connect a component, a physical process and an observation. Compare explanations in pairs before revealing the app’s explanation.
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
