/* ============ BEYBLADE X 百科 — app.js ============ */
'use strict';

const LS_KEYS = {
  collection: 'bx_collection_v1',
  notes: 'bx_notes_v1',
  events: 'bx_events_v1',
  battles: 'bx_battles_v1',
};

const store = {
  get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  },
  set(key, val){
    try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){ /* storage full or blocked */ }
  }
};

let DB = { blades: [], ratchets: [], bits: [] };

/* ---------- SVG top shape (used for badges, hero, lock diagram) ---------- */
function topSVG(colorHex, opts={}){
  const c = colorHex;
  const spin = opts.spin !== false;
  return `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g ${spin ? 'class="spin-g"' : ''} transform-origin="50 50">
      <polygon points="50,8 88,72 12,72" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="50" cy="54" r="16" fill="none" stroke="${c}" stroke-width="3"/>
      <circle cx="50" cy="54" r="5" fill="${c}"/>
      <line x1="50" y1="8" x2="50" y2="54" stroke="${c}" stroke-width="2" opacity=".6"/>
      <line x1="88" y1="72" x2="50" y2="54" stroke="${c}" stroke-width="2" opacity=".6"/>
      <line x1="12" y1="72" x2="50" y2="54" stroke="${c}" stroke-width="2" opacity=".6"/>
    </g>
  </svg>`;
}

/* ---------- Tab / screen navigation ---------- */
function initNav(){
  const tabs = document.querySelectorAll('nav.tabbar button');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(btn.dataset.target);
      if(target) target.classList.add('active');
      document.getElementById('search-wrap').style.display = (btn.dataset.target === 'screen-encyclopedia') ? 'block' : 'none';
      window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
      if(btn.dataset.target === 'screen-calendar') renderCalendar();
    });
  });
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ---------- Modal ---------- */
function openModal(titleHTML, bodyHTML){
  document.getElementById('modal-title').innerHTML = titleHTML;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-backdrop').classList.add('open');
}
function closeModal(){
  document.getElementById('modal-backdrop').classList.remove('open');
}

/* ============ 百科 Encyclopedia ============ */
const typeLabel = { attack:'攻擊型', defense:'防禦型', stamina:'耐久型', balance:'均衡型', standard:'標準', simple:'簡易型', special:'特殊型' };
const typeClass = { attack:'tag-attack', defense:'tag-defense', stamina:'tag-stamina', balance:'tag-balance', standard:'tag-balance', simple:'tag-simple', special:'tag-special' };
const catLabel = { blade:'Blade', ratchet:'Ratchet', bit:'Bit' };
const catColor = { blade:'#00fff2', ratchet:'#ff2fd0', bit:'#7b2ff7' };
const catKey = { blade:'blades', ratchet:'ratchets', bit:'bits' };

let currentPartTab = 'blade';
let currentPartFilter = 'all';

function escapeHTML(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function highlightMatch(text, q){
  const safe = escapeHTML(text || '');
  if(!q) return safe;
  const idx = safe.toLowerCase().indexOf(q.toLowerCase());
  if(idx === -1) return safe;
  return safe.slice(0, idx) + `<mark class="hi">${safe.slice(idx, idx+q.length)}</mark>` + safe.slice(idx+q.length);
}

function renderPartFilters(){
  const wrap = document.getElementById('part-filters');
  const types = currentPartTab === 'blade' ? ['all','attack','defense','stamina','balance']
              : currentPartTab === 'bit' ? ['all','attack','defense','stamina','balance']
              : ['all','standard','simple','special'];
  wrap.innerHTML = types.map(t => `<button class="chip ${t===currentPartFilter?'active':''}" data-t="${t}">${t==='all'?'全部':typeLabel[t]}</button>`).join('');
  wrap.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => { currentPartFilter = chip.dataset.t; renderPartList(); renderPartFilters(); });
  });
}

