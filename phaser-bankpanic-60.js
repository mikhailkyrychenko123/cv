(() => {
  const W = 960, H = 540, REACTION_WINDOW = 2.6, TARGETS_TO_WIN = 10, TARGETS_PER_WAVE = 5, COUPON = 'LEMMING10';
  const startScreen = document.getElementById('bp-start');
  const pauseScreen = document.getElementById('bp-pause-screen');
  const resultScreen = document.getElementById('bp-result');
  const pauseButton = document.getElementById('bp-pause');
  const errorBox = document.getElementById('bp-error');
  const startButton = document.getElementById('bp-start-button');
  const doorButtons = [...document.querySelectorAll('[data-bp-door]')];
  startButton.disabled = true;
  let game = null;
  let selectedLane = 1;

  function makeBank(scene) {
    const bg = scene.add.graphics();
    bg.fillStyle(0xf1dfb9).fillRect(0, 0, W, H);
    bg.fillStyle(0xe6d0a6).fillRect(0, 0, W, 112);
    bg.fillStyle(0x7a5135).fillRect(0, 474, W, 66);
    bg.fillStyle(0x5b3b2b).fillRect(0, 474, W, 12);
    for (let x = 12; x < W; x += 48) {
      bg.lineStyle(1, 0xb98553, .6).lineBetween(x, 487, x, H);
      bg.lineStyle(1, 0x3d2c22, .4).lineBetween(0, 505 + ((x / 48) % 2) * 12, W, 505 + ((x / 48) % 2) * 12);
    }
    bg.lineStyle(12, 0xff42cf, .17).strokeRoundedRect(249, 12, 462, 88, 13);
    bg.fillStyle(0x111822).fillRoundedRect(255, 18, 450, 76, 10);
    bg.lineStyle(3, 0xff48ce, .95).strokeRoundedRect(258, 21, 444, 70, 8);
    bg.lineStyle(1, 0x69fff0, .9).strokeRoundedRect(265, 28, 430, 56, 5);
    bg.fillStyle(0x6affed, .9).fillPoints([{x:285,y:44},{x:291,y:53},{x:302,y:55},{x:294,y:62},{x:296,y:73},{x:285,y:67},{x:275,y:73},{x:277,y:62},{x:269,y:55},{x:280,y:53}],true);
    bg.fillStyle(0xff5bd5, .95).fillCircle(675, 56, 7);
    bg.lineStyle(2, 0xff5bd5, .95).lineBetween(675, 41, 675, 71).lineBetween(660, 56, 690, 56);
    const adMarker=scene.add.text(480, 33, 'YOUR AD HERE', {fontFamily:'Arial,sans-serif',fontSize:'9px',fontStyle:'bold',color:'#ff8ee3',stroke:'#3b1635',strokeThickness:2,letterSpacing:3}).setOrigin(.5);
    adMarker.setShadow(0,0,'#ff46d1',8,true,true);
    const neonName=scene.add.text(480, 53, 'YOUR BRAND HERE', {fontFamily:'Arial,sans-serif',fontSize:'24px',fontStyle:'bold',color:'#b8fff6',stroke:'#ed39be',strokeThickness:4,letterSpacing:2}).setOrigin(.5);
    neonName.setShadow(0,0,'#56fff0',12,true,true);
    const neonTag=scene.add.text(480, 77, 'MAKE YOUR MARK · OWN THE FRONTIER', {fontFamily:'Arial,sans-serif',fontSize:'8px',fontStyle:'bold',color:'#ff82df',stroke:'#31152f',strokeThickness:1,letterSpacing:2}).setOrigin(.5);
    neonTag.setShadow(0,0,'#ff46d1',7,true,true);
    for (let i = 0; i < 3; i++) {
      const x = [185, 480, 775][i];
      bg.fillStyle(0xb48250).fillRect(x - 83, 183, 166, 294);
      bg.fillStyle(0x402f25).fillRect(x - 70, 197, 140, 278);
      bg.fillStyle(0x78513a).fillRect(x - 57, 211, 114, 264);
      bg.fillStyle(0x2f2b26).fillRect(x - 47, 222, 94, 253);
      bg.lineStyle(5, 0xd0a45d).strokeRect(x - 76, 191, 152, 289);
      bg.lineStyle(2, 0x9b7245).strokeRect(x - 62, 205, 124, 270);
      bg.fillStyle(0xd8b36d).fillCircle(x + 31, 354, 5);
      bg.fillStyle(0x8f6840).fillRoundedRect(x - 49, 151, 98, 25, 4);
      bg.lineStyle(2, 0x4a3828).strokeRoundedRect(x - 49, 151, 98, 25, 4);
      scene.add.text(x, 163, 'DOOR ' + (i + 1), {fontFamily:'Arial,sans-serif',fontSize:'11px',fontStyle:'bold',color:'#fff0cb',letterSpacing:1}).setOrigin(.5);
      // Brass lamps add a distinct visual marker to each doorway.
      bg.fillStyle(0x70492d).fillRect(x - 3, 126, 6, 26);
      bg.fillStyle(0xf6c85c).fillCircle(x, 131, 8);
      bg.fillStyle(0xffedb7, .38).fillCircle(x, 137, 17);
    }
    for (let x = 68; x < 920; x += 170) {
      bg.fillStyle(0xb99360).fillRect(x, 113, 8, 354);
      bg.fillStyle(0xead9b8).fillRect(x + 8, 113, 3, 354);
      bg.fillStyle(0x9e784d).fillRect(x - 8, 111, 25, 8);
      bg.fillStyle(0x9e784d).fillRect(x - 8, 465, 25, 8);
    }
    for (const x of [330, 630]) {
      bg.fillStyle(0x283b3d).fillRoundedRect(x - 30, 435, 60, 39, 4);
      bg.lineStyle(2, 0x69fff0, .95).strokeRoundedRect(x - 30, 435, 60, 39, 4);
      bg.fillStyle(0x4d3327).fillRect(x - 26, 439, 52, 6);
      bg.fillStyle(0xa72f68).fillRoundedRect(x - 19, 418, 15, 25, 4);
      bg.fillStyle(0x69fff0).fillRect(x - 17, 423, 11, 3);
      bg.fillStyle(0x35172b).fillRoundedRect(x + 4, 418, 15, 25, 4);
      bg.fillStyle(0xff65d8).fillRect(x + 6, 423, 11, 3);
      scene.add.text(x, 456, 'MS', {fontFamily:'Arial,sans-serif',fontSize:'12px',fontStyle:'bold',color:'#b8fff6',stroke:'#153337',strokeThickness:2}).setOrigin(.5).setDepth(2);
    }
    const glow = scene.add.graphics().setDepth(4);
    const bar = scene.add.graphics().setDepth(12);
    const status = scene.add.text(480, 501, 'YOUR BRAND HERE · WATCH THE DOORS', {fontFamily:'Arial,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#fff0c9',backgroundColor:'#292d26',padding:{x:12,y:7},letterSpacing:1}).setOrigin(.5).setDepth(13);
    const roundLabel = scene.add.text(480, 119, 'WAVE 01', {fontFamily:'Arial,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#423323',letterSpacing:2}).setOrigin(.5).setDepth(5);
    return {glow, bar, status, roundLabel};
  }

  function createBandit(scene, x, color) {
    const person = scene.add.container(x, 415).setDepth(8).setAlpha(0).setScale(.86);
    const art = scene.add.graphics();
    const skin = Phaser.Utils.Array.GetRandom([0xb77850, 0xc78a5e, 0xd5a06e, 0x986447]);
    const shade = Phaser.Display.Color.IntegerToColor(skin).darken(22).color;
    const coatShade = Phaser.Display.Color.IntegerToColor(color).darken(24).color;

    // Boots, worn trousers and a belt give the figure a more grounded silhouette.
    art.fillStyle(0x38291f, .55).fillEllipse(0, 54, 48, 9);
    art.fillStyle(0x30302b).fillPoints([{x:-18,y:22},{x:-3,y:22},{x:-5,y:44},{x:-9,y:51},{x:-21,y:51},{x:-20,y:44}], true);
    art.fillStyle(0x373630).fillPoints([{x:3,y:22},{x:18,y:22},{x:20,y:44},{x:22,y:51},{x:8,y:51},{x:5,y:44}], true);
    art.lineStyle(2, 0x20211f, .85).lineBetween(-11, 26, -13, 44).lineBetween(11, 26, 13, 44);
    art.fillStyle(0x493426).fillPoints([{x:-21,y:43},{x:-9,y:43},{x:-7,y:50},{x:-6,y:54},{x:-28,y:54},{x:-28,y:51}], true);
    art.fillStyle(0x493426).fillPoints([{x:8,y:43},{x:20,y:43},{x:28,y:49},{x:29,y:54},{x:7,y:54}], true);
    art.lineStyle(2, 0x241d18, .9).lineBetween(-27, 51, -7, 51).lineBetween(8, 51, 28, 51);
    art.fillStyle(0x806044).fillRect(-20, 21, 15, 5).fillRect(5, 21, 15, 5);

    // Jacket, vest, sleeves and hands are drawn as separate layers for readable anatomy.
    art.fillStyle(coatShade).fillPoints([{x:-19,y:-3},{x:-27,y:0},{x:-31,y:16},{x:-25,y:23},{x:-20,y:12},{x:-18,y:35},{x:18,y:35},{x:20,y:12},{x:26,y:23},{x:32,y:16},{x:27,y:0},{x:18,y:-4}], true);
    art.fillStyle(color).fillPoints([{x:-18,y:-2},{x:-26,y:2},{x:-27,y:15},{x:-23,y:17},{x:-18,y:8},{x:-16,y:29},{x:16,y:29},{x:18,y:8},{x:23,y:17},{x:27,y:15},{x:25,y:2},{x:17,y:-2}], true);
    art.lineStyle(2, 0x271f19, .72).lineBetween(-27, 4, -23, 15).lineBetween(25, 4, 22, 15);
    art.fillStyle(0xc89b61).fillPoints([{x:-7,y:-2},{x:0,y:5},{x:7,y:-2},{x:12,y:25},{x:0,y:31},{x:-12,y:25}], true);
    art.fillStyle(0x50382a).fillPoints([{x:-5,y:2},{x:0,y:7},{x:4,y:2},{x:7,y:27},{x:0,y:29},{x:-7,y:27}], true);
    art.lineStyle(2, 0xe1bd78, .8).lineBetween(-8, 0, -4, 9).lineBetween(8, 0, 4, 9);
    art.fillStyle(0xb28a55).fillRoundedRect(-23, 25, 46, 6, 2);
    art.fillStyle(0xdec17f).fillRoundedRect(-4, 23, 9, 10, 2);
    art.fillStyle(0x6c482e).fillRoundedRect(17, 20, 10, 16, 2);
    art.lineStyle(1, 0xb18a58, .85).strokeRoundedRect(17, 20, 10, 16, 2);
    art.fillStyle(0xc58c5b).fillRoundedRect(-30, 13, 9, 9, 4).fillRoundedRect(22, 13, 10, 9, 4);

    // Neck cloth and shaped face with ears, shadow, nose and moustache.
    art.fillStyle(0x9d3d31).fillPoints([{x:-10,y:-11},{x:10,y:-11},{x:12,y:-2},{x:0,y:5},{x:-12,y:-2}], true);
    art.fillStyle(skin).fillRoundedRect(-12, -47, 24, 31, 8);
    art.fillStyle(shade).fillRoundedRect(-15, -38, 4, 9, 2).fillRoundedRect(11, -38, 4, 9, 2);
    art.fillStyle(0xe4b27b, .75).fillRoundedRect(-8, -43, 4, 17, 2);
    art.fillStyle(0x35271e).fillRoundedRect(-9, -37, 5, 3, 1).fillRoundedRect(4, -37, 5, 3, 1);
    art.lineStyle(2, 0x35271e, .9).lineBetween(-10, -40, -3, -41).lineBetween(3, -41, 10, -40);
    art.fillStyle(shade).fillPoints([{x:-2,y:-34},{x:2,y:-34},{x:4,y:-27},{x:0,y:-25},{x:-3,y:-27}], true);
    art.fillStyle(0x493126).fillRoundedRect(-7, -25, 14, 6, 3);
    art.fillStyle(0x241d18).fillRoundedRect(-9, -26, 9, 5, 3).fillRoundedRect(0, -26, 9, 5, 3);
    art.lineStyle(1, 0x211a16, .9).lineBetween(-5, -18, 5, -18);

    // Broad, creased hat with a band reads clearly as a working cowboy hat.
    art.fillStyle(0x31261e).fillPoints([{x:-30,y:-48},{x:-25,y:-53},{x:-15,y:-51},{x:-9,y:-49},{x:0,y:-48},{x:10,y:-51},{x:23,y:-53},{x:30,y:-49},{x:24,y:-45},{x:-23,y:-45}], true);
    art.fillStyle(0x68442b).fillPoints([{x:-17,y:-50},{x:-14,y:-69},{x:-9,y:-74},{x:8,y:-74},{x:14,y:-69},{x:17,y:-50}], true);
    art.lineStyle(2, 0x38281e, .9).strokePoints([{x:-17,y:-50},{x:-14,y:-69},{x:-9,y:-74},{x:8,y:-74},{x:14,y:-69},{x:17,y:-50}], true);
    art.fillStyle(0x38271e).fillRoundedRect(-16, -55, 32, 5, 2);
    art.lineStyle(1, 0xc39a60, .9).lineBetween(-15, -54, 15, -54);
    art.lineStyle(2, 0x9c7144, .65).lineBetween(-8, -69, 0, -66).lineBetween(0, -66, 8, -69);

    const gun = scene.add.graphics();
    gun.fillStyle(0x292a28).fillRoundedRect(12, 7, 24, 6, 2);
    gun.fillStyle(0x514333).fillPoints([{x:17,y:12},{x:24,y:12},{x:22,y:24},{x:16,y:22}], true);
    gun.fillStyle(0x77766d).fillRoundedRect(16, 6, 7, 8, 2);
    gun.fillStyle(0x171918).fillRect(33, 8, 7, 3);
    gun.lineStyle(1, 0xc6b17e, .8).lineBetween(25, 8, 32, 8);
    person.add([art, gun]);
    person.setData('gun', gun);
    scene.tweens.add({targets:person,alpha:1,scale:1,duration:260,ease:'Back.Out'});
    return person;
  }

  class BankScene extends Phaser.Scene {
    constructor(){super('BankScene');this.active=false;this.paused=false;this.ended=false;this.remaining=REACTION_WINDOW;this.state='idle';this.resolved=0;this.score=0;this.lives=3;this.target=null;this.targetLane=-1;this.nextTargetEvent=null;}
    create(){
      this.cameras.main.setBackgroundColor('#f1dfb9');
      const art=makeBank(this);this.glow=art.glow;this.timerBar=art.bar;this.status=art.status;this.roundLabel=art.roundLabel;
      startButton.disabled=false;
      this.keys=this.input.keyboard.addKeys('ONE,TWO,THREE,SPACE,LEFT,RIGHT,ENTER');
      this.input.on('pointerdown',pointer=>{if(!this.active||this.paused||this.ended)return;if(pointer.y>170&&pointer.y<480){const lane=Phaser.Math.Clamp(Math.round((pointer.x-185)/295),0,2);this.selectLane(lane);this.shoot(lane);}});
      this.syncHud();this.refreshDoorGlow();
    }
    start(){this.active=true;this.paused=false;this.ended=false;this.resolved=0;this.score=0;this.lives=3;this.state='idle';this.selectedLane=1;selectedLane=1;this.clearTarget();resultScreen.hidden=true;pauseScreen.hidden=true;this.syncPauseButton(false);this.syncHud();this.scheduleTarget(400);}
    update(time,delta){
      if(!this.active||this.paused||this.ended)return;
      const dt=Math.min(.05,delta/1000);
      if(Phaser.Input.Keyboard.JustDown(this.keys.ONE))this.selectLane(0);
      if(Phaser.Input.Keyboard.JustDown(this.keys.TWO))this.selectLane(1);
      if(Phaser.Input.Keyboard.JustDown(this.keys.THREE))this.selectLane(2);
      if(Phaser.Input.Keyboard.JustDown(this.keys.LEFT))this.selectLane((selectedLane+2)%3);
      if(Phaser.Input.Keyboard.JustDown(this.keys.RIGHT))this.selectLane((selectedLane+1)%3);
      if(Phaser.Input.Keyboard.JustDown(this.keys.SPACE)||Phaser.Input.Keyboard.JustDown(this.keys.ENTER))this.shoot(selectedLane);
      if(this.state==='warning'){
        this.remaining-=dt;
        if(this.remaining<=0){this.state='armed';this.remaining=REACTION_WINDOW;this.status.setText('BANDIT DRAWING · SHOOT THE GLOWING DOOR');this.target.getData('gun').setPosition(21,-7).setRotation(-.24);this.syncHud();this.refreshDoorGlow();}
      } else if(this.state==='armed'){
        this.remaining-=dt;this.timerBar.clear();
        const ratio=Phaser.Math.Clamp(this.remaining/REACTION_WINDOW,0,1),barWidth=260;
        this.timerBar.fillStyle(0x282c25,.88).fillRoundedRect(350,184,barWidth,15,6);
        this.timerBar.fillStyle(ratio>.42?0xe8bd58:0xb34b3d,1).fillRoundedRect(353,187,(barWidth-6)*ratio,9,4);
        this.timerBar.lineStyle(1,0xfff0c9,.8).strokeRoundedRect(350,184,barWidth,15,6);
        this.status.setText('DRAW!  '+this.remaining.toFixed(1)+' SECONDS · FIRE NOW');
        document.getElementById('bp-reaction').textContent=this.remaining.toFixed(1)+' sec';
        if(this.remaining<=0)this.fireAtPlayer();
      }
      if(this.state!=='armed'){this.timerBar.clear();this.refreshDoorGlow();}
    }
    scheduleTarget(delay){
      if(this.ended||this.score>=TARGETS_TO_WIN)return;
      this.state='idle';this.timerBar.clear();
      this.nextTargetEvent=this.time.delayedCall(delay,()=>this.spawnTarget());
    }
    spawnTarget(){
      if(this.ended||!this.active)return;
      const lane=Phaser.Math.Between(0,2);this.targetLane=lane;this.selectLane(lane);
      const colors=[0x7d3d35,0x3f5643,0x565069,0x9a602f];
      this.target=createBandit(this,[185,480,775][lane],Phaser.Utils.Array.GetRandom(colors));
      this.state='warning';this.remaining=.72;
      this.status.setText('MOVEMENT AT DOOR '+(lane+1)+' · GET READY');
      this.roundLabel.setText('WAVE '+String(Math.floor(this.resolved/TARGETS_PER_WAVE)+1).padStart(2,'0'));
      this.syncHud();this.refreshDoorGlow();
    }
    shoot(lane){
      if(this.paused||this.state!=='armed'||this.ended||lane!==this.targetLane){
        if(this.state==='armed'&&lane!==this.targetLane)this.status.setText('WRONG DOOR · FOLLOW THE GOLD OUTLINE');
        return;
      }
      this.resolve(true);
    }
    fireAtPlayer(){
      if(!this.target||this.ended)return;
      const bullet=this.add.graphics().setDepth(11);
      bullet.lineStyle(5,0xffe69a,1).lineBetween(this.target.x+35,this.target.y-7,480,478);
      bullet.lineStyle(2,0xff513f,1).lineBetween(this.target.x+35,this.target.y-7,480,478);
      this.tweens.add({targets:bullet,alpha:0,duration:180,onComplete:()=>bullet.destroy()});
      this.cameras.main.flash(130,255,90,68,false);
      this.resolve(false);
    }
    resolve(hit){
      if(this.ended||!this.target)return;
      this.resolved++;
      if(hit){this.score++;this.status.setText('NICE SHOT · THE BANK IS SAFE');this.cameras.main.flash(100,255,233,171,false);}
      else{this.lives--;this.status.setText('BANDIT FIRED · WATCH THE NEXT DOOR');this.cameras.main.shake(180,.004);}
      const target=this.target;this.target=null;this.targetLane=-1;this.state='cooldown';this.timerBar.clear();
      if(target&&target.active){this.tweens.add({targets:target,alpha:0,y:target.y+22,duration:200,onComplete:()=>target.destroy()});}
      this.syncHud();this.refreshDoorGlow();
      if(this.lives<=0){this.finish(false);return;}
      if(this.score>=TARGETS_TO_WIN){this.finish(true);return;}
      this.scheduleTarget(this.resolved%TARGETS_PER_WAVE===0?950:640);
    }
    selectLane(lane){selectedLane=Phaser.Math.Clamp(lane,0,2);this.refreshDoorGlow();}
    refreshDoorGlow(){
      if(!this.glow)return;
      this.glow.clear();
      const x=[185,480,775][selectedLane],active=this.state==='armed'&&this.targetLane===selectedLane;
      this.glow.lineStyle(active?6:3,active?0xffd25f:0xd1a14e,active?1:.82).strokeRoundedRect(x-87,185,174,296,14);
      if(active){this.glow.fillStyle(0xf1cb70,.10).fillRoundedRect(x-78,196,156,273,10);}
      doorButtons.forEach((button,index)=>button.classList.toggle('is-selected',index===selectedLane));
    }
    syncHud(){
      document.getElementById('bp-round').textContent=String(Math.floor(this.resolved/TARGETS_PER_WAVE)+1).padStart(2,'0');
      document.getElementById('bp-score').textContent=this.score+' / '+TARGETS_TO_WIN;
      document.getElementById('bp-hearts').textContent='♥ '.repeat(this.lives).trim()||'—';
      document.getElementById('bp-reaction').textContent=this.state==='armed'?this.remaining.toFixed(1)+' sec':REACTION_WINDOW.toFixed(1)+' sec';
    }
    syncPauseButton(paused){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.innerHTML=paused?'<i>▶</i> RESUME':'<i>Ⅱ</i> PAUSE';}
    clearTarget(){if(this.nextTargetEvent){this.nextTargetEvent.remove(false);this.nextTargetEvent=null;}if(this.target){this.target.destroy();this.target=null;}this.targetLane=-1;this.timerBar?.clear();}
    finish(won){
      this.ended=true;this.active=false;this.state='ended';this.clearTarget();pauseButton.disabled=true;
      document.getElementById('bp-result-kicker').textContent=won?'SHIFT COMPLETE · REWARD UNLOCKED':'SHIFT ENDED';
      document.getElementById('bp-result-title').textContent=won?'The bank is safe.':'The bandits slipped through.';
      document.getElementById('bp-result-copy').textContent=won?'10 bandits stopped. Your 10% discount coupon is ready.':'You stopped '+this.score+' bandits. Take a breath and try the shift again.';
      document.getElementById('bp-coupon').hidden=!won;
      document.getElementById('bp-copy-status').textContent=won?'Copy the code for checkout.':'';
      resultScreen.hidden=false;
    }
    togglePause(){if(!this.active||this.ended)return;this.paused=!this.paused;pauseScreen.hidden=!this.paused;this.syncPauseButton(this.paused);}
  }

  function currentScene(){return game?.scene.getScene('BankScene');}
  function startGame(){startScreen.hidden=true;pauseScreen.hidden=true;resultScreen.hidden=true;pauseButton.disabled=false;const scene=currentScene();if(scene)scene.start();}
  function setPaused(){const scene=currentScene();if(scene)scene.togglePause();}
  startButton.addEventListener('click',startGame);
  document.getElementById('bp-pause').addEventListener('click',setPaused);
  document.getElementById('bp-resume').addEventListener('click',setPaused);
  document.getElementById('bp-restart').addEventListener('click',startGame);
  document.getElementById('bp-result-replay').addEventListener('click',startGame);
  doorButtons.forEach(button=>button.addEventListener('click',()=>currentScene()?.selectLane(Number(button.dataset.bpDoor))));
  document.getElementById('bp-fire').addEventListener('click',()=>currentScene()?.shoot(selectedLane));
  document.getElementById('bp-copy').addEventListener('click',async()=>{
    const status=document.getElementById('bp-copy-status');
    try{await navigator.clipboard.writeText(COUPON);status.textContent='Copied · ready for checkout';}
    catch{const field=document.createElement('textarea');field.value=COUPON;document.body.appendChild(field);field.select();let copied=false;try{copied=document.execCommand('copy');}catch{}field.remove();status.textContent=copied?'Copied · ready for checkout':'Copy LEMMING10 manually';}
  });

  if(!window.Phaser){errorBox.hidden=false;return;}
  const config={type:Phaser.AUTO,parent:'bp-game',width:W,height:H,backgroundColor:'#f1dfb9',pixelArt:false,physics:{default:'arcade',arcade:{gravity:{y:0},debug:false}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[BankScene]};
  game=new Phaser.Game(config);
  window.bankPanicGame=game;
})();
