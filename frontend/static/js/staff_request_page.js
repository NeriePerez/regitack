
// =========================================================
// REGITRACK REQUEST PAGE
// JavaScript
// =========================================================


// =========================================================
// 1. ROUTING AND NAVIGATION
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
// 2. THEME INITIALIZATION
// =========================================================

(function(){
    try {
        var theme = localStorage.getItem('regitrack_theme');

        if(theme){
            document.documentElement.setAttribute('data-theme', theme);
        }
    } catch(e){}
})();


// =========================================================
// 3. DEFAULT REQUEST DATA
// =========================================================

const DEFAULT_REQUESTS = [
    {
        id:'REQ-2026-1048',
        studentName:'Maria Clara Santos',
        initials:'MC',
        studentNo:'2022-04819',
        program:'BS Computer Science (4th Yr)',
        type:'Transcript of Records',
        date:'2026-11-20',
        time:'09:14 AM',
        fee:250,
        paid:true,
        ref:'OR-994821-GCASH',
        copies:'2 Official Copies (Sealed)',
        purpose:'Board Examination & Employment',
        delivery:'Registrar Window Pickup',
        email:'mc.santos@student.edu.ph',
        phone:'+63 917 482 1904',
        status:'Pending',
        remarks:'',
        attachments:[
            {name:'Valid_Student_ID_FrontBack.pdf',size:'1.2 MB'},
            {name:'Department_Clearance_Slip.pdf',size:'640 KB'}
        ],
        timeline:[
            {
                text:'Student submitted request online and paid ₱250.00',
                time:'Nov 20, 2026 • 09:14 AM'
            },
            {
                text:'Automated payment receipt verified (OR-994821-GCASH)',
                time:'Nov 20, 2026 • 09:15 AM'
            }
        ]
    },

    {
        id:'REQ-2026-1047',
        studentName:'Juan Miguel Reyes',
        initials:'JM',
        studentNo:'2023-11204',
        program:'BS Civil Engineering (3rd Yr)',
        type:'Certificate of Enrollment',
        date:'2026-11-20',
        time:'08:42 AM',
        fee:100,
        paid:true,
        ref:'OR-994810-MAYA',
        copies:'1 Digital + 1 Printed Copy',
        purpose:'DOST Scholarship Renewal',
        delivery:'Digital PDF + Window Pickup',
        email:'jm.reyes@student.edu.ph',
        phone:'+63 918 331 9082',
        status:'Pending',
        remarks:'',
        attachments:[
            {name:'Enrollment_Assessment_Form_1stSem.pdf',size:'890 KB'}
        ],
        timeline:[
            {
                text:'Student submitted request online and paid ₱100.00',
                time:'Nov 20, 2026 • 08:42 AM'
            }
        ]
    },

    {
        id:'REQ-2026-1046',
        studentName:'Alyssa Mae Mendoza',
        initials:'AM',
        studentNo:'2021-00932',
        program:'BS Accountancy (Alumni)',
        type:'Diploma Authentication',
        date:'2026-11-20',
        time:'07:55 AM',
        fee:300,
        paid:true,
        ref:'OR-994799-BANK',
        copies:'3 Certified True Copies',
        purpose:'DFA Apostille / Overseas Application',
        delivery:'LBC Express Courier',
        email:'alyssa.mendoza@alumni.edu.ph',
        phone:'+63 905 712 4410',
        status:'In Review',
        remarks:'Verifying archival graduation roll #2025-B.',
        attachments:[
            {name:'Scanned_Original_Diploma.pdf',size:'2.4 MB'},
            {name:'Government_Passport_ID.pdf',size:'1.1 MB'}
        ],
        timeline:[
            {
                text:'Alumni submitted authentication request (₱300.00)',
                time:'Nov 20, 2026 • 07:55 AM'
            },
            {
                text:'Admin marked request In Review for archival check',
                time:'Nov 20, 2026 • 08:20 AM'
            }
        ]
    },

    {
        id:'REQ-2026-1045',
        studentName:'Rafael Carlo Bautista',
        initials:'RB',
        studentNo:'2024-07741',
        program:'BS Information Technology (2nd Yr)',
        type:'Good Moral Certificate',
        date:'2026-11-19',
        time:'04:30 PM',
        fee:120,
        paid:true,
        ref:'OR-994765-GCASH',
        copies:'1 Official Copy',
        purpose:'Student Exchange Program',
        delivery:'Registrar Window Pickup',
        email:'rc.bautista@student.edu.ph',
        phone:'+63 927 889 1203',
        status:'Pending',
        remarks:'',
        attachments:[
            {name:'OSA_No_Violation_Clearance.pdf',size:'510 KB'}
        ],
        timeline:[
            {
                text:'Student submitted request online and paid ₱120.00',
                time:'Nov 19, 2026 • 04:30 PM'
            }
        ]
    },

    {
        id:'REQ-2026-1044',
        studentName:'Sofia Isabel Lim',
        initials:'SL',
        studentNo:'2022-03910',
        program:'BS Nursing (4th Yr)',
        type:'Transcript of Records',
        date:'2026-11-19',
        time:'02:18 PM',
        fee:250,
        paid:true,
        ref:'OR-994740-MAYA',
        copies:'2 Official Copies',
        purpose:'PRC Licensure Examination',
        delivery:'Registrar Window Pickup',
        email:'si.lim@student.edu.ph',
        phone:'+63 917 650 3319',
        status:'Approved',
        remarks:'Signed by University Registrar. Ready at Window 2.',
        attachments:[
            {name:'Clinical_Completion_Cert.pdf',size:'1.5 MB'},
            {name:'Student_ID_Scan.pdf',size:'720 KB'}
        ],
        timeline:[
            {
                text:'Student submitted request online (₱250.00)',
                time:'Nov 19, 2026 • 02:18 PM'
            },
            {
                text:'Approved by Registrar Admin — Ready at Window 2',
                time:'Nov 19, 2026 • 04:05 PM'
            }
        ]
    },

    {
        id:'REQ-2026-1043',
        studentName:'Gabriel Jose Villanueva',
        initials:'GV',
        studentNo:'2023-08812',
        program:'BS Business Administration (3rd Yr)',
        type:'Honorable Dismissal',
        date:'2026-11-18',
        time:'11:05 AM',
        fee:350,
        paid:true,
        ref:'OR-994698-BANK',
        copies:'1 Transfer Credential Set',
        purpose:'Transfer to Another University',
        delivery:'Registrar Window Pickup',
        email:'gj.villanueva@student.edu.ph',
        phone:'+63 919 204 7711',
        status:'Pending',
        remarks:'',
        attachments:[
            {name:'Library_Accounting_Clearance.pdf',size:'980 KB'},
            {name:'Parent_Consent_Letter.pdf',size:'430 KB'}
        ],
        timeline:[
            {
                text:'Student submitted transfer credential request (₱350.00)',
                time:'Nov 18, 2026 • 11:05 AM'
            }
        ]
    },

    {
        id:'REQ-2026-1042',
        studentName:'Camille Anne Torres',
        initials:'CT',
        studentNo:'2022-06123',
        program:'BA Communication (4th Yr)',
        type:'Course Evaluation',
        date:'2026-11-17',
        time:'03:48 PM',
        fee:150,
        paid:true,
        ref:'OR-994650-GCASH',
        copies:'1 Official Summary',
        purpose:'Graduation Candidacy Check',
        delivery:'Digital PDF via Email',
        email:'ca.torres@student.edu.ph',
        phone:'+63 916 554 9021',
        status:'Approved',
        remarks:'All 168 required units verified and complete.',
        attachments:[
            {name:'Curriculum_Checklist_2022.pdf',size:'780 KB'}
        ],
        timeline:[
            {
                text:'Student requested graduation unit evaluation (₱150.00)',
                time:'Nov 17, 2026 • 03:48 PM'
            },
            {
                text:'Approved by Registrar Admin — Digital copy sent',
                time:'Nov 18, 2026 • 09:30 AM'
            }
        ]
    },

    {
        id:'REQ-2026-1041',
        studentName:'Mark Anthony Cruz',
        initials:'MC',
        studentNo:'2024-02190',
        program:'BS Mechanical Engineering (2nd Yr)',
        type:'Certificate of Enrollment',
        date:'2026-11-15',
        time:'10:12 AM',
        fee:100,
        paid:true,
        ref:'OR-994590-MAYA',
        copies:'1 Official Copy',
        purpose:'SSS / Dependent Benefit Claim',
        delivery:'Registrar Window Pickup',
        email:'ma.cruz@student.edu.ph',
        phone:'+63 928 411 6602',
        status:'Approved',
        remarks:'Released to student representative with authorization.',
        attachments:[
            {name:'Registration_Form_2026.pdf',size:'670 KB'}
        ],
        timeline:[
            {
                text:'Student submitted request online (₱100.00)',
                time:'Nov 15, 2026 • 10:12 AM'
            },
            {
                text:'Approved by Registrar Admin',
                time:'Nov 15, 2026 • 01:40 PM'
            }
        ]
    },

    {
        id:'REQ-2026-1040',
        studentName:'Patricia Joy Aquino',
        initials:'PA',
        studentNo:'2021-05411',
        program:'BS Psychology (Alumni)',
        type:'Transcript of Records',
        date:'2026-11-12',
        time:'01:25 PM',
        fee:250,
        paid:true,
        ref:'OR-994512-GCASH',
        copies:'1 Official Copy',
        purpose:'Graduate School Admission',
        delivery:'LBC Express Courier',
        email:'pj.aquino@alumni.edu.ph',
        phone:'+63 917 902 4418',
        status:'Rejected',
        remarks:'Accounting hold detected (₱1,200 library fine). Please settle at Cashier first.',
        attachments:[
            {name:'Alumni_ID_Scan.pdf',size:'540 KB'}
        ],
        timeline:[
            {
                text:'Alumni submitted TOR request (₱250.00)',
                time:'Nov 12, 2026 • 01:25 PM'
            },
            {
                text:'Rejected due to uncleared library balance',
                time:'Nov 12, 2026 • 04:10 PM'
            }
        ]
    },

    {
        id:'REQ-2026-1039',
        studentName:'Lorenzo Miguel Navarro',
        initials:'LN',
        studentNo:'2023-09531',
        program:'BS Architecture (3rd Yr)',
        type:'Good Moral Certificate',
        date:'2026-11-05',
        time:'09:50 AM',
        fee:120,
        paid:true,
        ref:'OR-994401-BANK',
        copies:'1 Official Copy',
        purpose:'OJT / Internship Application',
        delivery:'Digital PDF via Email',
        email:'lm.navarro@student.edu.ph',
        phone:'+63 906 774 2189',
        status:'Approved',
        remarks:'Verified clean disciplinary record.',
        attachments:[
            {name:'Internship_Endorsement.pdf',size:'820 KB'}
        ],
        timeline:[
            {
                text:'Student submitted request online (₱120.00)',
                time:'Nov 05, 2026 • 09:50 AM'
            },
            {
                text:'Approved by Registrar Admin',
                time:'Nov 05, 2026 • 02:15 PM'
            }
        ]
    }
];


