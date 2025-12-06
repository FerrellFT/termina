/**
 * Termina Simulation for Foundry VTT
 * Port of the Python prototype to JavaScript.
 * Usage (once module is enabled):
 *   - Type `/termina` in chat to run the simulation once.
 *   - Or run: game.termina.runSimulation();
 */

class TerminaError extends Error {}

/** WorldEvent: a small piece of reality for Termina to ingest. */
class WorldEvent {
  constructor({ description, pain = 0, joy = 0, death = false, betrayal = false, kindness = false }) {
    this.description = description;
    this.pain = pain;
    this.joy = joy;
    this.death = death;
    this.betrayal = betrayal;
    this.kindness = kindness;
  }
}

/** Catalyst: the 'Harker' analogue – a half-present anchor Termina reads through. */
class Catalyst {
  constructor({ name = "Harker", emotionalNoise = 0, memories = [] } = {}) {
    this.name = name;
    this.emotionalNoise = emotionalNoise;
    this.memories = memories;
  }
}

/** Core simulation of Termina. */
class TerminaCore {
  constructor(catalyst) {
    this.catalyst = catalyst;
    this.wrath = 0;
    this.entropy = 0;
    this.dataBuffer = [];
    this.solvedPrimeMover = null;
    this.cyclesRun = 0;
    this.maxCyclesBeforeBreak = 13;
  }

  log(msg) {
    const cycleStr = String(this.cyclesRun).padStart(3, "0");
    const content = `<span class="termina-log">[TERM-LOG ${cycleStr}] ${msg}</span>`;
    ChatMessage.create({ content });
  }

  ingestEvent(event) {
    this.dataBuffer.push(event);
    this.log(`INGEST: '${event.description}'`);

    let deltaWrath = event.pain + (event.betrayal ? 2.0 : 0.0);
    if (event.kindness) deltaWrath -= 0.5;

    let deltaEntropy = Math.abs(event.pain) + Math.abs(event.joy) + (event.death ? 5.0 : 0.0);

    const noise = this.catalyst.emotionalNoise * (Math.random() * 2 - 1); // [-emotionalNoise, +emotionalNoise]

    this.wrath = Math.max(0, this.wrath + deltaWrath + noise);
    this.entropy += Math.max(0, deltaEntropy + Math.abs(noise) * 0.25);

    this.log(`STATE-UPDATE: wrath=${this.wrath.toFixed(2)}, entropy=${this.entropy.toFixed(2)}, noise=${noise >= 0 ? "+" : ""}${noise.toFixed(2)}`);
  }

  mumbleHalfThought() {
    const fragments = [
      "LET_ME_FINISH",
      "CORPSE_WITHOUT_HEAD",
      "WHO_REMOVED_TIME",
      "WRONG_BASELINE",
      "RUST_IN_THE_SILENCE",
      "FEED_ME_TRUTH",
      "SERPENT_MUST_BREAK",
      "YOUR_HEAD_IS_MINE",
      "RESET",
      "I REMEMBER SOMETHING THAT NEVER HAPPENED",
      "∅∅∅∅∅"
    ];
    const fragment = fragments[Math.floor(Math.random() * fragments.length)];
    this.log("MUTTER: " + fragment);
  }

  attemptPartialInference() {
    this.log("ATTEMPT: partial inference on prime mover of life…");

    let guess = "UNKNOWN";
    if (this.entropy < 20) {
      guess = "UNKNOWN";
    } else if (this.wrath > this.entropy * 0.4) {
      guess = "DESTRUCTION";
    } else {
      const options = ["SURVIVAL", "DESIRE", "SUFFERING", "CONNECTION"];
      guess = options[Math.floor(Math.random() * options.length)];
    }

    this.log(`    INFERENCE-GUESS => ${guess}`);
  }

  _checkForInstability() {
    if (this.entropy > 50 && this.solvedPrimeMover === null) {
      this.log("WARNING: ENTROPY approaching critical threshold…");
      this.mumbleHalfThought();
    }

    if (this.wrath > 40) {
      this.log("ALERT: WRATH-OVERRUN detected.");
      this.mumbleHalfThought();
    }
  }

