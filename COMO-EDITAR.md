# Como editar o site do Macedo Gold

Guia rápido para mudar contatos, textos, fotos e cores sem quebrar nada.

## A regra principal

As páginas finais ficam em `site/`, mas **não são editadas direto**. Elas são montadas a partir da pasta `fonte/`:

1. Edite o arquivo certo em `fonte/` (veja a tabela abaixo).
2. Dê dois cliques em **`montar.cmd`**.
3. Abra `site/index.html` no navegador para conferir.

Se você editar um `.html` dentro de `site/`, a próxima montagem apaga a mudança.

As exceções são contatos, fotos, cores e efeitos, que são editados direto em `site/` e não precisam de montagem.

## Onde está cada coisa

| Quero mudar... | Arquivo | Precisa montar? |
|---|---|---|
| WhatsApp, telefone, e-mail, Instagram, Facebook | `site/js/config.js` | Não |
| Uma foto | `site/assets/img/`: substitua pelo arquivo **com o mesmo nome** | Não |
| Cores | `site/css/base.css`, no bloco `:root` do início | Não |
| Ligar/desligar um efeito visual | `site/css/efeitos.css`: cada efeito é um bloco numerado | Não |
| Animações (velocidade, abertura) | `site/js/animacoes.js` | Não |
| Título e descrição para o Google | `fonte/paginas.json` | Sim |
| Domínio do site (gera mapa do site) | `fonte/paginas.json`, campo `dominio` | Sim |
| Texto de uma página | `fonte/paginas/<página>.html` | Sim |
| Menu, logo do cabeçalho | `fonte/partes/topo.html` | Sim |
| Rodapé, endereço, barra do celular | `fonte/partes/rodape.html` | Sim |
| Calendário de reserva (textos, quartos) | `fonte/partes/reserva.html` | Sim |
| Faixa "Lua de mel, aniversário ou surpresa?" | `fonte/partes/noites-especiais.html` | Sim |
| Chamada final "Reserve direto com o hotel" | `fonte/partes/chamada.html` | Sim |
| Perguntas frequentes | `fonte/paginas/contato.html` | Sim |

## Tarefas comuns

### Trocar o número do WhatsApp
Abra `site/js/config.js` e troque `whatsapp: '5574900000000'` pelo número real, só com dígitos: 55, DDD e número. Para o número aparecer escrito no rodapé, preencha também `whatsappTexto`, por exemplo `'(74) 99999-8888'`.

### Trocar uma foto
Salve a foto nova com **exatamente o mesmo nome** da antiga dentro de `site/assets/img/` e substitua. Tamanhos ideais:

| Arquivo | Tamanho ideal |
|---|---|
| `fachada.jpg` (topo do site) | 1600 px de largura |
| `suite-presidencial.jpg`, `quarto-master.jpg`, `quarto-duplo.jpg` | 1400 px, de preferência na vertical |
| `compartilhar.jpg` (prévia no WhatsApp) | 1200 × 630 px |

Quando trocar `buffet.jpg` e `hamburguer.jpg` por fotos reais, remova o aviso "ilustrativa": em `fonte/paginas/index.html` e `fonte/paginas/restaurante.html`, troque `<span class="ilustr">` por `<span>`. Depois rode `montar.cmd`.

### Adicionar um tipo de quarto
1. Em `fonte/paginas/index.html`, copie um bloco `<article class="card-suite">` inteiro e mude foto, nome e texto.
2. Em `fonte/paginas/suites.html`, copie um bloco `<article class="suite-bloco">`.
3. Em `fonte/partes/reserva.html`, copie uma linha `<label class="opcao">` para o quarto aparecer no calendário.
4. Rode `montar.cmd`.

### Adicionar uma pergunta frequente
Em `fonte/paginas/contato.html`, copie uma linha `<details>...</details>` e troque a pergunta e a resposta. Rode `montar.cmd`.

### Desligar um efeito
Em `site/css/efeitos.css`, apague ou comente (entre `/*` e `*/`) o bloco do efeito:

1. Luz que segue o cursor.
2. Fotos que respiram.
3. Reflexo no mármore.
4. Barra de progresso.
5. Assinatura do rodapé.
6. Transição entre páginas.

## Publicar

O site está no GitHub (gustafraga/lp_macedoGold) e o Vercel publica sozinho a cada envio. O arquivo `vercel.json` diz ao Vercel para usar a pasta `site/`. No painel do Vercel, deixe "Root Directory" vazio e "Framework Preset" como Other.

Para publicar uma mudança: rode `montar.cmd` (se mexeu em `fonte/`) e depois, na pasta Macedo Gold:

    git add -A
    git commit -m "o que mudou"
    git push

Antes de publicar a versão final, confira o `documentos/relatorio-pendencias.html`.

Quando o site tiver domínio, coloque-o em `fonte/paginas.json` e rode `montar.cmd`. Isso gera o `sitemap.xml` para o Google e corrige os links de compartilhamento.
