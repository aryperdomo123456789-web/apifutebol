export const GERADOR_MAGO_HTML = `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gerador Mago</title>
<style>
  :root {
    color-scheme: dark;
    --bg: #0b1020;
    --sidebar: #121a33;
    --sidebar-2: #0f1730;
    --panel: #111a30;
    --panel-2: #0d1428;
    --border: rgba(148, 166, 212, 0.18);
    --text: #eef3ff;
    --muted: #9ca7c7;
    --accent: #7c5cff;
    --accent-2: #4e8cff;
    --green: #1fc66c;
    --yellow: #f3c64f;
    --orange: #ff8a2a;
    --red: #ff5c5c;
    --shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  }
  * { box-sizing: border-box; }
  html, body { min-height: 100%; }
  body {
    margin: 0;
    font: 15px/1.45 "Segoe UI", system-ui, -apple-system, sans-serif;
    color: var(--text);
    background:
      radial-gradient(circle at top left, rgba(124, 92, 255, 0.18), transparent 34%),
      radial-gradient(circle at top right, rgba(78, 140, 255, 0.12), transparent 26%),
      linear-gradient(180deg, #0a1020 0%, #080d18 100%);
  }
  .shell {
    display: grid;
    grid-template-columns: 282px minmax(0, 1fr);
    min-height: 100vh;
  }
  .sidebar {
    background: linear-gradient(180deg, var(--sidebar), var(--sidebar-2));
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: sticky;
    top: 0;
  }
  .brand {
    padding: 28px 26px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .logo {
    font-size: 34px;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1;
  }
  .logo .pro { color: #ffc72b; }
  .brand small {
    display: block;
    margin-top: 12px;
    color: var(--muted);
    font-size: 13px;
  }
  .nav {
    padding: 18px 16px;
    display: grid;
    gap: 8px;
    overflow: auto;
    flex: 1;
  }
  .nav-group {
    margin-top: 10px;
  }
  .nav-group h3 {
    margin: 14px 12px 8px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .12em;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 14px;
    padding: 14px 14px;
    text-decoration: none;
    color: var(--text);
    background: transparent;
    transition: transform .15s ease, background .15s ease, border-color .15s ease;
    border: 1px solid transparent;
  }
  .nav-item:hover, .nav-item.active {
    background: linear-gradient(90deg, rgba(124, 92, 255, 0.95), rgba(78, 140, 255, 0.95));
    border-color: rgba(255,255,255,0.08);
    transform: translateX(2px);
  }
  .nav-item .ico {
    width: 28px;
    height: 28px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    font-weight: 800;
    color: #fff;
    background: rgba(255,255,255,0.12);
    flex: 0 0 auto;
  }
  .nav-item .meta {
    min-width: 0;
  }
  .nav-item .meta strong {
    display: block;
    font-size: 13px;
    line-height: 1.1;
  }
  .nav-item .meta span {
    display: block;
    margin-top: 3px;
    color: rgba(255,255,255,0.72);
    font-size: 11px;
  }
  .sidebar-foot {
    padding: 18px 20px 22px;
    border-top: 1px solid rgba(255,255,255,0.08);
    color: var(--muted);
  }
  .sidebar-foot a {
    color: #cfd8ff;
    text-decoration: none;
  }

  .main {
    padding: 28px 28px 36px;
  }
  .topbar {
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: space-between;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .headline h1 {
    margin: 0;
    font-size: clamp(28px, 4vw, 52px);
    line-height: .98;
    letter-spacing: -0.05em;
  }
  .headline p {
    margin: 12px 0 0;
    color: var(--muted);
    font-size: 18px;
  }
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 16px;
    text-decoration: none;
    color: white;
    background: linear-gradient(90deg, var(--accent-2), var(--accent));
    box-shadow: 0 16px 32px rgba(78, 140, 255, 0.22);
    font-weight: 700;
    white-space: nowrap;
  }
  .status-pill .dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.16);
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 18px 0 24px;
  }
  .toolbar a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--text);
    text-decoration: none;
    font-size: 13px;
  }
  .overview {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }
  .stat {
    background: linear-gradient(180deg, rgba(22, 31, 60, 0.96), rgba(13, 19, 37, 0.96));
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
    box-shadow: var(--shadow);
  }
  .stat .k {
    color: var(--muted);
    font-size: 12px;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .stat .v {
    margin-top: 12px;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.04em;
  }
  .stat .s {
    margin-top: 6px;
    color: var(--muted);
    font-size: 13px;
    overflow-wrap: anywhere;
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
    gap: 18px;
    align-items: start;
  }
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .feature {
    position: relative;
    min-height: 192px;
    padding: 20px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(26, 37, 74, 0.98), rgba(17, 25, 50, 0.98));
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    overflow: hidden;
    cursor: pointer;
  }
  .feature-disabled {
    opacity: 0.78;
  }
  .feature-disabled .icon {
    filter: saturate(0.8);
  }
  .feature::before {
    content: "";
    position: absolute;
    inset: -1px auto auto -1px;
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, rgba(255,255,255,0.14), transparent);
    transform: rotate(24deg);
    pointer-events: none;
  }
  .feature .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .feature .section {
    color: var(--muted);
    font-weight: 700;
    font-size: 14px;
  }
  .feature .icon {
    width: 58px;
    height: 58px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 20px;
    font-weight: 800;
    color: white;
    flex: 0 0 auto;
  }
  .feature .title {
    margin: 0;
    margin-top: 40px;
    font-size: 25px;
    line-height: 1.1;
    letter-spacing: -0.04em;
  }
  .feature .sub {
    margin: 10px 0 0;
    color: var(--muted);
    max-width: 35ch;
  }
  .feature.active {
    outline: 2px solid rgba(124, 92, 255, 0.4);
    box-shadow: 0 24px 50px rgba(124, 92, 255, 0.14);
  }
  .panel {
    background: linear-gradient(180deg, rgba(20, 29, 58, 0.98), rgba(12, 18, 37, 0.98));
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--shadow);
    padding: 20px;
  }
  .panel h2 {
    margin: 0 0 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--muted);
  }
  .detail-title {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    letter-spacing: -0.04em;
  }
  .detail-sub {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 15px;
  }
  .detail-grid {
    display: grid;
    gap: 12px;
    margin-top: 16px;
  }
  .detail-box {
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 14px;
  }
  .detail-box .k {
    color: var(--muted);
    font-size: 11px;
    letter-spacing: .1em;
    text-transform: uppercase;
  }
  .detail-box .v {
    margin-top: 8px;
    overflow-wrap: anywhere;
    color: var(--text);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    color: #dce4ff;
    background: rgba(255,255,255,0.03);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
  }
  th, td {
    text-align: left;
    padding: 11px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    vertical-align: top;
  }
  th {
    color: var(--muted);
    font-size: 11px;
    letter-spacing: .1em;
    text-transform: uppercase;
  }
  tr:last-child td { border-bottom: none; }
  code {
    font-size: 12px;
    display: inline-block;
    padding: 2px 8px;
    border-radius: 7px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .muted { color: var(--muted); }

  .skeleton {
    border-radius: 16px;
    min-height: 24px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.1), rgba(255,255,255,0.04));
    background-size: 220% 100%;
    animation: shimmer 1.4s linear infinite;
  }
  @keyframes shimmer {
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
  }
  @media (max-width: 1180px) {
    .shell { grid-template-columns: 1fr; }
    .sidebar { position: relative; min-height: auto; }
    .layout { grid-template-columns: 1fr; }
  }
  @media (max-width: 860px) {
    .main { padding: 18px; }
    .overview, .card-grid { grid-template-columns: 1fr; }
    .topbar { flex-direction: column; align-items: flex-start; }
  }
</style>
</head>
<body>
<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="logo">GERADOR<span class="pro">PRO</span></div>
      <small>Painel Administrativo do Gerador Mago</small>
    </div>
    <div class="nav" id="sidebar-nav">
      <div class="nav-item active">
        <div class="ico">⌂</div>
        <div class="meta"><strong>Carregando</strong><span>buscando menus do lab</span></div>
      </div>
    </div>
    <div class="sidebar-foot">
      <div class="muted">Acesso próprio baseado no lab legado.</div>
      <div style="margin-top:8px"><a href="/api/v1/admin/ui">Abrir painel da API</a></div>
      <div><a href="/api/v1/gerador-mago/routes">Ver rotas mapeadas</a></div>
    </div>
  </aside>

  <main class="main">
    <div class="topbar">
      <div class="headline">
        <h1 id="welcome">Bem-vindo!</h1>
        <p id="subtitle">O que você gostaria de fazer hoje?</p>
      </div>
      <a id="expiry" class="status-pill" href="/api/v1/gerador-mago/summary">
        <span class="dot"></span>
        <span>Carregando status...</span>
      </a>
    </div>

    <div class="toolbar">
      <a href="/api/v1/gerador-mago">Dashboard</a>
      <a href="/api/v1/gerador-mago/menu">Menu JSON</a>
      <a href="/api/v1/gerador-mago/routes">Rotas</a>
      <a href="/api/v1/gerador-mago/summary">Resumo</a>
      <a href="/api/v1/admin/ui">Painel API</a>
    </div>

    <section class="overview" id="overview">
      <div class="stat"><div class="skeleton" style="width:80px"></div></div>
      <div class="stat"><div class="skeleton" style="width:80px"></div></div>
      <div class="stat"><div class="skeleton" style="width:80px"></div></div>
      <div class="stat"><div class="skeleton" style="width:80px"></div></div>
    </section>

    <section class="layout">
      <div>
        <div class="card-grid" id="cards">
          <div class="feature"><div class="skeleton" style="width:120px; height:18px"></div></div>
          <div class="feature"><div class="skeleton" style="width:120px; height:18px"></div></div>
          <div class="feature"><div class="skeleton" style="width:120px; height:18px"></div></div>
          <div class="feature"><div class="skeleton" style="width:120px; height:18px"></div></div>
        </div>
      </div>

      <aside class="panel" id="detail">
        <h2>Carregando</h2>
        <p class="detail-title">Resumo do lab</p>
        <p class="detail-sub">Buscando dados do lab legado.</p>
        <div class="detail-grid">
          <div class="detail-box"><div class="k">Status</div><div class="v">...</div></div>
        </div>
      </aside>
    </section>

    <section class="panel" style="margin-top:18px">
      <h2>Rotas do Lab</h2>
      <table>
        <thead>
          <tr>
            <th>Tela</th>
            <th>Arquivo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="routes">
          <tr><td colspan="3" class="muted">Carregando rotas...</td></tr>
        </tbody>
      </table>
    </section>
  </main>
</div>

<script>
const state = {
  features: [],
  navigation: [],
  routes: [],
  activeId: null,
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
}

function labelFromFeature(feature) {
  return feature.title || feature.legacyLabel || 'Módulo';
}

function accentStyle(accent) {
  const map = {
    blue: 'background: linear-gradient(180deg, #4e8cff, #3767ff);',
    green: 'background: linear-gradient(180deg, #24c96d, #12a857);',
    red: 'background: linear-gradient(180deg, #ff6b6b, #ea3636);',
    orange: 'background: linear-gradient(180deg, #ff9f43, #ff7a1a);',
    purple: 'background: linear-gradient(180deg, #8c6bff, #6d4dff);',
    violet: 'background: linear-gradient(180deg, #8a42ff, #6d2ef7);',
    amber: 'background: linear-gradient(180deg, #f6c84f, #dca72a);',
    cyan: 'background: linear-gradient(180deg, #37d1ff, #1ba4e8);',
  };
  return map[accent] || map.blue;
}

function renderSidebar(data) {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = data.navigation.map(group => (
    '<div class="nav-group">' +
      '<h3>' + esc(group.section) + '</h3>' +
      group.items.map(item => (
        '<a href="#' + esc(item.id) + '" class="nav-item" data-target="' + esc(item.id) + '">' +
          '<div class="ico">' + esc(item.icon) + '</div>' +
          '<div class="meta">' +
            '<strong>' + esc(item.title) + '</strong>' +
            '<span>' + esc(item.subtitle) + '</span>' +
          '</div>' +
          (item.badge ? '<span class="chip" style="margin-left:auto;background:rgba(255,255,255,0.08)">' + esc(item.badge) + '</span>' : '') +
        '</a>'
      )).join('') +
    '</div>'
  )).join('');
  nav.querySelectorAll('[data-target]').forEach(a => {
    a.addEventListener('click', ev => {
      ev.preventDefault();
      selectFeature(a.getAttribute('data-target'));
    });
  });
}

function renderOverview(data) {
  const cards = [
    ['Rotas mapeadas', data.routeCount || 0, 'map.json sincronizado'],
    ['Módulos', data.moduleCount || (data.features || []).length || 0, 'cards do lab legado'],
    ['State', data.stateExists ? 'OK' : 'ausente', data.stateFile || 'state.json'],
    ['Extração', data.extractionExists ? 'OK' : 'ausente', data.extractionFile || 'mago_extraction.json'],
  ];
  document.getElementById('overview').innerHTML = cards.map(([k, v, s]) => (
    '<div class="stat">' +
      '<div class="k">' + esc(k) + '</div>' +
      '<div class="v">' + esc(v) + '</div>' +
      '<div class="s">' + esc(s) + '</div>' +
    '</div>'
  )).join('');
}

function renderCards(data) {
  const box = document.getElementById('cards');
  const features = data.features || [];
  box.innerHTML = features.map(feature => (
    '<article class="feature' + (feature.disabled ? ' feature-disabled' : '') + '" id="' + esc(feature.id) + '" data-feature="' + esc(feature.id) + '">' +
      '<div class="top">' +
        '<div class="section">' + esc(feature.section) + '</div>' +
        '<div class="icon" style="' + accentStyle(feature.accent) + '">' + esc(feature.icon) + '</div>' +
      '</div>' +
      (feature.badge ? '<span class="chip" style="position:absolute; top:18px; right:86px; background:rgba(255,255,255,0.07)">' + esc(feature.badge) + '</span>' : '') +
      '<h3 class="title">' + esc(feature.title) + '</h3>' +
      '<p class="sub">' + esc(feature.subtitle) + '</p>' +
      '<div class="chips">' +
        '<span class="chip">' + esc(feature.section) + '</span>' +
        '<span class="chip">' + esc(feature.legacyRoute === '—' ? 'sem rota' : 'rota pronta') + '</span>' +
      '</div>' +
    '</article>'
  )).join('');

  box.querySelectorAll('[data-feature]').forEach(card => {
    card.addEventListener('click', () => selectFeature(card.getAttribute('data-feature')));
  });
}

function renderRoutes(data) {
  const tbody = document.getElementById('routes');
  const features = data.features || [];
  tbody.innerHTML = features.map(feature => (
    '<tr>' +
      '<td>' + esc(feature.title) + '</td>' +
      '<td><code>' + esc(feature.legacyRoute || '—') + '</code></td>' +
      '<td>' + (feature.badge ? '<span class="chip">' + esc(feature.badge) + '</span>' : '<span class="chip">ativa</span>') + '</td>' +
    '</tr>'
  )).join('');
}

function renderDetail(feature, data) {
  const expiryText = data.expiresAt ? 'Vence em: ' + new Date(data.expiresAt).toLocaleDateString('pt-BR') : 'Lab local sem expiração definida';
  document.getElementById('expiry').innerHTML = '<span class="dot"></span><span>' + esc(expiryText) + '</span>';
  document.getElementById('welcome').textContent = 'Bem-vindo, ' + (data.owner || 'Mago') + '!';
  document.getElementById('subtitle').textContent = 'O que você gostaria de fazer hoje?';

  const detail = document.getElementById('detail');
  detail.innerHTML = (
    '<h2>' + esc(feature.section) + '</h2>' +
    '<p class="detail-title">' + esc(feature.title) + '</p>' +
    '<p class="detail-sub">' + esc(feature.subtitle) + '</p>' +
    '<div class="chips">' +
      feature.notes.map(note => '<span class="chip">' + esc(note) + '</span>').join('') +
    '</div>' +
    '<div class="detail-grid">' +
      '<div class="detail-box"><div class="k">Rota do legado</div><div class="v"><code>' + esc(feature.legacyRoute) + '</code></div></div>' +
      '<div class="detail-box"><div class="k">Base</div><div class="v"><code>' + esc(data.baseUrl || '—') + '</code></div></div>' +
      '<div class="detail-box"><div class="k">Arquivo local</div><div class="v"><code>' + esc(data.labDir || '—') + '</code></div></div>' +
    '</div>' +
    '<div class="toolbar" style="margin-top:16px">' +
      '<a href="/api/v1/admin/ui">Abrir admin</a>' +
      '<a href="/api/v1/gerador-mago/routes">Ver mapa</a>' +
      '<a href="/api/v1/gerador-mago/menu">Ver menu</a>' +
      (feature.disabled ? '<span class="chip">EM BREVE</span>' : '<a href="/api/v1/gerador-mago/open/' + esc(feature.id) + '" target="_blank" rel="noreferrer">Abrir módulo</a>') +
    '</div>' +
    '<table>' +
      '<thead><tr><th>Estado</th><th>Valor</th></tr></thead>' +
      '<tbody>' +
        '<tr><td>State</td><td>' + (data.stateExists ? 'presente' : 'ausente') + '</td></tr>' +
        '<tr><td>Extração</td><td>' + (data.extractionExists ? 'presente' : 'ausente') + '</td></tr>' +
        '<tr><td>Rede</td><td>' + (data.networkExists ? 'presente' : 'ausente') + '</td></tr>' +
      '</tbody>' +
    '</table>'
  );
}

function selectFeature(id) {
  const feature = state.features.find(item => item.id === id) || state.features[0];
  if (!feature) return;
  state.activeId = feature.id;
  document.querySelectorAll('.feature').forEach(node => {
    node.classList.toggle('active', node.getAttribute('data-feature') === feature.id);
  });
  document.querySelectorAll('.nav-item').forEach(node => {
    node.classList.toggle('active', node.getAttribute('data-target') === feature.id);
  });
  renderDetail(feature, state);
  const el = document.getElementById(feature.id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function boot() {
  const res = await fetch('/api/v1/gerador-mago/dashboard');
  const payload = await res.json();
  const data = payload.data || payload;
  state.features = data.features || [];
  state.navigation = data.navigation || [];
  state.routes = data.routes || [];
  renderSidebar(data);
  renderOverview(data);
  renderCards(data);
  renderRoutes(data);
  selectFeature(state.features[0]?.id);
}

boot().catch(err => {
  document.getElementById('detail').innerHTML = (
    '<h2>Erro</h2>' +
    '<p class="detail-title">Falha ao carregar</p>' +
    '<p class="detail-sub">' + esc(err.message) + '</p>'
  );
});
</script>
</body>
</html>`;
