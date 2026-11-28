function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

(function(){
  var currentRole="admin";
  var routes={
    'main.html':'../Registrar/main.html',
    'requests.html':'../Registrar/requestList.html',
    'request-detail.html':'../Registrar/RequestPage.html',
    'scan.html':'../Registrar/Scan&Claim.html',
    'dashboard.html':'../Admin/analytics.html',
    'admin-users.html':'../Admin/User&Role.html',
    'admin-audit.html':'../Admin/Log.html',
    'admin-settings.html':'../Admin/Settings.html',
    'student-main.html':'../Extra/accounts.html',
    'accounts.html':'../Extra/accounts.html',
    'loginPage.html':'../Extra/loginPage.html'
  };
  window.RT=window.RT||{
    role:currentRole,
    setRole:function(v){this.role=v||null;try{sessionStorage.setItem('rt-role',v||'')}catch(e){}},
    go:function(target){
      var raw=String(target||''),hash='',query='',i=raw.indexOf('#');
      if(i>=0){hash=raw.slice(i);raw=raw.slice(0,i)}
      i=raw.indexOf('?');if(i>=0){query=raw.slice(i);raw=raw.slice(0,i)}
      var name=raw.split('/').pop(),dest=routes[name]||name;
      if(dest.indexOf('../')===0) location.href=dest+query+hash;
      else location.href=dest+query+hash;
    }
  };
  if(!window.RT.role)window.RT.role=currentRole;
  window.__RT_QS='';window.__RT_HASH=location.hash||'';
  try{Object.defineProperty(window,'__nav',{configurable:true,set:function(v){window.RT.go(String(v))}})}catch(e){window.__nav=''}
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var hr=a.getAttribute('href');
    if(/^(main|requests|request-detail|scan|dashboard|admin-users|admin-audit|admin-settings|student-main)\.html([?#]|$)/.test(hr)){
      e.preventDefault();window.RT.go(hr);
    }
  },true);
})();

try{var __t=localStorage.getItem('regitrack_theme');if(__t)document.documentElement.setAttribute('data-theme',__t)}catch(e){}



const DEFAULT_NOTIFS = [
  { id:1, title:'New TOR Request #1048', desc:'Maria Clara Santos submitted payment receipt', time:'12m ago', unread:true, reqId:'REQ-2026-1048' },
  { id:2, title:'Scholarship COE Urgent', desc:'Juan Miguel Reyes • DOST deadline tomorrow', time:'44m ago', unread:true, reqId:'REQ-2026-1047' },
  { id:3, title:'Archival Check Needed', desc:'Alyssa Mae Mendoza Diploma Authentication', time:'2h ago', unread:false, reqId:'REQ-2026-1046' }
];

let REQUESTS = [];
let NOTIFS = JSON.parse(localStorage.getItem('regitrack_notifs') || 'null') || DEFAULT_NOTIFS;
let dashRange = '7D';


async function loadRequests() {
    try {
        const response = await fetch('/admin/api/requests', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || 'Failed to load requests.'
            );
        }

        REQUESTS = result.requests || [];

        console.log('Database Requests:', REQUESTS);
        console.log('Total Database Requests:', REQUESTS.length);

        renderFullDashboard();

    } catch (error) {
        console.error('Failed to load requests:', error);

        REQUESTS = [];
        renderFullDashboard();
    }
}


function openRequestPage() { toast('Request approvals are handled in the Registrar portal.'); }

function statusBadgeClass(st) {
  if (st === 'Pending') return 'p2';
  if (st === 'Processing') return 'p3';
  if (st === 'Released') return 'p4';
  if (st === 'Rejected') return 'pr';
  return 'p1';
}

function toast(msg) {
  const wrap = document.getElementById('ts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<i><svg class="i" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></i><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3300);
}

document.addEventListener('pointermove', e => {
  const target = e.target.closest('.card,.stat');
  if (!target) return;
  const r = target.getBoundingClientRect();
  target.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  target.style.setProperty('--my', (e.clientY - r.top) + 'px');
}, { passive: true });

document.addEventListener('click', e => {
  const btn = e.target.closest('.btn,.chip,.nv');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const s = document.createElement('span');
  const d = Math.max(r.width, r.height) * 1.4;
  s.className = 'rpl';
  s.style.width = s.style.height = d + 'px';
  s.style.left = (e.clientX - r.left - d / 2) + 'px';
  s.style.top = (e.clientY - r.top - d / 2) + 'px';
  btn.appendChild(s);
  setTimeout(() => s.remove(), 620);
});

window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? window.scrollY / h : 0;
  document.getElementById('v4p').style.transform = `scaleX(${pct})`;
  document.getElementById('topbar').classList.toggle('sc', window.scrollY > 10);
}, { passive: true });

