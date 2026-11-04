/* =========================================================
   MACEDO GOLD HOTEL · animacoes.js
   Usa GSAP + ScrollTrigger. Se a biblioteca não carregar,
   o site continua funcionando, só que sem animações.
   ========================================================= */
(() => {
  const html = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { html.classList.remove('intro'); return; }
  gsap.registerPlugin(ScrollTrigger);
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = s => gsap.utils.toArray(s);

  /* ---------- Quebra títulos em palavras ---------- */
  function emPalavras(el, classe = 'p') {
    const percorre = no => {
      [...no.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(parte => {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
            const fora = document.createElement('span'); fora.className = classe;
            const dentro = document.createElement('span'); dentro.textContent = parte;
            fora.appendChild(dentro); frag.appendChild(fora);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') percorre(n);
      });
    };
    percorre(el);
    return el.querySelectorAll(`.${classe} > span`);
  }

  /* ---------- Entrada do topo ---------- */
  function entradaTopo() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    const h1 = document.querySelector('[data-titulo-topo]');
    if (h1) tl.from(emPalavras(h1), { yPercent: 115, duration: 1.2, stagger: .07 });
    tl.from('[data-topo]', { y: 28, opacity: 0, duration: 1, stagger: .1 }, '-=.9');
    $$('.colagem figure').forEach((f, i) => {
      tl.fromTo(f, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut' }, i ? '-=1.15' : '-=1.1');
      tl.from(f.querySelector('img'), { scale: 1.35, duration: 1.8 }, '<');
    });
    if (document.querySelector('.selo')) tl.from('.selo', { scale: 0, rotate: -120, duration: 1.2 }, '-=1');
    if (document.querySelector('.hero .reserva-barra')) tl.from('.hero .reserva-barra', { y: 40, opacity: 0, duration: 1 }, '-=1');
    return tl;
  }

  if (reduz) {
    html.classList.remove('intro');
  } else if (html.classList.contains('intro')) {
    const tl = gsap.timeline();
    // Abertura curta (cerca de 1,3 s) para não segurar quem tem pressa
    tl.from('.intro-tela img', { scale: .6, opacity: 0, rotate: -8, duration: .6, ease: 'expo.out' })
      .from('.intro-tela .marca-nome > *', { y: 14, opacity: 0, letterSpacing: '.5em', stagger: .08, duration: .6, ease: 'expo.out' }, '-=.35')
      .to('.intro-tela', { clipPath: 'inset(0 0 100% 0)', duration: .75, ease: 'expo.inOut' }, '+=.05')
      .add(() => { html.classList.remove('intro'); try { sessionStorage.setItem('mg-intro', '1'); } catch (e) {} ScrollTrigger.refresh(); }, '-=.1')
      .add(entradaTopo(), '-=.45');
  } else {
    entradaTopo();
  }
  if (reduz) return;

  /* ---------- Títulos de seção ---------- */
  $$('[data-titulo]').forEach(el => {
    gsap.from(emPalavras(el), { yPercent: 115, duration: 1.15, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: el, start: 'top 86%' } });
  });

  /* ---------- Blocos que sobem ---------- */
  const sobem = $$('[data-sobe]');
  gsap.set(sobem, { opacity: 0, y: 44 });
  ScrollTrigger.batch(sobem, {
    start: 'top 90%', once: true,
    onEnter: lote => gsap.to(lote, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .1, overwrite: true }),
  });

  /* ---------- Fotos que se revelam ---------- */
  $$('[data-revela]').forEach(el => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } });
    tl.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' });
    const img = el.querySelector('img');
    if (img) tl.from(img, { scale: 1.3, duration: 2, ease: 'expo.out' }, '<');
  });

  /* ---------- Profundidade (parallax) ---------- */
  $$('[data-paralaxe]').forEach(el => {
    const img = el.querySelector('img');
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  if (document.querySelector('.colagem')) {
    gsap.to('.colagem .foto-a', { y: -50, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.colagem .foto-b', { y: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Contadores ---------- */
  $$('[data-contar]').forEach(el => {
    const alvo = +el.dataset.contar, suf = el.dataset.sufixo || '', obj = { v: 0 };
    el.textContent = '0' + suf;
    gsap.to(obj, { v: alvo, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => { el.textContent = Math.round(obj.v) + suf; } });
  });

  /* ---------- Manifesto: palavras acendem ao rolar ---------- */
  $$('[data-acende]').forEach(el => {
    const ps = emPalavras(el, 'palavra-w');
    ps.forEach(s => s.classList.add('palavra'));
    gsap.to(ps, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: .6 } });
  });

  /* ---------- Suítes em rolagem horizontal (desktop) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    $$('[data-horizontal]').forEach(sec => {
      const trilho = sec.querySelector('.trilho-h');
      const barra = sec.querySelector('.progresso-h span');
      sec.classList.add('com-pin');
      const dist = () => Math.max(0, trilho.scrollWidth - window.innerWidth);
      gsap.to(trilho, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true,
          onUpdate: s => { if (barra) barra.style.transform = `scaleX(${s.progress})`; },
        },
      });
      return () => sec.classList.remove('com-pin');
    });
  });

  /* ---------- Brilho dourado (noites especiais) ---------- */
  document.querySelectorAll('[data-brilho]').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, pts = [], rodando = false, raf;
    const novo = inicio => ({ x: Math.random() * w, y: inicio ? Math.random() * h : h + 10, r: Math.random() * 1.8 + .4, v: Math.random() * .35 + .12, f: Math.random() * Math.PI * 2, a: Math.random() * .6 + .2 });
    const medir = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: Math.round(w * h / 14000) }, () => novo(true));
    };
    const quadro = t => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach((p, i) => {
        p.y -= p.v; p.x += Math.sin(t / 2400 + p.f) * .18;
        if (p.y < -10) pts[i] = novo(false);
        const brilho = p.a * (.55 + .45 * Math.sin(t / 700 + p.f));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 186, 132, ${brilho})`; ctx.fill();
        // halo suave sem shadowBlur (mais leve para o processador)
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 186, 132, ${brilho * .12})`; ctx.fill();
      });
      if (rodando) raf = requestAnimationFrame(quadro);
    };
    medir();
    window.addEventListener('resize', medir);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !rodando) { rodando = true; raf = requestAnimationFrame(quadro); }
      if (!e.isIntersecting) { rodando = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  });

  /* ---------- Luz dourada do topo segue o cursor (só com mouse) ---------- */
  const hero = document.querySelector('.hero');
  if (hero && matchMedia('(pointer: fine)').matches) {
    gsap.set(hero, { '--mx': '74%', '--my': '36%' });
    const mx = gsap.quickTo(hero, '--mx', { duration: .9, ease: 'power3.out' });
    const my = gsap.quickTo(hero, '--my', { duration: .9, ease: 'power3.out' });
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      mx(((e.clientX - r.left) / r.width * 100) + '%');
      my(((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ---------- Botões principais "puxados" de leve pelo cursor ---------- */
  if (matchMedia('(pointer: fine)').matches) {
    $$('.botao-ouro, .botao-escuro').forEach(b => {
      const x = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3.out' });
      const y = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3.out' });
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * .18);
        y((e.clientY - r.top - r.height / 2) * .3);
      });
      b.addEventListener('pointerleave', () => { x(0); y(0); });
    });
  }

  /* ---------- Assinatura do rodapé abre o espaçamento ao rolar ---------- */
  const assinatura = document.querySelector('.rodape-marca');
  if (assinatura) {
    gsap.from(assinatura.querySelectorAll('b, small'), {
      letterSpacing: '.04em', marginRight: '-.04em', opacity: .25, ease: 'none',
      scrollTrigger: { trigger: assinatura, start: 'top 95%', end: 'bottom 85%', scrub: .8 },
    });
    gsap.from(assinatura.querySelector('img'), {
      rotate: -90, scale: .4, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: assinatura, start: 'top 95%', end: 'top 55%', scrub: .8 },
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
