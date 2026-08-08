# ⚡ CHRONO ADVENTURE — AI MULTIVERSE

An original offline browser game built for a school/college AI bootcamp competition.

## Run
### One-click on Windows
1. Extract the ZIP.
2. Double-click **PLAY_GAME.bat**.
3. The game opens in your browser.

### VS Code
Open `index.html` with Live Server.

### GitHub Pages
Upload the project files to a GitHub repository and enable **Settings → Pages → Deploy from a branch → main → / (root)**. The resulting `github.io` URL is the public game link you can share.

No backend, paid assets, external libraries, or external APIs are required.

## Files
- `index.html` — screens, HUD, controls, editor
- `style.css` — responsive neon UI and accessibility styles
- `game.js` — Canvas game engine, collision, progression, saves, bosses, controls
- `audio.js` — Web Audio API procedural SFX/music
- `ai.js` — local rule-based adaptive Chrono AI
- `characters.js` — original hero data and Canvas character drawing
- `worlds.js` — world themes and tips
- `levels.js` — procedural/polished level layouts and world-specific mechanics
- `particles.js` — reusable particle system
- `editor.js` — local level editor with JSON import/export

## Controls
A/D or Arrow Keys = move  
Space = jump  
Shift = dash  
Q = Time Rewind  
E = hero ability / grapple-style ability  
F = element switch  
P = portal mode / portal travel  
M = minimap  
Esc = pause  
`~` = hidden developer mode

Touch buttons appear automatically on narrow screens. Basic browser Gamepad API support is also included.

## AI Feature
Chrono AI reads actual gameplay values such as health, enemies, nearby coins, remaining time, falls, damage and rewind usage. It produces contextual recommendations and tracks mistakes during the current session. Optional speech uses the browser SpeechSynthesis API.

## World / Hero System
Cartoon Kid starts unlocked in Cartoon Town. Other heroes/worlds unlock through progression. Each world changes the sky, architecture, platform palette, enemies, hazards, weather, level geometry, special mechanics and boss. Cartoon Town includes actual slide platforms that accelerate the player.

## Unique Features
Time rewind history, elemental switching, portals, energy, ability cooldowns, checkpoints, objectives, combo scoring, bosses, ghost runs, local leaderboard, achievements, cosmetics, profile, save/continue, difficulty, accessibility, fullscreen, gamepad support, dynamic weather particles, minimap, level editor, procedural Web Audio and original Canvas characters.

## Presentation tips
For the bootcamp:
1. Start in Cartoon Town and show the tutorial.
2. Demonstrate the slide speed boost.
3. Show Chrono AI reacting to low health or repeated mistakes.
4. Use Q to rewind after a mistake.
5. Switch element with F.
6. Defeat the boss and show results/AI score.
7. Unlock another world and show that its scenery, hazards, enemies and mechanics really change.
8. Open the profile, achievements, local leaderboard and level editor.

All characters, logos, names, art and audio patterns in this project are original and intentionally avoid copyrighted franchise assets.


## V2 Meme Feature
The game now includes an original **Chrono Meme System**:
- Press **T** during gameplay or click **😂 MEME** in the control bar.
- Generate random, enemy, battle, damage and boss memes.
- The meme automatically reacts to real gameplay moments such as taking damage or defeating an enemy.
- **📋 COPY** copies the generated meme text for sharing.
- No external meme images, copyrighted characters, or paid assets are used.


## V3 Theme + Interest Upgrade
- Each world now has a stronger visual identity with themed scenery and interactive-looking props.
- Cartoon Town: school, houses, park, swings, puddles, slides and bounce flowers.
- City Rooftops: skyscrapers, neon signs, fire escapes, drones, helicopters and grapple points.
- Magic Castle: castle towers, enchanted forest, floating books, crystals and an enchanted flower-jump garden.
- Ninja Village: moon, bamboo, lanterns, pagoda-style silhouettes, rooftops and rope bridges.
- Neon Future City: cyber towers, holograms, digital rain, energy platforms and laser gates.
- Sky Islands: giant clouds, floating islands and airships.
- Added adaptive Chrono AI personalities, themed enemy taunts, random Chrono Challenges and a Time Paradox event system.
- Added interactive theme mechanics including enchanted flower jumps and themed platform visuals.


### Tutorial fix
The first-time tutorial now advances automatically when actions are performed and also includes NEXT and SKIP TUTORIAL controls.
