import type { PartID } from "./content";
export default function FissionDiagram({
  selected,
  onSelect,
}: {
  selected: PartID;
  onSelect: (id: PartID) => void;
}) {
  return (
    <div className="fission-diagram">
      <div
        className="neutron-outcomes"
        role="group"
        aria-label="Three neutron interactions"
      >
        <button
          aria-pressed={selected === "fuel"}
          onClick={() => onSelect("fuel")}
        >
          <svg viewBox="0 0 200 80" aria-hidden="true">
            <path
              d="M8 40H67 M116 40L187 17 M116 40L187 63"
              stroke="#a37b3b"
              strokeWidth="3"
            />
            <circle cx="40" cy="40" r="5" fill="#876126" />
            <circle cx="98" cy="27" r="16" fill="#c7a169" />
            <circle cx="98" cy="55" r="12" fill="#92a487" />
            <circle cx="165" cy="24" r="5" fill="#876126" />
            <circle cx="165" cy="55" r="5" fill="#876126" />
          </svg>
          <strong>Fuel · fission</strong>
          <span>
            Neutron absorbed → nucleus can split → new neutrons and energy.
          </span>
        </button>
        <button
          aria-pressed={selected === "water"}
          onClick={() => onSelect("water")}
        >
          <svg viewBox="0 0 200 80" aria-hidden="true">
            <circle cx="90" cy="35" r="20" fill="#b1d2cf" />
            <path
              d="M8 40H68 L105 65H185"
              fill="none"
              stroke="#287575"
              strokeWidth="3"
            />
            <circle cx="35" cy="40" r="5" fill="#876126" />
            <circle cx="150" cy="65" r="5" fill="#876126" />
          </svg>
          <strong>Water · moderation</strong>
          <span>
            Collision → less neutron kinetic energy. The neutron remains.
          </span>
        </button>
        <button
          aria-pressed={selected === "rods"}
          onClick={() => onSelect("rods")}
        >
          <svg viewBox="0 0 200 80" aria-hidden="true">
            <rect x="114" y="10" width="28" height="60" rx="6" fill="#4a6256" />
            <path d="M8 40H114" stroke="#a37b3b" strokeWidth="3" />
            <circle cx="65" cy="40" r="5" fill="#876126" />
            <path
              d="M119 33L137 47 M119 47L137 33"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          <strong>Control rod · capture</strong>
          <span>
            Neutron absorbed without the further fission needed to sustain the
            chain.
          </span>
        </button>
      </div>
      <p>
        These are selected interactions, not a fixed sequence or measured
        proportions. Neutrons can also escape or be captured in other materials.
        Select an interaction for its explanation.
      </p>
    </div>
  );
}
