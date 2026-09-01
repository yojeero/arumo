// == Beyo wave v7.8 — Lightweight Android =====================
window.WaveformVisualizer = (() => {
  const BAR_COUNT = 48;
  const HEIGHT_SCALE = 0.45;

  let canvas, ctx;
  let offsets, speeds;
  let colorFrom = [184, 230, 254];
  let colorTo = [184, 230, 254];
  let mix = 1;

  let audioCtx = null;
  let analyser = null;
  let source = null;
  let dataArray = null;

  let running = false;
  let kickLevel = 0;

  /* -------------------- INIT -------------------- */
  function init({ canvasEl, audio }) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");

    offsets = Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2);
    speeds = Array.from({ length: BAR_COUNT }, () => 0.02 + Math.random() * 0.05);

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85;
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }

    resizeCanvas();
    drawIdle(); // статичный idle сразу при загрузке
    window.addEventListener("resize", resizeCanvas);

    // Мягкий breathing idle без нагрузки
    setInterval(() => {
      if (!running) drawIdle();
    }, 120); // увеличенный интервал для слабых девайсов
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  /* -------------------- COLOR -------------------- */
  function setColor(rgb) {
    colorFrom = [...colorTo];
    colorTo = rgb;
    mix = 0;
    if (!running) drawIdle(); // сразу применяем цвет для idle
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function currentColor() {
    mix = Math.min(mix + 0.03, 1);
    return [
      Math.round(lerp(colorFrom[0], colorTo[0], mix)),
      Math.round(lerp(colorFrom[1], colorTo[1], mix)),
      Math.round(lerp(colorFrom[2], colorTo[2], mix))
    ];
  }

  /* -------------------- DRAW STATIC BREATHING IDLE -------------------- */
  function drawIdle() {
    if (!canvas || !ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;
    const barW = w / BAR_COUNT;

    ctx.clearRect(0, 0, w, h);

    const [r, g, b] = colorTo;
    ctx.fillStyle = `rgb(${r},${g},${b})`;

    const time = Date.now();
    const breath = 0.08 + 0.015 * Math.sin(time * 0.001); // плавный пульс

    for (let i = 0; i < BAR_COUNT; i++) {
      const t = Math.abs(i / (BAR_COUNT - 1) - 0.5) * 2;
      const shape = Math.pow(1 - t, 2.8);

      const amplitude = shape * h * breath;
      const x = i * barW + barW * 0.15;
      const y = centerY - amplitude;
      const height = amplitude * 2;
      const width = barW * 0.7;
      const radius = Math.min(width / 2, height / 2);

      drawRoundedBar(x, y, width, height, radius);
    }
  }

  /* -------------------- DRAW PLAY -------------------- */
  function draw(ts) {
    if (!running) return;

    analyser.getByteFrequencyData(dataArray);

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;
    const barW = w / BAR_COUNT;

    ctx.clearRect(0, 0, w, h);

    const [r, g, b] = currentColor();

    const bass = dataArray.slice(0, Math.floor(dataArray.length * 0.15));
    const bassAvg = bass.reduce((sum, v) => sum + v, 0) / bass.length / 255;

    if (bassAvg > 0.35) kickLevel = 1;
    else kickLevel = Math.max(0, kickLevel - 0.05);

    for (let i = 0; i < BAR_COUNT; i++) {
      const t = Math.abs(i / (BAR_COUNT - 1) - 0.5) * 2;
      const shape = Math.pow(1 - t, 2.8);

      const freqIndex = Math.floor(t * (dataArray.length - 1));
      const audioAmp = dataArray[freqIndex] / 255;

      const amplitude = shape * audioAmp * h * HEIGHT_SCALE * (1 + kickLevel);
      const x = i * barW + barW * 0.15;
      const y = centerY - amplitude;
      const height = amplitude * 2;
      const width = barW * 0.7;
      const radius = Math.min(width / 2, height / 2);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      drawRoundedBar(x, y, width, height, radius);
    }

    requestAnimationFrame(draw);
  }

  function drawRoundedBar(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function start() {
    if (!running) {
      running = true;
      if (audioCtx?.state === "suspended") audioCtx.resume();
      requestAnimationFrame(draw);
    }
  }

  function stop() {
    running = false;
    drawIdle(); // возвращаем статичный idle
  }

  return { init, resizeCanvas, start, stop, setColor, drawIdle };
})();
