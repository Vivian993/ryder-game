/* ============ BEYBLADE X 百科 — app.js ============ */
'use strict';

const LS_KEYS = {
  collection: 'bx_collection_v1',
  notes: 'bx_notes_v1',
  events: 'bx_events_v1',
  reminders: 'bx_reminders_v1',
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

let currentPartTab = 'blade';
let currentPartFilter = 'all';

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
  let items = DB[currentPartTab === 'blade' ? 'blades' : currentPartTab === 'ratchet' ? 'ratchets' : 'bits'];

  items = items.filter(it => {
    const matchQ = !q || (it.name||'').toLowerCase().includes(q) || (it.nameZh||'').includes(q) || (it.code||'').toLowerCase().includes(q) || (it.id||'').toLowerCase().includes(q);
    const matchT = currentPartFilter === 'all' || it.type === currentPartFilter;
    return matchQ && matchT;
  });

  if(items.length === 0){
    list.innerHTML = `<div class="empty">找不到符合的零件<br>試試看清除搜尋或篩選條件</div>`;
    return;
  }

  const color = currentPartTab === 'ratchet' ? '#ff2fd0' : '#00fff2';
  list.innerHTML = items.map(it => `
    <div class="card part-card clickable" data-id="${it.id}">
      <div class="part-badge ${currentPartTab==='ratchet'?'magenta':''}">${it.code ? it.code : (it.id.length<=6?it.id:topSVG(color,{spin:false}))}</div>
      <div class="part-info">
        <h3>${it.name}</h3>
        ${it.nameZh ? `<p class="zh">${it.nameZh}</p>` : ''}
        <p>${it.note}</p>
        ${it.type ? `<span class="tag-pill ${typeClass[it.type]||''}">${typeLabel[it.type]||it.type}</span>` : ''}
      </div>
    </div>`).join('');

  list.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => showPartDetail(card.dataset.id));
  });
}

function showPartDetail(id){
  const key = currentPartTab === 'blade' ? 'blades' : currentPartTab === 'ratchet' ? 'ratchets' : 'bits';
  const it = DB[key].find(x => x.id === id);
  if(!it) return;
  const color = currentPartTab === 'ratchet' ? '#ff2fd0' : '#00fff2';
  let specs = '';
  if(currentPartTab === 'ratchet'){
    specs = `<p class="small muted">凸點數：${it.sides}　｜　身高：${it.height}（${(it.height/10).toFixed(1)}mm）</p>`;
  }
  if(currentPartTab === 'bit' && it.code){
    specs = `<p class="small muted">代號：${it.code}</p>`;
  }
  openModal(it.name, `
    <div class="detail-hero">
      <div class="part-shape">${topSVG(color)}</div>
      <div>
        <h3 style="margin:0 0 2px;">${it.name}</h3>
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
    // global search always searches within currently selected part tab; if on lock screen, jump to blade tab
    if(currentPartTab === 'lock'){
      document.querySelector('#part-tabs button[data-part="blade"]').click();
    }
    renderPartList();
  });
}

/* ============ 收藏 Collection ============ */
function renderCollection(){
  const items = store.get(LS_KEYS.collection, []);
  const grid = document.getElementById('collection-grid');
  if(items.length === 0){
    grid.innerHTML = `<div class="empty">還沒有收藏喔<br>點右上角「＋新增收藏」拍下你的第一顆陀螺吧！</div>`;
    return;
  }
  grid.innerHTML = items.slice().reverse().map(it => `
    <div class="card collect-card clickable" data-id="${it.id}">
      ${it.photo ? `<img src="${it.photo}" alt="${it.title}">` : `<div style="height:130px;display:flex;align-items:center;justify-content:center;background:#0c1220;">${topSVG('#00fff2',{spin:false})}</div>`}
      <div class="cc-body">
        <h4>${it.title || '未命名'}</h4>
        <p>${it.note ? it.note.slice(0,18) : ''}</p>
      </div>
    </div>`).join('');
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const item = items.find(x => x.id === card.dataset.id);
      openModal(item.title || '未命名', `
        ${item.photo ? `<img src="${item.photo}" style="width:100%;border-radius:10px;margin-bottom:10px;">` : ''}
        <p>${item.note ? item.note.replace(/\n/g,'<br>') : '<span class="muted">沒有備註</span>'}</p>
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
        <label>照片</label>
        <input type="file" accept="image/*" capture="environment" id="collect-photo">
        <div id="collect-preview" style="margin-top:8px;"></div>
      </div>
      <div class="field"><label>名稱</label><input type="text" id="collect-title" placeholder="例如：Shark Scale 3-60 LF"></div>
      <div class="field"><label>備註</label><textarea id="collect-note" placeholder="配裝心得、對戰紀錄..."></textarea></div>
      <button class="btn block" id="collect-save">儲存收藏</button>
    `);
    let photoData = '';
    document.getElementById('collect-photo').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        photoData = reader.result;
        document.getElementById('collect-preview').innerHTML = `<img src="${photoData}" style="width:100%;border-radius:10px;">`;
      };
      reader.readAsDataURL(f);
    });
    document.getElementById('collect-save').addEventListener('click', () => {
      const title = document.getElementById('collect-title').value.trim();
      const note = document.getElementById('collect-note').value.trim();
      if(!title && !photoData){ toast('請至少輸入名稱或拍照'); return; }
      const items = store.get(LS_KEYS.collection, []);
      items.push({ id: 'c'+Date.now(), title, note, photo: photoData, ts: Date.now() });
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
    <div class="card note-item">
      <div class="note-body">
        <h4>${it.title || '未命名備註'}</h4>
        <p>${(it.body||'').replace(/</g,'&lt;')}</p>
        <div class="note-date">${new Date(it.ts).toLocaleString('zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      <button class="btn ghost sm" data-id="${it.id}">刪除</button>
    </div>`).join('');
  list.querySelectorAll('button[data-id]').forEach(b => {
    b.addEventListener('click', () => {
      const all = store.get(LS_KEYS.notes, []).filter(x => x.id !== b.dataset.id);
      store.set(LS_KEYS.notes, all);
      renderNotes(); toast('已刪除備註');
    });
  });
}

