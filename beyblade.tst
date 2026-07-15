<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>BEYBLADE X 戰鬥大師・終極助手</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+TC:wght@400;700;900&display=swap');
        body { font-family: 'Noto Sans TC', 'Orbitron', sans-serif; background-color: #030008; color: #f3f4f6; overflow-x: hidden; }
        .neon-border-blue { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), inset 0 0 5px rgba(59, 130, 246, 0.3); }
        .neon-text-blue { text-shadow: 0 0 5px rgba(59, 130, 246, 0.8); }
        @keyframes spin-fast { 0% { transform: rotate(0deg); } 100% { transform: rotate(3600deg); } }
        .spinning { animation: spin-fast 3s cubic-bezier(0.1, 0.8, 0.1, 1) forwards; }
        .pulse-red { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.95); } }
        .nav-active { background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); border-color: #a855f7; color: #ffffff; }
    </style>
</head>
<body class="pb-24">
    <header class="bg-slate-950 border-b border-purple-900/50 p-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div class="max-w-md mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center neon-border-blue">
                    <span class="text-white font-black text-xs">X</span>
                </div>
                <div>
                    <h1 class="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">BEYBLADE X</h1>
                    <p class="text-[9px] text-gray-400 tracking-widest uppercase">Battle Master Hub</p>
                </div>
            </div>
            <span class="text-xs px-2 py-1 bg-purple-950 text-purple-300 rounded-full border border-purple-500/30 font-bold tracking-widest uppercase animate-pulse">Online</span>
        </div>
    </header>

    <main class="max-w-md mx-auto p-4 space-y-6">
        <section id="screen-battle" class="space-y-6">
            <div class="bg-gradient-to-b from-slate-900 to-purple-950/40 rounded-3xl p-6 border border-purple-900/50 relative overflow-hidden">
                <h3 class="text-sm font-bold text-blue-400 mb-1 flex items-center gap-1">
                    <i data-lucide="zap" class="w-4 h-4 text-yellow-400 animate-bounce"></i> 競技場模擬測試器
                </h3>
                <p class="text-xs text-gray-400 mb-6">點擊發射按鈕，測試陀螺在場上的旋轉火花！</p>
                <div class="relative w-64 h-64 mx-auto bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-inner overflow-hidden mb-6">
                    <div class="absolute inset-0 border border-dashed border-purple-500/10 rounded-full scale-75"></div>
                    <canvas id="spark-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-10"></canvas>
                    <div id="beyblade-spinner" class="w-44 h-44 relative z-0 cursor-pointer">
                        <svg viewBox="0 0 100 100" class="w-full h-full">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#22d3ee" stroke-width="3" />
                            <circle cx="50" cy="50" r="40" fill="#0f172a" />
                            <path d="M 50 10 Q 55 30 75 30 Q 55 45 65 75 Q 45 55 25 75 Q 40 45 25 25 Q 45 30 50 10" fill="url(#metal-grad)" stroke="#a855f7" stroke-width="1.5" />
                            <g stroke="#f43f5e" stroke-width="2">
                                <line x1="50" y1="5" x2="50" y2="10" /><line x1="95" y1="50" x2="90" y2="50" /><line x1="50" y1="95" x2="50" y2="90" /><line x1="5" y1="50" x2="10" y2="50" />
                            </g>
                            <circle cx="50" cy="50" r="16" fill="#1e1b4b" stroke="#e11d48" stroke-width="2" />
                            <polygon points="50,42 53,46 58,46 55,50 57,55 50,52 43,55 45,50 42,46 47,46" fill="#f43f5e" />
                            <circle cx="50" cy="50" r="4" fill="#ffffff" />
                            <defs>
                                <radialGradient id="metal-grad" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="#3b82f6" /><stop offset="70%" stop-color="#1d4ed8" /><stop offset="100%" stop-color="#1e1b4b" />
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                <div class="flex flex-col gap-3">
                    <button id="btn-launch" class="w-full py-4 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 text-center text-lg tracking-widest flex items-center justify-center gap-2">
                        <i data-lucide="play-circle" class="w-6 h-6"></i> 3, 2, 1, GO SHOOT!
                    </button>
                </div>
            </div>
            <div id="alert-box" class="bg-purple-950/60 border border-purple-500/30 rounded-2xl p-4 flex items-start gap-3">
                <div class="p-2 bg-purple-900/50 rounded-xl text-purple-300"><i data-lucide="radio" class="w-5 h-5 pulse-red"></i></div>
                <div class="flex-1">
                    <span class="text-xs font-bold text-purple-300 tracking-widest">家長即時廣播通知</span>
                    <p id="broadcast-content" class="text-sm text-slate-200 mt-1 font-medium">載入中...</p>
                </div>
            </div>
        </section>

        <section id="screen-bits" class="space-y-4 hidden">
            <h2 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">52顆全軸心戰術字典</h2>
            <input type="text" id="search-bit" placeholder="搜尋軸心..." class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white">
            <div id="bits-container" class="space-y-3"></div>
        </section>

        <section id="screen-box" class="space-y-4 hidden">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">我的戰友收藏箱</h2>
                <button onclick="openAddModal()" class="p-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl"><i data-lucide="plus" class="w-6 h-6"></i></button>
            </div>
            <div id="box-container" class="grid grid-cols-1 gap-4"></div>
        </section>

        <section id="screen-calendar" class="space-y-4 hidden">
            <h2 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">戰士行程行事曆</h2>
            <div id="calendar-list" class="space-y-3"></div>
            
            <div class="bg-slate-950 border border-dashed border-red-500/40 rounded-2xl p-4">
                <h4 class="text-xs font-black text-red-400 mb-3 uppercase flex items-center gap-1.5"><i data-lucide="sliders" class="w-4 h-4"></i> 家長發送台</h4>
                <input type="text" id="parent-broadcast-text" placeholder="輸入廣播內容..." class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white mb-2">
                <button onclick="sendParentBroadcast()" class="w-full py-2 bg-red-600 text-white rounded-lg text-xs font-bold">發送廣播</button>
            </div>
        </section>
    </main>

    <nav class="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-purple-900/50 p-2 z-50">
        <div class="max-w-md mx-auto grid grid-cols-4 gap-1">
            <button onclick="switchScreen('battle')" id="nav-battle" class="nav-active flex flex-col items-center py-2 rounded-xl text-slate-400">
                <i data-lucide="sword" class="w-5 h-5 mb-1"></i><span class="text-[10px] font-bold">戰鬥模擬</span>
            </button>
            <button onclick="switchScreen('bits')" id="nav-bits" class="flex flex-col items-center py-2 rounded-xl text-slate-400">
                <i data-lucide="book-open" class="w-5 h-5 mb-1"></i><span class="text-[10px] font-bold">52軸圖鑑</span>
            </button>
            <button onclick="switchScreen('box')" id="nav-box" class="flex flex-col items-center py-2 rounded-xl text-slate-400">
                <i data-lucide="archive" class="w-5 h-5 mb-1"></i><span class="text-[10px] font-bold">戰友箱</span>
            </button>
            <button onclick="switchScreen('calendar')" id="nav-calendar" class="flex flex-col items-center py-2 rounded-xl text-slate-400">
                <i data-lucide="calendar" class="w-5 h-5 mb-1"></i><span class="text-[10px] font-bold">行程表</span>
            </button>
        </div>
    </nav>

    <!-- Modal -->
    <div id="add-modal" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-950 border border-purple-500/30 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-white">新增陀螺</h3>
                <button onclick="closeAddModal()"><i data-lucide="x" class="w-6 h-6 text-slate-400"></i></button>
            </div>
            <div class="space-y-3 text-xs">
                <div>
                    <label class="block text-slate-400 mb-1">陀螺照片 (開啟相機拍照或上傳)</label>
                    <div class="flex items-center gap-3">
                        <div id="photo-preview" class="w-16 h-16 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center"><i data-lucide="camera" class="w-8 h-8 text-slate-500"></i></div>
                        <input type="file" id="file-input" accept="image/*" class="hidden" onchange="previewFile(event)">
                        <button onclick="document.getElementById('file-input').click()" class="px-3 py-1.5 bg-slate-900 text-slate-300 rounded-lg text-xs font-bold">開啟相機拍照</button>
                    </div>
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">名稱</label>
                    <input type="text" id="toy-name" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1">類型</label>
                    <select id="toy-type" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
                        <option>攻擊型</option><option>防守型</option><option>持久型</option><option>平衡型</option>
                    </select>
                </div>
                <div>
                    <div class="flex justify-between mb-1"><label class="text-slate-400">自訂欄位</label><button onclick="addNewField()" class="text-purple-400 text-[10px] font-bold">+ 新增</button></div>
                    <div id="dynamic-fields" class="space-y-2 max-h-36 overflow-y-auto">
                        <div class="grid grid-cols-2 gap-1.5">
                            <input type="text" value="入手日期" class="field-key bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-400">
                            <input type="text" value="2026/07/15" class="field-val bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white">
                        </div>
                    </div>
                </div>
            </div>
            <button onclick="saveToy()" class="w-full py-3 bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-black rounded-xl text-sm">儲存至戰友箱</button>
        </div>
    </div>

    <script>
        const bitsData = [
            { name: "F (Flat) 平坦軸", type: "攻擊", gear: 12, origin: "Dragger Sword (德蘭劍)", strategy: "超高速直線移動，齒數高容易發動 X Dash 機制爆扣對手！" },
            { name: "LF (Low Flat) 低平坦軸", type: "攻擊", gear: 12, origin: "Cobalt Drake (鈷藍龍)", strategy: "重心較低的平坦軸，能對敵方下盤發動強力挑空進攻。" },
            { name: "B (Ball) 球形軸", type: "持久", gear: 10, origin: "Hells Scythe (地獄鐮刀)", strategy: "全向旋轉穩定度極佳，不慎被撞飛也能迅速恢復平衡。" },
            { name: "N (Needle) 尖針軸", type: "防守", gear: 10, origin: "Wizard Arrow (巫師箭)", strategy: "超小接觸面，能在擂台中心極限自保防禦，以守代攻。" },
            { name: "HN (High Needle) 高針軸", type: "防守", gear: 10, origin: "Knight Shield (騎士之盾)", strategy: "高度提升的防禦軸，利於從上方阻擋並彈開壓制對手。" },
            { name: "T (Taper) 錐形軸", type: "平衡", gear: 11, origin: "Hells Chain (地獄連鎖)", strategy: "傾斜時高速跑道，立直時進入持久狀態，攻守轉換隨意。" },
            { name: "P (Point) 點型軸", type: "平衡", gear: 11, origin: "Leon Claw (獅子之爪)", strategy: "複合型設計，具備球軸的持久和錐軸的瞬間反擊與加速。" },
            { name: "O (Orb) 球體軸", type: "持久", gear: 10, origin: "Viper Tail (毒蛇之尾)", strategy: "圓滑球面使自轉摩擦力降到最低，完美展現極致消耗戰。" },
            { name: "GF (Gear Flat) 齒輪平坦軸", type: "攻擊", gear: 16, origin: "Dran Buster (德蘭毀滅者)", strategy: "超驚人的 16 齒設計！一上軌道瞬間爆發毀滅性的極限衝刺！" },
            { name: "DB (Disc Ball) 圓盤球形軸", type: "持久", gear: 10, origin: "Sphinx Cowl (斯芬克斯之兜)", strategy: "底部配有防傾倒圓盤，能在陀螺傾斜時提供完美的二次支撐。" }
        ];

        let currentScreen = 'battle';
        let customToys = [];
        let broadcastMsg = { content: "家長廣播：7/18 新一屆【BEYBLADE X 積分挑戰賽】來臨！記得帶上你的主力魔導神杖喔！", date: "2026-07-18" };
        let uploadedPhotoBase64 = "";

        function playLaunchSound() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                const ctx = new AudioContext();
                const bufferSize = ctx.sampleRate * 1.5;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const noiseFilter = ctx.createBiquadFilter();
                noiseFilter.type = 'bandpass';
                noiseFilter.frequency.setValueAtTime(200, ctx.currentTime);
                noiseFilter.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.3);
                noiseFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.2);
                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
                noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(ctx.destination);
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(80, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
                osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 1.5);
                osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 3.0);
                const mainGain = ctx.createGain();
                mainGain.gain.setValueAtTime(0, ctx.currentTime);
                mainGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.15);
                mainGain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 1.5);
                mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
                osc.connect(mainGain); mainGain.connect(ctx.destination);
                noise.start(); osc.start();
                noise.stop(ctx.currentTime + 1.5); osc.stop(ctx.currentTime + 3.0);
            } catch (e) {}
        }

        window.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            const storedToys = localStorage.getItem('beyblade_toys');
            if (storedToys) { customToys = JSON.parse(storedToys); }
            else {
                customToys = [{
                    id: 1, name: "Drager Sword 3-60F (德蘭劍)", type: "攻擊型",
                    avatar: "https://images.unsplash.com/photo-1608889174637-3c44f6326f1a?auto=format&fit=crop&q=80&w=150",
                    fields: [{ key: "入手日期", val: "2026/06/12" }, { key: "擊敗過對手", val: "地獄鐮刀" }]
                }];
                localStorage.setItem('beyblade_toys', JSON.stringify(customToys));
            }
            const storedBroadcast = localStorage.getItem('beyblade_broadcast');
            if (storedBroadcast) { broadcastMsg = JSON.parse(storedBroadcast); }
            renderBroadcast(); renderBits(); renderBox(); renderCalendar();
            const btnLaunch = document.getElementById('btn-launch');
            const spinner = document.getElementById('beyblade-spinner');
            const handleLaunch = () => {
                playLaunchSound(); triggerSparks();
                spinner.classList.remove('spinning'); void spinner.offsetWidth; spinner.classList.add('spinning');
            };
            btnLaunch.addEventListener('click', handleLaunch);
            spinner.addEventListener('click', handleLaunch);
            setupCanvas();
        });

        function switchScreen(screenId) {
            document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
            document.getElementById('screen-' + screenId).classList.remove('hidden');
            document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('nav-active'));
            document.getElementById('nav-' + screenId).classList.add('nav-active');
            currentScreen = screenId;
        }

        let canvas, ctx, animationFrame;
        let particles = [];
        function setupCanvas() {
            canvas = document.getElementById('spark-canvas');
            ctx = canvas.getContext('2d');
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
        function triggerSparks() {
            setupCanvas(); particles = [];
            const colors = ['#f43f5e', '#ec4899', '#3b82f6', '#22d3ee', '#eab308'];
            const center = { x: canvas.width / 2, y: canvas.height / 2 };
            for (let i = 0; i < 80; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 8;
                particles.push({
                    x: center.x, y: center.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    radius: 1 + Math.random() * 3, color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1, decay: 0.015 + Math.random() * 0.02
                });
            }
            if (animationFrame) cancelAnimationFrame(animationFrame);
            tickSparks();
        }
        function tickSparks() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
                if (p.alpha > 0) {
                    active = true; ctx.save(); ctx.globalAlpha = p.alpha; ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); ctx.restore();
                }
            });
            if (active) { animationFrame = requestAnimationFrame(tickSparks); }
        }

        function renderBroadcast() {
            document.getElementById('broadcast-content').innerText = broadcastMsg.content;
        }

        function sendParentBroadcast() {
            const txt = document.getElementById('parent-broadcast-text').value;
            if (!txt) { alert("請輸入內容！"); return; }
            broadcastMsg = { content: "📡 " + txt, date: "2026-07-15" };
            localStorage.setItem('beyblade_broadcast', JSON.stringify(broadcastMsg));
            renderBroadcast(); renderCalendar();
            alert("✅ 廣播發送成功！"); switchScreen('battle');
        }

        function renderBits() {
            const container = document.getElementById('bits-container');
            const searchVal = document.getElementById('search-bit').value.toLowerCase();
            container.innerHTML = "";
            bitsData.filter(bit => bit.name.toLowerCase().includes(searchVal)).forEach(bit => {
                container.innerHTML += `<div class="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div class="flex justify-between mb-1"><span class="font-bold text-white">${bit.name}</span><span class="text-xs text-purple-400">${bit.type}型</span></div>
                    <p class="text-xs text-slate-400">原裝：s{bit.origin}</p>
                    <p class="text-xs text-slate-300 italic mt-1 font-mono">"${bit.strategy}"</p>
                </div>`;
            });
        }

        function renderBox() {
            const container = document.getElementById('box-container');
            container.innerHTML = "";
            if (customToys.length === 0) {
                container.innerHTML = "<p class='text-center text-slate-500 py-8'>尚無收藏</p>"; return;
            }
            customToys.forEach(toy => {
                let fieldsHtml = "";
                toy.fields.forEach(f => { fieldsHtml += `<div class="flex justify-between text-xs py-0.5"><span class="text-slate-400">${f.key}</span><span class="text-slate-200">${f.val}</span></div>`; });
                container.innerHTML += `<div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4">
                    <img src="${toy.avatar}" class="w-16 h-16 rounded-xl object-cover">
                    <div class="flex-1">
                        <div class="flex justify-between"><h4 class="font-bold text-white">${toy.name}</h4><button onclick="deleteToy(${toy.id})" class="text-red-400 text-xs">刪除</button></div>
                        <span class="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">${toy.type}</span>
                        <div class="mt-2 border-t border-slate-800 pt-2">${fieldsHtml}</div>
                    </div>
                </div>`;
            });
        }

        function renderCalendar() {
            const container = document.getElementById('calendar-list');
            container.innerHTML = `<div class="bg-purple-950/40 border border-purple-500/20 p-4 rounded-2xl">
                <span class="text-xs font-bold text-purple-300">📡 ${broadcastMsg.date}</span>
                <p class="text-sm text-white font-bold mt-1">${broadcastMsg.content}</p>
            </div>`;
        }

        function openAddModal() { document.getElementById('add-modal').classList.remove('hidden'); }
        function closeAddModal() { document.getElementById('add-modal').classList.add('hidden'); }
        function previewFile(e) {
            const file = e.target.files[0]; if (!file) return;
            const r = new FileReader();
            r.onload = function(evt) { uploadedPhotoBase64 = evt.target.result; document.getElementById('photo-preview').innerHTML = `<img src="${uploadedPhotoBase64}" class="w-full h-full object-cover rounded-xl">`; };
            r.readAsDataURL(file);
        }
        function addNewField() {
            const div = document.createElement('div'); div.className = "grid grid-cols-2 gap-1.5";
            div.innerHTML = `<input type="text" placeholder="屬性" class="field-key bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-400">
            <input type="text" placeholder="數值" class="field-val bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white">`;
            document.getElementById('dynamic-fields').appendChild(div);
        }
        function saveToy() {
            const name = document.getElementById('toy-name').value;
            if (!name) { alert("請輸入名稱"); return; }
            const keys = document.querySelectorAll('.field-key');
            const vals = document.querySelectorAll('.field-val');
            const fields = [];
            for(let i=0; i<keys.length; i++) { if(keys[i].value) fields.push({ key: keys[i].value, val: vals[i].value }); }
            customToys.push({
                id: Date.now(), name: name, type: document.getElementById('toy-type').value,
                avatar: uploadedPhotoBase64 || "https://images.unsplash.com/photo-1608889174637-3c44f6326f1a?auto=format&fit=crop&q=80&w=150",
                fields: fields
            });
            localStorage.setItem('beyblade_toys', JSON.stringify(customToys));
            closeAddModal(); renderBox();
        }
        function deleteToy(id) {
            customToys = customToys.filter(t => t.id !== id);
            localStorage.setItem('beyblade_toys', JSON.stringify(customToys));
            renderBox();
        }
    </script>
</body>
</html>