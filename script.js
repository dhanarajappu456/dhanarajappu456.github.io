/* ══════════════════════════════════════════════════════════
   Dhanaraj S — portfolio v4 · interactions
   ══════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer:fine)").matches;

  /* ═══════════ SOUND ENGINE (WebAudio, no files) ═══════════
     Off by default — browsers need a user gesture before audio,
     so the header toggle both enables and unlocks it.          */
  const sfx = (() => {
    let ctx = null, enabled = false;
    const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

    function tone({ freq = 440, dur = .08, type = "sine", vol = .12, slideTo = null, delay = 0 }) {
      if (!enabled) return;
      try {
        const a = ac(), t = a.currentTime + delay;
        const o = a.createOscillator(), g = a.createGain();
        o.type = type; o.frequency.setValueAtTime(freq, t);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + .008);
        g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(a.destination);
        o.start(t); o.stop(t + dur + .02);
      } catch (e) { /* audio unavailable — stay silent */ }
    }
    function noise({ dur = .05, vol = .05 }) {
      if (!enabled) return;
      try {
        const a = ac(), t = a.currentTime;
        const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const s = a.createBufferSource(); s.buffer = buf;
        const g = a.createGain(); g.gain.value = vol;
        const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 500;
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
      } catch (e) {}
    }
    return {
      get enabled() { return enabled; },
      toggle() {
        enabled = !enabled;
        if (enabled) { ac().resume?.(); this.chime(); }
        return enabled;
      },
      key()   { tone({ freq: 1600 + Math.random() * 700, dur: .025, type: "square", vol: .028 }); },
      blip()  { tone({ freq: 880, dur: .06, type: "sine", vol: .06 }); },
      whoosh(){ tone({ freq: 160, slideTo: 900, dur: .5, type: "sine", vol: .08 }); },
      stamp() { noise({ dur: .09, vol: .16 }); tone({ freq: 130, dur: .12, type: "triangle", vol: .14 }); },
      send()  { tone({ freq: 520, dur: .1, vol: .1 }); tone({ freq: 780, dur: .12, vol: .1, delay: .1 }); tone({ freq: 1040, dur: .16, vol: .1, delay: .2 }); },
      chime() { tone({ freq: 660, dur: .12, vol: .09 }); tone({ freq: 990, dur: .18, vol: .09, delay: .1 }); },
      tick()  { tone({ freq: 1200, dur: .03, type: "triangle", vol: .04 }); },
    };
  })();

  const soundBtn = $("#soundToggle");
  soundBtn?.addEventListener("click", () => {
    const on = sfx.toggle();
    soundBtn.classList.toggle("on", on);
    soundBtn.innerHTML = on
      ? '<i class="fa-solid fa-volume-high"></i>'
      : '<i class="fa-solid fa-volume-xmark"></i>';
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.title = on ? "Sound on" : "Sound off";
  });

  /* ─── year ─── */
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ─── boot overlay → reveals hero ─── */
  const boot = $("#bootOverlay");
  const bootText = $("#bootText");
  const bootMsgs = ["initialising portfolio.sys …", "loading skill modules …", "mounting /projects …", "ready."];
  let bi = 0;
  const bootTimer = setInterval(() => {
    bi++;
    if (bootText && bootMsgs[bi]) bootText.textContent = bootMsgs[bi];
    if (bi >= bootMsgs.length - 1) clearInterval(bootTimer);
  }, 380);

  let booted = false;
  function finishBoot() {
    if (booted) return;
    booted = true;
    boot?.classList.add("done");
    document.body.classList.add("booted");
    busOn();
    setTimeout(startType, reduced ? 0 : 900);
    /* open the laptop once it's actually on screen */
    if (laptopIO) laptopIO.observe(laptop); else openLaptop();
  }
  window.addEventListener("load", () => setTimeout(finishBoot, reduced ? 100 : 1500));
  setTimeout(finishBoot, 4000);   /* safety net if 'load' is slow (iframes, fonts) */

  /* ─── header / nav ─── */
  const header = $("#siteHeader");
  const navToggle = $("#navToggle");
  const nav = $("#primaryNav");
  function setNav(open) {
    nav?.classList.toggle("open", open);
    navToggle?.classList.toggle("open", open);
    navToggle?.setAttribute("aria-expanded", String(open));
    navToggle?.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    document.documentElement.style.overflow = open ? "hidden" : "";
  }
  navToggle?.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  $$("#primaryNav a").forEach(a => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav?.classList.contains("open")) { setNav(false); navToggle?.focus(); } });
  matchMedia("(min-width:1021px)").addEventListener?.("change", e => { if (e.matches) setNav(false); });

  const scrollUp = $("#scrollUp");
  const progressBar = $("#progressBar");
  const busFill = $("#busFill");
  const stations = $$(".station");
  const sections = $$("main section[id]");

  function busOn() { $("#eventBus")?.classList.add("on"); }

  let ticking = false;
  function onScroll() {
    ticking = false;
    header?.classList.toggle("scrolled", scrollY > 30);
    scrollUp?.classList.toggle("show", scrollY > 500);

    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    if (progressBar) progressBar.style.width = `${p * 100}%`;
    if (busFill) busFill.style.height = `${p * 100}%`;

    let curIdx = 0, curId = sections[0]?.id || "";
    sections.forEach((s, i) => { if (scrollY >= s.offsetTop - innerHeight * 0.45) { curIdx = i; curId = s.id; } });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) { curIdx = sections.length - 1; curId = sections[curIdx]?.id; }
    $$("#primaryNav a").forEach(a =>
      a.classList.toggle("active", a.getAttribute("href") === `#${curId}`));
    stations.forEach((st, i) => {
      st.classList.toggle("active", i === curIdx);
      st.classList.toggle("passed", i < curIdx);
    });
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ─── hero typewriter ─── */
  const tw = $("#typewriter");
  const phrases = ["react & scale", "survive failure", "ship real impact", "automate the boring", "think in events"];
  let pi = 0, ci = phrases[0].length, del = true, typeStarted = false;
  function type() {
    if (!tw) return;
    const word = phrases[pi];
    tw.textContent = word.slice(0, ci);
    if (!del && ci < word.length) { ci++; setTimeout(type, 70); }
    else if (!del) { del = true; setTimeout(type, 1700); }
    else if (ci > 0) { ci--; setTimeout(type, 38); }
    else { del = false; pi = (pi + 1) % phrases.length; setTimeout(type, 350); }
  }
  function startType() {
    if (typeStarted || !tw || reduced) return;
    typeStarted = true;
    setTimeout(type, 1500);   /* first phrase is already shown; hold it, then cycle */
  }

  /* ═══════════ LAPTOP ═══════════ */
  const laptop   = $("#laptop");
  const termBody = $("#terminalBody");
  const keyboard = $("#keyboard");
  const hint     = $("#laptopHint");
  let laptopOpened = false, termTimer = null, reopenTimer = null, runTimer = null;

  if (keyboard) for (let i = 0; i < 42; i++) keyboard.appendChild(document.createElement("i"));
  const keys = $$("#keyboard i");

  function rippleKeys() {
    if (reduced) return;
    keys.forEach((k, i) => {
      setTimeout(() => { k.classList.add("lit"); setTimeout(() => k.classList.remove("lit"), 260); }, i * 26);
    });
  }
  let keySoundGate = 0;
  function flickKey() {
    if (reduced || !keys.length) return;
    const k = keys[Math.floor(Math.random() * keys.length)];
    k.classList.add("lit");
    setTimeout(() => k.classList.remove("lit"), 130);
    if (++keySoundGate % 3 === 0) sfx.key();
  }

  const termScript = [
    { c: "t-prompt", t: "dhanaraj@portfolio:~$ " },
    { c: "t-cmd",    t: "whoami\n" },
    { c: "t-out",    t: "Software Engineer · Software Developer · AI Enthusiast\n" },
    { c: "t-prompt", t: "dhanaraj@portfolio:~$ " },
    { c: "t-cmd",    t: "cat skills.txt\n" },
    { c: "t-out",    t: "▸ Full-Stack   " }, { c: "t-dim", t: "React · Next.js · TypeScript · MERN\n" },
    { c: "t-out",    t: "▸ Backend      " }, { c: "t-dim", t: "Node · Spring Boot · REST · Microservices\n" },
    { c: "t-out",    t: "▸ Databases    " }, { c: "t-dim", t: "PostgreSQL · MongoDB · Redis\n" },
    { c: "t-out",    t: "▸ AI / LLM     " }, { c: "t-dim", t: "LangChain · RAG · Vector DBs · Agents\n" },
    { c: "t-out",    t: "▸ DevOps       " }, { c: "t-dim", t: "Docker · Kubernetes · AWS · CI/CD\n" },
    { c: "t-out",    t: "▸ CS Core      " }, { c: "t-dim", t: "DSA · OS · DBMS · System Design\n" },
    { c: "t-prompt", t: "dhanaraj@portfolio:~$ " },
    { c: "t-cmd",    t: "./hire_me.sh --role=SWE\n" },
    { c: "t-out",    t: "status: OPEN TO OPPORTUNITIES ✔\n" },
  ];

  function runTerminal() {
    if (!termBody) return;
    clearTimeout(termTimer);
    termBody.innerHTML = "";
    const cursor = document.createElement("span");
    cursor.className = "t-cursor";
    cursor.innerHTML = "&nbsp;";
    termBody.appendChild(cursor);

    if (reduced) {
      cursor.remove();
      termScript.forEach(seg => {
        const s = document.createElement("span");
        s.className = seg.c; s.textContent = seg.t;
        termBody.appendChild(s);
      });
      return;
    }

    let si = 0, chi = 0, span = null;
    (function step() {
      if (si >= termScript.length) return;
      const seg = termScript[si];
      if (!span) {
        span = document.createElement("span");
        span.className = seg.c;
        termBody.insertBefore(span, cursor);
      }
      span.textContent = seg.t.slice(0, ++chi);
      flickKey();
      termBody.scrollTop = termBody.scrollHeight;
      if (chi >= seg.t.length) { si++; chi = 0; span = null; }
      termTimer = setTimeout(step, seg.c === "t-cmd" ? 55 : 12);
    })();
  }

  function openLaptop() {
    if (laptopOpened || !laptop) return;
    laptopOpened = true;
    laptop.classList.add("open");
    sfx.whoosh();
    rippleKeys();
    runTimer = setTimeout(runTerminal, reduced ? 0 : 1300);
    setTimeout(() => hint?.classList.add("show"), 2600);
  }

  function replayLaptop() {
    if (!laptopOpened) { openLaptop(); return; }
    laptop.classList.remove("open");
    clearTimeout(termTimer); clearTimeout(reopenTimer); clearTimeout(runTimer);
    reopenTimer = setTimeout(() => {
      laptop.classList.add("open");
      sfx.whoosh();
      rippleKeys();
      runTimer = setTimeout(runTerminal, reduced ? 0 : 1300);
    }, 700);
  }
  laptop?.addEventListener("click", replayLaptop);
  laptop?.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); replayLaptop(); }
  });

  /* open the lid when the laptop scrolls into view (after boot) */
  const laptopIO = laptop && "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { laptopIO.disconnect(); openLaptop(); }
      }, { threshold: 0.35 })
    : null;

  /* laptop parallax follows cursor */
  const stage = $("#laptopStage");
  if (stage && laptop && !reduced && finePointer) {
    stage.addEventListener("pointermove", e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      laptop.style.transform = `rotateX(${6 - y * 6}deg) rotateY(${x * 8}deg)`;
    });
    stage.addEventListener("pointerleave", () => { laptop.style.transform = ""; });
  }

  /* ─── DECODE headings (scramble → settle), run once, always restores text ─── */
  const GLYPHS = "<>/{}[]=+*#01";
  function decode(el) {
    if (!el.dataset.orig) el.dataset.orig = el.textContent;
    const original = el.dataset.orig;
    if (reduced || el.dataset.decoded) { el.textContent = original; return; }
    el.dataset.decoded = "1";
    let frame = 0;
    const total = Math.min(26, Math.round(original.length * 0.9) + 10);
    (function scramble() {
      const progress = frame / total;
      el.textContent = original.split("").map((ch, i) => {
        if (ch === " " || ch === "\n" || ch === "." || ch === ",") return ch;
        return i / original.length < progress
          ? ch
          : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join("");
      frame++;
      if (frame <= total) requestAnimationFrame(scramble);
      else el.textContent = original;
    })();
  }
  $$(".decode").forEach(el => { el.dataset.orig = el.textContent; });

  /* ─── scroll reveal + per-element triggers ─── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      const h = e.target.matches(".decode") ? e.target : e.target.querySelector(".decode");
      if (h) decode(h);
      if (e.target.matches(".paper-wrap")) sfx.stamp();
      $$(".count", e.target).forEach(runCounter);
      io.unobserve(e.target);
    });
  }, { threshold: 0.16 });
  $$(".reveal, .decode, .paper-wrap").forEach(el => io.observe(el));

  /* ─── count-up stats ─── */
  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = target + suffix; return; }
    let cur = 0;
    const step = Math.max(1, Math.round(target / 50));
    (function tick() {
      cur = Math.min(target, cur + step);
      el.textContent = cur + suffix;
      if (cur < target) requestAnimationFrame(tick);
    })();
  }

  /* ─── card spotlight follows cursor ─── */
  $$(".project-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ─── gentle 3D tilt (mouse only) ─── */
  if (!reduced && finePointer) $$(".tilt").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  /* ─── magnetic buttons (mouse only) ─── */
  if (!reduced && finePointer) $$(".magnetic").forEach(btn => {
    btn.addEventListener("pointermove", e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });

  /* ─── hover / click sounds ─── */
  $$(".btn, .nav-cta").forEach(el => el.addEventListener("pointerenter", () => sfx.blip()));
  $$(".site-nav a, .station").forEach(el => el.addEventListener("click", () => sfx.tick()));
  $$(".project-card, .skill-box").forEach(el => el.addEventListener("pointerenter", () => sfx.tick()));

  /* ─── contact form ─── */
  const form = $("#contactForm");
  const sendBtn = $("#sendBtn");
  const formNote = $("#formNote");
  form?.addEventListener("submit", e => {
    /* FormSubmit can't receive posts from a page opened as file:// */
    if (location.protocol === "file:") {
      e.preventDefault();
      if (formNote) {
        formNote.hidden = false;
        formNote.textContent = "The form only sends from a hosted page. Run “python -m http.server 5500” in this folder and open http://localhost:5500, or use the live site.";
      }
      return;
    }
    sendBtn?.classList.add("sending");
    const label = sendBtn?.querySelector("span");
    if (label) label.textContent = "Sending…";
    sfx.send();
  });
  /* restore the button if the user comes back with the browser's back button */
  window.addEventListener("pageshow", e => {
    if (!e.persisted) return;
    sendBtn?.classList.remove("sending");
    const label = sendBtn?.querySelector("span");
    if (label) label.textContent = "Send message";
  });

  /* ─── LeetCode stats (live API → second API → fallback) ─── */
  const probCount = $("#probCount");
  const ringEls = { Easy: $("#ringEasy"), Medium: $("#ringMedium"), Hard: $("#ringHard") };
  const CIRC = 2 * Math.PI * 52;
  const LC_USER = "dan_stark123";

  function setRing(el, solved, total) {
    if (!el) return;
    const bar = el.querySelector(".bar");
    const label = el.querySelector(".ring-label span");
    const pct = total ? Math.min(1, solved / total) : 0;
    label.textContent = solved;
    requestAnimationFrame(() => { bar.style.strokeDashoffset = CIRC * (1 - pct); });
  }
  function applyStats(d) {
    if (probCount) countUp(probCount, d.totalSolved);
    setRing(ringEls.Easy,   d.easySolved,   d.totalEasy   || d.easySolved * 1.4);
    setRing(ringEls.Medium, d.mediumSolved, d.totalMedium || d.mediumSolved * 1.6);
    setRing(ringEls.Hard,   d.hardSolved,   d.totalHard   || d.hardSolved * 2);
    drawSpark();
  }
  function countUp(el, target) {
    if (reduced) { el.textContent = target; return; }
    let cur = 0;
    const step = Math.max(1, Math.round(target / 60));
    (function tick() {
      cur = Math.min(target, cur + step);
      el.textContent = cur;
      if (cur < target) requestAnimationFrame(tick);
    })();
  }

  function drawSpark() {
    const line = $("#sparkLine");
    if (!line) return;
    const pts = [];
    let y = 36;
    for (let x = 0; x <= 220; x += 10) {
      y = Math.max(6, Math.min(42, y + (Math.random() * 14 - 8)));
      pts.push(`${x},${y.toFixed(1)}`);
    }
    line.setAttribute("points", pts.join(" "));
    const len = line.getTotalLength ? line.getTotalLength() : 400;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = reduced ? 0 : len;
    if (!reduced) {
      line.style.transition = "stroke-dashoffset 1.8s ease .2s";
      requestAnimationFrame(() => requestAnimationFrame(() => { line.style.strokeDashoffset = "0"; }));
    }
  }

  const fallbackStats = {
    totalSolved: Number(probCount?.dataset.fallback || 1020),
    easySolved: 320, totalEasy: 880,
    mediumSolved: 540, totalMedium: 1850,
    hardSolved: 160, totalHard: 830,
  };

  function getJSON(url, ms = 7000) {
    const ctl = "AbortController" in window ? new AbortController() : null;
    const t = setTimeout(() => ctl?.abort(), ms);
    return fetch(url, ctl ? { signal: ctl.signal } : {})
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status)))
      .finally(() => clearTimeout(t));
  }
  const valid = d => d && Number.isFinite(d.totalSolved) && d.totalSolved > 0;

  function loadStats() {
    return getJSON(`https://leetcode-stats-api.herokuapp.com/${LC_USER}`)
      .then(d => (d.status === "success" && valid(d)) ? d : Promise.reject())
      .catch(() => getJSON(`https://alfa-leetcode-api.onrender.com/${LC_USER}/solved`, 9000)
        .then(d => {
          const s = { totalSolved: d.solvedProblem, easySolved: d.easySolved, mediumSolved: d.mediumSolved, hardSolved: d.hardSolved };
          return valid(s) ? s : Promise.reject();
        }));
  }

  const lcSection = $("#leetcode");
  if (lcSection && "IntersectionObserver" in window) {
    const lcObserver = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      lcObserver.disconnect();
      loadStats().then(applyStats).catch(() => applyStats(fallbackStats));
    }, { threshold: 0.3 });
    lcObserver.observe(lcSection);
  } else if (lcSection) {
    applyStats(fallbackStats);
  }

})();
