// ==========================================
// REGITRACK ROUTING
// ==========================================

(function () {
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

        setRole: function (v) {
            this.role = v || null;

            try {
                sessionStorage.setItem('rt-role', v || '');
            } catch (e) {}
        },

        go: function (target) {
            var raw = String(target || '');
            var hash = '';
            var query = '';
            var i = raw.indexOf('#');

            if (i >= 0) {
                hash = raw.slice(i);
                raw = raw.slice(0, i);
            }

            i = raw.indexOf('?');

            if (i >= 0) {
                query = raw.slice(i);
                raw = raw.slice(0, i);
            }

            var name = raw.split('/').pop();
            var dest = routes[name] || name;

            if (dest.indexOf('../') === 0) {
                location.href = dest + query + hash;
            } else {
                location.href = dest + query + hash;
            }
        }
    };

    if (!window.RT.role) {
        window.RT.role = currentRole;
    }

    window.__RT_QS = '';
    window.__RT_HASH = location.hash || '';

    try {
        Object.defineProperty(window, '__nav', {
            configurable: true,

            set: function (v) {
                window.RT.go(String(v));
            }
        });
    } catch (e) {
        window.__nav = '';
    }

    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');

        if (!a) return;

        var hr = a.getAttribute('href');

        if (/^(main|requests|request-detail|scan|dashboard|admin-users|admin-audit|admin-settings|student-main)\.html([?#]|$)/.test(hr)) {
            e.preventDefault();
            window.RT.go(hr);
        }
    }, true);

})();


// ==========================================
// THEME INITIALIZATION
// ==========================================

try {
    var initialTheme = localStorage.getItem('regitrack_theme');

    if (initialTheme) {
        document.documentElement.setAttribute('data-theme', initialTheme);
    }
} catch (e) {}


// ==========================================
// DEFAULT REQUEST DATA
// ==========================================

