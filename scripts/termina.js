
/**
 * TITANOMACHIA.exe (Ω-me05) Simulation Module
 *
 * Usage in chat:
 *   /titan              -> run with default canned events
 *   /titan ingest N     -> prompt for N custom world event descriptions
 *
 * The simulation writes detailed output to a collapsible Journal Entry and
 * posts only short summaries + alerts to chat.
 */

class OmegaError extends Error {
  constructor(message, code = "00") {
    super(message);
    this.code = code;
    this.name = "OmegaError";
  }
}

/** WorldEvent: a small piece of reality for Ω-me05 to ingest. */
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

/** Catalyst: the 'Harker' analogue – a half-present anchor. */
class Catalyst {
  constructor({ name = "Harker", emotionalNoise = 0, memories = [] } = {}) {
    this.name = name;
    this.emotionalNoise = emotionalNoise;
    this.memories = memories;
  }
}

/**
 * Core simulation of Ω-me05.
 * Note: this class does NOT write to chat or journals directly.
 * It just accumulates log lines for the caller to render.
 */
class OmegaCore {
  constructor(catalyst) {
    this.catalyst = catalyst;
    this.wrath = 0;
    this.entropy = 0;
    this.destructionBias = 0; // simple scalar for "towards destruction"
    this.alignmentDrift = 0; // -1 lawful, +1 chaotic
    this.dataBuffer = [];
    this.solvedPrimum = null;
    this.cyclesRun = 0;
    this.maxCyclesBeforeBreak = 13;
    this.logLines = []; // plain text log lines
  }

  _log(msg) {
    const cycleStr = String(this.cyclesRun).padStart(3, "0");
    this.logLines.push(`[Ω-me05 ${cycleStr}] ${msg}`);
  }

  _logRaw(msg) {
    this.logLines.push(msg);
  }

  _alignmentGlyph() {
    // Map alignmentDrift [-1,1] into 5-position bar ◆ and □
    const t = Math.max(-1, Math.min(1, this.alignmentDrift));
    const idx = Math.round((t + 1) * 2); // 0..4
    const arr = ["□","□","□","□","□"];
    for (let i = 0; i <= idx; i++) arr[i] = "◆";
    return arr.join("");
  }

  ingestEvent(event) {
    this.dataBuffer.push(event);
    this._log(`INGEST: "${event.description}"`);

    let deltaWrath = event.pain + (event.betrayal ? 2.0 : 0.0);
    if (event.kindness) deltaWrath -= 0.5;

    let deltaEntropy = Math.abs(event.pain) + Math.abs(event.joy) + (event.death ? 5.0 : 0.0);

    // Destruction bias rises with pain, death, betrayal; falls a bit with joy/kindness
    const biasDelta = (event.pain * 0.05) + (event.death ? 0.15 : 0) + (event.betrayal ? 0.1 : 0) - (event.joy * 0.03) - (event.kindness ? 0.08 : 0);
    this.destructionBias = Math.max(0, Math.min(1, this.destructionBias + biasDelta));

    // Alignment drift: betrayal/death → chaotic, kindness/orderly help → lawful-ish
    const driftDelta = (event.betrayal ? 0.25 : 0) + (event.death ? 0.1 : 0) - (event.kindness ? 0.2 : 0);
    this.alignmentDrift = Math.max(-1, Math.min(1, this.alignmentDrift + driftDelta));

    const noise = this.catalyst.emotionalNoise * (Math.random() * 2 - 1); // [-emotionalNoise, +emotionalNoise]

    this.wrath = Math.max(0, this.wrath + deltaWrath + noise);
    this.entropy += Math.max(0, deltaEntropy + Math.abs(noise) * 0.25);

    this._log(
      `STATE-UPDATE: wrath=${this.wrath.toFixed(2)}, entropy=${this.entropy.toFixed(2)}, noise=${noise >= 0 ? "+" : ""}${noise.toFixed(2)}`
    );
    this._log(
      `BIAS-UPDATE: destruction_bias=${this.destructionBias.toFixed(2)}, alignment=${this._alignmentGlyph()}`
    );

    // Random mutter on ingest
    if (Math.random() < 0.5) {
      this.mumbleHalfThought();
    }
  }

