function makeLevel(worldIndex=0,levelIndex=0,difficulty="NORMAL"){
const w=WORLDS[worldIndex], diff={EASY:{time:125,hp:120,enemy:0.72,damage:8,checks:2},NORMAL:{time:95,hp:100,enemy:1,damage:12,checks:1},HARD:{time:72,hp:90,enemy:1.3,damage:18,checks:1}}[difficulty];
const width=5200+levelIndex*500;
const platforms=[
{x:0,y:450,w:800,h:40,kind:"ground"},{x:900,y:390,w:500,h:40,kind:"ground"},{x:1500,y:450,w:650,h:40,kind:"ground"},
{x:2300,y:350,w:520,h:40,kind:"ground"},{x:3000,y:430,w:650,h:40,kind:"ground"},{x:3800,y:330,w:550,h:40,kind:"ground"},{x:4500,y:440,w:700,h:40,kind:"ground"}];
const coins=[],enemies=[],powerups=[],checkpoints=[{x:1400,y:340,hit:false},{x:3300,y:370,hit:false}],spikes=[],decor=[];
for(let x=180;x<width-300;x+=145) coins.push({x,y:360-(Math.sin(x*.02)*35),r:9,got:false});
for(let i=0;i<7;i++) enemies.push({x:620+i*650,y:410-(i%2)*70,w:34,h:38,hp:2+Math.floor(levelIndex/2),vx:(i%2?1:-1)*diff.enemy,alive:true,type:w.enemy,hit:0,phase:Math.random()*6.28});
powerups.push({x:1120,y:330,type:"shield",got:false},{x:2700,y:285,type:"energy",got:false},{x:4050,y:265,type:"time",got:false},{x:4800,y:380,type:"life",got:false});

if(w.id==="town"){
  platforms.push(
    {x:1640,y:310,w:300,h:28,slide:true,slideEndX:2140,kind:"slide"},
    {x:1810,y:245,w:240,h:22,slide:true,slideEndX:2220,kind:"slide"},
    {x:2250,y:350,w:150,h:22,bounce:true,kind:"trampoline"},
    {x:2700,y:300,w:150,h:22,bounce:true,kind:"trampoline"},
    {x:3500,y:300,w:160,h:22,bounce:true,kind:"trampoline"}
  );
  decor.push({type:"house",x:350,y:300},{type:"school",x:1120,y:285},{type:"playground",x:2500,y:355},{type:"tree",x:700,y:330},{type:"tree",x:2950,y:350},{type:"puddle",x:3150,y:410,w:170});
}
if(w.id==="city"){
  for(let i=0;i<7;i++)platforms.push({x:700+i*620,y:270-(i%3)*50,w:170,h:22,hook:true,kind:"roof"});
  for(let i=0;i<5;i++)platforms.push({x:1180+i*900,y:360,w:110,h:70,fireEscape:true,kind:"fireEscape"});
  decor.push({type:"skyscraper",x:200,y:80},{type:"skyscraper",x:1050,y:40},{type:"waterTank",x:1850,y:245},{type:"helicopter",x:3150,y:130});
}
if(w.id==="castle"){
  for(let i=0;i<6;i++)platforms.push({x:800+i*550,y:250+(i%2)*80,w:180,h:22,floating:true,kind:"floating"});
  for(let i=0;i<5;i++)platforms.push({x:1100+i*650,y:340-(i%2)*70,w:120,h:20,flowerJump:true,kind:"flower"});
  platforms.push({x:3650,y:240,w:150,h:20,flowerJump:true,kind:"flower"});
  decor.push({type:"castle",x:420,y:70},{type:"crystal",x:1650,y:230},{type:"crystal",x:2850,y:190},{type:"garden",x:3600,y:180});
}
if(w.id==="ninja"){
  for(let i=0;i<8;i++)platforms.push({x:700+i*520,y:220+(i%3)*55,w:150,h:20,wall:true,kind:"wall"});
  for(let i=0;i<4;i++)platforms.push({x:1200+i*850,y:315,w:240,h:18,ropeBridge:true,kind:"rope"});
  decor.push({type:"torii",x:450,y:250},{type:"bamboo",x:900,y:300},{type:"lantern",x:1800,y:270},{type:"moon",x:4400,y:70});
}
if(w.id==="neon"){
  for(let i=0;i<8;i++)spikes.push({x:800+i*520,y:350,w:90,h:20,laser:i%2===0});
  for(let i=0;i<6;i++)platforms.push({x:950+i*700,y:250+(i%2)*55,w:180,h:18,energyPlatform:true,kind:"energy"});
  decor.push({type:"neonTower",x:400,y:70},{type:"hologram",x:2050,y:180},{type:"portal",x:3550,y:220},{type:"digital",x:4300,y:100});
}
if(w.id==="sky"){
  for(let i=0;i<8;i++)platforms.push({x:650+i*600,y:220-(i%3)*60,w:180,h:24,falling:true,kind:"island"});
  for(let i=0;i<4;i++)platforms.push({x:1000+i*1000,y:310,w:260,h:16,ropeBridge:true,kind:"rope"});
  decor.push({type:"airship",x:1300,y:80},{type:"airship",x:3800,y:120},{type:"giantCloud",x:2500,y:140});
}
const challenges=[
{title:"COIN RUSH",text:"Collect 12 coins before the timer drops below 50%.",type:"coins",target:12},
{title:"NO BONK",text:"Reach the second checkpoint without taking damage.",type:"nodamage",target:1},
{title:"ABILITY MASTER",text:"Defeat 2 enemies with your special ability.",type:"ability",target:2},
{title:"TIME CHEATER",text:"Use one rewind and still reach the boss.",type:"rewind",target:1}
];
return {world:w,level:levelIndex+1,name:["TIME TOWN","PLAYGROUND RIFT","ROOFTOP RIFT","CASTLE TRIAL"][levelIndex%4],
objective:"Reach the Chrono Portal and defeat the boss.",width,platforms,coins,enemies,powerups,spikes,checkpoints,
finish:{x:width-180,y:360},boss:{x:width-620,y:330,hp:30+levelIndex*6,maxHp:30+levelIndex*6,phase:1,alive:true,attack:0},
time:diff.time,hp:diff.hp,diff,decor,challenge:challenges[levelIndex%challenges.length],
paradoxTimer:18+Math.random()*12,paradoxDone:false,aiMemeTimer:0};
}