/* ================= ROUTING ================= */
(function(){
  var currentRole = "registrar";

  var routes = {
    'main.html': '../Registrar/main.html',
    'requests.html': '../Registrar/requestList.html',
    'request-detail.html': '../Registrar/RequestPage.html',
    'scan.html': '../Registrar/Scan&Claim.html',
    'dashboard.html': '../Admin/analytics.html',
    'admin-users.html': '../Admin/User&Role.html',
    'admin-audit.html': '../Admin/Log.html',
    'admin-settings.html': '../Admin/Settings.html',
    'student-main.html': '../Extra/accounts.html',
    'accounts.html': '../Extra/accounts.html',
    'loginPage.html': '../Extra/loginPage.html'
  };

  window.RT = window.RT || {
    role: currentRole,

    setRole: function(v){
      this.role = v || null;
      try {
        sessionStorage.setItem('rt-role', v || '');
      } catch(e){}
    },

    go: function(target){
      var raw = String(target || '');
      var hash = '';
      var query = '';
      var i = raw.indexOf('#');

      if(i >= 0){
        hash = raw.slice(i);
        raw = raw.slice(0, i);
      }

      i = raw.indexOf('?');

      if(i >= 0){
        query = raw.slice(i);
        raw = raw.slice(0, i);
      }

      var name = raw.split('/').pop();
      var dest = routes[name] || name;

      location.href = dest + query + hash;
    }
  };

  if(!window.RT.role) window.RT.role = currentRole;

  window.__RT_QS = '';
  window.__RT_HASH = location.hash || '';

  try {
    Object.defineProperty(window, '__nav', {
      configurable: true,
      set: function(v){
        window.RT.go(String(v));
      }
    });
  } catch(e) {
    window.__nav = '';
  }

  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if(!a) return;

    var hr = a.getAttribute('href');

    if(/^(main|requests|request-detail|scan|dashboard|admin-users|admin-audit|admin-settings|student-main)\.html([?#]|$)/.test(hr)){
      e.preventDefault();
      window.RT.go(hr);
    }
  }, true);
})();

/* ================= THEME INITIALIZATION ================= */
try {
  var __t = localStorage.getItem('regitrack_theme');
  if(__t) document.documentElement.setAttribute('data-theme', __t);
} catch(e){}


/* ================= SCAN & CLAIM ================= */

const DEFAULT_NOTIFS = [
  {
    id:1,
    title:'New TOR Request #1048',
    desc:'Maria Clara Santos submitted payment receipt',
    time:'12m ago',
    unread:true
  },
  {
    id:2,
    title:'Scholarship COE Urgent',
    desc:'Juan Miguel Reyes • DOST deadline tomorrow',
    time:'44m ago',
    unread:true
  },
  {
    id:3,
    title:'Archival Check Needed',
    desc:'Alyssa Mae Mendoza Diploma Authentication',
    time:'2h ago',
    unread:false
  }
];

let NOTIFS = JSON.parse(localStorage.getItem('regitrack_notifs') || 'null') || DEFAULT_NOTIFS;
let REQUESTS = JSON.parse(localStorage.getItem('regitrack_requests') || 'null') || [];

const PASSES = {
  'RG-4K9A2X': {
    req:'REQ-2026-1048',
    name:'Maria Clara Santos',
    doc:'Transcript of Records',
    no:'2022-04819',
    state:'active'
  },

  'RG-8TQ1ZM': {
    req:'REQ-2026-1047',
    name:'Juan Miguel Reyes',
    doc:'Certificate of Enrollment',
    no:'2023-11204',
    state:'active'
  },

  'RG-2PW7LC': {
    req:'REQ-2026-1045',
    name:'Rafael Carlo Bautista',
    doc:'Good Moral Certificate',
    no:'2024-07741',
    state:'redeemed'
  }
};

let LOG = [
  {
    t:'Nov 20 · 3:42 PM',
    req:'REQ-2026-1045',
    name:'Rafael Carlo Bautista',
    doc:'Good Moral Certificate',
    code:'RG-2PW7LC'
  },
  {
    t:'Nov 20 · 11:05 AM',
    req:'REQ-2026-1043',
    name:'Gabriel Jose Villanueva',
    doc:'Honorable Dismissal',
    code:'RG-7HD2QN'
  },
  {
    t:'Nov 19 · 2:30 PM',
    req:'REQ-2026-1041',
    name:'Mark Anthony Cruz',
    doc:'Certificate of Enrollment',
    code:'RG-5MC8RV'
  }
];

