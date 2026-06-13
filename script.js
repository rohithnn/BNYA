/**
 * BNYA — Bharath Nava Yuva Association
 * Inauguration Landing Page — Animation Controller
 *
 * Sequence after "Reveal Banner" click:
 *  0.0s  — Landing screen fades out
 *  0.3s  — Rods appear and slide apart; parchment unrolls
 *  1.4s  — Logo fades in + scales up
 *  2.0s  — Typing animation starts
 *  ~4.5s — Full name displayed; 1s pause
 *  ~5.5s — Tagline fades in
 *  ~5.8s — Featured image fades in
 *  ~6.2s — Footer fades in
 */

(function () {
  'use strict';

  /* ── DOM REFS ─────────────────────────────────────────── */
  const revealBtn       = document.getElementById('revealBtn');
  const landingScreen   = document.getElementById('landingScreen');
  const scrollStage     = document.getElementById('scrollStage');
  const rodTop          = document.getElementById('rodTop');
  const rodBottom       = document.getElementById('rodBottom');
  const scrollParchment = document.getElementById('scrollParchment');
  const logoWrap        = document.getElementById('logoWrap');
  const ngoNameEl       = document.getElementById('ngoName');
  const typeCursor      = document.getElementById('typeCursor');
  const ngoTagline      = document.getElementById('ngoTagline');
  const featuredWrap    = document.getElementById('featuredImageWrap');
  const scrollFooter    = document.getElementById('scrollFooter');

  /* ── CONSTANTS ───────────────────────────────────────── */
  const NGO_NAME     = 'BHARATH NAVA YUVA ASSOCIATION';
  const TYPE_DELAY   = 65;   // ms per character
  const POST_PAUSE   = 1000; // ms after full name before next step

  /* ── UTILITIES ───────────────────────────────────────── */

  /**
   * Returns a Promise that resolves after `ms` milliseconds.
   */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // (Helper functions for dynamic height sizing removed, as CSS flexbox layout handles unrolling centering natively)

  /* ── TYPING ANIMATION ────────────────────────────────── */

  /**
   * Types `text` character-by-character into `targetEl`.
   * Returns a Promise that resolves when done.
   */
  const typeText = (targetEl, text, delayMs) => {
    return new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        if (i < text.length) {
          targetEl.textContent += text[i];
          i++;
          setTimeout(tick, delayMs);
        } else {
          resolve();
        }
      };
      tick();
    });
  };

  /* ── MAIN REVEAL SEQUENCE ─────────────────────────────── */

  /**
   * Orchestrates the entire reveal sequence.
   * Called once when the user clicks "Reveal Banner".
   */
  const startReveal = async () => {
    // Disable button immediately to prevent double-trigger
    revealBtn.disabled = true;

    // ── STEP 1: Fade out landing screen ──────────────────
    landingScreen.classList.add('hidden');

    // ── STEP 2: Show scroll stage ─────────────────────────
    await wait(400);
    scrollStage.classList.add('visible');

    // ── STEP 3: Trigger parchment unroll ──────────────────
    await wait(100);
    rodTop.classList.add('unrolled');
    rodBottom.classList.add('unrolled');
    scrollParchment.classList.add('unrolled');

    // ── STEP 5: Reveal logo ───────────────────────────────
    // Wait for rods to travel enough to expose top of parchment
    await wait(1000);
    logoWrap.classList.add('revealed');

    // ── STEP 6: Start typing the NGO name ─────────────────
    await wait(600);
    ngoNameEl.textContent = '';   // clear any placeholder
    await typeText(ngoNameEl, NGO_NAME, TYPE_DELAY);

    // ── STEP 7: Pause after full name, then hide cursor ───
    await wait(POST_PAUSE);
    typeCursor.classList.add('hidden');

    // ── STEP 8: Fade in tagline ───────────────────────────
    ngoTagline.classList.add('revealed');
    await wait(300);

    // ── STEP 9: Fade in featured image ───────────────────
    featuredWrap.classList.add('revealed');
    await wait(600);

    // ── STEP 10: Fade in footer ────────────────────────────
    scrollFooter.classList.add('revealed');
  };

  /* ── EVENT LISTENER ──────────────────────────────────── */
  revealBtn.addEventListener('click', startReveal);

  // (Window resize listener removed as CSS flexbox layout automatically centers the unrolling scroll)

})();
