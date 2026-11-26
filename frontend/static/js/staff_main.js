
// =========================================================
// ROUTING AND NAVIGATION
// Originally located inside the HTML <head>
// =========================================================

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

            if(dest.indexOf('../') === 0){
                location.href = dest + query + hash;
            } else {
                location.href = dest + query + hash;
            }
        }
    };

    if(!window.RT.role){
        window.RT.role = currentRole;
    }

    window.__RT_QS = '';
    window.__RT_HASH = location.hash || '';

    try {
        Object.defineProperty(window, '__nav', {
            configurable: true,

            set: function(v){
                window.RT.go(String(v));
            }
        });
    } catch(e){
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


// =========================================================
// THEME INITIALIZATION
// Originally located inside the HTML <head>
// =========================================================

try {
    var __t = localStorage.getItem('regitrack_theme');

    if(__t){
        document.documentElement.setAttribute('data-theme', __t);
    }
} catch(e){}


// =========================================================
// REQUEST NAVIGATION
// =========================================================

function openRequestPage(reqId, statusFilter){

    if(reqId){
        localStorage.setItem('regitrack_selected_req', reqId);
    }

    if(statusFilter){
        window.__nav = `requests.html?status=${encodeURIComponent(statusFilter)}`;
    } else {
        window.__nav = `request-detail.html?id=${encodeURIComponent(reqId)}`;
    }
}


// =========================================================
// HELPERS & MICRO-INTERACTIONS
// =========================================================

function statusBadgeClass(st){

    if(st === 'Pending') return 'p2';
    if(st === 'In Review') return 'p3';
    if(st === 'Approved') return 'p4';
    if(st === 'Rejected') return 'pr';

    return 'p1';
}


function toast(msg){

    const wrap = document.getElementById('ts');
    const el = document.createElement('div');

    el.className = 'toast';

    el.innerHTML = `
        <i>
            <svg class="i" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        </i>
        <span>${msg}</span>
    `;

    wrap.appendChild(el);

    setTimeout(() => el.remove(), 3300);
}


// Pointer movement effects
document.addEventListener('pointermove', e => {

    const target = e.target.closest('.card,.tile,.stat,.row');

    if(!target) return;

    const r = target.getBoundingClientRect();

    target.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    target.style.setProperty('--my', (e.clientY - r.top) + 'px');

}, { passive:true });


// Ripple effects
document.addEventListener('click', e => {

    const btn = e.target.closest('.btn,.nv,.row');

    if(!btn) return;

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


// Scroll progress bar and topbar state
window.addEventListener('scroll', () => {

    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? window.scrollY / h : 0;

    document.getElementById('v4p').style.transform = `scaleX(${pct})`;

    document.getElementById('topbar').classList.toggle('sc', window.scrollY > 10);

}, { passive:true });


// =========================================================
// THEME SYNC
// =========================================================

const savedTheme = localStorage.getItem('regitrack_theme');

if(savedTheme){
    document.documentElement.setAttribute('data-theme', savedTheme);
}


function toggleTheme(){

    const root = document.documentElement;

    const isDark =
        root.getAttribute('data-theme') === 'dark' ||
        (
            !root.getAttribute('data-theme') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        );

    const next = isDark ? 'light' : 'dark';

    root.setAttribute('data-theme', next);

    localStorage.setItem('regitrack_theme', next);

    toast(`Switched to ${next} mode`);
}


// =========================================================
// POPOVERS
// =========================================================

function togglePop(id, ev){

    ev.stopPropagation();

    const el = document.getElementById(id);
    const wasOn = el.classList.contains('on');

    closePops();

    if(!wasOn){
        el.classList.add('on');
    }
}


function closePops(){

    document.querySelectorAll('.pop').forEach(p => {
        p.classList.remove('on');
    });

    document.getElementById('searchSuggestions').classList.remove('on');
}


// Close popovers when clicking outside
document.addEventListener('click', e => {

    if(
        !e.target.closest('.pw') &&
        !e.target.closest('#globalSearchWrap')
    ){
        closePops();
    }
});


// =========================================================
// GLOBAL SEARCH
// =========================================================

const gInput = document.getElementById('globalSearchInput');
const gSug = document.getElementById('searchSuggestions');


document.addEventListener('keydown', e => {

    if(
        e.key === '/' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
    ){
        e.preventDefault();
        gInput.focus();
    }

    if(e.key === 'Escape'){
        closePops();
        closeModal();
    }
});


gInput.addEventListener('input', () => {

    const q = gInput.value.trim().toLowerCase();

    if(!q){
        gSug.classList.remove('on');
        return;
    }

    const matches = REQUESTS.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.studentNo.toLowerCase().includes(q)
    ).slice(0, 5);


    gSug.innerHTML = !matches.length

        ? `<div class="sgh">No requests matching "${gInput.value}"</div>`

        : `<div class="sgh">Matching Requests</div>` +

        matches.map(r => `
            <div class="sgi" onclick="openRequestPage('${r.id}')">

                <svg class="i" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>

                <div class="t">
                    <b>${r.studentName} • ${r.type}</b>
                    <small>${r.id} • ${r.date}</small>
                </div>

                <em>${r.status}</em>

            </div>
        `).join('');


    gSug.classList.add('on');
});


// =========================================================
// NOTIFICATIONS
// =========================================================

function renderNotifs(){

    const unreadCount = NOTIFS.filter(n => n.unread).length;

    document.getElementById('notifDot').hidden = unreadCount === 0;

    document.getElementById('notifList').innerHTML = NOTIFS.map(n => `

        <button class="ni ${n.unread ? 'un' : ''}"
                onclick="openNotif(${n.id}, '${n.reqId}')">

            <div class="ic g" style="width:36px;height:36px;border-radius:11px">

                <svg class="i" style="width:17px;height:17px" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                </svg>

            </div>

            <div class="t">
                <b>${n.title}</b>
                <span class="mu" style="font-size:12px">${n.desc} • ${n.time}</span>
            </div>

            <span class="ud"></span>

        </button>

    `).join('');
}


function openNotif(id, reqId){

    const n = NOTIFS.find(x => x.id === id);

    if(n){
        n.unread = false;
    }

    saveState();

    openRequestPage(reqId);
}


function markAllRead(){

    NOTIFS.forEach(n => n.unread = false);

    saveState();
    renderNotifs();

    toast('All alerts marked as read');
}




// =========================================================
// MODAL
// =========================================================

function closeModal(){}


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



// =========================================================
// INITIALIZE MAIN PAGE
// =========================================================

window.addEventListener('DOMContentLoaded', () => {
    loadHeaderProfile();
    loadRegistrarDashboard();
    updateDashboardDate();
});


// =========================================================
// LAYOUT V5 JAVASCRIPT
// Originally located after <style id="layout-v5">
// =========================================================

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


    // Live date and time
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



async function loadHeaderProfile() {
    try {
        const response = await fetch('/auth/me', {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Failed to load staff profile');
        }

        const data = await response.json();

        if (!data.success || !data.user) {
            throw new Error('Staff account data unavailable');
        }

        const user = data.user;
        const fullName = user.full_name || 'Registrar Staff';
        const email = user.email || 'No email available';

        const initials = fullName
            .split(/\s+/)
            .filter(Boolean)
            .map(name => name[0])
            .join('')
            .toUpperCase();

        // Header profile
        const avatar = document.getElementById('ab');
        if (avatar) avatar.textContent = initials;

        // Profile popup
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');

        if (profileName) profileName.textContent = fullName;
        if (profileEmail) profileEmail.textContent = email;

    } catch (error) {
        console.error('Error loading staff header profile:', error);
    }
}




// ==========================================
// REGISTRAR DASHBOARD
// ==========================================

async function loadRegistrarDashboard() {
    try {
        const response = await fetch('/registrar/api/dashboard', {
            method: 'GET',
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Unable to load registrar dashboard.'
            );
        }

        renderDashboardStatistics(data.statistics);
        renderRecentRequests(data.recent_requests);
        renderWeeklyThroughput(data.weekly_throughput);

        const turnaroundElement =
            document.getElementById('avgTurnaround');

        if (turnaroundElement) {
            turnaroundElement.textContent =
                data.average_turnaround || 'No data';
        }

        updateDashboardDate();

    } catch (error) {
        console.error('Registrar dashboard error:', error);

        const headline = document.getElementById('heroHeadline');

        if (headline) {
            headline.textContent = 'Unable to load dashboard data';
        }

        const recentRequests =
            document.getElementById('mainRecentRequests');

        if (recentRequests) {
            recentRequests.textContent =
                'Unable to retrieve recent requests.';
        }
    }
}


// ==========================================
// DASHBOARD DATE
// ==========================================

function updateDashboardDate() {
    const dateElement = document.getElementById('dashboardDate');

    if (!dateElement) return;

    dateElement.textContent = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date());
}


// ==========================================
// MINI DASHBOARD STATISTICS
// ==========================================

function renderDashboardStatistics(stats) {
    const total = Number(stats.total_requests || 0);
    const ready = Number(stats.ready_requests || 0);
    const released = Number(stats.released_requests || 0);
    const rejected = Number(stats.rejected_requests || 0);

    // All statuses except Ready for Pickup, Released, and Rejected.
    const needsAction = Math.max(0, total - ready - released - rejected);

    // Approved = Ready for Pickup + Released.
    const approved = ready + released;

    const container = document.getElementById('miniStatsGrid');
    if (!container) return;

    container.innerHTML = `
        <a href="request_list" class="stat card">

            <div class="ic g">
                <svg class="i" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
            </div>

            <div>
                <b>${total}</b>
                <span class="mu">Total Requests</span>
            </div>

            <em class="dl">All Requests</em>

        </a>

        <a href="request_list?status=Pending" class="stat card">

            <div class="ic">
                <svg class="i" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9"/>
                    <polyline points="12 7 12 12 15 15"/>
                </svg>
            </div>

            <div>
                <b>${needsAction}</b>
                <span class="mu">Needs Action</span>
            </div>

            <em class="dl warn">Queue</em>

        </a>

        <a href="request_list?status=Approved" class="stat card">

            <div class="ic g">
                <svg class="i" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>

            <div>
                <b>${approved}</b>
                <span class="mu">Approved</span>
            </div>

            <em class="dl">Ready / Released</em>

        </a>

        <a href="request_list?status=Rejected" class="stat card">

            <div class="ic">
                <svg class="i" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>

            <div>
                <b>${rejected}</b>
                <span class="mu">Rejected</span>
            </div>

            <em class="dl warn">Review</em>

        </a>
    `;

    // Update hero headline.
    const headline = document.getElementById('heroHeadline');

    if (headline) {
        headline.textContent = `${needsAction} Requests Need Action`;
    }

    // Update completion ring.
    const completionRate = Math.min(
        100,
        Math.max(0, Number(stats.completion_rate || 0))
    );

    const ring = document.getElementById('heroRingCircle');
    const ringText = document.getElementById('heroRingPct');

    if (ring) {
        const circumference = 2 * Math.PI * 44;

        ring.setAttribute(
            'stroke-dasharray',
            `${(completionRate / 100) * circumference} ${circumference}`
        );
    }

    if (ringText) {
        ringText.textContent = `${completionRate}%`;
    }

    // Update navigation badge.
    const navBadge = document.getElementById('navPendingBadge');

    if (navBadge) {
        navBadge.textContent = needsAction;
        navBadge.style.display = needsAction > 0 ? '' : 'none';
    }
}


// ==========================================
// RECENT REQUEST LISTINGS
// ==========================================

function formatRequestDateTime(dateValue) {
    if (!dateValue) return 'Date unavailable';

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return 'Date unavailable';

    const formattedDate = date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const formattedTime = date.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return `${formattedDate} (${formattedTime})`;
}

function renderRecentRequests(requests) {
    const container = document.getElementById('mainRecentRequests');
    if (!container) return;

    if (!requests || requests.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <p class="mu">No recent requests found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = requests.slice(0, 5).map(r => {
        const status = r.status || 'Unknown';
        const isApproved = ['Ready for Pickup', 'Released'].includes(status);

        return `
            <button class="row" onclick="openRequestPage('${r.request_id}')">

                <div class="ic ${isApproved ? 'g' : ''}">
                    <svg class="i" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                </div>

                <div class="t">
                    <b>${r.student_name || 'Unknown Student'} — ${r.document_name || 'Document Request'}</b>
                    <span class="mu">
                        ${r.reference_number || r.request_id} •
                        ${formatRequestDateTime(r.submitted_at)}
                    </span>
                </div>

                <span class="pill ${getRequestStatusClass(status)}">${status}</span>

            </button>
        `;
    }).join('');
}


// ==========================================
// REQUEST STATUS BADGE
// ==========================================

function getRequestStatusClass(status) {
    const normalized = String(status || '').toLowerCase();

    const statusClasses = {
        'submitted': 'p2',
        'under review': 'p3',
        'processing': 'p3',
        'ready for pickup': 'p4',
        'released': 'p4',
        'rejected': 'pr',
        'cancelled': 'pr',
        'on hold': 'p1'
    };

    return statusClasses[normalized] || 'p1';
}


// ==========================================
// WEEKLY THROUGHPUT CHART
// ==========================================

function renderWeeklyThroughput(weeklyData) {
    const svg = document.getElementById('miniBarSvg');

    if (!svg) return;

    svg.replaceChildren();

    if (!Array.isArray(weeklyData) || weeklyData.length === 0) {
        return;
    }

    const namespace = 'http://www.w3.org/2000/svg';

    function createSvgElement(tag, attributes, textContent) {
        const element = document.createElementNS(namespace, tag);

        Object.entries(attributes || {}).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        if (textContent !== undefined) {
            element.textContent = textContent;
        }

        return element;
    }

    const chartWidth = 320;
    const chartHeight = 155;
    const chartTop = 15;
    const chartBottom = 120;
    const chartHeightAvailable = chartBottom - chartTop;

    const maxValue = Math.max(
        1,
        ...weeklyData.map(day =>
            Math.max(
                Number(day.incoming || 0),
                Number(day.approved || 0)
            )
        )
    );

    const groupWidth = chartWidth / 7;
    const barWidth = 9;
    const barGap = 3;

    weeklyData.forEach((day, index) => {
        const centerX = index * groupWidth + groupWidth / 2;

        const incoming = Number(day.incoming || 0);
        const approved = Number(day.approved || 0);

        const incomingHeight =
            (incoming / maxValue) * chartHeightAvailable;

        const approvedHeight =
            (approved / maxValue) * chartHeightAvailable;

        const incomingX = centerX - barWidth - barGap / 2;
        const approvedX = centerX + barGap / 2;

        const incomingY = chartBottom - incomingHeight;
        const approvedY = chartBottom - approvedHeight;

        svg.appendChild(
            createSvgElement('rect', {
                x: incomingX,
                y: incomingY,
                width: barWidth,
                height: Math.max(incomingHeight, 1),
                rx: 3,
                fill: 'var(--or, #d97706)'
            })
        );

        svg.appendChild(
            createSvgElement('rect', {
                x: approvedX,
                y: approvedY,
                width: barWidth,
                height: Math.max(approvedHeight, 1),
                rx: 3,
                fill: 'var(--p4, #16a34a)'
            })
        );

        svg.appendChild(
            createSvgElement(
                'text',
                {
                    x: centerX,
                    y: 143,
                    'text-anchor': 'middle',
                    fill: 'currentColor',
                    'font-size': '10'
                },
                day.day
            )
        );
    });

    // Chart baseline
    svg.appendChild(
        createSvgElement('line', {
            x1: 5,
            y1: chartBottom,
            x2: 315,
            y2: chartBottom,
            stroke: 'currentColor',
            'stroke-opacity': '0.15'
        })
    );
}


// ==========================================
// OPEN NEXT PENDING REQUEST
// ==========================================

function openNextPending() {
    window.location.href = 'requests.html?status=Submitted';
}



