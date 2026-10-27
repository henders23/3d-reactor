import type { PartID } from "./content";
const descriptions = {
  fuel: "A neutron is absorbed by a fissile nucleus, which can split. Fission fragments carry much of the released energy; new neutrons may continue the chain.",
  water:
    "A neutron collides with a light nucleus and transfers some kinetic energy to it. The scattered neutron remains available for later interactions. Water also absorbs some neutrons.",
  rods: "A nucleus in the rod captures a neutron without the further fission needed for the chain. The neutron is removed from that chain.",
};
export function NeutronFigure({
  interaction,
}: {
  interaction: "fuel" | "water" | "rods";
}) {
  return (
    <svg
      viewBox="0 0 420 200"
      role="img"
      aria-label={descriptions[interaction]}
    >
      <defs>
        <marker
          id="neutron-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10Z" fill="#ffbc59" />
        </marker>
      </defs>
      <g
        fill="none"
        stroke="#ffbc59"
        strokeWidth="3"
        markerEnd="url(#neutron-arrow)"
      >
        <path d="M25 95H160" />
        {interaction === "fuel" && (
          <>
            <path d="M235 80L365 48" />
            <path d="M235 115L365 150" />
          </>
        )}
        {interaction === "water" && <path d="M203 116L345 157" />}
      </g>
      <circle cx="75" cy="95" r="7" fill="#ffbc59" />
      {interaction === "fuel" ? (
        <>
          <circle cx="200" cy="73" r="25" fill="#ffb23e" />
          <circle cx="200" cy="124" r="19" fill="#98b1ac" />
          <circle cx="320" cy="59" r="7" fill="#ffbc59" />
          <circle cx="320" cy="138" r="7" fill="#ffbc59" />
          <text x="202" y="182" textAnchor="middle">
            Fission fragments
          </text>
          <text x="295" y="25">
            New neutrons
          </text>
        </>
      ) : interaction === "water" ? (
        <>
          <circle
            cx="200"
            cy="89"
            r="30"
            fill="#243f3c"
            stroke="#5bd1f2"
            strokeWidth="2"
          />
          <circle cx="302" cy="145" r="7" fill="#ffbc59" />
          <text x="190" y="40" textAnchor="middle">
            Light nucleus
          </text>
          <text x="275" y="187" textAnchor="middle">
            Same neutron, less energy
          </text>
        </>
      ) : (
        <>
          <rect x="167" y="55" width="64" height="95" rx="10" fill="#c4d3d0" />
          <path
            d="M182 80L216 114 M182 114L216 80"
            stroke="white"
            strokeWidth="3"
          />
          <text x="198" y="180" textAnchor="middle">
            Absorber nucleus
          </text>
          <text x="255" y="90">
            No outgoing
          </text>
          <text x="255" y="116">
            chain neutron
          </text>
        </>
      )}
      <text x="20" y="65">
        Incoming
      </text>
      <text x="20" y="135">
        neutron
      </text>
    </svg>
  );
}
export default function FissionDiagram({
  selected,
  onSelect,
}: {
  selected: PartID;
  onSelect: (id: PartID) => void;
}) {
  const interaction =
    selected === "water" || selected === "rods" ? selected : "fuel";
  return (
    <div className="fission-diagram">
      <div
        className="neutron-selector"
        role="group"
        aria-label="Three neutron interactions"
      >
        {(
          [
            ["fuel", "Fuel · fission"],
            ["water", "Water · moderation"],
            ["rods", "Control rod · capture"],
          ] as const
        ).map(([id, title]) => (
          <button
            key={id}
            aria-pressed={interaction === id}
            onClick={() => onSelect(id)}
          >
            {title}
          </button>
        ))}
      </div>
      <figure className="neutron-focus">
        <NeutronFigure interaction={interaction} />
        <figcaption>{descriptions[interaction]}</figcaption>
      </figure>
      <p>
        Small dots = neutrons; arrows show direction, not speed. These are
        alternative interactions, not a sequence or measured proportions.
        Neutrons can also escape or be captured in other materials. Particle
        sizes and numbers are illustrative.
      </p>
    </div>
  );
}