const savedTheme = localStorage.getItem('regitrack_theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark' ||
    (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const next = isDark ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('regitrack_theme', next);
  toast(`Switched to ${next} mode`);
}

function togglePop(id, ev) {
  ev.stopPropagation();
  const el = document.getElementById(id);
  const wasOn = el.classList.contains('on');
  closePops();
  if (!wasOn) el.classList.add('on');
}
function closePops() {
  document.querySelectorAll('.pop').forEach(p => p.classList.remove('on'));
  document.getElementById('searchSuggestions').classList.remove('on');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.pw') && !e.target.closest('#globalSearchWrap')) closePops();
});

const gInput = document.getElementById('globalSearchInput');
const gSug = document.getElementById('searchSuggestions');

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    gInput.focus();
  }
  if (e.key === 'Escape') closePops();
});

gInput.addEventListener('input', () => {
  const q = gInput.value.trim().toLowerCase();
  if (!q) { gSug.classList.remove('on'); return; }
  const matches = REQUESTS.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.studentName.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q) ||
    r.studentNo.toLowerCase().includes(q)
  ).slice(0, 5);

  gSug.innerHTML = !matches.length
    ? `<div class="sgh">No requests matching "${gInput.value}"</div>`
    : `<div class="sgh">Matching Requests</div>` + matches.map(r => `
      <div class="sgi" onclick="openRequestPage('${r.id}')">
        <svg class="i" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div class="t">
          <b>${r.studentName} • ${r.type}</b>
          <small>${r.id} • ${r.date}</small>
        </div>
        <em>${r.status}</em>
      </div>
    `).join('');
  gSug.classList.add('on');
});

function renderNotifs() {
  const unreadCount = NOTIFS.filter(n => n.unread).length;
  document.getElementById('notifDot').hidden = unreadCount === 0;
  document.getElementById('notifList').innerHTML = NOTIFS.map(n => `
    <button class="ni ${n.unread ? 'un' : ''}" onclick="openNotif(${n.id}, '${n.reqId}')">
      <div class="ic g" style="width:36px;height:36px;border-radius:11px">
        <svg class="i" style="width:17px;height:17px" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
      </div>
      <div class="t">
        <b>${n.title}</b>
        <span class="mu" style="font-size:12px">${n.desc} • ${n.time}</span>
      </div>
      <span class="ud"></span>
    </button>
  `).join('');
}

function openNotif(id, reqId) {
  const n = NOTIFS.find(x => x.id === id);
  if (n) n.unread = false;
  localStorage.setItem('regitrack_notifs', JSON.stringify(NOTIFS));
  openRequestPage(reqId);
}

function markAllRead() {
  NOTIFS.forEach(n => n.unread = false);
  localStorage.setItem('regitrack_notifs', JSON.stringify(NOTIFS));
  renderNotifs();
  toast('All alerts marked as read');
}

/* ================= ANALYTICS DASHBOARD RENDERING ================= */
function setDashRange(rng, btn) {
    dashRange = rng;

    btn.parentElement.querySelectorAll('.chip').forEach(c => {
        c.classList.remove('on');
    });

    btn.classList.add('on');

    renderFullDashboard();
}

// ============================================================
// DASHBOARD RANGE HELPERS
// ============================================================

function getDashFilteredRequests() {
    const now = new Date();
    const start = new Date(now);

    if (dashRange === '7D') {
        start.setDate(now.getDate() - 6);
    } 
    else if (dashRange === '30D') {
        start.setDate(now.getDate() - 29);
    } 
    else if (dashRange === '12M') {
        start.setMonth(now.getMonth() - 12);
    }

    start.setHours(0, 0, 0, 0);

    return REQUESTS.filter(r => {
        const date = new Date(r.submitted_at);

        return !isNaN(date.getTime()) &&
               date >= start &&
               date <= now;
    });
}

let ANALYTICS = {};

async function loadAnalyticsSummary() {
    try {
        const response = await fetch('/admin/api/analytics', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || 'Failed to retrieve analytics.'
            );
        }

        // Support the API's nested or top-level response structure.
        ANALYTICS = result.data || result.analytics || result;



        renderFullDashboard();

    } catch (error) {
        console.error('Failed to load analytics:', error);

        ANALYTICS = {};
        renderFullDashboard();
    }
}


