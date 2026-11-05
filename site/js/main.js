/* =========================================================
   MACEDO GOLD HOTEL · main.js
   Comportamentos gerais: links de contato, cabeçalho, menu,
   visor de fotos. Os contatos vêm de js/config.js.
   ========================================================= */
(() => {
  const H = window.HOTEL || {};
  const html = document.documentElement;

  window.MacedoGold = {
    linkWhats: msg => `https://wa.me/${H.whatsapp}?text=${encodeURIComponent(msg || H.mensagemPadrao || '')}`,
    prenderFoco,
  };

  /* ---------- Mantém o Tab dentro de um painel aberto (menu, visor, calendário) ---------- */
  function prenderFoco(caixa) {
    const sel = 'a[href], button:not([disabled]), input:not([disabled]), select, [tabindex]:not([tabindex="-1"])';
    const aoTeclar = e => {
      if (e.key !== 'Tab') return;
      const itens = [...caixa.querySelectorAll(sel)].filter(el => el.offsetParent !== null);
      if (!itens.length) return;
      const primeiro = itens[0], ultimo = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }

  /* ---------- Links de contato (valores em config.js) ---------- */
  document.querySelectorAll('[data-whats]').forEach(el => {
    el.href = window.MacedoGold.linkWhats(el.dataset.whats);
    el.target = '_blank';
    el.rel = 'noopener';
  });
  document.querySelectorAll('[data-ligar]').forEach(el => { el.href = `tel:${H.telefone}`; });
  document.querySelectorAll('[data-link]').forEach(el => {
    const v = H[el.dataset.link];
    if (!v) { el.closest('li') ? el.closest('li').hidden = true : el.hidden = true; return; }
    el.href = el.dataset.link === 'email' ? `mailto:${v}` : v;
  });
  document.querySelectorAll('[data-texto]').forEach(el => {
    const v = H[el.dataset.texto];
    if (v) el.textContent = v;
  });

  /* ---------- Cabeçalho: sólido ao rolar, some ao descer, barra de progresso ---------- */
  const topo = document.querySelector('.topo');
  if (topo) {
    let ultimo = 0, pedido = false;
    const aoRolar = () => {
      pedido = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      topo.style.setProperty('--progresso', max > 0 ? (y / max).toFixed(4) : 0);
      topo.classList.toggle('solido', y > 40 || !topo.classList.contains('topo-claro'));
      const travado = html.classList.contains('menu-aberto') || html.classList.contains('painel-aberto');
      if (!travado && y > 400 && y > ultimo + 4) topo.classList.add('escondido');
      if (y < ultimo - 4 || y < 400) topo.classList.remove('escondido');
      ultimo = y;
    };
    aoRolar();
    window.addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(aoRolar); } }, { passive: true });
  }

  /* ---------- Menu do celular ---------- */
  const menu = document.getElementById('menu');
  const botaoMenu = document.querySelector('.abrir-menu');
  if (menu && botaoMenu) {
    let soltar = null;
    const alternar = abrir => {
      menu.classList.toggle('aberto', abrir);
      html.classList.toggle('menu-aberto', abrir);
      botaoMenu.setAttribute('aria-expanded', String(abrir));
      botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
      html.style.overflow = abrir ? 'hidden' : '';
      if (abrir) {
        soltar = prenderFoco(topo);
        if (window.gsap) gsap.from(menu.querySelectorAll('a'), { y: 30, opacity: 0, stagger: .06, duration: .7, ease: 'expo.out', delay: .15 });
      } else if (soltar) { soltar(); soltar = null; }
    };
    botaoMenu.addEventListener('click', () => alternar(!menu.classList.contains('aberto')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => alternar(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('aberto')) { alternar(false); botaoMenu.focus(); }
    });
    matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches) alternar(false); });
  }

  /* ---------- Visor de fotos (galeria) ---------- */
  const fotos = [...document.querySelectorAll('[data-ampliar]')];
  const visor = document.querySelector('.visor');
  if (fotos.length && visor) {
    const img = visor.querySelector('img');
    const legenda = visor.querySelector('[data-legenda]');
    let atual = 0, soltar = null;
    const mostrar = i => {
      atual = (i + fotos.length) % fotos.length;
      const f = fotos[atual];
      img.src = f.dataset.ampliar;
      img.alt = f.dataset.titulo || '';
      legenda.textContent = `${f.dataset.titulo || ''} (${atual + 1} de ${fotos.length})`;
      if (window.gsap) gsap.fromTo(img, { opacity: 0, scale: .97 }, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' });
    };
    const fechar = () => {
      visor.hidden = true; html.style.overflow = '';
      if (soltar) { soltar(); soltar = null; }
      fotos[atual].focus();
    };
    fotos.forEach((f, i) => f.addEventListener('click', () => {
      visor.hidden = false; html.style.overflow = 'hidden'; mostrar(i);
      soltar = prenderFoco(visor);
      visor.querySelector('[data-visor-fechar]').focus();
    }));
    visor.querySelector('[data-visor-fechar]').addEventListener('click', fechar);
    visor.querySelector('[data-visor-ant]').addEventListener('click', () => mostrar(atual - 1));
    visor.querySelector('[data-visor-prox]').addEventListener('click', () => mostrar(atual + 1));
    visor.addEventListener('click', e => { if (e.target === visor || e.target.tagName === 'FIGURE') fechar(); });
    document.addEventListener('keydown', e => {
      if (visor.hidden) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowLeft') mostrar(atual - 1);
      if (e.key === 'ArrowRight') mostrar(atual + 1);
    });
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-ano]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
