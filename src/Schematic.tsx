import type { PartID } from "./content";
import type { State, Controls } from "./simulation";
export default function Schematic({
  selected,
  onSelect,
  state,
  controls,
}: {
  selected: PartID;
  onSelect: (id: PartID) => void;
  state: State;
  controls: Controls;
}) {
  const part = (id: PartID) => ({
    className: `diagram-part ${selected === id ? "chosen" : ""}`,
    onClick: () => onSelect(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(id);
      }
    },
    tabIndex: 0,
    role: "button",
    "aria-label": `Inspect ${id === "steam" ? "steam generator" : id}`,
  });
  return (
    <div className="schematic">
      <svg
        viewBox="0 0 800 440"
        role="group"
        aria-label="Accessible reactor schematic. Follow three separate water circuits."
      >
        <defs>
          <marker
            id="arrowHot"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10z" fill="#cb754a" />
          </marker>
          <marker
            id="arrowCool"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10z" fill="#538f9c" />
          </marker>
        </defs>
        <rect
          x="48"
          y="65"
          width="390"
          height="325"
          rx="35"
          fill="none"
          stroke="#b3bfba"
          strokeDasharray="6 6"
        />
        <text x="64" y="410" className="diagram-note">
          Containment boundary
        </text>
        <path
          d="M160 180 H315 V215"
          fill="none"
          stroke="#ce794d"
          strokeWidth="9"
          markerMid="url(#arrowHot)"
        />
        <path
          d="M315 270 V335 H158 V295"
          fill="none"
          stroke="#6195a9"
          strokeWidth="9"
          markerMid="url(#arrowCool)"
        />
        <path
          d="M373 155 H558 V180"
          fill="none"
          stroke="#489b91"
          strokeWidth="7"
        />
        <path
          d="M590 210 V299 H614"
          fill="none"
          stroke="#489b91"
          strokeWidth="7"
        />
        <path
          d="M570 337 H387 V270"
          fill="none"
          stroke="#489b91"
          strokeWidth="7"
        />
        <path
          d="M738 310 H664 M664 333 H738"
          fill="none"
          stroke="#83aeb6"
          strokeWidth="6"
        />
        <g {...part("vessel")}>
          <rect
            x="105"
            y="143"
            width="104"
            height="164"
            rx="25"
            fill="#d6ded9"
            stroke="#849790"
            strokeWidth="5"
          />
        </g>
        <g {...part("fuel")}>
          <rect x="120" y="208" width="72" height="76" rx="4" fill="#d7ab68" />
          {[130, 145, 160, 175].map((x) => (
            <path
              key={x}
              d={`M${x} 215 V276`}
              stroke="#936738"
              strokeWidth="6"
            />
          ))}
        </g>
        <g {...part("rods")}>
          <rect x="118" y="124" width="78" height="10" fill="#4a6360" />
          {[134, 158, 182].map((x) => (
            <path
              key={x}
              d={`M${x} 128 V${170 + controls.rods * 0.75}`}
              stroke="#425c57"
              strokeWidth="5"
            />
          ))}
          <text x="157" y="111" textAnchor="middle">
            Control rods
          </text>
        </g>
        <text x="157" y="325" textAnchor="middle">
          Reactor
        </text>
        <text x="155" y="366" textAnchor="middle" className="diagram-note">
          {Math.round(state.fuel)}°C fuel
        </text>
        <g {...part("pressuriser")}>
          <rect
            x="236"
            y="82"
            width="36"
            height="65"
            rx="15"
            fill="#ddc39b"
            stroke="#9a875f"
            strokeWidth="2"
          />
          <path d="M254 147 V180" stroke="#9a875f" strokeWidth="4" />
          <text x="257" y="65" textAnchor="middle">
            Pressuriser
          </text>
        </g>
        <g {...part("steam")}>
          <rect
            x="312"
            y="135"
            width="88"
            height="155"
            rx="24"
            fill="#d8e6df"
            stroke="#65978f"
            strokeWidth="3"
          />
          <path
            d="M330 267 V185 Q348 150 357 185 V267"
            fill="none"
            stroke="#c78051"
            strokeWidth="7"
          />
          <text x="357" y="114" textAnchor="middle">
            Steam generator
          </text>
        </g>
        <g {...part("pump")}>
          <circle
            cx="243"
            cy="335"
            r="19"
            fill="#c3d6df"
            stroke="#5b899c"
            strokeWidth="3"
          />
          <path d="m235 326 19 9-19 9z" fill="#5b899c" />
          <text x="244" y="373" textAnchor="middle">
            Pump
          </text>
        </g>
        <g {...part("turbine")}>
          <path
            d="M530 173 608 152 V235 L530 215Z"
            fill="#c9cfc2"
            stroke="#889782"
            strokeWidth="3"
          />
          <path d="M608 195 H641" stroke="#63766b" strokeWidth="6" />
          <circle cx="664" cy="195" r="25" fill="#59756b" />
          <text x="664" y="201" textAnchor="middle" fill="white">
            G
          </text>
          <text x="607" y="133" textAnchor="middle">
            Turbine & generator
          </text>
        </g>
        <g {...part("condenser")}>
          <rect
            x="562"
            y="289"
            width="120"
            height="57"
            rx="12"
            fill="#d8e5e7"
            stroke="#789fa3"
            strokeWidth="3"
          />
          <path
            d="M580 302 H660 M580 314 H660 M580 326 H660"
            stroke="#789fa3"
            strokeWidth="3"
          />
          <text x="622" y="375" textAnchor="middle">
            Condenser
          </text>
        </g>
        <text x="472" y="145" textAnchor="middle" className="diagram-note">
          Steam →
        </text>
        <text x="479" y="361" textAnchor="middle" className="diagram-note">
          ← Feedwater
        </text>
        <text x="734" y="287" textAnchor="middle" className="diagram-note">
          External
        </text>
        <text x="734" y="369" textAnchor="middle" className="diagram-note">
          cooling
        </text>
      </svg>
      <p className="scene-footnote">
        Simplified arrangement · select a component to investigate it
      </p>
    </div>
  );
}
