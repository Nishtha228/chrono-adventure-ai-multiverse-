const WORLDS=[
{id:"town",name:"🏘️ CARTOON TOWN",unlock:"Unlocked",sky:["#65d8ff","#ffd3a0"],ground:"#4d8f4b",platform:"#e88755",water:"#2da9d7",enemy:"Toy Bot",boss:"GIANT TOY BOT",weather:"☀️ Clear",day:"DAY",
theme:"playground",accent:"#ffcf5c",props:["houses","school","park","trees","clouds","playground","slides","swings","puddles"],mechanics:["slide","trampoline","puddle"]},
{id:"city",name:"🌆 CITY ROOFTOPS",unlock:"Complete Cartoon Town Level 2",sky:["#071126","#3a145d"],ground:"#1c2638",platform:"#40556d",water:"#1a4b70",enemy:"Rooftop Drone",boss:"ROOFTOP TITAN",weather:"🌧️ Rain",day:"NIGHT",
theme:"rooftop",accent:"#55eaff",props:["skyscrapers","neonSigns","cars","drones","helicopter","waterTanks","fireEscapes","hookPoints"],mechanics:["grapple","gap","fireEscape"]},
{id:"castle",name:"🏰 MAGIC CASTLE",unlock:"Complete City Level 2",sky:["#120b2d","#63348b"],ground:"#302747",platform:"#7a62b6",water:"#395aa2",enemy:"Spell Wisp",boss:"ARCANE GOLEM",weather:"✨ Enchanted Mist",day:"NIGHT",
theme:"enchanted",accent:"#ff9ee7",props:["castle","forest","books","doors","stairs","crystals","potions","flowers","fountains"],mechanics:["flowerJump","magicDoor","floatingStairs"]},
{id:"ninja",name:"🌙 NINJA VILLAGE",unlock:"Complete Castle Level 2",sky:["#050c19","#243e70"],ground:"#202b27",platform:"#76513b",water:"#236b8d",enemy:"Shadow Guard",boss:"MOON RONIN",weather:"💨 Wind",day:"NIGHT",
theme:"ninja",accent:"#ff7066",props:["village","bamboo","lanterns","bridges","water","moon","clouds","rooftops"],mechanics:["wallJump","ropeBridge","wind"]},
{id:"neon",name:"💜 NEON FUTURE CITY",unlock:"Complete Ninja Level 2",sky:["#050414","#48107a"],ground:"#0e1628",platform:"#28557f",water:"#221f77",enemy:"Holo Drone",boss:"NEON OVERSEER",weather:"⚡ Storm",day:"NIGHT",
theme:"cyber",accent:"#7df5ff",props:["neonBuildings","energyPlatforms","lasers","holograms","drones","portals","digitalRain"],mechanics:["laser","energyPlatform","holo"]},
{id:"sky",name:"☁️ SKY ISLANDS",unlock:"Complete Neon Level 2",sky:["#68cfff","#e9fbff"],ground:"#71976f",platform:"#9d7755",water:"#54bad7",enemy:"Cloud Raider",boss:"STORM CAPTAIN",weather:"💨 Wind",day:"SUNSET",
theme:"sky",accent:"#ffe39a",props:["islands","clouds","airships","bridges","grapples","fallingPlatforms","wind"],mechanics:["wind","falling","grapple"]}
];
const WORLD_TIPS={
town:"🛝 Ride the curved slide, then bounce from the giant flower trampoline.",
city:"🪝 Grapple to cyan web points and use fire escapes to cross rooftop gaps.",
castle:"🌸 Enchanted flowers launch you upward. Look for the secret garden.",
ninja:"🎋 Wall-jump between rooftops and cross rope bridges under the moon.",
neon:"⚡ Time your movement through laser gates and glowing energy platforms.",
sky:"☁️ Ride the wind and grapple between floating islands."
};