// =========================================================
// 4. DEFAULT NOTIFICATION DATA
// =========================================================

const DEFAULT_NOTIFS = [
    {
        id:1,
        title:'New TOR Request #1048',
        desc:'Maria Clara Santos submitted payment receipt',
        time:'12m ago',
        unread:true,
        reqId:'REQ-2026-1048'
    },
    {
        id:2,
        title:'Scholarship COE Urgent',
        desc:'Juan Miguel Reyes • DOST deadline tomorrow',
        time:'44m ago',
        unread:true,
        reqId:'REQ-2026-1047'
    },
    {
        id:3,
        title:'Archival Check Needed',
        desc:'Alyssa Mae Mendoza Diploma Authentication',
        time:'2h ago',
        unread:false,
        reqId:'REQ-2026-1046'
    }
];


// =========================================================
// 5. LOCAL STORAGE AND SELECTED REQUEST
// =========================================================

let REQUESTS =
    JSON.parse(localStorage.getItem('regitrack_requests') || 'null')
    || DEFAULT_REQUESTS;

let NOTIFS =
    JSON.parse(localStorage.getItem('regitrack_notifs') || 'null')
    || DEFAULT_NOTIFS;

const urlId = new URLSearchParams(
    (window.__RT_QS || "")
).get('id');

