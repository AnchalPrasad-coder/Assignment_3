// Safe speed controls for audio/video elements
(() => {
  function findPlayer() {
    return document.querySelector('video, audio, #myVideo, .media-player');
  }

  function safeGet() {
    const p = findPlayer();
    if (!p) console.warn('speed.js: media element not found.');
    return p;
  }

  function decSpeed() {
    const p = safeGet();
    if (!p) return;
    p.playbackRate = Math.max(0.25, (p.playbackRate || 1) - 0.25);
  }

  function incSpeed() {
    const p = safeGet();
    if (!p) return;
    p.playbackRate = Math.min(4, (p.playbackRate || 1) + 0.25);
  }

  function twoXSpeed() {
    const p = safeGet();
    if (!p) return;
    p.playbackRate = 2;
  }

  function threeXSpeed() {
    const p = safeGet();
    if (!p) return;
    p.playbackRate = 3;
  }

  window.decSpeed = decSpeed;
  window.incSpeed = incSpeed;
  window.twoXSpeed = twoXSpeed;
  window.threeXSpeed = threeXSpeed;

  var decBtn = document.getElementById('decSpeedBtn');
  var incBtn = document.getElementById('incSpeedBtn');
  var x2Btn = document.getElementById('twoXBtn');

  if (decBtn) decBtn.addEventListener('click', decSpeed);
  if (incBtn) incBtn.addEventListener('click', incSpeed);
  if (x2Btn) x2Btn.addEventListener('click', twoXSpeed);
})();
