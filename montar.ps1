# =========================================================
# MACEDO GOLD HOTEL - montar.ps1
# Junta as partes comuns (fonte\partes) com o conteudo de cada
# pagina (fonte\paginas) e gera os arquivos finais em site\.
#
# Como usar: de dois cliques em montar.cmd
# (ou rode: powershell -ExecutionPolicy Bypass -File montar.ps1)
#
# Nao edite os .html dentro de site\ direto: eles sao gerados aqui
# e serao substituidos na proxima montagem.
# =========================================================
$ErrorActionPreference = 'Stop'
$raiz  = Split-Path -Parent $MyInvocation.MyCommand.Path
$fonte = Join-Path $raiz 'fonte'
$site  = Join-Path $raiz 'site'
$utf8  = New-Object System.Text.UTF8Encoding($false)

function Ler($caminho) { [IO.File]::ReadAllText($caminho, $utf8) }

$config = Ler (Join-Path $fonte 'paginas.json') | ConvertFrom-Json
$dominio = "$($config.dominio)".Trim()
if ($dominio -and -not $dominio.EndsWith('/')) { $dominio += '/' }

$topo    = Ler (Join-Path $fonte 'partes\topo.html')
$rodape  = Ler (Join-Path $fonte 'partes\rodape.html')
$partes  = @{
  '{{RESERVA}}'  = Ler (Join-Path $fonte 'partes\reserva.html')
  '{{CHAMADA}}'  = Ler (Join-Path $fonte 'partes\chamada.html')
  '{{ESPECIAL}}' = Ler (Join-Path $fonte 'partes\noites-especiais.html')
}

$mapa = @()
foreach ($p in $config.paginas) {
  $cabeca = $topo.Replace('{{TITULO}}', $p.titulo).Replace('{{DESCRICAO}}', $p.descricao)
  $cabeca = $cabeca.Replace('{{INTRO}}', $(if ($p.abertura) { 'true' } else { 'false' }))
  $cabeca = $cabeca.Replace('{{URL_BASE}}', $dominio)

  $canonico = ''
  if ($dominio) {
    $endereco = if ($p.arquivo -eq 'index.html') { $dominio } else { $dominio + $p.arquivo }
    if ($p.arquivo -eq '404.html') { $canonico = "<base href=`"$dominio`">" }
    else { $canonico = "<link rel=`"canonical`" href=`"$endereco`">"; if (-not $p.foraDoMapa) { $mapa += $endereco } }
  }
  $cabeca = $cabeca.Replace('{{CANONICO}}', $canonico)

  # marca o item do menu da pagina atual
  $cabeca = $cabeca.Replace("<a href=`"$($p.arquivo)`">", "<a href=`"$($p.arquivo)`" aria-current=`"page`">")

  $miolo = Ler (Join-Path $fonte "paginas\$($p.arquivo)")
  foreach ($k in $partes.Keys) { $miolo = $miolo.Replace($k, $partes[$k]) }

  $final = $cabeca + "`n" + $miolo.TrimEnd() + "`n" + $rodape
  if ($final -match '\{\{[A-Z_]+\}\}') { throw "Sobrou um marcador sem substituir em $($p.arquivo): $($Matches[0])" }
  [IO.File]::WriteAllText((Join-Path $site $p.arquivo), $final, $utf8)
  Write-Host "ok  site\$($p.arquivo)"
}

# Mapa do site e robots.txt (o mapa so e gerado quando o dominio estiver preenchido)
$robots = "User-agent: *`nAllow: /`n"
if ($dominio) {
  $hoje = Get-Date -Format 'yyyy-MM-dd'
  $urls = ($mapa | ForEach-Object { "  <url><loc>$_</loc><lastmod>$hoje</lastmod></url>" }) -join "`n"
  $xml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n$urls`n</urlset>`n"
  [IO.File]::WriteAllText((Join-Path $site 'sitemap.xml'), $xml, $utf8)
  $robots += "Sitemap: ${dominio}sitemap.xml`n"
  Write-Host "ok  site\sitemap.xml"
}
[IO.File]::WriteAllText((Join-Path $site 'robots.txt'), $robots, $utf8)
Write-Host "ok  site\robots.txt"
Write-Host ""
Write-Host "Pronto. Abra site\index.html no navegador para conferir."
