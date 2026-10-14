import type { PartID } from "./content";
import type { Sample } from "./simulation";
export type Annotation = {
  part: PartID;
  title: string;
  notice: string;
  mechanism: string;
  distinction: string;
  source: string;
};
const pwr =
  "https://www.energy.gov/ne/articles/nuclear-101-how-does-nuclear-reactor-work";
const neutrons =
  "https://www.nrc.gov/sites/default/files/doc_library/cdn/legacy/reading-rm/basic-ref/students/for-educators/02.pdf";
export const tours: Record<string, Annotation[]> = {
  energy: [
    {
      part: "fuel",
      title: "1 · Energy starts in the fuel",
      notice: "The sealed fuel rods sit inside the primary water.",
      mechanism:
        "Fission fragments deposit energy in the fuel. Energy then passes through the metal cladding into the surrounding water.",
      distinction: "Fuel rods hold fuel. Control rods absorb neutrons.",
      source: pwr,
    },
    {
      part: "steam",
      title: "2 · Heat crosses a solid boundary",
      notice:
        "Trace primary water through the tubes, and secondary water outside them.",
      mechanism:
        "A temperature difference transfers energy through the tube wall. Secondary water boils at its lower pressure; primary water returns to the reactor.",
      distinction:
        "The two fluids exchange energy without joining into one circuit.",
      source: pwr,
    },
    {
      part: "turbine",
      title: "3 · Steam produces work",
      notice: "The turbine and generator share a rotating shaft.",
      mechanism:
        "Expanding steam turns the turbine. The generator converts shaft work into electrical energy.",
      distinction:
        "The reactor makes heat; the generator makes electricity. Some heat must be rejected.",
      source: pwr,
    },
    {
      part: "condenser",
      title: "4 · Return the water; reject heat",
      notice:
        "Secondary steam meets a cooled surface, not the external cooling water itself.",
      mechanism:
        "Steam condenses to liquid and is pumped back to the steam generator. A separate cooling circuit carries heat to the environment.",
      distinction:
        "Primary, secondary and external cooling water have different routes.",
      source: "https://www.nrc.gov/reactors/power/pwrs",
    },
  ],
  neutrons: [
    {
      part: "fuel",
      title: "1 · Fission creates new neutrons",
      notice: "A U-235 nucleus absorbs a neutron and can split.",
      mechanism:
        "The split releases fragments and new neutrons. Some neutrons can go on to cause another fission.",
      distinction:
        "Not every neutron causes fission: some are captured without fission or escape the core.",
      source: neutrons,
    },
    {
      part: "water",
      title: "2 · Collisions reduce neutron energy",
      notice: "Follow the neutron that remains after a collision in water.",
      mechanism:
        "Collisions, especially with hydrogen nuclei, reduce neutron kinetic energy. Slower neutrons can more readily induce U-235 fission in this thermal reactor.",
      distinction:
        "Water both cools and moderates. It also absorbs some neutrons; the diagram isolates moderation for clarity.",
      source: neutrons,
    },
    {
      part: "rods",
      title: "3 · Capture reduces the chain",
      notice: "The path into a control rod ends without another fission.",
      mechanism:
        "Absorber materials capture neutrons without producing the further fissions needed to sustain the chain.",
      distinction:
        "Absorption is broader than capture in a control rod: absorption in fuel can lead to fission. These PWR rods are absorbers, not graphite moderators.",
      source: neutrons,
    },
  ],
};
export const explanationSupport: Record<
  string,
  { hint: string; checks: string[]; deeper: string }
