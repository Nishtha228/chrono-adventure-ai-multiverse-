(() => {
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$("#gameCanvas"),ctx=canvas.getContext("2d"),minimap=$("#minimap"),mctx=minimap.getContext("2d");
const SAVEKEY="chrono_adventure_save_v2";
const defaults={name:"Chrono Cadet",coins:0,gems:0,score:0,unlockedHeroes:["cartoon"],unlockedWorlds:["town"],achievements:[],bestTimes:{},bestScores:{},completedLevels:0,fragments:0,bosses:0,rewinds:0,skins:[],equipped:{},difficulty:"NORMAL",settings:{sound:true,music:true,particles:true,shake:true,voice:false,contrast:false,reduced:false,large:false,aiSize:15},tutorial:false,leaderboard:[],playTime:0};
let save=loadSave(),state="menu",hero=HEROES[0],world=WORLDS[0],level=null,p={x:70,y:380,vx:0,vy:0,w:26,h:45,onGround:false,hp:100,maxHp:100,lives:3,energy:100,element:"FIRE",shield:0,rewinds:3,checkpointX:70,checkpointY:380,slide:0,score:0,coins:0,enemies:0,startTime:0,history:[],ghost:null,ghostIndex:0,combo:0,comboTimer:0,invuln:0,abilityCD:0,portalMode:false,bluePortal:null,orangePortal:null,freeze:0};
let keys={},touch={},cam={x:0,y:0},particles=new ParticleSystem(),ai=new ChronoAI(),last=performance.now(),acc=0,fps=60,paused=false,levelWorldIndex=0,levelIndex=0,loadingTimer=0,tutorialStep=0,shake=0,gamepadConnected=false;
const settings=save.settings;
function loadSave(){try{return {...defaults,...JSON.parse(localStorage.getItem(SAVEKEY)||"{}"),settings:{...defaults.settings,...(JSON.parse(localStorage.getItem(SAVEKEY)||"{}").settings||{})}}}catch(e){localStorage.removeItem(SAVEKEY);return {...defaults,settings:{...defaults.settings}}}}
function persist(){try{localStorage.setItem(SAVEKEY,JSON.stringify(save))}catch(e){}}
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
addEventListener("resize",resize);resize();
function show(id){$$(".screen").forEach(s=>s.classList.remove("active"));if(id==="game"||id==="#hud"){ $("#hud").classList.remove("hidden"); return; } if(id){$(id).classList.add("active")}$("#hud").classList.add("hidden");}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1000)}
window.addEventListener("chrono-toast",e=>toast(e.detail));
window.ChronoGame={getMemeContext:()=>({
  hero,
  enemy: level?.enemies?.find(e=>e.alive && Math.abs(e.x-p.x)<260) || level?.boss
})};
function openMeme(type="random"){if(window.MemeSystem)MemeSystem.open(type,window.ChronoGame.getMemeContext());}
function themeEvent(title,sub="",ms=1800){
 const el=$("#eventBanner");if(!el)return;el.innerHTML=`${title}${sub?`<small>${sub}</small>`:""}`;el.classList.remove("hidden");
 clearTimeout(themeEvent._t);themeEvent._t=setTimeout(()=>el.classList.add("hidden"),ms);
}
function updateChallengeUI(){
 const c=level?.challenge,el=$("#challengeText");if(!c||!el)return;
 let progress="";
 if(c.type==="coins")progress=` ${Math.min(c.target,p.coins)}/${c.target}`;
 else if(c.type==="nodamage")progress=p.hp===p.maxHp?" — PERFECT":" — DAMAGE TAKEN";
 else if(c.type==="rewind")progress=` ${p.rewinds<3?1:0}/1 used`;
 el.textContent=`${c.text}${progress}`;
}


function unlockedHero(h){return h.id==="cartoon"||save.unlockedHeroes.includes(h.id)}
function unlockedWorld(w){return save.unlockedWorlds.includes(w.id)}
function renderHeroes(){const el=$("#heroCards");el.innerHTML="";const coins=save.coins;HEROES.forEach(h=>{const ok=unlockedHero(h),selected=hero.id===h.id,d=document.createElement("div");d.className="card "+(selected?"selected ":"")+(ok?"":"locked");const canBuy=!ok&&coins>=h.price;d.innerHTML=`<div class="portrait">${h.emoji}</div><h2>${h.name}</h2><div>${h.difficulty} • ${h.special}</div><p>${ok?"✅ OWNED • "+h.abilities.join(" • "):"🔒 "+h.price+" COINS"}</p><div class="chips">${h.abilities.map(a=>`<span class="chip">${a}</span>`).join("")}</div><button ${ok?"":"disabled"} data-preview="${h.id}">${ok?(selected?"✓ SELECTED":"SELECT"):(canBuy?"🪙 BUY FOR "+h.price:"🔒 NEED "+h.price+" COINS")}</button>`;
 d.querySelector("button").onclick=(ev)=>{ev.stopPropagation();if(ok){hero=h;save.equipped.hero=h.id;persist();renderHeroes();toast("🎮 "+h.name+" SELECTED")}else if(canBuy){save.coins-=h.price;save.unlockedHeroes.push(h.id);hero=h;save.equipped.hero=h.id;persist();renderHeroes();toast("🛒 "+h.name+" UNLOCKED!")}else toast("🪙 Need "+(h.price-coins)+" more coins")};el.appendChild(d)})}
