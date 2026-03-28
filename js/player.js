// ===================== @yojeero =====================
// ===================== Beyo player v7.8 =====================

(() => {
  /* -------------------- AUDIO -------------------- */
  const audio = new Audio();
  audio.preload = "metadata";
  audio.crossOrigin = "anonymous";
  audio.volume = 1;

  /* -------------------- DOM -------------------- */
  const playBtn    = document.getElementById("playBtn");
  const prevBtn    = document.getElementById("prevBtn");
  const nextBtn    = document.getElementById("nextBtn");
  const trackName  = document.getElementById("trackName");
  const artistName = document.getElementById("artistName");
  const coverInner = document.querySelector(".cover-inner");
  const coverImg   = coverInner.querySelector("img");
  const canvas     = document.getElementById("visualizer");

  /* -------------------- STATE -------------------- */
  let tracks = [];
  let currentTrack = 0;
  let isPlaying = false;
  let visualizerEnabled = false;

  /* -------------------- PLAYER STATE -------------------- */
const playerEl = document.querySelector(".player");

function setPlayerState(state) {
  playerEl.dataset.playerState = state;
}

  setPlayerState("paused"); 

  /* -------------------- DEVICE CHECK -------------------- */
  const isUltraLowEnd = (() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua) && navigator.hardwareConcurrency <= 4) return true;
    if (/Android.*(Go|Lite|M6)/i.test(ua)) return true;
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) return true;
    return false;
  })();

  /* -------------------- VISUALIZER -------------------- */
  function initVisualizer() {
    if (!canvas || isUltraLowEnd) return;
    WaveformVisualizer.init({ canvasEl: canvas, audio });
  }

  function enableVisualizer() {
    if (isUltraLowEnd || !canvas || visualizerEnabled) return;
    WaveformVisualizer.start();
    visualizerEnabled = true;
  }

  function disableVisualizer() {
    if (!visualizerEnabled) return;
    WaveformVisualizer.stop();
    visualizerEnabled = false;
  }

  /* -------------------- CONTROLS -------------------- */
  function togglePlay() {
    isPlaying ? audio.pause() : audio.play();
  }

  function nextTrack() {
    if (!tracks.length) return;
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack, true);
  }

  function prevTrack() {
    if (!tracks.length) return;
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack, true);
  }

  /* -------------------- TRACK LOADING + COVER FADE -------------------- */
  function loadTrack(index, autoplay = false) {
    const track = tracks[index];
    if (!track) return;

    let pendingColor = null;
    pendingColor = track.color;

    if (pendingColor) {
      WaveformVisualizer.setColor(pendingColor);
    }

    coverInner.classList.add("fade-out");

    setTimeout(() => {
      coverImg.src = track.cover;
      trackName.textContent = track.name;
      artistName.textContent = track.artist;

      coverInner.classList.remove("fade-out");
      coverInner.classList.add("fade-in");

      setTimeout(() => coverInner.classList.remove("fade-in"), 450);

      audio.src = track.src;
      audio.load();
      if (autoplay && isPlaying) audio.play();
    }, 300);
  }

  /* -------------------- AUDIO EVENTS -------------------- */
  audio.addEventListener("play", () => {
    isPlaying = true;
    setPlayerState("playing");
    enableVisualizer();
  });

  audio.addEventListener("pause", () => {
    isPlaying = false;
    setPlayerState("paused"); 
    disableVisualizer();
  });

  audio.addEventListener("ended", () => {
    setPlayerState("paused");
    disableVisualizer();
    nextTrack();
  });

  /* -------------------- DOM EVENTS -------------------- */
  playBtn?.addEventListener("click", togglePlay);
  nextBtn?.addEventListener("click", nextTrack);
  prevBtn?.addEventListener("click", prevTrack);

  document.addEventListener("keydown", e => {
    if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    }
    if (e.code === "ArrowRight") nextTrack();
    if (e.code === "ArrowLeft") prevTrack();
  });

  /* -------------------- VISIBILITY -------------------- */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) disableVisualizer();
    else if (isPlaying) enableVisualizer();
  });

  /* -------------------- INIT -------------------- */
  (async function init() {
    tracks = await fetch("/js/tracks.json").then(r => r.json());
    initVisualizer();
    loadTrack(0);
  })();
})();
