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
})();
