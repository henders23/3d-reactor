export default function FissionDiagram() {
  return (
    <div className="fission-diagram">
      <svg
        viewBox="0 0 760 340"
        role="img"
        aria-label="A neutron causes fission. The nucleus splits, releasing fragments, energy and neutrons. A control rod absorbs a neutron; water slows another neutron, which can cause another fission."
      >
        <defs>
          <marker
            id="fissionArrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0 0 10 5 0 10z" fill="#a37b3b" />
          </marker>
        </defs>
        <path
          d="M60 170 H195"
          stroke="#a37b3b"
          strokeWidth="3"
          markerEnd="url(#fissionArrow)"
        />
        <circle cx="80" cy="170" r="7" fill="#d2a253" />
        <text x="40" y="145">
          Incoming neutron
        </text>
        <circle cx="245" cy="149" r="26" fill="#c7a169" />
        <circle cx="246" cy="199" r="22" fill="#a3b3a2" />
        <text x="202" y="252">
          Fission fragments
        </text>
        <text x="215" y="275">
          + released energy
        </text>
        <path
          d="M280 152 452 83"
          stroke="#a37b3b"
          strokeWidth="3"
          markerEnd="url(#fissionArrow)"
        />
        <rect x="465" y="52" width="24" height="74" rx="6" fill="#4a6256" />
        <text x="508" y="78">
          Absorbed by a control rod
        </text>
        <text x="508" y="99" className="muted">
          Removed from the chain reaction
        </text>
        <path
          d="M280 190 385 219"
          stroke="#a37b3b"
          strokeWidth="3"
          markerEnd="url(#fissionArrow)"
        />
        <circle cx="418" cy="222" r="28" fill="#b1d2cf" />
        <text x="370" y="281">
          Water moderates
        </text>
        <path
          d="M453 222 H540"
          stroke="#a37b3b"
          strokeWidth="3"
          strokeDasharray="7 6"
          markerEnd="url(#fissionArrow)"
        />
        <circle cx="599" cy="222" r="31" fill="#c5a776" />
        <text x="553" y="281">
          Further fission
        </text>
        <text x="466" y="201" className="muted">
          Slower neutron
        </text>
      </svg>
      <p>
        Selected outcomes only · not every neutron causes fission · not to scale
      </p>
    </div>
  );
}