function renderPartList(query){
  const list = document.getElementById('part-list');
  const q = (query || document.getElementById('search-input').value || '').trim().toLowerCase();

  // 有搜尋字詞時：跨 Blade／Ratchet／Bit 三個分類一起找，並用標籤標示類型
  if(q){
    document.getElementById('part-filters').style.display = 'none';
    let results = [];
    ['blade','ratchet','bit'].forEach(cat => {
      DB[catKey[cat]].forEach(it => {
        const matchQ = (it.name||'').toLowerCase().includes(q) || (it.nameZh||'').includes(q) || (it.code||'').toLowerCase().includes(q) || (it.id||'').toLowerCase().includes(q);
        if(matchQ) results.push({ ...it, _cat: cat });
      });
    });

    if(results.length === 0){
      list.innerHTML = `<div class="empty">還沒收錄「${escapeHTML(q)}」這個零件 🔍<br>可能是還沒加進資料庫，或是打的名字不太一樣，試試看其他關鍵字吧！</div>`;
      return;
    }

    const color = (cat) => catColor[cat];
    list.innerHTML = results.map(it => `
      <div class="card part-card clickable" data-cat="${it._cat}" data-id="${it.id}">
        <div class="part-badge ${it._cat==='ratchet'?'magenta':''}">${it.code ? it.code : (it.id.length<=6?it.id:topSVG(color(it._cat),{spin:false}))}</div>
        <div class="part-info">
          <span class="cat-pill" style="border-color:${color(it._cat)};color:${color(it._cat)};">${catLabel[it._cat]}</span>
          <h3>${highlightMatch(it.name, q)}</h3>
          ${it.nameZh ? `<p class="zh">${highlightMatch(it.nameZh, q)}</p>` : ''}
          <p>${escapeHTML(it.note)}</p>
          ${it.type ? `<span class="tag-pill ${typeClass[it.type]||''}">${typeLabel[it.type]||it.type}</span>` : ''}
        </div>
      </div>`).join('');

    list.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => showPartDetail(card.dataset.cat, card.dataset.id));
    });
    return;
  }

  // 沒有搜尋字詞：回到分頁瀏覽模式（單一分類 + 篩選）
  document.getElementById('part-filters').style.display = 'flex';
  let items = DB[catKey[currentPartTab]];
  items = items.filter(it => currentPartFilter === 'all' || it.type === currentPartFilter);

  if(items.length === 0){
    list.innerHTML = `<div class="empty">找不到符合的零件<br>試試看清除篩選條件</div>`;
    return;
  }

  const color = catColor[currentPartTab];
  list.innerHTML = items.map(it => `
    <div class="card part-card clickable" data-cat="${currentPartTab}" data-id="${it.id}">
      <div class="part-badge ${currentPartTab==='ratchet'?'magenta':''}">${it.code ? it.code : (it.id.length<=6?it.id:topSVG(color,{spin:false}))}</div>
      <div class="part-info">
        <h3>${it.name}</h3>
        ${it.nameZh ? `<p class="zh">${it.nameZh}</p>` : ''}
        <p>${it.note}</p>
        ${it.type ? `<span class="tag-pill ${typeClass[it.type]||''}">${typeLabel[it.type]||it.type}</span>` : ''}
      </div>
    </div>`).join('');

  list.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => showPartDetail(card.dataset.cat, card.dataset.id));
  });
}

function showPartDetail(cat, id){
  const it = DB[catKey[cat]].find(x => x.id === id);
  if(!it) return;
  const color = catColor[cat];
  let specs = '';
  if(cat === 'ratchet'){
    specs = `<p class="small muted">凸點數：${it.sides}　｜　身高：${it.height}（${(it.height/10).toFixed(1)}mm）</p>`;
  }
  if(cat === 'bit' && it.code){
    specs = `<p class="small muted">代號：${it.code}</p>`;
  }
  openModal(it.name, `
    <div class="detail-hero">
      <div class="part-shape">${topSVG(color)}</div>
      <div>
        <span class="cat-pill" style="border-color:${color};color:${color};">${catLabel[cat]}</span>
        <h3 style="margin:4px 0 2px;">${it.name}</h3>
        ${it.nameZh?`<p class="muted" style="margin:0;">${it.nameZh}</p>`:''}
      </div>
    </div>
    ${specs}
    <p>${it.note}</p>
    ${it.type ? `<span class="tag-pill ${typeClass[it.type]||''}">${typeLabel[it.type]||it.type}</span>` : ''}
  `);
}