function renderFullDashboard() {
    // ================= REQUEST STATISTICS =================
  const filteredRequests = getDashFilteredRequests();

    const total = filteredRequests.length;

    const pending = filteredRequests.filter(r =>
        r.status === 'Submitted' ||
        r.status === 'Processing'
    ).length;

    const approved = filteredRequests.filter(r =>
        r.status === 'Approved' ||
        r.status === 'Ready' ||
        r.status === 'Released'
    ).length;

    const rejected = filteredRequests.filter(r =>
        r.status === 'Rejected'
    ).length;

    // Approval rate based on completed decisions
    const decided = approved + rejected;

    const approvalRate = decided > 0
        ? Math.round((approved / decided) * 100)
        : 0;


    // ================= AVERAGE PROCESSING TIME =================

    /*
       This calculation requires each request to have:
       - created_at: request submission date
       - completed_at: date the request was approved/released

       If these fields are unavailable, display N/A
       instead of inventing a processing time.
    */

    const completedRequests = filteredRequests.filter(r =>
        (r.status === 'Approved' ||
         r.status === 'Ready' ||
         r.status === 'Released') &&
        r.created_at &&
        r.completed_at
    );

    // ================= AVERAGE TURNAROUND TIME =================

    const averageTurnaround =
        ANALYTICS.average_turnaround ?? 'No data';


    // ================= RENDER KPI CARDS =================

    document.getElementById('fullDashStats').innerHTML = `

        <!-- TOTAL REQUESTS -->
        <div class="stat card">
            <div class="ic">
                <svg class="i" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16
                             a2 2 0 0 0 2 2h12
                             a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
            </div>

            <div>
                <b>${total.toLocaleString()}</b>
                <span class="mu">Total Requests</span>
            </div>

            <em class="dl">All Time</em>
        </div>


        <!-- ACTIVE QUEUE -->
        <div class="stat card">
            <div class="ic w">
                <svg class="i" viewBox="0 0 24 24">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                    <path d="M5.45 5.11L2 12v6
                             a2 2 0 0 0 2 2h16
                             a2 2 0 0 0 2-2v-6
                             l-3.45-6.89A2 2 0 0 0 16.76 4H7.24
                             a2 2 0 0 0-1.79 1.11z"/>
                </svg>
            </div>

            <div>
                <b>${pending.toLocaleString()}</b>
                <span class="mu">Active Queue</span>
            </div>

            <em class="dl warn">Live</em>
        </div>


        <!-- APPROVAL RATE -->
        <div class="stat card">
            <div class="ic">
                <svg class="i" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>

            <div>
                <b>${approvalRate}%</b>
                <span class="mu">Approval Rate</span>
            </div>

            <em class="dl">${decided} Decided</em>
        </div>


        <!-- AVERAGE PROCESSING TIME -->
        <div class="stat card">
            <div class="ic">
                <svg class="i" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9"/>
                    <polyline points="12 7 12 12 15 15"/>
                </svg>
            </div>

            <div>
                <b>${averageTurnaround}</b>
                <span class="mu">Avg. Processing</span>
            </div>

            <em class="dl">Completed</em>
        </div>

    `;

    renderDashBarChart();
    renderDashDonutChart();
}

function simulateIncomingRequest() {
  const names = [
    ['Andrei Luis Gomez', 'AG', '2023-04112', 'BS Electronics Engineering'],
    ['Beatrice Anne Soriano', 'BS', '2022-09914', 'BS Hospitality Management'],
    ['Carlos Miguel Velasco', 'CV', '2024-03188', 'BS Biology']
  ];
  const types = ['Transcript of Records', 'Certificate of Enrollment', 'Good Moral Certificate'];
  const pick = names[Math.floor(Math.random() * names.length)];
  const tPick = types[Math.floor(Math.random() * types.length)];
  const newId = 'REQ-2026-' + (1049 + REQUESTS.length);

  REQUESTS.unshift({
    id: newId,
    studentName: pick[0],
    initials: pick[1],
    studentNo: pick[2],
    program: pick[3],
    type: tPick,
    date: '2026-11-20',
    time: 'Just now',
    fee: 150,
    paid: true,
    ref: 'OR-' + Math.floor(100000 + Math.random() * 900000) + '-GCASH',
    copies: '1 Official Copy',
    purpose: 'Academic / Scholarship Requirement',
    delivery: 'Registrar Window Pickup',
    email: pick[1].toLowerCase() + '.student@edu.ph',
    phone: '+63 917 555 0199',
    status: 'Pending',
    remarks: '',
    attachments: [{ name: 'Student_ID_Verification.pdf', size: '740 KB' }],
    timeline: [{ text: `New ${tPick} submitted online (₱150.00)`, time: 'Nov 20, 2026 • Just now' }]
  });

  localStorage.setItem('regitrack_requests', JSON.stringify(REQUESTS));
  renderFullDashboard();
  toast(`New request ${newId} received from ${pick[0]}`);
}


