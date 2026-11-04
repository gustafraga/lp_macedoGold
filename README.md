# Macedo Gold Hotel

Site e identidade visual do Macedo Gold Hotel, em Xique-Xique (BA).

- **Ver o site:** abra `site/index.html` no navegador.
- **Editar:** leia `COMO-EDITAR.md`.
- **Publicar:** é automático pelo Vercel a cada `git push` (o `vercel.json` aponta para a pasta `site/`).

## Pastas

```
Macedo Gold/
├── README.md                      Este arquivo
├── COMO-EDITAR.md                 Guia para mudar contatos, textos, fotos e cores
├── montar.cmd                     Dois cliques: gera as páginas de site/ a partir de fonte/
├── montar.ps1                     O script que o montar.cmd executa
├── vercel.json                    Diz ao Vercel para publicar a pasta site/
│
├── fonte/                         ONDE OS TEXTOS SÃO EDITADOS
│   ├── paginas.json               Título e descrição (Google) de cada página, domínio
│   ├── paginas/                   Conteúdo de cada página (início, suítes, restaurante, contato, 404)
│   └── partes/                    Peças repetidas: topo, rodapé, reserva, chamada, noites especiais
│
├── site/                          O SITE PRONTO (é o que vai para a hospedagem)
│   ├── *.html                     Gerados pelo montar.cmd. Não edite aqui
│   ├── robots.txt                 Gerado pelo montar.cmd
│   ├── css/
│   │   ├── base.css               Cores da logo, fonte, espaçamentos
│   │   ├── componentes.css        Cabeçalho, botões, calendário, rodapé
│   │   ├── paginas.css            Seções de cada página
│   │   └── efeitos.css            Efeitos visuais, um bloco por efeito
│   ├── js/
│   │   ├── config.js              CONTATOS: WhatsApp, telefone, e-mail, redes
│   │   ├── main.js                Menu, cabeçalho, galeria
│   │   ├── reserva.js             Calendário de check-in/check-out
│   │   └── animacoes.js           Animações (GSAP)
│   └── assets/img, assets/logo    Fotos e símbolo da marca
│
├── marca/                         Guia de marca e arquivos da logo
├── documentos/                    Relatório do que o hotel ainda precisa enviar
└── arquivo/                       Versões antigas (só no computador, fora do GitHub)
```

## Observações

- As animações usam a biblioteca GSAP, carregada da internet. Sem conexão, o site funciona normalmente, só que sem animações.
- A transição suave entre páginas funciona nos navegadores mais novos (Chrome, Edge). Nos outros, a página só troca normalmente.
