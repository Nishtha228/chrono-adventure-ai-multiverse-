class ParticleSystem{
constructor(){this.a=[]}
emit(x,y,n=8,color="#7de8ff",speed=2,life=40){for(let i=0;i<n;i++){const q=Math.random()*Math.PI*2,s=Math.random()*speed;this.a.push({x,y,vx:Math.cos(q)*s,vy:Math.sin(q)*s,life:life*(.6+Math.random()*.6),max:life,r:1+Math.random()*3,c:color})}}
burst(x,y,color,n=18){this.emit(x,y,n,color,4,55)}
update(dt){for(let i=this.a.length-1;i>=0;i--){const p=this.a[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.04*dt;p.vx*=.99;p.life-=dt;if(p.life<=0)this.a.splice(i,1)}}
draw(c,cam){for(const p of this.a){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.c;c.beginPath();c.arc(p.x-cam.x,p.y-cam.y,p.r,0,7);c.fill()}c.globalAlpha=1}}