function exportCSV() {
  const headers = ['Request ID', 'Student Name', 'Student No', 'Type', 'Date', 'Fee', 'Status'];
  const rows = REQUESTS.map(r => [r.id, `"${r.studentName}"`, r.studentNo, `"${r.type}"`, r.date, r.fee, r.status].join(','));
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'regitrack_requests_export.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('Exported requests to CSV');
}

window.addEventListener('DOMContentLoaded', () => {
  loadInitials();
  renderNotifs();

  loadAnalyticsSummary();
  loadRequests();
  loadAdminLiveFeed();
  // Refresh feed every 30 seconds
  setInterval(loadAdminLiveFeed, 30000);

  loadReportData();
});

function rptData(){const t=document.getElementById('rptType').value,R=REQUESTS,fees=a=>a.filter(r=>r.paid).reduce((s,r)=>s+r.fee,0);
 const grp=f=>{const m={};R.forEach(r=>(m[f(r)]=m[f(r)]||[]).push(r));return Object.entries(m)};
 const pct=n=>R.length?Math.round(n/R.length*100)+'%':'0%';
 if(t==='status')return{head:['Status','Requests','Share','Fees (PHP)'],rows:grp(r=>r.status).map(([k,a])=>[k,a.length,pct(a.length),fees(a)])};
 if(t==='type')return{head:['Document Type','Requests','Approved','Fees (PHP)'],rows:grp(r=>r.type).map(([k,a])=>[k,a.length,a.filter(r=>r.status==='Approved').length,fees(a)])};
 if(t==='program')return{head:['Program','Requests','Approved','Fees (PHP)'],rows:grp(r=>r.program).map(([k,a])=>[k,a.length,a.filter(r=>r.status==='Approved').length,fees(a)])};
 if(t==='fees')return{head:['Document Type','Paid Requests','Avg Fee (PHP)','Total Collected (PHP)'],rows:grp(r=>r.type).map(([k,a])=>{const p=a.filter(r=>r.paid);return[k,p.length,p.length?Math.round(fees(a)/p.length):0,fees(a)]})};
 if(t==='aging'){const ref=Math.max(...R.map(r=>Date.parse(r.date)));return{head:['Request','Student','Waiting (days)','SLA Status'],rows:R.filter(r=>r.status==='Pending'||r.status==='In Review').map(r=>{const w=Math.round((ref-Date.parse(r.date))/864e5);return[r.id,r.studentName,w,w>=2?'Overdue':'On track']})}}
 if(t==='qr')return{head:['Request','Student','Document','QR Pass'],rows:R.filter(r=>r.status==='Approved').map(r=>[r.id,r.studentName,r.type,'Issued'])};
 return{head:['Date','Submitted','Approved','Fees (PHP)'],rows:grp(r=>r.date).sort((x,y)=>y[0].localeCompare(x[0])).map(([k,a])=>[k,a.length,a.filter(r=>r.status==='Approved').length,fees(a)])};}
function renderReport(){const{head,rows}=rptData();document.getElementById('rptTable').innerHTML='<thead><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i?'':' style="font-weight:700"')+'>'+(typeof c==='number'&&i===3?'₱'+c.toLocaleString():c)+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="4" class="mu">No data</td></tr>')+'</tbody>';}
function exportReport(){const{head,rows}=rptData(),name=document.getElementById('rptType').value;const csv=[head,...rows].map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='regitrack_report_'+name+'.csv';a.click();toast('Report exported');}
window.addEventListener('DOMContentLoaded',renderReport);

(function(){
  function titles(){document.querySelectorAll('.side .nv').forEach(function(n){if(!n.title){n.title=n.textContent.replace(/\s+/g,' ').trim().replace(/\d+$/,'').trim()}})}
  titles();document.addEventListener('DOMContentLoaded',titles);
  var on=document.querySelector('.side .nv.on');if(on&&on.scrollIntoView&&innerWidth<=760){try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}
  function t(){var d=new Date(),e=document.getElementById('clk');if(e)e.textContent=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' \u00b7 '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}t();setInterval(t,15000);
})();