let selectedReqId =
    urlId ||
    localStorage.getItem('regitrack_selected_req') ||
    REQUESTS[0].id;


// =========================================================
// 6. STATUS BADGE
// =========================================================

function statusBadgeClass(st){

    if(st === 'Pending') return 'p2';

    if(st === 'In Review') return 'p3';

    if(st === 'Approved') return 'p4';

    if(st === 'Rejected') return 'pr';

    return 'p1';
}


// =========================================================
// 7. TOAST NOTIFICATION
// =========================================================

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


// =========================================================
// 8. CONFETTI ANIMATION
// =========================================================

function burstConfetti(){

    const colors = [
        '#f5871f',
        '#14753f',
        '#0b4a2e',
        '#ffb066',
        '#d9edd3'
    ];

    for(let i = 0; i < 26; i++){

        const c = document.createElement('i');

        c.className = 'cf';

        c.style.background = colors[i % colors.length];

        c.style.setProperty(
            '--x',
            (Math.random() * 340 - 170) + 'px'
        );

        c.style.setProperty(
            '--y',
            (Math.random() * -180 - 40) + 'px'
        );

        c.style.setProperty(
            '--d',
            (Math.random() * 260 + 120) + 'px'
        );

        c.style.setProperty(
            '--r',
            (Math.random() * 540 - 270) + 'deg'
        );

        document.body.appendChild(c);

        setTimeout(() => c.remove(), 1450);
    }
}


