export type PartID =
  | "fuel"
  | "rods"
  | "water"
  | "vessel"
  | "steam"
  | "pressuriser"
  | "pump"
  | "turbine"
  | "condenser"
  | "containment";
export type Part = {
  id: PartID;
  name: string;
  group: string;
  color: string;
  subtitle: string;
  purpose: string;
  why: string;
  connection: string;
  physics: string;
  misconception: string;
};
export const parts: Part[] = [
  {
    id: "fuel",
    name: "Fuel assemblies",
    group: "Reactor core",
    color: "#bc813e",
    subtitle: "Where the energy begins",
    purpose:
      "Ceramic uranium dioxide pellets sit inside sealed metal fuel rods. Bundles of these rods form the fuel assemblies in the core.",
    why: "Fission releases energy, mostly as the motion of fission fragments. Their energy becomes heat in the fuel.",
    connection:
      "Heat crosses the fuel cladding into the surrounding primary water.",
    physics:
      "In this thermal reactor, a neutron can cause a uranium-235 nucleus to fission. The products include fission fragments, energy and further neutrons. The chain reaction depends on how many neutrons cause another fission.",
    misconception:
      "Fuel rods contain the fuel. Control rods have a different job: absorbing neutrons.",
  },
  {
    id: "rods",
    name: "Control rods",
    group: "Reactor core",
    color: "#596b69",
    subtitle: "Control the chain reaction",
    purpose:
      "Neutron-absorbing rods move into or out of the core. Inserting them increases neutron absorption.",
    why: "Changing the neutron balance changes the rate of fission. Full insertion helps bring the chain reaction below a self-sustaining level.",
    connection:
      "Control rods move among the fuel rods. Fuel temperature and water temperature also feed back on the neutron balance.",
    physics:
      "Critical means a self-sustaining chain reaction, not an emergency. Positive reactivity initially increases neutron population; negative reactivity decreases it. Delayed neutrons affect the timescale of the response.",
    misconception:
      "A rod position is not a fixed power setting. The response also depends on temperature and the reactor’s previous state.",
  },
  {
    id: "water",
    name: "Primary water",
    group: "Heat transport",
    color: "#d97843",
    subtitle: "Two jobs, one fluid",
    purpose:
      "Water circulates through the core, carrying away heat. It also acts as the moderator, slowing neutrons through collisions.",
    why: "Slower neutrons are more likely to cause fission in uranium-235 in a thermal reactor. Circulating water also transfers heat out of the fuel.",
    connection:
      "Hot primary water flows to the steam generator and returns cooler. It stays separate from the steam sent to the turbine.",
    physics:
      "Moderation reduces neutron energy by scattering. Absorption takes a neutron into a nucleus; absorption in fuel can lead to fission. In the chosen teaching model, rising fuel and moderator temperatures provide negative reactivity feedback. Actual coefficients depend on operating conditions.",
    misconception:
      "Slowing neutrons does not mean simply slowing the overall chain reaction. Moderation can help sustain fission.",
  },
  {
    id: "vessel",
    name: "Reactor vessel",
    group: "Reactor core",
    color: "#889695",
    subtitle: "A strong boundary around the core",
    purpose:
      "The steel reactor vessel contains the core and the pressurised primary water.",
    why: "It provides a pressure boundary and supports internal structures that guide coolant through the core.",
    connection:
      "The primary pipework connects the vessel to the steam generator, pump and pressuriser.",
    physics:
      "High primary pressure suppresses bulk boiling in normal PWR operation. Water in the core remains predominantly liquid; the pressuriser intentionally contains a steam space. The vessel and containment are distinct barriers.",
    misconception:
      "The cutaway is an explanatory view. A working reactor does not have an open front or removable wall during operation.",
  },
  {
    id: "steam",
    name: "Steam generator",
    group: "Heat transport",
    color: "#4b9b9a",
    subtitle: "Heat crosses. Water stays separate.",
    purpose:
      "Hot primary water passes through tubes. Heat transfers through the tube walls to separate secondary water, which boils.",
    why: "This transfers reactor heat to the power-generation circuit while separating primary coolant from turbine steam.",
    connection:
      "Steam goes to the turbine. Condensed secondary water returns as feedwater. Primary water returns to the reactor.",
    physics:
      "Energy moves down a temperature difference. The secondary water changes phase, taking in latent heat as it becomes steam. The model uses a simplified heat exchanger, not a detailed boiling calculation.",
    misconception: "Primary water does not flow through the turbine in a PWR.",
  },
  {
    id: "pressuriser",
    name: "Pressuriser",
    group: "Heat transport",
    color: "#bd985d",
    subtitle: "Keep hot water liquid",
    purpose:
      "A connected vessel containing water and steam helps regulate the pressure in the primary circuit.",
    why: "A higher pressure raises water’s boiling temperature. Heaters and spray systems are used to control pressure in a real PWR.",
    connection:
      "The pressuriser connects to the primary circuit through a surge line; it is not a pump or a serial step in the coolant loop.",
    physics:
      "At about 0.1 MPa water boils near 100°C; at 15.5 MPa its saturation temperature is approximately 345°C. These rounded reference values explain the principle; pressure is held fixed in the main model.",
    misconception: "High pressure does not itself generate the reactor’s heat.",
  },
  {
    id: "pump",
    name: "Coolant pump",
    group: "Heat transport",
    color: "#658fac",
    subtitle: "Carry heat away from the fuel",
    purpose:
      "The primary pump drives water around the reactor cooling circuit.",
    why: "Circulation transfers heat from fuel to water and from the core to the steam generator.",
    connection:
      "Cooler primary water returns from the steam generator through the pump to the reactor.",
    physics:
      "For a given heat transfer rate, Q̇ = ṁcₚΔT. Reducing mass flow can increase the temperature rise of the coolant. Fuel temperature also depends on heat transfer at its surface.",
    misconception:
      "Pump flow and fission power are different quantities. Changing flow can affect power indirectly through temperature feedback.",
  },
  {
    id: "turbine",
    name: "Turbine & generator",
    group: "Power generation",
    color: "#b48d52",
    subtitle: "From heat to electricity",
    purpose:
      "Steam expands through turbine blades and turns a shaft connected to a generator.",
    why: "The turbine converts part of the steam’s energy to mechanical work; the generator converts mechanical work to electricity.",
    connection:
      "Steam arrives from the steam generator and exhausts to the condenser.",
    physics:
      "A heat engine cannot convert all heat into useful work. Thermal power and electrical power are different. Here electrical output is a relative index with a fixed assumed efficiency, not an absolute MW prediction.",
    misconception:
      "The reactor produces heat. The generator produces electricity.",
  },
  {
    id: "condenser",
    name: "Condenser & cooling",
    group: "Power generation",
    color: "#6b9b9d",
    subtitle: "Close the steam cycle",
    purpose:
      "The condenser transfers heat from exhaust steam to a separate cooling-water circuit. The steam becomes liquid water again.",
    why: "Condensation enables water to return to the steam generator and provides the heat rejection required by the steam cycle.",
    connection:
      "Secondary feedwater returns to the steam generator; external cooling water carries rejected heat away.",
    physics:
      "The secondary circuit and external cooling circuit are distinct. In the model, the heat-sink slider changes a lumped heat-removal factor rather than simulating condenser pressure or turbine efficiency.",
    misconception:
      "The three water circuits exchange heat but are not shown mixing during normal operation.",
  },
  {
    id: "containment",
    name: "Containment",
    group: "Protective barriers",
    color: "#9ba5a2",
    subtitle: "A separate protective enclosure",
    purpose:
      "A containment structure surrounds the reactor and major primary-system equipment.",
    why: "It forms an additional barrier intended to limit release of radioactive material if internal systems fail.",
    connection:
      "The fuel ceramic, fuel cladding, primary boundary and containment contribute different barriers.",
    physics:
      "This transparent envelope shows the idea of containment. The dimensions and arrangement are illustrative and do not represent a specific plant.",
    misconception:
      "Containment is not the same thing as the steel reactor pressure vessel.",
  },
];
export type Lesson = {
  id: string;
  name: string;
  short: string;
  minutes: string;
  question: string;
  choices: string[];
  correct: number;
  task: string;
  focus: PartID;
  view: "plant" | "core" | "fission";
  explanation: string;
  retry: string;
  check: string;
  checkChoices: string[];
  checkCorrect: number;
  feedback: string;
};
export const lessons: Lesson[] = [
  {
    id: "energy",
    name: "Follow the energy",
    short: "From fission to electricity",
    minutes: "4 min",
    question: "Which water reaches the turbine in a PWR?",
    choices: [
      "The water flowing through the reactor core",
      "Steam from a separate secondary circuit",
      "Cooling water from outside the plant",
    ],
    correct: 1,
    task: "Select the fuel, steam generator, turbine and condenser. Use the flow layer to follow the three separate circuits.",
    focus: "fuel",
    view: "plant",
    explanation:
      "The fuel heats primary water. Heat crosses the steam-generator tubes into secondary water, which becomes steam and drives the turbine. A third circuit removes heat at the condenser.",
    retry:
      "Trace the orange primary loop again. Does it cross into the turbine?",
    check:
      "What crosses the steam-generator tube wall during normal operation?",
    checkChoices: ["Primary coolant", "Heat", "Both heat and primary water"],
    checkCorrect: 1,
    feedback:
      "Heat crosses the wall, while primary and secondary water remain separate.",
  },
  {
    id: "neutrons",
    name: "Meet the core",
    short: "Fuel, moderator and absorber",
    minutes: "5 min",
    question: "What is the main purpose of the moderator?",
    choices: [
      "Absorb all neutrons",
      "Slow neutrons so they can more readily cause fission in U-235",
      "Turn heat into electricity",
    ],
    correct: 1,
    task: "Inspect the fuel and control rods, then switch to the fission view. Compare neutron slowing in water with neutron absorption by a control rod.",
    focus: "fuel",
    view: "fission",
    explanation:
      "Fuel undergoes fission. Water slows neutrons through collisions and carries heat away. Control rods absorb neutrons. These are different functions even though they all influence the chain reaction.",
    retry:
      "Compare the labels “slowed” and “absorbed”. Which neutron remains available to cause another fission?",
    check: "What distinguishes absorption from moderation?",
    checkChoices: [
      "Absorption removes a neutron; moderation reduces its energy",
      "They are the same process",
      "Moderation removes heat but never affects neutrons",
    ],
    checkCorrect: 0,
    feedback:
      "A moderated neutron still exists. An absorbed neutron is captured by a nucleus.",
  },
  {
    id: "control",
    name: "Change the reaction",
    short: "Control rods and feedback",
    minutes: "6 min",
    question:
      "Starting from equilibrium, what happens first when control rods are inserted further?",
    choices: [
      "More neutrons are absorbed and fission power begins to fall",
      "The coolant instantly becomes cold",
      "Electrical power immediately rises",
    ],
    correct: 0,
    task: "Use the guided button to increase insertion from 50% to 65%. The response pauses after 20 model seconds. Compare power with fuel temperature.",
    focus: "rods",
    view: "core",
    explanation:
      "More absorption initially reduces neutron population and fission power. Temperature responds more slowly because the fuel and coolant store thermal energy. Temperature feedback also changes the subsequent power response.",
    retry:
      "Reset and repeat with a smaller change. Compare the first few seconds of power with the temperature trend.",
    check: "Why does temperature lag behind fission power?",
    checkChoices: [
      "Temperature measures instantaneous fission power",
      "Fuel and water store heat and cool over time",
      "The rods only change temperature directly",
    ],
    checkCorrect: 1,
    feedback:
      "A change in heat generation changes the energy balance; temperature evolves as stored energy changes.",
  },
  {
    id: "cooling",
    name: "Move the heat",
    short: "Flow and temperature",
    minutes: "6 min",
    question:
      "If circulation is reduced from equilibrium, what is the initial effect on fuel temperature?",
    choices: [
      "It tends to rise as heat is removed less effectively",
      "It must immediately fall",
      "It is completely independent of circulation",
    ],
    correct: 0,
    task: "Use the guided button to reduce circulation to 65%. Compare the captured temperature and thermal-output changes after 20 model seconds.",
    focus: "pump",
    view: "plant",
    explanation:
      "Reduced circulation initially impairs heat removal, so fuel warms. In this model, rising temperature then gives negative reactivity feedback and reduces fission power. A hotter core does not necessarily mean greater power.",
    retry:
      "Look at fuel temperature and thermal power on separate graph tabs. Explain why their directions can differ.",
    check: "Can fuel temperature rise while fission power falls?",
    checkChoices: [
      "No, temperature and power are identical",
      "Yes, if heat removal falls and temperature feedback reduces fission",
      "Only if heat removal stays constant",
    ],
    checkCorrect: 1,
    feedback:
      "Temperature depends on heat entering and leaving a material, not just the instantaneous fission rate.",
  },
  {
    id: "shutdown",
    name: "After shutdown",
    short: "The heat that remains",
    minutes: "5 min",
    question:
      "After the chain reaction has been suppressed, is cooling still needed?",
    choices: [
      "No; all heat generation stops instantly",
      "Yes; decay heat and stored thermal energy remain",
      "Only while the turbine rotates",
    ],
    correct: 1,
    task: "Reset, then press “Insert all rods”. Leave circulation running. Observe the power and decay-heat traces for at least 30 model seconds.",
    focus: "rods",
    view: "core",
    explanation:
      "Inserting rods suppresses the chain reaction. Radioactive decay of fission products continues to produce heat, and the fuel and water also retain thermal energy. Shutdown and cooling are separate functions.",
    retry:
      "On the power graph, compare total thermal power with the decay-heat line after rod insertion.",
    check: "Which explanation best accounts for heat after shutdown?",
    checkChoices: [
      "All remaining heat is stored; new heat generation has stopped",
      "Radioactive decay continues, and materials retain stored heat",
      "Continued heat always means a sustained fission chain reaction",
    ],
    checkCorrect: 1,
    feedback:
      "Decay heat is ongoing generation. Stored heat is energy already present. Both matter after shutdown.",
  },
];
export const sources = [
  {
    name: "US Department of Energy — How does a nuclear reactor work?",
    url: "https://www.energy.gov/ne/articles/nuclear-101-how-does-nuclear-reactor-work",
  },
  {
    name: "US NRC — Pressurised-water reactors",
    url: "https://www.nrc.gov/reactors/power/pwrs",
  },
  {
    name: "US NRC — Spent fuel and decay heat",
    url: "https://www.nrc.gov/facilities-safety/storage-of-spent-nuclear-fuel/spent-fuel-storage-in-pools-and-dry-casks-key-points-and-questions-answers",
  },
  {
    name: "EDF — Graphite moderator and control rods in AGRs",
    url: "https://www.edfenergy.com/about/nuclear/graphite-core",
  },
  {
    name: "IAPWS — Water and steam property formulations",
    url: "https://iapws.org/relguide/IF97-Rev.html",
  },
];