async function loadInitials() {
    try {
        const response = await fetch('/auth/me', {
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (data.success && data.user && data.user.full_name) {
            const fullName = data.user.full_name.trim();
            const nameParts = fullName.split(/\s+/);

            const initials = nameParts.length > 1
                ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                : nameParts[0][0];

            document.getElementById('adminInitials').textContent =
                initials.toUpperCase();
        }
    } catch (error) {
        console.error('Failed to load initials:', error);
    }
}



function renderDashBarChart() {
    const chart = document.getElementById('dashBarChart');

    if (!chart) return;

    const filteredRequests = getDashFilteredRequests();
    const now = new Date();

    let labels = [];
    let buckets = [];

    // ========================================================
    // 7 DAYS - DAILY
    // ========================================================

    if (dashRange === '7D') {
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);

            const key = date.toLocaleDateString('en-CA');

            labels.push(date.toLocaleDateString('en-US', {
                weekday: 'short'
            }));

            buckets.push(key);
        }
    }

    // ========================================================
    // 30 DAYS - DAILY
    // ========================================================

    else if (dashRange === '30D') {
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);

            const key = date.toLocaleDateString('en-CA');

            labels.push(date.getDate().toString());

            buckets.push(key);
        }
    }

    // ========================================================
    // 12 MONTHS - MONTHLY
    // ========================================================

    else if (dashRange === '12M') {
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

            const key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, '0')}`;

            labels.push(date.toLocaleDateString('en-US', {
                month: 'short'
            }));

            buckets.push(key);
        }
    }

    // ========================================================
    // COUNT REQUESTS PER BUCKET
    // ========================================================

    const submittedCounts = buckets.map(() => 0);
    const releasedCounts = buckets.map(() => 0);

    filteredRequests.forEach(r => {
        if (!r.submitted_at) return;

        const date = new Date(r.submitted_at);

        if (isNaN(date.getTime())) return;

        let key;

        if (dashRange === '12M') {
            key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, '0')}`;
        } else {
            key = date.toLocaleDateString('en-CA');
        }

        const index = buckets.indexOf(key);

        if (index !== -1) {
            submittedCounts[index]++;

            if (r.status === 'Released') {
                releasedCounts[index]++;
            }
        }
    });

    const ds = {
        labels,
        subm: submittedCounts,
        appr: releasedCounts
    };

    // ========================================================
    // CHART DIMENSIONS
    // ========================================================

    const X0 = 48;
    const X1 = 628;
    const YB = 250;
    const H = 220;

    const maxValue = Math.max(
        ...ds.subm,
        ...ds.appr,
        1
    );

    const step = Math.max(1, Math.ceil(maxValue / 4));
    const top = step * 4;

    const stepW = (X1 - X0) / ds.labels.length;

    const barW = dashRange === '30D'
        ? Math.min(7, stepW * 0.35)
        : Math.min(15, stepW * 0.25);

    chart.setAttribute('viewBox', '0 0 640 288');

    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (filteredRequests.length === 0) {
        chart.innerHTML = `
            <text x="320" y="140"
                text-anchor="middle"
                fill="var(--mu)"
                font-size="13">
                No requests for ${dashRange}
            </text>
        `;
        return;
    }

    // ========================================================
    // RENDER CHART
    // ========================================================

    chart.innerHTML = `
        ${[0, 1, 2, 3, 4].map(k => {
            const y = YB - k * H / 4;

            return `
                <line
                    x1="${X0}"
                    y1="${y}"
                    x2="${X1}"
                    y2="${y}"
                    stroke="${k ? 'var(--bd)' : 'var(--bd2)'}"
                    stroke-width="1"
                />

                <text
                    x="${X0 - 10}"
                    y="${y + 4}"
                    text-anchor="end"
                    fill="var(--mu)"
                    font-size="11"
                    font-weight="500">
                    ${k * step}
                </text>
            `;
        }).join('')}

        ${ds.labels.map((lbl, i) => {
            const cx = X0 + i * stepW + stepW / 2;

            const h1 = Math.round(
                (ds.subm[i] / top) * H
            );

            const h2 = Math.round(
                (ds.appr[i] / top) * H
            );

            return `
                <rect
                    class="br"
                    x="${cx - barW - 1}"
                    y="${YB - h1}"
                    width="${barW}"
                    height="${h1}"
                    rx="2"
                    fill="var(--g7)"
                    style="animation-delay:${i * 0.04}s"
                />

                <rect
                    class="br"
                    x="${cx + 1}"
                    y="${YB - h2}"
                    width="${barW}"
                    height="${h2}"
                    rx="2"
                    fill="var(--or)"
                    style="animation-delay:${i * 0.04 + 0.08}s"
                />

                <text
                    x="${cx}"
                    y="278"
                    text-anchor="middle"
                    fill="var(--mu)"
                    font-size="${dashRange === '30D' ? '9' : '11'}"
                    font-weight="500">
                    ${lbl}
                </text>
            `;
        }).join('')}
    `;
}




