/*!
 * Character cursor: "Blip", a small animated mascot that follows your pointer.
 * - Springs after the cursor with squash & stretch and tilt
 * - Eyes track the cursor, random blinking
 * - Gets excited over links/buttons, jumps on click
 * - Falls asleep (Zzz) when the mouse is idle
 * Drop-in: <script src="character-cursor.js" defer></script>
 * Self-contained. Desktop/mouse only.
 */
(function () {
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  // ====== CONFIG ======
  var BODY = '#7c5cff';      // main body color (match your accent)
  var BODY_DARK = '#5a3fd6'; // shading / feet
  var SIZE = 64;             // character size in px
  var OFFSET_X = 34;         // where Blip sits relative to the pointer
  var OFFSET_Y = 30;
  var STIFFNESS = 0.08;      // spring pull (higher = snappier)
  var DAMPING = 0.78;        // spring friction (lower = bouncier)
  var SLEEP_AFTER_MS = 4000;
  var HIDE_NATIVE_CURSOR = false; // true = hide the normal arrow
  var EXCITE_TARGETS = 'a, button, [role="button"], summary';
  // ====================

  var css =
    '.blip{position:fixed;top:0;left:0;width:' + SIZE + 'px;height:' + SIZE + 'px;margin:' + (-SIZE / 2) + 'px 0 0 ' + (-SIZE / 2) + 'px;' +
    'pointer-events:none;z-index:2147483646;opacity:0;transition:opacity .3s;will-change:transform}' +
    '.blip.on{opacity:1}' +
    '.blip svg{width:100%;height:100%;overflow:visible;display:block}' +
    '.blip .lid{transform-box:fill-box;transform-origin:center;transition:transform .08s}' +
    '.blip .zzz{opacity:0;transition:opacity .4s;font:700 13px system-ui,sans-serif;fill:currentColor}' +
    '.blip.sleep .zzz{opacity:.8;animation:blipz 2s ease-in-out infinite}' +
    '@keyframes blipz{0%,100%{transform:translate(0,0)}50%{transform:translate(4px,-6px)}}' +
    (HIDE_NATIVE_CURSOR ? 'html.blip-hide,html.blip-hide *{cursor:none!important}' : '');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var svg =
    '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse class="shadow" cx="32" cy="60" rx="14" ry="3" fill="#000" opacity=".18"/>' +
      // antenna
      '<line x1="32" y1="8" x2="32" y2="2" stroke="' + BODY_DARK + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle class="ball" cx="32" cy="2" r="3.2" fill="#ffd166"/>' +
      // feet
      '<ellipse class="footL" cx="23" cy="56" rx="6" ry="3.5" fill="' + BODY_DARK + '"/>' +
      '<ellipse class="footR" cx="41" cy="56" rx="6" ry="3.5" fill="' + BODY_DARK + '"/>' +
      // body
      '<path d="M10 36 C10 18 20 8 32 8 C44 8 54 18 54 36 C54 49 46 57 32 57 C18 57 10 49 10 36Z" fill="' + BODY + '"/>' +
      '<path d="M14 40 C16 50 24 55 32 55 C40 55 48 50 50 40 C46 48 40 51 32 51 C24 51 18 48 14 40Z" fill="' + BODY_DARK + '" opacity=".35"/>' +
      '<ellipse cx="22" cy="17" rx="6" ry="3" fill="#fff" opacity=".25" transform="rotate(-25 22 17)"/>' +
      // eyes
      '<g class="eyeL"><circle cx="23" cy="30" r="8" fill="#fff"/><circle class="pupL" cx="23" cy="30" r="3.8" fill="#16161d"/>' +
        '<rect class="lid" x="14" y="21" width="18" height="18" rx="9" fill="' + BODY + '" style="transform:scaleY(0)"/></g>' +
      '<g class="eyeR"><circle cx="41" cy="30" r="8" fill="#fff"/><circle class="pupR" cx="41" cy="30" r="3.8" fill="#16161d"/>' +
        '<rect class="lid" x="32" y="21" width="18" height="18" rx="9" fill="' + BODY + '" style="transform:scaleY(0)"/></g>' +
      // cheeks + mouth
      '<ellipse cx="15" cy="42" rx="3.2" ry="2" fill="#ff8fab" opacity=".55"/>' +
      '<ellipse cx="49" cy="42" rx="3.2" ry="2" fill="#ff8fab" opacity=".55"/>' +
      '<path class="mouth" d="M27 44 Q32 48 37 44" fill="none" stroke="#16161d" stroke-width="2.4" stroke-linecap="round"/>' +
      '<text class="zzz" x="50" y="8">z</text>' +
    '</svg>';

  var el = document.createElement('div');
  el.className = 'blip';
  el.innerHTML = svg;
  document.body.appendChild(el);
  if (HIDE_NATIVE_CURSOR) document.documentElement.classList.add('blip-hide');

  var $ = function (s) { return el.querySelector(s); };
  var pupL = $('.pupL'), pupR = $('.pupR'), mouth = $('.mouth');
  var lids = el.querySelectorAll('.lid');
  var footL = $('.footL'), footR = $('.footR'), ball = $('.ball'), shadow = $('.shadow');

  var mx = -200, my = -200;      // pointer
  var x = -200, y = -200;        // character position
  var vx = 0, vy = 0;
  var jump = 0, jumpV = 0;       // vertical hop offset
  var excited = false, asleep = false, started = false;
  var lastMove = performance.now();
  var facing = 1, tilt = 0, sx = 1, sy = 1;

  function setMouth(kind) {
    var d = { smile: 'M27 44 Q32 48 37 44', open: 'M26 43 Q32 55 38 43 Z', sleep: 'M29 46 L35 46' }[kind];
    mouth.setAttribute('d', d);
    mouth.setAttribute('fill', kind === 'open' ? '#16161d' : 'none');
  }
  function blink(closed) {
    for (var i = 0; i < lids.length; i++) lids[i].style.transform = 'scaleY(' + (closed ? 1 : 0) + ')';
  }
  function hop(power) { if (jump === 0) jumpV = power; }

  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!started) { x = mx + OFFSET_X; y = my + OFFSET_Y; started = true; el.classList.add('on'); }
    lastMove = performance.now();
    if (asleep) { asleep = false; el.classList.remove('sleep'); blink(false); hop(-6); }
    var t = e.target;
    var ex = !!(t.closest && t.closest(EXCITE_TARGETS));
    if (ex !== excited) {
      excited = ex;
      setMouth(excited ? 'open' : 'smile');
      if (excited) hop(-5);
    }
  }, { passive: true });
  window.addEventListener('mousedown', function () { hop(-9); });
  document.addEventListener('mouseleave', function () { el.classList.remove('on'); started = false; });

  // Random blinking
  (function scheduleBlink() {
    setTimeout(function () {
      if (!asleep) { blink(true); setTimeout(function () { if (!asleep) blink(false); }, 110); }
      scheduleBlink();
    }, 1800 + Math.random() * 3200);
  })();

  var t0 = performance.now();
  (function frame(now) {
    var time = (now - t0) / 1000;

    // Spring toward the target (offset from pointer)
    var tx = mx + OFFSET_X, ty = my + OFFSET_Y;
    vx = (vx + (tx - x) * STIFFNESS) * DAMPING;
    vy = (vy + (ty - y) * STIFFNESS) * DAMPING;
    x += vx; y += vy;

    // Hop physics
    if (jump !== 0 || jumpV !== 0) {
      jumpV += 0.9; jump += jumpV;
      if (jump >= 0) { jump = 0; jumpV = 0; }
    }

    var speed = Math.sqrt(vx * vx + vy * vy);
    var moving = speed > 0.6;

    // Squash & stretch along movement, tilt by horizontal velocity
    var stretch = Math.min(speed * 0.012, 0.22);
    sx += ((1 - stretch * 0.6) - sx) * 0.2;
    sy += ((1 + stretch) - sy) * 0.2;
    tilt += (Math.max(-18, Math.min(18, vx * 1.2)) - tilt) * 0.15;
    if (Math.abs(vx) > 1.2) facing = vx > 0 ? 1 : -1;

    // Idle bob / breathing
    var bob = asleep ? Math.sin(time * 1.4) * 1.2 : Math.sin(time * 3) * (moving ? 0.5 : 1.6);
    var breathe = asleep ? 1 + Math.sin(time * 1.4) * 0.03 : 1;

    el.style.transform =
      'translate3d(' + x.toFixed(2) + 'px,' + (y + jump + bob).toFixed(2) + 'px,0) ' +
      'rotate(' + tilt.toFixed(2) + 'deg) scale(' + (sx * breathe).toFixed(3) + ',' + (sy * breathe).toFixed(3) + ')';

    // Eyes look at the pointer
    if (!asleep) {
      var dx = mx - x, dy = my - y;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var r = Math.min(3.6, d / 40 + 1);
      var px = (dx / d) * r, py = (dy / d) * r;
      pupL.setAttribute('cx', 23 + px); pupL.setAttribute('cy', 30 + py);
      pupR.setAttribute('cx', 41 + px); pupR.setAttribute('cy', 30 + py);
      var pr = excited ? 4.6 : 3.8;
      pupL.setAttribute('r', pr); pupR.setAttribute('r', pr);
    }

    // Feet shuffle while moving
    var step = moving ? Math.sin(time * 18) * Math.min(speed * 0.5, 3) : 0;
    footL.setAttribute('cy', 56 - Math.max(0, step));
    footR.setAttribute('cy', 56 - Math.max(0, -step));
    // Antenna ball wobbles with motion
    ball.setAttribute('cx', 32 - vx * 0.6 + Math.sin(time * 4) * 0.8);
    ball.setAttribute('cy', 2 + Math.min(Math.abs(vy) * 0.2, 2));
    // Shadow shrinks when hopping
    shadow.setAttribute('rx', Math.max(8, 14 + jump * 0.4));

    // Fall asleep when idle
    if (!asleep && started && now - lastMove > SLEEP_AFTER_MS) {
      asleep = true; el.classList.add('sleep'); blink(true); setMouth('sleep');
    } else if (!asleep && !excited && started) {
      // keep mouth in sync after waking
      if (mouth.getAttribute('d').indexOf('L35 46') > -1) setMouth('smile');
    }

    requestAnimationFrame(frame);
  })(performance.now());
})();