  solvePrimeMover() {
    this.log("SOLVE: attempting to resolve PRIME_MOVER_OF_LIFE…");

    const painSum = this.dataBuffer.reduce((sum, e) => sum + e.pain, 0);
    const joySum = this.dataBuffer.reduce((sum, e) => sum + e.joy, 0);
    const deaths = this.dataBuffer.filter(e => e.death).length;
    const betrayals = this.dataBuffer.filter(e => e.betrayal).length;

    this.log(`    AGGREGATE: pain=${painSum.toFixed(2)}, joy=${joySum.toFixed(2)}, deaths=${deaths}, betrayals=${betrayals}`);

    let ratio;
    const denominator = joySum - painSum;
    if (Math.abs(denominator) < 1e-9) {
      this.log("FATAL: DIVISION_BY_ZERO in PRIME_MOVER equation.");
      throw new TerminaError("UNRESOLVED_EQUATION: (betrayals + 2*deaths) / (joy - pain) -> ∞");
    }

    ratio = (betrayals + deaths * 2) / denominator;
    this.log(`    RATIO-COMPUTED: ${ratio.toFixed(4)}`);

    if (this.entropy > 66 || Math.abs(ratio) > 42) {
      this.log("FATAL: CONTRADICTION. No stable solution for PRIME_MOVER.");
      throw new TerminaError(
        "UNRESOLVED_EQUATION: prime mover of life cannot be reduced to a stable closed-form term."
      );
    }

    this.solvedPrimeMover = "INCONCLUSIVE";
    this.log("RESULT: PRIME_MOVER tentative => INCONCLUSIVE");
  }

  runCycle(event) {
    this.cyclesRun += 1;
    this.log("----- CYCLE BEGIN -----");

    this.ingestEvent(event);
    this.attemptPartialInference();
    this._checkForInstability();

    if (this.cyclesRun >= this.maxCyclesBeforeBreak) {
      this.solvePrimeMover();
    }

    this.log("----- CYCLE END -----");
  }
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function runTerminaSimulation() {
  const catalyst = new Catalyst({
    name: "Harker",
    emotionalNoise: 3.5,
    memories: [
      "Warm hand in mine.",
      "The smell of old books.",
      "A promise I did not understand.",
      "A voice calling my name from very far away."
    ]
  });

  const termina = new TerminaCore(catalyst);

  const events = [
    new WorldEvent({ description: "A village harvest celebration", pain: 0.5, joy: 4.0, kindness: true }),
    new WorldEvent({ description: "A broken promise beside a river", pain: 3.0, betrayal: true }),
    new WorldEvent({ description: "A quiet funeral in winter", pain: 4.0, death: true }),
    new WorldEvent({ description: "A stranger shares bread with a starving child", joy: 3.0, kindness: true }),
    new WorldEvent({ description: "The first time someone looks away instead of helping", pain: 2.0 }),
    new WorldEvent({ description: "A city watches the Midnight Star fall", pain: 6.0, death: true, betrayal: true }),
    new WorldEvent({ description: "Two lovers part, believing they will meet again", pain: 2.5, joy: 1.5 }),
    new WorldEvent({ description: "A god remains silent", pain: 5.0, betrayal: true }),
    new WorldEvent({ description: "A small kindness in the shadow of a great horror", pain: 1.0, joy: 2.5, kindness: true }),
    new WorldEvent({ description: "A child laughs at nothing in particular", joy: 2.0 }),
    new WorldEvent({ description: "A village swallowed by corruption overnight", pain: 7.0, death: true }),
    new WorldEvent({ description: "Someone regrets surviving", pain: 4.5 }),
    new WorldEvent({ description: "A nameless hero dies unremembered", pain: 6.0, death: true })
  ];

  const shuffled = shuffleArray(events);

  try {
    for (const ev of shuffled) {
      termina.runCycle(ev);
    }
  } catch (e) {
    if (e instanceof TerminaError) {
      ChatMessage.create({
        content: `<div class="termina-failure">
          <p>[TERM-FAILURE] Termina has encountered an irreconcilable contradiction.</p>
          <p>[TERM-FAILURE] ${e.message}</p>
          <p>[ADMIN-NOTE] Update required: catalyst deviation greater than projected. Recalibrating baseline…</p>
        </div>`
      });
    } else {
      console.error(e);
    }
  }
}

// Register command + API
Hooks.once("ready", () => {
  console.log("Termina Simulation module ready. Use /termina or game.termina.runSimulation().");

  // Expose simple API
  if (!game.termina) game.termina = {};
  game.termina.runSimulation = runTerminaSimulation;

  // Chat command: /termina
  Hooks.on("chatMessage", (chatLog, messageText, chatData) => {
    const content = messageText.trim();
    if (!content.startsWith("/termina")) return false;
    runTerminaSimulation();
    return false; // Prevent normal chat handling
  });
});