function initNotes(){
  document.getElementById('btn-add-note').addEventListener('click', () => {
    openModal('新增備註', `
      <div class="field"><label>標題</label><input type="text" id="note-title" placeholder="例如：今天的對戰心得"></div>
      <div class="field"><label>內容</label><textarea id="note-body" placeholder="寫下你的想法..." style="min-height:120px;"></textarea></div>
      <button class="btn block" id="note-save">儲存備註</button>
    `);
    document.getElementById('note-save').addEventListener('click', () => {
      const title = document.getElementById('note-title').value.trim();
      const body = document.getElementById('note-body').value.trim();
      if(!title && !body){ toast('請輸入內容'); return; }
      const items = store.get(LS_KEYS.notes, []);
      items.push({ id:'n'+Date.now(), title, body, ts: Date.now() });
      store.set(LS_KEYS.notes, items);
      closeModal(); renderNotes(); toast('已儲存備註');
    });
  });
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

/* ============ 家長提醒 Reminders (雲端同步版：Firestore) ============ */
let remindersCache = [];
let remindersUnsub = null;

function renderReminders(){
  const items = remindersCache;
  const list = document.getElementById('reminders-list');
  if(!items || items.length === 0){
    list.innerHTML = `<div class="empty">還沒有提醒事項<br>爸爸/媽媽可以新增練習或收玩具的提醒</div>`;
    return;
  }
  list.innerHTML = items.map(it => `
    <div class="card reminder-item">
      <div class="rm-toggle ${it.on?'on':''}" data-id="${it.id}">${it.on?'✓':''}</div>
      <div class="rm-body"><h4>${it.title}</h4><p>${it.date}${it.time?' '+it.time:''}</p></div>
      <button class="btn ghost sm" data-del="${it.id}">刪除</button>
    </div>`).join('');
  list.querySelectorAll('.rm-toggle').forEach(t => {
    t.addEventListener('click', () => {
      db.collection('reminders').doc(t.dataset.id).update({ on: !t.classList.contains('on') }).catch(()=>toast('連線失敗，請檢查網路'));
    });
  });
  list.querySelectorAll('button[data-del]').forEach(b => {
    b.addEventListener('click', () => {
      db.collection('reminders').doc(b.dataset.del).delete()
        .then(() => toast('已刪除提醒'))
        .catch(() => toast('連線失敗，請檢查網路'));
    });
  });
}

function initReminders(){
  document.getElementById('btn-add-reminder').addEventListener('click', () => {
    openModal('新增家長提醒', `
      <p class="muted small">這裡新增的提醒會即時同步到孩子的手機（只要他也打開過這個 App）。</p>
      <div class="field"><label>提醒內容</label><input type="text" id="rm-title" placeholder="例如：練習組裝新配裝"></div>
      <div class="field"><label>日期</label><input type="date" id="rm-date" value="${ymdKey(new Date())}"></div>
      <div class="field"><label>時間</label><input type="time" id="rm-time"></div>
      <button class="btn block" id="rm-save">儲存提醒</button>
    `);
    document.getElementById('rm-save').addEventListener('click', () => {
      const title = document.getElementById('rm-title').value.trim();
      const date = document.getElementById('rm-date').value;
      const time = document.getElementById('rm-time').value;
      if(!title || !date){ toast('請輸入內容與日期'); return; }
      const btn = document.getElementById('rm-save');
      btn.disabled = true; btn.textContent = '儲存中...';
      db.collection('reminders').add({
        title, date, time, on: true, fired: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        closeModal(); toast('已新增提醒，會同步給孩子');
      }).catch(() => {
        toast('新增失敗，請檢查網路連線');
        btn.disabled = false; btn.textContent = '儲存提醒';
      });
    });
  });

  // 即時監聽雲端提醒（家長跟孩子的手機都會自動同步）
  remindersUnsub = db.collection('reminders').orderBy('createdAt', 'desc')
    .onSnapshot((snap) => {
      remindersCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderReminders();
      checkDueReminders();
    }, (err) => {
      console.warn('Firestore 監聽失敗', err);
      toast('雲端連線失敗，請檢查網路');
    });

  if('Notification' in window && Notification.permission === 'default'){
    setTimeout(() => { try{ Notification.requestPermission().then(initPush); }catch(e){} }, 1200);
  } else if('Notification' in window && Notification.permission === 'granted'){
    initPush();
  }

  setInterval(checkDueReminders, 30000);
}

/* 前景（App 開著時）到點提醒 */
let firedLocally = new Set();
function checkDueReminders(){
  const now = new Date();
  remindersCache.forEach(it => {
    if(!it.on || it.fired || !it.date || firedLocally.has(it.id)) return;
    const due = new Date(`${it.date}T${it.time || '00:00'}`);
    if(due <= now){
      firedLocally.add(it.id);
      toast(`⏰ 提醒：${it.title}`);
      if('Notification' in window && Notification.permission === 'granted'){
        try{ new Notification('BEYBLADE X 提醒', { body: it.title }); }catch(e){}
      }
      db.collection('reminders').doc(it.id).update({ fired: true }).catch(()=>{});
    }
  });
}

/* ============ FCM 推播（App 沒開也能收到通知） ============ */
function initPush(){
  if(!('serviceWorker' in navigator) || !firebase.messaging || !FCM_VAPID_KEY){
    return; // 尚未設定 VAPID 金鑰前，先略過（App 開著時仍可用上面的本機提醒）
  }
  try{
    const messaging = firebase.messaging();
    navigator.serviceWorker.ready.then((registration) => {
      messaging.getToken({ vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: registration })
        .then((token) => {
          if(!token) return;
          db.collection('device_tokens').doc(token).set({
            token, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }).catch(() => {});
        })
        .catch((err) => console.warn('取得推播 token 失敗', err));
    });
    messaging.onMessage((payload) => {
      const title = payload.notification && payload.notification.title || 'BEYBLADE X 提醒';
      const body = payload.notification && payload.notification.body || '';
      toast(`⏰ ${body || title}`);
    });
  }catch(e){ console.warn('推播初始化失敗', e); }
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
  initReminders();
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if(e.target.id === 'modal-backdrop') closeModal();
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);

  loadData();
  renderCollection();
  renderNotes();
  renderReminders();
  renderCalendar();
  initSW();
});
