import type { PartID } from "./content";
export default function EnergyPath({
  selected,
  onSelect,
}: {
  selected: PartID;
  onSelect: (id: PartID) => void;
}) {
  const button = (id: PartID, title: string, description: string) => (
    <button
      className="energy-component"
      aria-label={`Inspect ${id === "steam" ? "steam generator" : id}`}
      aria-pressed={selected === id}
      onClick={() => onSelect(id)}
    >
      <strong>{title}</strong>
      {selected === id && <span>{description}</span>}
    </button>
  );
  return (
    <figure
      className="energy-path"
      role="group"
      aria-label="Accessible reactor schematic: energy route across three separate water circuits"
    >
      <figcaption>
        Follow energy down the page. Water stays within each named circuit.
      </figcaption>
      <div className="energy-circuit primary-circuit">
        <h3>
          A · Primary circuit <small>Pressurised liquid water</small>
        </h3>
        {button(
          "fuel",
          "1 · Fuel heats the water",
          "Fission energy becomes thermal energy in the fuel.",
        )}
        <p className="fluid-return">
          ↻ Hot liquid to the steam generator; cooled liquid returns to the core
          via the pump.
        </p>
      </div>
      <div className="energy-bridge">
        <span aria-hidden="true">⇣</span>
        {button(
          "steam",
          "2 · Steam generator",
          "Heat crosses a tube wall. Secondary water boils; primary water stays liquid.",
        )}
        <small>HEAT CROSSES · WATER DOES NOT MIX</small>
        <span aria-hidden="true">⇣</span>
      </div>
      <div className="energy-circuit secondary-circuit">
        <h3>
          B · Secondary circuit <small>Water and steam</small>
        </h3>
        {button(
          "turbine",
          "3 · Turbine → generator → electricity",
          "Steam expands and does work. The generator converts shaft work to electricity.",
        )}
        <p className="fluid-return">
          ↻ Steam goes to the turbine, then condenser. Liquid feedwater returns
          to the steam generator.
        </p>
      </div>
      <div className="energy-bridge">
        <span aria-hidden="true">⇣</span>
        {button(
          "condenser",
          "4 · Condenser",
          "Remaining heat crosses another wall. Exhaust steam condenses to liquid.",
        )}
        <small>HEAT CROSSES · WATER DOES NOT MIX</small>
        <span aria-hidden="true">⇣</span>
      </div>
      <div className="energy-circuit external-circuit">
        <h3>C · External cooling circuit</h3>
        <p>
          Cooler water enters the condenser; warmer water carries heat to an
          external sink. This water does not pass through the core or turbine.
        </p>
      </div>
      <p className="path-key">
        ↻ = fluid circulation within a circuit. ⇣ = heat transfer between
        circuits. This is an energy map, not a piping layout.
      </p>
    </figure>
  );
}