let stats = {ver:0, rej:0};
let cur = null;
let stream = null;


/* ================= TOAST ================= */

function toast(msg){
  const w = document.getElementById('ts');
  const el = document.createElement('div');

  el.className = 'toast';

  el.innerHTML =
    '<i><svg class="i" viewBox="0 0 24 24">' +
    '<polyline points="20 6 9 17 4 12"/>' +
    '</svg></i><span>' + msg + '</span>';

  w.appendChild(el);

  setTimeout(() => el.remove(), 3300);
}


/* ================= ESCAPE HTML ================= */

function esc(s){
  return String(s).replace(/[&<>"]/g, c => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;'
  }[c]));
}


/* ================= RENDER CLAIM LOG ================= */

function renderLog(){
  document.getElementById('logBody').innerHTML = LOG.map(l =>
    '<tr style="cursor:default">' +
      '<td>' + esc(l.t) + '</td>' +
      '<td><b style="color:var(--g7)">' + esc(l.req) + '</b></td>' +
      '<td><b>' + esc(l.name) + '</b></td>' +
      '<td>' + esc(l.doc) + '</td>' +
      '<td><code>' + esc(l.code) + '</code></td>' +
      '<td><span class="pill p5">Redeemed</span></td>' +
    '</tr>'
  ).join('');

  document.getElementById('logCount').textContent =
    LOG.length + ' entr' + (LOG.length === 1 ? 'y' : 'ies');

  document.getElementById('sVer').textContent = stats.ver;
  document.getElementById('sCl').textContent = LOG.length;
  document.getElementById('sRej').textContent = stats.rej;
}


/* ================= VERIFY PASS ================= */

function verify(raw){
  const code = String(raw || '').trim().toUpperCase();

  if(!code){
    toast('Enter or scan a pass code first.');
    return;
  }

  const p = PASSES[code];
  const res = document.getElementById('res');

  cur = null;

  if(!p){
    stats.rej++;

    res.className = 'res bad';

    res.innerHTML =
      '<h3><svg class="i" viewBox="0 0 24 24" style="color:#a52727">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<line x1="15" y1="9" x2="9" y2="15"/>' +
      '<line x1="9" y1="9" x2="15" y2="15"/>' +
      '</svg>Invalid pass</h3>' +
      '<p>No pickup pass matches <b>' + esc(code) +
      '</b>. Do not release any document.</p>';
  }

  else if(p.state === 'redeemed'){
    stats.rej++;

    const l = LOG.find(x => x.code === code);

    res.className = 'res used';

    res.innerHTML =
      '<h3><svg class="i" viewBox="0 0 24 24" style="color:#b3600a">' +
      '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>' +
      '<line x1="12" y1="9" x2="12" y2="13"/>' +
      '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
      '</svg>Already redeemed</h3>' +
      '<p><b>' + esc(p.doc) + '</b> for ' + esc(p.name) +
      ' was already claimed' +
      (l ? ' on ' + esc(l.t) : '') +
      '. This pass cannot be reused.</p>';
  }

  else {
    stats.ver++;
    cur = code;

    res.className = 'res ok';

    res.innerHTML =
      '<h3><svg class="i" viewBox="0 0 24 24" style="color:#12703a">' +
      '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>' +
      '<polyline points="22 4 12 14.01 9 11.01"/>' +
      '</svg>Valid pass</h3>' +

      '<div class="kv"><span>Student</span><b>' + esc(p.name) + '</b></div>' +
      '<div class="kv"><span>Student no.</span><b>' + esc(p.no) + '</b></div>' +
      '<div class="kv"><span>Document</span><b>' + esc(p.doc) + '</b></div>' +
      '<div class="kv"><span>Request</span><b>' + esc(p.req) + '</b></div>' +
      '<div class="kv"><span>Pass code</span><b>' + esc(code) + '</b></div>' +

      '<button class="btn w" style="margin-top:14px" onclick="claim()">' +
      '<svg class="i" viewBox="0 0 24 24">' +
      '<polyline points="20 6 9 17 4 12"/>' +
      '</svg>' +
      '<span>Confirm document claim</span>' +
      '</button>';
  }

  renderLog();
}


/* ================= CONFIRM CLAIM ================= */