const DEFAULT_REQUESTS = [
    {
        id: 'REQ-2026-1048',
        studentName: 'Maria Clara Santos',
        initials: 'MC',
        studentNo: '2022-04819',
        program: 'BS Computer Science (4th Yr)',
        type: 'Transcript of Records',
        date: '2026-11-20',
        time: '09:14 AM',
        fee: 250,
        paid: true,
        ref: 'OR-994821-GCASH',
        copies: '2 Official Copies (Sealed)',
        purpose: 'Board Examination & Employment',
        delivery: 'Registrar Window Pickup',
        email: 'mc.santos@student.edu.ph',
        phone: '+63 917 482 1904',
        status: 'Pending',
        remarks: '',
        attachments: [
            {
                name: 'Valid_Student_ID_FrontBack.pdf',
                size: '1.2 MB'
            },
            {
                name: 'Department_Clearance_Slip.pdf',
                size: '640 KB'
            }
        ],
        timeline: [
            {
                text: 'Student submitted request online and paid ₱250.00',
                time: 'Nov 20, 2026 • 09:14 AM'
            },
            {
                text: 'Automated payment receipt verified (OR-994821-GCASH)',
                time: 'Nov 20, 2026 • 09:15 AM'
            }
        ]
    },

    {
        id: 'REQ-2026-1047',
        studentName: 'Juan Miguel Reyes',
        initials: 'JM',
        studentNo: '2023-11204',
        program: 'BS Civil Engineering (3rd Yr)',
        type: 'Certificate of Enrollment',
        date: '2026-11-20',
        time: '08:42 AM',
        fee: 100,
        paid: true,
        ref: 'OR-994810-MAYA',
        copies: '1 Digital + 1 Printed Copy',
        purpose: 'DOST Scholarship Renewal',
        delivery: 'Digital PDF + Window Pickup',
        email: 'jm.reyes@student.edu.ph',
        phone: '+63 918 331 9082',
        status: 'Pending',
        remarks: '',
        attachments: [
            {
                name: 'Enrollment_Assessment_Form_1stSem.pdf',
                size: '890 KB'
            }
        ],
        timeline: [
            {
                text: 'Student submitted request online and paid ₱100.00',
                time: 'Nov 20, 2026 • 08:42 AM'
            }
        ]
    },

    {
        id: 'REQ-2026-1046',
        studentName: 'Alyssa Mae Mendoza',
        initials: 'AM',
        studentNo: '2021-00932',
        program: 'BS Accountancy (Alumni)',
        type: 'Diploma Authentication',
        date: '2026-11-20',
        time: '07:55 AM',
        fee: 300,
        paid: true,
        ref: 'OR-994799-BANK',
        copies: '3 Certified True Copies',
        purpose: 'DFA Apostille / Overseas Application',
        delivery: 'LBC Express Courier',
        email: 'alyssa.mendoza@alumni.edu.ph',
        phone: '+63 905 712 4410',
        status: 'In Review',
        remarks: 'Verifying archival graduation roll #2025-B.',
        attachments: [
            {
                name: 'Scanned_Original_Diploma.pdf',
                size: '2.4 MB'
            },
            {
                name: 'Government_Passport_ID.pdf',
                size: '1.1 MB'
            }
        ],
        timeline: [
            {
                text: 'Alumni submitted authentication request (₱300.00)',
                time: 'Nov 20, 2026 • 07:55 AM'
            },
            {
                text: 'Admin marked request In Review for archival check',
                time: 'Nov 20, 2026 • 08:20 AM'
            }
        ]
    },

    {
        id: 'REQ-2026-1045',
        studentName: 'Rafael Carlo Bautista',
        initials: 'RB',
        studentNo: '2024-07741',
        program: 'BS Information Technology (2nd Yr)',
        type: 'Good Moral Certificate',
        date: '2026-11-19',
        time: '04:30 PM',
        fee: 120,
        paid: true,
        ref: 'OR-994765-GCASH',
        copies: '1 Official Copy',
        purpose: 'Student Exchange Program',
        delivery: 'Registrar Window Pickup',
        email: 'rc.bautista@student.edu.ph',
        phone: '+63 927 889 1203',
        status: 'Pending',
        remarks: '',
        attachments: [
            {
                name: 'OSA_No_Violation_Clearance.pdf',
                size: '510 KB'
            }
        ],
        timeline: [
            {
                text: 'Student submitted request online and paid ₱120.00',
                time: 'Nov 19, 2026 • 04:30 PM'
            }
        ]
    },

    {
        id: 'REQ-2026-1044',
        studentName: 'Sofia Isabel Lim',
        initials: 'SL',
        studentNo: '2022-03910',
        program: 'BS Nursing (4th Yr)',
        type: 'Transcript of Records',
        date: '2026-11-19',
        time: '02:18 PM',
        fee: 250,
        paid: true,
        ref: 'OR-994740-MAYA',
        copies: '2 Official Copies',
        purpose: 'PRC Licensure Examination',
        delivery: 'Registrar Window Pickup',
        email: 'si.lim@student.edu.ph',
        phone: '+63 917 650 3319',
        status: 'Approved',
        remarks: 'Signed by University Registrar. Ready at Window 2.',
        attachments: [
            {
                name: 'Clinical_Completion_Cert.pdf',
                size: '1.5 MB'
            },
            {
                name: 'Student_ID_Scan.pdf',
                size: '720 KB'
            }
        ],
        timeline: [
            {
                text: 'Student submitted request online (₱250.00)',
                time: 'Nov 19, 2026 • 02:18 PM'
            },
            {
                text: 'Approved by Registrar Admin — Ready at Window 2',
                time: 'Nov 19, 2026 • 04:05 PM'
            }
        ]
    },

    {
        id: 'REQ-2026-1043',
        studentName: 'Gabriel Jose Villanueva',
        initials: 'GV',
        studentNo: '2023-08812',
        program: 'BS Business Administration (3rd Yr)',
        type: 'Honorable Dismissal',
        date: '2026-11-18',
        time: '11:05 AM',
        fee: 350,
        paid: true,
        ref: 'OR-994698-BANK',
        copies: '1 Transfer Credential Set',
        purpose: 'Transfer to Another University',
        delivery: 'Registrar Window Pickup',
        email: 'gj.villanueva@student.edu.ph',
        phone: '+63 919 204 7711',
        status: 'Pending',
        remarks: '',
        attachments: [
            {
                name: 'Library_Accounting_Clearance.pdf',
                size: '980 KB'
            },
            {
                name: 'Parent_Consent_Letter.pdf',
                size: '430 KB'
            }
        ],
        timeline: [
            {
                text: 'Student submitted transfer credential request (₱350.00)',
                time: 'Nov 18, 2026 • 11:05 AM'
            }
        ]
    },

    {
        id: 'REQ-2026-1042',
        studentName: 'Camille Anne Torres',
        initials: 'CT',
        studentNo: '2022-06123',
        program: 'BA Communication (4th Yr)',
        type: 'Course Evaluation',
        date: '2026-11-17',
        time: '03:48 PM',
        fee: 150,
        paid: true,
        ref: 'OR-994650-GCASH',
        copies: '1 Official Summary',
        purpose: 'Graduation Candidacy Check',
        delivery: 'Digital PDF via Email',
        email: 'ca.torres@student.edu.ph',
        phone: '+63 916 554 9021',
        status: 'Approved',
        remarks: 'All 168 required units verified and complete.',
        attachments: [
            {
                name: 'Curriculum_Checklist_2022.pdf',
                size: '780 KB'
            }
        ],
        timeline: [
            {
                text: 'Student requested graduation unit evaluation (₱150.00)',
                time: 'Nov 17, 2026 • 03:48 PM'
            },
            {
                text: 'Approved by Registrar Admin — Digital copy sent',
                time: 'Nov 18, 2026 • 09:30 AM'
            }
        ]
    },

    {
        id: 'REQ-2026-1041',
        studentName: 'Mark Anthony Cruz',
        initials: 'MC',
        studentNo: '2024-02190',
        program: 'BS Mechanical Engineering (2nd Yr)',
        type: 'Certificate of Enrollment',
        date: '2026-11-15',
        time: '10:12 AM',
        fee: 100,
        paid: true,
        ref: 'OR-994590-MAYA',
        copies: '1 Official Copy',
        purpose: 'SSS / Dependent Benefit Claim',
        delivery: 'Registrar Window Pickup',
        email: 'ma.cruz@student.edu.ph',
        phone: '+63 928 411 6602',
        status: 'Approved',
        remarks: 'Released to student representative with authorization.',
        attachments: [
            {
                name: 'Registration_Form_2026.pdf',
                size: '670 KB'
            }
        ],
        timeline: [
            {
                text: 'Student submitted request online (₱100.00)',
                time: 'Nov 15, 2026 • 10:12 AM'
            },
            {
                text: 'Approved by Registrar Admin',
                time: 'Nov 15, 2026 • 01:40 PM'
            }
        ]
    },

    {
        id: 'REQ-2026-1040',
        studentName: 'Patricia Joy Aquino',
        initials: 'PA',
        studentNo: '2021-05411',
        program: 'BS Psychology (Alumni)',
        type: 'Transcript of Records',
        date: '2026-11-12',
        time: '01:25 PM',
        fee: 250,
        paid: true,
        ref: 'OR-994512-GCASH',
        copies: '1 Official Copy',
        purpose: 'Graduate School Admission',
        delivery: 'LBC Express Courier',
        email: 'pj.aquino@alumni.edu.ph',
        phone: '+63 917 902 4418',
        status: 'Rejected',
        remarks: 'Accounting hold detected (₱1,200 library fine). Please settle at Cashier first.',
        attachments: [
            {
                name: 'Alumni_ID_Scan.pdf',
                size: '540 KB'
            }
        ],
        timeline: [
            {
                text: 'Alumni submitted TOR request (₱250.00)',
                time: 'Nov 12, 2026 • 01:25 PM'
            },
            {
                text: 'Rejected due to uncleared library balance',
                time: 'Nov 12, 2026 • 04:10 PM'
            }
        ]
    },

    {
        id: 'REQ-2026-1039',
        studentName: 'Lorenzo Miguel Navarro',
        initials: 'LN',
        studentNo: '2023-09531',
        program: 'BS Architecture (3rd Yr)',
        type: 'Good Moral Certificate',
        date: '2026-11-05',
        time: '09:50 AM',
        fee: 120,
        paid: true,
        ref: 'OR-994401-BANK',
        copies: '1 Official Copy',
        purpose: 'OJT / Internship Application',
        delivery: 'Digital PDF via Email',
        email: 'lm.navarro@student.edu.ph',
        phone: '+63 906 774 2189',
        status: 'Approved',
        remarks: 'Verified clean disciplinary record.',
        attachments: [
            {
                name: 'Internship_Endorsement.pdf',
                size: '820 KB'
            }
        ],
        timeline: [
            {
                text: 'Student submitted request online (₱120.00)',
                time: 'Nov 05, 2026 • 09:50 AM'
            },
            {
                text: 'Approved by Registrar Admin',
                time: 'Nov 05, 2026 • 02:15 PM'
            }
        ]
    }
];