function renderDashDonutChart() {
    const donutWrap = document.getElementById('dashDonutWrap');
    const legendWrap = document.getElementById('dashDonutLegend');

    if (!donutWrap || !legendWrap) return;

    const filteredRequests = getDashFilteredRequests();

    // ========================================================
    // GROUP REQUESTS BY DOCUMENT TYPE
    // ========================================================

    const grouped = {};

    filteredRequests.forEach(r => {
        const name = r.document_name || 'Unknown Document';

        grouped[name] = (grouped[name] || 0) + 1;
    });

    const documents = Object.entries(grouped)
        .map(([document_name, request_count]) => ({
            document_name,
            request_count
        }))
        .sort((a, b) => b.request_count - a.request_count);

    // ========================================================
    // TOP THREE + OTHERS
    // ========================================================

    const topThree = documents.slice(0, 3);
    const remainingDocuments = documents.slice(3);

    const otherCount = remainingDocuments.reduce(
        (sum, doc) => sum + doc.request_count,
        0
    );

    const total = filteredRequests.length;

    const colors = [
        'var(--g7)',
        'var(--or)',
        '#6495ED',
        '#A0A0A0'
    ];

    const cats = topThree.map((doc, index) => ({
        name: doc.document_name,
        count: doc.request_count,
        color: colors[index]
    }));

    if (otherCount > 0) {
        cats.push({
            name: 'Others',
            count: otherCount,
            color: colors[3]
        });
    }

    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (total === 0 || cats.length === 0) {
        donutWrap.innerHTML = `
            <div>
                <b>0</b>
                <span class="mu" style="font-size:11.5px">
                    Total Requests
                </span>
            </div>
        `;

        legendWrap.innerHTML = `
            <div class="mu" style="font-size:12px">
                No document request data for ${dashRange}
            </div>
        `;

        return;
    }

    // ========================================================
    // CALCULATE PERCENTAGES
    // ========================================================

    cats.forEach(category => {
        category.pct = (category.count / total) * 100;
    });

    const radius = 60;
    const circ = 2 * Math.PI * radius;

    let offset = 0;

    const segments = cats.map(category => {
        const len = (category.pct / 100) * circ;

        const segment = `
            <circle
                class="ds"
                cx="80"
                cy="80"
                r="${radius}"
                fill="none"
                stroke="${category.color}"
                stroke-width="20"
                stroke-dasharray="${len} ${circ}"
                stroke-dashoffset="${-offset}"
            />
        `;

        offset += len;

        return segment;
    }).join('');

    // ========================================================
    // RENDER DONUT
    // ========================================================

    donutWrap.innerHTML = `
        <svg viewBox="0 0 160 160"
             style="transform:rotate(-90deg)">
            ${segments}
        </svg>

        <div>
            <b>${total.toLocaleString()}</b>
            <span class="mu" style="font-size:11.5px">
                Total Requests
            </span>
        </div>
    `;

    // ========================================================
    // RENDER LEGEND
    // ========================================================

    legendWrap.innerHTML = cats.map(category => `
        <div>
            <i style="background:${category.color}"></i>

            <span>${category.name.replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[char])}</span>

            <b>${category.pct.toFixed(1)}%</b>
        </div>
    `).join('');
}




async function loadAdminLiveFeed() {
    const container = document.getElementById('dashLiveFeed');

    if (!container) return;

    try {
        const response = await fetch('/admin/api/live-feed', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || 'Unable to load admin activity.'
            );
        }

        renderAdminLiveFeed(result.activities || []);

    } catch (error) {
        console.error('Live feed error:', error);

        container.innerHTML = `
            <div class="mu" style="padding:20px;text-align:center;">
                Unable to load recent activities.
            </div>
        `;
    }
}


