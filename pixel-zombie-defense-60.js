(() => {
  const canvas = document.querySelector('[data-zd-canvas]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', {alpha:false});
  const board = canvas.closest('.zd-board');
  function fitCanvas(){
    if(!board)return;
    const availableWidth=board.clientWidth,availableHeight=board.clientHeight;
    if(availableWidth<=0||availableHeight<=0)return;
    const scale=Math.min(availableWidth/960,availableHeight/540);
    canvas.style.width=`${Math.floor(960*scale)}px`;
    canvas.style.height=`${Math.floor(540*scale)}px`;
  }
  if(board&&'ResizeObserver' in window){const boardObserver=new ResizeObserver(fitCanvas);boardObserver.observe(board);}
  window.addEventListener('resize',fitCanvas,{passive:true});
  fitCanvas();
  const art = document.createElement('canvas');
  art.width = 480; art.height = 270;
  let g = art.getContext('2d');
  g.imageSmoothingEnabled = false;

  const $ = selector => document.querySelector(selector);
  window.addEventListener('error', event => {
    const status = $('[data-zd-status]');
    if (status) status.textContent = `Game rendering error: ${event.message}`;
  });
  window.addEventListener('unhandledrejection', event => {
    const status = $('[data-zd-status]');
    if (status) status.textContent = `Game error: ${event.reason?.message || event.reason || 'unknown error'}`;
  });
  const buttons = [...document.querySelectorAll('[data-zd-weapon]')];
  const weaponInfo = {
    rifle: {name:'Rifle nest', cost:90, range:135, damage:25, cooldown:560, color:'#a9ba71'},
    shotgun: {name:'Shotgun post', cost:120, range:105, damage:28, cooldown:940, splash:25, color:'#d2ad79'},
    launcher: {name:'Grenade rig', cost:150, range:150, damage:66, cooldown:1580, splash:35, color:'#81975c'}
  };
  // The opening pass has three equal-length approaches that merge before the safe house.
  // Later passes use one longer route each; lanes are selected per enemy.
  const mapRoutes = [
    [
      [{x:-16,y:30},{x:20,y:30},{x:110,y:30},{x:110,y:80},{x:260,y:80},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:135},{x:20,y:135},{x:20,y:187},{x:110,y:187},{x:110,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:240},{x:20,y:240},{x:110,y:240},{x:150,y:240},{x:150,y:190},{x:260,y:190},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}]
    ],
    [
      [{x:-16,y:20},{x:140,y:20},{x:140,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:90},{x:20,y:90},{x:20,y:55},{x:55,y:55},{x:55,y:90},{x:80,y:90},{x:80,y:115},{x:140,y:115},{x:140,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:180},{x:20,y:180},{x:20,y:215},{x:55,y:215},{x:55,y:180},{x:80,y:180},{x:80,y:155},{x:140,y:155},{x:140,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:250},{x:140,y:250},{x:140,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}]
    ],
    [
      [{x:-16,y:11},{x:140,y:11},{x:140,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:73},{x:20,y:73},{x:20,y:42},{x:51,y:42},{x:51,y:73},{x:140,y:73},{x:140,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:135},{x:20,y:135},{x:20,y:197},{x:80,y:197},{x:80,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:197},{x:20,y:197},{x:20,y:228},{x:51,y:228},{x:51,y:197},{x:140,y:197},{x:140,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}],
      [{x:-16,y:259},{x:140,y:259},{x:140,y:135},{x:260,y:135},{x:320,y:135},{x:320,y:220},{x:390,y:220},{x:390,y:115},{x:455,y:115},{x:495,y:115}]
    ]
  ];
  const mapZones=['AFTERDARK · ZONE 07','FLOODGATE · ZONE 12','SCRAP YARD · ZONE 19'];
  let mapIndex=0, routes=mapRoutes[0];
  const sockets = [
    {x:65,y:43},{x:172,y:61},{x:65,y:174},{x:175,y:145},{x:70,y:250},
    {x:205,y:207},{x:245,y:103},{x:286,y:164},{x:345,y:171},{x:420,y:151}
  ];
  const waves = [
    Array(12).fill('walker'),
    Array.from({length:24},(_,i)=>['walker','runner','walker','walker','runner','walker'][Math.floor(i/4)]),
    Array.from({length:30},(_,i)=>['walker','runner','walker','brute','runner','walker'][Math.floor(i/5)])
  ];
  const maxLives=6;
  let mode='ready', pausedFrom='ready', waveIndex=0, lives=maxLives, cash=360;
  let selectedWeapon='rifle', selectedSocket=-1, hoverSocket=-1;
  let towers=[], enemies=[], shots=[], effects=[], spawnQueue=[], spawnTimer=0, spawned=0, resolved=0;
  let lastFrame=0, elapsed=0, lastTime=null, terrain=null,pathDataByRoute=[],pathLengths=[];
  let fireRestClock=0,weaponsResting=false,adClock=0,adCycle=0;

  function configureMap(index){
    mapIndex=Math.max(0,Math.min(mapRoutes.length-1,index));
    routes=mapRoutes[mapIndex];pathDataByRoute=[];pathLengths=[];
    for(const route of routes){
      const segments=[];let pathLength=0;
      for(let i=0;i<route.length-1;i++){
        const a=route[i],b=route[i+1],length=Math.hypot(b.x-a.x,b.y-a.y);
        segments.push({a,b,length,start:pathLength});pathLength+=length;
      }
      pathDataByRoute.push(segments);pathLengths.push(pathLength);
    }
    terrain=null;
  }
  configureMap(0);

  function seeded(x,y){ const n=Math.sin(x*127.1+y*311.7+19.19)*43758.5453; return n-Math.floor(n); }
  function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
  function line(x1,y1,x2,y2,color,width,dash=[]){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.lineCap='butt';g.lineJoin='miter';g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.stroke();g.setLineDash([]);}
  function drawRoute(route,color,width,dash=[]){
    g.beginPath();g.moveTo(route[0].x,route[0].y);for(let i=1;i<route.length;i++)g.lineTo(route[i].x,route[i].y);
    g.lineCap='square';g.lineJoin='miter';g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.stroke();g.setLineDash([]);
  }
  function pointAt(distance,lane=0){
    const segments=pathDataByRoute[lane]||pathDataByRoute[0],route=routes[lane]||routes[0];
    for(const segment of segments){if(distance<=segment.start+segment.length){const t=Math.max(0,(distance-segment.start)/segment.length);return{x:segment.a.x+(segment.b.x-segment.a.x)*t,y:segment.a.y+(segment.b.y-segment.a.y)*t};}}
    return route[route.length-1];
  }
  function distanceToRoute(x,y){
    let nearest=Infinity;
    for(const segment of pathDataByRoute.flat()){
      const dx=segment.b.x-segment.a.x,dy=segment.b.y-segment.a.y;
      const t=Math.max(0,Math.min(1,((x-segment.a.x)*dx+(y-segment.a.y)*dy)/(segment.length*segment.length)));
      nearest=Math.min(nearest,Math.hypot(x-(segment.a.x+dx*t),y-(segment.a.y+dy*t)));
    }
    return nearest;
  }
  function buildTerrain(){
    const looks=[
      {ground:'#26382a',speck:'#2a3e2e',bright:'#334631',edge:'#1a211c',road:'#847553',inner:'#514a3a',stripe:'#a08a5e'},
      {ground:'#263934',speck:'#2d4238',bright:'#3b5141',edge:'#17231f',road:'#77765f',inner:'#4a5142',stripe:'#d0ad70'},
      {ground:'#292f2a',speck:'#343a2e',bright:'#454737',edge:'#1a211c',road:'#8a7654',inner:'#514638',stripe:'#c3a06a'}
    ][mapIndex];
    terrain=document.createElement('canvas');terrain.width=480;terrain.height=270;const save=g;g=terrain.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle=looks.ground;g.fillRect(0,0,480,270);
    for(let y=0;y<270;y+=8)for(let x=0;x<480;x+=8){const r=seeded(x+mapIndex*39,y-mapIndex*17);if(r>.53)rect(x+Math.floor(r*5),y+Math.floor(seeded(y,x)*5),r>.84?3:2,2,r>.84?looks.bright:looks.speck);if(r<.09)rect(x+2,y+5,1,2,mapIndex===1?'#71806a':'#667247');}
    for(let i=0;i<16;i++){const x=15+seeded(i+mapIndex*9,80)*445,y=20+seeded(i,140+mapIndex*23)*235;if(distanceToRoute(x,y)<27)continue;rect(x,y,5,2,'#263025');rect(x+1,y-2,3,2,looks.bright);rect(x+2,y+2,1,2,mapIndex===2?'#9b7750':'#72704b');}
    const laneWidth=[36,28,22][mapIndex];
    routes.forEach(route=>{drawRoute(route,looks.edge,laneWidth);drawRoute(route,looks.road,laneWidth-5);drawRoute(route,looks.inner,laneWidth-11);drawRoute(route,looks.stripe,1.5,[5,5]);});
    const mergeAt=routes[0].findIndex(point=>point.x===260&&point.y===135),sharedTail=mergeAt>=0?routes[0].slice(mergeAt):[];
    if(sharedTail.length){drawRoute(sharedTail,looks.edge,36);drawRoute(sharedTail,looks.road,31);drawRoute(sharedTail,looks.inner,25);drawRoute(sharedTail,looks.stripe,1.5,[5,5]);}
    // Broken paving and boot-worn shoulders keep the road legible at a glance.
    for(let lane=0;lane<routes.length;lane++)for(let d=12;d<pathLengths[lane]-8;d+=12){const p=pointAt(d,lane);const seg=pathDataByRoute[lane].find(s=>d>=s.start&&d<=s.start+s.length);const vertical=seg&&Math.abs(seg.b.y-seg.a.y)>Math.abs(seg.b.x-seg.a.x);const side=(Math.floor(d/12)%2?1:-1);if(vertical){rect(p.x+side*9,p.y-2,4,2,'#716246');rect(p.x-side*8,p.y+3,3,2,'#675a43');}else{rect(p.x-2,p.y+side*8,4,2,'#716246');rect(p.x+3,p.y-side*8,3,2,'#675a43');}}
    // Scrub, shattered fence, and supply crates around the playable route.
    const coverByMap=[
      [[8,12],[70,10],[166,14],[236,21],[318,40],[451,54],[73,112],[143,111],[307,250],[405,190]],
      [[22,39],[107,34],[120,188],[262,116],[294,108],[316,244],[405,205],[454,177],[183,249],[456,38]],
      [[24,92],[110,25],[118,245],[228,130],[257,160],[322,35],[349,248],[418,193],[449,45],[119,116]]
    ][mapIndex];
    coverByMap.forEach(([x,y],i)=>{const green=mapIndex===0?'#69734d':mapIndex===1?'#65705a':'#716b4b';rect(x,y,9,3,'#1e2920');rect(x+2,y-4,6,4,i%2?'#536247':green);rect(x+4,y-7,3,3,'#72794f');rect(x+2,y+1,2,3,'#514436');});
    const cratesByMap=[[[75,16],[175,20],[249,34],[334,47],[72,108]],[[115,32],[132,34],[296,117],[310,119],[402,180]],[[35,99],[112,236],[230,136],[261,169],[344,39],[421,186]]][mapIndex];
    for(const [x,y] of cratesByMap){rect(x,y,10,7,'#514536');rect(x+2,y-2,7,2,'#9b7448');rect(x+3,y+2,3,2,'#b88a52');rect(x+6,y+5,2,2,'#27281f');}
    if(mapIndex===1){
      // Flooded culvert markers and striped barricades make the second route feel industrial.
      for(const x of [112,124,136]){line(x,134,x+9,137,'#94a28a',1);line(x,139,x+9,142,'#94a28a',1);}
      for(const [x,y] of [[102,95],[276,103],[387,194]]){rect(x,y,23,5,'#292d26');rect(x+2,y-3,19,3,'#d3b574');for(let stripe=0;stripe<4;stripe++)rect(x+3+stripe*5,y-3,2,3,'#4b4b3c');rect(x+2,y+5,2,5,'#62543b');rect(x+20,y+5,2,5,'#62543b');}
      rect(29,34,38,2,'#a0a489');rect(29,39,38,2,'#a0a489');rect(29,44,38,2,'#a0a489');
    }else if(mapIndex===2){
      // Scrap piles, tyres and warning paint turn the final pass into a tighter salvage yard.
      for(const [x,y] of [[110,91],[111,100],[117,108],[320,147],[329,151],[339,155]]){g.beginPath();g.arc(x,y,4,0,Math.PI*2);g.fillStyle='#171d19';g.fill();g.strokeStyle='#778064';g.lineWidth=1;g.stroke();}
      for(const [x,y] of [[112,123],[124,123],[136,123],[315,34],[327,34],[339,34]]){rect(x,y,10,5,'#574b3c');rect(x+1,y-2,7,2,'#b38b55');rect(x+2,y+1,3,2,'#d0a761');}
      for(const [x,y] of [[31,80],[394,174]]){rect(x,y,27,3,'#ddbd78');for(let stripe=0;stripe<5;stripe++)rect(x+stripe*6,y,3,3,'#474638');rect(x+2,y+3,2,7,'#514436');rect(x+23,y+3,2,7,'#514436');}
    }
    // The campaign billboard is deliberately editable for the merchant using the game admin.
    rect(328,5,143,39,'#171c18');rect(332,8,135,31,'#d9dbbb');rect(334,10,131,27,'#36402f');rect(337,13,125,21,'#20271f');
    rect(337,13,2,21,'#f2b66d');rect(460,13,2,21,'#f2b66d');rect(341,15,4,4,'#d5e994');rect(342,16,2,2,'#34412b');
    g.fillStyle='#f0d28a';g.font='bold 9px Consolas,monospace';g.textAlign='left';g.fillText('YOUR AD HERE',348,21);
    g.fillStyle='#c7d4a0';g.font='bold 6px Consolas,monospace';g.fillText('EDIT IN-GAME ADMIN',341,30);
    rect(341,33,112,1,'#74835b');rect(344,39,3,8,'#64513a');rect(452,39,3,8,'#64513a');rect(340,45,118,2,'#242a20');
    // Safe house, gate lamps and sandbag line.
    rect(441,96,34,3,'#b8a36f');rect(444,99,29,20,'#817252');rect(439,97,38,5,'#4b4334');rect(446,101,25,15,'#9b8960');rect(448,103,6,5,'#b9a26d');rect(459,103,4,6,'#d3ba7c');rect(465,103,5,4,'#bca36d');rect(453,111,7,8,'#3a3328');rect(455,113,2,6,'#e0b761');
    rect(437,116,7,5,'#b3a67e');rect(442,122,7,4,'#c7b587');rect(451,122,6,4,'#9b8c69');rect(464,122,7,4,'#b6a77b');
    rect(429,91,2,12,'#56543a');rect(427,89,6,4,'#d3d18c');rect(426,87,8,2,'#88926a');
    // A small route marker and a torn warning flag change with each pass.
    const markerY=mapIndex===0?108:146;rect(20,markerY,2,21,'#554a37');rect(16,markerY-3,11,9,mapIndex===2?'#dda75d':'#d56d4c');g.fillStyle='#20231d';g.font='bold 5px Consolas,monospace';g.fillText(String(7+mapIndex*5).padStart(2,'0'),18,markerY+4);
    g=save;
  }

  function drawGround(){if(!terrain)buildTerrain();g.drawImage(terrain,0,0);}
  function drawSocket(index,now){
    const p=sockets[index],tower=towers.find(t=>t.socket===index),selected=index===selectedSocket,hover=index===hoverSocket;
    if(!tower){const pulse=hover?1.6:0.8+Math.sin(now/260+index)*.25;g.globalAlpha=.7;rect(p.x-8*pulse,p.y-1,16*pulse,2,'#b4d679');rect(p.x-1,p.y-8*pulse,2,16*pulse,'#b4d679');g.globalAlpha=1;rect(p.x-4,p.y-4,8,8,hover?'#cadc91':'#6c9155');rect(p.x-2,p.y-2,4,4,'#263827');rect(p.x-1,p.y-1,2,2,'#d7ec9a');if(hover){g.fillStyle='#e8f0d1';g.font='bold 6px Consolas,monospace';g.textAlign='center';g.fillText(weaponInfo[selectedWeapon].cost+' B',p.x,p.y-11);}}
    else{rect(p.x-9,p.y+5,18,3,'#171c18');rect(p.x-6,p.y+3,12,2,'#647146');if(selected){rect(p.x-12,p.y-12,24,1,'#d8ec87');rect(p.x-12,p.y+12,24,1,'#d8ec87');rect(p.x-12,p.y-12,1,24,'#d8ec87');rect(p.x+11,p.y-12,1,24,'#d8ec87');}}
  }
  function targetFor(tower){
    let target=null,best=-1;
    const mapBalance=mapIndex===0?.45:1;
    const range=weaponInfo[tower.type].range*mapBalance*(1+(tower.level-1)*.1);
    for(const enemy of enemies){
      if(enemy.hp<=0)continue;
      const d=Math.hypot(enemy.x-tower.x,enemy.y-tower.y);
      if(d<=range&&enemy.progress>best){best=enemy.progress;target=enemy;}
    }
    return target;
  }
  function drawTower(tower,now){
    const target=targetFor(tower),angle=target?Math.atan2(target.y-tower.y,target.x-tower.x):-.18,info=weaponInfo[tower.type],base=tower.type==='shotgun'?'#8d694b':tower.type==='launcher'?'#63774a':'#65754a';
    rect(tower.x-8,tower.y+3,16,5,'#262a21');rect(tower.x-6,tower.y+6,4,2,'#596044');rect(tower.x+2,tower.y+6,4,2,'#596044');
    rect(tower.x-6,tower.y-1,12,6,base);rect(tower.x-4,tower.y-3,8,3,tower.level>1?'#b5bd79':'#8f9b63');rect(tower.x-2,tower.y-5,5,4,tower.level>2?'#f1c071':'#657348');
    g.save();g.translate(Math.round(tower.x),Math.round(tower.y-2));g.rotate(angle);
    if(tower.type==='rifle'){
      rect(0,-2,10,4,'#45513c');rect(7,-2,14,3,tower.level>1?'#cad298':'#b6c284');rect(20,-1,3,2,'#252c23');rect(-7,-2,6,4,'#657552');rect(1,2,3,6,'#4b5440');rect(-10,-1,4,3,'#b3bd7b');rect(10,-3,3,1,'#dae3a4');
    }else if(tower.type==='shotgun'){
      rect(-5,-2,13,5,'#704f38');rect(3,-3,12,2,'#c1a075');rect(3,1,12,2,'#a7855d');rect(14,-3,3,2,'#d4c09a');rect(14,1,3,2,'#d4c09a');rect(-7,-1,5,3,'#bd9a69');rect(-1,3,3,5,'#594638');
    }else{
      rect(-5,-3,10,7,'#566a43');rect(2,-4,15,8,'#8b9a5d');rect(15,-3,6,6,'#b4bd80');rect(20,-2,3,4,'#dcac64');rect(-7,-1,4,3,'#d1c58c');rect(-1,3,3,5,'#424b38');rect(8,-5,2,1,'#d1dc97');
    }
    g.restore();
    if(target&&now-tower.flash<90){g.globalAlpha=.9;rect(tower.x+Math.cos(angle)*18-2,tower.y+Math.sin(angle)*18-2,4,4,info.color);g.globalAlpha=1;}
    if(tower.level>1){rect(tower.x-2,tower.y-12,4,3,'#d8ec87');if(tower.level>2)rect(tower.x+3,tower.y-12,3,3,'#f5a65b');}
  }
  function drawZombie(enemy,now){
    const x=Math.round(enemy.x),y=Math.round(enemy.y),phase=Math.floor(now/120+(enemy.seed||0))%2,brute=enemy.kind==='brute',runner=enemy.kind==='runner';
    const skin=brute?'#918359':runner?'#a6a56a':'#86a26a',shirt=brute?'#635b43':runner?'#6d7960':'#596b52',trouser='#373d33';
    rect(x-6,y+6,12,3,'#20231c');
    rect(x-4,y-6,8,6,skin);rect(x-3,y-8,2,3,skin);rect(x+2,y-8,2,3,skin);rect(x-3,y-3,2,1,'#e0c887');rect(x+2,y-3,2,1,'#df8064');rect(x-1,y-1,3,1,'#444338');
    rect(x-4,y,8,7,shirt);rect(x-7,y+1,4,2,skin);rect(x+3,y+2+(phase?1:0),4,2,skin);rect(x-3,y+6,3,4,trouser);rect(x+1,y+6,3,4,trouser);
    rect(x-4,y+9+(phase?1:0),4,2,'#b18159');rect(x+1,y+9+(phase?0:1),4,2,'#b18159');rect(x+4,y-1,2,2,'#d7ad69');
    if(brute){rect(x-6,y-1,2,8,'#ab8e59');rect(x+4,y-2,3,8,'#ab8e59');}
    if(runner){rect(x-5,y+2,2,2,'#b7b886');rect(x+4,y+3,2,2,'#b7b886');}
    const maxHp=enemy.maxHp,barw=brute?15:11;rect(x-Math.floor(barw/2),y-12,barw,2,'#221f1c');rect(x-Math.floor(barw/2),y-12,barw*Math.max(0,enemy.hp/maxHp),2,enemy.hp/maxHp>.45?'#aad36c':'#e1785a');
  }
  function drawHouseLight(now){const pulse=Math.floor(now/160)%2?1:0;rect(468,103,3,3,pulse?'#ffdc83':'#d49156');rect(438,117,2,3,pulse?'#e7da9d':'#968d64');}
  function drawAdPlacard(){
    if(mode!=='wave'||adClock>2500)return;
    const enter=Math.min(1,adClock/330),leave=Math.min(1,(2500-adClock)/360),progress=Math.max(0,Math.min(enter,leave));
    const side=adCycle%4,w=148,h=42;
    let x=166,y=8;
    if(side===0)y=-h-3+(h+11)*progress;
    else if(side===1)y=270+3-(h+11)*progress;
    else if(side===2){x=-w-3+(w+11)*progress;y=112;}
    else{x=483-(w+11)*progress;y=112;}
    rect(x+4,y+4,w,h,'#0f1410');rect(x,y,w,h,'#e1e2c8');rect(x+3,y+3,w-6,h-6,'#222a20');rect(x+7,y+7,w-14,h-14,'#131a15');
    rect(x+7,y+7,4,h-14,'#e5a85f');rect(x+w-11,y+7,4,h-14,'#e5a85f');
    // Pixel sleeves and hands grip the sign as it slides in from each edge.
    rect(x-8,y+13,8,13,'#65774a');rect(x-3,y+15,5,8,'#e4c392');rect(x+w,y+13,8,13,'#65774a');rect(x+w-2,y+15,5,8,'#e4c392');
    rect(x+18,y+11,5,5,'#d7ec87');g.fillStyle='#e7d9a6';g.font='bold 10px Consolas,monospace';g.textAlign='left';g.fillText('YOUR AD HERE',x+29,y+19);
    g.fillStyle='#c4c9a6';g.font='bold 7px Consolas,monospace';g.fillText('YOUR BRAND HERE',x+29,y+31);
  }
  function drawWorld(now){
    drawGround();drawHouseLight(now);
    for(let i=0;i<sockets.length;i++)drawSocket(i,now);
    for(const tower of towers)drawTower(tower,now);
    for(const enemy of enemies)if(enemy.hp>0)drawZombie(enemy,now);
    for(const shot of shots){const p=shot.kind==='launcher'?2:1;rect(shot.x-p,shot.y-p,p*2+1,p*2+1,shot.kind==='launcher'?'#e7ad62':shot.kind==='shotgun'?'#ffd08c':'#f5e594');if(shot.kind==='launcher')rect(shot.x-1,shot.y-3,2,2,'#687a4d');}
    for(const fx of effects){const a=Math.max(0,fx.life/fx.max);g.globalAlpha=a;if(fx.type==='tracer'){line(fx.x1,fx.y1,fx.target.x,fx.target.y,fx.color,fx.weapon==='launcher'?2:1,fx.weapon==='shotgun'?[2,2]:[]);rect(fx.x1-2,fx.y1-2,4,4,'#fff0b5');}else if(fx.type==='blast'){g.beginPath();g.arc(fx.x,fx.y,Math.max(2,fx.radius*(1-a*.45)),0,Math.PI*2);g.strokeStyle=fx.color;g.lineWidth=2;g.stroke();rect(fx.x-2,fx.y-2,4,4,'#fff0b5');}else{rect(fx.x-fx.radius,fx.y-1,fx.radius*2,2,fx.color);rect(fx.x-1,fx.y-fx.radius,2,fx.radius*2,fx.color);rect(fx.x-2,fx.y-2,4,4,'#fff0b5');}g.globalAlpha=1;}
    if(mode==='wave'){const gatePulse=Math.floor(now/130)%2?0.48:0.16;g.globalAlpha=gatePulse;rect(436,104,35,20,'#f47455');g.globalAlpha=1;}
    if(mode==='lost'){rect(436,104,35,20,'#f47455');g.globalAlpha=.88;g.fillStyle='#1d1713';g.font='bold 9px Consolas,monospace';g.textAlign='center';g.fillText('BASE HIT',454,116);g.globalAlpha=1;}
    drawAdPlacard();
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(art,0,0,canvas.width,canvas.height);
  }
  function updateHUD(){
    $('[data-zd-wave]').textContent=String(Math.min(waveIndex+1,3)).padStart(2,'0')+' / 03';
    $('[data-zd-lives]').textContent=Array.from({length:maxLives},(_,i)=>i<lives?'♥':'♡').join(' ');
    $('[data-zd-cash]').textContent=String(cash).padStart(3,'0');
    const shownWave=mode==='wave'?waveIndex:Math.max(0,waveIndex-1);
    const total=waves[Math.min(shownWave,2)].length, denominator=spawned+spawnQueue.length;
    const remaining=mode==='wave'?enemies.length+'/'+denominator:(waveIndex>=3?`${waves[2].length} / ${waves[2].length}`:`${resolved} / ${total}`);
    $('[data-zd-enemies]').textContent=remaining;
    const fraction=mode==='wave'?(denominator?Math.min(100,resolved/denominator*100):0):waveIndex===0?0:Math.min(100,resolved/total*100);
    $('[data-zd-progress]').style.width=fraction+'%';
    const status=$('[data-zd-status]');
    $('[data-zd-zone]').textContent=mapZones[mapIndex];
    if(mode==='ready'&&waveIndex===0)status.textContent='Three lanes · 12 walkers · 360 bolts. Cover each route.';
    else if(mode==='ready'&&waveIndex===1)status.textContent='Four lanes · 24 hostiles next. Reinforce the merge.';
    else if(mode==='ready'&&waveIndex===2)status.textContent='Five lanes · 30 hostiles next. Upgrade your posts.';
    else if(mode==='wave'&&weaponsResting)status.textContent='Weapons cooling · hold the safe house.';
    else if(mode==='wave'&&waveIndex===0)status.textContent='Three routes active · four walkers on each lane.';
    else if(mode==='wave'&&waveIndex===1)status.textContent='Four routes active · six hostiles on each lane.';
    else if(mode==='wave'&&waveIndex===2)status.textContent='Five routes active · six hostiles on each lane.';
    else if(mode==='wave')status.textContent='Defenses firing automatically · protect the safe house.';
    else if(mode==='paused')status.textContent='Radio silence. Resume when ready.';
    else if(mode==='win')status.textContent='Three passes defended · coupon unlocked.';
    else if(mode==='lost')status.textContent='The outpost fell. Rebuild and try again.';
    status.classList.toggle('is-cooling',mode==='wave'&&weaponsResting);
    const start=$('[data-zd-next]'),upgrade=$('[data-zd-upgrade]');
    if(mode==='wave'){start.disabled=true;start.innerHTML='WAVE IN PROGRESS <span aria-hidden="true">···</span>';}
    else if(mode==='win'||mode==='lost'){start.disabled=true;start.innerHTML='DEFENSE COMPLETE';}
    else if(waveIndex>=3){start.disabled=true;start.innerHTML='DEFENSE COMPLETE';}
    else{start.disabled=false;start.innerHTML=`START PASS ${String(waveIndex+1).padStart(2,'0')} <span aria-hidden="true">→</span>`;}
    const tower=towers.find(t=>t.socket===selectedSocket);
    const selection=$('[data-zd-selection]');
    if(tower){selection.textContent=`${weaponInfo[tower.type].name.toUpperCase()} · LV ${tower.level} · SOCKET ${String(selectedSocket+1).padStart(2,'0')}`;upgrade.disabled=tower.level>=3||cash<70;upgrade.textContent=tower.level>=3?'MAX LEVEL · LV 03':`UPGRADE POST · ${tower.level===1?70:110} BOLTS`;}
    else{selection.textContent='No emplacement selected';upgrade.disabled=true;upgrade.textContent='UPGRADE POST · 70 BOLTS';}
    buttons.forEach(button=>{const chosen=button.dataset.zdWeapon===selectedWeapon;button.classList.toggle('is-selected',chosen);button.setAttribute('aria-pressed',String(chosen));});
    $('[data-zd-pause]').disabled=!['wave','paused'].includes(mode);
    $('[data-zd-pause]').setAttribute('aria-pressed',String(mode==='paused'));
  }
  function setStatus(text){$('[data-zd-status]').textContent=text;}
  function chooseWeapon(type){selectedWeapon=type;selectedSocket=-1;updateHUD();}
  function buildAt(index){
    const existing=towers.find(t=>t.socket===index);
    if(existing){selectedSocket=index;selectedWeapon=existing.type;updateHUD();return;}
    if(mode!=='ready'){setStatus('Wait for the pass to end before building.');return;}
    const info=weaponInfo[selectedWeapon];
    if(cash<info.cost){setStatus(`Need ${info.cost-cash} more bolts for the ${info.name.toLowerCase()}.`);return;}
    cash-=info.cost;towers.push({socket:index,x:sockets[index].x,y:sockets[index].y,type:selectedWeapon,level:1,cooldownLeft:0,flash:0});selectedSocket=index;updateHUD();
    setStatus(`${info.name} built. It will fire automatically when the pass starts.`);
  }
  function upgradeSelected(){const tower=towers.find(t=>t.socket===selectedSocket);if(!tower||tower.level>=3)return;const cost=tower.level===1?70:110;if(cash<cost){setStatus('Earn more bolts before upgrading this post.');return;}cash-=cost;tower.level++;updateHUD();setStatus(`${weaponInfo[tower.type].name} upgraded to level ${tower.level}.`);}
  function startWave(){
    if(mode!=='ready'||waveIndex>=3)return;
    configureMap(waveIndex);fireRestClock=0;weaponsResting=false;
    adClock=0;
    spawnQueue=waves[waveIndex].map((kind,i)=>({kind,lane:i%routes.length,delay:i===0?0:(kind==='runner'?500:kind==='brute'?760:640)}));spawned=0;resolved=0;spawnTimer=0;enemies=[];shots=[];mode='wave';
    setStatus(`Pass ${waveIndex+1}: incoming. Keep the outpost standing.`);updateHUD();
  }
  function spawn(kind,lane=0){
    const factor=1+waveIndex*.19;const stat=kind==='brute'?{hp:142*factor,speed:23+waveIndex*2,bounty:48}:kind==='runner'?{hp:39*factor,speed:49+waveIndex*3,bounty:30}:{hp:50*factor,speed:34+waveIndex*2,bounty:24};
    const route=routes[lane]||routes[0];
    enemies.push({kind,lane,x:route[0].x,y:route[0].y,progress:0,hp:stat.hp,maxHp:stat.hp,speed:stat.speed,bounty:stat.bounty,seed:Math.random()*4});spawned++;
  }
  function fire(tower,target,now){
    if(!target||target.hp<=0)return;
    const info=weaponInfo[tower.type],level=tower.level,multiplier=1+(level-1)*.35,interval=info.cooldown*(level===1?1:level===2?.85:.72),damage=info.damage*multiplier;
    if(tower.cooldownLeft>0)return;
    tower.cooldownLeft=interval;tower.flash=now;
    effects.push({type:'tracer',x1:tower.x,y1:tower.y-2,target,weapon:tower.type,color:info.color,life:.16,max:.16});
    if(tower.type==='shotgun'){
      const group=enemies.filter(enemy=>enemy.hp>0&&Math.hypot(enemy.x-target.x,enemy.y-target.y)<=info.splash+13).slice(0,4);
      for(const enemy of group.length?group:[target])damageEnemy(enemy,damage);
    }else if(tower.type==='launcher'){
      effects.push({type:'blast',x:target.x,y:target.y,radius:info.splash,color:'#f1a056',life:.28,max:.28});
      for(const enemy of enemies){if(enemy.hp>0&&Math.hypot(enemy.x-target.x,enemy.y-target.y)<=info.splash)damageEnemy(enemy,damage);}
    }else damageEnemy(target,damage);
  }
  function damageEnemy(enemy,damage){if(enemy.hp<=0)return;enemy.hp-=damage;if(enemy.hp<=0){enemy.hp=0;cash+=enemy.bounty;resolved++;effects.push({x:enemy.x,y:enemy.y,radius:6,color:'#bddc79',life:.24,max:.24});}}
  function finishPass(){
    if(mode!=='wave'||spawnQueue.length||enemies.length||shots.length)return;
    mode='ready';waveIndex++;updateHUD();
    if(waveIndex>=3){mode='win';$('[data-zd-result-kicker]').textContent='OUTPOST SECURED · 3 / 3';$('[data-zd-result-title]').textContent='The road is clear.';$('[data-zd-result-copy]').textContent='Three zombie passes stopped. Your 10% reward is ready.';$('[data-zd-coupon]').hidden=false;$('[data-zd-result]').hidden=false;setStatus('Three passes defended · coupon unlocked.');}
    else setStatus(`Pass ${waveIndex} cleared. Spend bolts, then start pass ${waveIndex+1}.`);
    updateHUD();
  }
  function fail(){if(mode==='lost'||mode==='win')return;mode='lost';$('[data-zd-result-kicker]').textContent='OUTPOST LOST';$('[data-zd-result-title]').textContent='The road was overrun.';$('[data-zd-result-copy]').textContent='Rebuild your defenses and give the crew another chance.';$('[data-zd-coupon]').hidden=true;$('[data-zd-result]').hidden=false;updateHUD();}
  function update(dt,now){
    elapsed+=dt;
    if(mode==='wave'){
      adClock+=dt;if(adClock>=9800){adClock-=9800;adCycle++;}
      fireRestClock=(fireRestClock+dt)%13200;weaponsResting=fireRestClock>=12000;
      spawnTimer+=dt;
      while(spawnQueue.length&&spawnTimer>=spawnQueue[0].delay){const item=spawnQueue.shift();spawnTimer=0;spawn(item.kind,item.lane);}
      for(const enemy of enemies){enemy.progress+=enemy.speed*dt/1000;const p=pointAt(enemy.progress,enemy.lane);enemy.x=p.x;enemy.y=p.y;if(enemy.progress>=pathLengths[enemy.lane]){enemy.hp=0;lives=Math.max(0,lives-1);resolved++;effects.push({x:454,y:115,radius:12,color:'#f47557',life:.34,max:.34});if(lives<=0)fail();}}
      enemies=enemies.filter(e=>e.hp>0);
      for(const tower of towers){tower.cooldownLeft=Math.max(0,(tower.cooldownLeft||0)-dt);if(!weaponsResting){const target=targetFor(tower);if(target)fire(tower,target,now);}}
      for(const shot of shots){shot.life-=dt/1000;const target=shot.target;if(!target||target.hp<=0||shot.life<=0)continue;const dx=target.x-shot.x,dy=target.y-shot.y,d=Math.hypot(dx,dy),move=shot.speed*dt/1000;if(d<=move+2){shot.x=target.x;shot.y=target.y;if(shot.kind==='launcher'){effects.push({x:target.x,y:target.y,radius:shot.splash,color:'#f1a056',life:.28,max:.28});for(const nearby of enemies){if(nearby.hp>0&&Math.hypot(nearby.x-target.x,nearby.y-target.y)<=shot.splash)damageEnemy(nearby,shot.damage);}}else damageEnemy(target,shot.damage);shot.life=0;}else{shot.x+=dx/d*move;shot.y+=dy/d*move;}}
      shots=shots.filter(s=>s.life>0);enemies=enemies.filter(e=>e.hp>0);if(lives<=0)fail();else finishPass();
    }
    effects.forEach(fx=>fx.life-=dt/1000);effects=effects.filter(fx=>fx.life>0);
    updateHUD();
  }
  function loop(now){const dt=lastTime===null?0:Math.max(0,Math.min(40,now-lastTime));lastTime=now;if(mode!=='paused')update(dt,now);drawWorld(now);requestAnimationFrame(loop);}
  function canvasPoint(event){
    const rect=canvas.getBoundingClientRect();
    if(rect.width<=0||rect.height<=0)return{x:-1,y:-1};
    return{x:(event.clientX-rect.left)*480/rect.width,y:(event.clientY-rect.top)*270/rect.height};
  }
  function socketAt(p){let found=-1,best=100;for(let i=0;i<sockets.length;i++){const d=Math.hypot(p.x-sockets[i].x,p.y-sockets[i].y);if(d<best){found=i;best=d;}}return best<12?found:-1;}
  canvas.addEventListener('pointermove',event=>{const p=canvasPoint(event);hoverSocket=socketAt(p);});
  canvas.addEventListener('pointerleave',()=>hoverSocket=-1);
  canvas.addEventListener('pointerdown',event=>{event.preventDefault();const p=canvasPoint(event),index=socketAt(p);if(index>=0)buildAt(index);else selectedSocket=-1;updateHUD();});
  buttons.forEach(button=>button.addEventListener('click',()=>chooseWeapon(button.dataset.zdWeapon)));
  $('[data-zd-next]').addEventListener('click',startWave);
  $('[data-zd-upgrade]').addEventListener('click',upgradeSelected);
  $('[data-zd-pause]').addEventListener('click',()=>{if(mode==='wave'){pausedFrom='wave';mode='paused';$('[data-zd-pause-layer]').hidden=false;}else if(mode==='paused'){mode=pausedFrom;$('[data-zd-pause-layer]').hidden=true;}updateHUD();});
  $('[data-zd-resume]').addEventListener('click',()=>{if(mode==='paused')mode=pausedFrom;$('[data-zd-pause-layer]').hidden=true;updateHUD();});
  async function copyCoupon(){const status=$('[data-zd-copy-status]');try{await navigator.clipboard.writeText('LEMMING10');status.textContent='Copied — apply LEMMING10 at checkout.';}catch{status.textContent='Your reward code: LEMMING10';}}
  $('[data-zd-copy]').addEventListener('click',copyCoupon);
  function restart(){mode='ready';pausedFrom='ready';waveIndex=0;lives=maxLives;cash=360;selectedWeapon='rifle';selectedSocket=-1;hoverSocket=-1;towers=[];enemies=[];shots=[];effects=[];spawnQueue=[];spawnTimer=0;spawned=0;resolved=0;adClock=0;adCycle=0;$('[data-zd-result]').hidden=true;$('[data-zd-pause-layer]').hidden=true;$('[data-zd-copy-status]').textContent='';updateHUD();}
  $('[data-zd-restart]').addEventListener('click',restart);
  $('[data-zd-again]').addEventListener('click',restart);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&mode==='paused'){mode=pausedFrom;$('[data-zd-pause-layer]').hidden=true;updateHUD();}
    if(event.code==='Space'&&mode==='ready'){event.preventDefault();startWave();}
    if(event.key.toLowerCase()==='p'){if(mode==='wave'){$('[data-zd-pause]').click();}else if(mode==='paused')$('[data-zd-resume]').click();}
    if(['1','2','3'].includes(event.key))chooseWeapon(['rifle','shotgun','launcher'][Number(event.key)-1]);
  });
  buildTerrain();updateHUD();drawWorld(performance.now());requestAnimationFrame(loop);
})();
