import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://core.test/",
});
Object.defineProperty(globalThis, "window", {
  value: dom.window,
  configurable: true,
});
Object.defineProperty(globalThis, "document", {
  value: dom.window.document,
  configurable: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
Object.defineProperty(globalThis, "localStorage", {
  value: dom.window.localStorage,
  configurable: true,
});
Object.defineProperty(globalThis, "HTMLElement", {
  value: dom.window.HTMLElement,
  configurable: true,
});
dom.window.matchMedia = () =>
  ({
    matches: true,
    addListener() {},
    removeListener() {},
  }) as unknown as MediaQueryList;
dom.window.HTMLCanvasElement.prototype.getContext = () => null;
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};
const React = await import("react");
const { render, screen, fireEvent, cleanup, within, act } =
  await import("@testing-library/react");
const { default: App } = await import("../src/App");
afterEach(() => {
  cleanup();
  dom.window.localStorage.clear();
});
function mount(guided = false) {
  const error = console.error;
  console.error = (...args: unknown[]) => {
    if (!String(args[0]).includes("Error creating WebGL context"))
      error(...args);
  };
  render(React.createElement(App));
  fireEvent.click(
    screen.getByRole("button", {
      name: guided ? "Start with the essentials" : "Explore freely",
    }),
  );
  console.error = error;
}
test("WebGL failure falls back to a selectable, keyboard-accessible schematic", () => {
  mount();
  assert.ok(
    screen.getByRole("group", { name: /Accessible reactor schematic/ }),
  );
  fireEvent.keyDown(
    screen.getByRole("button", { name: "Inspect steam generator" }),
    { key: "Enter" },
  );
  assert.ok(screen.getByRole("heading", { name: "Steam generator" }));
  assert.ok(screen.getByText("Heat crosses. Water stays separate."));
});
test("complete guided investigation records a prediction, explanation and completion", () => {
  mount();
  fireEvent.click(
    screen.getByRole("button", { name: /Start an investigation/ }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Steam from a separate secondary circuit",
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Record prediction" }));
  fireEvent.click(screen.getByRole("button", { name: "Begin experiment" }));
  const panel = screen.getByRole("complementary", {
    name: "Guided investigation",
  });
  for (const name of [
    "Fuel assemblies",
    "Turbine & generator",
    "Condenser & cooling",
  ])
    fireEvent.click(within(panel).getByRole("button", { name }));
  fireEvent.click(
    screen.getByRole("button", { name: "Explain my observations" }),
  );
  fireEvent.change(screen.getByLabelText("Your explanation"), {
    target: {
      value:
        "The primary circuit transferred heat to secondary water without mixing; steam then carried energy to the turbine.",
    },
  });
  fireEvent.click(screen.getByRole("button", { name: "Test my explanation" }));
  fireEvent.click(
    screen.getByRole("button", {
      name: "No, the steam-generator wall separates the circuits",
      exact: true,
    }),
  );
  fireEvent.click(
    within(panel).getByRole("button", {
      name: "Check understanding",
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Complete investigation" }),
  );
  assert.ok(screen.getByText("Investigation complete."));
  const saved = JSON.parse(localStorage.getItem("core-reactor-learning-v1")!);
  assert.equal(saved.energy.completed, true);
  assert.match(saved.energy.explanation, /primary circuit/);
});
test("quiz gives corrective feedback and permits another attempt", () => {
  mount();
  fireEvent.click(
    screen.getByRole("button", { name: "Check understanding", exact: true }),
  );
  assert.equal(screen.queryByRole("radio"), null);
  fireEvent.change(screen.getByLabelText(/Before seeing answer choices/), {
    target: { value: "Rods absorb neutrons; coolant removes energy." },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Reveal the questions when ready" }),
  );
  const groups = screen.getAllByRole("group");
  for (const g of groups) {
    const choices = within(g).queryAllByRole("radio");
    if (choices.length) fireEvent.click(choices[0]);
  }
  fireEvent.click(screen.getByRole("button", { name: "Check my answers" }));
  assert.ok(screen.getByText(/correct. Review the explanations/));
  assert.ok(screen.getAllByText(/Revisit this idea/).length > 0);
  fireEvent.click(screen.getByLabelText("Heat", { exact: true }));
  assert.equal(screen.queryByText(/correct. Review the explanations/), null);
});
test("reset clears changes but retains a saved comparison", () => {
  mount();
  fireEvent.click(
    screen.getByRole("button", { name: "Save run for comparison" }),
  );
  fireEvent.change(
    screen.getByRole("slider", { name: "Coolant circulation" }),
    { target: { value: "65" } },
  );
  assert.equal(
    (
      screen.getByRole("slider", {
        name: "Coolant circulation",
      }) as HTMLInputElement
    ).value,
    "65",
  );
  fireEvent.click(screen.getByRole("button", { name: "Reset", exact: true }));
  assert.equal(
    (
      screen.getByRole("slider", {
        name: "Coolant circulation",
      }) as HTMLInputElement
    ).value,
    "100",
  );
  assert.ok(screen.getByText("Saved run · elapsed time aligned"));
  assert.ok(screen.getByRole("button", { name: "Run simulation" }));
});
test("full rod insertion updates the model control and starts the response", () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Insert all rods" }));
  assert.equal(
    (
      screen.getByRole("slider", {
        name: "Control-rod insertion",
      }) as HTMLInputElement
    ).value,
    "100",
  );
  assert.ok(screen.getByText("Shutdown response"));
  assert.ok(screen.getByRole("button", { name: "Pause simulation" }));
});
test("guided control changes remain fixed and stop automatically with captured evidence", (t) => {
  let clock = 0;
  t.mock.method(performance, "now", () => clock);
  t.mock.timers.enable({ apis: ["setInterval"] });
  mount(true);
  fireEvent.click(screen.getByRole("button", { name: /Change the reaction/ }));
  fireEvent.click(
    screen.getByRole("button", { name: /More neutrons are absorbed/ }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Record prediction" }));
  fireEvent.click(screen.getByRole("button", { name: "Begin experiment" }));
  assert.equal(screen.queryByRole("slider"), null);
  assert.equal(
    (
      screen.getByRole("button", {
        name: "Explain my observations",
      }) as HTMLButtonElement
    ).disabled,
    true,
  );
  fireEvent.click(screen.getByRole("button", { name: "Insert rods to 65%" }));
  for (let i = 0; i < 70; i++)
    act(() => {
      clock += 100;
      t.mock.timers.tick(100);
    });
  assert.ok(screen.getByText(/Observation captured/));
  assert.equal(
    screen.queryByRole("button", { name: "Pause observation" }),
    null,
  );
  assert.equal(
    (
      screen.getByRole("button", {
        name: "Explain my observations",
      }) as HTMLButtonElement
    ).disabled,
    false,
  );
  assert.ok(
    Math.abs(
      Number(screen.getByRole("progressbar").getAttribute("value")) - 20,
    ) < 1e-8,
  );
  const evidence = screen.getByLabelText("Before and after evidence");
  assert.match(evidence.textContent!, /percentage points/);
  fireEvent.click(
    screen.getByRole("button", { name: "Repeat this experiment" }),
  );
  assert.equal(
    (
      screen.getByRole("button", {
        name: "Explain my observations",
      }) as HTMLButtonElement
    ).disabled,
    true,
  );
});
test("entry starts with orientation and free exploration starts paused", () => {
  render(React.createElement(App));
  assert.ok(screen.getByRole("heading", { name: /If the reactor shuts down/ }));
  assert.equal(screen.queryByRole("slider"), null);
  fireEvent.click(screen.getByRole("button", { name: "Explore freely" }));
  assert.ok(screen.getByRole("button", { name: "Run simulation" }));
});
test("explanation is withheld until an answer and short written responses persist", () => {
  mount(true);
  fireEvent.click(
    screen.getByRole("button", {
      name: "Steam from a separate secondary circuit",
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Record prediction" }));
  fireEvent.click(screen.getByRole("button", { name: "Begin experiment" }));
  const panel = screen.getByRole("complementary", {
    name: "Guided investigation",
  });
  for (const name of [
    "Fuel assemblies",
    "Turbine & generator",
    "Condenser & cooling",
  ])
    fireEvent.click(within(panel).getByRole("button", { name }));
  fireEvent.click(
    screen.getByRole("button", { name: "Explain my observations" }),
  );
  fireEvent.change(screen.getByLabelText("Your explanation"), {
    target: { value: "Heat crosses; water stays separate." },
  });
  const saved = JSON.parse(localStorage.getItem("core-reactor-learning-v1")!);
  assert.equal(saved.energy.explanation, "Heat crosses; water stays separate.");
  fireEvent.click(screen.getByRole("button", { name: "Test my explanation" }));
  assert.equal(screen.queryByText(/The fuel heats primary water/), null);
  assert.equal(screen.queryByRole("region", { name: "Learning focus" }), null);
  fireEvent.click(
    screen.getByRole("button", {
      name: "No, the steam-generator wall separates the circuits",
    }),
  );
  fireEvent.click(
    within(panel).getByRole("button", {
      name: "Check understanding",
      exact: true,
    }),
  );
  assert.ok(screen.getByText(/The fuel heats primary water/));
});