// ==========================================
// DEFAULT NOTIFICATIONS
// ==========================================

const DEFAULT_NOTIFS = [
    {
        id: 1,
        title: 'New TOR Request #1048',
        desc: 'Maria Clara Santos submitted payment receipt',
        time: '12m ago',
        unread: true,
        reqId: 'REQ-2026-1048'
    },
    {
        id: 2,
        title: 'Scholarship COE Urgent',
        desc: 'Juan Miguel Reyes • DOST deadline tomorrow',
        time: '44m ago',
        unread: true,
        reqId: 'REQ-2026-1047'
    },
    {
        id: 3,
        title: 'Archival Check Needed',
        desc: 'Alyssa Mae Mendoza Diploma Authentication',
        time: '2h ago',
        unread: false,
        reqId: 'REQ-2026-1046'
    }
];


// ==========================================
// LOCAL STORAGE DATA
// ==========================================

let REQUESTS =
    JSON.parse(localStorage.getItem('regitrack_requests') || 'null')
    || DEFAULT_REQUESTS;

let NOTIFS =
    JSON.parse(localStorage.getItem('regitrack_notifs') || 'null')
    || DEFAULT_NOTIFS;

let statusFilter =
    new URLSearchParams(window.__RT_QS || "").get('status')
    || 'all';


