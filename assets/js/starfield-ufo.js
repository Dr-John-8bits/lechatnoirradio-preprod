(function () {
  var starCanvas = document.getElementById("starfieldCanvas");
  var ufoCanvas = document.getElementById("ufoOverlayCanvas");
  if (!starCanvas && !ufoCanvas) return;

  var motionQuery =
    window.matchMedia && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  var starCtx = starCanvas ? starCanvas.getContext("2d") : null;
  var ufoCtx = ufoCanvas ? ufoCanvas.getContext("2d") : null;
  if (!starCtx && !ufoCtx) return;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var stars = [];
  var ufos = [];
  var frameId = 0;

  function readIntAttr(element, name, fallback) {
    if (!element) return fallback;
    var value = parseInt(element.getAttribute(name), 10);
    return Number.isFinite(value) ? value : fallback;
  }

  function prefersReducedMotion() {
    return Boolean(motionQuery && motionQuery.matches);
  }

  function setCanvasSize(element) {
    if (!element) return;
    element.width = Math.round(window.innerWidth * dpr);
    element.height = Math.round(window.innerHeight * dpr);
    element.style.width = "100%";
    element.style.height = "100%";
  }

  function makeStars(isMobile) {
    var count = isMobile
      ? readIntAttr(starCanvas, "data-stars-mobile", 92)
      : readIntAttr(starCanvas, "data-stars-desktop", 172);
    return Array.from({ length: count }, function () {
      var warm = Math.random() < 0.18;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (isMobile ? 1.1 : 1.4) + 0.45,
        alpha: Math.random() * 0.8 + 0.12,
        delta: Math.random() * 0.012 + 0.003,
        direction: Math.random() < 0.5 ? -1 : 1,
        drift: (Math.random() - 0.5) * 0.02 * dpr,
        warm: warm,
      };
    });
  }

  function makeUfos(isMobile) {
    var count = isMobile
      ? readIntAttr(ufoCanvas || starCanvas, "data-ufos-mobile", 1)
      : readIntAttr(ufoCanvas || starCanvas, "data-ufos-desktop", 3);
    return Array.from({ length: count }, function () {
      return {
        x: Math.random() * width,
        y: Math.random() * height * 0.72,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.2 + 0.08) * dpr,
        scale: (Math.random() * 0.42 + 0.82) * (isMobile ? 0.92 : 1.04),
        phase: Math.random() * Math.PI * 2,
      };
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    width = Math.round(window.innerWidth * dpr);
    height = Math.round(window.innerHeight * dpr);

    setCanvasSize(starCanvas);
    setCanvasSize(ufoCanvas);

    if (starCtx) starCtx.setTransform(1, 0, 0, 1, 0, 0);
    if (ufoCtx) ufoCtx.setTransform(1, 0, 0, 1, 0, 0);

    var isMobile = window.innerWidth < 700;
    stars = makeStars(isMobile);
    ufos = makeUfos(isMobile);
  }

  function drawStar(star) {
    if (!starCtx) return;

    star.alpha += star.delta * star.direction;
    if (star.alpha <= 0.1 || star.alpha >= 0.98) {
      star.direction *= -1;
    }
    star.x += star.drift;
    if (star.x < -2) star.x = width + 2;
    if (star.x > width + 2) star.x = -2;

    starCtx.globalAlpha = Math.max(0.08, Math.min(1, star.alpha));
    starCtx.fillStyle = star.warm ? "#f2ca50" : "#f2efe8";
    var size = star.size * dpr;
    starCtx.fillRect(star.x, star.y, size, size);
  }

  function drawUfo(ufo, time) {
    var ctx = ufoCtx || starCtx;
    if (!ctx) return;

    ctx.save();
    ctx.translate(ufo.x, ufo.y);
    ctx.scale(ufo.scale * dpr, ufo.scale * dpr);

    var pulse = 0.82 + Math.sin(time * 0.0013 + ufo.phase) * 0.14;

    ctx.shadowColor = "rgba(255, 247, 213, 0.42)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(255, 245, 215, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 6.3, 12.8, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "rgba(242, 202, 80, 0.34)";
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(-4, -3);
    ctx.lineTo(-2, -6);
    ctx.lineTo(2, -6);
    ctx.lineTo(4, -3);
    ctx.lineTo(9, 0);
    ctx.lineTo(5, 3.4);
    ctx.lineTo(-5, 3.4);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 250, 236, 0.2)";
    ctx.strokeStyle = "rgba(255, 250, 236, 0.94)";
    ctx.lineWidth = 1.15;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-3.8, -2.8);
    ctx.quadraticCurveTo(0, -8.2, 3.8, -2.8);
    ctx.closePath();
    ctx.fillStyle = "rgba(242, 202, 80, 0.24)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 247, 213, 0.52)";
    ctx.stroke();

    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(242, 202, 80, " + pulse.toFixed(3) + ")";
    ctx.fillRect(-4.8, 0.2, 1.8, 1.8);
    ctx.fillRect(-0.9, 0.2, 1.8, 1.8);
    ctx.fillRect(3.0, 0.2, 1.8, 1.8);
    ctx.restore();
  }

  function stepScene(time) {
    if (document.hidden) {
      frameId = window.requestAnimationFrame(stepScene);
      return;
    }

    if (starCtx) {
      starCtx.clearRect(0, 0, width, height);
      for (var i = 0; i < stars.length; i += 1) {
        drawStar(stars[i]);
      }
      starCtx.globalAlpha = 1;
    }

    if (ufoCtx) {
      ufoCtx.clearRect(0, 0, width, height);
    } else if (starCtx) {
      starCtx.globalAlpha = 1;
    }

    for (var j = 0; j < ufos.length; j += 1) {
      var ufo = ufos[j];
      ufo.angle += Math.random() * 0.04 - 0.02;
      ufo.x += Math.cos(ufo.angle) * ufo.speed;
      ufo.y += Math.sin(ufo.angle) * ufo.speed * 0.4 + Math.sin(time * 0.001 + ufo.phase) * 0.1 * dpr;

      if (ufo.x < -70) ufo.x = width + 70;
      if (ufo.x > width + 70) ufo.x = -70;
      if (ufo.y < -50) ufo.y = height + 50;
      if (ufo.y > height + 50) ufo.y = -50;

      drawUfo(ufo, time);
    }

    frameId = window.requestAnimationFrame(stepScene);
  }

  function clearCanvas(element, ctx) {
    if (!element || !ctx) return;
    ctx.clearRect(0, 0, width, height);
    element.style.display = "none";
  }

  function stop() {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    clearCanvas(starCanvas, starCtx);
    clearCanvas(ufoCanvas, ufoCtx);
  }

  function start() {
    if (prefersReducedMotion()) {
      stop();
      return;
    }

    if (starCanvas) starCanvas.style.display = "block";
    if (ufoCanvas) ufoCanvas.style.display = "block";

    resize();
    if (!frameId) frameId = window.requestAnimationFrame(stepScene);
  }

  window.addEventListener("resize", resize, { passive: true });

  if (motionQuery) {
    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", start);
    } else if (typeof motionQuery.addListener === "function") {
      motionQuery.addListener(start);
    }
  }

  start();
})();
