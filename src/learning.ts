import {
  defaults,
  initialState,
  step,
  type State,
  type Controls,
} from "./simulation";
import type { PartID } from "./content";
export type LearningDesign = {
  goal: string;
  watch: string;
  terms: [string, string][];
  focus: PartID[];
  duration: number;
  action?: string;
  setting?: Partial<Controls>;
  metric: "power" | "temperature";
  starter: string;
  transfer: string;
  transferChoices: string[];
  transferCorrect: number;
  transferFeedback: string;
};
export const learning: Record<string, LearningDesign> = {
  energy: {
    goal: "Trace the path from reactor heat to electricity.",
    watch:
      "Follow the fuel → steam generator → turbine → condenser. At the steam generator, look for heat crossing between two separate circuits.",
    terms: [
      ["Primary circuit", "Water that passes through the reactor core."],
      [
        "Secondary circuit",
        "Water and steam that carry energy to the turbine.",
      ],
    ],
    focus: ["fuel", "steam", "turbine", "condenser"],
    duration: 0,
    metric: "power",
    starter: "Heat starts in… It crosses… The fluids…",
    transfer:
      "A tracer is added to primary water. In normal operation, should it reach the turbine?",
    transferChoices: [
      "Yes, because all the water follows one loop",
      "No, the steam-generator wall separates the circuits",
      "Only when the control rods are raised",
    ],
    transferCorrect: 1,
    transferFeedback:
      "Heat can cross the steam-generator wall without primary water crossing it.",
  },
  neutrons: {
    goal: "Distinguish making neutrons, slowing them and absorbing them.",
    watch:
      "Compare the fuel, water and control rod. Follow one neutron at a time; the animation is a schematic, not a count of real particles.",
    terms: [
      ["Fission", "Splitting a nucleus, releasing energy and neutrons."],
      ["Moderation", "Reducing a neutron’s energy through collisions."],
      ["Absorption", "Capturing a neutron so it is removed from the chain."],
    ],
    focus: ["fuel", "water", "rods"],
    duration: 0,
    metric: "power",
    starter: "The fuel… Water changes… A control rod…",
    transfer:
      "A neutron slows down in water but is not captured. What can still happen?",
    transferChoices: [
      "It can still cause a later fission",
      "It must be absorbed before it can cause fission",
      "It can no longer participate in the chain reaction",
    ],
    transferCorrect: 0,
    transferFeedback:
      "Moderation changes neutron energy. It does not itself remove the neutron.",
  },
  control: {
    goal: "Compare how power and temperature respond to rod insertion.",
    watch:
      "Watch thermal output first, then fuel temperature. Do both change immediately by the same amount?",
    terms: [
      ["Power", "The rate at which energy is produced or transferred."],
      [
        "Temperature",
        "How hot a material is; it also depends on stored energy.",
      ],
    ],
    focus: ["rods", "fuel"],
    duration: 20,
    action: "Insert rods to 65%",
    setting: { rods: 65 },
    metric: "power",
    starter: "When rod insertion increased, power… Fuel temperature… because…",
    transfer:
      "Two cores now have the same fission power, but one was hotter a moment ago. Must their temperatures be equal?",
    transferChoices: [
      "Yes; equal power always means equal temperature",
      "Yes; lower fission power immediately removes stored energy",
      "No; stored energy and cooling history also matter",
    ],
    transferCorrect: 2,
    transferFeedback:
      "Power describes a rate. Temperature also reflects previously stored energy and heat removal.",
  },
  cooling: {
    goal: "Explain how heat generation and heat removal affect fuel temperature.",
    watch:
      "Watch fuel temperature, then compare the thermal-output reading. Look for different directions of change.",
    terms: [
      [
        "Circulation",
        "The rate at which coolant moves around the primary loop.",
      ],
      [
        "Feedback",
        "A change in temperature that then affects neutron balance.",
      ],
    ],
    focus: ["pump", "water", "fuel"],
    duration: 20,
    action: "Reduce circulation to 65%",
    setting: { flow: 65 },
    metric: "temperature",
    starter:
      "With less circulation, the fuel… Even though thermal output… This is because…",
    transfer:
      "A fuel-temperature reading rises. Is that enough evidence to conclude that fission power increased?",
    transferChoices: [
      "No; heat removal may have decreased",
      "Yes; temperature measures fission power directly",
      "Yes; hotter fuel must be producing heat faster",
    ],
    transferCorrect: 0,
    transferFeedback:
      "You need evidence about both heat generation and heat removal to explain the temperature change.",
  },
  shutdown: {
    goal: "Explain what changes and what remains after rod insertion.",
    watch:
      "After rod insertion, compare total thermal output with the dashed decay-heat line. Then look at fuel temperature.",
    terms: [
      ["Decay heat", "New heat released by radioactive decay after fission."],
      [
        "Stored heat",
        "Thermal energy already present in fuel and other materials.",
      ],
    ],
    focus: ["rods", "fuel", "water"],
    duration: 30,
    action: "Insert all rods",
    setting: { rods: 100 },
    metric: "power",
    starter: "After the rods entered, fission… Heat remained because… Cooling…",
    transfer:
      "The neutron population is now very small, but the fuel is still hot. Which claim follows?",
    transferChoices: [
      "The shutdown must have failed",
      "No more energy can leave the core",
      "Cooling can still be needed after successful shutdown",
    ],
    transferCorrect: 2,
    transferFeedback:
      "Low fission activity does not eliminate decay heat or the thermal energy already stored in the fuel.",
  },
};
export function guidedControls(id: string): Controls {
  return { ...defaults, ...learning[id].setting };
}
export function guidedEvidence(s: State) {
  const before = initialState();
  return [
    {
      label: "Thermal output",
      before: before.thermal * 100,
      now: s.thermal * 100,
      unit: "%",
      deltaUnit: "percentage points",
    },
    {
      label: "Fuel temperature",
      before: before.fuel,
      now: s.fuel,
      unit: "°C",
      deltaUnit: "°C",
    },
    {
      label: "Decay heat",
      before: before.decay.reduce((a, b) => a + b, 0) * 100,
      now: s.decay.reduce((a, b) => a + b, 0) * 100,
      unit: "%",
      deltaUnit: "percentage points",
    },
  ];
}

export function advanceGuided(state: State, id: string, dt: number): State {
  return step(
    state,
    guidedControls(id),
    Math.max(0, Math.min(dt, learning[id].duration - state.time)),
  );
}
