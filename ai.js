class ChronoAI{
constructor(){this.falls=0;this.damage=0;this.rewinds=0;this.last="";this.score=0;this.tick=0;this.personality="GUIDE";this.mistakes={};this.goodMoves=0}
update(g){
 this.tick+=g.dt;if(this.tick<18)return;this.tick=0;const p=g.p,l=g.level;let text="";
 const nearEnemy=l.enemies.find(e=>e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<220);
 const nearCoin=l.coins.find(c=>!c.got&&Math.abs(c.x-p.x)<300);
 const ability=g.bestAbility();
 if(this.falls>=2) text="💡 You have fallen here twice. Try jumping later and use DASH.";
 else if(this.damage>=3) text="⚠️ Repeated damage detected. Try "+ability+".";
 else if(this.rewinds>=2) text="⏪ Rewind used often. Save your last charge for the boss.";
 else if(p.hp<30) text="⚠️ Health critical. REWIND or SHIELD is your safest move.";
 else if(nearEnemy) text=`⚔️ ${l.world.enemy} nearby. BEST MOVE: ${ability}.`;
 else if(nearCoin) text="💡 AI TIP: Jump → Dash → Collect the nearby coin trail.";
 else if(l.time<15) text="⏰ Time is running low. Stop exploring and head for the finish.";
 else if(l.challenge) text=`🎯 CHALLENGE: ${l.challenge.title} — ${l.challenge.text}`;
 else text=`🤖 ${l.world.name} favors ${g.hero.special}. Stay mobile.`;

 if(this.personality==="FUNNY"&&Math.random()<.35) text += " 😂 I believe in you. Mostly.";
 if(this.personality==="SAVAGE"&&Math.random()<.3) text += " 😈 Please stop feeding the enemy.";
 if(this.personality==="MOTIVATOR"&&Math.random()<.3) text += " 🔥 You got this!";
 const changed=text!==this.last;this.last=text;this.score=Math.min(100,this.score+.5);
 if(changed&&g.settings.voice)AudioFX.speak(text);
}
note(type){
 if(type==="fall")this.falls++;
 if(type==="damage")this.damage++;
 if(type==="rewind")this.rewinds++;
 this.mistakes[type]=(this.mistakes[type]||0)+1;
}
setPersonality(v){this.personality=v||"GUIDE";}
}