function initEncyclopedia(){
  document.querySelectorAll('#part-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#part-tabs button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentPartTab = btn.dataset.part;
      currentPartFilter = 'all';
      if(currentPartTab === 'lock'){
        document.getElementById('part-search-area').style.display = 'none';
        document.getElementById('part-list').style.display = 'none';
        document.getElementById('lock-explainer').style.display = 'block';
      }else{
        document.getElementById('part-search-area').style.display = 'block';
        document.getElementById('part-list').style.display = 'block';
        document.getElementById('lock-explainer').style.display = 'none';
        renderPartFilters();
        renderPartList();
      }
    });
  });
  document.getElementById('search-input').addEventListener('input', () => {
    // 有輸入搜尋字詞時，如果目前在鎖定機制畫面，先切回瀏覽畫面
    if(currentPartTab === 'lock'){
      document.querySelectorAll('#part-tabs button').forEach(b=>b.classList.remove('active'));
      document.querySelector('#part-tabs button[data-part="blade"]').classList.add('active');
      currentPartTab = 'blade';
      document.getElementById('part-search-area').style.display = 'block';
      document.getElementById('part-list').style.display = 'block';
      document.getElementById('lock-explainer').style.display = 'none';
    }
    renderPartList();
  });
}

/* ============ 收藏 Collection ============ */
function renderCollection(){
  const items = store.get(LS_KEYS.collection, []);
  const list = document.getElementById('collection-grid');
  if(items.length === 0){
    list.innerHTML = `<div class="empty">還沒有收藏喔<br>點右上角「＋新增收藏」拍下你的第一顆陀螺吧！</div>`;
    return;
  }
  list.innerHTML = items.slice().reverse().map(it => {
    const photos = it.photos && it.photos.length ? it.photos : (it.photo ? [it.photo] : []);
    return `
    <div class="card collect-card-rich clickable" data-id="${it.id}">
      ${photos.length ? `
        <div class="cc-img-wrap">
          <img src="${photos[0]}" alt="${escapeHTML(it.title)}">
          ${photos.length > 1 ? `<span class="cc-count">📷 ${photos.length}</span>` : ''}
        </div>
      ` : `<div class="cc-img-wrap cc-img-empty">${topSVG('#00fff2',{spin:false})}</div>`}
      <div class="cc-body">
        <h3>${it.title || '未命名'}</h3>
        <p>${it.note ? escapeHTML(it.note).replace(/\n/g,'<br>') : '<span class="muted">沒有備註</span>'}</p>
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const item = items.find(x => x.id === card.dataset.id);
      const photos = item.photos && item.photos.length ? item.photos : (item.photo ? [item.photo] : []);
      openModal(item.title || '未命名', `
        ${photos.length ? `<div class="gallery">${photos.map(p=>`<img src="${p}">`).join('')}</div>` : ''}
        <p>${item.note ? escapeHTML(item.note).replace(/\n/g,'<br>') : '<span class="muted">沒有備註</span>'}</p>
        <div class="row" style="margin-top:14px;">
          <button class="btn danger block" id="del-collect">刪除收藏</button>
        </div>
      `);
      document.getElementById('del-collect').addEventListener('click', () => {
        const all = store.get(LS_KEYS.collection, []).filter(x => x.id !== item.id);
        store.set(LS_KEYS.collection, all);
        closeModal(); renderCollection(); toast('已刪除收藏');
      });
    });
  });
}

function initCollection(){
  document.getElementById('btn-add-collect').addEventListener('click', () => {
    openModal('新增收藏', `
      <div class="field">
        <label>照片（可選多張）</label>
        <input type="file" accept="image/*" multiple id="collect-photo">
        <div id="collect-preview" class="gallery" style="margin-top:8px;"></div>
      </div>
      <div class="field"><label>名稱</label><input type="text" id="collect-title" placeholder="例如：Shark Scale 3-60 LF"></div>
      <div class="field"><label>備註</label><textarea id="collect-note" placeholder="配裝心得、對戰紀錄..." style="min-height:90px;"></textarea></div>
      <button class="btn block" id="collect-save">儲存收藏</button>
    `);
    let photosData = [];
    function renderPreview(){
      document.getElementById('collect-preview').innerHTML = photosData.map((p,i)=>`<img src="${p}" data-i="${i}">`).join('');
    }
    document.getElementById('collect-photo').addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      let remaining = files.length;
      if(remaining === 0) return;
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = () => {
          photosData.push(reader.result);
          remaining--;
          if(remaining === 0) renderPreview();
        };
        reader.readAsDataURL(f);
      });
    });
    document.getElementById('collect-save').addEventListener('click', () => {
      const title = document.getElementById('collect-title').value.trim();
      const note = document.getElementById('collect-note').value.trim();
      if(!title && photosData.length === 0){ toast('請至少輸入名稱或加一張照片'); return; }
      const items = store.get(LS_KEYS.collection, []);
      items.push({ id: 'c'+Date.now(), title, note, photos: photosData, ts: Date.now() });
      store.set(LS_KEYS.collection, items);
      closeModal(); renderCollection(); toast('已加入收藏！');
    });
  });
}

/* ============ 備註 Notes ============ */
function renderNotes(){
  const items = store.get(LS_KEYS.notes, []);
  const list = document.getElementById('notes-list');
  if(items.length === 0){
    list.innerHTML = `<div class="empty">還沒有備註<br>點「＋新增備註」寫下配裝心得或對戰紀錄</div>`;
    return;
  }
  list.innerHTML = items.slice().reverse().map(it => `
    <div class="card note-item clickable" data-open="${it.id}">
      <div class="note-body">
        <h4>${it.title || '未命名備註'}</h4>
        <p>${(it.body||'').replace(/</g,'&lt;')}</p>
        <div class="note-date">${new Date(it.ts).toLocaleString('zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      <button class="btn ghost sm" data-id="${it.id}">刪除</button>
    </div>`).join('');
  list.querySelectorAll('button[data-id]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const all = store.get(LS_KEYS.notes, []).filter(x => x.id !== b.dataset.id);
      store.set(LS_KEYS.notes, all);
      renderNotes(); toast('已刪除備註');
    });
  });
  list.querySelectorAll('[data-open]').forEach(card => {
    card.addEventListener('click', () => openNoteEditor(card.dataset.open));
  });
}

function openNoteEditor(editId){
  const items = store.get(LS_KEYS.notes, []);
  const existing = editId ? items.find(x => x.id === editId) : null;
  openModal(existing ? '編輯備註' : '新增備註', `
    <div class="field"><label>標題</label><input type="text" id="note-title" placeholder="例如：今天的對戰心得" value="${existing ? existing.title.replace(/"/g,'&quot;') : ''}"></div>
    <div class="field"><label>內容</label><textarea id="note-body" placeholder="寫下你的想法..." style="min-height:120px;">${existing ? existing.body.replace(/</g,'&lt;') : ''}</textarea></div>
    <button class="btn block" id="note-save">${existing ? '儲存修改' : '儲存備註'}</button>
  `);
  document.getElementById('note-save').addEventListener('click', () => {
    const title = document.getElementById('note-title').value.trim();
    const body = document.getElementById('note-body').value.trim();
    if(!title && !body){ toast('請輸入內容'); return; }
    const all = store.get(LS_KEYS.notes, []);
    if(existing){
      const it = all.find(x => x.id === editId);
      it.title = title; it.body = body; it.ts = Date.now();
    }else{
      all.push({ id:'n'+Date.now(), title, body, ts: Date.now() });
    }
    store.set(LS_KEYS.notes, all);
    closeModal(); renderNotes(); toast(existing ? '已更新備註' : '已儲存備註');
  });
}

function initNotes(){
  document.getElementById('btn-add-note').addEventListener('click', () => openNoteEditor(null));
}

/* ============ 行事曆 Calendar ============ */
let calCursor = new Date();
calCursor.setDate(1);
let calSelected = new Date();

function ymdKey(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function renderCalendar(){
  const events = store.get(LS_KEYS.events, []);
  const y = calCursor.getFullYear(), m = calCursor.getMonth();
  document.getElementById('cal-title').textContent = `${y} 年 ${m+1} 月`;

  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();
  const today = new Date();

  const cells = [];
  for(let i=firstDow-1;i>=0;i--){
    cells.push({ day: daysInPrev-i, inmonth:false, date: new Date(y, m-1, daysInPrev-i) });
  }
  for(let d=1; d<=daysInMonth; d++){
    cells.push({ day:d, inmonth:true, date: new Date(y,m,d) });
  }
  while(cells.length % 7 !== 0){
    const last = cells[cells.length-1].date;
    const nd = new Date(last); nd.setDate(nd.getDate()+1);
    cells.push({ day: nd.getDate(), inmonth:false, date: nd });
  }

  const dow = ['日','一','二','三','四','五','六'];
  let html = dow.map(d=>`<div class="cal-dow">${d}</div>`).join('');
  html += cells.map(c => {
    const key = ymdKey(c.date);
    const has = events.some(e => e.date === key);
    const isToday = ymdKey(c.date) === ymdKey(today);
    const isSel = ymdKey(c.date) === ymdKey(calSelected);
    return `<div class="cal-cell ${c.inmonth?'inmonth':''} ${isToday?'today':''} ${isSel?'selected':''}" data-key="${key}">
      <span>${c.day}</span>${has?'<span class="dot"></span>':''}
    </div>`;
  }).join('');

  document.getElementById('cal-grid').innerHTML = html;
  document.querySelectorAll('.cal-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const [yy,mm,dd] = cell.dataset.key.split('-').map(Number);
      calSelected = new Date(yy, mm-1, dd);
      renderCalendar();
      renderDayEvents();
    });
  });
  renderDayEvents();
}

function renderDayEvents(){
  const events = store.get(LS_KEYS.events, []).filter(e => e.date === ymdKey(calSelected));
  const list = document.getElementById('day-events');
  document.getElementById('day-label').textContent = calSelected.toLocaleDateString('zh-TW', { month:'long', day:'numeric', weekday:'short' });
  if(events.length === 0){
    list.innerHTML = `<div class="empty">這天還沒有活動</div>`;
    return;
  }
  list.innerHTML = events.map(e => `
    <div class="card event-item">
      <div class="ev-dot"></div>
      <div class="ev-body"><h4>${e.title}</h4><p>${e.time || '整天'}</p></div>
      <button class="btn ghost sm" data-id="${e.id}">刪除</button>
    </div>`).join('');
  list.querySelectorAll('button[data-id]').forEach(b => {
    b.addEventListener('click', () => {
      const all = store.get(LS_KEYS.events, []).filter(x => x.id !== b.dataset.id);
      store.set(LS_KEYS.events, all);
      renderCalendar(); toast('已刪除活動');
    });
  });
}

function initCalendar(){
  document.getElementById('cal-prev').addEventListener('click', () => { calCursor.setMonth(calCursor.getMonth()-1); renderCalendar(); });
  document.getElementById('cal-next').addEventListener('click', () => { calCursor.setMonth(calCursor.getMonth()+1); renderCalendar(); });
  document.getElementById('btn-add-event').addEventListener('click', () => {
    openModal('新增活動', `
      <div class="field"><label>標題</label><input type="text" id="ev-title" placeholder="例如：社區對戰大賽"></div>
      <div class="field"><label>日期</label><input type="date" id="ev-date" value="${ymdKey(calSelected)}"></div>
      <div class="field"><label>時間（選填）</label><input type="time" id="ev-time"></div>
      <button class="btn block" id="ev-save">儲存活動</button>
    `);
    document.getElementById('ev-save').addEventListener('click', () => {
      const title = document.getElementById('ev-title').value.trim();
      const date = document.getElementById('ev-date').value;
      const time = document.getElementById('ev-time').value;
      if(!title || !date){ toast('請輸入標題與日期'); return; }
      const items = store.get(LS_KEYS.events, []);
      items.push({ id:'e'+Date.now(), title, date, time });
      store.set(LS_KEYS.events, items);
      const [yy,mm,dd] = date.split('-').map(Number);
      calSelected = new Date(yy, mm-1, dd);
      calCursor = new Date(yy, mm-1, 1);
      closeModal(); renderCalendar(); toast('已加入行事曆');
    });
  });
}

/* ============ 對戰紀錄 Battle Log ============ */
const resultLabel = { win:'勝', lose:'負', draw:'平' };
const resultClass = { win:'res-win', lose:'res-lose', draw:'res-draw' };

function renderBattles(){
  const items = store.get(LS_KEYS.battles, []);
  const statsEl = document.getElementById('battle-stats');
  const list = document.getElementById('battles-list');

  const total = items.length;
  const wins = items.filter(x=>x.result==='win').length;
  const loses = items.filter(x=>x.result==='lose').length;
  const draws = items.filter(x=>x.result==='draw').length;
  const rate = (wins+loses) > 0 ? Math.round(wins/(wins+loses)*100) : 0;

  if(total === 0){
    statsEl.innerHTML = `<div class="empty">還沒有對戰紀錄<br>打完一場就記一筆，慢慢累積你的戰績！</div>`;
  }else{
    statsEl.innerHTML = `
      <div class="battle-stat-row">
        <div class="battle-stat"><div class="bs-num">${total}</div><div class="bs-label">總場次</div></div>
        <div class="battle-stat"><div class="bs-num" style="color:var(--cyan);">${wins}</div><div class="bs-label">勝</div></div>
        <div class="battle-stat"><div class="bs-num" style="color:var(--magenta);">${loses}</div><div class="bs-label">負</div></div>
        <div class="battle-stat"><div class="bs-num" style="color:var(--muted);">${draws}</div><div class="bs-label">平</div></div>
        <div class="battle-stat"><div class="bs-num" style="color:var(--purple);">${rate}%</div><div class="bs-label">勝率</div></div>
      </div>`;
  }

  if(total === 0){ list.innerHTML = ''; return; }

  list.innerHTML = items.slice().reverse().map(it => `
    <div class="card battle-item clickable" data-id="${it.id}">
      <div class="res-badge ${resultClass[it.result]}">${resultLabel[it.result]}</div>
      <div class="battle-body">
        <h4>${escapeHTML(it.opponent) || '未記名對手'}</h4>
        <p class="muted small">${escapeHTML(it.myCombo) || '未填配裝'}</p>
        ${it.note ? `<p class="small">${escapeHTML(it.note)}</p>` : ''}
        <div class="note-date">${it.date}</div>
      </div>
    </div>`).join('');

  list.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openBattleEditor(card.dataset.id));
  });
}

function openBattleEditor(editId){
  const items = store.get(LS_KEYS.battles, []);
  const existing = editId ? items.find(x => x.id === editId) : null;
  const result = existing ? existing.result : 'win';
  openModal(existing ? '編輯對戰紀錄' : '新增對戰紀錄', `
    <div class="field"><label>結果</label>
      <div class="row" id="battle-result-row">
        <button type="button" class="btn ${result==='win'?'':'ghost'} sm" data-r="win" style="flex:1;">勝</button>
        <button type="button" class="btn ${result==='lose'?'magenta':'ghost'} sm" data-r="lose" style="flex:1;">負</button>
        <button type="button" class="btn ghost sm" data-r="draw" style="flex:1;">平</button>
      </div>
    </div>
    <div class="field"><label>對手</label><input type="text" id="battle-opponent" placeholder="例如：小明" value="${existing ? escapeHTML(existing.opponent) : ''}"></div>
    <div class="field"><label>我的配裝</label><input type="text" id="battle-combo" placeholder="例如：Shark Scale 3-60 LF" value="${existing ? escapeHTML(existing.myCombo) : ''}"></div>
    <div class="field"><label>日期</label><input type="date" id="battle-date" value="${existing ? existing.date : ymdKey(new Date())}"></div>
    <div class="field"><label>備註</label><textarea id="battle-note" placeholder="這場的心得、關鍵一擊...">${existing ? escapeHTML(existing.note) : ''}</textarea></div>
    <button class="btn block" id="battle-save">${existing ? '儲存修改' : '儲存紀錄'}</button>
    ${existing ? `<button class="btn danger block" id="battle-del" style="margin-top:8px;">刪除這筆紀錄</button>` : ''}
  `);

  let selectedResult = result;
  const resultBtns = document.querySelectorAll('#battle-result-row button');
  function paintResultBtns(){
    resultBtns.forEach(b => {
      const isSel = b.dataset.r === selectedResult;
      b.classList.remove('ghost','magenta');
      if(!isSel){ b.classList.add('ghost'); }
      else if(b.dataset.r === 'lose'){ b.classList.add('magenta'); }
    });
  }
  resultBtns.forEach(b => {
    b.addEventListener('click', () => { selectedResult = b.dataset.r; paintResultBtns(); });
  });
  paintResultBtns();

  document.getElementById('battle-save').addEventListener('click', () => {
    const opponent = document.getElementById('battle-opponent').value.trim();
    const myCombo = document.getElementById('battle-combo').value.trim();
    const date = document.getElementById('battle-date').value;
    const note = document.getElementById('battle-note').value.trim();
    if(!date){ toast('請選擇日期'); return; }
    const all = store.get(LS_KEYS.battles, []);
    if(existing){
      const it = all.find(x => x.id === editId);
      it.opponent = opponent; it.myCombo = myCombo; it.date = date; it.note = note; it.result = selectedResult;
    }else{
      all.push({ id:'b'+Date.now(), opponent, myCombo, date, note, result: selectedResult, ts: Date.now() });
    }
    store.set(LS_KEYS.battles, all);
    closeModal(); renderBattles(); toast(existing ? '已更新紀錄' : '已記下這場對戰！');
  });

  if(existing){
    document.getElementById('battle-del').addEventListener('click', () => {
      const all = store.get(LS_KEYS.battles, []).filter(x => x.id !== editId);
      store.set(LS_KEYS.battles, all);
      closeModal(); renderBattles(); toast('已刪除紀錄');
    });
  }
}

function initBattles(){
  document.getElementById('btn-add-battle').addEventListener('click', () => openBattleEditor(null));
}


/* ============ Lock mechanism diagram icons ============ */
function lockIcons(){
  const cyan = '#00fff2', magenta = '#ff2fd0';
  const icons = [
    // 1. Lock chip
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="${cyan}" stroke-width="4"/><circle cx="50" cy="50" r="10" fill="${cyan}"/><path d="M50 20 L50 32 M50 68 L50 80 M20 50 L32 50 M68 50 L80 50" stroke="${cyan}" stroke-width="4" stroke-linecap="round"/></svg>`,
    // 2. Socket + latch
    `<svg viewBox="0 0 100 100"><rect x="30" y="20" width="40" height="60" rx="8" fill="none" stroke="${magenta}" stroke-width="4"/><path d="M30 50 L14 42 L14 58 Z" fill="${magenta}"/><circle cx="50" cy="50" r="6" fill="${magenta}"/></svg>`,
    // 3. Shaft + base
    `<svg viewBox="0 0 100 100"><rect x="42" y="14" width="16" height="40" fill="none" stroke="${cyan}" stroke-width="4"/><polygon points="20,54 80,54 68,86 32,86" fill="none" stroke="${cyan}" stroke-width="4" stroke-linejoin="round"/></svg>`,
    // 4. Bit
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="38" r="18" fill="none" stroke="${magenta}" stroke-width="4"/><path d="M50 56 L50 86" stroke="${magenta}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="86" r="5" fill="${magenta}"/></svg>`,
  ];
  document.querySelectorAll('#lock-explainer .lock-step .part-shape').forEach((el, i) => {
    el.innerHTML = icons[i] || '';
  });
}

/* ============ Data loading ============ */
async function loadData(){
  try{
    const [b,r,bi] = await Promise.all([
      fetch('data/blades.json').then(r=>r.json()),
      fetch('data/ratchets.json').then(r=>r.json()),
      fetch('data/bits.json').then(r=>r.json()),
    ]);
    DB.blades = b; DB.ratchets = r; DB.bits = bi;
  }catch(e){
    console.warn('資料載入失敗，可能離線且尚未快取', e);
  }
  renderPartFilters();
  renderPartList();
}

/* ============ Hero SVGs (inject actual top graphics) ============ */
function initHero(){
  document.getElementById('bey-cyan').innerHTML = topSVG('#00fff2');
  document.getElementById('bey-magenta').innerHTML = topSVG('#ff2fd0');
  const qrGrid = document.getElementById('qr-grid');
  let cells = '';
  for(let i=0;i<81;i++){
    const on = Math.random() > 0.45;
    cells += `<i style="opacity:${on?0.5:0.1}; --d:${Math.floor(Math.random()*2600)}"></i>`;
  }
  qrGrid.innerHTML = cells;
}

/* ============ Service worker registration ============ */
function initSW(){
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(()=>{});
    });
  }
}

/* ============ Boot ============ */
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  lockIcons();
  initNav();
  initEncyclopedia();
  initCollection();
  initNotes();
  initCalendar();
  initBattles();
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if(e.target.id === 'modal-backdrop') closeModal();
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);

  loadData();
  renderCollection();
  renderNotes();
  renderBattles();
  renderCalendar();
  initSW();
});
