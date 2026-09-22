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
    "aria-pressed": selected === id,
    "aria-label": `Inspect ${id === "steam" ? "steam generator" : id}`,
  });
  return (
    <div className="schematic">
      <p className="schematic-scroll-hint">
        On a small screen, scroll the diagram sideways or use the component
        buttons.
      </p>
      <svg
        viewBox="0 0 800 430"
        role="group"
        aria-label="Accessible reactor schematic. Primary water travels through sealed tubes; secondary water boils outside them. A separate external circuit cools the condenser."
      >
        <defs>
          <marker
            id="flowArrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M0 0L10 5L0 10Z" fill="#3f5942" />
          </marker>
        </defs>
        <rect
          x="30"
          y="60"
          width="390"
          height="318"
          rx="30"
          fill="none"
          stroke="#8f9d90"
          strokeDasharray="6 6"
        />
        <text x="40" y="402" className="diagram-note">
          Containment boundary
        </text>
        <g {...part("vessel")}>
          <rect
            x="80"
            y="170"
            width="104"
            height="150"
            rx="25"
            fill="#dce5dd"
            stroke="#738a7a"
            strokeWidth="4"
          />
          <text x="132" y="355" textAnchor="middle">
            Reactor
          </text>
        </g>
        <g {...part("water")}>
          <path
            d="M184 205H280V285H306 M370 300V338H132V320"
            fill="none"
            stroke="#b26731"
            strokeWidth="8"
          />
          <path
            d="M210 205H254 M272 338H201"
            stroke="#b26731"
            strokeWidth="5"
            markerEnd="url(#flowArrow)"
          />
        </g>
        <g {...part("fuel")}>
          <rect x="103" y="234" width="60" height="64" rx="3" fill="#d7ab68" />
          {[111, 124, 137, 150].map((x) => (
            <path
              key={x}
              d={`M${x} 240V290`}
              stroke="#8f622d"
              strokeWidth="5"
            />
          ))}
        </g>
        <g {...part("rods")}>
          <rect x="93" y="150" width="77" height="9" fill="#425c57" />
          {[106, 130, 154].map((x) => (
            <path
              key={x}
              d={`M${x} 155V${190 + controls.rods * 0.75}`}
              stroke="#425c57"
              strokeWidth="5"
            />
          ))}
          <text x="130" y="131" textAnchor="middle">
            Control rods
          </text>
        </g>
        <g {...part("pressuriser")}>
          <rect
            x="223"
            y="111"
            width="34"
            height="62"
            rx="13"
            fill="#ddc39b"
            stroke="#8c764f"
            strokeWidth="2"
          />
          <path d="M240 173V205" stroke="#8c764f" strokeWidth="4" />
          <text x="240" y="91" textAnchor="middle">
            Pressuriser
          </text>
        </g>
        <g {...part("steam")}>
          <rect
            x="303"
            y="120"
            width="102"
            height="183"
            rx="21"
            fill="#d8e8e1"
            stroke="#4a8073"
            strokeWidth="3"
          />
          <path
            d="M303 285H330V178Q350 145 370 178V303"
            fill="none"
            stroke="#6b5743"
            strokeWidth="12"
          />
          <path
            d="M303 285H330V178Q350 145 370 178V303"
            fill="none"
            stroke="#d19658"
            strokeWidth="6"
          />
          <text x="355" y="102" textAnchor="middle">
            Steam generator
          </text>
        </g>
        <g {...part("pump")}>
          <circle
            cx="242"
            cy="338"
            r="17"
            fill="#c3d6df"
            stroke="#527c88"
            strokeWidth="3"
          />
          <path d="M250 331L235 338L250 345Z" fill="#527c88" />
          <text x="242" y="372" textAnchor="middle">
            Pump
          </text>
        </g>
        <path
          d="M405 145H550V169 M593 215V279 M560 315H432V267H405"
          fill="none"
          stroke="#287b70"
          strokeWidth="7"
        />
        <path
          d="M445 145H510 M518 315H463"
          stroke="#287b70"
          strokeWidth="4"
          markerEnd="url(#flowArrow)"
        />
        <g {...part("turbine")}>
          <path
            d="M531 173L609 152V234L531 216Z"
            fill="#c9cfc2"
            stroke="#728267"
            strokeWidth="3"
          />
          <path d="M609 194H665" stroke="#526851" strokeWidth="5" />
          <circle cx="685" cy="194" r="24" fill="#42644f" />
          <text x="685" y="200" textAnchor="middle" fill="white">
            G
          </text>
          <text x="619" y="121" textAnchor="middle">
            Turbine & generator
          </text>
        </g>
        <g {...part("condenser")}>
          <rect
            x="559"
            y="278"
            width="133"
            height="55"
            rx="10"
            fill="#d8e8e1"
            stroke="#4a8073"
            strokeWidth="3"
          />
          <path
            d="M770 290H620V317H770"
            fill="none"
            stroke="#54869e"
            strokeWidth="7"
          />
          <path
            d="M749 290H707 M707 317H749"
            stroke="#54869e"
            strokeWidth="4"
            markerEnd="url(#flowArrow)"
          />
          <text x="624" y="363" textAnchor="middle">
            Condenser
          </text>
        </g>
        <text x="465" y="128" className="diagram-note">
          Steam
        </text>
        <text x="433" y="350" className="diagram-note">
          Feedwater returns
        </text>
        <text x="724" y="268" textAnchor="middle" className="diagram-note">
          Cooling water in
        </text>
        <text x="734" y="350" textAnchor="middle" className="diagram-note">
          Warmer water out
        </text>
        <text x="82" y="425" className="diagram-note">
          Fuel: {state.fuel.toFixed(0)}°C · illustrative average
        </text>
      </svg>
      <div className="circuit-key">
        <span>
          <i className="circuit-primary" />
          Primary · pressurised liquid
        </span>
        <span>
          <i className="circuit-secondary" />
          Secondary · water / steam
        </span>
        <span>
          <i className="circuit-external" />
          External cooling water
        </span>
      </div>
      <p className="scene-footnote">
        Fluid paths stay separate at the steam generator and condenser. Pipe
        positions and component sizes are schematic.
      </p>
    </div>
  );
}