function renderWorlds(){const el=$("#worldCards");el.innerHTML="";WORLDS.forEach(w=>{const ok=unlockedWorld(w),d=document.createElement("div");d.className="card "+(world.id===w.id?"selected ":"")+(ok?"":"locked");d.innerHTML=`<div class="portrait">${w.name.split(" ")[0]}</div><h2>${w.name}</h2><p>${ok?"🌍 "+w.weather+" • "+w.day:"🔒 "+w.unlock}</p><p>${ok?WORLD_TIPS[w.id]:"Complete the required progression to unlock."}</p>`;d.onclick=()=>{if(ok){world=w;levelWorldIndex=WORLDS.indexOf(w);$("#selectedWorldText").textContent="SELECTED WORLD: "+w.name;renderWorlds()}};el.appendChild(d)})}
function openSettings(){["Sound","Music","Particles","Shake","Voice","Contrast","Reduced","Large"].forEach(k=>{$("#set"+k).checked=settings[k.toLowerCase()]});$("#setDifficulty").value=save.difficulty;$("#setAiSize").value=settings.aiSize; if($("#setAiPersonality"))$("#setAiPersonality").value=settings.aiPersonality||"GUIDE";$("#settingsPanel").classList.remove("hidden")}
function closeSettings(){settings.sound=$("#setSound").checked;settings.music=$("#setMusic").checked;settings.particles=$("#setParticles").checked;settings.shake=$("#setShake").checked;settings.voice=$("#setVoice").checked;settings.contrast=$("#setContrast").checked;settings.reduced=$("#setReduced").checked;settings.large=$("#setLarge").checked;settings.aiSize=+$("#setAiSize").value; settings.aiPersonality=$("#setAiPersonality")?.value||"GUIDE";save.difficulty=$("#setDifficulty").value;persist();document.body.classList.toggle("high-contrast",settings.contrast);document.body.classList.toggle("reduced-motion",settings.reduced);document.body.classList.toggle("large-ui",settings.large);AudioFX.setEnabled(settings.sound);AudioFX.setMusic(settings.music);$("#settingsPanel").classList.add("hidden")}
function startFlow(){show("#screen-heroes");renderHeroes()}
function startLoading(){levelIndex=0;loadingTimer=0;$("#loadingText").textContent="🌍 Loading "+world.name+"...";$("#loadingTip").textContent="TIP: "+WORLD_TIPS[world.id];show("#screen-loading");requestAnimationFrame(loadAnim)}
function loadAnim(t){if(state!=="loading")state="loading";loadingTimer+=1;$("#loadProgress").style.width=Math.min(100,loadingTimer*2)+"%";if(loadingTimer<50)requestAnimationFrame(loadAnim);else startIntro()}
function startIntro(){state="intro";$("#introWorld").textContent=world.name;$("#introLevel").textContent="LEVEL "+(levelIndex+1)+": "+(["TIME TOWN","PLAYGROUND RIFT","ROOFTOP RIFT","CASTLE TRIAL"][levelIndex%4]);$("#introObjective").textContent="OBJECTIVE: Reach the Chrono Portal and defeat the boss.";show("#screen-intro")}
function beginLevel(){level=makeLevel(levelWorldIndex,levelIndex,save.difficulty);p={...p,x:70,y:380,vx:0,vy:0,hp:level.diff.hp,maxHp:level.diff.hp,lives:3,energy:hero.energy,rewinds:3,checkpointX:70,checkpointY:380,score:0,coins:0,enemies:0,startTime:performance.now(),history:[],ghost:loadGhost(),ghostIndex:0,combo:0,comboTimer:0,invuln:0,abilityCD:0,portalMode:false,bluePortal:null,orangePortal:null,freeze:0,slide:0,onGround:false};particles.a=[];ai=new ChronoAI();state="game";paused=false;$("#pauseOverlay").classList.add("hidden");show("#hud");AudioFX.startMusic("normal");updateHUD();if(!save.tutorial)startTutorial();else requestAnimationFrame(loop)}
function startTutorial(){state="game";tutorialStep=0;show("#hud");$("#screen-tutorial").classList.add("active");tutorialUpdate();requestAnimationFrame(loop)}
function tutorialUpdate(){const steps=[["MOVEMENT","Hold A / D to move.","A or D"],["JUMP","Press SPACE to jump.","SPACE"],["DASH","Press SHIFT to dash.","SHIFT"],["ABILITY","Press E to use your hero ability.","E"],["REWIND","Press Q to rewind recent time.","Q"],["ELEMENT","Press F to switch element.","F"],["PORTAL","Press P to enter portal mode.","P"],["COLLECT","Collect a coin.","COIN"],["ENEMY","Touch an enemy or defeat one.","ENEMY"],["CHECKPOINT","Reach the checkpoint.","CHECKPOINT"],["FINISH","Reach the finish after the boss.","FINISH"]];const s=steps[tutorialStep];if(!s){save.tutorial=true;persist();$("#screen-tutorial").classList.remove("active");state="game";show("#hud");requestAnimationFrame(loop);return}$("#tutorialTitle").textContent=s[0];$("#tutorialText").textContent=s[1];$("#tutorialAction").textContent="Required action: "+s[2];$("#tutorialProgress").style.width=(tutorialStep/steps.length*100)+"%"}
function tutorialEvent(type){const map=["move","jump","dash","ability","rewind","element","portal","coin","enemy","checkpoint","finish"];if(type===map[tutorialStep]){tutorialStep++;tutorialUpdate()}}
function bestAbility(){return hero.special}
function keyDown(e){keys[e.key.toLowerCase()]=true;if([" ","arrowleft","arrowright"].includes(e.key.toLowerCase()))e.preventDefault();if(e.key==="Escape"){if(state==="game")togglePause();else if($("#settingsPanel").classList.contains("hidden")===false)closeSettings()}if(e.key==="m")$("#minimapWrap").classList.toggle("hidden");if(e.key==="t"&&state==="game"&&!paused)openMeme("random");if(e.key==="~"){dev=!dev;toast(dev?"DEV MODE ON":"DEV MODE OFF")}}
function keyUp(e){keys[e.key.toLowerCase()]=false}
let lastMemeAt=0;let dev=false;addEventListener("keydown",keyDown);addEventListener("keyup",keyUp);
function bindTouch(){document.querySelectorAll("[data-touch]").forEach(b=>{const k=b.dataset.touch;b.addEventListener("pointerdown",e=>{e.preventDefault();touch[k]=true});b.addEventListener("pointerup",()=>touch[k]=false);b.addEventListener("pointercancel",()=>touch[k]=false);b.addEventListener("pointerleave",()=>touch[k]=false)})}bindTouch();
function actionDown(k){return !!keys[k]||!!touch[k]}
let prev={};function pressed(k){const v=actionDown(k),r=v&&!prev[k];prev[k]=v;return r}
function togglePause(){if(state!=="game")return;paused=!paused;$("#pauseOverlay").classList.toggle("hidden",!paused);if(paused){AudioFX.stopMusic()}else{AudioFX.startMusic("normal");last=performance.now();requestAnimationFrame(loop)}}
function activateAbility(){if(p.abilityCD>0||p.energy<18)return;p.energy-=18;p.abilityCD=hero.id==="ninja"?70:hero.id==="runner"?45:85;AudioFX.sfx(hero.id==="magic"?"power":"dash");particles.burst(p.x,p.y,"#8df");shake=8;if(hero.id==="web"||hero.id==="pirate"){const pt=nearestHook();if(pt){p.vx=(pt.x-p.x)*.04;p.vy=(pt.y-p.y)*.04}}else if(hero.id==="magic"){p.x+=p.vx*8;p.shield=180}else if(hero.id==="ninja"){p.vx*=2.8;p.invuln=100}else if(hero.id==="runner"){p.vx=12;p.freeze=80}else {p.vx*=2.2;p.vy=-8}tutorialEvent("ability")}
function nearestHook(){return level.platforms.filter(a=>a.hook).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0]}
function rewind(){if(p.rewinds<=0||p.history.length<5)return;p.rewinds--;save.rewinds++;ai.note("rewind");AudioFX.sfx("rewind");p.history=p.history.slice(-150);let frames=p.history.splice(Math.max(0,p.history.length-90),90).reverse();if(frames[0]){p.x=frames[0].x;p.y=frames[0].y;p.vx=-frames[0].vx;p.vy=-frames[0].vy}particles.burst(p.x,p.y,"#b98cff",35);toast("⏪ TIME REWIND");shake=10;tutorialEvent("rewind")}
function switchElement(){const a=["FIRE","ICE","GRAVITY"];p.element=a[(a.indexOf(p.element)+1)%3];AudioFX.sfx("power");toast("ELEMENT: "+p.element);tutorialEvent("element")}
function portal(){p.portalMode=!p.portalMode;AudioFX.sfx("portal");if(!p.portalMode&&p.bluePortal&&p.orangePortal){if(Math.abs(p.x-p.bluePortal.x)<35){p.x=p.orangePortal.x;p.y=p.orangePortal.y-40}else if(Math.abs(p.x-p.orangePortal.x)<35){p.x=p.bluePortal.x;p.y=p.bluePortal.y-40}}tutorialEvent("portal")}
function update(dt){if(state!=="game"||paused)return;dt=Math.min(dt,2);save.playTime+=dt/60;
if(p.abilityCD>0)p.abilityCD-=dt;if(p.invuln>0)p.invuln-=dt;if(p.freeze>0)p.freeze-=dt;if(p.shield>0)p.shield-=dt;
if(pressed("q"))rewind();if(pressed("f"))switchElement();if(pressed("e"))activateAbility();if(pressed("p")){if(p.portalMode){portal()}else portal()}
let left=actionDown("a")||actionDown("arrowleft"),right=actionDown("d")||actionDown("arrowright"),jump=pressed(" ")||pressed("arrowup"),dash=pressed("shift");
if(left)p.vx-=.5*dt;if(right)p.vx+=.5*dt;if(!left&&!right)p.vx*=Math.pow(.82,dt);if(Math.abs(p.vx)>6)p.vx=Math.sign(p.vx)*6;
if(jump&&p.onGround){p.vy=-10;p.onGround=false;AudioFX.sfx("jump");particles.emit(p.x,p.y+20,8,"#fff",2);tutorialEvent("jump")}
if(dash&&p.energy>=15){p.energy-=15;p.vx=Math.sign(p.vx||1)*12;particles.emit(p.x,p.y,18,"#65eaff",4);AudioFX.sfx("dash");shake=5;tutorialEvent("dash")}
if((left||right))tutorialEvent("move");
let gravity=p.element==="GRAVITY"?-.38:.5;if(p.element==="GRAVITY"&&p.y<80)gravity=.5;
if(!p.onGround)p.vy+=gravity*dt;if(hero.id==="runner")p.vx*=1.01;
if(world.id==="town"&&p.slide){p.vx=8;p.vy=3;p.slide-=dt} if(world.id==="sky")p.vx+=Math.sin(performance.now()*.001+p.y*.01)*.035*dt; if(world.id==="ninja")p.vx+=Math.sin(performance.now()*.001)*.015*dt; if(world.id==="neon"&&p.freeze>0){p.vx*=.98}
p.x+=p.vx*dt;p.y+=p.vy*dt;p.onGround=false;
for(const pl of level.platforms){if(p.x+p.w/2>pl.x&&p.x-p.w/2<pl.x+pl.w&&p.y+p.h/2>=pl.y&&p.y+p.h/2<=pl.y+pl.h+Math.abs(p.vy*dt)+2&&p.vy>=0){p.y=pl.y-p.h/2;p.vy=0;p.onGround=true;if(pl.slide){p.slide=80;toast("🛝 SLIDE BOOST");particles.emit(p.x,p.y+20,8,"#ffd34d")} if(pl.bounce){p.vy=-14;p.onGround=false;toast("🌸 FLOWER BOUNCE!");particles.burst(p.x,p.y,"#ff8bd8",14)} if(pl.flowerJump){p.vy=-15;p.onGround=false;toast("🌸 ENCHANTED FLOWER JUMP!");particles.burst(p.x,p.y,"#ff9bd7",18)} } }
for(const s of level.spikes){if(rectHit(p,s)){damage(1)}}
for(const c of level.coins){if(!c.got&&Math.hypot(p.x-c.x,p.y-c.y)<25){c.got=true;p.coins++;save.coins++;p.score+=20*(1+p.combo*.15);p.combo++;p.comboTimer=90;AudioFX.sfx("coin");particles.burst(c.x,c.y,"#ffd34d",10);toast("🪙 +1");tutorialEvent("coin");}}
for(const q of level.powerups){if(!q.got&&Math.abs(p.x-q.x)<28&&Math.abs(p.y-q.y)<45){q.got=true;AudioFX.sfx("power");particles.burst(q.x,q.y,"#a95cff",18);if(q.type==="life")p.lives++;if(q.type==="shield")p.shield=500;if(q.type==="energy")p.energy=Math.min(hero.energy,p.energy+60);if(q.type==="time")level.time+=15;toast("POWER-UP: "+q.type.toUpperCase())}}
for(const e of level.enemies){if(!e.alive)continue;e.x+=e.vx*dt*level.diff.enemy;e.y+=Math.sin(performance.now()*.004+e.x)*.2;if(Math.abs(e.x-p.x)<150)e.vx*=1.002;if(Math.abs(e.x-p.x)<30&&Math.abs(e.y-p.y)<45){if(p.invuln<=0){damage(1);e.vx=-e.vx;ai.note("damage");tutorialEvent("enemy");if(performance.now()-(e.tauntAt||0)>5000){e.tauntAt=performance.now();themeEvent("👹 "+e.type+" SAYS:",Math.random()<.5?"Too slow! 😈":"I saw that coming! 😂",1500)}}}if(Math.abs(e.x-p.x)<50&&actionDown("e")&&p.abilityCD<60){e.hp--;e.hit=12;if(e.hp<=0){e.alive=false;p.enemies++;p.score+=100;save.score+=100;p.combo++;p.comboTimer=90;particles.burst(e.x,e.y,"#ff6b7a",22);AudioFX.sfx("enemydefeat");}}}
if(p.comboTimer>0)p.comboTimer-=dt;else p.combo=0;
const cp=level.checkpoints[0];if(cp&&!cp.hit&&p.x>cp.x){cp.hit=true;p.checkpointX=cp.x;p.checkpointY=cp.y-60;AudioFX.sfx("checkpoint");toast("💾 CHECKPOINT SAVED");tutorialEvent("checkpoint");persist()}
if(level.boss.alive&&p.x>level.boss.x-300){bossUpdate(dt)}else if(!level.boss.alive&&p.x>level.finish.x-40)finishLevel();
if(p.x>level.width)p.x=level.width-20;if(p.x<0)p.x=0;if(p.y>650)die("You fell below the map.");if(p.y<0)p.y=20;
level.time-=dt/60;if(level.time<=0)die("Time ran out.");
p.energy=Math.min(hero.energy,p.energy+.12*dt);
updateChallengeUI();
if(level){
 level.paradoxTimer-=dt;
 if(level.paradoxTimer<=0&&!level.paradoxDone&&p.x>500&&p.x<level.width-500){
   level.paradoxDone=true;
   const events={
    town:["⏰ TIME LOOP!","A cartoon version of your last move just happened."],
    city:["👻 ROOFTOP ECHO!","Your past ghost is racing ahead."],
    castle:["🌸 MAGIC PARADOX!","The enchanted flowers changed their bounce timing."],
    ninja:["🌙 SHADOW ECHO!","A shadow copy crossed the village."],
    neon:["⚡ DIGITAL GLITCH!","The multiverse skipped one second."],
    sky:["☁️ WIND SHIFT!","The sky islands are drifting."]
   };
   const ev=events[world.id]||["⏰ TIME PARADOX!","The timeline just blinked."];
   themeEvent(ev[0],ev[1],2200);particles.burst(p.x,p.y,"#b98cff",30);
 }
}
p.history.push({x:p.x,y:p.y,vx:p.vx,vy:p.vy});if(p.history.length>300)p.history.shift();
particles.update(dt);updateWeather(dt);ai.update({dt,p,level,hero,bestAbility:()=>bestAbility(),settings});updateHUD();if(shake>0)shake-=dt;checkGamepad()
}
function rectHit(a,b){return Math.abs(a.x-b.x)<(a.w||20)/2+b.w/2&&Math.abs(a.y-b.y)<(a.h||40)/2+b.h/2}
function damage(n){if(p.shield>0)return;p.hp-=level.diff.damage*n;p.invuln=60;shake=12;AudioFX.sfx("damage");ai.note("damage");if(p.hp<=0)die("Your health reached zero.");}
function bossUpdate(dt){const b=level.boss;b.attack+=dt;if(b.attack>100){b.attack=0;AudioFX.sfx("boss");shake=8;if(Math.abs(p.x-b.x)<260)damage(1)}b.phase=b.hp<20?2:b.hp<10?3:1;b.x+=Math.sin(performance.now()*.001)*.3;if(Math.abs(p.x-b.x)<70&&p.abilityCD<50&&actionDown("e")){b.hp--;p.score+=40;particles.burst(b.x,b.y,"#ffb",12);if(b.hp<=0){b.alive=false;save.bosses++;AudioFX.sfx("victory");toast("👹 BOSS DEFEATED");AudioFX.startMusic("victory")}}}
function die(reason){if(state!=="game")return;ai.note("fall");p.lives--;if(p.lives>0){p.x=p.checkpointX;p.y=p.checkpointY;p.vx=p.vy=0;p.hp=p.maxHp;p.energy=hero.energy;toast("💾 CHECKPOINT RESTART");return}state="gameover";$("#gameOverReason").textContent=reason;window.MemeSystem?.close();show("#screen-gameover");AudioFX.stopMusic();AudioFX.sfx("gameover");saveProgress()}
function finishLevel(){if(state!=="game")return;state="results";const time=Math.max(0,(performance.now()-p.startTime)/1000);const key=world.id+"-"+levelIndex;const old=save.bestTimes[key]||99999;save.bestTimes[key]=Math.min(old,time);save.bestScores[key]=Math.max(save.bestScores[key]||0,p.score);save.completedLevels++;p.score+=Math.max(0,Math.floor(level.time*10));save.score+=p.score;save.coins+=p.coins;unlockProgress();saveGhost();addLeaderboard(time);achievement("First Coin",p.coins>0);achievement("Enemy Hunter",p.enemies>=5);achievement("Speed Runner",time<60);achievement("Coin Collector",p.coins>=20);achievement("No Damage",p.hp===p.maxHp);achievement("Rewind Master",p.rewinds===0);achievement("Boss Slayer",!level.boss.alive);achievement("World Explorer",true);$("#resultStats").innerHTML=`<p>⏱ Time: ${time.toFixed(1)}s • Best: ${save.bestTimes[key].toFixed(1)}s</p><p>🪙 Coins: ${p.coins} • 👹 Enemies: ${p.enemies} • ⭐ Score: ${p.score}</p><p>🤖 AI Strategy Score: ${Math.round(ai.score)}</p>`;window.MemeSystem?.close();show("#screen-results");AudioFX.sfx("complete");persist()}
function unlockProgress(){if(world.id==="town"&&levelIndex>=1&&!save.unlockedWorlds.includes("city"))save.unlockedWorlds.push("city");const wi=WORLDS.indexOf(world);if(levelIndex>=1&&wi+1<WORLDS.length&&!save.unlockedWorlds.includes(WORLDS[wi+1].id))save.unlockedWorlds.push(WORLDS[wi+1].id);if(save.coins>=50&&!save.unlockedHeroes.includes("web"))save.unlockedHeroes.push("web");if(levelIndex>=1&&!save.unlockedHeroes.includes("magic")&&world.id==="city")save.unlockedHeroes.push("magic");if(save.bosses>=3&&!save.unlockedHeroes.includes("ninja"))save.unlockedHeroes.push("ninja");if(save.bestTimes[world.id+"-"+levelIndex]<60&&!save.unlockedHeroes.includes("runner"))save.unlockedHeroes.push("runner")}
function achievement(n,ok){if(ok&&!save.achievements.includes(n)){save.achievements.push(n);toast("🏆 "+n);AudioFX.sfx("complete")}}
function addLeaderboard(time){save.leaderboard.push({player:save.name,score:p.score,time:+time.toFixed(2),coins:p.coins,level:level.level});save.leaderboard.sort((a,b)=>b.score-a.score);save.leaderboard=save.leaderboard.slice(0,10)}
function saveProgress(){persist()}
function loadGhost(){try{return JSON.parse(localStorage.getItem("chrono_ghost_"+world.id+"_"+levelIndex)||"null")}catch{return null}}
function saveGhost(){try{localStorage.setItem("chrono_ghost_"+world.id+"_"+levelIndex,JSON.stringify(p.history))}catch(e){}}
function updateHUD(){if(!level)return;$("#topHud").innerHTML=`<span class="hud-pill">${hero.emoji} ${hero.name.replace(/^\\S+ /,"")}</span><span class="hud-pill">❤️ ${Math.ceil(p.hp)}/${p.maxHp}</span><span class="hud-pill">🧡 ${p.lives}</span><span class="hud-pill">🪙 ${save.coins+p.coins}</span><span class="hud-pill">💎 ${save.gems}</span><span class="hud-pill">⭐ ${p.score}</span><span class="hud-pill">⏱ ${Math.ceil(level.time)}s</span><span class="hud-pill">🌍 ${world.name}</span><span class="hud-pill">${p.element==="FIRE"?"🔥":p.element==="ICE"?"❄️":"🌀"} ${p.element}</span><span class="hud-pill">⚡ ${Math.ceil(p.energy)}/${hero.energy}</span><span class="hud-pill">⏪ ×${p.rewinds}</span>`;$("#worldBanner").textContent="SELECTED WORLD: "+world.name;$("#aiText").textContent=ai.last||"Analyzing your movement, health, enemies and route…";$("#abilityPanel").textContent=`${hero.special}: ${p.abilityCD<=0?"READY":(p.abilityCD/60).toFixed(1)+"s"} • COMBO ×${Math.max(1,p.combo)}`;$("#objectives").innerHTML=`<div class="${level.checkpoints[0]?.hit?"obj done":""}">☐ Reach checkpoint</div><div class="${p.coins>=10?"obj done":""}">☐ Collect 10 coins (${p.coins}/10)</div><div class="${p.enemies>=5?"obj done":""}">☐ Defeat 5 enemies (${p.enemies}/5)</div><div class="${!level.boss.alive?"obj done":""}">☐ Defeat boss</div><div>☐ Reach finish</div>`}
function drawWorld(){
 const w=world;
 const g=ctx.createLinearGradient(0,0,0,innerHeight);g.addColorStop(0,w.sky[0]);g.addColorStop(1,w.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,innerWidth,innerHeight);
 ctx.save();ctx.translate(-cam.x,-cam.y*.22);
 const t=performance.now()*.001;
 // distant silhouettes
 for(let i=0;i<20;i++){let x=i*330;ctx.globalAlpha=.22;ctx.fillStyle=w.id==="castle"?"#9b74c4":w.id==="town"?"#fff0d0":w.id==="ninja"?"#263c55":w.id==="sky"?"#ffffff":w.id==="neon"?"#281c63":"#22304a";ctx.fillRect(x,170+(i%4)*25,170,280)}
 ctx.globalAlpha=1;

 if(w.id==="town"){
   // houses, school, trees, park
   for(let i=0;i<13;i++){let x=i*470;ctx.fillStyle=i%2?"#ffe4a8":"#ffc7c7";ctx.fillRect(x,295,170,125);ctx.fillStyle="#e86d72";ctx.beginPath();ctx.moveTo(x-10,295);ctx.lineTo(x+85,225);ctx.lineTo(x+180,295);ctx.fill();ctx.fillStyle="#6bc7e8";ctx.fillRect(x+25,325,35,35);ctx.fillStyle="#7a5036";ctx.fillRect(x+115,350,28,70)}
   ctx.fillStyle="#f2d85b";ctx.fillRect(1050,265,250,155);ctx.fillStyle="#e65c6c";ctx.fillRect(1020,245,310,28);ctx.fillStyle="#fff";ctx.font="bold 24px sans-serif";ctx.fillText("SCHOOL",1095,315);
   for(let i=0;i<18;i++){let x=150+i*300;ctx.fillStyle="#6fb85a";ctx.beginPath();ctx.arc(x,315,34,0,7);ctx.fill();ctx.fillStyle="#70452f";ctx.fillRect(x-7,315,14,105)}
   // clouds
   for(let i=0;i<9;i++){let x=150+i*560+Math.sin(t+i)*15,y=90+(i%3)*55;ctx.fillStyle="#fff9";ctx.beginPath();ctx.arc(x,y,28,0,7);ctx.arc(x+30,y-8,34,0,7);ctx.arc(x+65,y,25,0,7);ctx.fill()}
   // swings
   for(let i=0;i<4;i++){let x=2450+i*90;ctx.strokeStyle="#79533d";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,310);ctx.lineTo(x,380);ctx.moveTo(x+50,310);ctx.lineTo(x+50,380);ctx.stroke();ctx.strokeRect(x-2,305,54,5)}
 }
 if(w.id==="city"){
   for(let i=0;i<18;i++){let x=i*330;let h=180+(i%5)*55;ctx.fillStyle=i%2?"#111c32":"#17243e";ctx.fillRect(x,450-h,210,h);ctx.fillStyle="#58e8ff";for(let j=0;j<5;j++)for(let k=0;k<4;k++)ctx.fillRect(x+22+j*34,475-h+k*40,10,8)}
   ctx.fillStyle="#9ff";ctx.font="bold 22px sans-serif";ctx.fillText("CHRONO MART",700,180);ctx.fillText("NOVA",2050,150);
   ctx.strokeStyle="#53677e";ctx.lineWidth=3;for(let i=0;i<8;i++){let x=500+i*620;ctx.beginPath();ctx.moveTo(x,270);ctx.lineTo(x,450);ctx.stroke()}
   // helicopter silhouettes + cars
   ctx.fillStyle="#111";for(let i=0;i<6;i++){ctx.fillRect(150+i*820,500,90,18);ctx.fillRect(180+i*820,488,28,12)}
   for(let i=0;i<3;i++){let x=1200+i*1500+Math.sin(t*.5+i)*80;ctx.fillStyle="#182030";ctx.fillRect(x,120+i*30,80,14);ctx.fillRect(x+28,105+i*30,25,15);ctx.strokeStyle="#222";ctx.beginPath();ctx.moveTo(x+38,105+i*30);ctx.lineTo(x+10,90+i*30);ctx.lineTo(x+70,90+i*30);ctx.stroke()}
 }
 if(w.id==="castle"){
   // magical castle towers
   ctx.fillStyle="#6c4c96";ctx.fillRect(250,190,430,260);ctx.fillRect(310,120,90,330);ctx.fillRect(520,105,100,345);
   for(let x of [290,545]){ctx.fillStyle="#c28be8";ctx.beginPath();ctx.moveTo(x-20,120);ctx.lineTo(x+25,55);ctx.lineTo(x+70,120);ctx.fill()}
   // enchanted forest
   for(let i=0;i<20;i++){let x=850+i*230;ctx.fillStyle="#315d49";ctx.fillRect(x,300,22,150);ctx.fillStyle="#3f9c67";ctx.beginPath();ctx.arc(x+10,285,45,0,7);ctx.fill()}
   // floating books
   for(let i=0;i<8;i++){let x=1000+i*600,y=100+(i%3)*55+Math.sin(t*1.5+i)*8;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t+i)*.12);ctx.fillStyle="#d7a65b";ctx.fillRect(-18,-11,36,22);ctx.restore()}
   // crystal glow
   for(let i=0;i<7;i++){let x=1450+i*600,y=250+(i%2)*70;ctx.fillStyle="#79eaff";ctx.shadowBlur=22;ctx.shadowColor="#79eaff";ctx.beginPath();ctx.moveTo(x,y-25);ctx.lineTo(x+18,y);ctx.lineTo(x,y+25);ctx.lineTo(x-18,y);ctx.closePath();ctx.fill();ctx.shadowBlur=0}
   // princess-like enchanted garden / flower path
   for(let i=0;i<16;i++){let x=900+i*270,y=420;ctx.fillStyle=i%2?"#ff83c9":"#b785ff";ctx.beginPath();for(let k=0;k<6;k++){let a=k*Math.PI/3;ctx.arc(x+Math.cos(a)*15,y+Math.sin(a)*15,12,a-.8,a+.8)}ctx.fill();ctx.fillStyle="#ffd95a";ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill()}
 }
 if(w.id==="ninja"){
   // moon + clouds
   ctx.fillStyle="#fff2b8";ctx.shadowBlur=25;ctx.shadowColor="#fff2b8";ctx.beginPath();ctx.arc(4200,95,55,0,7);ctx.fill();ctx.shadowBlur=0;
   for(let i=0;i<9;i++){let x=200+i*550;ctx.fillStyle="#fff2";ctx.beginPath();ctx.arc(x,150+(i%2)*80,28,0,7);ctx.arc(x+35,142+(i%2)*80,35,0,7);ctx.fill()}
   // pagodas, torii, bamboo, lanterns
   for(let i=0;i<9;i++){let x=350+i*550;ctx.fillStyle="#3b2b2b";ctx.fillRect(x,270,110,180);ctx.fillStyle="#c9515c";ctx.fillRect(x-20,270,150,16);ctx.fillRect(x-5,245,120,16);ctx.fillStyle="#5e9c63";for(let j=0;j<5;j++)ctx.fillRect(x+160+j*14,240,8,210)}
   for(let i=0;i<8;i++){let x=650+i*700;ctx.fillStyle="#e59b47";ctx.shadowBlur=14;ctx.shadowColor="#e59b47";ctx.fillRect(x,275,20,35);ctx.shadowBlur=0}
 }
 if(w.id==="neon"){
   // cyber towers, animated holograms, digital rain
   for(let i=0;i<17;i++){let x=i*360;let h=210+(i%5)*55;ctx.fillStyle="#10152c";ctx.fillRect(x,450-h,220,h);ctx.strokeStyle=i%2?"#5b50ff":"#51eaff";ctx.lineWidth=2;ctx.strokeRect(x+8,450-h+8,204,h-16)}
   for(let i=0;i<70;i++){let x=(i*137)%5200,y=(i*61+performance.now()*.08)%450;ctx.fillStyle=i%3?"#5cf":"#ff4dbe";ctx.fillRect(x,y,2,12)}
   for(let i=0;i<8;i++){let x=600+i*620,y=180+(i%2)*60;ctx.strokeStyle="#65efff";ctx.shadowBlur=15;ctx.shadowColor="#65efff";ctx.strokeRect(x,y,120,55);ctx.shadowBlur=0}
 }
 if(w.id==="sky"){
   // giant clouds, islands and airships
   for(let i=0;i<18;i++){let x=80+i*320,y=90+(i%4)*75;ctx.fillStyle="#fff9";ctx.beginPath();ctx.arc(x,y,35,0,7);ctx.arc(x+40,y-10,42,0,7);ctx.arc(x+80,y,30,0,7);ctx.fill()}
   for(let i=0;i<4;i++){let x=1000+i*1150,y=90+(i%2)*50;ctx.fillStyle="#4d5c73";ctx.beginPath();ctx.ellipse(x,y,100,25,0,0,7);ctx.fill();ctx.fillStyle="#b47a4d";ctx.fillRect(x-35,y+20,70,40);ctx.strokeStyle="#222";ctx.beginPath();ctx.moveTo(x-25,y+20);ctx.lineTo(x-60,y-35);ctx.moveTo(x+25,y+20);ctx.lineTo(x+60,y-35);ctx.stroke()}
 }
 ctx.restore();
}
function drawLevel(){ctx.save();if(settings.shake&&shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);drawWorld();cam.x=Math.max(0,Math.min(level.width-innerWidth,p.x-innerWidth*.35));cam.y=0;
ctx.save();ctx.translate(-cam.x,0);
for(const pl of level.platforms){
 let col=pl.slide?"#f59b53":pl.bounce?"#ff78bb":pl.flowerJump?"#67b65f":pl.energyPlatform?"#32dfff":pl.ropeBridge?"#8b5b3c":world.platform;
 ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(pl.x,pl.y,pl.w,pl.h,8);ctx.fill();
 if(pl.slide){ctx.strokeStyle="#fff8";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(pl.x,pl.y);ctx.quadraticCurveTo(pl.x+pl.w*.45,pl.y+50,pl.x+pl.w,pl.y);ctx.stroke();ctx.fillStyle="#fff";ctx.font="18px sans-serif";ctx.fillText("🛝",pl.x+pl.w*.45,pl.y-5)}
 if(pl.bounce){ctx.fillStyle="#ffd94d";ctx.beginPath();ctx.arc(pl.x+pl.w/2,pl.y-18,22,0,7);ctx.fill();ctx.fillStyle="#ff78c8";for(let k=0;k<6;k++){let a=k*Math.PI/3;ctx.beginPath();ctx.arc(pl.x+pl.w/2+Math.cos(a)*20,pl.y-18+Math.sin(a)*20,10,0,7);ctx.fill()}}
 if(pl.flowerJump){ctx.fillStyle="#ff9bd7";for(let k=0;k<6;k++){let a=k*Math.PI/3;ctx.beginPath();ctx.arc(pl.x+pl.w/2+Math.cos(a)*18,pl.y-18+Math.sin(a)*18,11,0,7);ctx.fill()}ctx.fillStyle="#ffe05b";ctx.beginPath();ctx.arc(pl.x+pl.w/2,pl.y-18,8,0,7);ctx.fill()}
 if(pl.energyPlatform){ctx.strokeStyle="#9effff";ctx.shadowBlur=18;ctx.shadowColor="#4deaff";ctx.strokeRect(pl.x,pl.y,pl.w,pl.h);ctx.shadowBlur=0}
 if(pl.ropeBridge){ctx.strokeStyle="#c58a54";ctx.lineWidth=4;for(let k=0;k<5;k++){ctx.beginPath();ctx.moveTo(pl.x+k*pl.w/4,pl.y);ctx.lineTo(pl.x+k*pl.w/4,pl.y+22);ctx.stroke()}}
 if(pl.hook){ctx.fillStyle="#5ff3ff";ctx.shadowBlur=18;ctx.shadowColor="#5ff3ff";ctx.beginPath();ctx.arc(pl.x+pl.w/2,pl.y-20,7,0,7);ctx.fill();ctx.shadowBlur=0}
}
for(const s of level.spikes){ctx.fillStyle=s.laser?"#ff2f7d":"#d9e4ee";ctx.beginPath();ctx.moveTo(s.x,s.y+s.h);ctx.lineTo(s.x+s.w/2,s.y);ctx.lineTo(s.x+s.w,s.y+s.h);ctx.fill()}
for(const c of level.coins)if(!c.got){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(performance.now()*.004);ctx.fillStyle="#ffd34d";ctx.shadowBlur=15;ctx.shadowColor="#ffd34d";ctx.beginPath();ctx.ellipse(0,0,9,12,0,0,7);ctx.fill();ctx.restore()}
for(const q of level.powerups)if(!q.got){ctx.fillStyle=q.type==="life"?"#ff5870":"#b66dff";ctx.beginPath();ctx.arc(q.x,q.y,14,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.font="12px sans-serif";ctx.fillText(q.type[0].toUpperCase(),q.x-4,q.y+4)}
for(const cp of level.checkpoints){ctx.fillStyle="#54e77c";ctx.fillRect(cp.x,cp.y-55,6,55);ctx.fillStyle="#fff";ctx.fillRect(cp.x+6,cp.y-55,35,20)}
if(level.boss.alive){ctx.fillStyle="#d64cff";ctx.shadowBlur=20;ctx.shadowColor="#f5f";ctx.beginPath();ctx.arc(level.boss.x,level.boss.y,42,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.font="12px sans-serif";ctx.fillText(level.world.boss,level.boss.x-55,level.boss.y-55);ctx.fillStyle="#240018";ctx.fillRect(level.boss.x-50,level.boss.y-70,100,8);ctx.fillStyle="#ff4d75";ctx.fillRect(level.boss.x-50,level.boss.y-70,100*(level.boss.hp/level.boss.maxHp),8)}
ctx.fillStyle="#fff";ctx.fillRect(level.finish.x,level.finish.y-60,6,60);for(let i=0;i<5;i++){ctx.fillStyle=i%2?"#fff":"#e74f6b";ctx.fillRect(level.finish.x+6+i*12,level.finish.y-60,12,12)}
for(const e of level.enemies)if(e.alive){ctx.fillStyle=world.id==="neon"?"#ff43e8":"#ff6b6b";ctx.beginPath();ctx.arc(e.x,e.y,18,0,7);ctx.fill();ctx.fillStyle="#17172b";ctx.fillRect(e.x-8,e.y-4,5,5);ctx.fillRect(e.x+4,e.y-4,5,5)}
if(p.portalMode){if(!p.bluePortal)p.bluePortal={x:p.x,y:p.y};ctx.strokeStyle="#45bfff";ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.bluePortal.x,p.bluePortal.y,28,0,7);ctx.stroke();if(!p.orangePortal&&p.x-p.bluePortal.x>180)p.orangePortal={x:p.x,y:p.y};if(p.orangePortal){ctx.strokeStyle="#ff9d45";ctx.beginPath();ctx.arc(p.orangePortal.x,p.orangePortal.y,28,0,7);ctx.stroke()}}
if(p.ghost&&p.ghost.length){const q=p.ghost[Math.min(p.ghostIndex++,p.ghost.length-1)];if(q){ctx.globalAlpha=.25;drawHero(ctx,q,hero,performance.now(),{x:0,y:0});ctx.globalAlpha=1}}
drawHero(ctx,p,hero,performance.now(),{x:cam.x,y:0});ctx.restore();particles.draw(ctx,cam);ctx.restore()}
function updateWeather(dt){if(!settings.particles)return;const n=world.id==="city"?3:world.id==="neon"?2:1;if(Math.random()<.15*n)particles.emit(cam.x+Math.random()*innerWidth,-10,1,world.id==="city"?"#8bd":"#fff",world.id==="sky"?1:3,80)}
function drawMinimap(){mctx.clearRect(0,0,180,100);mctx.fillStyle="#07101c";mctx.fillRect(0,0,180,100);const sx=180/level.width;for(const pl of level.platforms){mctx.fillStyle="#6aa";mctx.fillRect(pl.x*sx,pl.y/6,pl.w*sx,2)}for(const e of level.enemies)if(e.alive){mctx.fillStyle="#f55";mctx.fillRect(e.x*sx,80,3,3)}mctx.fillStyle="#5f5";mctx.fillRect(p.x*sx,75,4,4);mctx.fillStyle="#ffd34d";for(const c of level.coins)if(!c.got)mctx.fillRect(c.x*sx,70,2,2);mctx.fillStyle="#f44";mctx.fillRect(level.boss.x*sx,80,5,5);mctx.fillStyle="#fff";mctx.fillRect(level.finish.x*sx,80,5,5)}
function loop(t){if(state!=="game")return;const dt=Math.min(2,(t-last)/16.67);last=t;fps=60/(dt||1);update(dt);drawLevel();drawMinimap();if(dev){ctx.fillStyle="#fff";ctx.font="12px monospace";ctx.fillText(`FPS ${fps.toFixed(0)} | Entities ${level.enemies.length+level.coins.length} | Particles ${particles.a.length} | X ${p.x.toFixed(0)} Y ${p.y.toFixed(0)} VX ${p.vx.toFixed(1)}`,12,innerHeight-55)}requestAnimationFrame(loop)}
function checkGamepad(){const gs=navigator.getGamepads?.()||[];const g=[...gs].find(Boolean);if(g&&!gamepadConnected){gamepadConnected=true;toast("🎮 GAMEPAD CONNECTED")}if(!g)return;keys.a=g.axes[0]<-.25;keys.d=g.axes[0]>.25;if(g.buttons[0]?.pressed)keys[" "]=true;if(g.buttons[2]?.pressed)keys.shift=true;if(g.buttons[1]?.pressed)keys.q=true}
function saveContinue(){persist();toast("💾 GAME SAVED")}
function showProfile(){const e=$("#infoPanel");e.innerHTML=`<h2>👤 PLAYER PROFILE</h2><p>Name: <b>${save.name}</b></p><p>Total play time: ${Math.floor(save.playTime/60)}m</p><p>🪙 Coins: ${save.coins}</p><p>💎 Gems: ${save.gems}</p><p>Enemies defeated: ${save.score?Math.floor(save.score/100):0}</p><p>Bosses defeated: ${save.bosses}</p><p>Levels completed: ${save.completedLevels}</p><p>Worlds unlocked: ${save.unlockedWorlds.length}/${WORLDS.length}</p><p>Heroes unlocked: ${save.unlockedHeroes.length}/${HEROES.length}</p><p>Best score: ${save.score}</p><p>Rewinds used: ${save.rewinds}</p><button id="nameBtn">CHANGE NAME</button><button data-action="closeInfo">CLOSE</button>`;e.classList.remove("hidden");$("#nameBtn").onclick=()=>{const n=prompt("Display name",save.name);if(n){save.name=n.slice(0,24);persist();showProfile()}}}
function showAchievements(){const e=$("#infoPanel");const names=["First Coin","Enemy Hunter","Speed Runner","Coin Collector","No Damage","Rewind Master","Portal Master","Boss Slayer","World Explorer"];e.innerHTML=`<h2>🏆 ACHIEVEMENTS</h2>`+names.map(n=>`<p>${save.achievements.includes(n)?"🏆":"🔒"} ${n}</p>`).join("")+`<button data-action="closeInfo">CLOSE</button>`;e.classList.remove("hidden")}
function showLeaderboard(){const e=$("#infoPanel");e.innerHTML="<h2>🏆 LOCAL LEADERBOARD</h2>"+(save.leaderboard.length?save.leaderboard.map((x,i)=>`<p>${i+1}. ${x.player} — ${x.score} pts — ${x.time}s</p>`).join(""):"<p>No runs yet.</p>")+"<button data-action=\"closeInfo\">CLOSE</button>";e.classList.remove("hidden")}
function showHow(){const e=$("#infoPanel");e.innerHTML="<h2>❓ HOW TO PLAY</h2><p>A/D move • SPACE jump • SHIFT dash • Q rewind • E ability • F element • P portal • M minimap • ESC pause.</p><p>Collect coins, save checkpoints, defeat the world boss and reach the flag. Chrono AI analyzes your real gameplay state.</p><p>Cartoon Town has playable slides; every world uses distinct scenery, mechanics, enemies and boss.</p><button data-action=\"closeInfo\">CLOSE</button>";e.classList.remove("hidden")}
function customize(){const e=$("#infoPanel");e.innerHTML=`<h2>🎨 COSMETIC SHOP</h2><p>🪙 ${save.coins} coins • 💎 ${save.gems} gems</p><button id="buyTrail">✨ Buy Comet Trail — 30 coins</button><button id="buyHat">🎩 Buy Time Hat — 2 gems</button><button id="equip">EQUIP OWNED COSMETICS</button><button data-action="closeInfo">CLOSE</button>`;e.classList.remove("hidden");$("#buyTrail").onclick=()=>{if(save.coins>=30&&!save.skins.includes("trail")){save.coins-=30;save.skins.push("trail");persist();toast("✨ TRAIL UNLOCKED")}};$("#buyHat").onclick=()=>{if(save.gems>=2&&!save.skins.includes("hat")){save.gems-=2;save.skins.push("hat");persist();toast("🎩 HAT UNLOCKED")}};$("#equip").onclick=()=>toast("✨ COSMETIC EQUIPPED")}
function openEditor(){show(null);$("#editorPanel").classList.remove("hidden");Editor.init()}
function closeEditor(){show("#screen-start");$("#editorPanel").classList.add("hidden")}
document.addEventListener("click",e=>{const a=e.target.closest("[data-action]");if(!a)return;const x=a.dataset.action;AudioFX.init();switch(x){
case"play":startFlow();break;case"customize":customize();break;case"achievements":showAchievements();break;case"settings":openSettings();break;case"howto":showHow();break;case"meme":openMeme("random");break;case"profile":showProfile();break;case"leaderboard":showLeaderboard();break;case"continue":{hero=HEROES.find(h=>h.id===save.equipped.hero)||HEROES[0];world=WORLDS.find(w=>w.id===save.unlockedWorlds[Math.min(save.completedLevels,WORLDS.length-1)])||WORLDS[0];startLoading();break}case"worlds":renderWorlds();show("#screen-worlds");break;case"back":show("#screen-start");break;case"backHero":show("#screen-heroes");break;case"startLevel":startLoading();break;case"skipIntro":beginLevel();break;case"resume":togglePause();break;case"restartCheckpoint":if(level){p.x=p.checkpointX;p.y=p.checkpointY;p.hp=p.maxHp;p.lives=Math.max(1,p.lives);state="game";$("#screen-gameover").classList.remove("active");$("#pauseOverlay").classList.add("hidden");show("#hud");requestAnimationFrame(loop)}break;case"retry":startLoading();break;case"replay":startLoading();break;case"nextLevel":levelIndex++;if(levelIndex>=4){state="victory";$("#victoryStats").innerHTML=`<p>⭐ ${save.score} • 🪙 ${save.coins} • 💎 ${save.gems} • 👹 ${save.bosses}</p><p>Worlds explored: ${save.unlockedWorlds.length} • AI Strategy: ${Math.round(ai.score)}</p>`;window.MemeSystem?.close();show("#screen-victory");}else startLoading();break;case"playAgain":levelIndex=0;startLoading();break;case"menu":AudioFX.stopMusic();closeEditor();window.MemeSystem?.close();show("#screen-start");break;case"closeSettings":closeSettings();break;case"fullscreen":document.documentElement.requestFullscreen?.();break;case"closeInfo":$("#infoPanel").classList.add("hidden");break;case"editor":openEditor();break;case"saveEditor":Editor.save();break;case"loadEditor":Editor.load();break;case"clearEditor":Editor.clear();break;case"exportEditor":Editor.exp();break;case"importEditor":Editor.imp();break;case"tutorialNext":if(!save.tutorial){tutorialStep++;tutorialUpdate()}break;case"skipTutorial":save.tutorial=true;persist();state="game";$("#screen-tutorial").classList.remove("active");show("#hud");requestAnimationFrame(loop);break;}})
addEventListener("visibilitychange",()=>{if(document.hidden&&state==="game"){paused=true;$("#pauseOverlay").classList.remove("hidden");AudioFX.stopMusic()}});
function init(){save.equipped=save.equipped||{};hero=HEROES.find(h=>h.id===save.equipped.hero)||HEROES[0];$("#continueBtn").style.display=save.completedLevels||save.coins||save.tutorial?"block":"none";AudioFX.setEnabled(settings.sound);AudioFX.setMusic(settings.music);Editor.init();requestAnimationFrame(t=>{last=t;drawStart()})}
function drawStart(){if(state==="menu"){ctx.clearRect(0,0,innerWidth,innerHeight);ctx.fillStyle="#070917";ctx.fillRect(0,0,innerWidth,innerHeight);for(let i=0;i<50;i++){ctx.fillStyle="#fff8";ctx.fillRect((i*97)%innerWidth,(i*53)%innerHeight,1.5,1.5)}}requestAnimationFrame(drawStart)}
init();
})();