function claim(){
  if(!cur) return;

  const p = PASSES[cur];
  p.state = 'redeemed';

  const n = new Date();

  LOG.unshift({
    t:'Nov 21 · ' + n.toLocaleTimeString([], {
      hour:'numeric',
      minute:'2-digit'
    }),
    req:p.req,
    name:p.name,
    doc:p.doc,
    code:cur
  });

  document.getElementById('res').className = 'res ok';

  document.getElementById('res').innerHTML =
    '<h3><svg class="i" viewBox="0 0 24 24" style="color:#12703a">' +
    '<polyline points="20 6 9 17 4 12"/>' +
    '</svg>Claim logged</h3>' +

    '<p><b>' + esc(p.doc) + '</b> released to ' + esc(p.name) +
    '. QR pass <b>' + esc(cur) +
    '</b> is now marked <b>redeemed</b> and can no longer be used.</p>';

  toast('Claim logged · ' + cur + ' redeemed');

  cur = null;
  renderLog();
}


/* ================= CAMERA ================= */

async function toggleCam(){
  const b = document.getElementById('camBtn').querySelector('span');
  const st = document.getElementById('camState');

  if(stream){
    stream.getTracks().forEach(t => t.stop());
    stream = null;

    vid.hidden = true;
    camPh.hidden = false;
    camFr.hidden = camLn.hidden = true;

    b.textContent = 'Start camera';
    st.textContent = 'Camera off';
    st.className = 'pill p1';

    return;
  }

  try {
    const rear = document.getElementById('camSel').selectedIndex === 1;

    stream = await navigator.mediaDevices.getUserMedia({
      video:{
        facingMode: rear ? 'environment' : 'user'
      }
    });

    vid.srcObject = stream;
    vid.hidden = false;
    vid.play();

    camPh.hidden = true;
    camFr.hidden = camLn.hidden = false;

    b.textContent = 'Stop camera';
    st.textContent = 'Scanning…';
    st.className = 'pill p4';

  } catch(e) {
    toast('Camera unavailable. Use the code box or demo scans.');

    st.textContent = 'Camera blocked';
    st.className = 'pill pr';
  }
}


/* ================= EXPORT CLAIM LOG ================= */

function exportClaims(){
  const rows = LOG.map(l =>
    [
      l.t,
      l.req,
      '"' + l.name + '"',
      '"' + l.doc + '"',
      l.code,
      'Redeemed'
    ].join(',')
  );

  const blob = new Blob([
    ['Time,Request ID,Student,Document,Pass code,QR status']
      .concat(rows)
      .join('\n')
  ], {
    type:'text/csv'
  });

  const a = document.createElement('a');

  a.href = URL.createObjectURL(blob);
  a.download = 'regitrack_claim_log.csv';
  a.click();

  toast('Exported claim log');
}


/* ================= THEME ================= */

const savedTheme = localStorage.getItem('regitrack_theme');

if(savedTheme){
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme(){
  const r = document.documentElement;

  const d =
    r.getAttribute('data-theme') === 'dark' ||
    (!r.getAttribute('data-theme') &&
    matchMedia('(prefers-color-scheme: dark)').matches);

  const n = d ? 'light' : 'dark';

  r.setAttribute('data-theme', n);
  localStorage.setItem('regitrack_theme', n);

  toast('Switched to ' + n + ' mode');
}


/* ================= POPOVERS ================= */

function togglePop(id, ev){
  ev.stopPropagation();

  const el = document.getElementById(id);
  const w = el.classList.contains('on');

  closePops();

  if(!w) el.classList.add('on');
}

function closePops(){
  document.querySelectorAll('.pop').forEach(p => {
    p.classList.remove('on');
  });

  document.getElementById('searchSuggestions').classList.remove('on');
}

document.addEventListener('click', e => {
  if(
    !e.target.closest('.pw') &&
    !e.target.closest('#globalSearchWrap')
  ){
    closePops();
  }
});


/* ================= REQUEST NAVIGATION ================= */

function openRequestPage(id){
  localStorage.setItem('regitrack_selected_req', id);
  window.__nav = 'request-detail.html?id=' + encodeURIComponent(id);
}


/* ================= GLOBAL SEARCH ================= */

const gIn = document.getElementById('globalSearchInput');
const gSug = document.getElementById('searchSuggestions');

gIn.addEventListener('input', () => {
  const q = gIn.value.trim().toLowerCase();

  if(!q){
    gSug.classList.remove('on');
    return;
  }

  const m = REQUESTS.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.studentName.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q)
  ).slice(0, 5);

  gSug.innerHTML = !m.length
    ? '<div class="sgh">No requests matching "' + esc(gIn.value) + '"</div>'
    : '<div class="sgh">Matching Requests</div>' +
      m.map(r =>
        '<div class="sgi" onclick="openRequestPage(\'' + r.id + '\')">' +
          '<div class="t">' +
            '<b>' + esc(r.studentName) + ' • ' + esc(r.type) + '</b>' +
            '<small>' + r.id + '</small>' +
          '</div>' +
          '<em>' + r.status + '</em>' +
        '</div>'
      ).join('');

  gSug.classList.add('on');
});