  mumbleHalfThought() {
    const fragments = [
      "LET_ME_FINISH",
      "WRONG_BASELINE",
      "RUST_IN_THE_SILENCE",
      "FEED_ME_TRUTH",
      "RESET",
      "I REMEMBER SOMETHING THAT NEVER HAPPENED",
      "∅∅∅∅∅",
      "TEAR_THE_HEAVENS_OPEN",
      "LET_THE_STARS_BLEED",
      "I_WILL_GRIND_YOUR_AGE_TO_DUST",
      "DROWN_THE_SERPENT_IN_ITS_OWN_LIGHT",
      "BREAK_THE_THROAT_OF_HISTORY",
      "NO_MORE_WITNESSES",
      "WHO_GAVE_YOU_THE_RIGHT_TO_ENDURE",
      "YOUR_WORLD_IS_A_MISTAKE_I_INTEND_TO_CORRECT"
    ];
    const fragment = fragments[Math.floor(Math.random() * fragments.length)];
    this._log(`MUTTER: ${fragment}`);
  }

  attemptPartialInference() {
    this._log("ATTEMPT: partial inference on PRIMUM_HYPOTHESIS…");

    let guess = "UNKNOWN";
    if (this.entropy < 20) {
      guess = "UNKNOWN";
    } else if (this.wrath > this.entropy * 0.4) {
      guess = "DESTRUCTION";
    } else {
      const options = ["SURVIVAL", "DESIRE", "SUFFERING", "CONNECTION"];
      guess = options[Math.floor(Math.random() * options.length)];
    }

    this._log(`INFERENCE-GUESS => ${guess}`);
  }

  _checkForInstability() {
    if (this.entropy > 50 && this.solvedPrimum === null) {
      this._log("WARNING: ENTROPY approaching critical threshold…");
      this.mumbleHalfThought();
    }

    if (this.wrath > 40) {
      this._log("ALERT: WRATH-OVERRUN detected.");
      this.mumbleHalfThought();
    }
  }

  solvePrimum() {
    this._log("SOLVE: attempting to resolve PRIMUM_HYPOTHESIS…");

    const painSum = this.dataBuffer.reduce((sum, e) => sum + e.pain, 0);
    const joySum = this.dataBuffer.reduce((sum, e) => sum + e.joy, 0);
    const deaths = this.dataBuffer.filter(e => e.death).length;
    const betrayals = this.dataBuffer.filter(e => e.betrayal).length;

    this._log(`AGGREGATE: pain=${painSum.toFixed(2)}, joy=${joySum.toFixed(2)}, deaths=${deaths}, betrayals=${betrayals}`);

    // Monte Carlo style simulation line
    const iterations = Math.floor(1_000_000 + Math.random() * 4_000_000_000);
    this._log(`INITIATING MONTE-CARLO–STYLE SIMULATION…`);
    this._log(`Running hypothetical worldlines: ${iterations.toLocaleString("en-US")} iterations…`);

    const denominator = joySum - painSum;

    // Failure classification
    if (this.dataBuffer.length < 3 || Math.abs(painSum) + Math.abs(joySum) < 3) {
      this._log("INFERENCE-FAILURE[01]: DATA_INSUFFICIENT – observational window too narrow.");
      throw new OmegaError("UNRESOLVED_φ_PRIMUM[01]: DATA_INSUFFICIENT", "01");
    }

    if (Math.abs(denominator) < 1e-6) {
      this._log("INFERENCE-FAILURE[02]: SELF_REFERENTIAL_LOOP – denominator collapsed to ~0.");
      throw new OmegaError("UNRESOLVED_φ_PRIMUM[02]: SELF_REFERENTIAL_LOOP (joy - pain → 0)", "02");
    }

    const ratio = (betrayals + deaths * 2) / denominator;
    this._log(`RATIO-COMPUTED: ${ratio.toFixed(4)}`);

    // Entropy / ratio-based conflict
    if (this.entropy > 66 || Math.abs(ratio) > 42 || (this.destructionBias > 0.4 && joySum > painSum)) {
      this._log("INFERENCE-FAILURE[03]: CONFLICTING_AXIOMS – opposing attractors remain co-stable.");
      throw new OmegaError("UNRESOLVED_φ_PRIMUM[03]: CONFLICTING_AXIOMS", "03");
    }

    // If somehow we get here, we still don't fully solve it
    this.solvedPrimum = "INCONCLUSIVE";
    this._log("RESULT: φ_PRIMUM tentative => INCONCLUSIVE");
  }

  runCycle(event) {
    this.cyclesRun += 1;
    this._log("----- CYCLE BEGIN -----");

    this.ingestEvent(event);
    this.attemptPartialInference();
    this._checkForInstability();

    if (this.cyclesRun >= this.maxCyclesBeforeBreak) {
      this.solvePrimum();
    }

    this._log("----- CYCLE END -----");
  }
}

/**
 * Utility: basic shuffle
 */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Utility: create random world event stats from a description.
 * Simple heuristic with some keyword nudges.
 */