> = {
  energy: {
    hint: "Trace one parcel of primary water, then trace energy. Do they take the same route?",
    checks: [
      "Name where energy is released.",
      "Explain what crosses the steam-generator wall.",
      "Connect the turbine to the generator and condenser.",
    ],
    deeper:
      "Heat flows because temperatures differ. In the steam generator, energy crosses a metal wall; mass stays in its own circuit. Condensing the exhaust also removes energy, so electrical output is only part of the energy transferred.",
  },
  neutrons: {
    hint: "Ask what happens to the neutron: is it still moving, absorbed without fission, or replaced by neutrons from a new fission?",
    checks: [
      "Distinguish fission, moderation and capture.",
      "Explain why slowing can help sustain this chain reaction.",
      "Avoid treating drawn particles as a neutron count.",
    ],
    deeper:
      "Neutron interactions depend on energy and material. Moderation is scattering that lowers neutron energy. Absorption in a fuel nucleus may cause fission; absorption in a control rod is used to reduce the neutrons available to sustain the chain. A small delayed-neutron fraction helps govern the real response timescale.",
  },
  control: {
    hint: "Compare the early power change with the early temperature change. Which quantity is a rate, and which reflects stored energy?",
    checks: [
      "Link insertion to neutron absorption and fission.",
      "Cite an early and a later reading.",
      "Explain why temperature cannot jump to a new equilibrium.",
    ],
    deeper:
      "The fuel energy balance is generation minus transfer to coolant. Lower fission power first changes that balance; the stored thermal energy then changes over time. Temperature feedback modifies subsequent neutron balance, so rod position alone does not set one unique power.",
  },
  cooling: {
    hint: "Compare energy generated in the fuel with energy transferred out of it. A lower generation rate can still exceed removal.",
    checks: [
      "Name the circulation change.",
      "Compare temperature and fission-power readings.",
      "Explain the initial heat-removal effect before the temperature feedback.",
    ],
    deeper:
      "Reduced circulation lowers heat transfer at the starting temperatures in this model. Energy initially accumulates in the fuel. Rising fuel and coolant temperatures then introduce negative reactivity feedback here. The signs and strengths of real feedback coefficients depend on reactor design and conditions.",
  },
  shutdown: {
    hint: "Separate energy being generated now from energy already stored in hot material.",
    checks: [
      "Explain how rods suppress the fission chain.",
      "Identify continuing decay heat.",
      "Explain why hot fuel still transfers stored energy to coolant.",
    ],
    deeper:
      "Decay heat is continuing energy release from radioactive products; stored thermal energy is already in the materials. Both affect cooling after shutdown. The illustrative decay inventories and slowed model seconds are not a real plant cooldown prediction.",
  },
};
// Order matches the transfer choices in learning.ts. Feedback diagnoses the selected misconception.
export const misconceptionFeedback: Record<string, string[]> = {
  energy: [
    "You have joined the primary and secondary water paths. Trace each side of the solid tube wall separately.",
    "You have separated energy transfer from fluid movement.",
    "Rod position changes neutron balance; it does not open a path between the water circuits.",
  ],
  neutrons: [
    "You have distinguished slowing a neutron from removing it.",
    "Scattering does not trap the neutron in water. The neutron emerges with less energy and can interact again.",
    "You are treating slowing as removal. A slower neutron can still take part in a later fission.",
  ],
  control: [
    "You are equating a rate with a temperature. Equal current power does not erase different amounts of stored energy.",
    "Inserting rods changes generation; it does not instantly remove energy already stored in the fuel.",
    "You have accounted for stored energy and the previous cooling history.",
  ],
  cooling: [
    "You have considered both generation and removal.",
    "Temperature is not a direct fission-rate meter. Compare generation with transfer out of the fuel.",
    "Hotter describes the present temperature; producing heat faster describes a rate. Reduced removal can make fuel hotter even as generation falls.",
  ],
  shutdown: [
    "Hot fuel alone is not evidence of a sustained fission chain. Check fission power separately from decay heat and temperature.",
    "Suppressing the chain does not remove radioactive decay or stored energy. Heat can still leave the core.",
    "You have separated shutting down the chain from cooling the fuel.",
  ],
};
export function checkpoints(
  samples: Sample[],
): { label: string; sample: Sample }[] {
  if (!samples.length) return [];
  const early = samples.find((s) => s.time >= 2) ?? samples.at(-1)!;
  return [
    { label: "Before change", sample: samples[0] },
    { label: "Early response", sample: early },
    { label: "Final response", sample: samples.at(-1)! },
  ];
}
/** The recorded moment fuel temperature peaked, if it rose and then turned back. */
export function temperaturePeak(samples: Sample[]): Sample | undefined {
  if (samples.length < 3) return undefined;
  const peak = samples.reduce((a, b) => (b.fuel > a.fuel ? b : a));
  return peak !== samples[0] && peak !== samples.at(-1) ? peak : undefined;
}
export function describeBalance(s: Sample) {
  if (Math.abs(s.netFuel) < 0.05)
    return "Generation and transfer to coolant are nearly balanced; fuel temperature is changing very little at this instant.";
  return s.netFuel > 0
    ? "Generation exceeds transfer to coolant: energy accumulates in the fuel, so its temperature is rising at this instant."
    : "Transfer to coolant exceeds generation: stored energy leaves the fuel, so its temperature is falling at this instant.";
}