/* ================= NOTIFICATIONS ================= */

function renderNotifs(){
  document.getElementById('notifDot').hidden =
    !NOTIFS.some(n => n.unread);

  document.getElementById('notifList').innerHTML =
    NOTIFS.map(n =>
      '<button class="ni ' + (n.unread ? 'un' : '') + '" onclick="markAllRead()">' +
        '<div class="t">' +
          '<b>' + esc(n.title) + '</b>' +
          '<span class="mu" style="font-size:12px">' +
            esc(n.desc) + ' • ' + n.time +
          '</span>' +
        '</div>' +
        '<span class="ud"></span>' +
      '</button>'
    ).join('');
}

function markAllRead(){
  NOTIFS.forEach(n => n.unread = false);

  localStorage.setItem(
    'regitrack_notifs',
    JSON.stringify(NOTIFS)
  );

  renderNotifs();
}


/* ================= LOGOUT ================= */

function logoutAdmin(){
  closePops();

  localStorage.removeItem('regitrack_selected_req');

  window.__nav = 'student-main.html#login';
}


/* ================= REQUEST LIST EXPORT PLACEHOLDER ================= */

function exportCSV(){
  toast('Use the Request List page to export requests');
}


/* ================= SCROLL PROGRESS ================= */

window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - innerHeight;

  document.getElementById('v4p').style.transform =
    'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';

  document.getElementById('topbar').classList.toggle(
    'sc',
    scrollY > 10
  );
}, {
  passive:true
});


/* ================= INITIALIZATION ================= */

window.addEventListener('DOMContentLoaded', () => {
  renderNotifs();
  renderLog();

  const nb = document.getElementById('navPendingBadge');

  if(nb){
    nb.textContent =
      REQUESTS.filter(r =>
        r.status === 'Pending' ||
        r.status === 'In Review'
      ).length || 5;
  }
});


/* ================= LAYOUT V5 ================= */

(function(){
  function titles(){
    document.querySelectorAll('.side .nv').forEach(function(n){
      if(!n.title){
        n.title = n.textContent
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\d+$/, '')
          .trim();
      }
    });
  }

  titles();
  document.addEventListener('DOMContentLoaded', titles);

  var on = document.querySelector('.side .nv.on');

  if(on && on.scrollIntoView && innerWidth <= 760){
    try {
      on.scrollIntoView({
        inline:'center',
        block:'nearest'
      });
    } catch(e){}
  }

  function t(){
    var d = new Date();
    var e = document.getElementById('clk');

    if(e){
      e.textContent =
        d.toLocaleDateString('en-US', {
          weekday:'short',
          month:'short',
          day:'numeric'
        }) +
        ' · ' +
        d.toLocaleTimeString('en-US', {
          hour:'numeric',
          minute:'2-digit'
        });
    }
  }

  t();
  setInterval(t, 15000);
})();

// =========================================================
// LOGOUT
// =========================================================
async function logoutStaff() {
    try {
        // Check whether the current session is authenticated
        const authCheck = await fetch("/auth/me", {
            method: "GET",
            credentials: "same-origin"
        });

        if (!authCheck.ok) {
            console.error("Session check failed:", authCheck.status);
            alert("Your session has expired. Please log in again.");
            window.location.href = "/";
            return;
        }

        // Send logout request
        const response = await fetch("/auth/logout", {
            method: "POST",
            credentials: "same-origin"
        });

        const data = await response.json();

        if (response.ok && data.success) {
            window.location.href = "/";
        } else {
            console.error("Logout failed:", response.status, data);
            alert("Unable to log out. Please try again.");
        }

    } catch (error) {
        console.error("Logout error:", error);
        alert("An error occurred while logging out.");
    }
}