// ==========================================
// OPEN REQUEST DETAIL PAGE
// ==========================================

function openRequestPage(reqId) {
    localStorage.setItem('regitrack_selected_req', reqId);

    window.__nav =
        `request-detail.html?id=${encodeURIComponent(reqId)}`;
}


// ==========================================
// STATUS BADGE
// ==========================================

function statusBadgeClass(st) {
    if (st === 'Pending') return 'p2';
    if (st === 'In Review') return 'p3';
    if (st === 'Approved') return 'p4';
    if (st === 'Rejected') return 'pr';

    return 'p1';
}


// ==========================================
// TOAST NOTIFICATION
// ==========================================

function toast(msg) {
    const wrap = document.getElementById('ts');

    if (!wrap) return;

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


// ==========================================
// CARD POINTER EFFECT
// ==========================================

document.addEventListener('pointermove', e => {
    const target = e.target.closest('.card');

    if (!target) return;

    const r = target.getBoundingClientRect();

    target.style.setProperty(
        '--mx',
        (e.clientX - r.left) + 'px'
    );

    target.style.setProperty(
        '--my',
        (e.clientY - r.top) + 'px'
    );

}, { passive: true });


// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================

document.addEventListener('click', e => {
    const btn = e.target.closest('.btn,.chip,.nv');

    if (!btn) return;

    const r = btn.getBoundingClientRect();

    const s = document.createElement('span');

    const d = Math.max(r.width, r.height) * 1.4;

    s.className = 'rpl';

    s.style.width = s.style.height = d + 'px';

    s.style.left =
        (e.clientX - r.left - d / 2) + 'px';

    s.style.top =
        (e.clientY - r.top - d / 2) + 'px';

    btn.appendChild(s);

    setTimeout(() => s.remove(), 620);
});


// ==========================================
// SCROLL PROGRESS
// ==========================================

window.addEventListener('scroll', () => {
    const h =
        document.documentElement.scrollHeight - window.innerHeight;

    const pct = h > 0 ? window.scrollY / h : 0;

    const progress = document.getElementById('v4p');
    const topbar = document.getElementById('topbar');

    if (progress) {
        progress.style.transform = `scaleX(${pct})`;
    }

    if (topbar) {
        topbar.classList.toggle('sc', window.scrollY > 10);
    }

}, { passive: true });


// ==========================================
// THEME SWITCHING
// ==========================================

const savedTheme = localStorage.getItem('regitrack_theme');

if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
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


// ==========================================
// POPUP MANAGEMENT
// ==========================================

function togglePop(id, ev) {
    if (ev) ev.stopPropagation();

    const el = document.getElementById(id);

    if (!el) return;

    const wasOn = el.classList.contains('on');

    closePops();

    if (!wasOn) {
        el.classList.add('on');
    }
}

function closePops() {
    document.querySelectorAll('.pop').forEach(p => {
        p.classList.remove('on');
    });

    const suggestions =
        document.getElementById('searchSuggestions');

    if (suggestions) {
        suggestions.classList.remove('on');
    }
}


// ==========================================
// GLOBAL SEARCH
// ==========================================

const gInput =
    document.getElementById('globalSearchInput');

const gSug =
    document.getElementById('searchSuggestions');


// KEYBOARD SHORTCUT
document.addEventListener('keydown', e => {
    if (
        e.key === '/' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
    ) {
        e.preventDefault();

        if (gInput) {
            gInput.focus();
        }
    }

    if (e.key === 'Escape') {
        closePops();
    }
});


// SEARCH INPUT
if (gInput && gSug) {

    gInput.addEventListener('input', () => {
        const q = gInput.value.trim().toLowerCase();

        if (!q) {
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
}


// CLOSE POPOVERS WHEN CLICKING OUTSIDE
document.addEventListener('click', e => {
    if (
        !e.target.closest('.pw') &&
        !e.target.closest('#globalSearchWrap')
    ) {
        closePops();
    }
});


// ==========================================
// NOTIFICATIONS
// ==========================================

function renderNotifs() {
    const unreadCount =
        NOTIFS.filter(n => n.unread).length;

    const dot = document.getElementById('notifDot');
    const list = document.getElementById('notifList');

    if (dot) {
        dot.hidden = unreadCount === 0;
    }

    if (!list) return;

    list.innerHTML = NOTIFS.map(n => `
        <button class="ni ${n.unread ? 'un' : ''}"
            onclick="openNotif(${n.id}, '${n.reqId}')">

            <div class="ic g"
                style="width:36px;height:36px;border-radius:11px">

                <svg class="i"
                    style="width:17px;height:17px"
                    viewBox="0 0 24 24">

                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>

                </svg>
            </div>

            <div class="t">
                <b>${n.title}</b>
                <span class="mu" style="font-size:12px">
                    ${n.desc} • ${n.time}
                </span>
            </div>

            <span class="ud"></span>

        </button>
    `).join('');
}


// OPEN NOTIFICATION
function openNotif(id, reqId) {
    const n = NOTIFS.find(x => x.id === id);

    if (n) {
        n.unread = false;
    }

    localStorage.setItem(
        'regitrack_notifs',
        JSON.stringify(NOTIFS)
    );

    openRequestPage(reqId);
}


// MARK ALL NOTIFICATIONS AS READ
function markAllRead() {
    NOTIFS.forEach(n => {
        n.unread = false;
    });

    localStorage.setItem(
        'regitrack_notifs',
        JSON.stringify(NOTIFS)
    );

    renderNotifs();

    toast('All alerts marked as read');
}


// ==========================================
// REQUEST TYPE FILTER
// ==========================================

function populateTypeFilter() {
    const types = [
        ...new Set(REQUESTS.map(r => r.type))
    ];

    const sel = document.getElementById('filterType');

    if (!sel) return;

    sel.innerHTML =
        `<option value="all">All Request Types</option>` +
        types.map(t => `
            <option value="${t}">${t}</option>
        `).join('');
}


// ==========================================
// DATE FILTER
// ==========================================

function applyDatePreset() {
    const preset = document.getElementById('filterDatePreset').value;

    const fromEl = document.getElementById('filterDateFrom');
    const toEl = document.getElementById('filterDateTo');

    // Get today's date using local time.
    const today = new Date();

    // Reset time to avoid date calculation issues.
    today.setHours(0, 0, 0, 0);

    // Format as YYYY-MM-DD using local date, not UTC.
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    const endDate = new Date(today);
    const startDate = new Date(today);

    if (preset === 'all') {
        fromEl.value = '';
        toEl.value = '';
    }

    else if (preset === 'today') {
        fromEl.value = formatDate(today);
        toEl.value = formatDate(today);
    }

    else if (preset === '7d') {
        startDate.setDate(today.getDate() - 6);

        fromEl.value = formatDate(startDate);
        toEl.value = formatDate(endDate);
    }

    else if (preset === '30d') {
        startDate.setDate(today.getDate() - 29);

        fromEl.value = formatDate(startDate);
        toEl.value = formatDate(endDate);
    }

    renderRequestList();
}


// CUSTOM DATE RANGE
function onCustomDateChange() {
    document.getElementById('filterDatePreset').value = 'custom';

    renderRequestList();
}


// ==========================================
// STATUS FILTER
// ==========================================

function setStatusFilter(st, btn) {
    statusFilter = st;

    document.querySelectorAll('#statusChips .chip').forEach(c => {
        c.classList.remove('on');
    });

    btn.classList.add('on');

    renderRequestList();
}


// ==========================================
// RESET FILTERS
// ==========================================

function resetRequestFilters() {
    document.getElementById('reqSearchInput').value = '';

    document.getElementById('filterType').value = 'all';

    document.getElementById('filterDatePreset').value = 'all';

    document.getElementById('filterDateFrom').value = '';

    document.getElementById('filterDateTo').value = '';

    statusFilter = 'all';

    document.querySelectorAll('#statusChips .chip').forEach(c => {
        c.classList.toggle('on', c.dataset.st === 'all');
    });

    renderRequestList();
}


// ==========================================
// RENDER REQUEST LIST
// ==========================================

function renderRequestList() {

    // UPDATE PENDING BADGE
    const pending = REQUESTS.filter(r =>
        r.status === 'Pending' ||
        r.status === 'In Review'
    ).length;

    const badge =
        document.getElementById('navPendingBadge');

    if (badge) {
        badge.textContent = pending;
    }


    // GET FILTER VALUES
    const q =
        document.getElementById('reqSearchInput').value.trim().toLowerCase();

    const typeVal =
        document.getElementById('filterType').value;

    const fromDate =
        document.getElementById('filterDateFrom').value;

    const toDate =
        document.getElementById('filterDateTo').value;


    // FILTER REQUESTS
    const filtered = REQUESTS.filter(r => {

        if (
            statusFilter !== 'all' &&
            r.status !== statusFilter
        ) {
            return false;
        }

        if (
            typeVal !== 'all' &&
            r.type !== typeVal
        ) {
            return false;
        }

        if (fromDate && r.date < fromDate) {
            return false;
        }

        if (toDate && r.date > toDate) {
            return false;
        }

        if (q && !(
            r.id.toLowerCase().includes(q) ||
            r.studentName.toLowerCase().includes(q) ||
            r.studentNo.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q)
        )) {
            return false;
        }

        return true;
    });


    // UPDATE COUNTER
    document.getElementById('reqCountLabel').textContent =
        `${filtered.length} request${filtered.length === 1 ? '' : 's'}`;

    document.getElementById('reqListTitle').textContent =
        statusFilter === 'all'
            ? 'All Filtered Requests'
            : `${statusFilter} Requests`;


    const tbody =
        document.getElementById('reqTableBody');

    const empty =
        document.getElementById('reqEmptyState');

    const wrap =
        document.getElementById('reqTableWrap');


    // EMPTY STATE
    if (!filtered.length) {
        wrap.hidden = true;
        empty.hidden = false;
        return;
    }

    wrap.hidden = false;
    empty.hidden = true;


    // DISPLAY REQUESTS
    tbody.innerHTML = filtered.map(r => `
        <tr onclick="openRequestPage('${r.id}')">

            <td>
                <b style="color:var(--g7)">${r.id}</b>
            </td>

            <td>
                <div class="who">

                    <div class="av">${r.initials}</div>

                    <div>
                        <b style="display:block">${r.studentName}</b>

                        <span class="mu" style="font-size:12px">
                            ${r.studentNo}
                        </span>
                    </div>

                </div>
            </td>

            <td>
                <b>${r.type}</b>
            </td>

            <td>
                <span>${r.date}</span>

                <small class="mu"
                    style="display:block;font-size:11.5px">
                    ${r.time}
                </small>
            </td>

            <td>
                <b>₱${r.fee}.00</b>
            </td>

            <td>
                <span class="pill ${statusBadgeClass(r.status)}">
                    ${r.status}
                </span>
            </td>

            <td style="text-align:right">
                <button class="btn ol xs"
                    onclick="event.stopPropagation();openRequestPage('${r.id}')">
                    Inspect
                </button>
            </td>

        </tr>
    `).join('');
}


// ==========================================
// LOGOUT
// ==========================================

function logoutAdmin() {
    closePops();

    localStorage.removeItem('regitrack_selected_req');

    window.__nav = 'student-main.html#login';
}


// ==========================================
// EXPORT CSV
// ==========================================

function exportCSV() {
    const headers = [
        'Request ID',
        'Student Name',
        'Student No',
        'Type',
        'Date',
        'Fee',
        'Status'
    ];

    const rows = REQUESTS.map(r => [
        r.id,
        `"${r.studentName}"`,
        r.studentNo,
        `"${r.type}"`,
        r.date,
        r.fee,
        r.status
    ].join(','));

    const blob = new Blob(
        [[headers.join(','), ...rows].join('\n')],
        { type: 'text/csv' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'regitrack_requests_export.csv';

    a.click();

    URL.revokeObjectURL(url);

    toast('Exported requests to CSV');
}


// ==========================================
// INITIALIZE PAGE
// ==========================================

window.addEventListener('DOMContentLoaded', () => {

    populateTypeFilter();

    document.querySelectorAll('#statusChips .chip').forEach(c => {
        c.classList.toggle(
            'on',
            c.dataset.st === statusFilter
        );
    });

    renderNotifs();

    renderRequestList();


    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');

    if (!status) return;

    const filterButton = document.querySelector(
        `.chip[data-st="${status}"]`
    );

    if (filterButton) {
        filterButton.click();
    }
});


// ==========================================
// LAYOUT V5 JAVASCRIPT
// ==========================================

(function () {

    function titles() {
        document.querySelectorAll('.side .nv').forEach(function (n) {

            if (!n.title) {
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

    if (
        on &&
        on.scrollIntoView &&
        innerWidth <= 760
    ) {
        try {
            on.scrollIntoView({
                inline: 'center',
                block: 'nearest'
            });
        } catch (e) {}
    }

    // DATE AND TIME
    function updateClock() {
        var d = new Date();

        var e = document.getElementById('clk');

        if (e) {
            e.textContent =
                d.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                }) +
                ' · ' +
                d.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                });
        }
    }

    updateClock();

    setInterval(updateClock, 15000);

})();
