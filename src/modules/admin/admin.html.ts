// Painel administrativo estático — HTML/JS puro, sem build.
// Usa a própria API (API Key com escopos read:admin / write:admin).
export const ADMIN_HTML = `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<title>API FUT — Painel Admin</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  :root { color-scheme: dark; --bg:#0b1220; --panel:#111a2e; --border:#1f2b45;
          --text:#e5edff; --muted:#8aa0c8; --accent:#3ea6ff; --danger:#ff6b6b; --ok:#5cd6a6; }
  * { box-sizing:border-box; }
  body { margin:0; font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
         background:var(--bg); color:var(--text); }
  header { padding:16px 24px; border-bottom:1px solid var(--border);
           display:flex; align-items:center; gap:16px; background:var(--panel); }
  header h1 { font-size:18px; margin:0; }
  header .sp { flex:1; }
  main { padding:24px; max-width:1200px; margin:0 auto; }
  .grid { display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); }
  .card { background:var(--panel); border:1px solid var(--border);
          border-radius:12px; padding:16px; }
  .card h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--muted); letter-spacing:.08em; }
  .card .v { font-size:28px; font-weight:600; }
  section { margin-top:32px; }
  section h2 { font-size:15px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
  table { width:100%; border-collapse:collapse; background:var(--panel);
          border:1px solid var(--border); border-radius:12px; overflow:hidden; }
  th,td { padding:10px 12px; text-align:left; border-bottom:1px solid var(--border); font-size:13px; }
  th { background:#0f1830; font-weight:600; color:var(--muted); text-transform:uppercase; font-size:11px; letter-spacing:.06em; }
  tr:last-child td { border-bottom:none; }
  input,select,button,textarea { background:#0f1830; color:var(--text);
          border:1px solid var(--border); border-radius:8px; padding:8px 10px; font:inherit; }
  button { cursor:pointer; }
  button.primary { background:var(--accent); color:#001629; border-color:var(--accent); font-weight:600; }
  button.danger { background:transparent; color:var(--danger); border-color:var(--danger); }
  .row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px;
          border:1px solid var(--border); color:var(--muted); }
  .pill.ok { color:var(--ok); border-color:#1a4c3a; }
  .pill.err { color:var(--danger); border-color:#4c1a1a; }
  code { background:#0f1830; padding:2px 6px; border-radius:4px; font-size:12px; }
  .toast { position:fixed; bottom:20px; right:20px; background:var(--panel);
          border:1px solid var(--border); padding:12px 16px; border-radius:8px; display:none; }
  .toast.show { display:block; }
  .toast.err { border-color:var(--danger); }
  #login { max-width:420px; margin:80px auto; }
  #login .card { padding:24px; }
  .hint { color:var(--muted); font-size:12px; margin-top:8px; }
</style>
</head>
<body>
<div id="login" style="display:none">
  <div class="card">
    <h2 style="margin-top:0">API FUT — Login Admin</h2>
    <p class="hint">Cole uma API Key com escopo <code>read:admin</code> e/ou <code>write:admin</code>.</p>
    <div class="row">
      <input id="k" placeholder="fut_xxxx.yyyy..." style="flex:1" />
      <button class="primary" onclick="login()">Entrar</button>
    </div>
  </div>
</div>

<header id="app" style="display:none">
  <h1>API FUT — Painel</h1>
  <span class="pill ok">v1</span>
  <span class="sp"></span>
  <span id="who" class="pill"></span>
  <a href="/api/v1/gerador-mago" class="pill" style="text-decoration:none;color:var(--text)">Gerador Mago</a>
  <button onclick="logout()">Sair</button>
</header>

<main id="mainc" style="display:none">
  <section>
    <div class="grid" id="overview"></div>
  </section>

  <section>
    <h2>API Keys</h2>
    <div class="card">
      <div class="row" style="margin-bottom:12px">
        <input id="nk-name" placeholder="nome (ex: mobile-app)" />
        <input id="nk-owner" placeholder="dono (opcional)" />
        <input id="nk-scopes" placeholder="scopes: read:public,read:matches" style="flex:1" value="read:public,read:matches,read:media" />
        <input id="nk-rpm" type="number" value="60" style="width:80px" title="req/min" />
        <button class="primary" onclick="createKey()">Criar chave</button>
      </div>
      <table>
        <thead><tr><th>Prefix</th><th>Nome</th><th>Scopes</th><th>RPM</th><th>Status</th><th>Último uso</th><th></th></tr></thead>
        <tbody id="keys"></tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>Fontes</h2>
    <div class="card"><table><thead><tr><th>Slug</th><th>Nome</th><th>Kind</th><th>Prio</th><th>Ativa</th></tr></thead>
    <tbody id="sources"></tbody></table></div>
  </section>

  <section>
    <h2>Ingestion Runs (últimos 100)</h2>
    <div class="card"><table><thead><tr><th>ID</th><th>Fonte</th><th>Job</th><th>Status</th><th>Início</th><th>Fim</th><th>Upserted</th></tr></thead>
    <tbody id="runs"></tbody></table></div>
  </section>

  <section>
    <h2>Media Packs (últimos)</h2>
    <div class="card"><table><thead><tr><th>Match ID</th><th>Version hash</th><th>Atualizado</th></tr></thead>
    <tbody id="packs"></tbody></table></div>
  </section>
</main>

<div class="toast" id="toast"></div>

<script>
const API = '/api/v1';
let KEY = localStorage.getItem('apifut.key') || '';

function toast(msg, err) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
  setTimeout(() => t.classList.remove('show'), 3500);
}
async function api(path, opts = {}) {
  opts.headers = { 'x-api-key': KEY, 'content-type': 'application/json', ...(opts.headers||{}) };
  const r = await fetch(API + path, opts);
  if (!r.ok) { const t = await r.text(); throw new Error(r.status + ': ' + t); }
  return r.json();
}
function login() {
  KEY = document.getElementById('k').value.trim();
  localStorage.setItem('apifut.key', KEY);
  boot();
}
function logout() {
  localStorage.removeItem('apifut.key'); location.reload();
}
async function boot() {
  if (!KEY) { document.getElementById('login').style.display='block'; return; }
  try {
    const ov = await api('/admin/overview');
    document.getElementById('login').style.display='none';
    document.getElementById('app').style.display='flex';
    document.getElementById('mainc').style.display='block';
    document.getElementById('who').textContent = KEY.slice(0,12) + '…';
    renderOverview(ov.data);
    await Promise.all([loadKeys(), loadSources(), loadRuns(), loadPacks()]);
  } catch (e) {
    document.getElementById('login').style.display='block';
    document.getElementById('app').style.display='none';
    document.getElementById('mainc').style.display='none';
    toast('Falha ao autenticar: ' + e.message, true);
  }
}
function renderOverview(d) {
  const el = document.getElementById('overview');
  const cards = [
    ['Status', d.status || 'ok'],
    ['API Keys', d.keys], ['Fontes', d.sources],
    ['Ingestion Runs', d.runs], ['Snapshots', d.snapshots], ['Media Packs', d.packs],
  ];
  el.innerHTML = cards.map(([h,v]) => \`<div class="card"><h3>\${h}</h3><div class="v">\${v}</div></div>\`).join('');
}
async function loadKeys() {
  const r = await api('/admin/api-keys');
  document.getElementById('keys').innerHTML = r.data.map(k => \`
    <tr>
      <td><code>\${k.prefix}</code></td>
      <td>\${k.name}</td>
      <td>\${(k.scopes||[]).join(', ')}</td>
      <td>\${k.rate_limit_per_minute}</td>
      <td>\${k.active ? '<span class="pill ok">ativa</span>' : '<span class="pill err">revogada</span>'}</td>
      <td>\${k.last_used_at ? new Date(k.last_used_at).toLocaleString() : '—'}</td>
      <td>\${k.active ? \`<button class="danger" onclick="revoke('\${k.id}')">revogar</button>\` : ''}</td>
    </tr>\`).join('');
}
async function createKey() {
  const name = document.getElementById('nk-name').value.trim();
  const owner = document.getElementById('nk-owner').value.trim();
  const scopes = document.getElementById('nk-scopes').value.split(',').map(s => s.trim()).filter(Boolean);
  const rpm = parseInt(document.getElementById('nk-rpm').value, 10) || 60;
  if (!name) return toast('nome obrigatorio', true);
  try {
    const r = await api('/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name, owner: owner||null, scopes, rate_limit_per_minute: rpm }),
    });
    prompt('Chave gerada (guarde agora, nao sera exibida de novo):', r.data.raw_key);
    document.getElementById('nk-name').value = ''; document.getElementById('nk-owner').value = '';
    await loadKeys();
  } catch (e) { toast(e.message, true); }
}
async function revoke(id) {
  if (!confirm('Revogar esta chave?')) return;
  try { await api('/admin/api-keys/' + id, { method: 'DELETE' }); await loadKeys(); toast('chave revogada'); }
  catch (e) { toast(e.message, true); }
}
async function loadSources() {
  const r = await api('/admin/sources');
  document.getElementById('sources').innerHTML = r.data.map(s => \`
    <tr><td><code>\${s.slug}</code></td><td>\${s.name}</td><td>\${s.type||'—'}</td>
    <td>\${Number(s.enabled)===1 ? '<span class="pill ok">sim</span>' : '<span class="pill err">nao</span>'}</td></tr>\`).join('');
}
async function loadRuns() {
  const r = await api('/admin/runs');
  document.getElementById('runs').innerHTML = r.data.map(x => \`
    <tr><td>\${x.id}</td><td>\${x.source?.slug || '—'}</td><td>\${x.job_name || '—'}</td>
    <td>\${x.status || '—'}</td><td>\${x.started_at ? new Date(x.started_at).toLocaleString() : '—'}</td>
    <td>\${x.finished_at ? new Date(x.finished_at).toLocaleString() : '—'}</td>
    <td>\${x.items_upserted ?? 0}</td></tr>\`).join('');
}
async function loadPacks() {
  const r = await api('/media/packs');
  document.getElementById('packs').innerHTML = r.data.map(p => \`
    <tr><td>\${p.match_id}</td><td><code>\${p.version_hash.slice(0,12)}…</code></td>
    <td>\${new Date(p.updated_at).toLocaleString()}</td></tr>\`).join('');
}
boot();
</script>
</body></html>`;
