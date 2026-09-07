/* ============================================================
   MARKING MINDZ — interactions
   Loaded with `defer`, so the DOM is ready when this runs
   (equivalent to the original end-of-body <script>).
   Wrapped in an IIFE to avoid leaking globals.
   ============================================================ */
(function () {
  'use strict';

  /* ---- Mobile drawer ---- */
  const drawer = document.getElementById('drawer');
  const openDrawer = () => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeDrawer = () => { drawer.classList.remove('open'); document.body.style.overflow = ''; };
  document.getElementById('burger').addEventListener('click', openDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq__item').forEach(item => {
    const q = item.querySelector('.faq__q');
    const a = item.querySelector('.faq__a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__a').style.maxHeight = null;
      });
      if (!isOpen) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---- Terminal play on view ---- */
  const term = document.getElementById('term');
  const termObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { term.classList.add('play'); termObs.disconnect(); } });
  }, { threshold: .3 });
  if (term) termObs.observe(term);

  /* ---- Scroll reveal (+ staggered groups) ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .14, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.r-up, .stagger').forEach(el => io.observe(el));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Scroll progress bar + nav condense ---- */
  const progress = document.getElementById('progress');
  const nav = document.querySelector('.nav');
  let ticking = false;
  function onScroll() {
    const st = window.scrollY || document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', st > 12);
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---- Stat count-up ---- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    if (reduced) { el.textContent = prefix + target.toFixed(dec) + suffix; return; }
    const dur = 1400; const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(tick);
  }
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); } });
  }, { threshold: .6 });
  document.querySelectorAll('.num[data-count]').forEach(el => countObs.observe(el));

  /* ---- Card cursor spotlight ---- */
  if (!reduced) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* ---- Terminal 3D tilt ---- */
    const termEl = document.getElementById('term');
    if (termEl) {
      const parent = termEl.parentElement;
      parent.addEventListener('pointermove', e => {
        const r = termEl.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - .5) * -6;
        const ry = ((e.clientX - r.left) / r.width - .5) * 8;
        termEl.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      parent.addEventListener('pointerleave', () => {
        termEl.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      });
    }
  }

  /* ========================================================
     QUOTE WIZARD + LIVE BUILD PREVIEW  (guarded — home only)
     ======================================================== */
  const qwiz = document.getElementById('qwiz');
  if (qwiz) {
    const form = document.getElementById('qwizForm');
    const slides = Array.from(form.querySelectorAll('.qwiz-slide'));
    const stepEls = Array.from(qwiz.querySelectorAll('.qwiz-step'));
    const lineEls = Array.from(qwiz.querySelectorAll('.qwiz-line i'));
    const backBtn = document.getElementById('qwizBack');
    const nextBtn = document.getElementById('qwizNext');
    const submitBtn = document.getElementById('qwizSubmit');
    const errorEl = document.getElementById('qwizError');
    const TOTAL = slides.length;
    let step = 1;

    const data = { project:'', platforms:[], goal:'', features:[], budget:'', timeline:'', name:'', company:'', country:'', phone:'', email:'' };

    /* ---- Country dial codes (India first) ---- */
    const countries = [
      ['India','+91'],['United States','+1'],['United Kingdom','+44'],['United Arab Emirates','+971'],
      ['Canada','+1'],['Australia','+61'],['Singapore','+65'],['Germany','+49'],['France','+33'],
      ['Netherlands','+31'],['Ireland','+353'],['Spain','+34'],['Italy','+39'],['Saudi Arabia','+966'],
      ['Qatar','+974'],['Kuwait','+965'],['Bahrain','+973'],['Oman','+968'],['Japan','+81'],
      ['China','+86'],['Hong Kong','+852'],['Malaysia','+60'],['Indonesia','+62'],['Philippines','+63'],
      ['Bangladesh','+880'],['Sri Lanka','+94'],['Nepal','+977'],['Pakistan','+92'],['South Africa','+27'],
      ['Nigeria','+234'],['Kenya','+254'],['Brazil','+55'],['Mexico','+52'],['New Zealand','+64'],
      ['Sweden','+46'],['Switzerland','+41'],['Other','+']
    ];
    const countrySel = document.getElementById('qwiz-country');
    countries.forEach(([name, code]) => {
      const o = document.createElement('option');
      o.value = name + ' (' + code + ')';
      o.textContent = code + '  ' + name;
      countrySel.appendChild(o);
    });
    data.country = countrySel.value = countries[0][0] + ' (' + countries[0][1] + ')';

    /* ---- Preview elements ---- */
    const buildUrl = document.getElementById('qwizBuildUrl');
    const buildTitle = document.getElementById('qwizBuildTitle');
    const buildMeta = document.getElementById('qwizBuildMeta');
    const buildBlocks = document.getElementById('qwizBuildBlocks');
    const buildEmpty = document.getElementById('qwizBuildEmpty');
    const buildPct = document.getElementById('qwizBuildPct');
    const buildProgress = document.getElementById('qwizBuildProgress');
    const devices = Array.from(document.querySelectorAll('.qwiz-build__device'));

    const slug = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    function renderPreview() {
      buildUrl.textContent = '— ' + (data.project ? slug(data.project) : 'your-project') +
        (data.platforms.includes('Web') || !data.platforms.length ? '.app' : '') + ' —';
      buildTitle.textContent = data.project ? 'Your ' + data.project : 'Your build';

      devices.forEach(d => d.classList.toggle('on', data.platforms.includes(d.dataset.plat)));

      buildMeta.innerHTML = '';
      [data.goal, data.timeline, data.budget].filter(Boolean).forEach(t => {
        const s = document.createElement('span'); s.className = 'qwiz-build__tag'; s.textContent = t; buildMeta.appendChild(s);
      });

      const wanted = data.features.slice();
      const existing = Array.from(buildBlocks.children).map(c => c.dataset.feat);
      Array.from(buildBlocks.children).forEach(c => { if (!wanted.includes(c.dataset.feat)) c.remove(); });
      wanted.forEach(f => {
        if (!existing.includes(f)) {
          const b = document.createElement('div');
          b.className = 'qwiz-build__block'; b.dataset.feat = f;
          b.innerHTML = '<span class="mk">[+]</span><span class="lbl">' + f + '</span><span class="shimmer"></span>';
          buildBlocks.appendChild(b);
        }
      });
      buildEmpty.style.display = (wanted.length || data.project) ? 'none' : 'grid';

      const signals = ['project','goal','budget','timeline','name','email'];
      let done = signals.filter(k => data[k]).length;
      if (data.platforms.length) done++;
      if (data.features.length) done++;
      const pct = Math.round((done / 8) * 100);
      buildProgress.style.width = pct + '%';
      buildPct.textContent = (pct >= 100 ? 'Ready to build · 100%' : 'Building… ' + pct + '%');
    }

    /* ---- Chip groups ---- */
    qwiz.querySelectorAll('.qwiz-chips').forEach(group => {
      const name = group.dataset.name;
      const multi = group.dataset.mode === 'multi';
      group.addEventListener('click', e => {
        const chip = e.target.closest('.qwiz-chip');
        if (!chip) return;
        if (multi) {
          chip.classList.toggle('is-sel');
          data[name] = Array.from(group.querySelectorAll('.qwiz-chip.is-sel')).map(c => c.dataset.value);
        } else {
          const wasSel = chip.classList.contains('is-sel');
          group.querySelectorAll('.qwiz-chip').forEach(c => c.classList.remove('is-sel'));
          if (!wasSel) { chip.classList.add('is-sel'); data[name] = chip.dataset.value; }
          else data[name] = '';
        }
        renderPreview();
      });
    });

    /* ---- Selects + inputs ---- */
    qwiz.querySelectorAll('.qwiz-select, .qwiz-input').forEach(el => {
      const name = el.dataset.name;
      if (!name) return;
      el.addEventListener('input', () => { data[name] = el.value.trim(); renderPreview(); });
    });

    /* ---- Step navigation ---- */
    function showStep(n) {
      step = Math.max(1, Math.min(TOTAL, n));
      slides.forEach(s => s.classList.toggle('is-active', +s.dataset.slide === step));
      stepEls.forEach(s => {
        const i = +s.dataset.step;
        s.classList.toggle('is-active', i === step);
        s.classList.toggle('is-done', i < step);
      });
      lineEls.forEach((b, i) => { b.style.width = (i < step - 1) ? '100%' : '0'; });
      backBtn.hidden = step === 1;
      nextBtn.hidden = step === TOTAL;
      submitBtn.hidden = step !== TOTAL;
      errorEl.hidden = true;
    }
    nextBtn.addEventListener('click', () => showStep(step + 1));
    backBtn.addEventListener('click', () => showStep(step - 1));

    /* ---- Submit ---- */
    function buildMailto() {
      const lines = [
        'New project brief from the Marking Mindz quote wizard:', '',
        'Project type: ' + (data.project || '—'),
        'Platforms: ' + (data.platforms.join(', ') || '—'),
        'Goal: ' + (data.goal || '—'),
        'Features: ' + (data.features.join(', ') || '—'),
        'Budget: ' + (data.budget || '—'),
        'Timeline: ' + (data.timeline || '—'), '',
        'Name: ' + data.name,
        'Company: ' + (data.company || '—'),
        'Contact: ' + data.country + ' ' + data.phone,
        'Email: ' + data.email
      ];
      const subject = 'Project brief — ' + (data.name || 'New enquiry') + (data.project ? ' (' + data.project + ')' : '');
      return 'mailto:hello@markingmindz.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      if (!data.name || !data.phone || !emailOk) { errorEl.hidden = false; return; }
      const mailto = buildMailto();
      document.getElementById('qwizDoneName').textContent = data.name.split(' ')[0];
      document.getElementById('qwizDoneEmail').textContent = data.email;
      document.getElementById('qwizDoneMail').href = mailto;
      // solid overlay covers the form/preview (kept in flow so the card keeps its height)
      document.getElementById('qwizDone').hidden = false;
      window.location.href = mailto;
    });

    showStep(1);
    renderPreview();
  }
})();