function renderAdminLiveFeed(activities) {
    const feed = document.getElementById('dashLiveFeed');

    if (!feed) return;

    if (!activities || activities.length === 0) {
        feed.innerHTML = `
            <div class="fi">
                <span class="mu">No recent activities found.</span>
            </div>
        `;
        return;
    }

    feed.innerHTML = activities.slice(0, 5).map(r => {
        const studentName = r.student_name || 'Unknown Student';
        const documentName = r.document_name || 'Document Request';
        const initials = studentName
            .split(' ')
            .filter(Boolean)
            .map(name => name[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const status = r.status || 'Submitted';

        return `
            <div class="fi" style="cursor:pointer"
                 onclick="openRequestPage('${r.request_id}')">

                <div class="av">${escapeHTML(initials)}</div>

                <div style="flex:1;min-width:0">
                    <b>${escapeHTML(studentName)} • ${escapeHTML(documentName)}</b>
                    <span class="mu">
                        ${escapeHTML(status)}
                        ${r.submitted_at ? ' • ' + new Date(r.submitted_at).toLocaleString('en-PH') : ''}
                    </span>
                </div>

                <span class="pill ${statusBadgeClass(status === 'Submitted' ? 'Pending' : status)}">
                    ${escapeHTML(status === 'Submitted' ? 'Pending' : status)}
                </span>
            </div>
        `;
    }).join('');
}



// ============================================================
// REPORTS - DATABASE CONNECTED
// ============================================================

let REPORT_REQUESTS = [];

// ============================================================
// LOAD REPORT DATA FROM DATABASE
// ============================================================

async function loadReportData() {
    const table = document.getElementById('rptTable');

    if (table) {
        table.innerHTML = `
            <tbody>
                <tr>
                    <td colspan="10" class="mu">Loading reports...</td>
                </tr>
            </tbody>
        `;
    }

    try {
        const response = await fetch('/admin/api/reports', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load reports.');
        }

        REPORT_REQUESTS = result.requests || [];

        renderReport();

    } catch (error) {
        console.error('Reports loading error:', error);

        if (table) {
            table.innerHTML = `
                <tbody>
                    <tr>
                        <td colspan="10" class="mu">
                            Unable to load report data.
                        </td>
                    </tr>
                </tbody>
            `;
        }
    }
}

// ============================================================
// REPORT UTILITIES
// ============================================================

function reportDate(value) {
    if (!value) return '';

    const date = new Date(value);

    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-PH');
}

function reportDateKey(value) {
    if (!value) return 'Unknown';

    return String(value).substring(0, 10);
}

function reportMoney(value) {
    return '₱' + Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function reportIsCompleted(r) {
    return r.status === 'Ready for Pickup' || r.status === 'Released';
}

function reportIsRejected(r) {
    return r.status === 'Rejected';
}

function reportIsPending(r) {
    return [
        'Submitted',
        'Under Review',
        'Processing',
        'On Hold'
    ].includes(r.status);
}

function reportGroupBy(field) {
    const groups = {};

    REPORT_REQUESTS.forEach(r => {
        const key = r[field] || 'Unspecified';

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(r);
    });

    return Object.entries(groups);
}

function reportPercentage(count, total) {
    return total
        ? Math.round((count / total) * 100) + '%'
        : '0%';
}

// ============================================================
// REPORT DATA GENERATOR
// ============================================================

function rptData() {
    const type = document.getElementById('rptType').value;
    const R = REPORT_REQUESTS;

    // Only released requests are used as a fee proxy.
    // This is NOT verified payment data.
    const releasedFees = requests =>
        requests
            .filter(r => r.status === 'Released')
            .reduce((sum, r) => sum + Number(r.total_fee || 0), 0);

    // --------------------------------------------------------
    // REQUESTS BY STATUS
    // --------------------------------------------------------

    if (type === 'status') {
        return {
            head: [
                'Status',
                'Requests',
                'Share',
                'Fees (PHP)'
            ],

            rows: reportGroupBy('status').map(([status, requests]) => [
                status,
                requests.length,
                reportPercentage(requests.length, R.length),
                releasedFees(requests)
            ])
        };
    }

    // --------------------------------------------------------
    // BY DOCUMENT TYPE
    // --------------------------------------------------------

    if (type === 'type') {
        return {
            head: [
                'Document Type',
                'Requests',
                'Ready / Released',
                'Fees (PHP)'
            ],

            rows: reportGroupBy('document_name').map(([name, requests]) => [
                name,
                requests.length,
                requests.filter(reportIsCompleted).length,
                releasedFees(requests)
            ])
        };
    }

    // --------------------------------------------------------
    // BY PROGRAM
    // --------------------------------------------------------

    if (type === 'program') {
        return {
            head: [
                'Program',
                'Requests',
                'Ready / Released',
                'Fees (PHP)'
            ],

            rows: reportGroupBy('program').map(([program, requests]) => [
                program,
                requests.length,
                requests.filter(reportIsCompleted).length,
                releasedFees(requests)
            ])
        };
    }

    // --------------------------------------------------------
    // DAILY ACTIVITY
    // --------------------------------------------------------

    if (type === 'daily') {
        const dailyGroups = reportGroupBy('submitted_at')
            .map(([date, requests]) => {
                return [
                    reportDateKey(date),
                    requests.length,
                    requests.filter(reportIsCompleted).length,
                    releasedFees(requests)
                ];
            });

        return {
            head: [
                'Date',
                'Submitted',
                'Ready / Released',
                'Fees (PHP)'
            ],

            rows: dailyGroups.sort((a, b) =>
                b[0].localeCompare(a[0])
            )
        };
    }

    // --------------------------------------------------------
    // FEES
    // --------------------------------------------------------

    if (type === 'fees') {
        return {
            head: [
                'Document Type',
                'Released Requests',
                'Avg Fee (PHP)',
                'Total Fees (PHP)'
            ],

            rows: reportGroupBy('document_name').map(([name, requests]) => {

                const released = requests.filter(
                    r => r.status === 'Released'
                );

                const total = releasedFees(requests);

                return [
                    name,
                    released.length,
                    released.length
                        ? total / released.length
                        : 0,
                    total
                ];
            })
        };
    }

    // --------------------------------------------------------
    // PENDING REQUEST AGING
    // --------------------------------------------------------

    if (type === 'aging') {
        const pendingRequests = R.filter(reportIsPending);

        return {
            head: [
                'Request',
                'Student',
                'Document',
                'Waiting (Days)',
                'SLA Status'
            ],

            rows: pendingRequests.map(r => {
                const submitted = new Date(r.submitted_at);
                const now = new Date();

                const waiting = isNaN(submitted.getTime())
                    ? 0
                    : Math.max(
                        0,
                        Math.floor(
                            (now - submitted) / 86400000
                        )
                    );

                return [
                    r.reference_number || r.request_id,
                    r.student_name,
                    r.document_name,
                    waiting,
                    waiting >= 2 ? 'Overdue' : 'On track'
                ];
            }).sort((a, b) => b[3] - a[3])
        };
    }

    // --------------------------------------------------------
    // QR PICKUP PASSES
    // --------------------------------------------------------

    if (type === 'qr') {
        // Actual QR issuance cannot be confirmed without
        // the QR-pass database table or issuance field.
        // This report only displays pickup-eligible requests.

        return {
            head: [
                'Request',
                'Student',
                'Document',
                'Pickup Status'
            ],

            rows: R.filter(r =>
                r.status === 'Ready for Pickup' ||
                r.status === 'Released'
            ).map(r => [
                r.reference_number || r.request_id,
                r.student_name,
                r.document_name,
                r.status
            ])
        };
    }

    return {
        head: [],
        rows: []
    };
}


// ============================================================
// RENDER REPORT TABLE
// ============================================================

function renderReport() {
    const table = document.getElementById('rptTable');

    if (!table) return;

    const { head, rows } = rptData();

    const headerHTML = `
        <thead>
            <tr>
                ${head.map(h => `<th>${escapeHTML(h)}</th>`).join('')}
            </tr>
        </thead>
    `;

    const bodyHTML = rows.length
        ? `
            <tbody>
                ${rows.map(row => `
                    <tr>
                        ${row.map((cell, i) => `
                            <td${i === 0 ? ' style="font-weight:700"' : ''}>
                                ${typeof cell === 'number' && head[i].includes('(PHP)')
                                    ? reportMoney(cell)
                                    : escapeHTML(cell)}
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `
        : `
            <tbody>
                <tr>
                    <td colspan="${head.length}" class="mu">
                        No data
                    </td>
                </tr>
            </tbody>
        `;

    table.innerHTML = headerHTML + bodyHTML;
}


// ============================================================
// EXPORT REPORT TO CSV
// ============================================================

function exportReport() {
    const { head, rows } = rptData();

    const name = document.getElementById('rptType').value;

    const csv = [head, ...rows]
        .map(row =>
            row.map(cell =>
                '"' + String(cell ?? '').replace(/"/g, '""') + '"'
            ).join(',')
        )
        .join('\n');

    const blob = new Blob(
        ['\uFEFF' + csv],
        { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'regitrack_report_' + name + '.csv';

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    if (typeof toast === 'function') {
        toast('Report exported');
    }
}


