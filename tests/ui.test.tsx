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
    "Steam generator",
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
const staged = [
  {
    lesson: /Change the reaction/,
    prediction: /More neutrons are absorbed/,
    choice: "Drop quickly at first, then keep falling slowly",
    watch: "Watch the thermal power.",
    ran: /It dropped to 8\d% in the first few seconds/,
    reveal: "Show fuel temperature",
    found: "Power fell fast. Temperature barely moved.",
    explained: /fuel temperature had only fallen/,
    ticks: 80,
  },
  {
    lesson: /Move the heat/,
    prediction: /It tends to rise/,
    choice: "Rise, then stop and turn back",
    watch: "Watch the fuel temperature.",
    ran: /It rose to 630 °C, then turned back/,
    reveal: "Show heat in and heat out",
    found: "They cross.",
    explained: /At 3\d\.\d model seconds, heat in is/,
    ticks: 140,
  },
  {
    lesson: /After shutdown/,
    prediction: /Yes; decay heat and stored/,
    choice: "Drop fast, but a small amount keeps going",
    watch: "Watch the heat generated in the fuel.",
    ran: /It fell to \d\.\d%, not to zero/,
    reveal: "Split it into fission and decay heat",
    found: "Decay heat takes over.",
    explained: /the fuel is still at \d{3} °C/,
    ticks: 140,
  },
];
function walkStagedRun(c: (typeof staged)[number], advance: () => void) {
  mount(true);
  fireEvent.click(screen.getByRole("button", { name: c.lesson }));
  fireEvent.click(screen.getByRole("button", { name: c.prediction }));
  fireEvent.click(screen.getByRole("button", { name: "Record prediction" }));
  fireEvent.click(screen.getByRole("button", { name: "Begin experiment" }));
  assert.equal(
    screen.queryByRole("region", { name: "Reactor visualisation" }),
    null,
  );
  assert.equal(screen.queryByRole("slider"), null);
  assert.equal(screen.queryAllByRole("img").length, 0);
  assert.equal(screen.queryByRole("button", { name: /Run it/ }), null);
  fireEvent.click(screen.getByRole("button", { name: c.choice }));
  fireEvent.click(screen.getByRole("button", { name: /Run it/ }));
  assert.ok(screen.getByRole("heading", { name: c.watch }));
  assert.equal(screen.getAllByRole("img").length, 1);
  for (let i = 0; i < c.ticks; i++) act(advance);
  assert.ok(screen.getByRole("heading", { name: c.ran }));
  assert.ok(screen.getByText(/You predicted:/));
  assert.equal(screen.getAllByRole("img").length, 1);
  fireEvent.click(screen.getByRole("button", { name: c.reveal }));
  assert.equal(screen.getAllByRole("img").length, 2);
  assert.equal(screen.queryByText(c.explained), null);
  fireEvent.click(
    screen.getByRole("button", { name: "I’ve looked. Show me." }),
  );
  assert.ok(screen.getByRole("heading", { name: c.found }));
  assert.ok(screen.getByText(c.explained));
  for (const chart of screen.getAllByRole("img"))
    assert.match(chart.getAttribute("aria-label")!, /Marked at/);
  fireEvent.click(
    screen.getByRole("button", { name: /Explain what happened/ }),
  );
  assert.ok(screen.getByLabelText("Your explanation"));
}
for (const c of staged)
  test(`${c.lesson.source}: the guided run releases its evidence one beat at a time`, (t) => {
    let clock = 0;
    t.mock.method(performance, "now", () => clock);
    t.mock.timers.enable({ apis: ["setInterval"] });
    walkStagedRun(c, () => {
      clock += 100;
      t.mock.timers.tick(100);
    });
  });
