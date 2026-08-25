/**
 * GameQuestHub — Companion Character ("Yuki")
 * -------------------------------------------------------------------------
 * Framework-agnostic. No dependencies. Pure SVG + CSS keyframes (see
 * theme-3d.css) driven by a tiny JS state machine.
 *
 * Usage:
 *   import { CompanionCharacter, bindPressEffect } from './companion-character.js';
 *   const yuki = new CompanionCharacter('#companion-slot');
 *   yuki.play('success');   // 'press' | 'success' | 'fail' | 'celebrate'
 *   bindPressEffect(document.querySelector('#btn-quest'), { companion: yuki, reaction: 'press' });
 *
 * Swapping the art later: everything here reads from COMPANION_SVG and the
 * .yuki-* class hooks in theme-3d.css. To use a commissioned/hand-drawn
 * character instead (e.g. a Live2D/Rive export or a sprite sheet), replace
 * _render() and keep the same play()/state-class contract — the rest of the
 * game code that calls yuki.play(...) does not need to change.
 */

const COMPANION_SVG = `
<svg class="yuki-svg" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Yuki, roh pemandu quest">
  <defs>
    <linearGradient id="yukiBodyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8B7CF6"/>
      <stop offset="100%" stop-color="#4CE0C4"/>
    </linearGradient>
    <filter id="yukiGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <ellipse class="yuki-core" cx="60" cy="82" rx="36" ry="32" fill="#4CE0C4" opacity="0.5" filter="url(#yukiGlow)"></ellipse>

  <g class="yuki-body">
    <ellipse class="yuki-arm-l" cx="20" cy="93" rx="8" ry="15" fill="url(#yukiBodyGrad)"></ellipse>
    <ellipse class="yuki-arm-r" cx="100" cy="93" rx="8" ry="15" fill="url(#yukiBodyGrad)"></ellipse>

    <path d="M60 18 C77 18 98 46 102 76 C106 108 86 136 60 136 C34 136 14 108 18 76 C22 46 43 18 60 18 Z" fill="url(#yukiBodyGrad)"></path>

    <ellipse cx="38" cy="94" rx="7" ry="4" fill="#FF9BC5" opacity="0.5"></ellipse>
    <ellipse cx="82" cy="94" rx="7" ry="4" fill="#FF9BC5" opacity="0.5"></ellipse>

    <g class="yuki-eyes">
      <ellipse class="yuki-eye-l" cx="45" cy="80" rx="6.5" ry="9" fill="#231B38"></ellipse>
      <ellipse class="yuki-eye-r" cx="75" cy="80" rx="6.5" ry="9" fill="#231B38"></ellipse>
      <circle cx="43" cy="76" r="2.3" fill="#fff" opacity="0.9"></circle>
      <circle cx="73" cy="76" r="2.3" fill="#fff" opacity="0.9"></circle>
    </g>

    <path class="yuki-mouth" d="M52 100 Q60 106 68 100" stroke="#231B38" stroke-width="2.5" fill="none" stroke-linecap="round"></path>
  </g>
</svg>`;

const MOUTHS = {
  idle: 'M52 100 Q60 106 68 100',
  press: 'M52 100 Q60 106 68 100',
  success: 'M48 98 Q60 120 72 98 Q60 108 48 98 Z',
  celebrate: 'M48 98 Q60 120 72 98 Q60 108 48 98 Z',
  fail: 'M48 103 Q54 98 60 103 Q66 108 72 103',
};

const CORE_COLORS = {
  idle: '#4CE0C4',
  press: '#4CE0C4',
  success: '#F5B942',
  celebrate: '#F5B942',
  fail: '#FF6B6B',
};

const DURATIONS = { press: 300, fail: 550, success: 750, celebrate: 1100 };

export class CompanionCharacter {
  constructor(container, options = {}) {
    this.root = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.root) throw new Error('CompanionCharacter: container not found — ' + container);

    this.name = options.name || 'Yuki';
    this._reactTimer = null;
    this._blinkTimer = null;

