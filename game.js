(() => {
  'use strict';

  const TEAMS = window.MLB_TEAMS;
  const SLOT_X = [17, 50, 83]; // posição horizontal (%) de cada vaga no telão
  const MAX_STRIKES = 3;

  const $ = (sel) => document.querySelector(sel);
  const els = {
    stage: $('#stage'),
    message: $('#message'),
    round: $('#hud-round'),
    score: $('#hud-score'),
    best: $('#hud-best'),
    strikes: $('#hud-strikes'),
    banner: $('#banner'),
    bannerCap: $('#banner-cap'),
    kicker: $('#banner-kicker'),
    teamName: $('#team-name'),
    next: $('#next-btn'),
    mute: $('#mute-btn'),
    startScreen: $('#start-screen'),
    startBtn: $('#start-btn'),
    capWall: $('#cap-wall'),
    endScreen: $('#end-screen'),
    endEyebrow: $('#end-eyebrow'),
    endTitle: $('#end-title'),
    endSub: $('#end-sub'),
    endScore: $('#end-score'),
    endBeaten: $('#end-beaten'),
    endBest: $('#end-best'),
    newRecord: $('#new-record'),
    beatenWall: $('#beaten-wall'),
    restartBtn: $('#restart-btn'),
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // localStorage pode estar bloqueado (aba anônima, preview): nunca deixar isso quebrar o jogo.
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* sem persistência */ }
    },
  };

  const state = {
    phase: 'idle', // idle | intro | shuffle | guess | reveal | over
    order: [],
    round: 0,
    score: 0,
    strikes: 0,
    streak: 0,
    best: Number(store.get('hs-best', 0)) || 0,
    beaten: [],
    ballCap: 0,
    slotOf: [0, 1, 2], // slotOf[boné] = vaga onde ele está agora
  };

  // ---------- Utilitários ----------
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const randInt = (n) => Math.floor(Math.random() * n);
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  // ---------- Desenho (SVG) ----------
  function capSVG(team) {
    const len = [...team.mark].length;
    const size = len === 1 ? 66 : len === 2 ? 52 : 44;
    const font = team.font === 'blackletter'
      ? "'UnifrakturMaguntia', 'Old English Text MT', serif"
      : "'Graduate', 'Arial Black', sans-serif";
    const fit = len >= 3 ? ' textLength="96" lengthAdjust="spacingAndGlyphs"' : '';
    const stroke = team.stroke
      ? ` stroke="${team.stroke}" stroke-width="5" stroke-linejoin="round" paint-order="stroke"`
      : '';
    const crown = 'M24 120 C22 62 56 22 100 22 C144 22 178 62 176 120 Z';
    const brim = 'M14 118 Q100 102 186 118 Q191 127 182 134 Q100 158 18 134 Q9 127 14 118 Z';
    const under = 'M18 134 Q100 158 182 134 Q178 141 168 144 Q100 164 32 144 Q22 141 18 134 Z';
    return `
<svg viewBox="0 0 200 165" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Boné ${team.name}">
  <path d="${crown}" fill="${team.crown}"/>
  <path d="M100 22 C86 44 80 82 79 120 M100 22 C114 44 120 82 121 120 M100 22 C70 34 50 70 46 118 M100 22 C130 34 150 70 154 118"
        fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2"/>
  <circle cx="62" cy="62" r="2.6" fill="rgba(0,0,0,.35)"/>
  <circle cx="138" cy="62" r="2.6" fill="rgba(0,0,0,.35)"/>
  <text x="100" y="${80 + size * 0.36}" text-anchor="middle" font-family="${font}" font-size="${size}"
        font-weight="700" fill="${team.logo}"${stroke}${fit}>${team.mark}</text>
  <path d="${crown}" fill="url(#capShade)" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>
  <ellipse cx="100" cy="23" rx="10" ry="5.5" fill="${team.crown}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
  <path d="M24 120 Q100 104 176 120" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="6"/>
  <path d="${under}" fill="${team.brim}"/>
  <path d="${under}" fill="rgba(0,0,0,.45)"/>
  <path d="${brim}" fill="${team.brim}"/>
  <path d="${brim}" fill="url(#brimShade)" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>
</svg>`;
  }

  const BALL_SVG = `
<svg class="ball" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="50" cy="50" r="46" fill="url(#ballShade)" stroke="#bdb6a4" stroke-width="2"/>
  <path d="M28 10 Q50 50 28 90 M72 10 Q50 50 72 90" fill="none" stroke="#c8102e" stroke-width="2.4"/>
  <path d="M28 10 Q50 50 28 90 M72 10 Q50 50 72 90" fill="none" stroke="#c8102e" stroke-width="7" stroke-dasharray="1.6 5.2"/>
</svg>`;

  // ---------- Som (Web Audio, sem arquivos) ----------
  const Sound = (() => {
    let ctx = null;
    let muted = store.get('hs-muted', '0') === '1';

    function ac() {
      if (!ctx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function tone(freq, dur, { type = 'square', vol = 0.1, when = 0, to = null } = {}) {
      const c = muted ? null : ac();
      if (!c) return;
      const t = c.currentTime + when;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }

    function noise(dur, { vol = 0.2, when = 0, type = 'bandpass', freq = 1200, q = 1 } = {}) {
      const c = muted ? null : ac();
      if (!c) return;
      const t = c.currentTime + when;
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = freq;
      filter.Q.value = q;
      const gain = c.createGain();
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filter).connect(gain).connect(c.destination);
      src.start(t);
    }

    return {
      get muted() { return muted; },
      toggle() {
        muted = !muted;
        store.set('hs-muted', muted ? '1' : '0');
        if (!muted) ac();
        return muted;
      },
      unlock() { if (!muted) ac(); },
      swoosh() { noise(0.14, { freq: 700 + Math.random() * 700, q: 0.7, vol: 0.12 }); },
      lift() { tone(520, 0.09, { type: 'triangle', vol: 0.12, to: 780 }); },
      drop() { tone(300, 0.08, { type: 'triangle', vol: 0.1, to: 180 }); },
      // Taco na bola + o clássico "Charge!" do órgão do estádio
      hit() {
        noise(0.07, { type: 'highpass', freq: 1800, vol: 0.5 });
        tone(1200, 0.05, { type: 'square', vol: 0.06 });
        const notes = [[392, 0.13], [523, 0.13], [659, 0.13], [784, 0.3], [659, 0.13], [784, 0.55]];
        let at = 0.15;
        for (const [f, d] of notes) {
          tone(f, d, { type: 'square', vol: 0.06, when: at });
          tone(f * 2, d, { type: 'triangle', vol: 0.03, when: at });
          at += d === 0.3 ? 0.34 : 0.15;
        }
      },
      strike() {
        tone(150, 0.55, { type: 'sawtooth', vol: 0.12 });
        tone(112, 0.55, { type: 'sawtooth', vol: 0.1, when: 0.04 });
      },
      win() {
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.25, { type: 'square', vol: 0.07, when: i * 0.14 }));
      },
    };
  })();

  // ---------- Montagem do telão ----------
  const slots = [0, 1, 2].map((i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'slot';
    el.tabIndex = -1;
    el.innerHTML = `<span class="shadow"></span>${BALL_SVG}<span class="cap"></span>`;
    el.style.left = `${SLOT_X[i]}%`;
    el.addEventListener('click', () => guess(i));
    els.stage.appendChild(el);
    return el;
  });
  const capOf = (i) => slots[i].querySelector('.cap');

  function renderCapWall(container, teams) {
    container.innerHTML = teams.map((t) => `<span title="${t.name}">${capSVG(t)}</span>`).join('');
  }

  // ---------- Placar / interface ----------
  function updateHud() {
    els.round.textContent = `${state.round}/${TEAMS.length}`;
    els.score.textContent = state.score;
    els.best.textContent = Math.max(state.best, state.score);
    [...els.strikes.children].forEach((dot, i) => dot.classList.toggle('on', i < state.strikes));
    els.strikes.setAttribute('aria-label', `${state.strikes} de ${MAX_STRIKES} strikes`);
  }

  function say(text, kind = '') {
    els.message.className = `message ${kind}`.trim();
    void els.message.offsetWidth; // reinicia a animação
    els.message.textContent = text;
  }

  function applyTeam(team) {
    const root = document.documentElement.style;
    root.setProperty('--crown', team.crown);
    root.setProperty('--brim', team.brim);
    root.setProperty('--logo', team.logo);
    root.setProperty('--accent', team.brim.toLowerCase() !== team.crown.toLowerCase() ? team.brim : team.logo);
    root.setProperty('--ink', luminance(team.crown) > 0.45 ? '#111111' : '#ffffff');

    els.kicker.textContent = `Rodada ${state.round} de ${TEAMS.length} · ${team.div}`;
    els.teamName.textContent = team.name;
    els.bannerCap.innerHTML = capSVG(team);
    els.banner.classList.remove('enter');
    void els.banner.offsetWidth;
    els.banner.classList.add('enter');
  }

  // ---------- Animações ----------
  function capsOut() {
    if (reduceMotion) return Promise.resolve();
    const anims = slots.map((_, i) => capOf(i).animate(
      [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-150%)', opacity: 0 }],
      { duration: 280, delay: i * 50, easing: 'cubic-bezier(.5,0,.9,.4)', fill: 'forwards' },
    ));
    return Promise.all(anims.map((a) => a.finished));
  }

  function capsIn() {
    const anims = slots.map((_, i) => {
      const cap = capOf(i);
      cap.getAnimations().forEach((a) => a.cancel());
      if (reduceMotion) return null;
      return cap.animate(
        [{ transform: 'translateY(-150%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 520, delay: i * 110, easing: 'cubic-bezier(.34,1.5,.64,1)', fill: 'backwards' },
      );
    }).filter(Boolean);
    setTimeout(() => Sound.drop(), 380);
    return Promise.all(anims.map((a) => a.finished));
  }

  async function lift(cap, hold) {
    slots[cap].classList.add('lifted');
    Sound.lift();
    await wait(380 + hold);
    slots[cap].classList.remove('lifted');
    await wait(400);
  }

  // Move um boné de uma vaga para outra em arco: um passa pela frente, o outro por trás.
  function moveSlot(el, from, to, duration, front) {
    const a = SLOT_X[from];
    const b = SLOT_X[to];
    el.style.zIndex = front ? 4 : 1;
    const anim = el.animate([
      { left: `${a}%`, transform: 'translateX(-50%) translateY(0) scale(1)' },
      { left: `${(a + b) / 2}%`, transform: `translateX(-50%) translateY(${front ? 9 : -13}%) scale(${front ? 1.07 : 0.9})`, offset: 0.5 },
      { left: `${b}%`, transform: 'translateX(-50%) translateY(0) scale(1)' },
    ], { duration, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });
    return anim.finished.then(() => {
      el.style.left = `${b}%`;
      el.style.zIndex = '';
      anim.cancel();
    });
  }

  // perm[vaga] = nova vaga do boné que está nela
  async function permute(perm, duration) {
    const capAtSlot = [0, 1, 2].map((s) => state.slotOf.indexOf(s));
    const moves = [];
    let n = 0;
    capAtSlot.forEach((cap, s) => {
      if (perm[s] === s) return;
      moves.push(moveSlot(slots[cap], s, perm[s], duration, n++ % 2 === 0));
      state.slotOf[cap] = perm[s];
    });
    Sound.swoosh();
    await Promise.all(moves);
  }

  // Dificuldade sobe a cada rodada: mais trocas, mais rápidas, e rotações de 3 bonés a partir da 8ª.
  function difficulty(round) {
    return {
      moves: Math.min(5 + Math.floor((round - 1) * 0.8), 26),
      duration: Math.max(200, Math.round(560 * 0.94 ** (round - 1))),
      rotateChance: round >= 8 ? Math.min(0.35, (round - 7) * 0.04) : 0,
    };
  }

  async function shuffleCaps(round) {
    const { moves, duration, rotateChance } = difficulty(round);
    let last = '';
    for (let i = 0; i < moves; i++) {
      let perm;
      if (Math.random() < rotateChance) {
        perm = Math.random() < 0.5 ? [1, 2, 0] : [2, 0, 1];
      } else {
        // evita repetir a mesma troca duas vezes seguidas (pareceria que nada mudou)
        let a, b, key;
        do {
          a = randInt(3);
          b = (a + 1 + randInt(2)) % 3;
          key = [a, b].sort().join();
        } while (key === last);
        last = key;
        perm = [0, 1, 2];
        perm[a] = b;
        perm[b] = a;
      }
      await permute(perm, duration);
    }
  }

  function confetti(slotEl, team) {
    if (reduceMotion) return;
    const stage = els.stage.getBoundingClientRect();
    const r = slotEl.getBoundingClientRect();
    const cx = r.left + r.width / 2 - stage.left;
    const cy = r.top + r.height * 0.6 - stage.top;
    const colors = [team.crown, team.brim, team.logo, '#ffffff', '#ffc94a'];
    for (let i = 0; i < 46; i++) {
      const p = document.createElement('i');
      p.className = 'confetti';
      p.style.background = colors[i % colors.length];
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      els.stage.appendChild(p);
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const dist = 90 + Math.random() * 190;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      p.animate([
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx * 1.2}px), calc(-50% + ${dy + 160}px)) rotate(${Math.random() * 900}deg)`, opacity: 0 },
      ], { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.15,.7,.4,1)' })
        .finished.then(() => p.remove());
    }
  }

  // ---------- Fluxo do jogo ----------
  function startGame() {
    Sound.unlock();
    state.order = shuffle(TEAMS.slice());
    state.round = 0;
    state.score = 0;
    state.strikes = 0;
    state.streak = 0;
    state.beaten = [];
    els.startScreen.hidden = true;
    els.endScreen.hidden = true;
    updateHud();
    nextRound();
  }

  async function nextRound() {
    els.next.hidden = true;
    const team = state.order[state.round];
    state.round += 1;
    state.phase = 'intro';
    updateHud();
    say('');

    await capsOut();
    slots.forEach((s, i) => {
      s.classList.remove('lifted', 'has-ball', 'correct', 'wrong');
      s.style.left = `${SLOT_X[i]}%`;
      s.tabIndex = -1;
      capOf(i).innerHTML = capSVG(team);
    });
    state.slotOf = [0, 1, 2];
    applyTeam(team);
    await capsIn();

    state.ballCap = randInt(3);
    slots[state.ballCap].classList.add('has-ball');
    say('Olho na bola!');
    await wait(450);
    await lift(state.ballCap, 1000);

    state.phase = 'shuffle';
    say('Embaralhando…');
    await shuffleCaps(state.round);

    state.phase = 'guess';
    els.stage.classList.add('guessing');
    slots.forEach((s) => { s.tabIndex = 0; });
    say('Onde está a bola?');
  }

  async function guess(cap) {
    if (state.phase !== 'guess') return;
    state.phase = 'reveal';
    els.stage.classList.remove('guessing');
    slots.forEach((s) => { s.tabIndex = -1; });

    const team = state.order[state.round - 1];
    const hit = cap === state.ballCap;
    slots[cap].classList.add('lifted', hit ? 'correct' : 'wrong');
    Sound.lift();
    await wait(380);

    if (hit) {
      state.streak += 1;
      const points = 100 * state.round + 50 * (state.streak - 1);
      state.score += points;
      state.beaten.push(team);
      say(`HOME RUN! +${points}`, 'hit');
      Sound.hit();
      confetti(slots[cap], team);
    } else {
      state.streak = 0;
      state.strikes += 1;
      say(state.strikes >= MAX_STRIKES ? 'STRIKE 3! Você está fora!' : `STRIKE ${state.strikes}!`, 'miss');
      Sound.strike();
      if (!reduceMotion) {
        els.stage.classList.remove('shake');
        void els.stage.offsetWidth;
        els.stage.classList.add('shake');
      }
      await wait(550);
      slots[state.ballCap].classList.add('lifted', 'correct');
      Sound.lift();
    }
    updateHud();

    if (state.strikes >= MAX_STRIKES) {
      await wait(1700);
      return finish(false);
    }
    if (state.round >= state.order.length) {
      await wait(1700);
      return finish(true);
    }
    els.next.hidden = false;
    els.next.focus({ preventScroll: true });
  }

  function finish(champion) {
    state.phase = 'over';
    const isRecord = state.score > state.best;
    if (isRecord) {
      state.best = state.score;
      store.set('hs-best', String(state.best));
    }
    updateHud();

    const lastTeam = state.order[state.round - 1];
    els.endEyebrow.textContent = champion ? 'Temporada completa' : 'Fim de jogo';
    els.endTitle.textContent = champion ? 'Campeão!' : 'Você está fora!';
    els.endSub.textContent = champion
      ? `Você passou pelos ${TEAMS.length} times da MLB. Isso é World Series.`
      : `Três strikes. Você caiu na rodada ${state.round}, contra o ${lastTeam.name}.`;
    els.endScore.textContent = state.score;
    els.endBeaten.textContent = state.beaten.length;
    els.endBest.textContent = state.best;
    els.newRecord.hidden = !(isRecord && state.score > 0);
    renderCapWall(els.beatenWall, state.beaten);
    els.beatenWall.hidden = state.beaten.length === 0;
    els.endScreen.hidden = false;
    els.restartBtn.focus({ preventScroll: true });
    if (champion) Sound.win();
  }

  // ---------- Eventos ----------
  els.startBtn.addEventListener('click', startGame);
  els.restartBtn.addEventListener('click', startGame);
  els.next.addEventListener('click', () => { if (state.phase === 'reveal') nextRound(); });

  function syncMute() {
    els.mute.textContent = Sound.muted ? '🔇' : '🔊';
    els.mute.setAttribute('aria-pressed', String(Sound.muted));
    els.mute.setAttribute('aria-label', Sound.muted ? 'Ligar som' : 'Desligar som');
  }
  els.mute.addEventListener('click', () => { Sound.toggle(); syncMute(); });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (state.phase === 'guess' && ['1', '2', '3'].includes(e.key)) {
      const cap = state.slotOf.indexOf(Number(e.key) - 1);
      guess(cap);
      return;
    }
    // Enter/Espaço em um botão focado já disparam o clique dele
    if ((e.key === 'Enter' || e.key === ' ') && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      if (!els.startScreen.hidden) startGame();
      else if (!els.endScreen.hidden) startGame();
      else if (!els.next.hidden) nextRound();
    }
  });

  // ---------- Tela inicial ----------
  syncMute();
  updateHud();
  renderCapWall(els.capWall, TEAMS);
  const preview = TEAMS[randInt(TEAMS.length)];
  slots.forEach((_, i) => { capOf(i).innerHTML = capSVG(preview); });
  applyTeam(preview);
  els.kicker.textContent = 'Hat Shuffle';
  els.teamName.textContent = 'Edição MLB';
  els.startBtn.focus({ preventScroll: true });
})();
