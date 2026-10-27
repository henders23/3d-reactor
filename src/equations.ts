export type EquationID =
  "energy" | "neutrons" | "control" | "cooling" | "shutdown";
export type EquationDesign = {
  title: string;
  words: string;
  symbols: [string, string][];
  observation: string;
  assumption: string;
  given: string;
  substitution: string;
  interpretation: string;
  question: string;
  unit: string;
  answer: number;
  tolerance: number;
  hint: string;
  success: string;
  reflect: string;
  source: string;
};
const thermo = "https://www.energy.gov/documents/doe-hdbk-1012-92vol1";
const reactor = "https://www.energy.gov/documents/doe-hdbk-1019-93vol2";
export const equations: Record<EquationID, EquationDesign> = {
  energy: {
    title: "How much heat becomes electricity?",
    words: "Efficiency is electrical power out divided by thermal power in.",
    symbols: [
      [
        "η (eta)",
        "Efficiency: a fraction with no units; multiply by 100 for %.",
      ],
      ["Pₑ", "Net electrical power delivered, in MW."],
      ["Pₜₕ", "Thermal power supplied, in the same units (MW)."],
    ],
    observation:
      "The turbine extracts work; the condenser rejects heat. Energy is conserved even when only part becomes electricity.",
    assumption:
      "Compare powers over the same steady operating period. These are illustrative MW values. The live electrical and thermal percentages have different reference values: their ratio is NOT efficiency.",
    given:
      "A hypothetical plant receives 3,000 MW of thermal power and delivers 1,000 MW of net electrical power.",
    substitution: "η = 1,000 MW / 3,000 MW = 0.333… = 33.3%",
    interpretation:
      "About one third becomes electricity; the remainder leaves as rejected heat and other losses. It has not disappeared.",
    question:
      "With the same 3,000 MW thermal input, net electrical output is 900 MW. What is the efficiency, as a percentage?",
    unit: "%",
    answer: 30,
    tolerance: 0.05,
    hint: "Divide electrical output by thermal input, then multiply by 100. The MW units cancel.",
    success:
      "30%. The remaining 70% is not net electrical output; at steady state it leaves through heat rejection and other losses.",
    reflect:
      "In your explanation, name the component that rejects heat and explain why 100% thermal power does not mean 100% conversion to electricity.",
    source: thermo,
  },
  neutrons: {
    title: "Will the chain sustain itself?",
    words: "Compare the neutrons born in successive fission generations.",
    symbols: [
      ["kₑff", "Effective multiplication factor; a ratio with no units."],
      ["Nɡ", "Neutrons born in fission generation g."],
      [
        "Nɡ₊₁",
        "Neutrons born in the next generation, after absorption and leakage affect the chain.",
      ],
    ],
    observation:
      "Fission supplies new neutrons; capture and leakage remove neutrons. Moderation changes neutron energy and therefore the chances of later interactions.",
    assumption:
      "This generation picture assumes fixed conditions and a settled neutron distribution, with no external source. It is not a ratio of animated dots or a prediction of how fast power changes. Delayed neutrons matter to the timing.",
    given: "1,000 neutrons in one fission generation lead to 980 in the next.",
    substitution: "kₑff = 980 / 1,000 = 0.98",
    interpretation:
      "Below 1: the chain shrinks. At 1 it is critical (self-sustaining); above 1 it grows under these fixed conditions. “Critical” does not mean an accident.",
    question:
      "A generation of 1,000 instead leads to 1,020 neutrons. Calculate kₑff.",
    unit: "no units",
    answer: 1.02,
    tolerance: 0.0005,
    hint: "Put the next generation on top: 1,020 / 1,000. Do not convert this ratio to a percentage.",
    success:
      "1.02, above 1: growth under the assumed fixed conditions. This number alone does not give the response time.",
    reflect:
      "Explain how a neutron can slow down without being removed, and how capture changes the population available for later fission.",
    source: reactor,
  },
  control: {
    title: "Why does temperature lag behind power?",
    words:
      "Fuel warms when heat generation exceeds transfer to coolant; it cools when transfer is larger.",
    symbols: [
      ["C𝒇", "Total fuel heat capacity, J/K (not specific heat per kilogram)."],
      ["dT𝒇/dt", "Rate of fuel temperature change, K/s."],
      ["P𝒇 + P𝒅", "Fission power plus decay heat, W."],
      [
        "Q̇𝒇→𝒄",
        "Heat transferred from fuel to coolant per second, W. The dot means a rate.",
      ],
    ],
    observation:
      "Rods change neutron absorption and fission power. Fuel temperature responds to the net rate at which energy accumulates, so a power drop does not make temperature jump.",
    assumption:
      "Treat the fuel as one temperature with constant heat capacity. MW and MJ/K cancel to K/s in this example. The app uses normalised powers and deliberately slowed model time, not these dimensional constants.",
    given:
      "Total heat generation is 120 MW, transfer to coolant is 100 MW and fuel heat capacity is 20 MJ/K.",
    substitution: "dT𝒇/dt = (120 − 100) MW / (20 MJ/K) = +1 K/s",
    interpretation:
      "The fuel warms by 1 kelvin per second at this instant. A temperature change of 1 K equals a change of 1°C; it is not the temperature itself.",
    question:
      "Now generation is 80 MW, transfer is 100 MW and heat capacity is still 20 MJ/K. What is dT𝒇/dt? Include the sign.",
    unit: "K/s",
    answer: -1,
    tolerance: 0.005,
    hint: "Subtract transfer from generation before dividing by heat capacity. Cooling gives a negative rate.",
    success:
      "−1 K/s. Transfer exceeds generation, so stored energy and fuel temperature fall, even though the fuel still generates heat.",
    reflect:
      "Use the sign of generation minus transfer to explain the recorded temperature trend, rather than saying temperature is proportional to power.",
    source: thermo,
  },
  cooling: {
    title: "How does flowing water carry heat?",
    words:
      "Heat carried per second equals mass flow per second × specific heat × the water’s temperature rise.",
    symbols: [
      ["Q̇", "Rate of heat gained by the flowing water, W."],
      ["ṁ", "Mass flow rate, kg/s (not a speed in m/s)."],
      ["cₚ", "Specific heat capacity at constant pressure, J/(kg·K)."],
      [
        "Tₒᵤₜ − Tᵢₙ",
        "Outlet minus inlet water temperature, K or °C difference.",
      ],
    ],
    observation:
      "If the same heat must be carried with less mass flow, each kilogram needs a greater temperature rise. During a transient, heat transfer and temperatures also change.",
    assumption:
      "Steady, single-phase flow with constant cₚ; neglect work and kinetic/potential energy changes. Use enthalpy change, ṁ(hₒᵤₜ − hᵢₙ), when boiling matters. The app shows an average coolant temperature, not inlet/outlet measurements.",
    given:
      "Illustrative water flow: 100 kg/s, cₚ = 4,200 J/(kg·K), temperature rise = 20 K. This constant cₚ is not a value calibrated to the PWR.",
    substitution: "Q̇ = 100 × 4,200 × 20 W = 8,400,000 W = 8.4 MW",
    interpretation:
      "For a fixed 20 K rise, halving mass flow halves the heat carried. For a fixed heat load instead, halving flow doubles the required rise. Say what you hold fixed.",
    question:
      "At 50 kg/s, keeping cₚ = 4,200 J/(kg·K) and the rise = 20 K fixed, how much heat is carried per second, in MW?",
    unit: "MW",
    answer: 4.2,
    tolerance: 0.005,
    hint: "Multiply 50 × 4,200 × 20 to get watts. Divide by 1,000,000 for MW. Here the temperature rise is fixed, not the heat load.",
    success:
      "4.2 MW. Less heat is carried at the specified fixed temperature rise; this is not a claim that every live run must settle at half power.",
    reflect:
      "Explain why reducing circulation can initially warm the fuel even while negative temperature feedback reduces fission power.",
    source: thermo,
  },
  shutdown: {
    title: "Why does decay heat persist?",
    words:
      "For one isolated radioactive population, decay power halves each half-life.",
    symbols: [
      ["P𝒅(t)", "Decay power at time t, e.g. MW."],
      ["P𝒅,₀", "Initial decay power, in the same units."],
      ["t", "Elapsed time, s."],
      ["T½", "Half-life, in the same time units as t."],
    ],
    observation:
      "Total heat generation is fission power plus decay heat. Rods suppress the chain reaction; radioactive products still release energy. Stored thermal energy is a separate reason cooling takes time.",
    assumption:
      "One isolated population, no new production or daughter feeding, and constant deposited energy per decay. Real fuel contains many nuclides. The app uses three illustrative decay inventories with production; this single half-life example is not its shutdown curve.",
    given:
      "A hypothetical isolated population initially produces 8 MW and has a half-life of 20 s. Find its decay power after 40 s.",
    substitution: "P𝒅(40 s) = 8 MW × 2^(−40/20) = 8 / 4 MW = 2 MW",
    interpretation:
      "Two half-lives leave one quarter of the initial power, not zero. A half-life is not a time until all nuclei have decayed.",
    question: "For the same population, what is the decay power after 60 s?",
    unit: "MW",
    answer: 1,
    tolerance: 0.005,
    hint: "60 / 20 = 3 half-lives. Start at 8 MW and halve it three times.",
    success:
      "1 MW. Three half-lives leave one eighth; heat is still being generated. Cooling must remove both ongoing heat generation and stored energy.",
    reflect:
      "Distinguish ongoing decay heat from energy already stored in hot fuel. Explain why stopping most fission does not remove either immediately.",
    source:
      "https://www.energy.gov/sites/default/files/2026-04/DOE-HDBK-1019-93_VOL1.pdf",
  },
};
export function checkEquation(
  id: EquationID,
  input: string,
): "empty" | "invalid" | "correct" | "retry" {
  if (!input.trim()) return "empty";
  // Accept ordinary decimal/scientific notation, including a typographic minus.
  const normalised = input.trim().replace(/−/g, "-");
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalised))
    return "invalid";
  const n = Number(normalised),
    e = equations[id];
  if (!Number.isFinite(n)) return "invalid";
  return Math.abs(n - e.answer) <= e.tolerance ? "correct" : "retry";
}
