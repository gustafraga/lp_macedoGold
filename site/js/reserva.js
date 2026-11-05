/* =========================================================
   MACEDO GOLD HOTEL · reserva.js
   Calendário de período (check-in e check-out), hóspedes,
   escolha de suíte e ocasião especial. Gera a mensagem do WhatsApp.
   ========================================================= */
(() => {
  const MESES_A_FRENTE = 12;
  const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const fmtMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const fmtCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtLongo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  const hoje0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const chave = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const somaDias = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const noites = (a, b) => Math.round((b - a) / 864e5);
  const limpa = s => s.replace(/\.$/, '').replace(/\.,/g, ',');
  const curto = d => limpa(fmtCurto.format(d));
  const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

  function iniciar(raiz) {
    const $ = s => raiz.querySelector(s);
    const $$ = s => [...raiz.querySelectorAll(s)];
    const painelDatas = $('.painel-datas');
    const painelHosp = $('.painel-hospedes');
    const fundo = $('[data-fundo]');
    const meses = $('[data-meses]');
    const resumo = $('[data-resumo]');
    const titulo = $('[data-titulo-datas]');
    const campos = { entrada: $('[data-campo="entrada"]'), saida: $('[data-campo="saida"]'), hospedes: $('[data-campo="hospedes"]') };

    const est = {
      entrada: null, saida: null, modo: 'entrada',
      base: new Date(hoje0().getFullYear(), hoje0().getMonth(), 1),
      adultos: 2, criancas: 0, suite: 'Sem preferência', ocasiao: false,
    };
    let aberto = null, campoAtivo = null, soltarFoco = null;

    /* ---------- Abrir e fechar painéis ---------- */
    function abrir(painel, campo) {
      if (aberto && aberto !== painel) fechar(true);
      aberto = painel;
      painel.hidden = false;
      fundo.hidden = false;
      Object.values(campos).forEach(c => c.setAttribute('aria-expanded', 'false'));
      campo && campo.setAttribute('aria-expanded', 'true');
      campoAtivo = campo;
      if (window.gsap) {
        const celular = matchMedia('(max-width: 820px)').matches;
        gsap.fromTo(painel, celular ? { yPercent: 100 } : { opacity: 0, y: -10, scale: .98 },
          { yPercent: 0, opacity: 1, y: 0, scale: 1, duration: .5, ease: 'expo.out' });
        gsap.fromTo(fundo, { opacity: 0 }, { opacity: 1, duration: .3 });
      }
      if (matchMedia('(max-width: 820px)').matches) document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('painel-aberto');
      if (soltarFoco) soltarFoco();
      soltarFoco = window.MacedoGold?.prenderFoco ? window.MacedoGold.prenderFoco(painel) : null;
      const alvo = painel.querySelector('.cal-dia.inicio') || painel.querySelector('.cal-dia:not(:disabled)');
      (painel === painelDatas && alvo ? alvo : painel).focus({ preventScroll: true });
    }
    function fechar(imediato) {
      if (!aberto) return;
      const p = aberto;
      aberto = null;
      Object.values(campos).forEach(c => c.setAttribute('aria-expanded', 'false'));
      document.documentElement.style.overflow = '';
      document.documentElement.classList.remove('painel-aberto');
      if (soltarFoco) { soltarFoco(); soltarFoco = null; }
      if (!imediato && campoAtivo) campoAtivo.focus({ preventScroll: true });
      const fim = () => { p.hidden = true; fundo.hidden = true; };
      if (!imediato && window.gsap) {
        const celular = matchMedia('(max-width: 820px)').matches;
        gsap.to(p, { ...(celular ? { yPercent: 100 } : { opacity: 0, y: -8 }), duration: .3, ease: 'power2.in', onComplete: fim });
        gsap.to(fundo, { opacity: 0, duration: .3 });
      } else fim();
    }

    campos.entrada.addEventListener('click', () => { est.modo = 'entrada'; desenhar(); abrir(painelDatas, campos.entrada); });
    campos.saida.addEventListener('click', () => { est.modo = est.entrada ? 'saida' : 'entrada'; desenhar(); abrir(painelDatas, campos.saida); });
    campos.hospedes.addEventListener('click', () => abrir(painelHosp, campos.hospedes));
    fundo.addEventListener('click', () => fechar());
    $$('[data-fechar]').forEach(b => b.addEventListener('click', () => fechar()));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && aberto) fechar(); });
    document.addEventListener('pointerdown', e => {
      if (aberto && !matchMedia('(max-width: 820px)').matches && !raiz.contains(e.target)) fechar();
    });

    /* ---------- Calendário ---------- */
    function mesHTML(ano, mes) {
      const primeiro = new Date(ano, mes, 1);
      const total = new Date(ano, mes + 1, 0).getDate();
      const h = hoje0();
      const nomeMes = fmtMes.format(primeiro);
      let html = `<div class="cal-mes"><h4>${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</h4><div class="cal-grade">`;
      html += SEMANA.map(s => `<span class="cal-semana" aria-hidden="true">${s}</span>`).join('');
      for (let i = 0; i < primeiro.getDay(); i++) html += '<span class="cal-vazio"></span>';
      for (let d = 1; d <= total; d++) {
        const dt = new Date(ano, mes, d);
        const passado = dt < h;
        html += `<button type="button" class="cal-dia${+dt === +h ? ' hoje' : ''}" data-dia="${+dt}" ${passado ? 'disabled' : ''} aria-label="${limpa(fmtLongo.format(dt))}">${d}</button>`;
      }
      return html + '</div></div>';
    }

    function desenhar() {
      const b = est.base;
      meses.innerHTML = mesHTML(b.getFullYear(), b.getMonth()) + mesHTML(b.getFullYear(), b.getMonth() + 1);
      const inicioMes = new Date(hoje0().getFullYear(), hoje0().getMonth(), 1);
      $('[data-mes="-1"]').disabled = +b <= +inicioMes;
      $('[data-mes="1"]').disabled = noites(inicioMes, b) > 31 * (MESES_A_FRENTE - 2);
      marcar();
      atualizarTextos();
    }

    function marcar(previa) {
      const e = est.entrada && +est.entrada, s = est.saida && +est.saida;
      const fimPrevia = !s && previa && e && previa > e ? previa : null;
      $$('.cal-dia').forEach(btn => {
        const v = +btn.dataset.dia;
        btn.classList.toggle('inicio', v === e);
        btn.classList.toggle('tem-fim', v === e && !!(s || fimPrevia));
        btn.classList.toggle('fim', v === s);
        btn.classList.toggle('entre', !!(e && s && v > e && v < s));
        btn.classList.toggle('previa', !!(fimPrevia && v > e && v <= fimPrevia));
        btn.setAttribute('aria-pressed', String(v === e || v === s));
      });
    }

    meses.addEventListener('click', ev => {
      const btn = ev.target.closest('.cal-dia');
      if (!btn || btn.disabled) return;
      const d = new Date(+btn.dataset.dia);
      if (est.modo === 'entrada' || !est.entrada || d <= est.entrada) {
        est.entrada = d; est.saida = null; est.modo = 'saida';
      } else {
        est.saida = d; est.modo = 'entrada';
      }
      marcar();
      atualizarTextos();
    });
    meses.addEventListener('pointerover', ev => {
      const btn = ev.target.closest('.cal-dia');
      if (btn && est.entrada && !est.saida) marcar(+btn.dataset.dia);
    });
    meses.addEventListener('pointerleave', () => marcar());

    // Teclado: setas andam pelos dias (± 1 dia, ± 1 semana), trocando de mês quando precisa
    meses.addEventListener('keydown', ev => {
      const passos = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      const btn = ev.target.closest('.cal-dia');
      if (!btn || !(ev.key in passos)) return;
      ev.preventDefault();
      const alvo = somaDias(new Date(+btn.dataset.dia), passos[ev.key]);
      if (alvo < hoje0()) return;
      let el = meses.querySelector(`[data-dia="${+alvo}"]`);
      if (!el) {
        est.base = new Date(alvo.getFullYear(), alvo.getMonth() - (passos[ev.key] > 0 ? 1 : 0), 1);
        desenhar();
        el = meses.querySelector(`[data-dia="${+alvo}"]`);
      }
      if (el && !el.disabled) { el.focus(); if (est.entrada && !est.saida) marcar(+alvo); }
    });

    $$('[data-mes]').forEach(b => b.addEventListener('click', () => {
      est.base = new Date(est.base.getFullYear(), est.base.getMonth() + +b.dataset.mes, 1);
      desenhar();
      if (window.gsap) gsap.fromTo(meses, { opacity: 0, x: +b.dataset.mes * 14 }, { opacity: 1, x: 0, duration: .35, ease: 'power2.out' });
    }));

    $$('[data-atalho]').forEach(b => b.addEventListener('click', () => {
      const h = hoje0();
      if (b.dataset.atalho === 'hoje') { est.entrada = h; est.saida = somaDias(h, 1); }
      if (b.dataset.atalho === 'fds') { const sexta = somaDias(h, ((5 - h.getDay()) + 7) % 7); est.entrada = sexta; est.saida = somaDias(sexta, 2); }
      if (b.dataset.atalho === 'semana') { const ini = est.entrada && est.entrada >= h ? est.entrada : h; est.entrada = ini; est.saida = somaDias(ini, 7); }
      est.base = new Date(est.entrada.getFullYear(), est.entrada.getMonth(), 1);
      est.modo = 'entrada';
      desenhar();
    }));
    $('[data-limpar]').addEventListener('click', () => { est.entrada = est.saida = null; est.modo = 'entrada'; desenhar(); });
    $('[data-ok-datas]').addEventListener('click', () => {
      if (!est.entrada || !est.saida) { resumo.classList.add('tremer'); setTimeout(() => resumo.classList.remove('tremer'), 500); return; }
      fechar();
    });

    /* ---------- Hóspedes ---------- */
    const limites = { adultos: [1, 8], criancas: [0, 6] };
    function hospTexto() {
      let t = plural(est.adultos, 'adulto', 'adultos');
      if (est.criancas) t += `, ${plural(est.criancas, 'criança', 'crianças')}`;
      return t;
    }
    function atualizarHosp() {
      Object.keys(limites).forEach(k => {
        $(`[data-qtd="${k}"]`).textContent = est[k];
        $(`[data-menos="${k}"]`).disabled = est[k] <= limites[k][0];
        $(`[data-mais="${k}"]`).disabled = est[k] >= limites[k][1];
      });
      let t = hospTexto();
      if (est.suite !== 'Sem preferência') t += `, ${est.suite}`;
      campos.hospedes.querySelector('.rc-valor').textContent = t;
    }
    $$('[data-menos]').forEach(b => b.addEventListener('click', () => { est[b.dataset.menos]--; atualizarHosp(); }));
    $$('[data-mais]').forEach(b => b.addEventListener('click', () => { est[b.dataset.mais]++; atualizarHosp(); }));
    $$('input[data-suite]').forEach(r => r.addEventListener('change', () => { est.suite = r.value; atualizarHosp(); }));
    $('[data-ocasiao]').addEventListener('change', e => { est.ocasiao = e.target.checked; });
    $('[data-ok-hospedes]').addEventListener('click', () => fechar());

    // Botões de outras partes da página podem pré-selecionar a suíte ou a ocasião
    document.querySelectorAll('[data-escolher-suite]').forEach(b => b.addEventListener('click', ev => {
      ev.preventDefault();
      const r = raiz.querySelector(`input[data-suite][value="${b.dataset.escolherSuite}"]`);
      if (r) { r.checked = true; est.suite = r.value; }
      if (b.hasAttribute('data-com-ocasiao')) { const o = $('[data-ocasiao]'); o.checked = true; est.ocasiao = true; }
      atualizarHosp();
      raiz.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => campos.entrada.click(), 500);
    }));

    /* ---------- Botões "Reservar" do topo, da barra do celular e da chamada ---------- */
    const abrirDaqui = () => {
      // No celular o calendário abre como folha fixa: não precisa rolar.
      // No computador, só rola se a barra de reserva não estiver visível.
      const r = raiz.getBoundingClientRect();
      const visivel = r.top >= 80 && r.bottom <= window.innerHeight;
      if (matchMedia('(max-width: 820px)').matches || visivel) { campos.entrada.click(); return; }
      raiz.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => campos.entrada.click(), 500);
    };
    document.querySelectorAll('[data-abrir-reserva]').forEach(b => b.addEventListener('click', ev => {
      ev.preventDefault();
      abrirDaqui();
    }));
    if (location.hash === '#reservar') setTimeout(abrirDaqui, document.documentElement.classList.contains('intro') ? 1600 : 500);

    /* ---------- Textos ---------- */
    function atualizarTextos() {
      const ve = campos.entrada.querySelector('.rc-valor'), vs = campos.saida.querySelector('.rc-valor');
      ve.textContent = est.entrada ? curto(est.entrada) : 'Escolha a data';
      vs.textContent = est.saida ? curto(est.saida) : 'Escolha a data';
      ve.classList.toggle('vazio', !est.entrada);
      vs.classList.toggle('vazio', !est.saida);
      if (!est.entrada) { resumo.textContent = 'Escolha o dia da chegada.'; titulo.textContent = 'Quando você chega?'; }
      else if (!est.saida) { resumo.innerHTML = `Chegada em <b>${curto(est.entrada)}</b>. Agora escolha a saída.`; titulo.textContent = 'E quando vai embora?'; }
      else {
        const n = noites(est.entrada, est.saida);
        resumo.innerHTML = `<b>${plural(n, 'noite', 'noites')}</b>, de ${curto(est.entrada)} a ${curto(est.saida)}`;
        titulo.textContent = 'Datas escolhidas';
      }
    }

    /* ---------- Enviar ---------- */
    $('[data-enviar]').addEventListener('click', () => {
      if (!est.entrada || !est.saida) {
        [campos.entrada, campos.saida].forEach(c => { c.classList.add('tremer'); setTimeout(() => c.classList.remove('tremer'), 500); });
        campos.entrada.click();
        return;
      }
      const n = noites(est.entrada, est.saida);
      const linhas = [
        'Olá! Vim pelo site e quero consultar disponibilidade.',
        '',
        `Check-in: ${limpa(fmtLongo.format(est.entrada))}`,
        `Check-out: ${limpa(fmtLongo.format(est.saida))}`,
        `Noites: ${n}`,
        `Hóspedes: ${hospTexto()}`,
        `Suíte: ${est.suite}`,
      ];
      if (est.ocasiao) linhas.push('', 'É uma ocasião especial e gostaria de saber sobre a decoração.');
      window.open(window.MacedoGold.linkWhats(linhas.join('\n')), '_blank', 'noopener');
    });

    desenhar();
    atualizarHosp();
  }

  document.querySelectorAll('[data-reserva]').forEach(iniciar);
})();
