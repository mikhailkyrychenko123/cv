(function () {
  'use strict';

  var root = document.querySelector('[data-phaser-modal]');
  if (!root) return;
  var host = root.querySelector('[data-phaser-host]');
  var title = root.querySelector('#pgx-title');
  var summary = root.querySelector('[data-phaser-summary]');
  var help = root.querySelector('[data-phaser-help]');
  var footer = root.querySelector('[data-phaser-footer]');
  var statOne = root.querySelector('[data-phaser-stat-one]');
  var statTwo = root.querySelector('[data-phaser-stat-two]');
  var statThree = root.querySelector('[data-phaser-stat-three]');
  var result = root.querySelector('[data-phaser-result]');
  var resultLabel = root.querySelector('[data-phaser-result-label]');
  var resultTitle = root.querySelector('[data-phaser-result-title]');
  var resultCopy = root.querySelector('[data-phaser-result-copy]');
  var coupon = root.querySelector('[data-phaser-coupon]');
  var copyStatus = root.querySelector('[data-phaser-copy-status]');
  var actionButton = root.querySelector('[data-phaser-action]');
  var game = null;
  var activeScene = null;
  var activeType = '';
  var previousFocus = null;
  var touch = { left: false, right: false };
  function gameAssetUrl(name) {
    var scriptTag = Array.from(document.scripts).find(function (script) {
      return script.src && script.src.indexOf('phaser-mini-games-57.js') !== -1;
    });
    return new URL(name, scriptTag ? scriptTag.src : window.location.href).href;
  }

  var gameCopy = {
    'airship-run': {
      title: 'Airship courier',
      summary: 'Climb the rooftops, collect three roast parcels and catch the Northstar airship.',
      help: '<b>Run:</b> A/D or ←/→. <b>Jump:</b> W, ↑ or Space. Collect three parcels, avoid the rooftop rival and reach the airship.',
      footer: 'ROOFTOP ROUTE · AIRSHIP COURIER',
      action: 'JUMP',
      stats: ['PARCELS', 'LIVES', 'TIME']
    },
    'catapult-siege': {
      title: 'Catapult siege',
      summary: 'Set the angle, read the arc and knock three discount banners loose from the rival fort.',
      help: '<b>Aim:</b> ↑/↓. <b>Power:</b> ←/→. <b>Fire:</b> Space or FIRE. Land three clean hits before the ninth shot.',
      footer: 'FORTRESS CAMPAIGN · PRECISION SHOTS',
      action: 'FIRE',
      stats: ['TARGETS', 'SHOTS', 'ANGLE']
    },
    'trade-district': {
      title: 'Trade district',
      summary: 'Walk the market lane, visit three shopfronts and connect each one to the shared virtual tour.',
      help: '<b>Walk:</b> WASD or arrow keys. <b>Connect a shop:</b> stand by its counter and press E, Enter or BRAND.',
      footer: 'TRADE DISTRICT · THREE STOREFRONTS',
      action: 'BRAND',
      stats: ['STORES', 'ROUTE', 'TIME']
    },
    'laundry-french': {
      title: 'The laundry line · Paris',
      summary: 'A bright Parisian courtyard, a busy clothesline and two birds who notice every falling garment.',
      help: '<b>Move:</b> A/D or ←/→. Catch garments before they hit the cobbles. Reach 10 points; REACH widens your catch for a moment.',
      footer: 'PARIS COURTYARD · CLOTHESLINE CHALLENGE',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-roman': {
      title: 'Laundry day · Trastevere',
      summary: 'Warm plaster, deep balconies and a little Roman shop below the line. Catch ten pieces for the offer.',
      help: '<b>Move:</b> A/D or ←/→. Catch garments before they hit the stones. Reach 10 points; REACH widens your catch briefly.',
      footer: 'TRASTEVERE · THE SHOP BELOW',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-dusk': {
      title: 'Blue-hour balcony run',
      summary: 'A quieter evening lane in slate blue and warm amber, with a fluttering flag above the shop.',
      help: '<b>Move:</b> A/D or ←/→. Catch garments before they hit the street. Reach 10 points; REACH widens your catch briefly.',
      footer: 'BLUE-HOUR COURTYARD · EVENING SHIFT',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-haussmann': {
      title: 'Laundry above the boulevard',
      summary: 'Catch falling garments beneath tall Haussmann façades, stone cornices and wrought-iron French balconies.',
      help: '<b>Move:</b> A/D or ←/→. Watch the perched birds peck a pin, then catch the falling garment. Reach 10; REACH widens your catch briefly.',
      footer: 'HAUSSMANN LANE · BIRDS ON THE LINE',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-rue': {
      title: 'A little rue, a lot of laundry',
      summary: 'Pastel apartment fronts meet above a narrow Paris lane, with iron balconies on both sides and a tiny branded shop at the end.',
      help: '<b>Move:</b> A/D or ←/→. The birds choose a clothespin and send one piece down at a time. Catch ten for the offer.',
      footer: 'RUE DES ATELIERS · LOOK UP',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-passage': {
      title: 'The balcony passage',
      summary: 'A wider courtyard opens into a deep stone passage, framed by stacked French balconies, shutters and a neighborhood atelier.',
      help: '<b>Move:</b> A/D or ←/→. Birds perched on the rope loosen pins; catch the clothes before they reach the paving.',
      footer: 'COURTYARD PASSAGE · CATCH 10',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-ink-lane': {
      title: 'Ink & ochre lane',
      summary: 'A close, hand-drawn old-town street opens into a softly painted distance; a bicycle waits by the shop.',
      help: '<b>Move:</b> A/D or ←/→. Watch the birds unclip a garment, then catch it before it reaches the cobbles. Reach 10.',
      footer: 'OLD TOWN · BRUSHED DISTANCE',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-balcony-line': {
      title: 'Balcony to balcony',
      summary: 'Opposing French balconies frame the washing line, with shuttered windows and a painted street receding behind it.',
      help: '<b>Move:</b> A/D or ←/→. The birds choose the next clothespin; catch ten falling pieces for the offer.',
      footer: 'FRENCH BALCONIES · ONE SHARED LINE',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-market-rue': {
      title: 'Market street laundry',
      summary: 'A little boutique sits at the vanishing point while painted plaster, awnings and a bicycle bring the lane to life.',
      help: '<b>Move:</b> A/D or ←/→. Follow the birds’ glances and catch each piece before it lands.',
      footer: 'THE MARKET RUE · CATCH 10',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-lantern-court': {
      title: 'Lantern courtyard',
      summary: 'Warm lanterns pick out the balconies while a muted wash of color carries the alley toward the far end.',
      help: '<b>Move:</b> A/D or ←/→. Birds release the laundry one piece at a time. Save ten pieces to complete the run.',
      footer: 'EVENING COURTYARD · WARM WINDOWS',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-rooftop-wash': {
      title: 'Rooftop washing line',
      summary: 'Roof terraces and upper balconies narrow into a bright street view, with a bicycle parked at ground level.',
      help: '<b>Move:</b> A/D or ←/→. Keep below the line and catch every garment the birds send down.',
      footer: 'ROOFTOPS · A CLEAR VIEW DOWN THE STREET',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-painted-rue': {
      title: 'The painted rue',
      summary: 'Fine architectural ink lines meet restrained watercolor-like brush marks in the far buildings and sky.',
      help: '<b>Move:</b> A/D or ←/→. Catch ten pieces of laundry before they touch the street.',
      footer: 'PEN LINES · SOFT COLOR WASH',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-blue-courtyard': {
      title: 'Blue-hour passage',
      summary: 'Blue shutters, pale stone and amber lamps lead the eye past a bicycle toward the end of the courtyard.',
      help: '<b>Move:</b> A/D or ←/→. Watch both birds, catch ten garments and keep them off the paving.',
      footer: 'BLUE HOUR · THE STREET CONTINUES',
      action: 'REACH',
      stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-corner-cast': {
      title: 'Corner-cast light',
      summary: 'A close corner façade opens into a narrow lane; deep-set windows shrink toward the offset vanishing point.',
      help: '<b>Move:</b> A/D or ←/→. Follow the birds along the line and catch ten garments for the offer.',
      footer: 'CORNER VIEW · WINDOWS IN DEPTH', action: 'REACH', stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-twin-courts': {
      title: 'The twin courtyards',
      summary: 'Two balanced apartment fronts frame a long shared courtyard, with balconies stepping back floor by floor.',
      help: '<b>Move:</b> A/D or ←/→. Watch both birds, catch ten garments and keep them off the paving.',
      footer: 'TWIN FACADES · ONE DEEP COURTYARD', action: 'REACH', stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-arcade-depth': {
      title: 'The arcade street',
      summary: 'Tall arched shop windows and upper apartments repeat down a covered passage toward a sunlit end block.',
      help: '<b>Move:</b> A/D or ←/→. Catch the laundry as it falls from the arcade line. Reach ten to clear the run.',
      footer: 'ARCADE PASSAGE · REPEATING ARCHES', action: 'REACH', stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-stairwell-lane': {
      title: 'The stairwell lane',
      summary: 'External landings climb across a compact old-town façade while the opposite windows recede toward the street.',
      help: '<b>Move:</b> A/D or ←/→. Keep an eye on the birds and catch ten garments before they reach the street.',
      footer: 'LANDINGS & SHUTTERS · CATCH 10', action: 'REACH', stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-bay-windows': {
      title: 'Bay windows at dusk',
      summary: 'Three birds perch above a hand-drawn old-town street, dropping laundry at random while a wide-eyed mouse makes a dash below.',
      help: '<b>Move:</b> A/D or ←/→. <b>Jump:</b> W, ↑, Space or JUMP. <b>Reach:</b> E. Catch ten garments and hop over the mouse.',
      footer: 'BAY WINDOWS · BIRDS, LAUNDRY & A QUICK MOUSE', action: 'JUMP', stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'laundry-bay-windows-34': {
      title: 'Add a popup like this',
      summary: 'Give your customers a fair chance to win a discount, and they’ll come back and bring friends.',
      help: '',
      footer: 'ALL GAMES CUSTOMIZED FOR YOUR BRAND', action: 'JUMP', stats: ['CAUGHT', 'MISSED', 'TIME']
    },
    'discount-invaders': {
      title: 'Coupon convoy',
      summary: 'A tidy formation of coupon raiders sweeps over the market. Hold the counter and clear the whole wave.',
      help: '<b>Move:</b> A/D or ←/→. <b>Fire:</b> Space or FIRE. Clear 24 coupon raiders before they reach the shop; avoid their return parcels.',
      footer: 'MARKET DEFENSE · CLEAR THE COUPON WAVE', action: 'FIRE', stats: ['RAIDERS', 'LIVES', 'TIME']
    },
    'market-rooftop-run': {
      title: 'Rooftop parcel run',
      summary: 'A nimble market courier crosses terraces, awnings and rooftop bridges to deliver five parcels to the shop.',
      help: '<b>Move:</b> A/D or ←/→. <b>Jump:</b> W, ↑, Space or JUMP. Collect five parcels and reach the rooftop shop.',
      footer: 'MARKET ROOFTOPS · FIVE-PARCEL ROUTE', action: 'JUMP', stats: ['PARCELS', 'LIVES', 'TIME']
    },
    'market-bootstrap-platformer': {
      title: 'Market rooftop relay',
      summary: 'A new runner follows a side-scrolling route over old-market roofs, gathers six parcels and reaches the lantern shop.',
      help: '<b>Move:</b> A/D or ←/→. <b>Jump:</b> W, ↑, Space or JUMP. Cross the roof gaps, collect all six parcels and reach the shop at the far end.',
      footer: 'SIDE-SCROLLING MARKET · SIX PARCELS', action: 'JUMP', stats: ['PARCELS', 'LIVES', 'TIME']
    }
  };

  function setStat(node, label, value) {
    node.innerHTML = label + ' <b>' + value + '</b>';
  }

  function setStats(one, two, three) {
    if (!activeType || !gameCopy[activeType]) return;
    var labels = gameCopy[activeType].stats;
    setStat(statOne, labels[0], one);
    setStat(statTwo, labels[1], two);
    setStat(statThree, labels[2], three);
  }

  function reportResult(success, heading, message) {
    result.hidden = false;
    resultLabel.textContent = success ? 'MISSION COMPLETE' : 'RUN ENDED';
    resultTitle.textContent = heading;
    resultCopy.textContent = message;
    coupon.textContent = success ? 'LEMMING10' : 'TRYAGAIN';
    copyStatus.textContent = success ? 'Copy your code to use it at checkout.' : 'Try again to earn the shared game code.';
  }

  function closeGame() {
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('pgx-open');
    if (game) {
      game.destroy(true);
      game = null;
    }
    activeScene = null;
    touch.left = false;
    touch.right = false;
    result.hidden = true;
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }

  function openGame(type, trigger) {
    activeType = type;
    previousFocus = trigger;
    var text = gameCopy[type];
    if (!text) return;
    title.textContent = text.title;
    summary.textContent = text.summary;
    if (help) help.innerHTML = text.help;
    footer.textContent = text.footer;
    actionButton.textContent = text.action;
    result.hidden = true;
    setStats('0 / 3', '3', '00:00');
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('pgx-open');
    if (game) {
      game.destroy(true);
      game = null;
    }
    host.innerHTML = '';
    if (!window.Phaser) {
      host.innerHTML = '<div class="pgx-load-error">The game engine could not load. Please check your internet connection and reopen this game.</div>';
      root.querySelector('.pgx-dialog').focus();
      return;
    }
    // Focus the dialog before Phaser creates its canvas. The ready handler
    // below then moves keyboard focus into the playable surface.
    root.querySelector('.pgx-dialog').focus();
    var squareLaundry = type === 'laundry-bay-windows' || type === 'laundry-bay-windows-34';
    root.querySelector('.pgx-dialog').classList.toggle('pgx-dialog--field-fit', type === 'laundry-bay-windows-34');
    var stage = root.querySelector('.pgx-stage');
    if (stage) {
      if (squareLaundry) {
        stage.style.aspectRatio = '1 / 1';
        stage.style.width = type === 'laundry-bay-windows-34' ? '100%' : 'min(calc(100% - 24px), 62vh)';
        stage.style.marginInline = type === 'laundry-bay-windows-34' ? '0' : 'auto';
        stage.style.backgroundImage = 'url(' + JSON.stringify(gameAssetUrl('laundry-bay-windows-bg.png')) + ')';
        stage.style.backgroundSize = '100% 100%';
        stage.style.backgroundPosition = 'center';
        stage.style.backgroundRepeat = 'no-repeat';
      } else {
        stage.style.aspectRatio = '';
        stage.style.width = '';
        stage.style.marginInline = '';
        stage.style.backgroundImage = '';
        stage.style.backgroundSize = '';
        stage.style.backgroundPosition = '';
        stage.style.backgroundRepeat = '';
      }
    }
    var SceneClass = createScene(type);
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 960,
      height: squareLaundry ? 960 : 540,
      backgroundColor: squareLaundry ? 'rgba(0,0,0,0)' : '#e9eee7',
      transparent: squareLaundry,
      antialias: true,
      roundPixels: true,
      physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { pixelArt: false, antialias: true, clearBeforeRender: true },
      scene: [SceneClass]
    });
    game.events.once('ready', function () {
      activeScene = game.scene.getScene('MiniGameScene');
      var canvas = host.querySelector('canvas');
      if (canvas) {
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', text.title + ' playable mini-game. ' + text.help.replace(/<[^>]*>/g, ''));
        if (activeType === 'laundry-bay-windows-34') {
          canvas.setAttribute('tabindex', '0');
          canvas.addEventListener('pointerdown', function () { canvas.focus({ preventScroll: true }); });
          canvas.focus({ preventScroll: true });
        }
      }
    });
  }

  document.querySelectorAll('[data-phaser-game-open]').forEach(function (button) {
    button.addEventListener('click', function () { openGame(button.getAttribute('data-phaser-game-open'), button); });
  });
  root.querySelectorAll('[data-phaser-close]').forEach(function (button) { button.addEventListener('click', closeGame); });
  root.querySelector('[data-phaser-retry]').addEventListener('click', function () { openGame(activeType, previousFocus); });
  root.querySelector('[data-phaser-copy]').addEventListener('click', function () {
    var code = coupon.textContent;
    if (code === 'TRYAGAIN') {
      copyStatus.textContent = 'Complete the game to unlock the offer code.';
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function () { copyStatus.textContent = 'Code copied.'; }).catch(function () { copyStatus.textContent = 'Your code: ' + code; });
    } else {
      copyStatus.textContent = 'Your code: ' + code;
    }
  });
  root.querySelectorAll('[data-phaser-dir]').forEach(function (button) {
    var direction = button.getAttribute('data-phaser-dir');
    button.addEventListener('pointerdown', function (event) { event.preventDefault(); touch[direction] = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (name) {
      button.addEventListener(name, function () { touch[direction] = false; });
    });
  });
  window.addEventListener('pointerup', function () { touch.left = false; touch.right = false; });
  actionButton.addEventListener('click', function () { if (activeScene && activeScene.action) activeScene.action(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !root.hidden) closeGame(); });

  var INK = 0x454b48;
  var COLORS = { slate: 0x748aa3, sage: 0x99a499, amber: 0xe9b65f, dark: 0x545555, cream: 0xf5f0e6, rust: 0xc27d64 };

  function polygon(graphics, points, fill, stroke, width) {
    if (fill !== null && fill !== undefined) {
      graphics.fillStyle(fill, 1);
      graphics.beginPath();
      graphics.moveTo(points[0][0], points[0][1]);
      for (var i = 1; i < points.length; i++) graphics.lineTo(points[i][0], points[i][1]);
      graphics.closePath();
      graphics.fillPath();
    }
    if (stroke !== false) {
      graphics.lineStyle(width || 1.5, stroke || INK, 1);
      graphics.beginPath();
      graphics.moveTo(points[0][0], points[0][1]);
      for (var j = 1; j < points.length; j++) graphics.lineTo(points[j][0], points[j][1]);
      graphics.closePath();
      graphics.strokePath();
    }
  }

  function strokeLine(graphics, x1, y1, x2, y2, color, width, alpha) {
    graphics.lineStyle(width || 1.4, color || INK, alpha === undefined ? 1 : alpha);
    graphics.beginPath();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.strokePath();
  }

  function makeTexture(scene, name, width, height, draw) {
    var g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(name, width, height);
    g.destroy();
  }

  function courierTexture(g, coat) {
    g.lineStyle(2.2, INK, 1);
    g.fillStyle(0xe9c19c, 1); g.fillCircle(34, 19, 12); g.strokeCircle(34, 19, 12);
    g.fillStyle(0x4d433c, 1); g.fillEllipse(34, 8, 24, 11); g.fillRect(21, 8, 26, 3);
    g.fillStyle(coat, 1); g.fillRoundedRect(19, 32, 30, 39, 6); g.strokeRoundedRect(19, 32, 30, 39, 6);
    g.fillStyle(0xe9b65f, 1); g.fillRect(27, 38, 14, 4); g.fillRect(31, 45, 5, 18);
    g.fillStyle(0x77838a, 1); g.fillRoundedRect(9, 37, 13, 28, 4); g.strokeRoundedRect(9, 37, 13, 28, 4);
    strokeLine(g, 20, 41, 9, 56, INK, 3); strokeLine(g, 46, 42, 57, 54, INK, 3);
    strokeLine(g, 27, 70, 23, 91, INK, 4); strokeLine(g, 40, 70, 45, 91, INK, 4);
    g.lineStyle(2, INK, 1); g.fillStyle(0xf4efe6, 1); g.fillRoundedRect(14, 90, 15, 6, 2); g.strokeRoundedRect(14, 90, 15, 6, 2); g.fillRoundedRect(39, 90, 15, 6, 2); g.strokeRoundedRect(39, 90, 15, 6, 2);
    g.fillStyle(INK, 1); g.fillCircle(30, 19, 1.2); g.fillCircle(38, 19, 1.2);
  }

  // A small illustrated portrait of Mikhail for the laundry-catching game.
  // Keep the clean, fine-line game style while echoing his dark hair,
  // white shirt and warm shearling jacket from the portfolio avatar.
  function laundryHeroTexture(g, reaching) {
    var jacket = 0xc7ae8d, fleece = 0xe4d3b9, shirt = 0xf8f5ec, skin = 0xe9c19c;
    g.lineStyle(1.6, INK, 1);

    // Legs and shoes sit behind the jacket.
    polygon(g, [[29, 84], [37, 84], [34, 105], [27, 105]], 0x545555, INK, 1.4);
    polygon(g, [[39, 84], [47, 84], [51, 104], [44, 105]], 0x545555, INK, 1.4);
    polygon(g, [[25, 103], [35, 103], [34, 108], [23, 108]], 0x403f3c, INK, 1.1);
    polygon(g, [[43, 103], [53, 102], [57, 107], [44, 108]], 0x403f3c, INK, 1.1);

    // Open arms: the second pose reaches up to catch a falling garment.
    if (reaching) {
      polygon(g, [[20, 48], [27, 52], [17, 62], [8, 49], [11, 44]], jacket, INK, 1.5);
      polygon(g, [[53, 49], [59, 45], [69, 38], [73, 43], [62, 60], [55, 57]], jacket, INK, 1.5);
      strokeLine(g, 9, 47, 5, 42, skin, 5.2); strokeLine(g, 70, 40, 73, 35, skin, 5.2);
      strokeLine(g, 12, 51, 17, 57, fleece, 2.2); strokeLine(g, 59, 53, 64, 48, fleece, 2.2);
    } else {
      polygon(g, [[20, 49], [27, 53], [17, 70], [8, 76], [4, 72], [12, 55]], jacket, INK, 1.5);
      polygon(g, [[52, 49], [59, 53], [67, 68], [73, 63], [70, 59], [62, 49]], jacket, INK, 1.5);
      strokeLine(g, 7, 73, 3, 76, skin, 5.2); strokeLine(g, 69, 62, 74, 60, skin, 5.2);
      strokeLine(g, 10, 63, 16, 66, fleece, 2.2); strokeLine(g, 60, 63, 66, 60, fleece, 2.2);
    }

    // Jacket body, shirt front and broad shearling lapels.
    polygon(g, [[24, 43], [32, 40], [38, 45], [45, 40], [54, 44], [63, 88], [55, 95], [18, 95], [12, 88]], jacket, INK, 1.7);
    polygon(g, [[32, 43], [38, 47], [44, 43], [48, 91], [28, 91]], shirt, INK, 1.1);
    polygon(g, [[25, 44], [34, 48], [38, 56], [31, 65], [22, 49]], fleece, INK, 1.1);
    polygon(g, [[51, 44], [43, 48], [39, 56], [46, 65], [55, 49]], fleece, INK, 1.1);
    strokeLine(g, 38, 57, 38, 89, 0x8f795f, 1.1);
    strokeLine(g, 26, 69, 22, 86, 0xa88f70, 1); strokeLine(g, 51, 69, 56, 86, 0xa88f70, 1);
    // Short fleece marks keep the coat tactile without making the silhouette noisy.
    [[24,50],[28,53],[50,51],[53,55],[21,57],[56,59]].forEach(function(p){strokeLine(g,p[0],p[1],p[0]+2,p[1]+2,0xf4e9d8,.9);});

    // Neck, face, ears and swept dark-brown hair.
    g.fillStyle(skin, 1); g.fillRect(33, 36, 11, 11); g.lineStyle(1.2, INK, 1); g.strokeRect(33, 36, 11, 11);
    g.fillStyle(skin, 1); g.fillEllipse(38, 25, 25, 29); g.lineStyle(1.5, INK, 1); g.strokeEllipse(38, 25, 25, 29);
    g.fillStyle(0x4b3b31, 1); g.fillEllipse(38, 14, 29, 18);
    polygon(g, [[24, 17], [27, 8], [35, 7], [41, 9], [49, 7], [53, 13], [51, 20], [45, 17], [39, 19], [34, 16], [29, 20]], 0x4b3b31, INK, 1.1);
    g.fillStyle(0x302a26, 1); g.fillCircle(33, 26, 1.25); g.fillCircle(43, 26, 1.25);
    strokeLine(g, 29, 22, 35, 21, 0x4b3b31, 1.2); strokeLine(g, 41, 21, 47, 22, 0x4b3b31, 1.2);
    strokeLine(g, 38, 27, 37, 32, 0x9a715d, .9); strokeLine(g, 34, 35, 42, 35, 0x895b4d, 1.1);
    g.fillStyle(0xd99782, .5); g.fillCircle(29, 31, 2); g.fillCircle(47, 31, 2);
  }

  function drawBicycleGraphic(g, x, y, color) {
    g.lineStyle(2, color, 1);
    g.strokeCircle(x, y, 20); g.strokeCircle(x + 64, y, 20);
    strokeLine(g, x, y, x + 27, y - 30, color, 2);
    strokeLine(g, x + 27, y - 30, x + 43, y, color, 2);
    strokeLine(g, x + 43, y, x, y, color, 2);
    strokeLine(g, x + 27, y - 30, x + 64, y, color, 2);
    strokeLine(g, x + 64, y, x + 43, y, color, 2);
    strokeLine(g, x + 25, y - 32, x + 15, y - 38, color, 2);
    strokeLine(g, x + 15, y - 38, x + 7, y - 38, color, 2);
    strokeLine(g, x + 60, y - 4, x + 69, y - 38, color, 2);
    strokeLine(g, x + 65, y - 38, x + 77, y - 38, color, 2);
    g.fillStyle(0xe9b65f, 1); g.fillCircle(x + 43, y, 3);
  }

  function drawFicusGraphic(g, x, y, green) {
    polygon(g, [[x - 20, y - 3], [x + 22, y - 3], [x + 16, y + 31], [x - 14, y + 31]], 0xc27d64, INK, 1.4);
    for (var leaf = 0; leaf < 8; leaf++) {
      var angle = leaf * Math.PI / 4;
      var lx = x + Math.cos(angle) * 21, ly = y - 38 + Math.sin(angle) * 23;
      g.lineStyle(1.3, INK, 1); g.fillStyle(green, 1); g.fillEllipse(lx, ly, 22, 11); g.strokeEllipse(lx, ly, 22, 11);
      strokeLine(g, x, y - 6, lx, ly, INK, 1);
    }
    strokeLine(g, x, y - 8, x, y - 52, INK, 2);
  }

  function createScene(type) {
    if (type === 'airship-run') {
      return class AirshipScene extends Phaser.Scene {
        constructor() { super({ key: 'MiniGameScene' }); this.packs = 0; this.lives = 3; this.elapsed = 0; this.lastHit = 0; this.invulnerable = false; }
        create() {
          this.physics.world.setBounds(0, 0, 1800, 540);
          this.physics.world.gravity.y = 900;
          this.drawWorld();
          makeTexture(this, 'air-courier', 68, 104, function (g) { courierTexture(g, 0x748aa3); });
          makeTexture(this, 'air-rival', 52, 76, function (g) {
            g.lineStyle(2, INK, 1); g.fillStyle(0x615c65, 1); g.fillRoundedRect(13, 25, 27, 38, 8); g.strokeRoundedRect(13, 25, 27, 38, 8);
            g.fillStyle(0xb7a78f, 1); g.fillCircle(27, 18, 12); g.strokeCircle(27, 18, 12); g.fillStyle(0x32383b, 1); g.fillRect(12, 7, 30, 8); g.fillCircle(24, 18, 1.4); g.fillCircle(32, 18, 1.4);
            strokeLine(g, 20, 62, 18, 74, INK, 4); strokeLine(g, 35, 62, 38, 74, INK, 4);
          });
          makeTexture(this, 'air-parcel', 34, 34, function (g) {
            g.lineStyle(2, INK, 1); g.fillStyle(0xe9b65f, 1); g.fillRect(4, 6, 26, 24); g.strokeRect(4, 6, 26, 24);
            strokeLine(g, 4, 13, 30, 13, 0x805e3a, 1.5); strokeLine(g, 17, 6, 17, 30, 0x805e3a, 1.2); g.fillStyle(0x748aa3, 1); g.fillRect(11, 16, 12, 6);
          });
          makeTexture(this, 'air-ledge', 64, 18, function (g) {
            polygon(g, [[1, 2], [63, 2], [58, 16], [6, 16]], 0x99a499, INK, 1.3);
            strokeLine(g, 2, 3, 61, 3, 0xf8f5eb, 1.3);
          });
          this.platforms = this.physics.add.staticGroup();
          this.addPlatform(900, 515, 1800);
          [[235,405,210],[440,350,170],[650,405,170],[830,350,190],[1035,305,190],[1235,365,175],[1420,318,200],[1600,370,170]].forEach((p) => this.addPlatform(p[0],p[1],p[2]));
          this.player = this.physics.add.sprite(70, 420, 'air-courier').setDepth(15);
          this.player.setBodySize(31, 78).setOffset(19, 15).setCollideWorldBounds(true).setBounce(0.05);
          this.physics.add.collider(this.player, this.platforms);
          this.cursors = this.input.keyboard.createCursorKeys();
          this.keys = this.input.keyboard.addKeys('A,D,W');
          this.parcels = this.physics.add.staticGroup();
          [[330,366],[1030,265],[1455,275]].forEach((p) => this.parcels.create(p[0],p[1],'air-parcel').setDepth(14));
          this.physics.add.overlap(this.player, this.parcels, this.collectParcel, null, this);
          this.rival = this.physics.add.sprite(770, 307, 'air-rival').setDepth(14).setImmovable(true);
          this.rival.body.allowGravity = false;
          this.tweens.add({ targets: this.rival, x: { from: 735, to: 880 }, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          this.physics.add.overlap(this.player, this.rival, this.hitRival, null, this);
          this.drawAirship();
          this.goal = this.add.zone(1705, 310, 110, 130);
          this.physics.world.enable(this.goal, Phaser.Physics.Arcade.STATIC_BODY);
          this.physics.add.overlap(this.player, this.goal, this.finishRoute, null, this);
          this.cameras.main.setBounds(0,0,1800,540).startFollow(this.player, true, 0.085, 0.085);
          this.clock = this.add.text(24, 18, 'ROOFTOP DELIVERY · NORTHSTAR', { fontFamily:'Arial', fontSize:'12px', color:'#35403a', fontStyle:'bold', letterSpacing:2 }).setScrollFactor(0).setDepth(30);
          setStats('0 / 3','3','00:00');
        }
        drawWorld() {
          var g = this.add.graphics();
          g.fillGradientStyle(0xf2f0e8,0xf2f0e8,0xdce8e9,0xe7e7df,1); g.fillRect(0,0,1800,540);
          for (var i=0;i<9;i++) {
            var x=70+i*215, h=120+(i%3)*40;
            polygon(g,[[x,430-h],[x+130,430-h],[x+130,440],[x,440]],i%2?0xd4d6d0:0xe1d4c4,INK,1.2);
            polygon(g,[[x-8,430-h],[x+65,390-h],[x+138,430-h]],0x748aa3,INK,1.2);
            for(var r=0;r<3;r++) for(var c=0;c<3;c++){g.fillStyle(0x748aa3,0.52);g.fillRect(x+16+c*34,430-h+25+r*37,17,22);g.lineStyle(1,INK,.55);g.strokeRect(x+16+c*34,430-h+25+r*37,17,22);}
          }
          for(var cloud=0;cloud<8;cloud++){var cx=100+cloud*245;g.fillStyle(0xffffff,.56);g.fillEllipse(cx,90+(cloud%2)*28,100,22);g.fillEllipse(cx-22,94+(cloud%2)*28,34,18);}
          g.fillStyle(0xe7e6de,1);g.fillRect(0,480,1800,60);
          for(var lineX=0;lineX<1800;lineX+=70) strokeLine(g,lineX,498,lineX+42,498,0xa3a69c,1,.65);
          g.destroy();
          this.add.text(40,460,'THE ROOFTOP ROUTE',{fontFamily:'Arial',fontSize:'10px',color:'#58645d',fontStyle:'bold',letterSpacing:2});
        }
        drawAirship() {
          var g=this.add.graphics().setDepth(13), x=1680,y=236;
          g.lineStyle(2,INK,1);g.fillStyle(0xf1eee4,1);g.fillEllipse(x,y,170,64);g.strokeEllipse(x,y,170,64);
          g.fillStyle(0x748aa3,1);g.fillEllipse(x,y-4,142,46);g.lineStyle(1.2,INK,1);g.strokeEllipse(x,y-4,142,46);
          for(var i=0;i<7;i++){g.fillStyle(0xe9b65f,1);g.fillCircle(x-48+i*16,y-3,3);}
          g.fillStyle(0xe9b65f,1);g.fillRoundedRect(x-31,y+26,62,28,5);g.lineStyle(1.7,INK,1);g.strokeRoundedRect(x-31,y+26,62,28,5);
          g.fillStyle(0x545555,1);g.fillRect(x-20,y+35,40,8);g.fillStyle(0xf4efe6,1);g.fillRect(x-15,y+37,30,4);
          strokeLine(g,x-110,y,x-145,y-6,INK,1.5);strokeLine(g,x+110,y,x+140,y+6,INK,1.5);
          this.add.text(x-44,y+61,'NORTHSTAR',{fontFamily:'Arial',fontSize:'9px',color:'#39403d',fontStyle:'bold',letterSpacing:1}).setDepth(15);
        }
        addPlatform(x,y,width) {
          var p=this.platforms.create(x,y,'air-ledge').setDisplaySize(width,18).setAlpha(0).refreshBody();
          p.body.setSize(width,18,true);
        }
        collectParcel(player,item) {
          item.destroy(); this.packs++;
          setStats(this.packs+' / 3',this.lives,this.formatTime());
          var flash=this.add.text(player.x,player.y-50,'+ ROAST PACK',{fontFamily:'Arial',fontSize:'11px',color:'#725a32',fontStyle:'bold'}).setDepth(50);
          this.tweens.add({targets:flash,y:flash.y-35,alpha:0,duration:650,onComplete:function(){flash.destroy();}});
        }
        hitRival() {
          if(this.time.now-this.lastHit<1200)return;
          this.lastHit=this.time.now;this.lives--;this.player.setVelocityY(-340);this.player.setVelocityX(this.player.x<this.rival.x?-240:240);
          this.tweens.add({targets:this.player,alpha:.25,duration:90,yoyo:true,repeat:5});
          setStats(this.packs+' / 3',this.lives,this.formatTime());
          if(this.lives<=0){reportResult(false,'The rival got there first.','Run the rooftops again. Collect all three parcels, then meet the airship.');this.physics.pause();}
        }
        finishRoute() {
          if(this.packs<3){this.clock.setText('THREE PARCELS FIRST · '+this.packs+'/3');return;}
          reportResult(true,'Parcel run complete.','All three parcels made it aboard. Send the shared code with your order.');
          this.physics.pause();
        }
        formatTime(){var s=Math.floor(this.elapsed/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
        action(){if(this.player&&this.player.body.blocked.down)this.player.setVelocityY(-520);}
        update(time,delta) {
          if(!this.player||this.physics.world.isPaused)return;
          this.elapsed+=delta;
          var left=this.cursors.left.isDown||this.keys.A.isDown||touch.left,right=this.cursors.right.isDown||this.keys.D.isDown||touch.right;
          if(left){this.player.setVelocityX(-245);this.player.setFlipX(true);}else if(right){this.player.setVelocityX(245);this.player.setFlipX(false);}else this.player.setVelocityX(0);
          if((Phaser.Input.Keyboard.JustDown(this.cursors.up)||Phaser.Input.Keyboard.JustDown(this.cursors.space)||Phaser.Input.Keyboard.JustDown(this.keys.W))&&this.player.body.blocked.down)this.action();
          if(this.cursors.space.isDown&&this.player.body.blocked.down)this.action();
          if(Math.floor(this.elapsed/1000)!==Math.floor((this.elapsed-delta)/1000))setStats(this.packs+' / 3',this.lives,this.formatTime());
          if(this.player.y>550){this.player.setPosition(70,420);this.player.setVelocity(0,0);this.lives--;setStats(this.packs+' / 3',this.lives,this.formatTime());}
        }
      };
    }

    if (type === 'catapult-siege') {
      return class CatapultScene extends Phaser.Scene {
        constructor(){super({key:'MiniGameScene'});this.angle=16;this.power=650;this.shots=0;this.hits=0;this.active=null;this.elapsed=0;this.targetZones=[];}
        create(){
          this.physics.world.setBounds(0,0,960,540);this.physics.world.gravity.y=430;
          this.drawFort();
          makeTexture(this,'siege-stone',28,28,function(g){g.lineStyle(2,INK,1);g.fillStyle(0x748aa3,1);g.fillCircle(14,14,11);g.strokeCircle(14,14,11);g.fillStyle(0xe9b65f,1);g.fillCircle(11,10,3);strokeLine(g,8,19,19,17,INK,1);});
          this.makeTargets();
          this.keys=this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,SPACE');
          this.input.keyboard.on('keydown-SPACE',this.fire,this);
          this.input.on('pointerdown',this.fire,this);
          this.aimText=this.add.text(24,20,'AIM  16°   ·   POWER 650',{fontFamily:'Arial',fontSize:'12px',color:'#343c39',fontStyle:'bold',letterSpacing:1}).setDepth(10);
          this.aimGraphic=this.add.graphics().setDepth(9);
          setStats('0 / 3','0 / 9','16°');
        }
        drawFort(){
          var g=this.add.graphics();
          g.fillGradientStyle(0xf2eee3,0xf2eee3,0xe4e4dc,0xdfe5e2,1);g.fillRect(0,0,960,540);
          polygon(g,[[0,395],[140,350],[300,378],[450,330],[650,375],[850,338],[960,360],[960,460],[0,460]],0xd7ddd5,INK,1.4);
          for(var i=0;i<13;i++){strokeLine(g,i*80,402+(i%3)*5,i*80+55,401+(i%3)*5,0x87918a,1,.7);}
          g.fillStyle(0x99a499,1);g.fillRect(0,455,960,85);strokeLine(g,0,455,960,455,INK,2);
          for(var k=0;k<24;k++){g.fillStyle(k%3===0?0xe9b65f:0x748aa3,.65);g.fillEllipse(40+k*40,485+(k%2)*22,14,5);}
          // A timber counterweighted catapult, drawn as a clean, hand-colored technical sketch.
          polygon(g,[[74,407],[244,407],[225,421],[85,421]],0x78624a,INK,2);
          strokeLine(g,110,402,195,292,INK,8);strokeLine(g,194,292,245,409,INK,6);strokeLine(g,111,402,236,405,0xe9b65f,3);
          strokeLine(g,183,310,250,257,INK,2);strokeLine(g,250,257,293,251,INK,2);strokeLine(g,243,256,263,236,INK,2);
          g.fillStyle(0x545555,1);g.fillCircle(195,292,10);g.lineStyle(2,INK,1);g.strokeCircle(195,292,10);
          polygon(g,[[186,286],[207,280],[225,283],[210,297]],0x99a499,INK,1.5);
          // Fortress wall, towers, crenellations and timber gate.
          polygon(g,[[548,454],[548,301],[584,277],[620,301],[620,454]],0x748aa3,INK,2);
          polygon(g,[[620,454],[620,301],[660,286],[700,301],[700,454]],0x99a499,INK,2);
          polygon(g,[[700,454],[700,301],[760,301],[760,454]],0x748aa3,INK,2);
          polygon(g,[[760,454],[760,288],[800,266],[840,288],[840,454]],0x99a499,INK,2);
          polygon(g,[[840,454],[840,310],[879,291],[918,310],[918,454]],0x748aa3,INK,2);
          [[548,301,36],[620,301,40],[760,288,40],[840,310,39]].forEach(function(t){
            polygon(g,[[t[0],t[1]],[t[0],t[1]-22],[t[0]+10,t[1]-22],[t[0]+10,t[1]-31],[t[0]+19,t[1]-31],[t[0]+19,t[1]-22],[t[0]+t[2],t[1]-22],[t[0]+t[2],t[1]]],0xc2a879,INK,1.5);
          });
          polygon(g,[[674,454],[674,369],[704,337],[734,369],[734,454]],0x805a43,INK,2);
          for(var row=0;row<3;row++)for(var col=0;col<6;col++){var wx=565+col*53,wy=323+row*38;g.fillStyle(0xf1d092,.85);g.fillRect(wx,wy,15,20);g.lineStyle(1,INK,.75);g.strokeRect(wx,wy,15,20);}
          g.fillStyle(0xe9b65f,1);g.fillRect(80,345,90,4);g.fillStyle(0x748aa3,1);g.fillRect(90,350,70,3);
          g.destroy();
          this.add.text(576,476,'FORT TINT-02',{fontFamily:'Arial',fontSize:'10px',color:'#424c48',fontStyle:'bold',letterSpacing:2});
        }
        makeTargets(){
          var g=this.add.graphics().setDepth(8);
          this.targets=[{x:644,y:305,label:'01'},{x:755,y:278,label:'02'},{x:858,y:317,label:'03'}];
          this.targets.forEach((t,i)=>{
            g.lineStyle(2,INK,1);g.fillStyle(i===0?0xe9b65f:(i===1?0xc27d64:0x748aa3),1);g.fillRect(t.x-15,t.y-27,30,40);g.strokeRect(t.x-15,t.y-27,30,40);
            g.fillStyle(0xf8f5eb,1);g.fillRect(t.x-9,t.y-19,18,14);g.fillStyle(INK,1);g.fillCircle(t.x,t.y-12,2);
            g.lineStyle(1.5,INK,1);g.strokeRect(t.x-29,t.y+18,58,13);
            var zone=this.add.zone(t.x,t.y,70,100);this.physics.world.enable(zone,Phaser.Physics.Arcade.STATIC_BODY);zone.body.setSize(70,100);t.zone=zone;t.graphicIndex=i;
          });
          strokeLine(g,636,358,636,445,INK,3);strokeLine(g,755,330,755,445,INK,3);strokeLine(g,858,368,858,445,INK,3);
        }
        redrawAim(){
          this.aimGraphic.clear();
          if(this.active)return;
          var radians=Phaser.Math.DegToRad(this.angle),len=115;
          this.aimGraphic.lineStyle(2,0x545555,.85);this.aimGraphic.beginPath();this.aimGraphic.moveTo(213,302);this.aimGraphic.lineTo(213+Math.cos(radians)*len,302-Math.sin(radians)*len);this.aimGraphic.strokePath();
          this.aimGraphic.fillStyle(0xe9b65f,1);this.aimGraphic.fillCircle(213+Math.cos(radians)*len,302-Math.sin(radians)*len,4);
        }
        fire(){
          if(this.active||this.physics.world.isPaused)return;
          if(this.shots>=9){reportResult(false,'The banners held.','Reset the arm, adjust the angle and try the fortress again.');this.physics.pause();return;}
          this.shots++;
          var stone=this.physics.add.image(220,290,'siege-stone').setDepth(11);
          stone.body.setCircle(11);stone.body.setAllowGravity(true);stone.body.setGravityY(0);
          var radians=Phaser.Math.DegToRad(this.angle);
          stone.setVelocity(Math.cos(radians)*this.power,-Math.sin(radians)*this.power);
          this.active=stone;
          this.targetZones.forEach(function(){});
          this.targets.forEach((t)=>{if(!t.hit)this.physics.add.overlap(stone,t.zone,()=>this.hitTarget(t),null,this);});
          this.aimText.setText('SHOT '+this.shots+' / 9   ·   ARC IN FLIGHT');
          setStats(this.hits+' / 3',this.shots+' / 9',this.angle+'°');
        }
        hitTarget(target){
          if(!this.active||target.hit)return;
          target.hit=true;this.hits++;
          if(target.zone&&target.zone.body)target.zone.body.enable=false;
          if(this.active.body)this.active.body.enable=false;
          var burst=this.add.graphics().setDepth(20);burst.lineStyle(3,0xe9b65f,1);burst.strokeCircle(target.x,target.y,18);
          this.tweens.add({targets:burst,alpha:0,scale:1.8,duration:450,onComplete:function(){burst.destroy();}});
          var stamp=this.add.text(target.x,target.y-42,'HIT!',{fontFamily:'Arial',fontSize:'13px',color:'#89573e',fontStyle:'bold'}).setOrigin(.5).setDepth(25);
          this.tweens.add({targets:stamp,y:stamp.y-22,alpha:0,duration:650,onComplete:function(){stamp.destroy();}});
          this.active.destroy();this.active=null;
          setStats(this.hits+' / 3',this.shots+' / 9',this.angle+'°');
          if(this.hits>=3){this.time.delayedCall(500,()=>{reportResult(true,'Three banners down.','A well-aimed campaign makes a memorable offer. Your shared game code is ready.');this.physics.pause();});}
          else this.aimText.setText('GOOD HIT  ·  SET THE NEXT ARC');
        }
        action(){this.fire();}
        update(time,delta){
          this.elapsed+=delta;
          if(Phaser.Input.Keyboard.JustDown(this.keys.UP))this.angle=Math.min(43,this.angle+2);
          if(Phaser.Input.Keyboard.JustDown(this.keys.DOWN))this.angle=Math.max(5,this.angle-2);
          if(Phaser.Input.Keyboard.JustDown(this.keys.RIGHT))this.power=Math.min(810,this.power+20);
          if(Phaser.Input.Keyboard.JustDown(this.keys.LEFT))this.power=Math.max(500,this.power-20);
          this.aimText.setText(this.active?'SHOT '+this.shots+' / 9   ·   ARC IN FLIGHT':'AIM  '+this.angle+'°   ·   POWER '+this.power+'   ·   PRESS SPACE');
          this.redrawAim();
          if(this.active){
            if(this.active.y>525||this.active.x>955||this.active.x<0){
              this.active.destroy();this.active=null;setStats(this.hits+' / 3',this.shots+' / 9',this.angle+'°');
              if(this.shots>=9&&this.hits<3){reportResult(false,'The banners held.','Reset the arm, adjust the angle and try the fortress again.');this.physics.pause();}
            }
          }
        }
      };
    }

    if (type === 'trade-district') {
      return class TradeScene extends Phaser.Scene {
        constructor(){super({key:'MiniGameScene'});this.claimed=0;this.elapsed=0;}
        create(){
          this.physics.world.setBounds(0,0,960,540);this.physics.world.gravity.y=0;
          this.drawDistrict();
          makeTexture(this,'district-courier',68,104,function(g){courierTexture(g,0x99a499);});
          this.player=this.physics.add.sprite(165,405,'district-courier').setDepth(20).setBodySize(30,66).setOffset(19,21).setCollideWorldBounds(true);
          this.cursors=this.input.keyboard.createCursorKeys();this.keys=this.input.keyboard.addKeys('W,A,S,D,E,ENTER');
          this.shops=[
            {x:315,y:255,name:'ATELIER NORD',type:'Clothing studio'},
            {x:548,y:201,name:'GEAR & GRAIN',type:'Market hall'},
            {x:751,y:294,name:'POST & PARCEL',type:'Courier counter'}
          ];
          this.shopMarkers=[];
          this.shops.forEach((shop,i)=>{
            var marker=this.add.circle(shop.x,shop.y,27,0xe9b65f,.23).setStrokeStyle(2,INK,1).setDepth(4);
            var name=this.add.text(shop.x,shop.y-43,shop.name,{fontFamily:'Arial',fontSize:'9px',color:'#343a37',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(12);
            shop.marker=marker;shop.nameText=name;shop.claimed=false;this.shopMarkers.push(shop);
          });
          this.prompt=this.add.text(480,500,'WALK TO A SHOP AND PRESS E TO CONNECT',{fontFamily:'Arial',fontSize:'11px',color:'#414a45',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(40);
          this.input.keyboard.on('keydown-E',this.action,this);this.input.keyboard.on('keydown-ENTER',this.action,this);
          setStats('0 / 3','OPEN','00:00');
        }
        drawDistrict(){
          var g=this.add.graphics();
          g.fillStyle(0xe9e6dc,1);g.fillRect(0,0,960,540);
          // Isometric neighborhood tiles and a clean, readable market street.
          for(var row=0;row<8;row++)for(var col=0;col<13;col++){
            var cx=col*84+(row%2)*42-20,cy=78+row*58;
            polygon(g,[[cx,cy],[cx+42,cy-22],[cx+84,cy],[cx+42,cy+22]],(row+col)%2?0xe2dfd3:0xd9ddd4,0xb3b7ae,.8);
          }
          polygon(g,[[0,364],[330,188],[470,188],[100,540]],0x77858a,INK,1.5);
          polygon(g,[[415,540],[760,185],[960,185],[960,370],[585,540]],0x77858a,INK,1.5);
          strokeLine(g,35,440,384,269,0xe9b65f,3,.9);strokeLine(g,456,480,869,197,0xe9b65f,3,.9);
          // Low skyline, roofs and shop masses.
          this.drawShop(g,315,260,0xd4b8a1,0x748aa3,'ATELIER NORD','🇺🇦');
          this.drawShop(g,548,205,0xb8c8bb,0xe9b65f,'GEAR & GRAIN','✦');
          this.drawShop(g,751,300,0xc6b49d,0x99a499,'POST & PARCEL','↗');
          for(var k=0;k<30;k++){var x=18+k*34,y=511+(k%2)*14;g.fillStyle(k%3===0?0xe9b65f:0xd1c7b6,.8);g.fillEllipse(x,y,11,4);}
          g.destroy();
          this.add.text(28,22,'THE TRADE DISTRICT',{fontFamily:'Arial',fontSize:'11px',color:'#4c5650',fontStyle:'bold',letterSpacing:2});
          this.add.text(30,45,'YOUR BRAND · YOUR SHOP · ONE SHARED TOUR',{fontFamily:'Arial',fontSize:'8px',color:'#626b64',letterSpacing:1.5});
        }
        drawShop(g,x,y,wall,awning,shopName,flag){
          var baseY=y+58;
          polygon(g,[[x-84,baseY-55],[x-25,baseY-90],[x+75,baseY-82],[x+17,baseY-48]],0x64716d,INK,1.4);
          polygon(g,[[x-84,baseY-55],[x+17,baseY-48],[x+17,baseY+24],[x-84,baseY+12]],wall,INK,1.5);
          polygon(g,[[x+17,baseY-48],[x+75,baseY-82],[x+75,baseY-5],[x+17,baseY+24]],0x9c9c8e,INK,1.5);
          polygon(g,[[x-91,baseY-56],[x-31,baseY-96],[x+82,baseY-86],[x+19,baseY-45]],awning,INK,1.5);
          for(var stripe=0;stripe<5;stripe++)strokeLine(g,x-70+stripe*18,baseY-62-stripe*6,x-68+stripe*18,baseY-51-stripe*5,0xf8f3e6,2,.9);
          g.fillStyle(0xf3eddf,1);g.fillRect(x-60,baseY-31,35,43);g.lineStyle(1.5,INK,1);g.strokeRect(x-60,baseY-31,35,43);
          g.fillStyle(0x748aa3,1);g.fillRect(x-15,baseY-32,23,56);g.lineStyle(1.5,INK,1);g.strokeRect(x-15,baseY-32,23,56);
          g.fillStyle(0xe9b65f,1);g.fillRect(x-18,baseY-59,62,13);g.lineStyle(1,INK,1);g.strokeRect(x-18,baseY-59,62,13);
          this.add.text(x+13,baseY-56,shopName,{fontFamily:'Arial',fontSize:'5px',color:'#2f3834',fontStyle:'bold'}).setDepth(9);
          g.lineStyle(1.4,INK,1);g.lineBetween(x+55,baseY-91,x+55,baseY-119);g.fillStyle(0xf4efe5,1);g.fillRoundedRect(x+55,baseY-119,36,22,3);g.lineStyle(1.2,INK,1);g.strokeRoundedRect(x+55,baseY-119,36,22,3);
          this.add.text(x+73,baseY-108,flag,{fontFamily:'Arial',fontSize:'10px',color:'#39413d',fontStyle:'bold'}).setOrigin(.5).setDepth(10);
          for(var box=0;box<3;box++){g.fillStyle(box===1?0xe9b65f:0x748aa3,1);g.fillRect(x-79+box*22,baseY+14,17,13);g.lineStyle(1,INK,1);g.strokeRect(x-79+box*22,baseY+14,17,13);}
        }
        action(){
          if(!this.player||this.physics.world.isPaused)return;
          var closest=null,best=Infinity;
          this.shops.forEach(function(shop){if(shop.claimed)return;var d=Phaser.Math.Distance.Between(this.player.x,this.player.y,shop.x,shop.y);if(d<best){best=d;closest=shop;}},this);
          if(!closest||best>96){this.prompt.setText('GET CLOSER TO A SHOP COUNTER');return;}
          closest.claimed=true;this.claimed++;
          closest.marker.setFillStyle(0x99a499,.52);closest.marker.setStrokeStyle(3,0x545555,1);
          closest.nameText.setColor('#526855').setText('✓ '+closest.name);
          this.tweens.add({targets:closest.marker,scale:1.45,alpha:.15,duration:700});
          this.prompt.setText(closest.type+' CONNECTED TO THE TOUR');
          setStats(this.claimed+' / 3','LINKING',this.formatTime());
          if(this.claimed===3){this.time.delayedCall(400,()=>{reportResult(true,'Three shops. One district.','The market is ready for a branded virtual tour. Share the code with your order.');this.physics.pause();});}
        }
        formatTime(){var s=Math.floor(this.elapsed/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
        update(time,delta){
          this.elapsed+=delta;
          var dx=(this.cursors.right.isDown||this.keys.D.isDown?1:0)-(this.cursors.left.isDown||this.keys.A.isDown?1:0)+(touch.right?1:0)-(touch.left?1:0);
          var dy=(this.cursors.down.isDown||this.keys.S.isDown?1:0)-(this.cursors.up.isDown||this.keys.W.isDown?1:0);
          if(dx||dy){var v=new Phaser.Math.Vector2(dx,dy).normalize().scale(185);this.player.setVelocity(v.x,v.y);this.player.setFlipX(dx<0);}
          else this.player.setVelocity(0,0);
          var near=this.shops.some((shop)=>!shop.claimed&&Phaser.Math.Distance.Between(this.player.x,this.player.y,shop.x,shop.y)<96);
          if(near&&this.prompt.text==='GET CLOSER TO A SHOP COUNTER')this.prompt.setText('PRESS E / BRAND TO CONNECT THIS SHOP');
          if(Math.floor(this.elapsed/1000)!==Math.floor((this.elapsed-delta)/1000))setStats(this.claimed+' / 3',this.claimed===3?'READY':'OPEN',this.formatTime());
        }
      };
    }

    var laundryConfig = {
      'laundry-french': { left:0xd9aaa0, right:0xd8c29e, far:0xa7c0c9, awning:0x748aa3, street:0xc8c5b8, sky:0xe5eee8, lamp:0xe9b65f, detail:3, bird:0x545555, tagline:'RUE DES PETITES OFFRES' },
      'laundry-roman': { left:0xc98767, right:0xe0bc86, far:0xb7b1a0, awning:0x99a499, street:0xc1a98f, lamp:0xe9b65f, sky:0xf2e4c9, detail:4, bird:0x514b45, tagline:'TRASTEVERE · BOUTIQUE NORD' },
      'laundry-dusk': { left:0x748aa3, right:0x89928f, far:0x647784, awning:0x99a499, street:0x626c70, lamp:0xe9b65f, sky:0xb8c9ce, detail:2, bird:0x3e4b53, tagline:'BLUE HOUR · LAST WASH' },
      'laundry-haussmann': { architecture:'haussmann', left:0xd9d0bd, right:0xe6dcc8, far:0xa9bec0, awning:0x748aa3, street:0xc4bba9, sky:0xe5eee8, lamp:0xe9b65f, detail:4, bird:0x545555, tagline:'HAUSSMANN LANE · PARIS' },
      'laundry-rue': { architecture:'pastel-rue', left:0xc8a9a2, right:0xc0ccd0, far:0x99a499, awning:0x748aa3, street:0xc4c2b5, sky:0xe4ece8, lamp:0xe9b65f, detail:3, bird:0x545555, tagline:'RUE DES ATELIERS · PARIS' },
      'laundry-passage': { architecture:'stone-passage', left:0xc3ad91, right:0xd5c6a8, far:0x82969a, awning:0x99a499, street:0xb8ad9a, sky:0xe7e9df, lamp:0xe9b65f, detail:4, bird:0x545555, tagline:'THE BALCONY PASSAGE' },
      'laundry-ink-lane': { architecture:'ink-lane', sketch:true, motif:'gable', left:0xd2c2a4, right:0xb9c8c0, far:0xb8c9c4, awning:0x748aa3, street:0xbab3a4, sky:0xe4ece7, lamp:0xe9b65f, detail:3, bird:0x545555, tagline:'INK & OCHRE · OLD TOWN' },
      'laundry-balcony-line': { architecture:'balcony-line', sketch:true, motif:'balcony', left:0xd4b7ad, right:0xc4d0c9, far:0xa7bdc0, awning:0x748aa3, street:0xc7bdad, sky:0xe7eee9, lamp:0xe9b65f, detail:4, bird:0x545555, tagline:'BALCONY TO BALCONY' },
      'laundry-market-rue': { architecture:'market-rue', sketch:true, cleanStreet:true, motif:'market', left:0xc6aa8e, right:0xd7c5a5, far:0xa4b9b8, awning:0x99a499, street:0xc2b29d, sky:0xece9db, lamp:0xe9b65f, detail:3, bird:0x545555, tagline:'THE MARKET RUE' },
      'laundry-lantern-court': { architecture:'lantern-court', sketch:true, cleanStreet:true, motif:'lantern', left:0xb7aca0, right:0x9aa9a6, far:0x88999d, awning:0x748aa3, street:0x9fa29a, sky:0xd8e1df, lamp:0xe9b65f, detail:4, bird:0x414a49, tagline:'LANTERN COURTYARD · 19:40' },
      'laundry-rooftop-wash': { architecture:'rooftop-wash', sketch:true, cleanStreet:true, motif:'roof', left:0xd0b99a, right:0xc5c6b7, far:0xabbcba, awning:0x748aa3, street:0xbab4a5, sky:0xe6eee9, lamp:0xe9b65f, detail:4, bird:0x545555, tagline:'ROOFTOPS · WASHING LINE' },
      'laundry-painted-rue': { architecture:'painted-rue', sketch:true, cleanStreet:true, motif:'brush', left:0xc7b8a8, right:0xb4c2bd, far:0x99b4b4, awning:0x748aa3, street:0xbab6aa, sky:0xe9efe9, lamp:0xe9b65f, detail:2, bird:0x545555, tagline:'PEN LINES · COLOR WASH' },
      'laundry-blue-courtyard': { architecture:'blue-courtyard', sketch:true, cleanStreet:true, motif:'blue-hour', left:0x9eaaa9, right:0xaab7b5, far:0x82969a, awning:0x748aa3, street:0x9da4a0, sky:0xd5e0e1, lamp:0xe9b65f, detail:3, bird:0x414a49, tagline:'BLUE HOUR · THE STREET CONTINUES' },
      'laundry-corner-cast': { windowStudy:true, architecture:'corner-cast', left:0xd4b59b, right:0x879ba2, far:0xaabbb6, awning:0x748aa3, street:0xc1b6a7, sky:0xe6ece6, lamp:0xe9b65f, detail:3, bird:0x545555, tagline:'CORNER CAST · LIGHT FALLS INTO THE RUE' },
      'laundry-twin-courts': { windowStudy:true, architecture:'twin-courts', left:0xcbbda9, right:0xd9c8b1, far:0x91a8a9, awning:0x748aa3, street:0xb8b7ad, sky:0xe6eee8, lamp:0xe9b65f, detail:4, bird:0x545555, tagline:'TWIN FACADES · A SHARED COURTYARD' },
      'laundry-arcade-depth': { windowStudy:true, architecture:'arcade-depth', left:0xc6b79f, right:0xb4c3bd, far:0x748aa3, awning:0x99a499, street:0xb8b4a7, sky:0xe6eee8, lamp:0xe9b65f, detail:3, bird:0x545555, tagline:'ARCADE STREET · ARCH AFTER ARCH' },
      'laundry-stairwell-lane': { windowStudy:true, architecture:'stairwell-lane', left:0xd1b49c, right:0xa8b9b6, far:0x81979b, awning:0x748aa3, street:0xb9b3a7, sky:0xe8eee7, lamp:0xe9b65f, detail:4, bird:0x545555, tagline:'LANDINGS · SHUTTERS · THE WAY DOWN' },
      'laundry-bay-windows': { windowStudy:true, architecture:'bay-windows', left:0xb9b7aa, right:0xd3b7a0, far:0x8096a1, awning:0x748aa3, street:0xaeb1aa, sky:0xdbe5e4, lamp:0xe9b65f, detail:3, bird:0x414a49, tagline:'BAY WINDOWS · LAST LIGHT ON THE STREET' },
      'laundry-bay-windows-34': { windowStudy:true, architecture:'bay-windows', left:0xb9b7aa, right:0xd3b7a0, far:0x8096a1, awning:0x748aa3, street:0xaeb1aa, sky:0xdbe5e4, lamp:0xe9b65f, detail:3, bird:0x414a49, tagline:'BAY WINDOWS · LAST LIGHT ON THE STREET' }
    };

    if (type === 'discount-invaders') {
      return class CouponConvoyScene extends Phaser.Scene {
        constructor(){super({key:'MiniGameScene'});this.score=0;this.lives=3;this.elapsed=0;this.direction=1;this.stepClock=0;this.shotAt=0;this.enemyShotAt=0;this.enemySpeed=48;}
        create(){
          this.physics.world.setBounds(0,0,960,540);this.physics.world.gravity.y=0;this.drawMarketDefense();
          makeTexture(this,'convoy-hero',58,82,function(g){
            g.lineStyle(1.8,INK,1);g.fillStyle(0xe9c19c,1);g.fillCircle(29,13,10);g.strokeCircle(29,13,10);g.fillStyle(0x4b3b31,1);g.fillEllipse(29,7,20,10);
            g.fillStyle(0x748aa3,1);g.fillRoundedRect(15,24,28,31,5);g.strokeRoundedRect(15,24,28,31,5);g.fillStyle(0xe9b65f,1);g.fillRect(22,31,14,4);g.fillRect(27,38,5,11);
            g.fillStyle(0xc7ae8d,1);g.fillRoundedRect(8,30,10,24,3);g.strokeRoundedRect(8,30,10,24,3);g.fillStyle(0x545555,1);g.fillRect(20,54,7,18);g.fillRect(32,54,7,18);g.fillStyle(INK,1);g.fillRoundedRect(15,70,15,6,2);g.fillRoundedRect(31,70,15,6,2);
            polygon(g,[[18,26],[23,22],[29,28],[35,22],[40,26],[37,35],[21,35]],0xf7f2e7,INK,.8);
          });
          makeTexture(this,'convoy-raider',40,32,function(g){g.lineStyle(1.8,INK,1);g.fillStyle(0xc27d64,1);g.fillRoundedRect(3,5,34,23,6);g.strokeRoundedRect(3,5,34,23,6);g.fillStyle(0xe9b65f,1);g.fillCircle(12,14,4);g.fillCircle(28,14,4);g.fillStyle(0xf6efe0,1);g.fillRect(12,21,16,4);strokeLine(g,8,2,4,-2,INK,1.5);strokeLine(g,32,2,36,-2,INK,1.5);});
          makeTexture(this,'convoy-shot',14,22,function(g){g.fillStyle(0xe9b65f,1);g.fillRoundedRect(4,1,6,19,3);g.lineStyle(1,INK,1);g.strokeRoundedRect(4,1,6,19,3);});
          makeTexture(this,'convoy-return',18,22,function(g){polygon(g,[[9,1],[16,8],[13,19],[5,19],[2,8]],0x748aa3,INK,1.2);g.fillStyle(0xe9b65f,1);g.fillRect(7,7,4,7);});
          this.player=this.physics.add.sprite(480,478,'convoy-hero').setDepth(10).setCollideWorldBounds(true).setBodySize(34,64).setOffset(12,10);this.player.body.allowGravity=false;
          this.keys=this.input.keyboard.addKeys('A,D,LEFT,RIGHT,SPACE');this.raiders=this.physics.add.group({allowGravity:false,immovable:true});this.playerShots=this.physics.add.group({allowGravity:false});this.enemyShots=this.physics.add.group({allowGravity:false});
          for(var r=0;r<4;r++)for(var col=0;col<8;col++){var enemy=this.raiders.create(190+col*82,95+r*48,'convoy-raider').setDepth(8);enemy.setBodySize(34,24);enemy.body.allowGravity=false;enemy.setData('row',r);}
          this.physics.add.overlap(this.playerShots,this.raiders,this.hitRaider,null,this);this.physics.add.overlap(this.player,this.enemyShots,this.hitPlayer,null,this);
          this.clock=this.add.text(22,16,'NORTHSTAR MARKET · PROTECT THE CHECKOUT',{fontFamily:'Arial',fontSize:'10px',color:'#48534e',fontStyle:'bold',letterSpacing:1.5}).setDepth(30);
          this.input.keyboard.on('keydown-SPACE',()=>this.fire(),this);this.input.on('pointerdown',(p)=>{if(p.y>270)this.fire();},this);setStats('0 / 24','3','00:00');
        }
        action(){this.fire();}
        drawMarketDefense(){var g=this.add.graphics();g.fillGradientStyle(0xe5eee8,0xe5eee8,0xc8d7d5,0xf1eadb,1);g.fillRect(0,0,960,540);polygon(g,[[0,390],[960,390],[960,540],[0,540]],0xc8c1b2,false,0);polygon(g,[[0,276],[960,276],[960,390],[0,390]],0xd9d5ca,false,0);
          for(var b=0;b<5;b++){var x=38+b*192,w=140,h=104+(b%3)*24;polygon(g,[[x,275-h],[x+w,275-h],[x+w,390],[x,390]],b%2?0xd9c9b1:0xc6d1cb,INK,1.3);polygon(g,[[x-6,275-h],[x+w/2,249-h],[x+w+6,275-h]],0x748aa3,INK,1.2);for(var rw=0;rw<2;rw++)for(var cw=0;cw<3;cw++){var wx=x+14+cw*38,wy=293-h+rw*38;g.fillStyle(0xe7eee7,1);g.fillRect(wx,wy,21,25);g.lineStyle(1,INK,.8);g.strokeRect(wx,wy,21,25);strokeLine(g,wx+10,wy,wx+10,wy+25,INK,.6,.8);}}
          polygon(g,[[0,495],[960,495],[960,540],[0,540]],0x9da69e,false,0);for(var stripe=0;stripe<11;stripe++)strokeLine(g,stripe*96,507,stripe*96+42,507,0xf0e5ca,2,.6);
          polygon(g,[[345,329],[615,329],[640,412],[320,412]],0xb7a98f,INK,1.4);polygon(g,[[367,343],[593,343],[610,402],[350,402]],0x748aa3,INK,1.1);g.fillStyle(0x545555,1);g.fillRect(418,350,124,43);g.lineStyle(1.3,INK,1);g.strokeRect(418,350,124,43);g.fillStyle(0xe9b65f,1);g.fillRect(432,360,96,7);this.add.text(480,374,'CHECKOUT',{fontFamily:'Arial',fontSize:'9px',color:'#f5f0e6',fontStyle:'bold',letterSpacing:1.4}).setOrigin(.5).setDepth(3);drawBicycleGraphic(g,115,467,0x545555);drawFicusGraphic(g,842,469,0x99a499);g.destroy();}
        fire(){if(!this.player||this.physics.world.isPaused||this.time.now<this.shotAt)return;this.shotAt=this.time.now+260;var shot=this.playerShots.create(this.player.x,this.player.y-42,'convoy-shot').setDepth(12);shot.body.allowGravity=false;shot.setVelocityY(-470);this.time.delayedCall(1400,()=>{if(shot.active)shot.destroy();});}
        hitRaider(shot,enemy){if(!shot.active||!enemy.active)return;shot.destroy();enemy.destroy();this.score++;setStats(this.score+' / 24',this.lives,this.formatTime());if(this.score>=24){reportResult(true,'Checkout protected.','The coupon convoy is cleared. Share the reward code with your order.');this.physics.pause();}}
        hitPlayer(player,shot){if(!shot.active||this.time.now<this.hitUntil)return;shot.destroy();this.hitUntil=this.time.now+950;this.lives--;this.tweens.add({targets:player,alpha:.3,duration:70,yoyo:true,repeat:5});setStats(this.score+' / 24',this.lives,this.formatTime());if(this.lives<=0){reportResult(false,'The convoy broke through.','Reset the market defense and try a steadier firing rhythm.');this.physics.pause();}}
        update(time,delta){if(!this.player||this.physics.world.isPaused)return;this.elapsed+=delta;this.stepClock+=delta;var move=this.enemySpeed+Math.min(75,this.score*2);if(this.stepClock>Math.max(95,360-this.score*8)){this.stepClock=0;var edge=false;this.raiders.getChildren().forEach((enemy)=>{if(enemy.active&&(enemy.x+this.direction*move*.055<48||enemy.x+this.direction*move*.055>912))edge=true;});if(edge){this.direction*=-1;this.raiders.getChildren().forEach((enemy)=>{if(enemy.active)enemy.y+=17;});}else this.raiders.getChildren().forEach((enemy)=>{if(enemy.active)enemy.x+=this.direction*move*.055;});}
          var left=this.keys.A.isDown||this.keys.LEFT.isDown||touch.left,right=this.keys.D.isDown||this.keys.RIGHT.isDown||touch.right;this.player.setVelocityX(left?-290:(right?290:0));if(this.keys.SPACE.isDown)this.fire();if(time>this.enemyShotAt&&this.raiders.countActive()>0){this.enemyShotAt=time+Phaser.Math.Between(500,950);var candidates=this.raiders.getChildren().filter(function(e){return e.active;});var shooter=candidates[Phaser.Math.Between(0,candidates.length-1)];var shot=this.enemyShots.create(shooter.x,shooter.y+20,'convoy-return').setDepth(9);shot.body.allowGravity=false;shot.setVelocityY(Phaser.Math.Between(190,270));this.time.delayedCall(2500,()=>{if(shot.active)shot.destroy();});}
          this.enemyShots.getChildren().forEach(function(s){if(s.active&&s.y>540)s.destroy();});if(this.raiders.getChildren().some((e)=>e.active&&e.y>420)){reportResult(false,'The raiders reached the counter.','Keep the formation from descending to the shopfront.');this.physics.pause();}if(Math.floor(this.elapsed/1000)!==Math.floor((this.elapsed-delta)/1000))setStats(this.score+' / 24',this.lives,this.formatTime());}
        formatTime(){var s=Math.floor(this.elapsed/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
      };
    }

    if (type === 'market-rooftop-run') {
      return class MarketRooftopScene extends Phaser.Scene {
        constructor(){super({key:'MiniGameScene'});this.parcels=0;this.lives=3;this.elapsed=0;this.lastHit=0;}
        create(){this.physics.world.setBounds(0,0,960,540);this.physics.world.gravity.y=920;this.drawRooftopMap();
          makeTexture(this,'market-runner',58,82,function(g){g.lineStyle(1.8,INK,1);g.fillStyle(0xe8bd91,1);g.fillCircle(29,14,10);g.lineStyle(1.4,INK,1);g.strokeCircle(29,14,10);g.fillStyle(0x45413c,1);g.fillEllipse(29,7,21,11);g.fillStyle(0xc27d64,1);g.fillRect(17,7,24,3);g.fillStyle(0x99a499,1);g.fillRoundedRect(15,25,28,31,5);g.strokeRoundedRect(15,25,28,31,5);g.fillStyle(0xe9b65f,1);g.fillRect(22,32,14,5);g.fillStyle(0x748aa3,1);g.fillRoundedRect(8,32,10,22,3);g.strokeRoundedRect(8,32,10,22,3);g.fillStyle(0x545555,1);g.fillRect(19,56,8,15);g.fillRect(32,56,8,15);g.fillStyle(INK,1);g.fillRoundedRect(14,70,17,6,2);g.fillRoundedRect(31,70,17,6,2);});
          makeTexture(this,'market-ledge',64,18,function(g){polygon(g,[[0,4],[64,4],[58,17],[5,17]],0x99a499,INK,1.3);strokeLine(g,3,5,60,5,0xf3ead7,1.2);});makeTexture(this,'market-parcel',30,30,function(g){polygon(g,[[5,6],[25,6],[25,25],[5,25]],0xe9b65f,INK,1.3);strokeLine(g,5,11,25,11,0x6e5737,1);strokeLine(g,15,6,15,25,0x6e5737,1);g.fillStyle(0x748aa3,1);g.fillRect(11,14,8,5);});
          this.platforms=this.physics.add.staticGroup();this.platformLayout=[[120,485,240],[278,407,130],[420,342,150],[572,425,160],[710,351,145],[835,273,210],[655,209,145],[452,266,100]];this.platformLayout.forEach((p)=>this.addMarketPlatform(p[0],p[1],p[2]));
          this.player=this.physics.add.sprite(48,414,'market-runner').setDepth(15).setBodySize(30,63).setOffset(14,10).setCollideWorldBounds(true);this.player.setBounce(.02);this.physics.add.collider(this.player,this.platforms);this.cursors=this.input.keyboard.createCursorKeys();this.keys=this.input.keyboard.addKeys('A,D,W');
          this.pickups=this.physics.add.staticGroup();[[225,443],[282,368],[419,302],[710,311],[830,231]].forEach((p)=>this.pickups.create(p[0],p[1],'market-parcel').setDepth(12));this.physics.add.overlap(this.player,this.pickups,this.collectParcel,null,this);
          makeTexture(this,'market-patrol',34,58,function(g){g.lineStyle(1.5,INK,1);g.fillStyle(0xc27d64,1);g.fillRoundedRect(9,24,16,22,3);g.strokeRoundedRect(9,24,16,22,3);g.fillStyle(0xead1b2,1);g.fillCircle(17,15,8);g.fillStyle(0x45413c,1);g.fillEllipse(17,10,17,8);g.fillStyle(0x748aa3,1);g.fillRect(11,29,12,3);strokeLine(g,12,46,10,55,INK,3);strokeLine(g,22,46,24,55,INK,3);});
          this.patrols=this.physics.add.group({allowGravity:false,immovable:true});[[540,385,500,630],[779,315,728,830]].forEach((p)=>{var rival=this.patrols.create(p[0],p[1],'market-patrol').setDepth(13);rival.body.allowGravity=false;rival.body.setImmovable(true);this.tweens.add({targets:rival,x:{from:p[2],to:p[3]},duration:2600,yoyo:true,repeat:-1,ease:'Sine.InOut'});});this.physics.add.overlap(this.player,this.patrols,this.hitPatrol,null,this);
          this.goal=this.add.rectangle(884,214,40,62,0xe9b65f,.8).setStrokeStyle(2,INK,1).setDepth(11);this.add.text(884,214,'SHOP',{fontFamily:'Arial',fontSize:'8px',color:'#3c4540',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(12);this.physics.add.existing(this.goal,true);this.physics.add.overlap(this.player,this.goal,this.finishRoute,null,this);
          this.clock=this.add.text(22,16,'OLD MARKET · ROOFTOP DELIVERY',{fontFamily:'Arial',fontSize:'10px',color:'#48534e',fontStyle:'bold',letterSpacing:1.5}).setDepth(30);this.actionButton=this.input.keyboard.addKeys('SPACE');setStats('0 / 5',this.lives,'00:00');}
        drawRooftopMap(){var g=this.add.graphics();g.fillGradientStyle(0xe4eee8,0xe4eee8,0xd2dfde,0xece3d4,1);g.fillRect(0,0,960,540);g.fillStyle(0x748aa3,.17);g.fillEllipse(472,116,660,180);
          // Staggered old-market blocks form a readable platform-game skyline.
          for(var i=0;i<7;i++){var x=i*151-30,h=112+(i%3)*36,w=124+(i%2)*15,wall=[0xd8c7ae,0xb9c8c0,0xc9b69f,0x99a499][i%4];polygon(g,[[x,352-h],[x+w,352-h],[x+w,493],[x,493]],wall,INK,1.05);polygon(g,[[x-5,352-h],[x+w*.5,332-h],[x+w+5,352-h]],i%2?0x748aa3:0x817b70,INK,1);for(var row=0;row<3;row++)for(var col=0;col<3;col++){var wx=x+14+col*34,wy=371-h+row*39;g.fillStyle(row===0&&i%2?0xe9b65f:0x748aa3,.67);g.fillRect(wx,wy,19,24);g.lineStyle(.85,INK,.75);g.strokeRect(wx,wy,19,24);strokeLine(g,wx+9.5,wy,wx+9.5,wy+24,INK,.6,.8);}if(i%2===0){g.fillStyle(0x99a499,1);g.fillRect(x+9,474,18,18);g.fillStyle(0x545555,1);g.fillRect(x+7,491,23,3);}}
          polygon(g,[[0,492],[960,492],[960,540],[0,540]],0xc5b9a6,false,0);polygon(g,[[0,501],[960,501],[960,540],[0,540]],0xd8cdbb,false,0);for(var paving=0;paving<10;paving++)strokeLine(g,paving*100,502,paving*100+8,540,0x777c76,.8,.55);
          drawBicycleGraphic(g,78,477,0x545555);drawFicusGraphic(g,915,476,0x99a499);g.destroy();}
        addMarketPlatform(x,y,width){var p=this.platforms.create(x,y,'market-ledge').setDisplaySize(width,18).setDepth(9).refreshBody();p.body.setSize(width,18,true);}
        collectParcel(player,item){item.destroy();this.parcels++;setStats(this.parcels+' / 5',this.lives,this.formatTime());var tag=this.add.text(player.x,player.y-42,'+ PARCEL',{fontFamily:'Arial',fontSize:'10px',color:'#755c31',fontStyle:'bold'}).setDepth(40);this.tweens.add({targets:tag,y:tag.y-25,alpha:0,duration:600,onComplete:()=>tag.destroy()});}
        hitPatrol(player){if(this.time.now-this.lastHit<1100)return;this.lastHit=this.time.now;this.lives--;player.setVelocityY(-300);player.setVelocityX(player.x<480?-170:170);setStats(this.parcels+' / 5',this.lives,this.formatTime());if(this.lives<=0){reportResult(false,'The rooftop route got crowded.','Try again and time your jumps between the market patrols.');this.physics.pause();}}
        finishRoute(){if(this.parcels<5){this.clock.setText('FIVE PARCELS FIRST · '+this.parcels+'/5');return;}reportResult(true,'All parcels delivered.','The rooftop shop is stocked. Share the coupon code with your order.');this.physics.pause();}
        action(){if(this.player&&this.player.body.blocked.down)this.player.setVelocityY(-510);}
        update(time,delta){if(!this.player||this.physics.world.isPaused)return;this.elapsed+=delta;var left=this.cursors.left.isDown||this.keys.A.isDown||touch.left,right=this.cursors.right.isDown||this.keys.D.isDown||touch.right;this.player.setVelocityX(left?-235:(right?235:0));if(left)this.player.setFlipX(true);if(right)this.player.setFlipX(false);if((Phaser.Input.Keyboard.JustDown(this.cursors.up)||Phaser.Input.Keyboard.JustDown(this.cursors.space)||Phaser.Input.Keyboard.JustDown(this.keys.W)||Phaser.Input.Keyboard.JustDown(this.actionButton.SPACE))&&this.player.body.blocked.down)this.action();if(this.player.y>550){this.player.setPosition(48,414);this.player.setVelocity(0,0);this.lives--;setStats(this.parcels+' / 5',this.lives,this.formatTime());}if(this.lives<=0){reportResult(false,'A parcel slipped off the rooftops.','Reset the route and watch the gaps between terraces.');this.physics.pause();}if(Math.floor(this.elapsed/1000)!==Math.floor((this.elapsed-delta)/1000))setStats(this.parcels+' / 5',this.lives,this.formatTime());}
        formatTime(){var s=Math.floor(this.elapsed/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
      };
    }

    if (type === 'market-bootstrap-platformer') {
      return class MarketBootstrapPlatformer extends Phaser.Scene {
        constructor(){super({key:'MiniGameScene'});this.parcels=0;this.lives=3;this.elapsed=0;this.checkpointX=52;this.lastClock=0;}
        create(){
          this.worldWidth=2100;this.physics.world.setBounds(0,0,this.worldWidth,620);this.physics.world.gravity.y=980;this.drawPlatformCity();
          makeTexture(this,'relay-runner',58,86,function(g){
            // A new character: a young rooftop messenger in a teal cap and rust scarf.
            g.lineStyle(1.7,INK,1);g.fillStyle(0xe9c19c,1);g.fillCircle(29,19,10);g.strokeCircle(29,19,10);
            g.fillStyle(0x748aa3,1);g.fillRoundedRect(17,7,25,9,3);g.strokeRoundedRect(17,7,25,9,3);g.fillRect(24,5,12,4);
            g.fillStyle(0x3f3935,1);g.fillCircle(26,19,1.2);g.fillCircle(33,19,1.2);strokeLine(g,27,25,32,25,0x895b4d,1);
            g.fillStyle(0x99a499,1);g.fillRoundedRect(17,30,25,29,5);g.strokeRoundedRect(17,30,25,29,5);
            g.fillStyle(0xe9b65f,1);g.fillRoundedRect(8,35,12,22,3);g.strokeRoundedRect(8,35,12,22,3);g.fillStyle(0x545555,1);g.fillRect(11,39,7,3);
            polygon(g,[[20,30],[29,35],[34,31],[39,35],[34,42],[25,42]],0xf5f0e6,INK,1);
            g.fillStyle(0xc27d64,1);polygon(g,[[25,30],[33,34],[37,30],[43,35],[39,41],[30,39]],0xc27d64,INK,1);
            g.fillStyle(0x545555,1);g.fillRect(20,58,8,17);g.fillRect(32,58,8,17);g.fillStyle(0x3e4140,1);g.fillRoundedRect(15,72,16,7,2);g.fillRoundedRect(30,72,17,7,2);
          });
          makeTexture(this,'relay-ledge',180,26,function(g){polygon(g,[[0,5],[180,5],[170,25],[9,25]],0x99a499,INK,1.5);polygon(g,[[0,2],[180,2],[180,8],[0,8]],0xe9b65f,INK,1);for(var i=1;i<6;i++)strokeLine(g,i*30,9,i*30-4,23,0x68756d,.9,.7);});
          makeTexture(this,'relay-parcel',32,36,function(g){polygon(g,[[5,8],[27,8],[27,29],[5,29]],0xe9b65f,INK,1.5);strokeLine(g,5,14,27,14,0x66583f,1.2);strokeLine(g,16,8,16,29,0x66583f,1.2);polygon(g,[[12,8],[16,3],[20,8]],0xc27d64,INK,1);g.fillStyle(0x748aa3,1);g.fillRect(12,18,8,5);});
          this.platforms=this.physics.add.staticGroup();this.platformLayout=[[140,510,280],[365,449,130],[545,386,130],[725,455,160],[925,392,140],[1125,326,160],[1325,407,160],[1525,345,160],[1800,492,390]];
          this.platformLayout.forEach((p)=>this.addRoutePlatform(p[0],p[1],p[2]));
          this.player=this.physics.add.sprite(52,430,'relay-runner').setDepth(20).setBodySize(32,58).setOffset(13,20).setCollideWorldBounds(true);this.player.setBounce(.02);this.physics.add.collider(this.player,this.platforms);
          this.cursors=this.input.keyboard.createCursorKeys();this.keys=this.input.keyboard.addKeys('A,D,W,SPACE');
          this.pickups=this.physics.add.staticGroup();[[225,462],[365,401],[545,338],[925,344],[1125,278],[1525,297]].forEach((p)=>{var item=this.pickups.create(p[0],p[1],'relay-parcel').setDepth(16);this.tweens.add({targets:item,alpha:.68,duration:760,yoyo:true,repeat:-1,ease:'Sine.InOut'});});
          this.physics.add.overlap(this.player,this.pickups,this.collectRelayParcel,null,this);
          this.drawRelayShop();this.shop=this.add.rectangle(1990,440,54,100,0xe9b65f,0).setDepth(10);this.physics.add.existing(this.shop,true);this.physics.add.overlap(this.player,this.shop,this.finishRelay,null,this);
          this.clock=this.add.text(22,17,'MARKET ROOFTOP RELAY · KEEP THE PARCELS MOVING',{fontFamily:'Arial',fontSize:'10px',color:'#48534e',fontStyle:'bold',letterSpacing:1.5}).setDepth(30).setScrollFactor(0);
          this.cameras.main.setBounds(0,0,this.worldWidth,620).startFollow(this.player,true,.085,.085);this.cameras.main.setDeadzone(300,120);
          setStats('0 / 6',this.lives,'00:00');
        }
        drawPlatformCity(){
          var g=this.add.graphics().setDepth(-10);g.fillGradientStyle(0xdce8e4,0xdce8e4,0xf2e7d4,0xece2d2,1);g.fillRect(0,0,this.worldWidth,620);
          g.fillStyle(0xe9b65f,.35);g.fillCircle(1540,102,47);g.fillStyle(0xf6f1e7,.8);[[170,90,126,28],[560,138,160,32],[1020,86,148,29],[1760,130,180,34]].forEach(function(c){g.fillEllipse(c[0],c[1],c[2],c[3]);});
          // Distant roofline and a side-view market street that scrolls with the runner.
          for(var i=0;i<19;i++){var x=i*116-18,w=78+(i%3)*15,h=118+(i%5)*24,wall=[0xcbd5cf,0xd7c7ae,0xb9c8c0,0xc9b69f][i%4],top=405-h;polygon(g,[[x,top],[x+w,top],[x+w,512],[x,512]],wall,0x9ca69f,.8);polygon(g,[[x-4,top],[x+w/2,top-20],[x+w+4,top]],i%2?0x748aa3:0x99a499,0x9ca69f,.8);for(var r=0;r<3;r++)for(var c=0;c<2;c++){var wx=x+12+c*34,wy=top+20+r*34;g.fillStyle((i+c+r)%5===0?0xe9b65f:0x748aa3,.68);g.fillRect(wx,wy,19,23);g.lineStyle(.8,INK,.5);g.strokeRect(wx,wy,19,23);strokeLine(g,wx+9,wy,wx+9,wy+23,INK,.55,.6);}}
          // Larger foreground façades: awnings, cornices, doors and windows clarify the roof route.
          [[0,300,372,0xd6c4aa],[300,270,310,0xb9c8c0],[570,300,355,0xd8c7ae],[870,280,300,0xc8d2cc],[1150,315,352,0xd2bea2],[1465,260,300,0xb9c8c0],[1725,340,360,0xd8c7ae]].forEach(function(b){var x=b[0],w=b[1],t=b[2],col=b[3];polygon(g,[[x,t],[x+w,t],[x+w,520],[x,520]],col,INK,1.05);polygon(g,[[x-6,t],[x+w/2,t-18],[x+w+6,t]],0x748aa3,INK,1);for(var row=0;row<3;row++)for(var colN=0;colN<Math.floor(w/72);colN++){var wx=x+18+colN*67,wy=t+23+row*47;if(wy<493){g.fillStyle((row+colN)%3===0?0xe9b65f:0xe8eee8,.88);g.fillRect(wx,wy,31,35);g.lineStyle(1,INK,.8);g.strokeRect(wx,wy,31,35);strokeLine(g,wx+15,wy,wx+15,wy+35,INK,.7);g.fillStyle(0x748aa3,.7);g.fillRect(wx-4,wy+32,39,5);}}});
          for(var aw=0;aw<5;aw++){var ax=760+aw*45;polygon(g,[[ax,418],[ax+38,418],[ax+34,431],[ax+4,431]],aw%2?0xc27d64:0x748aa3,INK,.8);}
          g.fillStyle(0xc8bda9,1);g.fillRect(0,520,this.worldWidth,100);for(var p=0;p<24;p++)strokeLine(g,p*92,525,p*92+48,574,0x8a8c83,1,.35);g.destroy();
        }
        addRoutePlatform(x,y,width){var ledge=this.platforms.create(x,y,'relay-ledge').setDisplaySize(width,26).setDepth(7).refreshBody();ledge.body.setSize(width,26,true);}
        drawRelayShop(){var g=this.add.graphics().setDepth(12);polygon(g,[[1938,432],[2042,432],[2042,498],[1938,498]],0xb67b53,INK,1.7);polygon(g,[[1928,432],[1990,395],[2052,432]],0x748aa3,INK,1.5);g.fillStyle(0xe9b65f,1);g.fillRect(1945,438,90,13);g.lineStyle(1.2,INK,1);g.strokeRect(1945,438,90,13);g.fillStyle(0xf5f0e6,1);g.fillRect(1950,458,33,40);g.lineStyle(1.2,INK,1);g.strokeRect(1950,458,33,40);g.fillStyle(0x748aa3,1);g.fillRect(1993,458,36,40);g.lineStyle(1.2,INK,1);g.strokeRect(1993,458,36,40);g.fillStyle(0xe9b65f,1);g.fillCircle(2022,478,2);g.destroy();this.add.text(1990,441,'ROAST & ROOFTOP',{fontFamily:'Arial',fontSize:'7px',color:'#303834',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(13);this.add.text(1990,380,'THE LAST STOP',{fontFamily:'Arial',fontSize:'8px',color:'#4c554e',fontStyle:'bold',letterSpacing:1.5}).setOrigin(.5).setDepth(13);}
        collectRelayParcel(player,item){if(!item.active)return;item.destroy();this.parcels++;setStats(this.parcels+' / 6',this.lives,this.formatTime());var note=this.add.text(player.x,player.y-50,'PARCEL SECURED',{fontFamily:'Arial',fontSize:'9px',color:'#655231',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(40);this.tweens.add({targets:note,y:note.y-22,alpha:0,duration:600,onComplete:()=>note.destroy()});if(this.parcels===6)this.add.text(940,32,'ALL SIX ON BOARD · FIND THE ROAST SHOP',{fontFamily:'Arial',fontSize:'10px',color:'#526855',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(31).setScrollFactor(0);}
        finishRelay(){if(this.parcels<6){this.clock.setText('THE SHOP NEEDS ALL SIX PARCELS · '+this.parcels+'/6');return;}reportResult(true,'Every parcel made it.','The rooftop route is complete. Share the reward code with your order.');this.physics.pause();}
        action(){if(this.player&&this.player.body.blocked.down)this.player.setVelocityY(-525);}
        update(time,delta){if(!this.player||this.physics.world.isPaused)return;this.elapsed+=delta;var left=this.cursors.left.isDown||this.keys.A.isDown||touch.left,right=this.cursors.right.isDown||this.keys.D.isDown||touch.right;this.player.setVelocityX(left?-255:(right?255:0));if(left)this.player.setFlipX(true);if(right)this.player.setFlipX(false);if((Phaser.Input.Keyboard.JustDown(this.cursors.up)||Phaser.Input.Keyboard.JustDown(this.cursors.space)||Phaser.Input.Keyboard.JustDown(this.keys.W)||Phaser.Input.Keyboard.JustDown(this.keys.SPACE))&&this.player.body.blocked.down)this.action();if(this.player.x>1030)this.checkpointX=1080;if(this.player.y>640){this.lives--;this.player.setPosition(this.checkpointX,this.checkpointX>100?220:430);this.player.setVelocity(0,0);setStats(this.parcels+' / 6',this.lives,this.formatTime());if(this.lives<=0){reportResult(false,'The courier missed the next roof.','Take a clean run-up, jump the gaps and keep the parcels together.');this.physics.pause();}}if(Math.floor(this.elapsed/1000)!==Math.floor((this.elapsed-delta)/1000))setStats(this.parcels+' / 6',this.lives,this.formatTime());}
        formatTime(){var seconds=Math.floor(this.elapsed/1000);return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
      };
    }

    if (type.indexOf('laundry-') === 0) {
      return class LaundryScene extends Phaser.Scene {
        constructor(){super({key:'MiniGameScene'});this.configArt=laundryConfig[type];this.isBayWindows=type==='laundry-bay-windows'||type==='laundry-bay-windows-34';this.isBayWindows34=type==='laundry-bay-windows-34';this.score=0;this.misses=0;this.elapsed=0;this.reachUntil=0;this.reachCooldown=0;this.activeClothes=null;this.activePeck=null;this.dropAt=0;this.nextRestock=0;this.groundY=this.isBayWindows?865:420;this.jumpVelocity=0;this.mouseNextAt=0;this.mouseCrossed=false;this.catQueued=false;this.garmentHistory=[];this.lineSlots=this.isBayWindows?[330,390,450,510,570,630]:[340,385,430,525,570,615];}
        preload(){}
        create(){
          this.physics.world.setBounds(0,0,960,this.isBayWindows?960:540);this.physics.world.gravity.y=0;
          this.drawCourtyard();
          if(this.isBayWindows34){this.createBrandAirship();var brandPennant=this.add.graphics().setDepth(12);strokeLine(brandPennant,162,257,162,321,INK,2);strokeLine(brandPennant,150,264,162,264,INK,1.5);this.drawBrandFlag(brandPennant,162,286);this.drawRightShopSign();}
          this.createClothingTextures();
          makeTexture(this,'laundry-catcher',76,122,function(g){laundryHeroTexture(g,false);});
          makeTexture(this,'laundry-catcher-reach',76,122,function(g){laundryHeroTexture(g,true);});
          if(this.isBayWindows)this.createMouseTextures();
          this.player=this.physics.add.sprite(480,this.groundY,'laundry-catcher').setScale(this.isBayWindows34?1.3:1).setDepth(30).setBodySize(38,92).setOffset(19,17).setCollideWorldBounds(true);
          this.player.body.allowGravity=false;this.player.body.setImmovable(true);
          if(this.isBayWindows){this.frontLampX=826;this.frontLamp=this.drawForegroundLamp();}
          if(this.isBayWindows34)this.createLampFlicker();
          if(this.isBayWindows34){this.bindBay34Keyboard();}
          else this.keys=this.input.keyboard.addKeys('A,D,LEFT,RIGHT,SPACE,W,UP,E');
          this.clothes=this.physics.add.group({allowGravity:false});
          this.physics.add.overlap(this.player,this.clothes,this.catchGarment,null,this);
          this.ropeBirds=this.drawBirds();
          if(this.isBayWindows){
            this.mouse=this.physics.add.image(-100,this.groundY+39,'laundry-mouse').setDepth(27).setVisible(false).setActive(false);
            this.mouse.body.allowGravity=false;this.mouse.body.setSize(48,23).setOffset(11,15);this.mouse.body.enable=false;
            this.mouseNextAt=this.time.now+3100;
            if(this.isBayWindows34){
              this.createCatTextures();
              this.cat=this.physics.add.image(-120,this.groundY+38,'laundry-cat').setDepth(28).setVisible(false).setActive(false);
              this.cat.body.allowGravity=false;this.cat.body.setSize(68,28).setOffset(14,24);this.cat.body.enable=false;
              this.catStartAt=0;this.catDirection=1;this.catQueued=false;this.catCrossed=false;
            }
          }
          this.lineSlots.forEach((slot)=>this.spawnHangingGarment(slot));
          this.dropAt=this.time.now+1150;
          this.nextRestock=this.time.now+700;
          this.reachMark=this.add.graphics().setDepth(31);
          this.catcherLabel=this.add.text(480,this.groundY-75,'',{fontFamily:'Arial',fontSize:'10px',color:'#fff9e9',fontStyle:'bold',stroke:'#454b48',strokeThickness:3}).setOrigin(.5).setDepth(35);
          if(!this.isBayWindows){
            this.brandPulse=this.add.text(480,244,'NORTHSTAR ATELIER',{fontFamily:'Arial',fontSize:'9px',color:'#3f4a46',fontStyle:'bold',letterSpacing:2}).setOrigin(.5).setDepth(9);
            this.tweens.add({targets:this.brandPulse,alpha:.6,duration:1300,yoyo:true,repeat:-1});
          }
          // The scene update loop already advances elapsed time and refreshes the
          // HUD once per second. Keep the legacy timer for game 33 only; running
          // a second clock here made game 34's timer drift and complicated stalls.
          if(!this.isBayWindows34)this.clock=this.time.addEvent({delay:1000,loop:true,callback:()=>{this.elapsed++;setStats(this.score+' / 10',this.misses+' / 5',this.formatTime());}});
          setStats('0 / 10','0 / 5','00:00');
        }
        drawCourtyard(){
          var c=this.configArt,g=this.add.graphics().setDepth(0);
          if(c.architecture){
            if(this.isBayWindows){
              // The street is an HTML background on .pgx-stage, underneath this
              // transparent Phaser canvas. This keeps it independent of Phaser's loader.
              g.destroy();
            }
            else if(c.windowStudy)this.drawWindowStudy(g,c);
            else if(c.cleanStreet)this.drawCleanStreet(g,c);
            else if(c.sketch)this.drawSketchStreet(g,c);
            else this.drawFrenchPerspective(g,c);
            if(!this.isBayWindows){
              this.add.text(22,18,c.tagline,{fontFamily:'Arial',fontSize:'8px',color:'#4e5953',fontStyle:'bold',letterSpacing:1.8}).setDepth(8);
              this.add.text(480,476,'CATCH 10 · DON’T LET THE LAUNDRY HIT THE STREET',{fontFamily:'Arial',fontSize:'8px',color:'#434b46',fontStyle:'bold',letterSpacing:1.2}).setOrigin(.5).setDepth(8);
            }
            return;
          }
          g.fillGradientStyle(c.sky,c.sky,0xf0ebe0,0xe9e2d6,1);g.fillRect(0,0,960,540);
          // Receding lane and the far end of the courtyard.
          polygon(g,[[0,265],[960,270],[960,540],[0,540]],c.street,false,0);
          polygon(g,[[300,220],[660,220],[960,540],[0,540]],c.street,INK,1.3);
          polygon(g,[[0,0],[274,0],[414,225],[414,424],[0,430]],c.left,INK,1.8);
          polygon(g,[[686,0],[960,0],[960,435],[546,424],[546,222]],c.right,INK,1.8);
          polygon(g,[[274,0],[686,0],[546,222],[414,225]],c.far,INK,1.6);
          // Tall shuttered windows, individually outlined so the perspective reads as a real narrow lane.
          for(var row=0;row<2;row++)for(var col=0;col<2;col++){
            var lx=45+col*112-row*13,ly=55+row*112;
            this.drawWindow(g,lx,ly,62,77,c.awning);
            var rx=755+col*104+row*10,ry=58+row*116;
            this.drawWindow(g,rx,ry,62,76,c.awning);
          }
          for(var far=0;far<5;far++){
            var fx=368+far*47,fy=69+(far%2)*10;
            this.drawWindow(g,fx,fy,36,53,c.awning);
          }
          this.drawBalcony(g,156,153,142,52);
          this.drawBalcony(g,674,170,148,54);
          // Clothes line with a slight perspective sag and two working pulleys.
          strokeLine(g,285,164,676,177,INK,2.4);
          strokeLine(g,285,162,676,175,0xf9f4e8,1,.82);
          g.fillStyle(INK,1);g.fillCircle(285,164,4);g.fillCircle(676,177,4);
          // A branded flag hangs from an upper balcony; a second small bunting detail leads to the shop.
          this.drawBrandFlag(g,220,188);
          // Far storefront and awning.
          polygon(g,[[390,288],[570,288],[570,440],[390,440]],0xeee8da,INK,1.8);
          polygon(g,[[380,288],[480,254],[580,288]],c.awning,INK,1.7);
          for(var aw=0;aw<8;aw++){var ax=389+aw*23;polygon(g,[[ax,288],[ax+22,288],[ax+20,307],[ax+2,307]],aw%2?0xf6ead7:c.awning,INK,0.8);}
          g.fillStyle(0x34403b,1);g.fillRect(410,318,143,28);g.lineStyle(1.6,INK,1);g.strokeRect(410,318,143,28);
          this.add.text(481,332,'NORTHSTAR · ATELIER',{fontFamily:'Arial',fontSize:'8px',color:'#f8f1df',fontStyle:'bold',letterSpacing:1.1}).setOrigin(.5).setDepth(5);
          g.fillStyle(0x748aa3,1);g.fillRect(421,355,46,81);g.fillStyle(0xc2d1d0,1);g.fillRect(478,355,72,81);g.lineStyle(1.4,INK,1);g.strokeRect(421,355,46,81);g.strokeRect(478,355,72,81);
          // Branded garments in the window, with simple drawn hangers.
          for(var shirt=0;shirt<3;shirt++){var sx=490+shirt*18;strokeLine(g,sx,365,sx,371,INK,1);polygon(g,[[sx-5,372],[sx,369],[sx+5,372],[sx+3,384],[sx-3,384]],shirt===0?0xe9b65f:(shirt===1?0x99a499:0xc27d64),INK,.9);}
          // Perspective cobbles; row spacing expands toward the viewer.
          for(var r=0;r<6;r++){
            var yy=287+r*r*6;
            for(var stone=0;stone<10;stone++){
              var xx=25+stone*104+(r%2)*48;
              if(xx<960) {g.lineStyle(1,0x777c76,.38);g.strokeEllipse(xx,yy,30+r*2,7+r*.35);}
            }
          }
          this.drawBicycle(g,type==='laundry-roman'?290:225,435,type==='laundry-dusk'?0x748aa3:0x545555);
          this.drawFicus(g,type==='laundry-roman'?775:790,436,type==='laundry-dusk'?0x99a499:0x70846d);
          // Fine colored-pencil hatch strokes add hand-drawn paper texture without obscuring the scene.
          for(var h=0;h<26;h++){
            var hx=20+(h*73)%910,hy=22+(h*47)%210;
            strokeLine(g,hx,hy,hx+10,hy-3,0xf8f1e3,.65,.42);
          }
          g.destroy();
          this.add.text(22,18,c.tagline,{fontFamily:'Arial',fontSize:'8px',color:'#4e5953',fontStyle:'bold',letterSpacing:1.8}).setDepth(8);
          this.add.text(480,476,'CATCH 10 · DON’T LET THE LAUNDRY HIT THE STREET',{fontFamily:'Arial',fontSize:'8px',color:type==='laundry-dusk'?'#f6e8c9':'#434b46',fontStyle:'bold',letterSpacing:1.2}).setOrigin(.5).setDepth(8);
        }
        drawBayWindowsStreet(g,c){
          var wash=function(points,color,alpha){g.fillStyle(color,alpha);g.beginPath();g.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.closePath();g.fillPath();};
          g.fillGradientStyle(0xd8d4cc,0xe8ddd0,0xe5d9c6,0xd8d1c5,1);g.fillRect(0,0,960,540);
          // Soft paper washes and an old-town roofline create the colored-pencil / watercolor ground.
          [[140,93,310,180,0xe9d4b8,.27],[810,114,300,185,0xd6c1bb,.25],[479,112,300,150,0xf1ece1,.42],[492,430,490,175,0xd6c8ae,.24]].forEach(function(p){g.fillStyle(p[4],p[5]);g.fillEllipse(p[0],p[1],p[2],p[3]);});
          for(var paper=0;paper<48;paper++){var px=(paper*173+37)%960,py=(paper*97+29)%540;g.fillStyle(paper%3===0?0xcab99e:0xf6eee0,paper%3===0?.035:.08);g.fillEllipse(px,py,18+(paper%5)*8,7+(paper%4)*4);}
          // Street and paving recede to one warm vanishing point; paired rails echo the reference drawing.
          wash([[0,258],[960,258],[960,540],[0,540]],0xb8ad9c,1);
          wash([[432,236],[526,236],[960,540],[0,540]],0xd1c7b7,.95);
          wash([[445,245],[513,245],[755,540],[220,540]],0xe7ddcb,.58);
          [0,1].forEach(function(track){var nearL=272+track*32,nearR=688-track*32,farL=472+track*12,farR=488-track*12;strokeLine(g,farL,246,nearL,540,0x615e58,track?1.3:2.1,.64);strokeLine(g,farR,246,nearR,540,0x615e58,track?1.3:2.1,.64);});
          for(var row=0;row<12;row++){
            var y=272+row*25,half=18+row*30;
            strokeLine(g,480-half,y,480+half,y+2,0x736d64,.8,.34);
            for(var stone=0;stone<8;stone++){var t=(stone-3.5)/4,xx=480+t*(34+row*44)+(row%2)*14;if(xx>12&&xx<948)g.strokeEllipse(xx,y+11,20+row*2.5,6+row*.45);}
          }
          // Distant façades sit behind the nearer apartment walls and close the perspective cleanly.
          polygon(g,[[338,109],[427,95],[458,234],[376,248]],0xbcae9b,INK,.8);polygon(g,[[622,109],[533,95],[502,234],[584,248]],0xc2b4a8,INK,.8);
          polygon(g,[[347,105],[430,90],[422,108],[355,121]],0x8b7667,INK,.8);polygon(g,[[613,105],[530,90],[538,108],[605,121]],0x8b7667,INK,.8);
          for(var farWin=0;farWin<3;farWin++){var fwx=376+farWin*23;this.drawFrenchWindow(g,fwx,145,15,25,c,1);this.drawFrenchWindow(g,569-farWin*23,145,15,25,c,-1);}
          // Left and right façades are individually paneled, with irregular roof edges and hand-inked seams.
          polygon(g,[[0,0],[207,0],[391,225],[344,362],[0,421]],0xd0b99a,0x514d47,1.55);
          polygon(g,[[0,0],[43,0],[186,214],[150,390],[0,421]],0xe5d2b5,null,0);wash([[13,25],[74,20],[212,224],[159,335],[0,371]],0xf0dfc4,.32);
          polygon(g,[[960,0],[753,0],[569,225],[616,362],[960,421]],0xcdb9b5,0x514d47,1.55);
          polygon(g,[[960,0],[914,0],[774,212],[811,386],[960,421]],0xe1cec6,null,0);wash([[950,35],[892,25],[748,229],[796,340],[960,374]],0xe9d4ca,.3);
          // Sloping cornices, stone courses and a few pencil hatches give each wall depth without clutter.
          [[0,64,224,246],[0,141,289,291],[0,218,351,334],[0,302,378,362]].forEach(function(v){strokeLine(g,v[0],v[1],v[2],v[3],0x766b5e,1,.43);});
          [[960,64,736,246],[960,141,671,291],[960,218,609,334],[960,302,582,362]].forEach(function(v){strokeLine(g,v[0],v[1],v[2],v[3],0x766b5e,1,.43);});
          for(var h=0;h<22;h++){var hx=(h*41)%365,hy=73+(h*53)%260;strokeLine(g,hx,hy,hx+9,hy+3,0x8c7865,.65,.36);strokeLine(g,960-hx,hy+8,951-hx,hy+11,0x8c7865,.65,.32);}
          // Shuttered windows step down in size as they approach the vanishing point.
          [[20,42,52,91],[81,101,57,88],[150,150,49,76],[224,187,40,61],[292,211,30,45],[348,226,22,34]].forEach((w,i)=>{this.drawFrenchWindow(g,w[0],w[1],w[2],w[3],c,1);if(i<3)this.drawFrenchBalcony(g,w[0]-8,w[1]+w[3]-2,w[2]+16,13,c);});
          [[888,44,52,90],[822,102,57,88],[751,151,49,76],[686,188,40,61],[636,212,30,45],[590,226,22,34]].forEach((w,i)=>{this.drawFrenchWindow(g,w[0],w[1],w[2],w[3],c,-1);if(i<3)this.drawFrenchBalcony(g,w[0]-8,w[1]+w[3]-2,w[2]+16,13,c);});
          // Ground-floor doors, a small rue sign, lamps and an old shop awning anchor the street.
          this.drawStreetDoor(g,48,303,59,111,0xd0b99a,0x8096a1);this.drawStreetDoor(g,851,306,63,111,0xcdb9b5,0x87979a);
          polygon(g,[[115,294],[153,294],[157,345],[112,345]],0xb48d70,INK,1);g.fillStyle(0xf0dfc4,1);g.fillRect(121,301,27,7);g.lineStyle(.8,INK,.8);g.strokeRect(121,301,27,7);this.add.text(135,303,'ATELIER',{fontFamily:'Georgia',fontSize:'5px',color:'#514d47',fontStyle:'bold',letterSpacing:.7}).setOrigin(.5).setDepth(4);
          [179,770].forEach((lx,index)=>{var top=index?210:209;strokeLine(g,lx,top,lx,top+109,0x41403c,3);strokeLine(g,lx-6,top+108,lx+7,top+108,0x41403c,2);polygon(g,[[lx-8,top],[lx+8,top],[lx+11,top+21],[lx-11,top+21]],0x545555,INK,1);g.fillStyle(0xe9b65f,.75);g.fillEllipse(lx,top+13,9,12);strokeLine(g,lx-11,top+23,lx+11,top+23,0x545555,1.2);});
          // A narrow clock tower recalls the hand-painted landmark in the reference image.
          polygon(g,[[401,343],[463,343],[459,209],[405,209]],0xbba98d,INK,1.25);polygon(g,[[397,211],[432,165],[468,211]],0x74675b,INK,1.2);polygon(g,[[411,221],[452,221],[450,265],[413,265]],0x8e9aa0,INK,.9);g.fillStyle(0xe7d9bf,1);g.fillCircle(432,286,16);g.lineStyle(1.4,INK,1);g.strokeCircle(432,286,16);strokeLine(g,432,286,432,275,INK,1.1);strokeLine(g,432,286,440,290,INK,1.1);g.fillStyle(0x74675b,1);g.fillRect(419,314,27,29);g.lineStyle(1,INK,1);g.strokeRect(419,314,27,29);for(var mark=0;mark<3;mark++)strokeLine(g,423+mark*8,320,423+mark*8,339,0xe9ddc9,.65,.75);
          // A small right-side awning and branded window tie the setting back to the clothing game.
          polygon(g,[[733,337],[823,337],[823,353],[733,353]],0x748aa3,INK,.8);for(var aw=0;aw<6;aw++){var ax=735+aw*15;polygon(g,[[ax,353],[ax+14,353],[ax+12,367],[ax+2,367]],aw%2?0xf1e6d4:0x748aa3,INK,.6);}g.fillStyle(0x554940,1);g.fillRect(745,369,67,46);g.lineStyle(1,INK,1);g.strokeRect(745,369,67,46);this.add.text(778,342,'NORTHSTAR',{fontFamily:'Georgia',fontSize:'6px',color:'#fff5e4',fontStyle:'bold',letterSpacing:.8}).setOrigin(.5).setDepth(5);
          this.drawBrandFlag(g,222,195);
          // A painted bicycle and planter sit on the near paving, kept clear of the playable center lane.
          this.drawBicycle(g,118,470,0x545555);this.drawFicus(g,837,470,0x99a499);
          // Fine broken hatches and translucent warm glazes suggest colored pencil on paper.
          for(var grain=0;grain<42;grain++){var gx=(grain*137+23)%960,gy=260+(grain*47)%270;strokeLine(g,gx,gy,gx+8,gy-2,grain%3===0?0x748aa3:0x9b7d61,.65,.25);}
          wash([[400,242],[560,242],[699,539],[260,539]],0xe9b65f,.055);g.destroy();
        }
        drawWindowStudy(g,c){
          var a=c.architecture,vx=a==='corner-cast'?555:480;
          var wash=function(points,color,alpha){g.fillStyle(color,alpha);g.beginPath();g.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.closePath();g.fillPath();};
          g.fillGradientStyle(c.sky,c.sky,0xf2eee4,c.street,1);g.fillRect(0,0,960,540);
          // A quiet one-point street keeps the façade geometry, not guide lines, in charge of perspective.
          g.fillStyle(c.street,1);g.fillRect(0,222,960,318);polygon(g,[[vx-83,218],[vx+83,218],[943,540],[17,540]],0xd0c7b7,INK,1.05);
          wash([[vx-44,231],[vx+45,231],[vx+130,540],[vx-130,540]],c.far,.15);
          var leftWall,rightWall,roofL,roofR;
          if(a==='corner-cast'){
            leftWall=[[0,0],[365,0],[456,214],[410,383],[0,414]];rightWall=[[790,0],[960,0],[960,345],[599,330],[555,214]];roofL=[[0,0],[365,0],[341,22],[0,38]];roofR=[[790,0],[960,0],[960,38],[805,22]];
          }else if(a==='arcade-depth'){
            leftWall=[[0,0],[300,0],[431,218],[394,382],[0,402]];rightWall=[[660,0],[960,0],[960,402],[566,382],[529,218]];roofL=[[0,0],[300,0],[322,18],[0,28]];roofR=[[660,0],[960,0],[960,28],[638,18]];
          }else{
            leftWall=[[0,0],[292,0],[430,218],[392,382],[0,402]];rightWall=[[668,0],[960,0],[960,402],[568,382],[530,218]];roofL=[[0,0],[292,0],[314,18],[0,28]];roofR=[[668,0],[960,0],[960,28],[646,18]];
          }
          polygon(g,leftWall,c.left,INK,1.45);polygon(g,rightWall,c.right,INK,1.45);
          // Cornices and floor bands converge with each wall plane to make the depth legible.
          polygon(g,roofL,0x817b70,INK,1.05);polygon(g,roofR,0x817b70,INK,1.05);
          [82,151,217,278,335].forEach(function(y){var t=(y-18)/200;strokeLine(g,0,y,430+((a==='corner-cast')?22:0)*t,Math.min(380,y+6),0x746e63,.9,.52);strokeLine(g,960,y,530-((a==='corner-cast')?22:0)*t,Math.min(380,y+6),0x746e63,.9,.52);});
          // Windows visibly change size and spacing as they recede toward the vanishing point.
          if(a==='corner-cast'){
            this.drawFrenchWindow(g,22,54,128,154,c,1);this.drawFrenchBalcony(g,12,207,147,25,c);
            [[184,34,92,113],[300,74,64,79],[370,111,43,54]].forEach((p,i)=>{this.drawFrenchWindow(g,p[0],p[1],p[2],p[3],c,1);if(i<2)this.drawFrenchBalcony(g,p[0]-6,p[1]+p[3]-3,p[2]+12,15,c);});
            [[828,48,72,91],[739,84,54,67],[673,117,40,50]].forEach((p)=>this.drawFrenchWindow(g,p[0],p[1],p[2],p[3],c,-1));
            // Projecting corner oriel: three glass planes, a cornice and a stone sill.
            this.drawOriel(g,165,225,116,93,c,1);this.drawOriel(g,765,219,70,63,c,-1);
          }else if(a==='twin-courts'){
            for(var floor=0;floor<3;floor++)for(var col=0;col<3;col++){
              var u=col/3,scale=1-u*.43-floor*.035,lx=20+col*103+floor*8,rx=940-col*103-floor*8-54*scale,yy=25+col*27+floor*70,w=54*scale,h=66*scale;
              this.drawFrenchWindow(g,lx,yy,w,h,c,1);this.drawFrenchWindow(g,rx,yy+4,w,h,c,-1);
              if(floor>0||col===0){this.drawFrenchBalcony(g,lx-5,yy+h-3,w+10,13*scale,c);this.drawFrenchBalcony(g,rx-5,yy+h-3,w+10,13*scale,c);}
            }
            // A clear end building closes the courtyard at the same central sightline.
            polygon(g,[[408,112],[552,112],[565,235],[395,235]],c.far,INK,1.1);for(var fw=0;fw<3;fw++){var fx=424+fw*48;this.drawFrenchWindow(g,fx,135,30,42,c,fw===0?1:-1);}
          }else if(a==='arcade-depth'){
            // Repeated arched openings make this feel like a covered street rather than another window grid.
            for(var side=0;side<2;side++)for(var bay=0;bay<4;bay++){
              var scale=1-bay*.17,x=side?938-bay*77-62*scale:18+bay*77,y=54+bay*23,w=62*scale,h=116*scale;
              this.drawArchedWindow(g,x,y,w,h,c,side?-1:1);
              if(bay<3){var base=y+h+3;strokeLine(g,x-4,base,x+w+4,base,0xd8c9b1,2,.9);strokeLine(g,x-2,base-13,x+w+2,base-13,INK,1.1,.8);}
            }
            for(var pier=0;pier<5;pier++){var lx=8+pier*85,rx=952-pier*85;strokeLine(g,lx,194+Math.min(pier*19,55),lx+25,370,0xe7dbc8,5,.95);strokeLine(g,rx,194+Math.min(pier*19,55),rx-25,370,0xe7dbc8,5,.95);}
            polygon(g,[[0,373],[398,356],[428,222],[0,0]],0xc6b79f,null,0);polygon(g,[[960,0],[660,0],[532,222],[565,356],[960,373]],0xb4c3bd,null,0);
          }else if(a==='stairwell-lane'){
            for(var row=0;row<3;row++)for(var col=0;col<3;col++){
              var scale=1-col*.16-row*.025,x=18+col*86+row*10,y=28+col*28+row*80,w=52*scale,h=67*scale;
              this.drawFrenchWindow(g,x,y,w,h,c,1);var rx=940-col*86-row*10-w;this.drawFrenchWindow(g,rx,y+6,w,h,c,-1);
            }
            // Switchback exterior stair and landings are drawn as solid, walkable-looking geometry.
            for(var tier=0;tier<3;tier++){
              var sx=40+tier*91,sy=344-tier*81,sw=118-tier*19;
              polygon(g,[[sx,sy],[sx+sw,sy],[sx+sw+14,sy+8],[sx+8,sy+8]],0xd7c8af,INK,1);
              strokeLine(g,sx+3,sy-22,sx+sw-4,sy-22,INK,1.25,.9);strokeLine(g,sx+5,sy-22,sx+5,sy,INK,1.1);strokeLine(g,sx+sw-5,sy-22,sx+sw-5,sy,INK,1.1);
              for(var step=0;step<6;step++){var xx=sx+sw-5-step*12,yy=sy-22-step*12;strokeLine(g,xx,yy,xx+13,yy,0x545555,1.6);strokeLine(g,xx+13,yy,xx+13,yy+12,0x545555,1.2);}
            }
            this.drawStreetDoor(g,714,242,68,123,c.right,c.awning);this.drawStreetDoor(g,166,268,58,106,c.left,c.awning);
          }else if(a==='bay-windows'){
            for(var bayIndex=0;bayIndex<3;bayIndex++){
              var scale=1-bayIndex*.26,lx=26+bayIndex*116,ly=58+bayIndex*31,bw=93*scale,bh=99*scale,rx=934-bayIndex*116-bw;
              this.drawOriel(g,lx,ly,bw,bh,c,1);this.drawOriel(g,rx,ly+5,bw,bh,c,-1);
              if(bayIndex<2){this.drawFrenchWindow(g,lx+7,ly-bh-28,bw*.76,bh*.72,c,1);this.drawFrenchWindow(g,rx+7,ly-bh-23,bw*.76,bh*.72,c,-1);}
            }
            // Mansard roofline and dormers distinguish the upper silhouette.
            polygon(g,[[0,0],[292,0],[315,18],[0,39]],0x777c78,INK,1);polygon(g,[[668,0],[960,0],[960,39],[645,18]],0x777c78,INK,1);
            for(var d=0;d<4;d++){var dx=20+d*68;polygon(g,[[dx,31],[dx+16,8],[dx+32,31]],0xd9cbb6,INK,.8);g.fillStyle(c.awning,1);g.fillRect(dx+9,29,14,16);g.lineStyle(.7,INK,.8);g.strokeRect(dx+9,29,14,16);var rx=940-d*68;polygon(g,[[rx-32,31],[rx-16,8],[rx,31]],0xd9cbb6,INK,.8);g.fillStyle(c.awning,1);g.fillRect(rx-23,29,14,16);g.lineStyle(.7,INK,.8);g.strokeRect(rx-23,29,14,16);}
          }
          // Small far storefront, scaled down but still framed by the receding architecture.
          polygon(g,[[411,175],[549,175],[560,237],[400,237]],c.far,INK,1);polygon(g,[[423,191],[537,191],[543,207],[417,207]],c.awning,INK,.9);g.fillStyle(0x545555,1);g.fillRect(431,209,98,27);g.lineStyle(1,INK,1);g.strokeRect(431,209,98,27);this.add.text(480,222,'RUE · 08',{fontFamily:'Arial',fontSize:'7px',color:'#f7f1e7',fontStyle:'bold',letterSpacing:1.2}).setOrigin(.5).setDepth(5);
          if(a==='corner-cast'||a==='stairwell-lane')this.drawBrandFlag(g,206,183);
          this.drawBicycle(g,a==='stairwell-lane'?118:840,464,c.awning);this.drawFicus(g,a==='corner-cast'?840:115,466,0x99a499);
          // Restrained painted light patches remain behind the player and clothes.
          wash([[vx-62,245],[vx+59,245],[vx+162,520],[vx-150,520]],c.lamp,.055);g.destroy();
        }
        drawOriel(g,x,y,w,h,c,side){
          // A projecting bay has a front pane and two foreshortened side panes.
          var depth=Math.max(7,w*.13),sign=side>0?1:-1,frontX=x+(sign<0?depth:0),frontW=w-depth;
          polygon(g,[[x,y+5],[x+w,y+5],[frontX+frontW,y+h-7],[frontX,y+h-7]],0xe5dac6,INK,1);
          polygon(g,[[x,y+5],[frontX,y+h-7],[frontX,y+h],[x-2,y+12]],side>0?c.left:c.right,INK,.8);
          polygon(g,[[frontX+frontW,y+5],[x+w,y+7],[x+w+2,y+15],[frontX+frontW,y+h]],side>0?c.right:c.left,INK,.8);
          g.fillStyle(c.awning,1);g.fillRect(frontX,y+11,frontW,h-22);g.lineStyle(1.1,INK,1);g.strokeRect(frontX,y+11,frontW,h-22);g.fillStyle(0xdce7e5,1);g.fillRect(frontX+5,y+16,Math.max(4,frontW-10),h-33);g.lineStyle(.75,INK,.85);g.strokeRect(frontX+5,y+16,Math.max(4,frontW-10),h-33);strokeLine(g,frontX+frontW/2,y+16,frontX+frontW/2,y+h-18,INK,.9,.9);strokeLine(g,frontX+3,y+h*.56,frontX+frontW-3,y+h*.56,INK,.8,.8);
          polygon(g,[[x-5,y+2],[x+w+5,y+2],[frontX+frontW+5,y+11],[frontX-4,y+11]],0xeee3d0,INK,1);polygon(g,[[x-8,y+h-5],[x+w+8,y+h-5],[frontX+frontW+10,y+h+7],[frontX-10,y+h+7]],0xd1c3ad,INK,1);
        }
        drawArchedWindow(g,x,y,w,h,c,side){
          var arch=Math.min(w*.42,h*.28),points=[[x-4,y+h],[x-4,y+arch],[x+w*.18,y+3],[x+w*.5,y-4],[x+w*.82,y+3],[x+w+4,y+arch],[x+w+4,y+h]];
          polygon(g,points,0xe6dac5,INK,1);var inset=[[x+3,y+h-4],[x+3,y+arch],[x+w*.2,y+8],[x+w*.5,y+3],[x+w*.8,y+8],[x+w-3,y+arch],[x+w-3,y+h-4]];polygon(g,inset,c.awning,INK,.9);
          polygon(g,[[x+8,y+h-7],[x+8,y+arch+5],[x+w*.5,y+10],[x+w-8,y+arch+5],[x+w-8,y+h-7]],0xdbe6e3,INK,.65);strokeLine(g,x+w*.5,y+8,x+w*.5,y+h-7,INK,.85,.9);strokeLine(g,x+9,y+h*.57,x+w-9,y+h*.57,INK,.75,.8);
          if(w>35){g.fillStyle(side>0?c.left:c.right,.85);g.fillRect(x-6,y+arch+5,4,h-arch-7);g.fillRect(x+w+2,y+arch+5,4,h-arch-7);}
          polygon(g,[[x-7,y+h],[x+w+7,y+h],[x+w+10,y+h+5],[x-10,y+h+5]],0xd6c9b3,INK,.75);
        }
        drawFrenchPerspective(g,c){
          g.fillGradientStyle(c.sky,c.sky,0xf5efe2,0xe4ddd0,1);g.fillRect(0,0,960,540);
          // A one-point view down a real street, with both apartment rows converging behind the shop.
          polygon(g,[[0,218],[960,218],[960,540],[0,540]],c.street,false,0);
          polygon(g,[[392,218],[568,218],[960,540],[0,540]],c.street,INK,1.2);
          polygon(g,[[0,0],[304,0],[444,218],[413,322],[0,328]],c.left,INK,1.5);
          polygon(g,[[656,0],[960,0],[960,328],[547,322],[516,218]],c.right,INK,1.5);
          polygon(g,[[304,0],[656,0],[516,218],[444,218]],c.far,INK,1.3);

          // Cornices and narrow pilasters describe the height of the buildings without heavy outlines.
          [35,114,193,272].forEach(function(x){strokeLine(g,x,0,x+78,215,0x5c6059,1,.52);});
          [685,764,843,922].forEach(function(x){strokeLine(g,x,0,x-78,215,0x5c6059,1,.52);});
          for(var floor=0;floor<3;floor++){
            var fy=18+floor*74,scale=.66+floor*.17;
            for(var col=0;col<3;col++){
              var lx=30+col*99+floor*12,rx=930-col*99-floor*12;
              var ww=51*scale,hh=65*scale;
              this.drawFrenchWindow(g,lx,fy,ww,hh,c,1);
              this.drawFrenchWindow(g,rx-ww,fy+floor*2,ww,hh,c,-1);
              if(floor>0 && (col===0 || col===2 || c.architecture==='stone-passage')){
                this.drawFrenchBalcony(g,lx-6,fy+hh-4,ww+12,14*scale,c);
                this.drawFrenchBalcony(g,rx-ww-6,fy+hh-2,ww+12,14*scale,c);
              }
            }
          }
          // A distinct roofline treatment gives each button its own street identity.
          if(c.architecture==='haussmann'){
            polygon(g,[[0,0],[304,0],[285,26],[0,40]],0x6c716d,INK,1.2);
            polygon(g,[[656,0],[960,0],[960,40],[675,26]],0x727772,INK,1.2);
            for(var dormer=0;dormer<4;dormer++){
              var dx=24+dormer*67;
              polygon(g,[[dx,26],[dx+15,8],[dx+30,26]],0xd9d0bd,INK,.9);
              g.fillStyle(0x748aa3,1);g.fillRect(dx+8,25,14,14);g.lineStyle(.8,INK,1);g.strokeRect(dx+8,25,14,14);
            }
          }else if(c.architecture==='pastel-rue'){
            for(var aw=0;aw<5;aw++){
              var wx=16+aw*63;
              strokeLine(g,wx,3,wx+38,3,0x74776f,1.3);
              g.fillStyle(aw%2?0xe9b65f:0x99a499,.75);g.fillCircle(wx+20,7,2.4);
            }
            strokeLine(g,682,48,954,48,0x6c716d,1.4,.65);
            for(var lamp=0;lamp<3;lamp++){
              var lx2=714+lamp*104;strokeLine(g,lx2,48,lx2,67,0x545555,1.2);
              g.fillStyle(c.lamp,.62);g.fillCircle(lx2,72,4);
            }
          }else{
            // The passage ends in a deep stone arch, framed by stacked balconies.
            polygon(g,[[420,314],[420,242],[480,181],[540,242],[540,314]],0x59635e,INK,1.4);
            polygon(g,[[438,314],[438,247],[480,205],[522,247],[522,314]],0x394844,INK,1);
            strokeLine(g,480,205,480,314,0xd6c8ac,1,.48);
            for(var post=0;post<4;post++){
              var px=405+post*50;strokeLine(g,px,218,px,309,0xeee2cb,1.2,.86);
            }
          }

          // Receding shopfront and a small branded awning anchor the perspective.
          polygon(g,[[395,289],[565,289],[565,438],[395,438]],0xe8e0d0,INK,1.5);
          polygon(g,[[386,289],[480,253],[574,289]],c.awning,INK,1.3);
          for(var stripe=0;stripe<8;stripe++){
            var sx=395+stripe*21;
            polygon(g,[[sx,289],[sx+20,289],[sx+18,304],[sx+2,304]],stripe%2?0xf4e9d7:c.awning,INK,.7);
          }
          g.fillStyle(0x34403b,1);g.fillRect(411,318,138,25);g.lineStyle(1.2,INK,1);g.strokeRect(411,318,138,25);
          this.add.text(480,330,'ATELIER · NORTHSTAR',{fontFamily:'Arial',fontSize:'7px',color:'#f8f1df',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(5);
          g.fillStyle(0x748aa3,1);g.fillRect(421,354,43,82);g.fillStyle(0xc2d1d0,1);g.fillRect(480,354,67,82);
          g.lineStyle(1.2,INK,1);g.strokeRect(421,354,43,82);g.strokeRect(480,354,67,82);
          for(var product=0;product<3;product++){
            var px2=490+product*17;strokeLine(g,px2,364,px2,371,INK,1);
            polygon(g,[[px2-5,372],[px2,369],[px2+5,372],[px2+3,384],[px2-3,384]],product===0?0xe9b65f:(product===1?0x99a499:0xc27d64),INK,.8);
          }

          this.drawBrandFlag(g,205,184);
          // Perspective paving: joints meet at the street's vanishing point.
          for(var row=0;row<7;row++){
            var yy=224+row*row*7.2;strokeLine(g,0,yy,960,yy,0x656a64,.75,.42);
          }
          for(var ray=0;ray<=10;ray++)strokeLine(g,480,220,ray*96,540,0x656a64,.7,.4);
          this.drawBicycle(g,c.architecture==='stone-passage'?92:130,461,c.architecture==='pastel-rue'?0x748aa3:0x545555);
          this.drawFicus(g,826,454,c.architecture==='haussmann'?0x99a499:0x70846d);
          // A few crisp façade details keep the colored-pencil palette restrained and readable.
          for(var sill=0;sill<4;sill++){
            strokeLine(g,14+sill*75,214,14+sill*75,220,0xf4ecdc,1,.7);
            strokeLine(g,946-sill*75,214,946-sill*75,220,0xf4ecdc,1,.7);
          }
        }
        drawSketchStreet(g,c){
          var wash=function(points,color,alpha){
            g.fillStyle(color,alpha);g.beginPath();g.moveTo(points[0][0],points[0][1]);
            for(var i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
            g.closePath();g.fillPath();
          };
          g.fillGradientStyle(c.sky,c.sky,0xf0eadc,0xe4daca,1);g.fillRect(0,0,960,540);
          // A pale, painted street opening stays visible between the two receding façades.
          wash([[382,176],[578,176],[684,375],[276,375]],c.far,.43);
          wash([[415,183],[545,183],[613,302],[344,302]],c.awning,.13);
          wash([[428,188],[532,188],[560,232],[401,232]],0xe9b65f,.18);
          polygon(g,[[0,0],[280,0],[422,215],[376,373],[0,392]],c.left,INK,1.3);
          polygon(g,[[680,0],[960,0],[960,392],[584,373],[538,215]],c.right,INK,1.3);
          polygon(g,[[280,0],[680,0],[538,215],[422,215]],c.far,INK,1.1);

          // Fine roof silhouettes and cornices frame the open vanishing point.
          if(c.motif==='gable'||c.motif==='roof'){
            polygon(g,[[0,42],[140,0],[280,0],[301,17],[176,14],[0,67]],0x797a70,INK,1.1);
            polygon(g,[[960,42],[820,0],[680,0],[659,17],[784,14],[960,67]],0x797a70,INK,1.1);
            for(var dorm=0;dorm<3;dorm++){
              var dx=28+dorm*78;
              polygon(g,[[dx,38],[dx+15,19],[dx+31,36]],0xd9cfbd,INK,.8);
              g.fillStyle(c.awning,1);g.fillRect(dx+9,36,14,14);g.lineStyle(.7,INK,1);g.strokeRect(dx+9,36,14,14);
            }
            for(var dormR=0;dormR<3;dormR++){
              var rx=932-dormR*78;
              polygon(g,[[rx-31,36],[rx-15,19],[rx,38]],0xd9cfbd,INK,.8);
              g.fillStyle(c.awning,1);g.fillRect(rx-23,36,14,14);g.lineStyle(.7,INK,1);g.strokeRect(rx-23,36,14,14);
            }
          }else{
            strokeLine(g,0,22,298,22,0x77796f,1.4,.78);strokeLine(g,662,22,960,22,0x77796f,1.4,.78);
            for(var roof=0;roof<5;roof++){
              var ax=22+roof*54;strokeLine(g,ax,23,ax+36,9,0x545a56,.75,.6);
              var bx=938-roof*54;strokeLine(g,bx,23,bx-36,9,0x545a56,.75,.6);
            }
          }
          // Four compact storeys per side, with French doors and shutters.
          // Draw all windows first so the balconies can sit clearly in front of the façades.
          for(var floor=0;floor<4;floor++){
            var fy=35+floor*48,scale=.74+floor*.055,ww=40*scale,hh=49*scale;
            for(var col=0;col<3;col++){
              var lx=17+col*75+floor*7,rx=943-col*75-floor*7;
              this.drawFrenchWindow(g,lx,fy,ww,hh,c,1);
              this.drawFrenchWindow(g,rx-ww,fy,ww,hh,c,-1);
            }
          }
          // Repeated iron balconies make the French apartment frontage immediately legible.
          // Each projects from the window sill with a visible stone slab, brackets and rail scrolls.
          for(var balconyFloor=0;balconyFloor<4;balconyFloor++){
            var bfy=35+balconyFloor*48,bscale=.74+balconyFloor*.055,bww=40*bscale,bhh=49*bscale;
            for(var balconyCol=0;balconyCol<3;balconyCol++){
              if(balconyCol!==0&&balconyCol!==2&&c.motif!=='balcony')continue;
              var blx=17+balconyCol*75+balconyFloor*7,brx=943-balconyCol*75-balconyFloor*7;
              this.drawFrenchBalcony(g,blx-7,bfy+bhh-3,bww+14,16*bscale,c);
              this.drawFrenchBalcony(g,brx-bww-7,bfy+bhh-3,bww+14,16*bscale,c);
            }
          }
          // Side walls carry restrained pencil hatching and hand-painted color strokes.
          for(var hatch=0;hatch<11;hatch++){
            var hy=54+hatch*24,hx=4+(hatch%3)*9;
            strokeLine(g,hx,hy,hx+16,hy-5,0x625f57,.6,.48);
            strokeLine(g,956-hx,hy,940-hx,hy-5,0x625f57,.6,.48);
          }
          for(var brush=0;brush<5;brush++){
            var by=49+brush*34,paint=brush%2?0xe9b65f:0x748aa3;
            wash([[5,by],[120,by-7],[148,by-2],[38,by+7]],paint,.10);
            wash([[955,by+3],[840,by-4],[812,by+1],[922,by+12]],brush%2?0x99a499:0xc27d64,.11);
          }

          // The street continues through a small painted square into a second row of houses.
          polygon(g,[[424,160],[536,160],[528,225],[432,225]],0xe7dfce,INK,.9);
          for(var farHouse=0;farHouse<4;farHouse++){
            var fx=436+farHouse*22,fh=22+(farHouse%2)*10;
            wash([[fx,160-fh],[fx+20,160-fh],[fx+20,197],[fx,197]],farHouse%2?c.left:c.right,.56);
            g.lineStyle(.75,INK,.8);g.strokeRect(fx,160-fh,20,37);
            g.fillStyle(c.awning,1);g.fillRect(fx+5,169-fh,6,9);g.lineStyle(.6,INK,1);g.strokeRect(fx+5,169-fh,6,9);
          }
          if(c.motif==='market'||c.motif==='lantern'){
            polygon(g,[[450,201],[510,201],[515,223],[445,223]],c.awning,INK,.9);
            for(var stripe=0;stripe<5;stripe++){
              var sx=450+stripe*12;strokeLine(g,sx,203,sx+1,222,stripe%2?0xf5edde:0xe9b65f,2,.9);
            }
          }else{
            polygon(g,[[456,202],[504,202],[508,224],[452,224]],0x99a499,INK,.8);
            strokeLine(g,480,203,480,222,0xf5edde,.8,.9);
          }
          this.add.text(480,211,'RUE · 08',{fontFamily:'Arial',fontSize:'6px',color:'#fbf5e9',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(5);

          // Perspective street plane, colored brush marks and cobbled edges.
          polygon(g,[[0,225],[960,225],[960,540],[0,540]],c.street,false,0);
          polygon(g,[[422,215],[538,215],[960,540],[0,540]],c.street,INK,.9);
          wash([[458,230],[502,230],[556,540],[409,540]],c.far,.18);
          for(var stroke=0;stroke<9;stroke++){
            var sy=248+stroke*29,sx2=480-(stroke+1)*15,ex=480+(stroke+1)*15;
            strokeLine(g,sx2,sy,ex,sy-3,stroke%2?c.awning:c.lamp,1.2,.18);
            strokeLine(g,20,sy+5,Math.max(24,sx2-8),sy+2,0x6d7069,.65,.35);
            strokeLine(g,940,sy+6,Math.min(936,ex+8),sy+2,0x6d7069,.65,.35);
          }
          for(var ray=0;ray<=8;ray++)strokeLine(g,480,219,ray*120,540,0x646963,.7,.42);
          for(var cobble=0;cobble<7;cobble++){
            var cy=315+cobble*31,cx=38+(cobble%2)*22;
            for(var stone=0;stone<8;stone++){
              var px=cx+stone*122;
              if(Math.abs(px-480)>42+cobble*15){g.lineStyle(.75,0x656a64,.34);g.strokeEllipse(px,cy,22+cobble*3,5+cobble*.35);}
            }
          }
          // The bicycle sits on the same ground plane as the player, not in the skyline.
          this.drawBicycle(g,c.motif==='market'?635:650,459,c.motif==='blue-hour'?0x748aa3:0x545555);
          this.drawFicus(g,c.motif==='gable'?830:810,461,0x99a499);
          this.drawBrandFlag(g,205,183);
          if(c.motif==='lantern'||c.motif==='blue-hour'){
            [300,660].forEach(function(lx){strokeLine(g,lx,155,lx,201,INK,1.1);g.fillStyle(c.lamp,.9);g.fillCircle(lx,207,5);g.fillStyle(c.lamp,.12);g.fillCircle(lx,207,12);});
          }
          // Loose watercolor dabs stay in the distant sky, leaving the play area clear.
          for(var dab=0;dab<16;dab++){
            var dx2=366+(dab*37)%225,dy2=82+(dab*29)%104;
            g.fillStyle(dab%3===0?c.lamp:(dab%3===1?c.awning:c.far),.12);
            g.fillEllipse(dx2,dy2,7+(dab%4)*2,3+(dab%3));
          }
        }
        drawCleanStreet(g,c){
          var wash=function(points,color,alpha){
            g.fillStyle(color,alpha);g.beginPath();g.moveTo(points[0][0],points[0][1]);
            for(var i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
            g.closePath();g.fillPath();
          };
          g.fillGradientStyle(c.sky,c.sky,0xf1eadc,c.street,1);g.fillRect(0,0,960,540);

          // Keep the road as one quiet, open plane. The two building edges create the depth.
          g.fillStyle(c.street,1);g.fillRect(0,215,960,325);
          polygon(g,[[397,212],[563,212],[923,540],[37,540]],0xd1c8b7,INK,.9);
          wash([[430,229],[530,229],[610,540],[350,540]],c.far,.11);

          // A small end-of-street block gives the lane a clear destination.
          polygon(g,[[398,143],[562,143],[572,222],[388,222]],c.far,INK,1.15);
          polygon(g,[[419,158],[541,158],[550,222],[410,222]],c.left,INK,.9);
          polygon(g,[[433,180],[527,180],[535,198],[425,198]],c.awning,INK,.8);
          if(c.motif==='market'){
            for(var stripe=0;stripe<6;stripe++){
              var sx=431+stripe*17;strokeLine(g,sx,181,sx+1,197,stripe%2?0xf2e7d4:0xe9b65f,2,.9);
            }
          }
          polygon(g,[[454,198],[506,198],[510,222],[450,222]],0x6d716c,INK,.8);
          g.fillStyle(0xddd1bc,1);g.fillRect(464,202,36,20);g.lineStyle(.7,INK,.8);g.strokeRect(464,202,36,20);
          strokeLine(g,482,202,482,222,INK,.7,.8);

          // One detailed French window and balcony on each side, framed by solid façades.
          polygon(g,[[0,0],[259,0],[419,211],[384,340],[0,380]],c.left,INK,1.35);
          polygon(g,[[701,0],[960,0],[960,380],[576,340],[541,211]],c.right,INK,1.35);
          polygon(g,[[0,31],[253,31],[273,47],[0,47]],0xe2d4bd,INK,.9);
          polygon(g,[[707,31],[960,31],[960,47],[687,47]],0xe2d4bd,INK,.9);
          strokeLine(g,0,213,419,213,0x776f63,1.25,.9);
          strokeLine(g,541,213,960,213,0x776f63,1.25,.9);

          // Soft paint washes follow the wall planes; no hatch grid or perspective guide rays.
          wash([[20,61],[86,49],[145,75],[122,154],[36,185]],c.awning,.13);
          wash([[813,50],[913,70],[938,161],[851,187],[789,126]],c.far,.15);
          if(c.motif==='brush'){
            wash([[12,174],[106,151],[164,184],[82,207],[18,202]],0xe9b65f,.19);
            wash([[842,166],[942,145],[956,194],[875,209],[817,194]],0x748aa3,.16);
          }
          if(c.motif==='roof'){
            polygon(g,[[0,0],[255,0],[278,20],[0,20]],0x817c70,INK,1);
            polygon(g,[[705,0],[960,0],[960,20],[682,20]],0x817c70,INK,1);
            polygon(g,[[34,20],[86,20],[92,29],[29,29]],0xbcb09a,INK,.7);
            polygon(g,[[874,20],[926,20],[932,29],[868,29]],0xbcb09a,INK,.7);
          }else{
            polygon(g,[[0,0],[259,0],[275,12],[0,12]],0xd8c9ad,INK,.8);
            polygon(g,[[701,0],[960,0],[960,12],[685,12]],0xd8c9ad,INK,.8);
          }

          // A large near window anchors each façade; smaller pairs step back toward
          // the vanishing point so the street reads in perspective without guide lines.
          this.drawFrenchWindow(g,20,27,96,116,c,1);
          this.drawFrenchBalcony(g,13,139,110,21,c);
          this.drawFrenchWindow(g,145,61,66,79,c,1);
          this.drawFrenchBalcony(g,140,136,77,15,c);
          this.drawFrenchWindow(g,263,108,43,52,c,1);

          this.drawFrenchWindow(g,844,27,96,116,c,-1);
          this.drawFrenchBalcony(g,837,139,110,21,c);
          this.drawFrenchWindow(g,749,61,66,79,c,-1);
          this.drawFrenchBalcony(g,744,136,77,15,c);
          this.drawFrenchWindow(g,654,108,43,52,c,-1);

          // The little upper windows belong to the distant end block and stay clear
          // of the laundry rope crossing the foreground.
          [438,508].forEach((wx)=>{
            g.fillStyle(0xd7e2df,1);g.fillRect(wx,146,14,12);
            g.lineStyle(.8,INK,.9);g.strokeRect(wx,146,14,12);
            strokeLine(g,wx+7,147,wx+7,157,INK,.6,.85);
            strokeLine(g,wx+1,152,wx+13,152,INK,.55,.78);
          });

          // Arched street doors anchor both buildings at ground level.
          this.drawStreetDoor(g,211,231,82,137,c.left,c.awning);
          this.drawStreetDoor(g,667,231,82,137,c.right,c.awning);
          if(c.motif==='market'){
            polygon(g,[[203,219],[301,219],[297,229],[207,229]],c.awning,INK,.8);
            polygon(g,[[659,219],[757,219],[753,229],[663,229]],c.awning,INK,.8);
            for(var awn=0;awn<5;awn++){
              var ax=207+awn*19;strokeLine(g,ax,220,ax+1,228,awn%2?0xf4ead8:0xe9b65f,2,.95);
              var bx=663+awn*19;strokeLine(g,bx,220,bx+1,228,awn%2?0xf4ead8:0xe9b65f,2,.95);
            }
          }

          // Wall-mounted lanterns add a different mood to the evening versions.
          if(c.motif==='lantern'||c.motif==='blue-hour'){
            [[305,225],[655,225]].forEach(function(p){
              strokeLine(g,p[0],p[1]-18,p[0],p[1]-4,INK,1.3);
              polygon(g,[[p[0]-7,p[1]-4],[p[0]+7,p[1]-4],[p[0]+5,p[1]+8],[p[0]-5,p[1]+8]],c.lamp,INK,1);
              g.fillStyle(c.lamp,.13);g.fillCircle(p[0],p[1]+2,15);
            });
          }

          // A branded shop sits at the vanishing point; the open road leads straight to it.
          this.add.text(480,164,'RUE 08',{fontFamily:'Arial',fontSize:'7px',color:'#f7f0e2',fontStyle:'bold',letterSpacing:1.2}).setOrigin(.5).setDepth(6);
          this.drawBrandFlag(g,204,180);

          // Sparse, broad paving washes keep the street readable around the catcher.
          wash([[414,335],[453,329],[487,339],[463,350],[421,349]],c.awning,.10);
          wash([[526,402],[580,394],[612,405],[584,416],[535,414]],c.lamp,.09);
          wash([[312,470],[359,463],[388,474],[352,484],[317,481]],c.far,.10);
          this.drawBicycle(g,650,459,c.motif==='blue-hour'?0x748aa3:0x545555);
          this.drawFicus(g,817,461,0x99a499);
        }
        drawStreetDoor(g,x,y,w,h,wall,glass){
          polygon(g,[[x-8,y+h],[x-8,y+34],[x-2,y+20],[x+w/2,y],[x+w+2,y+20],[x+w+8,y+34],[x+w+8,y+h]],0xe1d5c1,INK,1.1);
          polygon(g,[[x,y+h],[x,y+31],[x+7,y+17],[x+w/2,y+6],[x+w-7,y+17],[x+w,y+31],[x+w,y+h]],0x5d625d,INK,1.1);
          g.fillStyle(glass,1);g.fillRect(x+9,y+27,w-18,34);g.lineStyle(.85,INK,.9);g.strokeRect(x+9,y+27,w-18,34);
          strokeLine(g,x+w/2,y+28,x+w/2,y+60,INK,.8,.85);
          g.fillStyle(wall,1);g.fillRect(x+8,y+64,w-16,h-64);g.lineStyle(.9,INK,.9);g.strokeRect(x+8,y+64,w-16,h-64);
          strokeLine(g,x+w/2,y+64,x+w/2,y+h-2,INK,.8,.85);
          g.fillStyle(0xe9b65f,1);g.fillCircle(x+w*.59,y+91,2.1);
          polygon(g,[[x-10,y+h],[x+w+10,y+h],[x+w+15,y+h+8],[x-15,y+h+8]],0xc9bca7,INK,.9);
        }
        drawFrenchWindow(g,x,y,w,h,c,side){
          g.fillStyle(0xe9e1d2,1);g.fillRect(x-4,y-4,w+8,h+8);g.lineStyle(1.1,INK,.85);g.strokeRect(x-4,y-4,w+8,h+8);
          g.fillStyle(c.awning,1);g.fillRect(x,y,w,h);g.lineStyle(1,INK,1);g.strokeRect(x,y,w,h);
          g.fillStyle(0xd7e2df,1);g.fillRect(x+5,y+5,w-10,h-10);g.lineStyle(.8,INK,.72);g.strokeRect(x+5,y+5,w-10,h-10);
          strokeLine(g,x+w/2,y+4,x+w/2,y+h-2,INK,.9);
          strokeLine(g,x+4,y+h*.55,x+w-4,y+h*.55,INK,.8,.78);
          // Narrow shutters and sills read as French doors rather than generic square windows.
          g.fillStyle(side>0?c.left:c.right,.9);g.fillRect(x-8,y+5,5,h-7);g.fillRect(x+w+3,y+5,5,h-7);
          for(var louver=0;louver<4;louver++){
            var ly=y+11+louver*(h-17)/4;
            strokeLine(g,x-8,ly,x-3,ly+2,INK,.65,.8);strokeLine(g,x+w+3,ly,x+w+8,ly+2,INK,.65,.8);
          }
          polygon(g,[[x-8,y+h],[x+w+8,y+h],[x+w+12,y+h+5],[x-11,y+h+5]],0xe7dbc4,INK,.8);
        }
        drawFrenchBalcony(g,x,y,w,h,c){
          // Projected pale stone balcony floor, with a dark underside and two support knees.
          polygon(g,[[x-5,y+h*.66],[x+w+6,y+h*.66],[x+w+10,y+h],[x-8,y+h]],0xd6cbb7,INK,1.05);
          strokeLine(g,x+5,y+h*.72,x+11,y+h*.18,0x777166,1.05,.95);
          strokeLine(g,x+w-5,y+h*.72,x+w-11,y+h*.18,0x777166,1.05,.95);
          strokeLine(g,x-2,y+h*.67,x+w+3,y+h*.67,0x6a645a,1.2,.95);
          // Iron balustrade: strong top rail, evenly spaced uprights and understated scrollwork.
          strokeLine(g,x,y,x+w,y,INK,1.65);strokeLine(g,x,y,x,y+h*.68,INK,1.25);strokeLine(g,x+w,y,x+w,y+h*.68,INK,1.25);
          strokeLine(g,x-2,y+h*.66,x+w+3,y+h*.66,INK,1.65);
          for(var bar=0;bar<=8;bar++){
            var bx=x+bar*w/8;strokeLine(g,bx,y+1,bx,y+h*.66,INK,1.05);
            if(bar>0&&bar<8&&bar%2===0){
              var loop=Math.max(1.8,h*.18);
              g.lineStyle(.95,INK,.92);g.strokeCircle(bx,y+h*.4,loop);
            }
          }
          // Small warm metal finials catch the light without turning the rail into decoration noise.
          g.fillStyle(c.lamp,1);g.fillCircle(x,y,1.8);g.fillCircle(x+w,y,1.8);
        }
        drawWindow(g,x,y,w,h,awning){
          g.fillStyle(0xeee6d6,1);g.fillRect(x-5,y-5,w+10,h+10);g.lineStyle(2,INK,1);g.strokeRect(x-5,y-5,w+10,h+10);
          g.fillStyle(awning,1);g.fillRect(x,y,w,h);g.lineStyle(1.2,INK,1);g.strokeRect(x,y,w,h);
          g.fillStyle(0xd8e1dc,1);g.fillRect(x+7,y+8,w-14,h-18);g.lineStyle(1,INK,.8);g.strokeRect(x+7,y+8,w-14,h-18);
          strokeLine(g,x+w/2,y+8,x+w/2,y+h-10,INK,1.3);strokeLine(g,x+7,y+h/2,x+w-7,y+h/2,INK,1.2);
          g.fillStyle(0x8c7768,1);g.fillRect(x-6,y+h-9,5,11);g.fillRect(x+w+1,y+h-9,5,11);
          for(var shutter=0;shutter<5;shutter++){strokeLine(g,x-9,y+shutter*10,x-2,y+shutter*10,INK,1);strokeLine(g,x+w+2,y+shutter*10,x+w+9,y+shutter*10,INK,1);}
        }
        drawBalcony(g,x,y,w,h){
          polygon(g,[[x-7,y+h],[x+w+8,y+h],[x+w+14,y+h+13],[x-4,y+h+13]],0x8e7567,INK,1.3);
          strokeLine(g,x,y,x,y+h,INK,1.4);strokeLine(g,x+w,y,x+w,y+h,INK,1.4);strokeLine(g,x-3,y,x+w+3,y,INK,2);
          for(var bar=0;bar<=9;bar++){var bx=x+bar*w/9;strokeLine(g,bx,y,bx,y+h,INK,1.1);}
          strokeLine(g,x-4,y+h,x+w+6,y+h,INK,2.2);
        }
        drawBrandFlag(g,x,y){
          strokeLine(g,x,y-30,x,y+30,INK,1.8);
          if(this.isBayWindows34){
            polygon(g,[[x+2,y-28],[x+62,y-22],[x+58,y+18],[x+2,y+13]],0x748aa3,INK,1.3);
            this.add.text(x+30,y-14,'RUE 08',{fontFamily:'Georgia',fontSize:'15px',color:'#f7f2e8',fontStyle:'bold'}).setOrigin(.5).setDepth(12);
            strokeLine(g,x+14,y+1,x+45,y+4,0xe9b65f,1.5);
            this.add.text(x+31,y+8,'ATELIER',{fontFamily:'Arial',fontSize:'5px',color:'#f7f2e8',fontStyle:'bold',letterSpacing:1}).setOrigin(.5).setDepth(12);
            return;
          }
          polygon(g,[[x+1,y-28],[x+52,y-22],[x+48,y+16],[x+1,y+20]],0xe9b65f,INK,1.2);
          this.add.text(x+25,y-7,'N',{fontFamily:'Georgia',fontSize:'22px',color:'#414a45',fontStyle:'bold'}).setOrigin(.5).setDepth(12);
          strokeLine(g,x+8,y+27,x+44,y+21,0x748aa3,1.4);
        }
        drawBicycle(g,x,y,color){
          var scale=this.configArt.detail===4?1.1:1;
          g.lineStyle(2,color,1);g.strokeCircle(x,y,23*scale);g.strokeCircle(x+73*scale,y,23*scale);
          strokeLine(g,x,y,x+31*scale,y-34*scale,color,2);strokeLine(g,x+31*scale,y-34*scale,x+48*scale,y,color,2);strokeLine(g,x+48*scale,y,x,y,color,2);strokeLine(g,x+31*scale,y-34*scale,x+73*scale,y,color,2);strokeLine(g,x+73*scale,y,x+48*scale,y,color,2);strokeLine(g,x+29*scale,y-36*scale,x+18*scale,y-42*scale,color,2);strokeLine(g,x+18*scale,y-42*scale,x+9*scale,y-42*scale,color,2);strokeLine(g,x+69*scale,y-4*scale,x+79*scale,y-43*scale,color,2);strokeLine(g,x+74*scale,y-43*scale,x+88*scale,y-43*scale,color,2);
          g.fillStyle(0xe9b65f,1);g.fillCircle(x+48*scale,y,3*scale);
        }
        drawFicus(g,x,y,green){
          polygon(g,[[x-24,y-3],[x+26,y-3],[x+19,y+38],[x-17,y+38]],0xc27d64,INK,1.5);
          for(var leaf=0;leaf<8;leaf++){
            var a=leaf*Math.PI/4, lx=x+Math.cos(a)*24,ly=y-46+Math.sin(a)*27;
            g.lineStyle(1.5,INK,1);g.fillStyle(green,1);g.fillEllipse(lx,ly,25,12);g.strokeEllipse(lx,ly,25,12);strokeLine(g,x,y-7,lx,ly,INK,1);
          }
          strokeLine(g,x,y-8,x,y-62,INK,2.2);
        }
        drawBirds(){
          var rope=this.add.graphics().setDepth(13),birds=[],lineStart=this.isBayWindows?48:285,lineEnd=this.isBayWindows?912:676,ropeY=this.isBayWindows?198:164;
          strokeLine(rope,lineStart,ropeY,lineEnd,this.isBayWindows?205:177,INK,2.2);strokeLine(rope,lineStart,ropeY-2,lineEnd,this.isBayWindows?203:175,0xf9f4e8,.8,.8);
          rope.fillStyle(INK,1);rope.fillCircle(lineStart,ropeY,3);rope.fillCircle(lineEnd,this.isBayWindows?205:177,3);
          var poses=this.isBayWindows?[[365,189,1],[480,191,-1],[595,192,1]]:[[454,170,-1],[500,172,1]];
          poses.forEach((p,index)=>{
            var sign=p[2],birdScale=this.isBayWindows34?1.15:1,art=this.add.graphics().setPosition(p[0],p[1]).setDepth(14).setScale(this.isBayWindows?1.08*birdScale:1);
            art.lineStyle(1.5,INK,1);art.fillStyle(index?0x99a499:0x748aa3,1);art.fillEllipse(0,1,30,19);art.strokeEllipse(0,1,30,19);
            art.fillStyle(0xd8c9a4,1);art.fillCircle(sign*8,-8,9);art.lineStyle(1.3,INK,1);art.strokeCircle(sign*8,-8,9);
            polygon(art,[[sign*16,-7],[sign*28,-3],[sign*17,1]],0xe9b65f,INK,.9);
            art.fillStyle(0xf0e9da,1);art.fillEllipse(-sign*4,1,12,6);art.lineStyle(1,INK,1);art.strokeEllipse(-sign*4,1,12,6);
            strokeLine(art,-5,9,-8,12,INK,1.2);strokeLine(art,4,9,6,12,INK,1.2);
            var eyeA=this.add.circle(p[0]+sign*5*birdScale,p[1]-9*birdScale,2.5,0xf7f1e3).setStrokeStyle(1,INK).setDepth(15);
            var eyeB=this.add.circle(p[0]+sign*12*birdScale,p[1]-9*birdScale,2.5,0xf7f1e3).setStrokeStyle(1,INK).setDepth(15);
            var pupilA=this.add.circle(p[0]+sign*5*birdScale,p[1]-9*birdScale,1.05*birdScale,INK).setDepth(16);
            var pupilB=this.add.circle(p[0]+sign*12*birdScale,p[1]-9*birdScale,1.05*birdScale,INK).setDepth(16);
            var wing=this.isBayWindows?this.add.ellipse(p[0]-sign*5*birdScale,p[1]+1,10*birdScale,5*birdScale,0xe2d6bc).setStrokeStyle(1,INK).setDepth(15):null;
            birds.push({container:art,eyes:[eyeA,eyeB],pupils:[pupilA,pupilB],wing:wing,x:p[0],y:p[1],eyeX:[5*birdScale,12*birdScale],eyeY:-9*birdScale,scale:birdScale,index:index,sign:sign});
          });
          return birds;
        }
        drawForegroundLamp(){
          var g=this.add.graphics(),iron=0x373b3b,glass=0xe9b65f;
          g.fillStyle(0x8c8172,1);g.fillRoundedRect(906,378,13,39,3);g.lineStyle(1.7,iron,1);g.strokeRoundedRect(906,378,13,39,3);
          strokeLine(g,912,386,860,386,iron,4);strokeLine(g,860,386,842,401,iron,3);strokeLine(g,842,401,827,401,iron,3);
          strokeLine(g,867,386,868,406,iron,2);strokeLine(g,868,406,830,406,iron,2);
          polygon(g,[[806,411],[846,411],[854,420],[798,420]],0x4a4b47,iron,2);
          polygon(g,[[800,421],[852,421],[845,429],[807,429]],0x777166,iron,1.4);
          polygon(g,[[804,430],[848,430],[843,466],[809,466]],0xe7dfcc,iron,1.8);
          g.fillStyle(glass,.34);g.fillRect(811,434,12,27);g.fillRect(829,434,13,27);
          strokeLine(g,826,430,826,466,iron,1.5);strokeLine(g,804,430,798,422,iron,1.5);strokeLine(g,848,430,854,422,iron,1.5);
          polygon(g,[[807,467],[845,467],[837,478],[815,478]],0x777166,iron,1.6);
          g.fillStyle(0x4a4b47,1);g.fillCircle(826,407,5);g.lineStyle(1.3,iron,1);g.strokeCircle(826,407,5);
          g.fillStyle(0x777166,1);g.fillRoundedRect(820,478,12,446,3);g.lineStyle(1.7,iron,1);g.strokeRoundedRect(820,478,12,446,3);
          [512,694,876].forEach(function(y){g.fillStyle(0x514f49,1);g.fillRoundedRect(817,y,18,8,2);g.lineStyle(1,iron,1);g.strokeRoundedRect(817,y,18,8,2);});
          g.fillStyle(0x625d54,1);g.fillRoundedRect(813,920,26,28,4);g.lineStyle(1.6,iron,1);g.strokeRoundedRect(813,920,26,28,4);
          if(this.isBayWindows34){
            var lamp=this.add.container(0,0).setDepth(32),halo=this.add.ellipse(826,448,39,54,0xe9b65f,.1).setBlendMode(Phaser.BlendModes.ADD),bulb=this.add.ellipse(826,448,13,29,0xffd27a,.58).setBlendMode(Phaser.BlendModes.ADD);
            lamp.add([g,halo,bulb]);lamp.setData('bulb',bulb);lamp.setData('halo',halo);
            return lamp;
          }
          g.setDepth(32);
          return g;
        }
        createLampFlicker(){
          var lamp=this.frontLamp;if(!lamp)return;
          var scene=this;
          var flicker=function(){
            if(!lamp.active||!scene.sys.isActive())return;
            var bulb=lamp.getData('bulb'),halo=lamp.getData('halo');
            if(!bulb||!halo||!bulb.active||!halo.active)return;
            // Use small scheduled pulses instead of TweenTimeline. A timeline
            // is unnecessary here and could interrupt the scene loop in some
            // Phaser/browser combinations when its first sequence is queued.
            var pulses=Phaser.Math.Between(4,7),step=0;
            var pulse=function(){
              if(!lamp.active||!scene.sys.isActive()||!bulb.active||!halo.active)return;
              var bright=step%2===0;
              bulb.setAlpha(bright?.08:.62);
              halo.setAlpha(bright?.015:.12);
              step++;
              if(step<pulses*2){
                scene.time.delayedCall(Phaser.Math.Between(55,105),pulse);
              }else{
                bulb.setAlpha(.58);halo.setAlpha(.1);
                scene.time.delayedCall(Phaser.Math.Between(1800,4800),flicker);
              }
            };
            pulse();
          };
          this.time.delayedCall(Phaser.Math.Between(700,1700),flicker);
        }
        createBrandAirship(){
          var ship=this.add.container(-400,30).setDepth(4).setScale(2);
          var art=this.add.graphics();
          // A small, ink-outlined airship floats high in the open sky, behind the birds.
          polygon(art,[[91,1],[103,-8],[116,-5],[108,4]],0x748aa3,INK,1);
          art.fillStyle(0x748aa3,1);art.fillEllipse(153,0,124,40);art.lineStyle(1.55,INK,1);art.strokeEllipse(153,0,124,40);
          art.fillStyle(0xe5e2d6,.88);art.fillEllipse(153,-4,96,13);art.lineStyle(.8,0x545555,.68);art.strokeEllipse(153,-4,96,13);
          strokeLine(art,118,-16,119,15,0x545555,.8,.72);strokeLine(art,151,-19,151,19,0x545555,.8,.72);strokeLine(art,184,-15,184,15,0x545555,.8,.72);
          for(var port=0;port<5;port++){art.fillStyle(0xe9b65f,1);art.fillCircle(131+port*11,1,2.1);}
          // Fine suspension lines and a tidy gondola, with one warm window.
          strokeLine(art,136,17,140,28,INK,1);strokeLine(art,170,17,166,28,INK,1);
          polygon(art,[[133,27],[173,27],[169,42],[137,42]],0x99a499,INK,1.25);
          art.fillStyle(0xe9b65f,1);art.fillRect(148,31,10,6);art.lineStyle(.8,INK,1);art.strokeRect(148,31,10,6);
          // A compact trailing shop banner carries the fictional clothing label and line.
          var banner=this.add.container(0,0).setScale(1.875);
          var cloth=this.add.graphics();
          polygon(cloth,[[9,32],[111,36],[106,61],[10,57]],0xf1e7d2,INK,1.15);
          strokeLine(cloth,13,36,107,40,0xe9b65f,1,.9);
          strokeLine(cloth,15,55,103,58,0x748aa3,.8,.82);
          banner.add(cloth);
          banner.add(this.add.text(58,45,'YOUR AD HERE',{fontFamily:'Arial',fontSize:'12px',color:'#35403d',fontStyle:'bold',letterSpacing:.35}).setOrigin(.5));

          strokeLine(art,138,25,138,47,INK,1);strokeLine(art,150,23,150,47,INK,1);
          ship.add([art,banner]);
          this.airship=ship;this.airshipBanner=banner;
        }
        drawRightShopSign(){
          // A clear, two-times storefront sign on the right façade, drawn in the same ink-and-wash style.
          var sign=this.add.container(0,0).setPosition(790,555).setDepth(10).setScale(2),g=this.add.graphics();
          strokeLine(g,-22,-17,-22,-11,INK,1);strokeLine(g,22,-17,22,-11,INK,1);
          polygon(g,[[-32,-11],[32,-11],[30,11],[-30,11]],0x545555,INK,1.1);
          strokeLine(g,-27,-8,27,-8,0xe9b65f,.8,.95);
          sign.add(g);
          sign.add(this.add.text(0,-2,'RUE 08',{fontFamily:'Georgia',fontSize:'9px',color:'#f7f2e8',fontStyle:'bold',letterSpacing:.45}).setOrigin(.5));
          sign.add(this.add.text(0,7,'ATELIER',{fontFamily:'Arial',fontSize:'4px',color:'#f7f2e8',fontStyle:'bold',letterSpacing:.45}).setOrigin(.5));
        }
        createClothingTextures(){
          var palettes=[0xc27d64,0x748aa3,0x99a499,0xe9b65f,0xa97a83,0x87918a,0xd9c5a6,0x596874,0xd8a0a0,0x6e8796,0xb17b48,0x829a8c,0xbaa28c];
          for(var item=0;item<(this.isBayWindows34?13:8);item++){
            var color=palettes[item],kind=item;
            makeTexture(this,'laundry-'+item,64,66,function(g){
              g.lineStyle(2,INK,1);g.fillStyle(color,1);
              if(kind===0){ // hoodie
                g.fillRoundedRect(20,15,26,38,5);g.fillTriangle(20,17,11,25,18,32);g.fillTriangle(46,17,54,25,48,32);g.fillCircle(33,15,10);g.strokeRoundedRect(20,15,26,38,5);g.strokeCircle(33,15,10);strokeLine(g,33,26,33,50,INK,1);
              }else if(kind===1){ // shirt
                polygon(g,[[22,11],[30,16],[36,16],[44,11],[55,24],[47,31],[44,26],[44,54],[20,54],[20,26],[16,31],[8,24]],color,INK,2);strokeLine(g,32,19,32,52,INK,1);
              }else if(kind===2){ // bra
                g.fillEllipse(22,30,22,25);g.fillEllipse(42,30,22,25);g.strokeEllipse(22,30,22,25);g.strokeEllipse(42,30,22,25);strokeLine(g,11,20,4,11,INK,2);strokeLine(g,53,20,60,11,INK,2);strokeLine(g,22,43,42,43,INK,1.5);
              }else if(kind===3){ // briefs
                polygon(g,[[11,17],[53,17],[50,51],[38,44],[32,55],[25,44],[14,51]],color,INK,2);strokeLine(g,12,24,52,24,INK,1.2);
              }else if(kind===4){ // pair of socks
                polygon(g,[[17,8],[31,8],[31,35],[39,41],[37,52],[14,52],[13,44],[20,39]],color,INK,2);polygon(g,[[37,10],[51,10],[51,35],[59,41],[57,52],[34,52],[33,44],[40,39]],color,INK,2);
              }else if(kind===5){ // skirt
                polygon(g,[[23,12],[42,12],[54,52],[10,52]],color,INK,2);strokeLine(g,21,18,44,18,INK,1.4);strokeLine(g,25,24,39,24,0xf8f2e5,1,.85);
              }else if(kind===6){ // scarf
                polygon(g,[[14,10],[34,10],[35,41],[48,49],[48,58],[34,53],[28,59],[27,23],[17,23]],color,INK,2);strokeLine(g,17,18,31,18,0xf7efe2,2);
              }else if(kind===7){ // cap
                g.fillEllipse(30,29,40,27);g.strokeEllipse(30,29,40,27);polygon(g,[[30,37],[59,37],[52,44],[30,44]],color,INK,2);g.fillStyle(0xe9b65f,1);g.fillCircle(30,28,4);
              }else if(kind===8){ // dress
                polygon(g,[[23,10],[30,15],[36,15],[43,10],[51,19],[44,25],[42,22],[43,33],[55,55],[10,55],[22,33],[22,22],[19,25],[12,19]],color,INK,1.8);strokeLine(g,23,31,42,31,INK,1);strokeLine(g,20,48,45,48,0xf8f2e7,1,.8);
              }else if(kind===9){ // trousers
                polygon(g,[[16,12],[48,12],[46,31],[43,54],[32,54],[30,32],[27,54],[15,54],[18,31]],color,INK,1.8);strokeLine(g,16,19,48,19,INK,1.1);strokeLine(g,31,20,30,31,INK,1);
              }else if(kind===10){ // short jacket
                polygon(g,[[22,12],[30,17],[36,17],[44,12],[54,21],[48,30],[44,26],[45,53],[20,53],[21,26],[17,30],[10,21]],color,INK,1.8);polygon(g,[[29,16],[33,20],[37,16],[35,31],[31,31]],0xf5eee1,INK,.8);strokeLine(g,33,31,33,52,INK,1);[36,42,48].forEach(function(y){g.fillStyle(0xe9b65f,1);g.fillCircle(35,y,1.4);});
              }else if(kind===11){ // pleated long skirt
                polygon(g,[[22,12],[43,12],[56,55],[8,55]],color,INK,1.8);strokeLine(g,21,18,44,18,INK,1.3);[19,27,35,43].forEach(function(x){strokeLine(g,31+(x-31)*.35,22,x,52,INK,.8,.75);});
              }else{ // overalls
                polygon(g,[[20,16],[46,16],[48,54],[35,54],[33,34],[30,54],[17,54]],color,INK,1.8);g.fillStyle(0xf4ead8,1);g.fillRect(23,11,20,14);g.lineStyle(1.3,INK,1);g.strokeRect(23,11,20,14);strokeLine(g,25,12,20,5,INK,1.8);strokeLine(g,41,12,46,5,INK,1.8);g.fillStyle(0xe9b65f,1);g.fillCircle(27,19,1.5);g.fillCircle(39,19,1.5);
              }
              for(var hatch=0;hatch<4;hatch++)strokeLine(g,12+hatch*10,58,18+hatch*10,56,0xf8f2e7,.7,.8);
            });
          }
        }
        createMouseTextures(){
          var drawMouse=(graphics,alert)=>{
            strokeLine(graphics,11,31,3,27,INK,1.3);strokeLine(graphics,3,27,1,22,INK,1.1);
            graphics.lineStyle(1.7,INK,1);graphics.fillStyle(0x8b8170,1);graphics.fillEllipse(29,29,39,22);graphics.strokeEllipse(29,29,39,22);
            graphics.fillStyle(0xa79a85,1);graphics.fillCircle(51,23,13);graphics.strokeCircle(51,23,13);
            graphics.fillStyle(0xc27d64,1);graphics.fillCircle(45,12,6);graphics.strokeCircle(45,12,6);graphics.fillCircle(56,11,5);graphics.strokeCircle(56,11,5);
            graphics.fillStyle(alert?0xfffdf4:0xf1e9da,1);graphics.fillEllipse(49,20,alert?8:4.8,alert?11:5.5);graphics.fillEllipse(57,20,alert?8:4.8,alert?11:5.5);
            graphics.lineStyle(1,INK,1);graphics.strokeEllipse(49,20,alert?8:4.8,alert?11:5.5);graphics.strokeEllipse(57,20,alert?8:4.8,alert?11:5.5);
            graphics.fillStyle(INK,1);graphics.fillCircle(50,21,alert?2:1.4);graphics.fillCircle(58,21,alert?2:1.4);
            graphics.fillStyle(0xc27d64,1);graphics.fillCircle(63,27,2.5);strokeLine(graphics,64,28,71,27,INK,.9);strokeLine(graphics,63,30,70,33,INK,.8);
            strokeLine(graphics,18,38,16,44,INK,1.7);strokeLine(graphics,29,39,28,45,INK,1.7);strokeLine(graphics,41,38,43,44,INK,1.7);strokeLine(graphics,52,35,56,41,INK,1.7);
            strokeLine(graphics,47,20,51,18,INK,.9);strokeLine(graphics,56,18,60,20,INK,.9);
          };
          makeTexture(this,'laundry-mouse',72,48,function(g){drawMouse(g,false);});
          makeTexture(this,'laundry-mouse-alert',72,48,function(g){drawMouse(g,true);});
        }
        createCatTextures(){
          var drawCat=function(g,alert){
            // Fine ink outlines, muted fur patches and oversized alert eyes match the street cast.
            g.lineStyle(1.8,INK,1);g.fillStyle(0x77766e,1);g.fillEllipse(39,37,52,28);g.strokeEllipse(39,37,52,28);
            g.fillStyle(0xc27d64,1);g.fillEllipse(42,37,22,25);
            g.fillStyle(0x77766e,1);g.fillCircle(67,25,17);g.strokeCircle(67,25,17);
            polygon(g,[[54,16],[57,2],[67,14]],0x77766e,INK,1.3);polygon(g,[[69,13],[80,3],[82,20]],0x77766e,INK,1.3);
            g.fillStyle(0xc27d64,1);g.fillTriangle(58,14,60,7,65,14);g.fillTriangle(72,14,78,8,78,17);
            var eyeW=alert?9.5:6.5,eyeH=alert?13:8.5;
            g.fillStyle(0xf6efdf,1);g.fillEllipse(64,24,eyeW,eyeH);g.fillEllipse(76,24,eyeW,eyeH);
            g.lineStyle(1.1,INK,1);g.strokeEllipse(64,24,eyeW,eyeH);g.strokeEllipse(76,24,eyeW,eyeH);
            g.fillStyle(0x35403d,1);g.fillCircle(alert?66:65,24,alert?2.6:2);g.fillCircle(alert?78:77,24,alert?2.6:2);
            g.fillStyle(0xc27d64,1);g.fillTriangle(81,29,89,31,82,35);strokeLine(g,84,33,91,36,INK,.9);strokeLine(g,83,34,89,39,INK,.8);
            strokeLine(g,14,36,5,30,INK,2);strokeLine(g,5,30,4,20,INK,1.8);strokeLine(g,5,20,10,15,INK,1.6);
            strokeLine(g,25,48,22,56,INK,2);strokeLine(g,36,49,35,57,INK,2);strokeLine(g,49,47,51,55,INK,2);strokeLine(g,57,42,62,49,INK,2);
            strokeLine(g,13,56,25,56,INK,1.4);strokeLine(g,29,57,39,57,INK,1.4);strokeLine(g,47,55,58,55,INK,1.4);
            strokeLine(g,85,30,94,27,INK,.9,.8);strokeLine(g,85,34,95,35,INK,.9,.8);
          };
          makeTexture(this,'laundry-cat',96,62,function(g){drawCat(g,false);});
          makeTexture(this,'laundry-cat-alert',96,62,function(g){drawCat(g,true);});
        }
        spawnHangingGarment(slot){
          if(this.physics.world.isPaused)return null;
          var maxGarment=this.isBayWindows34?13:8,pool=[];
          for(var candidate=0;candidate<maxGarment;candidate++)if(!this.isBayWindows34||this.garmentHistory.slice(-4).indexOf(candidate)===-1)pool.push(candidate);
          if(!pool.length)for(var refill=0;refill<maxGarment;refill++)pool.push(refill);
          var index=Phaser.Utils.Array.GetRandom(pool),lineY=this.isBayWindows?198+(slot-330)*.022:164+(slot-285)*.033;
          if(this.isBayWindows34){this.garmentHistory.push(index);if(this.garmentHistory.length>8)this.garmentHistory.shift();}
          var garment=this.physics.add.image(slot,lineY+62,'laundry-'+index).setDepth(22).setScale((this.configArt.detail===2?.84:1)*(this.isBayWindows34?1.3:1));
          garment.body.setSize(40,44).setAllowGravity(false).setImmovable(true);
          garment.setData('released',false);garment.setData('state','hanging');garment.setData('itemIndex',index);garment.setData('slot',slot);
          this.clothes.add(garment);
          garment.setData('pin',this.drawClothespins(slot,lineY));
          return garment;
        }
        releaseGarment(){
          if(this.physics.world.isPaused||this.score>=10||this.activePeck)return;
          var hanging=this.clothes.getChildren().filter(function(item){return item.active&&item.getData('state')==='hanging';});
          if(!hanging.length){this.dropAt=this.time.now+350;return;}
          var bird,garment;
          if(this.isBayWindows){
            bird=Phaser.Utils.Array.GetRandom(this.ropeBirds);
            var nearby=hanging.filter(function(item){return Math.abs(item.getData('slot')-bird.x)<155;});
            garment=Phaser.Utils.Array.GetRandom(nearby.length?nearby:hanging);
          }else{
            var side=Phaser.Math.Between(0,1);bird=this.ropeBirds[side];
            var candidates=hanging.filter(function(item){return side===0?item.getData('slot')<=430:item.getData('slot')>=525;});
            if(!candidates.length){side=1-side;bird=this.ropeBirds[side];candidates=hanging.filter(function(item){return side===0?item.getData('slot')<=430:item.getData('slot')>=525;});}
            if(!candidates.length){this.dropAt=this.time.now+350;return;}
            var targetSlot=side===0?430:525;
            candidates.sort(function(a,b){return Math.abs(a.getData('slot')-targetSlot)-Math.abs(b.getData('slot')-targetSlot);});
            garment=candidates[0];
          }
          if(!garment)return;
          var pin=garment.getData('pin');
          garment.setData('state','pecking');
          if(this.isBayWindows34){garment.setData('sourceBirdIndex',bird.index);bird.reactionUntil=this.time.now+2500;bird.dropX=garment.x;}
          this.activePeck={garment:garment,bird:bird,endsAt:this.time.now+500};
          if(pin&&pin.active)this.tweens.add({targets:pin,x:pin.x+3,y:pin.y+1,duration:65,yoyo:true,repeat:3});
          if(!this.isBayWindows)this.tweens.add({targets:bird.container,x:garment.x-bird.sign*27,y:bird.y+6,rotation:bird.sign*.22,duration:245,yoyo:true,repeat:1,ease:'Sine.inOut'});
          bird.eyes.forEach(function(eye){eye.setScale(1.65);});
          this.dropAt=this.time.now+2350+Phaser.Math.Between(0,650);
        }
        drawClothespins(x,y){
          var pin=this.add.graphics().setDepth(23);pin.lineStyle(1.2,INK,1);pin.fillStyle(0xc27d64,1);pin.fillRect(x-7,y,6,12);pin.fillRect(x+1,y,6,12);pin.strokeRect(x-7,y,6,12);pin.strokeRect(x+1,y,6,12);strokeLine(pin,x-4,y+2,x-4,y+9,0xe9b65f,.9);strokeLine(pin,x+4,y+2,x+4,y+9,0xe9b65f,.9);
          strokeLine(pin,x,y+12,x,y+24,INK,1.1);strokeLine(pin,x,y+24,x-7,y+29,INK,1);strokeLine(pin,x,y+24,x+7,y+29,INK,1);
          return pin;
        }
        catchGarment(player,garment){
          if(!garment.active||!garment.getData('released'))return;
          garment.destroy();this.score++;
          var points=this.add.text(player.x,player.y-75,'+1',{fontFamily:'Arial',fontSize:'18px',color:'#f5eedf',fontStyle:'bold',stroke:'#414946',strokeThickness:4}).setOrigin(.5).setDepth(50);
          this.tweens.add({targets:points,y:points.y-28,alpha:0,duration:600,onComplete:function(){points.destroy();}});
          setStats(this.score+' / 10',this.misses+' / 5',this.formatTime());
          if(this.score>=10){reportResult(true,'Ten pieces saved.','Just apply the coupon at checkout.');this.physics.pause();}
        }
        action(){if(!this.player||this.physics.world.isPaused)return;if(this.isBayWindows){this.jumpMouse();return;}this.reach();}
        reach(){
          if(!this.player||this.physics.world.isPaused||this.time.now<this.reachCooldown)return;
          this.reachUntil=this.time.now+620;this.reachCooldown=this.time.now+1450;
          this.player.setTexture('laundry-catcher-reach');
          this.player.body.setSize(88,92,true);
          this.catcherLabel.setText('REACH!').setPosition(this.player.x,this.player.y-74);
          this.time.delayedCall(650,()=>{if(this.player&&this.player.active){this.player.setTexture('laundry-catcher');this.player.body.setSize(38,92,true);this.catcherLabel.setText('');}});
        }
        bindBay34Keyboard(){
          var canvas=this.game&&this.game.canvas;
          if(!canvas)return;
          var state=this.keyState={held:new Set(),jumpPressed:false,reachPressed:false};
          var controlled=['a','d','w','e','arrowleft','arrowright','arrowup',' '];
          var onDown=function(event){
            var key=String(event.key||'').toLowerCase();
            if(controlled.indexOf(key)===-1)return;
            event.preventDefault();
            if(event.repeat)return;
            state.held.add(key);
            if(key==='w'||key==='arrowup'||key===' ')state.jumpPressed=true;
            if(key==='e')state.reachPressed=true;
          };
          var onUp=function(event){state.held.delete(String(event.key||'').toLowerCase());};
          var onBlur=function(){state.held.clear();state.jumpPressed=false;state.reachPressed=false;};
          window.addEventListener('keydown',onDown,{passive:false});
          window.addEventListener('keyup',onUp);
          canvas.addEventListener('blur',onBlur);
          window.addEventListener('blur',onBlur);
          document.addEventListener('visibilitychange',onBlur);
          this.events.once(Phaser.Scenes.Events.SHUTDOWN,function(){
            window.removeEventListener('keydown',onDown);
            window.removeEventListener('keyup',onUp);
            canvas.removeEventListener('blur',onBlur);
            window.removeEventListener('blur',onBlur);
            document.removeEventListener('visibilitychange',onBlur);
            onBlur();
          });
        }
        startMouseRun(){
          if(!this.mouse||this.mouse.active||(this.isBayWindows34&&(this.catQueued||this.catStartAt||this.cat&&this.cat.active)))return;
          var direction=Phaser.Math.Between(0,1)?1:-1;
          this.mouseCrossed=false;this.mouseDirection=direction;
          if(this.isBayWindows34&&this.cat&&!this.cat.active){this.catDirection=direction;this.catQueued=true;this.catStartAt=0;}
          this.mouse.setPosition(direction>0?-44:1004,this.groundY+39).setFlipX(direction<0).setTexture('laundry-mouse');
          this.mouse.setActive(true).setVisible(true);this.mouse.body.enable=true;this.mouse.setVelocity(direction*220,0);
        }
        startCatRun(){
          if(!this.isBayWindows34||!this.cat||this.cat.active)return;
          var direction=this.catDirection||1;
          this.catStartAt=0;
          this.catQueued=false;
          this.cat.setPosition(direction>0?-72:1032,this.groundY+38).setFlipX(direction<0).setTexture('laundry-cat').setRotation(0);
          this.catCrossed=false;
          this.cat.setActive(true).setVisible(true);this.cat.body.enable=true;this.cat.setVelocity(direction*360,0);
        }
        jumpMouse(){if(this.player.y>=this.groundY-1)this.jumpVelocity=-430;}
        drawCritterImpact(kind){
          var x=this.player.x,y=this.player.y-47,burst=this.add.graphics().setPosition(x,y).setDepth(52);
          burst.lineStyle(1.7,0x454b48,.95);burst.strokeCircle(0,0,7);burst.lineStyle(1.15,0x748aa3,.95);burst.strokeCircle(0,0,13);
          for(var ray=0;ray<8;ray++){var angle=ray*Math.PI/4,inner=15,outer=ray%2?22:27;strokeLine(burst,Math.cos(angle)*inner,Math.sin(angle)*inner,Math.cos(angle)*outer,Math.sin(angle)*outer,ray%2?0x748aa3:0xe9b65f,1.8,.95);}
          burst.setScale(.72);
          this.tweens.add({targets:burst,scale:1.22,alpha:0,duration:320,ease:'Sine.Out',onComplete:function(){burst.destroy();}});
          var label=this.add.text(x,y-27,kind==='cat'?'BONK!':'BAP!',{fontFamily:'Arial',fontSize:'10px',color:'#35403d',fontStyle:'bold',stroke:'#f7f2e8',strokeThickness:3}).setOrigin(.5).setDepth(53);
          this.tweens.add({targets:label,y:label.y-13,alpha:0,duration:420,ease:'Sine.Out',onComplete:function(){label.destroy();}});
          this.player.setRotation(this.player.x<(kind==='cat'?this.cat.x:this.mouse.x)?-.08:.08);
          this.tweens.add({targets:this.player,rotation:0,duration:230,ease:'Sine.Out'});
        }
        registerCritterHit(kind){
          if(!this.isBayWindows34||this.physics.world.isPaused)return;
          this.score=Math.max(0,this.score-1);this.misses++;
          this.player.setAlpha(.52);this.time.delayedCall(280,()=>{if(this.player&&this.player.active)this.player.setAlpha(1);});
          this.drawCritterImpact(kind);
          setStats(this.score+' / 10',this.misses+' / 5',this.formatTime());
          if(this.misses>=5&&this.score<10){reportResult(false,'The street got the better of you.','A mouse or cat bump costs one saved garment. Keep moving, catch the laundry and jump the next dash.');this.physics.pause();}
        }
        registerMouseHit(){
          if(this.mouseCrossed)return;
          this.mouseCrossed=true;
          if(this.isBayWindows34){this.registerCritterHit('mouse');return;}
          this.misses++;setStats(this.score+' / 10',this.misses+' / 5',this.formatTime());
          this.player.setAlpha(.48);this.time.delayedCall(320,()=>{if(this.player&&this.player.active)this.player.setAlpha(1);});
          var bump=this.add.text(this.player.x,this.player.y-60,'OOPS!',{fontFamily:'Arial',fontSize:'11px',color:'#fff7e8',fontStyle:'bold',stroke:'#454b48',strokeThickness:3}).setOrigin(.5).setDepth(50);
          this.tweens.add({targets:bump,y:bump.y-20,alpha:0,duration:580,onComplete:function(){bump.destroy();}});
          if(this.misses>=5&&this.score<10){reportResult(false,'The mouse won that round.','Five garments or mouse dashes slipped past. Keep moving, catch the laundry and jump the next dash.');this.physics.pause();}
        }
        formatTime(){var s=Math.floor(this.elapsed);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
        update(time,delta){
          if(this.physics.world.isPaused)return;
          this.elapsed+=delta/1000;
          if(this.isBayWindows34&&this.airship){this.airship.x+=delta*.036;if(this.airship.x>960)this.airship.x=-400;this.airship.y=30+Math.sin(time*.0018)*2.8;if(this.airshipBanner)this.airshipBanner.rotation=Math.sin(time*.0025)*.018;}
          if(this.activePeck&&this.time.now>=this.activePeck.endsAt){
            var peck=this.activePeck,garment=peck.garment,pin=garment&&garment.getData('pin');
            if(garment&&garment.active){
              garment.setData('state','released');garment.setData('released',true);
              garment.body.setAllowGravity(true);garment.body.setImmovable(false);garment.body.setGravityY(460+this.configArt.detail*35);garment.setVelocity(Phaser.Math.Between(-28,28),18);
              if(pin&&pin.active)pin.destroy();
            }
            peck.bird.eyes.forEach(function(eye){eye.setScale(1);});
            this.activePeck=null;
          }
          if(this.time.now>=this.dropAt)this.releaseGarment();
          if(this.time.now>=this.nextRestock){
            var occupied=new Set(this.clothes.getChildren().filter(function(item){return item.active;}).map(function(item){return item.getData('slot');}));
            var openSlots=this.lineSlots.filter(function(slot){return !occupied.has(slot);});
            if(openSlots.length)this.spawnHangingGarment(openSlots[Phaser.Math.Between(0,openSlots.length-1)]);
            this.nextRestock=this.time.now+850;
          }
          var left=this.isBayWindows34?(this.keyState.held.has('a')||this.keyState.held.has('arrowleft')||touch.left):(this.keys.A.isDown||this.keys.LEFT.isDown||touch.left),
              right=this.isBayWindows34?(this.keyState.held.has('d')||this.keyState.held.has('arrowright')||touch.right):(this.keys.D.isDown||this.keys.RIGHT.isDown||touch.right);
          var vx=left?-250:(right?250:0);this.player.setVelocityX(vx);if(vx)this.player.setFlipX(vx<0);
          if(this.isBayWindows){
            if(this.streetBg){this.streetBg.x=480-(this.player.x-480)*.018;this.streetBg.y=480+(this.player.y-this.groundY)*.012;}
            if(this.frontLamp)this.frontLamp.setDepth(this.player.x<=this.frontLampX?32:28);
            if(this.isBayWindows34){if(this.keyState.jumpPressed){this.keyState.jumpPressed=false;this.jumpMouse();}if(this.keyState.reachPressed){this.keyState.reachPressed=false;this.reach();}}
            else{if(Phaser.Input.Keyboard.JustDown(this.keys.SPACE)||Phaser.Input.Keyboard.JustDown(this.keys.W)||Phaser.Input.Keyboard.JustDown(this.keys.UP))this.jumpMouse();if(Phaser.Input.Keyboard.JustDown(this.keys.E))this.reach();}
            var dt=Math.min(delta/1000,.05);
            if(this.jumpVelocity!==0||this.player.y<this.groundY){this.jumpVelocity+=1120*dt;this.player.y+=this.jumpVelocity*dt;if(this.player.y>=this.groundY){this.player.y=this.groundY;this.jumpVelocity=0;}}
          }else{this.player.y=420;this.player.setVelocityY(0);}
          if(this.isBayWindows){
            if(!this.mouse.active&&this.time.now>=this.mouseNextAt&&(!this.isBayWindows34||(!this.catQueued&&!this.catStartAt&&!this.cat.active)))this.startMouseRun();
            if(this.mouse.active){
              var close=Math.abs(this.mouse.x-this.player.x)<170,mouseTexture=close?'laundry-mouse-alert':'laundry-mouse';
              if(this.mouse.texture.key!==mouseTexture)this.mouse.setTexture(mouseTexture);
              this.mouse.setRotation(Math.sin(time*.025)*.045);
              if(!this.mouseCrossed&&Math.abs(this.mouse.x-this.player.x)<43){if(this.player.y<this.groundY-32){this.mouseCrossed=true;var hop=this.add.text(this.player.x,this.player.y-58,'NICE HOP',{fontFamily:'Arial',fontSize:'9px',color:'#fff7e8',fontStyle:'bold',stroke:'#454b48',strokeThickness:3}).setOrigin(.5).setDepth(50);this.tweens.add({targets:hop,y:hop.y-18,alpha:0,duration:520,onComplete:function(){hop.destroy();}});}else this.registerMouseHit();}
              if(this.mouse.x>1050||this.mouse.x< -90){
                this.mouse.setVelocityX(0).setActive(false).setVisible(false);this.mouse.body.enable=false;
                if(this.isBayWindows34&&this.catQueued){this.catQueued=false;this.catStartAt=this.time.now+Phaser.Math.Between(720,1150);this.mouseNextAt=Infinity;}
                else this.mouseNextAt=this.time.now+Phaser.Math.Between(5600,9200);
              }
            }
            if(this.isBayWindows34&&this.cat){
              if(!this.cat.active&&this.catStartAt&&this.time.now>=this.catStartAt)this.startCatRun();
              if(this.cat.active){
                var catNear=Math.abs(this.cat.x-this.player.x)<205;
                var catTexture=catNear?'laundry-cat-alert':'laundry-cat';
                if(this.cat.texture.key!==catTexture)this.cat.setTexture(catTexture);
                this.cat.setRotation(Math.sin(time*.021)*.045);
                this.cat.y=this.groundY+38+Math.abs(Math.sin(time*.018))*2.2;
                if(!this.catCrossed&&Math.abs(this.cat.x-this.player.x)<52&&this.player.y>=this.groundY-32){this.catCrossed=true;this.registerCritterHit('cat');}
                if(this.cat.x>1060||this.cat.x< -100){this.cat.setVelocityX(0).setActive(false).setVisible(false);this.cat.body.enable=false;this.catStartAt=0;this.catQueued=false;this.mouseNextAt=this.time.now+Phaser.Math.Between(5600,9200);}
              }
            }
          }
          this.reachMark.clear();
          if(this.time.now<this.reachUntil){this.reachMark.lineStyle(2,0xe9b65f,.95);this.reachMark.beginPath();this.reachMark.moveTo(this.player.x+(this.player.flipX?-24:24),this.player.y-8);this.reachMark.lineTo(this.player.x+(this.player.flipX?-76:76),this.player.y-35);this.reachMark.strokePath();}
          var falling=this.clothes.getChildren().filter(function(item){return item.active&&item.getData('released');});
          this.ropeBirds.forEach(function(bird){
            var bx=bird.container.x,by=bird.container.y;
            var nearbyDrop=falling.find(function(item){return Math.abs(item.x-bx)<135&&item.y<by+175&&(!this.isBayWindows34||item.getData('sourceBirdIndex')===bird.index);},this);
            var near=!!nearbyDrop||(this.isBayWindows34&&time<bird.reactionUntil);
            if(this.isBayWindows){
              var blinkPhase=(time+bird.index*730)%3900,eyeScale=near?(this.isBayWindows34?1.85:1.34):(blinkPhase<115?.12:1);
              bird.eyes.forEach(function(eye){eye.setScale(bird.scale*(this.isBayWindows34&&near?1.48:1),bird.scale*eyeScale);},this);
              bird.pupils.forEach(function(pupil,index){
                var lookX=near?(nearbyDrop?Phaser.Math.Clamp((nearbyDrop.x-bx)*.045,-2,2):bird.sign*.8)*bird.scale:0;
                pupil.setPosition(bx+bird.sign*bird.eyeX[index]+lookX,by+bird.eyeY+(near?1:0));
              });
              if(bird.wing){
                if(this.isBayWindows34){
                  var preenCycle=(time+250)%5100,preenStart=bird.index*1700,preening=preenCycle>=preenStart&&preenCycle<preenStart+850;
                  var preenProgress=preening?(preenCycle-preenStart)/850:0;
                  bird.wing.setRotation(preening?bird.sign*(.08+Math.sin(preenProgress*Math.PI)*.72):Math.sin(time*.002+bird.index)*.018);
                  bird.container.setRotation(preening?bird.sign*.035:Math.sin(time*.001+bird.index)*.008);
                }else{var preen=(time+bird.index*510)%4700;bird.wing.setRotation(preen>3900?Math.sin(preen*.012)*.36:Math.sin(time*.002+bird.index)*.025);}
              }
            }else{
              bird.eyes.forEach(function(eye){eye.setScale(near?1.65:1);});
              bird.pupils.forEach(function(pupil,index){pupil.setPosition(bx+bird.sign*(5+index*7),near?by-5:by-9);});
            }
          },this);
          this.clothes.getChildren().slice().forEach((item)=>{
            if(item.active&&item.y>(this.isBayWindows?945:505)){item.destroy();this.misses++;setStats(this.score+' / 10',this.misses+' / 5',this.formatTime());if(this.misses>=5&&this.score<10){reportResult(false,'The street needs another sweep.','Five garments slipped past. Try again and keep an eye on both sides of the line.');this.physics.pause();}}
          });
          if(Math.floor(this.elapsed)!==Math.floor(this.elapsed-delta/1000))setStats(this.score+' / 10',this.misses+' / 5',this.formatTime());
        }
      };
    }
    return class FallbackScene extends Phaser.Scene { constructor(){super({key:'MiniGameScene'});} create(){this.add.text(80,220,'Scene unavailable',{fontSize:'24px',color:'#222'});} };
  }
})();
