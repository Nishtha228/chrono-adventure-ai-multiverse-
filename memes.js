(() => {
"use strict";

const MemeSystem = (() => {
  const sets = {
    damage: [
      ["ME: I can handle this.", "ENEMY: That confidence lasted 0.4 seconds."],
      ["ME: One more hit and I'm fine.", "ENEMY: One more hit? Bet."],
      ["CHRONO AI: Use SHIELD.", "ME: I have a better plan.", "THE PLAN: 💀"]
    ],
    enemyDefeat: [
      ["ENEMY: You cannot defeat me!", "ME: Press E.", "ENEMY: ...oh."],
      ["ENEMY: Phase 2!", "ME: Counterpoint: coins."],
      ["ME: GG.", "ENEMY: I was lagging."],
      ["BOSS: You are not ready.", "ME: I literally rewound time."]
    ],
    fall: [
      ["ME: This shortcut is genius.", "THE VOID: Thanks for visiting."],
      ["ME: I meant to do that.", "CHRONO AI: No, you did not."]
    ],
    boss: [
      ["BOSS: FEAR ME.", "ME: Loading strategy...", "ME: Rewind."],
      ["BOSS: I have 3 phases.", "ME: I have 3 rewinds."]
    ],
    coin: [
      ["ME: Just one coin.", "15 seconds later: 🪙🪙🪙🪙🪙"],
      ["CHRONO AI: Goal ahead.", "ME: But that coin is shiny."]
    ],
    portal: [
      ["ME: I know where this portal goes.", "PORTAL: You absolutely do not."],
      ["BLUE PORTAL: Entrance.", "ORANGE PORTAL: Exit.", "ME: Trust the science."]
    ],
    random: [
      ["CHRONO AI: Recommended route: left.", "ME: Right it is."],
      ["ME: I am speed.", "ENEMY: You are also lost."],
      ["TIME: 00:08", "ME: Plenty of time.", "CHRONO AI: 😐"],
      ["BOSS MUSIC STARTS", "ME: Why is the music suddenly personal?"],
      ["ME: This level is easy.", "LEVEL: Cute."]
    ]
  };

  let current = null;

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function pick(type = "random") {
    const list = sets[type] || sets.random;
    return list[Math.floor(Math.random() * list.length)];
  }

  function getVisual(type, hero, enemy) {
    if (type === "enemy") return enemy?.emoji || "👹";
    if (type === "battle") return `${hero?.emoji || "🧒"} ⚔️ ${enemy?.emoji || "👹"}`;
    return hero?.emoji || "🧒";
  }

  function open(type = "random", ctx = {}) {
    const panel = document.querySelector("#memePanel");
    if (!panel) return;
    const lines = pick(type);
    current = { type, lines, hero: ctx.hero, enemy: ctx.enemy };
    const enemyName = ctx.enemy?.name || "TIME GLITCH";
    document.querySelector("#memeHeroVisual").textContent = getVisual(type, ctx.hero, ctx.enemy);
    document.querySelector("#memeTitle").textContent =
      type === "enemy" ? `😂 ENEMY MEME — ${enemyName}` :
      type === "battle" ? "😂 MEME BATTLE" : "😂 CHRONO MEME MOMENT";
    document.querySelector("#memeLines").innerHTML = lines.map((line, i) =>
      `<div class="meme-line ${i === 0 ? "meme-top" : ""}">${escape(line)}</div>`
    ).join("");
    document.querySelector("#memeTag").textContent =
      type === "damage" ? "YOU GOT BONKED" :
      type === "enemyDefeat" ? "ENEMY GOT COOKED" :
      type === "boss" ? "BOSS ENERGY" :
      type === "portal" ? "PORTAL CONFUSION" :
      "MULTIVERSE MOMENT";
    panel.classList.remove("hidden");
  }

  function close() {
    document.querySelector("#memePanel")?.classList.add("hidden");
  }

  async function copy() {
    if (!current) return;
    const text = `😂 CHRONO ADVENTURE MEME\n${current.lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      window.dispatchEvent(new CustomEvent("chrono-toast", { detail: "📋 Meme copied!" }));
    } catch {
      window.dispatchEvent(new CustomEvent("chrono-toast", { detail: "📋 Meme text ready!" }));
    }
  }

  function random(ctx) { open("random", ctx); }
  function init() {
    document.querySelectorAll("[data-meme]").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.meme;
        if (type === "close") close();
        else if (type === "copy") copy();
        else {
          const ctx = window.ChronoGame?.getMemeContext?.() || {};
          open(type, ctx);
        }
      });
    });
  }

  return { init, open, close, random };
})();

window.MemeSystem = MemeSystem;
document.addEventListener("DOMContentLoaded", MemeSystem.init);
})();
