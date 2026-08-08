const HEROES = [

    {
        id: "cartoon",
        name: "🧒 CHRONO KID",
        world: "town",
        emoji: "🧒",
        difficulty: "EASY",
        special: "Gadget Dash",
        energy: 120,
        price: 0,
        unlock: "FREE",
        abilities: [
            "Gadget Dash",
            "Funny Bounce",
            "Slide Boost",
            "Balloon Jump"
        ]
    },

    {
        id: "web",
        name: "🕷️ WEB HERO",
        world: "city",
        emoji: "🕷️",
        difficulty: "NORMAL",
        special: "Web Grapple",
        energy: 110,
        price: 50,
        unlock: "50 COINS",
        abilities: [
            "Web Swing",
            "Wall Climb",
            "Air Dash",
            "Web Grapple"
        ]
    },

    {
        id: "magic",
        name: "🪄 MAGIC STUDENT",
        world: "castle",
        emoji: "🪄",
        difficulty: "NORMAL",
        special: "Arcane Blink",
        energy: 100,
        price: 100,
        unlock: "100 COINS",
        abilities: [
            "Magic Spell",
            "Shield",
            "Teleport",
            "Floating Broom"
        ]
    },

    {
        id: "ninja",
        name: "🥷 SHADOW NINJA",
        world: "ninja",
        emoji: "🥷",
        difficulty: "HARD",
        special: "Shadow Dash",
        energy: 95,
        price: 150,
        unlock: "150 COINS",
        abilities: [
            "Double Jump",
            "Wall Jump",
            "Invisibility",
            "Shadow Dash"
        ]
    },

    {
        id: "runner",
        name: "⚡ LIGHTNING RUNNER",
        world: "neon",
        emoji: "⚡",
        difficulty: "HARD",
        special: "Time Freeze",
        energy: 130,
        price: 200,
        unlock: "200 COINS",
        abilities: [
            "Super Speed",
            "Lightning Dash",
            "Time Freeze"
        ]
    },

    {
        id: "pirate",
        name: "🏴‍☠️ SKY PIRATE",
        world: "sky",
        emoji: "🏴‍☠️",
        difficulty: "HARD",
        special: "Grappling Hook",
        energy: 115,
        price: 250,
        unlock: "250 COINS",
        abilities: [
            "Grappling Hook",
            "Rope Swing",
            "Air Dash"
        ]
    }

];


/* =========================================================
   CHARACTER DRAWING
   ========================================================= */