test("after a staged run, the explanation step keeps the captured evidence inspectable", (t) => {
  let clock = 0;
  t.mock.method(performance, "now", () => clock);
  t.mock.timers.enable({ apis: ["setInterval"] });
  walkStagedRun(staged[0], () => {
    clock += 100;
    t.mock.timers.tick(100);
  });
  assert.ok(
    Math.abs(
      Number(
        screen
          .getByRole("progressbar", { name: "Observation progress" })
          .getAttribute("value"),
      ) - 20,
    ) < 1e-8,
  );
  const evidence = screen.getByLabelText("Before and after evidence");
  assert.match(evidence.textContent!, /percentage points/);
  fireEvent.click(screen.getByRole("button", { name: /Before change/ }));
  assert.ok(screen.getByText(/Readings at 0.0 model s/));
  assert.equal(
    screen
      .getByRole("button", { name: /Before change/ })
      .getAttribute("aria-pressed"),
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: /Early response/ }));
  assert.ok(screen.getByText(/selected recorded instant/));
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
    "Steam generator",
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

test("annotation steps select matching components and explain the intact tube wall", () => {
  mount(true);
  fireEvent.click(
    screen.getByRole("button", {
      name: "Steam from a separate secondary circuit",
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Record prediction" }));
  fireEvent.click(screen.getByRole("button", { name: "Begin experiment" }));
  const tour = screen.getByRole("region", {
    name: "Annotated science pathway",
  });
  fireEvent.click(
    within(tour).getByRole("button", { name: /2 · Heat crosses/ }),
  );
  assert.equal(
    screen
      .getByRole("button", { name: "Inspect steam generator" })
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.ok(screen.getByText(/No fluid crosses the intact wall/));
  fireEvent.click(
    within(tour).getByRole("button", { name: "Next relationship" }),
  );
  assert.equal(
    screen
      .getByRole("button", { name: "Inspect turbine" })
      .getAttribute("aria-pressed"),
    "true",
  );
});
test("misconception feedback supports evidence revision while preserving the first draft", () => {
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
    "Steam generator",
    "Turbine & generator",
    "Condenser & cooling",
  ])
    fireEvent.click(within(panel).getByRole("button", { name }));
  fireEvent.click(
    screen.getByRole("button", { name: "Explain my observations" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "I need a hint" }));
  assert.ok(screen.getByText(/Trace one parcel of primary water/));
  fireEvent.change(screen.getByLabelText("Your explanation"), {
    target: { value: "Primary water reaches the turbine." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Test my explanation" }));
  fireEvent.click(
    screen.getByRole("button", {
      name: "Yes, because all the water follows one loop",
    }),
  );
  fireEvent.click(
    within(panel).getByRole("button", {
      name: "Check understanding",
      exact: true,
    }),
  );
  assert.ok(
    screen.getByText(/You have joined the primary and secondary water paths/),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Revisit evidence and revise" }),
  );
  assert.equal(
    (screen.getByLabelText("Your explanation") as HTMLTextAreaElement).value,
    "Primary water reaches the turbine.",
  );
  assert.ok(screen.getByRole("region", { name: "Annotated science pathway" }));
  fireEvent.change(screen.getByLabelText("Your explanation"), {
    target: {
      value: "Heat crosses the tube wall; primary water stays in its circuit.",
    },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Save revision and try again" }),
  );
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
  fireEvent.click(
    screen.getByRole("button", { name: "Complete investigation" }),
  );
  const saved = JSON.parse(localStorage.getItem("core-reactor-learning-v1")!);
  assert.equal(
    saved.energy.firstExplanation,
    "Primary water reaches the turbine.",
  );
  assert.match(saved.energy.explanation, /Heat crosses/);
  assert.match(saved.energy.evidence, /Steam generator/);
  assert.equal(saved.energy.revised, true);
  assert.equal(saved.energy.completed, true);
});

test("neutron diagram selection matches its science annotation", () => {
  mount(true);
  fireEvent.click(screen.getByRole("button", { name: /Meet the core/ }));
  fireEvent.click(screen.getByRole("button", { name: /Slow neutrons so/ }));
  fireEvent.click(screen.getByRole("button", { name: "Record prediction" }));
  fireEvent.click(screen.getByRole("button", { name: "Begin experiment" }));
  const diagram = screen.getByRole("group", {
    name: "Three neutron interactions",
  });
  fireEvent.click(
    within(diagram).getByRole("button", { name: /Water · moderation/ }),
  );
  assert.ok(screen.getByText(/It also absorbs some neutrons/));
  fireEvent.click(
    within(diagram).getByRole("button", { name: /Control rod · capture/ }),
  );
  assert.ok(screen.getByText(/absorption in fuel can lead to fission/));
});