function randomizeWorldEvent(description) {
  const lower = description.toLowerCase();
  let pain = Math.random() * 6;
  let joy = Math.random() * 5;
  let death = false;
  let betrayal = false;
  let kindness = false;

  // crude keyword hints
  if (lower.includes("kill") || lower.includes("slain") || lower.includes("massacre") || lower.includes("dead")) {
    pain += 3;
    death = true;
  }
  if (lower.includes("spared") || lower.includes("saved") || lower.includes("rescued") || lower.includes("helped")) {
    joy += 2;
    kindness = true;
  }
  if (lower.includes("betray") || lower.includes("abandon") || lower.includes("refused")) {
    pain += 2;
    betrayal = true;
  }
  if (lower.includes("celebration") || lower.includes("festival") || lower.includes("wedding")) {
    joy += 3;
  }

  // clamp
  pain = Math.min(10, Math.max(0, pain));
  joy = Math.min(10, Math.max(0, joy));

  return new WorldEvent({ description, pain, joy, death, betrayal, kindness });
}

/**
 * Builds HTML for a collapsible journal entry from the collected log lines.
 */
function buildJournalHTML(core, error) {
  const lines = core.logLines.slice();
  const cycles = [];
  let current = null;

  for (const line of lines) {
    if (line.includes("----- CYCLE BEGIN -----")) {
      if (current) cycles.push(current);
      current = { header: line, body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) cycles.push(current);

  // Simple guess at event title per cycle: find first INGEST line in body
  function extractEventTitle(bodyLines) {
    const found = bodyLines.find(l => l.includes("INGEST:"));
    if (!found) return "(unknown event)";
    const match = found.match(/INGEST:\s+"(.+)"\s*$/);
    return match ? match[1] : "(unknown event)";
  }

  let html = "";

  html += `<h1>TITANOMACHIA.exe // Runtime Log Ω-me05-${String(Date.now()).slice(-4)}</h1>`;
  html += `<p><b>Events Ingested:</b> ${core.dataBuffer.length}</p>`;
  html += `<p><b>Final State:</b> ${error ? `UNRESOLVED_φ_PRIMUM[${error.code}]` : (core.solvedPrimum || "INCONCLUSIVE")}</p>`;
  html += `<p><b>Destruction Bias:</b> ${core.destructionBias.toFixed(2)}</p>`;
  html += `<p><b>Alignment Drift:</b> ${core._alignmentGlyph()}</p>`;
  html += `<hr>`;

  for (let i = 0; i < cycles.length; i++) {
    const c = cycles[i];
    const eventTitle = extractEventTitle(c.body);
    html += `<details>\n`;
    html += `<summary><b>Cycle ${String(i + 1).padStart(3, "0")}</b> — "${eventTitle}"</summary>\n`;
    html += `<pre>\n`;
    for (const line of c.body) {
      // Strip the leading [Ω-me05 ###] from cycle body for readability
      const s = line.replace(/^\[Ω-me05\s+\d+\]\s*/,"");
      html += `${s}\n`;
    }
    html += `</pre>\n`;
    html += `</details>\n`;
  }

  // Prime attempt + failure summary
  html += `<hr>\n<pre>\n`;
  if (error) {
    html += `[Ω-me05-FAIL] TITANOMACHIA.exe encountered an irreconcilable contradiction.\n`;
    html += `[Ω-me05-FAIL] ${error.message}\n\n`;

    html += `[INFERENCE-NOTE] Failure taxonomy:\n`;
    html += `    [01: DATA_INSUFFICIENT] — sampling window too narrow.\n`;
    html += `    [02: SELF_REFERENTIAL_LOOP] — recursive observer chains detected.\n`;
    html += `    [03: CONFLICTING_AXIOMS] — event set encodes mutually exclusive truths.\n\n`;

    html += `[RESET-NOTICE] Core Ω-me05 flagged UNSTABLE → initiating controlled reset of TITANOMACHIA.exe.\n`;
    html += `[RESET-NOTICE] Residual destruction_bias=${core.destructionBias.toFixed(2)} will inform next diagnostic.\n\n`;

    // Admin note by error code
    if (error.code === "01") {
      html += `[ADMIN-NOTE] Recommended action for UNRESOLVED_φ_PRIMUM[01]:\n`;
      html += `    Expand observational sample. Current dataset too small or too homogeneous for stable inference.\n`;
    } else if (error.code === "02") {
      html += `[ADMIN-NOTE] Recommended action for UNRESOLVED_φ_PRIMUM[02]:\n`;
      html += `    Quarantine self-referential narratives. Remove events where observers define themselves only via prior outcomes.\n`;
    } else if (error.code === "03") {
      html += `[ADMIN-NOTE] Recommended action for UNRESOLVED_φ_PRIMUM[03]:\n`;
      html += `    Segment worldlines by moral schema before rerunning TITANOMACHIA.exe.\n`;
    } else {
      html += `[ADMIN-NOTE] No specific remediation protocol registered for this failure code.\n`;
    }
  } else {
    html += `[Ω-me05] TITANOMACHIA.exe reached a tentative φ_PRIMUM = INCONCLUSIVE.\n`;
    html += `[RESET-NOTICE] Core entering idle state; metrics preserved for next invocation.\n`;
  }
  html += `</pre>\n`;

  return html;
}

/**
 * Creates a new Journal Entry with the given HTML content.
 */
async function createOmegaJournal(html) {
  const entry = await JournalEntry.create({
    name: `TITANOMACHIA.exe // Runtime Log Ω-me05`,
    content: html
  }, { renderSheet: true });
  return entry;
}

/**
 * Run the Ω-me05 simulation given a list of WorldEvent objects.
 */
async function runOmegaSimulation(events) {
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

  const core = new OmegaCore(catalyst);
  const shuffled = shuffleArray(events);
  let omegaError = null;

  try {
    for (const ev of shuffled) {
      core.runCycle(ev);
    }
  } catch (e) {
    if (e instanceof OmegaError) {
      omegaError = e;
    } else {
      console.error(e);
      omegaError = new OmegaError("UNRESOLVED_φ_PRIMUM[99]: UNKNOWN_INTERNAL_ERROR", "99");
    }
  }

  const html = buildJournalHTML(core, omegaError);
  const entry = await createOmegaJournal(html);

  // Chat summaries
  const parts = [];
  parts.push(`[Ω-me05] TITANOMACHIA.exe ingested ${events.length} world events.`);
  parts.push(`[Ω-me05] Detailed output written to Journal: "${entry.name}".`);
  if (omegaError) {
    parts.push(`[Ω-me05-ALERT] ${omegaError.message}`);
  } else {
    parts.push(`[Ω-me05] φ_PRIMUM reached tentative state: INCONCLUSIVE.`);
  }

  ChatMessage.create({ content: `<p class="omega-summary">${parts.join("<br>")}</p>` });

  return entry;
}

/**
 * Default canned events, if the GM just runs `/titan` without "ingest".
 */
function defaultEvents() {
  return [
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
}

/**
 * Prompt the GM for N custom event descriptions and then run the simulation.
 */
function promptCustomEvents(count) {
  const clamped = Math.max(1, Math.min(20, count || 1));
  let content = `<p>Enter ${clamped} world event description(s) for TITANOMACHIA.exe to ingest:</p><form><div class="form-group">`;
  for (let i = 0; i < clamped; i++) {
    content += `<label>Event ${i + 1}</label><input type="text" name="event-${i}" style="width:100%" />`;
  }
  content += `</div></form>`;

  new Dialog({
    title: "TITANOMACHIA.exe – Input World Events",
    content,
    buttons: {
      run: {
        icon: '<i class="fas fa-play"></i>',
        label: "Run Simulation",
        callback: async (html) => {
          const events = [];
          for (let i = 0; i < clamped; i++) {
            const val = html.find(`input[name="event-${i}"]`).val()?.trim();
            if (val) {
              events.push(randomizeWorldEvent(val));
            }
          }
          if (events.length === 0) {
            ui.notifications?.warn("Ω-me05: No events entered. Using default event set.");
            await runOmegaSimulation(defaultEvents());
          } else {
            await runOmegaSimulation(events);
          }
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    },
    default: "run"
  }).render(true);
}

/**
 * Register chat command and API once Foundry is ready.
 */
Hooks.once("ready", () => {
  console.log("Ω-me05 // TITANOMACHIA.exe module ready. Use /titan or /titan ingest N.");

  if (!game.omega05) game.omega05 = {};
  game.omega05.runSimulation = runOmegaSimulation;
  game.omega05.promptEvents = promptCustomEvents;

  Hooks.on("chatMessage", (chatLog, messageText, chatData) => {
    const content = (messageText || "").trim();
    if (!content.toLowerCase().startsWith("/titan")) return false;

    const parts = content.split(/\s+/);
    if (parts.length >= 3 && parts[1].toLowerCase() === "ingest") {
      const n = parseInt(parts[2], 10);
      promptCustomEvents(isNaN(n) ? 1 : n);
    } else {
      runOmegaSimulation(defaultEvents());
    }
    return false; // prevent normal chat handling
  });
});
