(function () {
  var spoiler = document.getElementById('spoiler');
  if (spoiler) {
    function toggle() {
      spoiler.classList.toggle('is-revealed');
      var revealed = spoiler.classList.contains('is-revealed');
      spoiler.setAttribute('aria-label', revealed ? 'Скрыть текст' : 'Показать скрытый текст');
      if (revealed && !window.matchMedia('(max-width: 768px)').matches) {
        document.body.classList.add('bubbles-visible');
      } else {
        document.body.classList.remove('bubbles-visible');
      }
    }
    spoiler.addEventListener('click', toggle);
    spoiler.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var root = document.documentElement;
      var current = root.getAttribute('data-theme');
      var isDark = current === 'dark' || (current === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* Параллакс фона от курсора */
  var bg = document.getElementById('bg');
  if (bg) {
    var mouseX = 0.5;
    var mouseY = 0.5;
    var currentX = 0.5;
    var currentY = 0.5;
    var factor = 0.04;
    var strength = 25;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    });

    function updateParallax() {
      currentX += (mouseX - 0.5 - currentX) * factor;
      currentY += (mouseY - 0.5 - currentY) * factor;
      var x = (currentX - 0.5) * strength;
      var y = (currentY - 0.5) * strength;
      bg.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      requestAnimationFrame(updateParallax);
    }
    requestAnimationFrame(updateParallax);
  }

  /* Перетаскиваемые bubbles на фоне (только не на мобильных) */
  var bubblesRoot = document.getElementById('bubbles');
  var trashEl = document.getElementById('trash');
  if (bubblesRoot && !window.matchMedia('(max-width: 768px)').matches) {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var bubbleCount = reduceMotion ? 6 : 10;
    var bubbles = [];
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    function isOverTrash(clientX, clientY) {
      if (!trashEl) return false;
      var rect = trashEl.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    }

    function removeBubble(b) {
      var idx = bubbles.indexOf(b);
      if (idx !== -1) bubbles.splice(idx, 1);
      if (b.el && b.el.parentNode) b.el.remove();
      if (trashEl) trashEl.classList.remove('is-over');
    }

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function apply(b) {
      b.el.style.transform = 'translate3d(' + b.x + 'px,' + b.y + 'px,0)';
    }

    function updateViewport() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        b.x = clamp(b.x, 0, Math.max(0, vw - b.size));
        b.y = clamp(b.y, 0, Math.max(0, vh - b.size));
        apply(b);
      }
    }

    window.addEventListener('resize', updateViewport);

    var bubbleWords = [
      'инкремент', 'согласование', 'синхронизация', 'ревью', 'апрув', 'деплой',
      'рефакторинг', 'стейкхолдер', 'дедлайн', 'митинг', 'созвон', 'тикет',
      'багфикс', 'фича', 'релиз', 'итерация', 'спринт', 'бэклог', 'стендап',
      'ретро', 'демо', 'воркшоп', 'воркфлоу', 'пайплайн', 'роадмап', "дейлик", "документация",
      'эстимейт', 'скоуп', 'капасити', 'онбординг', 'эскалация', 'постмортем',
      'хотфикс', 'SLA', 'онколл', 'приоритизация', 'регламент', 'чеклист',
      'аллокация', 'перформанс', 'тюнинг', 'апдейт', 'синергия', 'KPI', 'OKR',
      'коммит', 'мерж', 'пуш', 'пул-реквест', 'код-ревью', 'пингануть', 'задеплоить',
      'засинкать', 'заапрувить', 'заревьюить', 'драйв', 'проактивность', 'агентность',
      'тачпоинт', 'апскейл', 'даунскейл', 'оффбординг', 'метрики', 'дашборд',
      'отчёт', 'репорт', 'статус', 'инкрементальный', 'итеративный', 'планирование',
      'ресурсирование', 'нагрузка', 'дебаг', 'логи', 'алерты', 'отчётность',
      'root cause', 'RCA', 'даунтайм', 'аптайм', 'SLO', 'дежурство', 'брейншторм',
      'процесс', 'процедура', 'чекпоинт', 'демонстрация', 'логирование', 'мониторинг',
      'инцидент', 'тимлид', 'проджект', 'продакт', 'девопс', 'воркаут', 'таск', "фикс", "шедулер",
      'LLM', 'AI', 'AI-агенты', 'вайб-кодинг', 'вайб-дебагинг'
    ];

    function showBubbleWord(b) {
      var wordEl = b.el.querySelector('.bubble__word');
      if (!wordEl) {
        wordEl = document.createElement('span');
        wordEl.className = 'bubble__word';
        b.el.appendChild(wordEl);
      }
      wordEl.textContent = bubbleWords[Math.floor(Math.random() * bubbleWords.length)];
      wordEl.hidden = false;
    }

    function hideBubbleWord(b) {
      var wordEl = b.el.querySelector('.bubble__word');
      if (wordEl) wordEl.hidden = true;
    }

    function onPointerDownFactory(b) {
      return function (e) {
        e.preventDefault();
        b.dragging = true;
        b.pointerId = e.pointerId;
        b.el.classList.add('is-dragging');
        b.el.setPointerCapture(e.pointerId);
        showBubbleWord(b);

        var rect = b.el.getBoundingClientRect();
        b.offsetX = e.clientX - rect.left;
        b.offsetY = e.clientY - rect.top;
        b.lastMoveT = performance.now();
        b.lastMoveX = e.clientX;
        b.lastMoveY = e.clientY;
      };
    }

    function onPointerMoveFactory(b) {
      return function (e) {
        if (!b.dragging || e.pointerId !== b.pointerId) return;
        e.preventDefault();

        if (trashEl) {
          if (isOverTrash(e.clientX, e.clientY)) trashEl.classList.add('is-over');
          else trashEl.classList.remove('is-over');
        }

        var now = performance.now();
        var dt = Math.max(8, now - b.lastMoveT);
        var dx = e.clientX - b.lastMoveX;
        var dy = e.clientY - b.lastMoveY;

        b.vx = dx / dt;
        b.vy = dy / dt;

        b.lastMoveT = now;
        b.lastMoveX = e.clientX;
        b.lastMoveY = e.clientY;

        b.x = clamp(e.clientX - b.offsetX, 0, Math.max(0, vw - b.size));
        b.y = clamp(e.clientY - b.offsetY, 0, Math.max(0, vh - b.size));
        apply(b);
      };
    }

    function onPointerUpFactory(b) {
      return function (e) {
        if (e.pointerId !== b.pointerId) return;
        if (e.type === 'pointercancel') {
          if (trashEl) trashEl.classList.remove('is-over');
          b.dragging = false;
          b.pointerId = null;
          b.el.classList.remove('is-dragging');
          hideBubbleWord(b);
          return;
        }
        if (isOverTrash(e.clientX, e.clientY)) {
          removeBubble(b);
          return;
        }
        if (trashEl) trashEl.classList.remove('is-over');
        b.dragging = false;
        b.pointerId = null;
        b.el.classList.remove('is-dragging');
        hideBubbleWord(b);
      };
    }

    function createOneBubble() {
      var el = document.createElement('div');
      el.className = 'bubble';
      el.setAttribute('title', 'Перетащите в корзину — удалится');

      var size = Math.round(rand(44, 120));
      var x = rand(0, Math.max(0, vw - size));
      var y = rand(0, Math.max(0, vh - size));
      var opacity = rand(0.55, 0.95);

      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.opacity = String(opacity);

      var b = {
        el: el,
        size: size,
        x: x,
        y: y,
        vx: reduceMotion ? 0 : rand(-0.03, 0.03),
        vy: reduceMotion ? 0 : rand(-0.03, 0.03),
        dragging: false,
        pointerId: null,
        offsetX: 0,
        offsetY: 0,
        lastMoveT: 0,
        lastMoveX: 0,
        lastMoveY: 0
      };

      apply(b);
      bubbles.push(b);
      bubblesRoot.appendChild(el);

      el.addEventListener('pointerdown', onPointerDownFactory(b));
      el.addEventListener('pointermove', onPointerMoveFactory(b));
      el.addEventListener('pointerup', onPointerUpFactory(b));
      el.addEventListener('pointercancel', onPointerUpFactory(b));
    }

    for (var i = 0; i < bubbleCount; i++) {
      createOneBubble();
    }

    var addBtn = document.getElementById('bubbles-add');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var n = reduceMotion ? 1 : 3;
        for (var j = 0; j < n; j++) createOneBubble();
      });
    }

    var repulsionStrength = 0.08;
    var hub = document.querySelector('.hub');
    var hubShakeX = 0;
    var hubShakeY = 0;
    var hubShakeDecay = 0.88;
    var hubShakeMax = 12;
    var hubTintR = 0;
    var hubTintG = 0;
    var hubTintB = 0;
    var hubTintA = 0;
    var hubTintDecay = 0.91;
    var hubTintMaxA = 0.22;
    var hubTintColors = [
      [255, 180, 220],
      [180, 220, 255],
      [220, 255, 200],
      [255, 220, 180],
      [230, 200, 255]
    ];
    var lastT = performance.now();
    function tick(now) {
      if (!document.body.classList.contains('bubbles-visible')) {
        hubShakeX = 0;
        hubShakeY = 0;
        hubTintA = 0;
        if (hub) {
          hub.style.transform = '';
          hub.style.setProperty('--hub-tint', 'transparent');
        }
        lastT = now;
        requestAnimationFrame(tick);
        return;
      }
      var dt = Math.min(32, now - lastT);
      lastT = now;

      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        if (b.dragging) continue;

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        b.vx *= 0.998;
        b.vy *= 0.998;

        if (!reduceMotion) {
          b.vx += rand(-0.00003, 0.00003) * dt;
          b.vy += rand(-0.00003, 0.00003) * dt;
        }

        var maxX = Math.max(0, vw - b.size);
        var maxY = Math.max(0, vh - b.size);
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); }
        if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); }
      }

      for (var i = 0; i < bubbles.length; i++) {
        for (var j = i + 1; j < bubbles.length; j++) {
          var b1 = bubbles[i];
          var b2 = bubbles[j];
          var r1 = b1.size / 2;
          var r2 = b2.size / 2;
          var cx1 = b1.x + r1;
          var cy1 = b1.y + r1;
          var cx2 = b2.x + r2;
          var cy2 = b2.y + r2;
          var dx = cx2 - cx1;
          var dy = cy2 - cy1;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var minDist = r1 + r2;
          if (dist < minDist && dist > 0.001) {
            var overlap = minDist - dist;
            var ux = dx / dist;
            var uy = dy / dist;
            var total = b1.size + b2.size;
            if (!b1.dragging) {
              b1.x -= ux * overlap * (b2.size / total);
              b1.y -= uy * overlap * (b2.size / total);
              b1.vx -= ux * repulsionStrength;
              b1.vy -= uy * repulsionStrength;
            }
            if (!b2.dragging) {
              b2.x += ux * overlap * (b1.size / total);
              b2.y += uy * overlap * (b1.size / total);
              b2.vx += ux * repulsionStrength;
              b2.vy += uy * repulsionStrength;
            }
          } else if (dist < 0.001 && minDist > 0) {
            var ux = 1;
            var uy = 0;
            var overlap = minDist;
            var total = b1.size + b2.size;
            if (!b1.dragging) {
              b1.x -= ux * overlap * (b2.size / total);
              b1.y -= uy * overlap * (b2.size / total);
              b1.vx -= ux * repulsionStrength;
              b1.vy -= uy * repulsionStrength;
            }
            if (!b2.dragging) {
              b2.x += ux * overlap * (b1.size / total);
              b2.y += uy * overlap * (b1.size / total);
              b2.vx += ux * repulsionStrength;
              b2.vy += uy * repulsionStrength;
            }
          }
        }
      }

      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        var maxX = Math.max(0, vw - b.size);
        var maxY = Math.max(0, vh - b.size);
        b.x = clamp(b.x, 0, maxX);
        b.y = clamp(b.y, 0, maxY);
        apply(b);
      }

      if (hub) {
        var rect = hub.getBoundingClientRect();
        var left = rect.left;
        var top = rect.top;
        var right = rect.right;
        var bottom = rect.bottom;
        var hubKick = 0.12;
        for (var i = 0; i < bubbles.length; i++) {
          var b = bubbles[i];
          var r = b.size / 2;
          var cx = b.x + r;
          var cy = b.y + r;
          var px = cx < left ? left : (cx > right ? right : cx);
          var py = cy < top ? top : (cy > bottom ? bottom : cy);
          var ddx = cx - px;
          var ddy = cy - py;
          var dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < r && dist > 0.0001) {
            var overlap = r - dist;
            var nx = ddx / dist;
            var ny = ddy / dist;
            var speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            var force = speed * 2.5 + overlap * 0.15;
            force = Math.min(force, 4);
            hubShakeX += nx * force;
            hubShakeY += ny * force;
            var tintAdd = 0.018 + overlap * 0.0008;
            if (tintAdd > 0 && hubTintColors.length) {
              var col = hubTintColors[Math.floor(Math.random() * hubTintColors.length)];
              hubTintR = hubTintR * hubTintA + col[0] * tintAdd;
              hubTintG = hubTintG * hubTintA + col[1] * tintAdd;
              hubTintB = hubTintB * hubTintA + col[2] * tintAdd;
              hubTintA = Math.min(hubTintMaxA, hubTintA + tintAdd);
              var s = hubTintA > 0 ? 1 / hubTintA : 0;
              hubTintR *= s;
              hubTintG *= s;
              hubTintB *= s;
            }
            if (!b.dragging) {
              b.x += nx * overlap;
              b.y += ny * overlap;
              b.vx += nx * hubKick;
              b.vy += ny * hubKick;
            }
          }
        }
        hubShakeX *= hubShakeDecay;
        hubShakeY *= hubShakeDecay;
        hubTintA *= hubTintDecay;
        if (hubTintA < 0.005) hubTintA = 0;
        var len = Math.sqrt(hubShakeX * hubShakeX + hubShakeY * hubShakeY);
        if (len > hubShakeMax) {
          hubShakeX = (hubShakeX / len) * hubShakeMax;
          hubShakeY = (hubShakeY / len) * hubShakeMax;
        }
        var hubTransform = 'translate(' + hubShakeX + 'px,' + hubShakeY + 'px)';
        if (hubTintA > 0) {
          hub.style.setProperty('--hub-tint', 'rgba(' + Math.round(hubTintR) + ',' + Math.round(hubTintG) + ',' + Math.round(hubTintB) + ',' + hubTintA + ')');
        } else {
          hub.style.setProperty('--hub-tint', 'transparent');
        }
        hub.style.transform = hubTransform;
      }

      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        var maxX = Math.max(0, vw - b.size);
        var maxY = Math.max(0, vh - b.size);
        b.x = clamp(b.x, 0, maxX);
        b.y = clamp(b.y, 0, maxY);
        apply(b);
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();