    this.root.classList.add('gq-companion', 'gq-companion-idle');
    this._render();
    this._scheduleBlink();
  }

  _render() {
    this.root.innerHTML = COMPANION_SVG;
    this._eyes = this.root.querySelector('.yuki-eyes');
    this._mouth = this.root.querySelector('.yuki-mouth');
    this._core = this.root.querySelector('.yuki-core');
  }

  _scheduleBlink() {
    const delay = 2200 + Math.random() * 2800;
    this._blinkTimer = setTimeout(() => {
      if (this._eyes) {
        this._eyes.classList.add('yuki-blink');
        setTimeout(() => this._eyes && this._eyes.classList.remove('yuki-blink'), 340);
      }
      this._scheduleBlink();
    }, delay);
  }

  /**
   * Play a reaction tied to a button/quest transition.
   * @param {'press'|'success'|'fail'|'celebrate'} state
   * @param {{duration?: number}} opts
   */
  play(state, opts = {}) {
    if (!MOUTHS[state]) state = 'press';
    const ms = opts.duration || DURATIONS[state] || 500;

    if (this._mouth) {
      this._mouth.setAttribute('d', MOUTHS[state]);
      this._mouth.setAttribute('fill', state === 'success' || state === 'celebrate' ? '#231B38' : 'none');
    }
    if (this._core) this._core.setAttribute('fill', CORE_COLORS[state]);

    const stateClass = `gq-companion-${state}`;
    this.root.classList.remove('gq-companion-press', 'gq-companion-success', 'gq-companion-fail', 'gq-companion-celebrate');
    void this.root.offsetWidth; // force reflow so re-triggering the same state restarts the animation
    this.root.classList.add(stateClass);

    clearTimeout(this._reactTimer);
    this._reactTimer = setTimeout(() => {
      this.root.classList.remove(stateClass);
      if (this._mouth) {
        this._mouth.setAttribute('d', MOUTHS.idle);
        this._mouth.setAttribute('fill', 'none');
      }
      if (this._core) this._core.setAttribute('fill', CORE_COLORS.idle);
    }, ms);

    if (state === 'success' || state === 'celebrate') this._burstSparkles();
  }

  _burstSparkles() {
    const glyphs = ['✦', '✧', '⭐'];
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('span');
      el.className = 'gq-sparkle';
      el.textContent = glyphs[i % glyphs.length];
      el.style.left = `${45 + Math.random() * 30}%`;
      el.style.top = `${28 + Math.random() * 20}%`;
      el.style.animationDelay = `${i * 40}ms`;
      this.root.appendChild(el);
      setTimeout(() => el.remove(), 1000 + i * 40);
    }
  }

  destroy() {
    clearTimeout(this._blinkTimer);
    clearTimeout(this._reactTimer);
    this.root.innerHTML = '';
  }
}

/**
 * Attach the physical 3D-press feel to any button, optionally triggering a
 * companion reaction in the same gesture.
 *
 * @param {HTMLElement} buttonEl
 * @param {{companion?: CompanionCharacter, reaction?: string}} opts
 */
export function bindPressEffect(buttonEl, opts = {}) {
  const { companion, reaction = 'press' } = opts;
  buttonEl.classList.add('btn-3d');

  const start = (e) => {
    buttonEl.classList.add('is-pressed');
    if (companion) companion.play(reaction);
    spawnRipple(buttonEl, e);
  };
  const end = () => buttonEl.classList.remove('is-pressed');

  buttonEl.addEventListener('pointerdown', start);
  buttonEl.addEventListener('pointerup', end);
  buttonEl.addEventListener('pointerleave', end);
  buttonEl.addEventListener('pointercancel', end);
}

function spawnRipple(buttonEl, e) {
  const rect = buttonEl.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'gq-press-ripple';
  const x = e && typeof e.clientX === 'number' ? e.clientX - rect.left : rect.width / 2;
  const y = e && typeof e.clientY === 'number' ? e.clientY - rect.top : rect.height / 2;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  if (!buttonEl.style.position) buttonEl.style.position = 'relative';
  buttonEl.style.overflow = 'hidden';
  buttonEl.appendChild(ripple);
  setTimeout(() => ripple.remove(), 520);
}