function drawHero(c, p, hero, t = 0, cam = { x: 0, y: 0 }) {

    if (!c || !p || !hero) return;

    const x = p.x - (cam.x || 0);
    const y = p.y - (cam.y || 0);

    const run = Math.abs(p.vx || 0) > 1;
    const air = !p.onGround;

    c.save();

    /*
     * Keep character rendering stable.
     */
    c.translate(x, y);

    /* =========================
       SHADOW
       ========================= */

    c.shadowBlur =
        hero.id === "runner" ? 18 : 10;

    c.shadowColor =
        hero.id === "magic"
            ? "#a66cff"
            : "#000";

    c.fillStyle = "rgba(0,0,0,0.35)";

    c.beginPath();

    c.ellipse(
        0,
        30,
        19,
        6,
        0,
        0,
        Math.PI * 2
    );

    c.fill();

    c.shadowBlur = 0;


    /* =========================
       CHARACTER BOB
       ========================= */

    const bob = air
        ? 0
        : Math.sin(
            t * (
                run
                    ? 0.03
                    : 0.012
            )
        ) * 2;

    c.translate(0, bob);


    /* =========================
       LEGS
       ========================= */

    const leg =
        Math.sin(
            t * (
                run
                    ? 0.04
                    : 0.018
            )
        ) * 6;

    c.strokeStyle = "#171724";
    c.lineWidth = 6;
    c.lineCap = "round";

    c.beginPath();

    c.moveTo(-6, 17);
    c.lineTo(-9 + leg, 30);

    c.moveTo(6, 17);
    c.lineTo(9 - leg, 30);

    c.stroke();


    /* =========================
       BODY
       ========================= */

    const bodyColors = {

        cartoon: "#ff8f4d",

        web: "#202c6b",

        magic: "#4f2b9d",

        ninja: "#252738",

        runner: "#28bfe8",

        pirate: "#9a5635"

    };

    const body =
        bodyColors[hero.id] ||
        "#ff8f4d";

    c.fillStyle = body;

    c.beginPath();

    c.roundRect(
        -14,
        -13,
        28,
        33,
        8
    );

    c.fill();


    /* =========================
       WEB HERO
       ========================= */

    if (hero.id === "web") {

        c.strokeStyle = "#eaf5ff";
        c.lineWidth = 1.5;

        c.beginPath();

        c.moveTo(-12, -5);
        c.lineTo(12, 10);

        c.moveTo(12, -5);
        c.lineTo(-12, 10);

        c.moveTo(0, -13);
        c.lineTo(0, 20);

        c.stroke();
    }


    /* =========================
       MAGIC STUDENT
       ========================= */

    if (hero.id === "magic") {

        // Hat

        c.fillStyle = "#17112e";

        c.beginPath();

        c.moveTo(-16, -8);
        c.lineTo(16, -8);
        c.lineTo(11, -16);
        c.lineTo(-11, -16);

        c.closePath();

        c.fill();


        // Wand

        c.strokeStyle = "#e4caff";
        c.lineWidth = 3;

        c.beginPath();

        c.moveTo(12, -10);
        c.lineTo(20, 8);

        c.stroke();
    }


    /* =========================
       NINJA
       ========================= */

    if (hero.id === "ninja") {

        c.fillStyle = "#e44b57";

        c.fillRect(
            -13,
            -10,
            26,
            5
        );
    }


    /* =========================
       RUNNER
       ========================= */

    if (hero.id === "runner") {

        c.strokeStyle = "#b9ffff";
        c.lineWidth = 3;

        c.strokeRect(
            -11,
            -10,
            22,
            25
        );
    }


    /* =========================
       PIRATE
       ========================= */

    if (hero.id === "pirate") {

        // Hat

        c.fillStyle = "#17131b";

        c.beginPath();

        c.arc(
            0,
            -27,
            14,
            Math.PI,
            0
        );

        c.lineTo(12, -20);
        c.lineTo(-12, -20);

        c.closePath();

        c.fill();


        // Hat band

        c.fillStyle = "#d8b07b";

        c.fillRect(
            -12,
            -21,
            24,
            3
        );
    }


    /* =========================
       FACE
       ========================= */

    c.fillStyle = "#f6c99b";

    c.beginPath();

    c.arc(
        0,
        -22,
        12,
        0,
        Math.PI * 2
    );

    c.fill();


    /* Eyes */

    c.fillStyle = "#17172a";

    c.beginPath();

    c.arc(
        -4,
        -23,
        2,
        0,
        Math.PI * 2
    );

    c.arc(
        5,
        -23,
        2,
        0,
        Math.PI * 2
    );

    c.fill();


    /* Smile */

    c.strokeStyle = "#17172a";
    c.lineWidth = 1.8;

    c.beginPath();

    c.arc(
        0,
        -19,
        5,
        0,
        Math.PI
    );

    c.stroke();


    /* Shirt highlight */

    c.fillStyle = "#ffffff";

    c.fillRect(
        -13,
        3,
        26,
        4
    );


    /* =========================
       SELECTED CHARACTER GLOW
       ========================= */

    if (hero.id === "magic") {

        c.strokeStyle =
            "rgba(180,120,255,0.45)";

        c.lineWidth = 2;

        c.beginPath();

        c.arc(
            0,
            -5,
            25,
            0,
            Math.PI * 2
        );

        c.stroke();
    }


    c.restore();
}