// =========================================================
// 9. CARD POINTER EFFECT
// =========================================================

document.addEventListener('pointermove', e => {

    const target = e.target.closest('.card');

    if(!target) return;

    const r = target.getBoundingClientRect();

    target.style.setProperty(
        '--mx',
        (e.clientX - r.left) + 'px'
    );

    target.style.setProperty(
        '--my',
        (e.clientY - r.top) + 'px'
    );

}, { passive:true });


// =========================================================
// 10. BUTTON RIPPLE EFFECT
// =========================================================

document.addEventListener('click', e => {

    const btn = e.target.closest('.btn,.nv');

    if(!btn) return;

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


// =========================================================
// 11. SCROLL PROGRESS AND TOPBAR
// =========================================================

window.addEventListener('scroll', () => {

    const h =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const pct = h > 0
        ? window.scrollY / h
        : 0;

    document.getElementById('v4p').style.transform =
        `scaleX(${pct})`;

    document.getElementById('topbar').classList.toggle(
        'sc',
        window.scrollY > 10
    );

}, { passive:true });


// =========================================================
// 12. THEME SWITCHING
// =========================================================

const savedTheme =
    localStorage.getItem('regitrack_theme');

if(savedTheme){
    document.documentElement.setAttribute(
        'data-theme',
        savedTheme
    );
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
// 13. PROFILE AND NOTIFICATION POPOVERS
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

    document.getElementById('searchSuggestions')
        .classList.remove('on');
}

document.addEventListener('click', e => {

    if(
        !e.target.closest('.pw') &&
        !e.target.closest('#globalSearchWrap')
    ){
        closePops();
    }
});


// =========================================================
// 14. GLOBAL SEARCH
// =========================================================

const gInput =
    document.getElementById('globalSearchInput');

const gSug =
    document.getElementById('searchSuggestions');

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

            <div class="sgi"
                onclick="selectRequest('${r.id}');closePops();gInput.value=''">

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
// 15. RENDER NOTIFICATIONS
// =========================================================

function renderNotifs(){

    const unreadCount =
        NOTIFS.filter(n => n.unread).length;

    document.getElementById('notifDot').hidden =
        unreadCount === 0;

    document.getElementById('notifList').innerHTML =
        NOTIFS.map(n => `

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


// =========================================================
// 16. OPEN NOTIFICATION
// =========================================================

function openNotif(id, reqId){

    const n = NOTIFS.find(x => x.id === id);

    if(n){
        n.unread = false;
    }

    localStorage.setItem(
        'regitrack_notifs',
        JSON.stringify(NOTIFS)
    );

    renderNotifs();

    closePops();

    selectRequest(reqId);
}


// =========================================================
// 17. MARK ALL NOTIFICATIONS AS READ
// =========================================================

function markAllRead(){

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


// =========================================================
// 18. SELECT REQUEST
// =========================================================

function selectRequest(id){

    selectedReqId = id;

    localStorage.setItem(
        'regitrack_selected_req',
        id
    );

    renderRequestDetail();
}


// =========================================================
// 19. RENDER REQUEST DETAILS
// =========================================================

function renderRequestDetail(){

    const pending = REQUESTS.filter(r =>
        r.status === 'Pending' ||
        r.status === 'In Review'
    ).length;

    document.getElementById('navPendingBadge')
        .textContent = pending;

    const req =
        REQUESTS.find(r => r.id === selectedReqId) ||
        REQUESTS[0];

    selectedReqId = req.id;

    localStorage.setItem(
        'regitrack_selected_req',
        req.id
    );

    // REQUEST IDENTIFICATION

    document.getElementById('detId').textContent =
        req.id;

    const pill =
        document.getElementById('detStatusPill');

    pill.textContent = req.status;

    pill.className =
        `pill ${statusBadgeClass(req.status)}`;

    document.getElementById('detSubtitle').textContent =
        `Submitted on ${req.date} at ${req.time} • ${req.type}`;


    // WORKFLOW STEPPER

    let stepIndex = 1;

    if(req.status === 'In Review'){
        stepIndex = 2;
    }

    if(req.status === 'Approved'){
        stepIndex = 4;
    }

    if(req.status === 'Rejected'){
        stepIndex = -1;
    }

    const steps = [
        'Submitted',
        'Document Check',
        'Registrar Approval',
        'Ready / Released'
    ];

    document.getElementById('detStepper').innerHTML =
        steps.map((label, idx) => {

            let cls = '';

            let icon = idx + 1;

            if(req.status === 'Rejected'){

                cls = idx <= 2 ? 'rj' : '';

                if(idx === 2){
                    icon = '✕';
                }

            } else if(idx < stepIndex){

                cls = 'd';

                icon = `
                    <svg class="i" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                `;

            } else if(idx === stepIndex){

                cls = 'c';
            }

            return `
                <div class="sp1 ${cls}">
                    <b>${icon}</b>
                    <span>${label}</span>
                </div>
            `;

        }).join('');


    // APPLICANT INFORMATION

    document.getElementById('detPayPill').textContent =
        `Paid • ₱${req.fee}.00`;

    document.getElementById('detAvatar').textContent =
        req.initials;

    document.getElementById('detName').textContent =
        req.studentName;

    document.getElementById('detStudentMeta').textContent =
        `${req.studentNo} • ${req.program}`;

    document.getElementById('detType').textContent =
        req.type;

    document.getElementById('detDate').textContent =
        `${req.date} • ${req.time}`;

    document.getElementById('detPurpose').textContent =
        req.purpose;

    document.getElementById('detCopies').textContent =
        req.copies;

    document.getElementById('detDelivery').textContent =
        req.delivery;

    document.getElementById('detEmail').textContent =
        req.email;

    document.getElementById('detPhone').textContent =
        req.phone;

    document.getElementById('detRef').textContent =
        req.ref;

    document.getElementById('adminRemarksInput').value =
        req.remarks || '';


    // ATTACHED DOCUMENTS

    document.getElementById('detAttachments').innerHTML =
        req.attachments.map(a => `

            <div class="doc-item">

                <div class="ic g"
                    style="width:38px;height:38px;border-radius:11px">

                    <svg class="i"
                        style="width:18px;height:18px"
                        viewBox="0 0 24 24">

                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>

                        <polyline points="14 2 14 8 20 8"/>

                    </svg>

                </div>

                <div style="flex:1;min-width:0">

                    <b style="display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                        ${a.name}
                    </b>

                    <span class="mu" style="font-size:12px">
                        ${a.size} • Verified PDF
                    </span>

                </div>

                <button class="btn ol xs"
                    onclick="previewAttachment('${a.name}', '${req.studentName}')">
                    Preview
                </button>

            </div>

        `).join('');


    // AUDIT TIMELINE

    document.getElementById('detLogCount').textContent =
        `${req.timeline.length} event${req.timeline.length === 1 ? '' : 's'}`;

    document.getElementById('detTimeline').innerHTML =
        req.timeline.map(t => `

            <div>
                <div>

                    <b style="display:block;font-size:13.5px">
                        ${t.text}
                    </b>

                    <span class="mu" style="font-size:12px">
                        ${t.time}
                    </span>

                </div>
            </div>

        `).join('');
}


// =========================================================
// 20. APPROVE, REJECT OR MARK IN REVIEW
// =========================================================

function decideRequest(newStatus){

    const req = REQUESTS.find(
        r => r.id === selectedReqId
    );

    if(!req) return;

    const note =
        document.getElementById('adminRemarksInput')
            .value.trim();


    // REQUIRE REJECTION REASON

    if(newStatus === 'Rejected' && !note){

        toast(
            'Please enter a reason in Registrar Remarks before rejecting.'
        );

        document.getElementById('adminRemarksInput').focus();

        return;
    }


    // UPDATE REQUEST

    req.status = newStatus;

    req.remarks =
        note ||
        (
            newStatus === 'Approved'
                ? 'Verified and approved for release.'
                : req.remarks
        );


    // AUDIT TIMELINE

    const now = new Date();

    const timeStr =
        'Nov 20, 2026 • ' +
        now.toLocaleTimeString([], {
            hour:'2-digit',
            minute:'2-digit'
        });

    req.timeline.unshift({

        text:
            `Registrar set status to ${newStatus}` +
            `${note ? ': "' + note + '"' : ''}`,

        time:timeStr
    });


    // SAVE REQUESTS

    localStorage.setItem(
        'regitrack_requests',
        JSON.stringify(REQUESTS)
    );


    // REFRESH DETAILS

    renderRequestDetail();


    // FEEDBACK

    if(newStatus === 'Approved'){

        burstConfetti();

        toast(`${req.id} Approved! Applicant notified.`);

    } else {

        toast(`${req.id} marked as ${newStatus}.`);
    }
}


// =========================================================
// 21. PREVIOUS AND NEXT REQUEST
// =========================================================

function cycleDetailRequest(dir){

    const idx = REQUESTS.findIndex(
        r => r.id === selectedReqId
    );

    const nextIdx =
        (idx + dir + REQUESTS.length) %
        REQUESTS.length;

    selectRequest(REQUESTS[nextIdx].id);
}


// =========================================================
// 22. DOCUMENT PREVIEW MODAL
// =========================================================

function previewAttachment(fileName, studentName){

    const bg = document.getElementById('modalBg');

    document.getElementById('modalContent').innerHTML = `

        <div class="sec">

            <h2>Document Preview</h2>

            <button class="ib"
                style="width:36px;height:36px"
                onclick="closeModal()">
                ✕
            </button>

        </div>

        <div style="padding:24px;border-radius:18px;background:var(--mint2);border:1.5px dashed var(--g7);text-align:center;margin-bottom:16px">

            <div class="ic g"
                style="margin:0 auto 12px;width:52px;height:52px">

                <svg class="i"
                    style="width:24px;height:24px"
                    viewBox="0 0 24 24">

                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>

                    <polyline points="14 2 14 8 20 8"/>

                </svg>

            </div>

            <b style="display:block;font-size:15px;margin-bottom:4px">
                ${fileName}
            </b>

            <span class="mu">
                Uploaded by ${studentName} • Digital Signature & Checksum Valid
            </span>

        </div>

        <button class="btn w" onclick="closeModal()">
            Done Reviewing
        </button>

    `;

    bg.classList.add('on');
}


// =========================================================
// 23. CLOSE MODAL
// =========================================================

function closeModal(){

    document.getElementById('modalBg')
        .classList.remove('on');
}


// =========================================================
// 24. LOGOUT
// =========================================================

function logoutAdmin(){

    closePops();

    localStorage.removeItem(
        'regitrack_selected_req'
    );

    window.__nav = 'student-main.html#login';
}


// =========================================================
// 25. EXPORT REQUESTS TO CSV
// =========================================================

function exportCSV(){

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
        {type:'text/csv'}
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'regitrack_requests_export.csv';

    a.click();

    URL.revokeObjectURL(url);

    toast('Exported requests to CSV');
}


// =========================================================
// 26. UPDATE PROCESSING STATUS AND QR INDICATOR
// =========================================================

function stApply(){

    const v =
        document.getElementById('stSel').value;

    const mail =
        document.getElementById('stMail').checked;

    const q =
        document.getElementById('stQr');


    if(v === 'Ready for Pickup'){

        q.textContent = 'QR pass: Active';

        q.className = 'pill p4';

    } else if(v === 'Released'){

        q.textContent = 'QR pass: Redeemed';

        q.className = 'pill p5';

    } else if(v === 'Rejected'){

        q.textContent = 'QR pass: Not issued';

        q.className = 'pill pr';

    } else {

        q.textContent = 'QR pass: Not issued';

        q.className = 'pill p1';
    }

    toast(
        'Status set to ' +
        v +
        (mail ? ' · email sent to student' : '')
    );
}


// =========================================================
// 27. INITIALIZE PAGE
// =========================================================

window.addEventListener('DOMContentLoaded', () => {

    renderNotifs();

    renderRequestDetail();

});


// =========================================================
// 28. LAYOUT V5 SIDEBAR AND DATE/TIME
// Originally located in layout-v5-js
// =========================================================

(function(){

    function titles(){

        document.querySelectorAll('.side .nv')
            .forEach(function(n){

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

    document.addEventListener(
        'DOMContentLoaded',
        titles
    );


    // Keep active navigation item visible on mobile

    var on = document.querySelector('.side .nv.on');

    if(
        on &&
        on.scrollIntoView &&
        innerWidth <= 760
    ){

        try {

            on.scrollIntoView({
                inline:'center',
                block:'nearest'
            });

        } catch(e){}
    }


    // DATE AND TIME DISPLAY

    function updateClock(){

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

    updateClock();

    setInterval(updateClock, 15000);

})();
