// Extracted prototype JavaScript from the supplied REGITRACK interface.
(function(){
  var currentRole="student";
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
  window.selectedRequestId = null;
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

/* ===== Extracted script ===== */
try{var __t=localStorage.getItem('regitrack_theme');if(__t)document.documentElement.setAttribute('data-theme',__t)}catch(e){}

/* ===== Extracted script ===== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RO={s:{n:'Sam Rivera',r:'Student',i:'SR',ph:'Search documents…',t:'s-docs',q:'dq'},r:{n:'Registrar Rey',r:'Registrar',i:'RR',ph:'Search requests…',t:'r-home',q:'rq'}};
let role='s';

function cu(root) {
    root.querySelectorAll('.stat b').forEach(el => {
        const t = el.dataset.t || (el.dataset.t = el.textContent);
        const m = t.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);

        if (!m) return;

        const raw = m[2];
        const dec = (raw.split('.')[1] || '').length;
        const comma = raw.includes(',');
        const end = parseFloat(raw.replace(/,/g, ''));
        const t0 = performance.now();

        (function f(n) {
            const p = Math.min(1, (n - t0) / 950);
            const v = end * (1 - Math.pow(1 - p, 3));

            let s = v.toFixed(dec);

            if (comma) {
                s = (+s).toLocaleString('en-US', {
                    minimumFractionDigits: dec,
                    maximumFractionDigits: dec
                });
            }

            el.textContent = m[1] + s + m[3];

            if (p < 1) requestAnimationFrame(f);
        })(t0);
    });
}

function badge(){const n=$$('#nl .ni.un').length;$$('[data-badge]').forEach(e=>{e.hidden=!n;if(e.tagName==='B'||e.tagName==='EM')e.textContent=n})}
function pops(x){$$('.pop').forEach(p=>p!==x&&p.classList.remove('on'))}
const PAGE={'choose': 'student-main.html', 'login': 'student-main.html', 'signup': 'student-main.html', 's-home': 'student-main.html', 's-docs': 'student-main.html', 's-new': 'student-main.html', 's-list': 'student-main.html', 's-notif': 'student-main.html', 's-detail': 'student-main.html', 'r-dash': 'main.html', 'a-dash': 'dashboard.html', 'r-scan': 'scan.html', 'r-home': 'requests.html', 'r-detail': 'request-detail.html'};
const HERE='student-main.html';

function go(id) {
    if (PAGE[id] && PAGE[id] !== HERE) {
        window.__nav = PAGE[id] === 'student-main.html'
            ? PAGE[id] + '#' + id
            : PAGE[id];
        return;
    }

    const s = document.getElementById(id);
    if (!s) return;

    try {
        history.replaceState(null, '', '#' + id);
    } catch (e) {}

    $$('.scr').forEach(x => x.hidden = x.id !== id);

    role = s.dataset.r;

    const sh = $('#shell');
    if (sh) sh.hidden = role === 'auth';

    $$('.nav').forEach(n =>
        n.classList.toggle('on', n.dataset.r === role)
    );

    $$('.nv').forEach(b =>
        b.classList.toggle('on', b.dataset.go === id || b.dataset.on === id)
    );

    const R = RO[role];

    if (R) {
        const ab = $('#ab');
        const ab2 = $('#ab2');
        const mn = $('#mn');
        const mr = $('#mr');
        const gsi = $('#gsi');
        const bw = $('#bw');

        if (ab) ab.textContent = R.i;
        if (ab2) ab2.textContent = R.i;
        if (mn) mn.textContent = R.n;
        if (mr) mr.textContent = R.r;
        if (gsi) gsi.placeholder = R.ph;
        if (bw) bw.hidden = role !== 's';
    }

    pops();

    const rp = $('#rp');

    if (rp) {
        rp.classList.remove('go');
        void rp.offsetWidth;
        rp.classList.add('go');
    }

    window.scrollTo(0, 0);

    // Load the logged-in student's database profile.
    if (role === 's') {
        loadHeaderProfile();
    }

    // Run number animation only on pages without dynamically loaded statistics.
    if (id !== 's-list') {
        cu(s);
    }

    // Retrieve dashboard data from Flask.
    if (id === 's-home') {
        loadDashboard();
    }

    // Retrieve request history from Flask.
    if (id === 's-list') {
        console.log('My Requests page opened');
        loadRequestHistory();
    }

    if (id === 's-docs') {
        loadDocumentCatalog();
    }
    
    // Initialize the request form using the document selected in s-docs.
    if (id === 's-new') {
        if (typeof window.prepareNewRequestForm === 'function') {
            window.prepareNewRequestForm(window.selectedDocumentData);
        }
    }
}


function flt(id) {
    const container = document.getElementById(id);
    if (!container) return;

    const searchInput = document.querySelector(`[data-q="${id}"]`);
    const query = searchInput
        ? searchInput.value.toLowerCase().trim()
        : '';

    const activeChip = document.querySelector(
        `.chips[data-t="${id}"] .chip.on`
    );

    const category = activeChip
        ? activeChip.dataset.v
        : 'all';

    const tiles = container.querySelectorAll('.tile');
    let visibleCount = 0;

    tiles.forEach(tile => {
        const cardCategory = tile.dataset.c || '';
        const cardText = tile.textContent.toLowerCase();

        const matchesCategory =
            category === 'all' || cardCategory === category;

        const matchesSearch =
            cardText.includes(query);

        const visible = matchesCategory && matchesSearch;

        tile.hidden = !visible;

        if (visible) visibleCount++;
    });

    const emptyState = document.querySelector(`[data-e="${id}"]`);

    if (emptyState) {
        emptyState.hidden = visibleCount > 0;
    }
}


function toast(m){const t=document.createElement('div');t.className='toast';t.innerHTML='<i><svg class="i"><use href="#ok"/></svg></i>'+m;$('#ts').append(t);setTimeout(()=>t.remove(),3300)}
function confetti(){const C=['#f5871f','#14753f','#d9edd3','#ffb86b','#0b4a2e'];for(let i=0;i<42;i++){const e=document.createElement('i');e.className='cf';const a=Math.random()*Math.PI*2,r=140+Math.random()*260;e.style.cssText=`background:${C[i%5]};--x:${Math.cos(a)*r}px;--y:${-120-Math.random()*220}px;--d:${160+Math.random()*260}px;--r:${Math.random()*900-450}deg`;document.body.append(e);setTimeout(()=>e.remove(),1600)}}
let ws=1;


document.addEventListener('click',e=>{
 const T=e.target;
 const b=T.closest('[data-go]');if(b){go(b.dataset.go);}
 


 const c = T.closest('.chip');

if (c) {
    c.parentElement.querySelectorAll('.chip').forEach(x =>
        x.classList.toggle('on', x === c)
    );

    if (c.parentElement.dataset.t) {
        flt(c.parentElement.dataset.t);
    }
}

 if(T.closest('[data-markread]')){$$('.ni.un').forEach(x=>x.classList.remove('un'));badge();if(!T.closest('[data-toast]'))toast('You’re all caught up')}
 const t=T.closest('[data-toast]');if(t)toast(t.dataset.toast);
 const bb=T.closest('#bb'),ab=T.closest('#ab');if(bb){const p=$('#np');pops(p);p.classList.toggle('on')}else if(ab){const p=$('#mp');pops(p);p.classList.toggle('on')}else if(!T.closest('.pop'))pops();
 const r=T.closest('.btn,.opt,.row,.chip,.nv,.qa');if(r){const k=r.getBoundingClientRect(),z=Math.max(k.width,k.height)*2,p=document.createElement('span');p.className='rpl';p.style.cssText=`width:${z}px;height:${z}px;left:${e.clientX-k.left-z/2}px;top:${e.clientY-k.top-z/2}px`;r.append(p);setTimeout(()=>p.remove(),700)}
});
document.addEventListener('input', e => {
    const q = e.target.dataset && e.target.dataset.q;
    if (q) flt(q);
});

document.addEventListener('keydown',e=>{
 if(e.key==='/'&&!/INPUT|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#gsi').focus()}
 if(e.key==='Escape')pops();
 if(e.key==='Enter'&&e.target.id==='gsi'&&e.target.value){const R=RO[role],v=e.target.value;if(!document.getElementById(R.q)){try{sessionStorage.setItem('rt-q',v)}catch(x){}go(R.t);return}go(R.t);const i=document.getElementById(R.q);i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));e.target.value='';e.target.blur()}
});
document.addEventListener('pointermove',e=>{const t=e.target.closest('[data-tilt]');if(!t||e.pointerType==='touch')return;const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(800px) rotateX(${-y*7}deg) rotateY(${x*7}deg) translateY(-4px)`;t.style.setProperty('--gx',(x+.5)*100+'%');t.style.setProperty('--gy',(y+.5)*100+'%')});
document.addEventListener('pointerout',e=>{const t=e.target.closest&&e.target.closest('[data-tilt]');if(t&&!t.contains(e.relatedTarget))t.style.transform=''});
function clock(){if(!$('#clk'))return;const d=new Date(),h=d.getHours();if($('#clk'))$('#clk').textContent=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});if($('#gr'))$('#gr').textContent=(h<12?'Good morning,':h<18?'Good afternoon,':'Good evening,')}
clock();setInterval(clock,20000);badge();
setInterval(()=>{const b=$('#bb');if(b&&$('#bw')&&!$('#bw').hidden&&$$('#nl .ni.un').length){b.classList.remove('wg');void b.offsetWidth;b.classList.add('wg')}},7000);

/* ===== Extracted script ===== */
/* v5 visual-only enhancements: no data/logic touched */
(()=>{try{
const $=q=>document.querySelector(q);
const pb=document.createElement('div');pb.id='v4p';document.body.prepend(pb);
let tk=0;const upd=()=>{tk=0;const m=document.documentElement.scrollHeight-innerHeight,y=scrollY;pb.style.transform='scaleX('+(m>0?Math.min(1,y/m):0)+')';const t=$('.top');if(t)t.classList.toggle('sc',y>8)};
addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(upd)},{passive:true});upd();
let sp=null,px=0,py=0,raf=0;
document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const c=e.target.closest&&e.target.closest('.card,.tile,.stat,.row');if(!c)return;sp=c;px=e.clientX;py=e.clientY;if(!raf)raf=requestAnimationFrame(()=>{raf=0;const r=sp.getBoundingClientRect();sp.style.setProperty('--mx',px-r.left+'px');sp.style.setProperty('--my',py-r.top+'px')})},{passive:true});
/* landing arrow */
document.addEventListener('click',e=>{const d=e.target.closest&&e.target.closest('.dn');if(!d)return;const f=d.closest('.auth').querySelector('.af');f&&f.scrollIntoView({behavior:'smooth',block:'start'})});
/* smart suggestions */
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ICO='<svg class="i"><use href="#search"/></svg>',recent=[];
const poolOf=id=>{const c=document.getElementById(id);if(!c)return[];const seen=new Set(),o=[];[...c.children].forEach(el=>{const b=el.querySelector('b');if(!b)return;const l=b.textContent.trim();if(!l||seen.has(l))return;seen.add(l);const m=el.querySelector('.mu');o.push({l,sub:m?m.textContent.trim():'',h:el.textContent.toLowerCase().replace(/\s+/g,' ')})});return o};
const sc=(it,q)=>{const l=it.l.toLowerCase();if(l.startsWith(q))return 100;if(l.split(/\s+/).some(w=>w.startsWith(q)))return 85;if(l.includes(q))return 70;const t=q.split(/\s+/);if(t.every(x=>it.h.includes(x)))return 60;let i=0;for(const ch of l){if(ch===q[i])i++;if(i===q.length)return 30+q.length}return 0};
const hl=(l,q)=>{const k=l.toLowerCase().indexOf(q);if(k>=0)return esc(l.slice(0,k))+'<mark>'+esc(l.slice(k,k+q.length))+'</mark>'+esc(l.slice(k+q.length));let i=0,o='';for(const ch of l){if(i<q.length&&ch.toLowerCase()===q[i]){o+='<mark>'+esc(ch)+'</mark>';i++}else o+=esc(ch)}return o};
function wire(inp){
 const lab=inp.closest('label');if(!lab||inp.dataset.sg)return;inp.dataset.sg=1;
 const box=document.createElement('div');box.className='sg';box.setAttribute('role','listbox');lab.append(box);
 let items=[],act=-1;
 const cid=()=>inp.id==='gsi'?(typeof role!=='undefined'&&RO[role]?(document.getElementById(RO[role].q)||{dataset:{}}).dataset.q:null):inp.dataset.q;
 const close=()=>{box.classList.remove('on');act=-1};
 const mark=()=>[...box.querySelectorAll('.sgi')].forEach((x,i)=>x.classList.toggle('a',i===act));
 const pick=i=>{const it=items[i];if(!it)return;close();inp.value=it.l;recent.unshift(it.l);[...new Set(recent)].slice(0,3).forEach((v,j)=>recent[j]=v);recent.length=Math.min(new Set(recent).size,3);
  if(inp.id==='gsi')inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));else inp.dispatchEvent(new Event('input',{bubbles:true}));inp.blur()};
 const render=()=>{const id=cid(),pool=id?poolOf(id):[],q=inp.value.toLowerCase().trim();let h='';
  if(!q){items=pool.slice(0,5);const r=recent.filter(x=>pool.some(p=>p.l===x));if(r.length){items=[...r.map(x=>pool.find(p=>p.l===x)),...items.filter(p=>!r.includes(p.l))].slice(0,6)}
   h=items.length?'<p class="sgh">'+(r.length?'Recent and suggested':'Suggested')+'</p>':''}
  else{items=pool.map(p=>({...p,s:sc(p,q)})).filter(p=>p.s>0).sort((a,b)=>b.s-a.s).slice(0,6);h=items.length?'<p class="sgh">Suggestions</p>':'<p class="sgh">No match for “'+esc(inp.value.trim())+'”. Check the spelling or try fewer letters.</p>'}
  h+=items.map((it,i)=>'<div class="sgi" role="option" data-i="'+i+'">'+ICO+'<div class="t"><b>'+(q?hl(it.l,q):esc(it.l))+'</b>'+(it.sub?'<small>'+esc(it.sub)+'</small>':'')+'</div>'+(i===0&&q?'<em>Enter</em>':'')+'</div>').join('');
  box.innerHTML=h;act=-1;box.classList.toggle('on',!!h)};
 inp.addEventListener('input',render);inp.addEventListener('focus',render);inp.addEventListener('blur',()=>setTimeout(close,140));
 inp.addEventListener('keydown',e=>{if(!box.classList.contains('on')||!items.length)return;
  if(e.key==='ArrowDown'){e.preventDefault();act=(act+1)%items.length;mark()}
  else if(e.key==='ArrowUp'){e.preventDefault();act=(act-1+items.length)%items.length;mark()}
  else if(e.key==='Enter'&&act>=0){e.preventDefault();e.stopPropagation();pick(act)}
  else if(e.key==='Escape'){close()}});
 box.addEventListener('mousedown',e=>e.preventDefault());
 box.addEventListener('click',e=>{const r=e.target.closest('.sgi');if(r)pick(+r.dataset.i)});
 box.addEventListener('pointermove',e=>{const r=e.target.closest('.sgi');if(r&&+r.dataset.i!==act){act=+r.dataset.i;mark()}});
}
['gsi','rq'].forEach(id=>{
    const n=document.getElementById(id);
    n&&wire(n)
});
}catch(e){console.warn(e)}})();

/* ===== Extracted script ===== */
/* account-type screen: dropdown to pick Student / Registrar / Admin before the login form */
(()=>{try{
const S=document.getElementById('choose');if(!S)return;
const dd=S.querySelector('#lg-dd'),btn=S.querySelector('#lg-dd-btn'),list=S.querySelector('#lg-opts'),opts=[...list.querySelectorAll('.lg-opt')],goBtn=S.querySelector('#lg-pick-go');
let acct=null;
window.RTA={get:()=>acct,set:r=>{acct=r||null},clear:()=>{acct=null}};
const paint=()=>{const o=opts.find(x=>x.dataset.role===acct);opts.forEach(x=>x.setAttribute('aria-selected',x===o));dd.classList.toggle('has',!!o);
  S.querySelector('#lg-dd-val').textContent=o?o.querySelector('b').textContent:'Select type of user to log in';
  S.querySelector('#lg-dd-ic').innerHTML=o?o.querySelector('.oi').innerHTML:'';goBtn.disabled=!acct};
const open=(f)=>{dd.classList.add('open');btn.setAttribute('aria-expanded','true');if(f){(opts.find(x=>x.dataset.role===acct)||opts[0]).focus()}};
const close=(f)=>{dd.classList.remove('open');btn.setAttribute('aria-expanded','false');if(f)btn.focus()};
const pick=r=>{acct=r;paint();close(true)};
btn.addEventListener('click',()=>dd.classList.contains('open')?close():open());
btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open(true)}});
opts.forEach(o=>o.addEventListener('click',()=>pick(o.dataset.role)));
list.addEventListener('keydown',e=>{const i=opts.indexOf(document.activeElement),k=e.key;
  if(k==='ArrowDown'||k==='ArrowUp'){e.preventDefault();opts[(i+(k==='ArrowDown'?1:-1)+opts.length)%opts.length].focus()}
  else if(k==='Enter'||k===' '){e.preventDefault();if(i>=0)pick(opts[i].dataset.role)}
  else if(k==='Escape'){e.preventDefault();e.stopPropagation();close(true)}
  else if(k==='Tab')close()});
document.addEventListener('click',e=>{if(!dd.contains(e.target))close()});
const next=()=>{if(acct)go('login')};
goBtn.addEventListener('click',next);
goBtn.addEventListener('pointerdown',e=>{if(goBtn.disabled)return;const r=goBtn.getBoundingClientRect(),d=Math.max(r.width,r.height),s=document.createElement('span');s.className='lg-ripple';s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';goBtn.appendChild(s);setTimeout(()=>s.remove(),650)});
/* data-acct="student" pre-selects the type (signup link); data-acct="" clears it (log out) */
document.addEventListener('click',e=>{const a=e.target.closest('[data-acct]');if(a){acct=a.dataset.acct||null;paint()}},true);
/* showing this screen means nobody is signed in */
new MutationObserver(()=>{if(!S.hidden){close();paint();try{parent.RT.setRole(null)}catch(x){}}}).observe(S,{attributes:true,attributeFilter:['hidden']});
paint();
}catch(err){console.warn(err)}})();



/* =========================================================
   REGITRACK - REAL BACKEND LOGIN INTEGRATION
   Connects to Flask Phase 2 authentication.
   Endpoint: POST /auth/login
========================================================= */

(() => {
    try {
        const R = document.getElementById('login');
        if (!R) return;

        const q = selector => R.querySelector(selector);

        const card = q('#lg-card');
        const email = q('#lg-email');
        const pass = q('#lg-pass');
        const form = q('#lg-form');
        const btn = q('#lg-submit');
        const label = q('#lg-label');

        const accountName = q('#lg-acct-name');
        const accountIcon = q('#lg-acct-ic');
        const subtitle = q('#lg-sub');
        const newFooter = q('#lg-newfoot');

        // Map backend roles to existing frontend screens.
        const ROLE_CONFIG = {
            "Student": {
                key: "student",
                screen: "s-home",
                name: "Student",
                description: "Log in to request and track your documents."
            },

            "Registrar Staff": {
                key: "registrar",
                screen: "r-dash",
                name: "Registrar",
                description: "Log in to review and process document requests."
            },

            "Admin": {
                key: "admin",
                screen: "a-dash",
                name: "Admin",
                description: "Log in to manage services, reports, and analytics."
            }
        };

        let selectedAccount = "student";
        let isSubmitting = false;

        // Show/hide password.
        q('#lg-eye').addEventListener('click', e => {
            const show = pass.type === 'password';

            pass.type = show ? 'text' : 'password';

            e.currentTarget.classList.toggle('on', show);

            e.currentTarget.setAttribute(
                'aria-label',
                show ? 'Hide password' : 'Show password'
            );
        });

        // Caps Lock warning.
        pass.addEventListener('keyup', e => {
            q('#lg-caps').classList.toggle(
                'show',
                !!(e.getModifierState && e.getModifierState('CapsLock'))
            );
        });

        pass.addEventListener('blur', () => {
            q('#lg-caps').classList.remove('show');
        });

        // Existing frontend validation.
        const valid = {
            email: value =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

            pass: value =>
                value.length >= 6
        };

        const check = (field, input, validator) => {
            const ok = validator(input.value.trim());

            q(field).classList.toggle('invalid', !ok);

            return ok;
        };

        email.addEventListener('input', () => {
            if (q('#lg-f-email').classList.contains('invalid')) {
                check('#lg-f-email', email, valid.email);
            }
        });

        pass.addEventListener('input', () => {
            if (q('#lg-f-pass').classList.contains('invalid')) {
                check('#lg-f-pass', pass, valid.pass);
            }
        });

        email.addEventListener('blur', () => {
            if (email.value) {
                check('#lg-f-email', email, valid.email);
            }
        });

        // Display selected account type.
        function setAccount(roleKey) {
            selectedAccount = roleKey;

            const names = {
                student: "Student",
                registrar: "Registrar",
                admin: "Admin"
            };

            const info = {
                student: "Log in to request and track your documents.",
                registrar: "Log in to review and process document requests.",
                admin: "Log in to manage services, reports, and analytics."
            };

            accountName.textContent = names[roleKey];

            subtitle.textContent = info[roleKey];

            const icon = document.querySelector(
                '#choose .lg-opt[data-role="' + roleKey + '"] .oi'
            );

            accountIcon.innerHTML = icon ? icon.innerHTML : '';

            newFooter.style.display =
                roleKey === 'student' ? '' : 'none';
        }

        // Read selected account type from the account selection screen.
        function getSelectedAccount() {
            try {
                const role = window.RTA && RTA.get();

                if (['student', 'registrar', 'admin'].includes(role)) {
                    return role;
                }
            } catch (error) {
                console.warn('Unable to read selected account:', error);
            }

            return selectedAccount || 'student';
        }

        setAccount(getSelectedAccount());

        // Show backend error using the existing login design.
        function showError(message) {
            const errorMessage = q('#lg-f-pass .lg-msg');

            errorMessage.textContent = message;

            q('#lg-f-pass').classList.add('invalid');

            card.classList.remove('lg-shake');

            void card.offsetWidth;

            card.classList.add('lg-shake');

            pass.focus();
        }

        // Reset login form.
        function resetLogin() {
            isSubmitting = false;

            btn.disabled = false;

            btn.classList.remove('loading', 'done');

            label.textContent = 'Log in';

            email.value = '';
            pass.value = '';

            pass.type = 'password';

            q('#lg-eye').classList.remove('on');

            q('#lg-caps').classList.remove('show');

            R.querySelectorAll('.invalid').forEach(element => {
                element.classList.remove('invalid');
            });

            setAccount(getSelectedAccount());
        }

        // Login submission.
        form.addEventListener('submit', async e => {
            e.preventDefault();

            if (isSubmitting) return;

            const emailValid = check(
                '#lg-f-email',
                email,
                valid.email
            );

            const passwordValid = check(
                '#lg-f-pass',
                pass,
                valid.pass
            );

            if (!emailValid || !passwordValid) {
                card.classList.remove('lg-shake');

                void card.offsetWidth;

                card.classList.add('lg-shake');

                (emailValid ? pass : email).focus();

                return;
            }

            isSubmitting = true;

            btn.disabled = true;

            btn.classList.add('loading');

            label.textContent = 'Logging in...';

            try {
                // Send credentials to the actual Flask backend.
                const response = await fetch('/auth/login', {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    credentials: 'same-origin',

                    body: JSON.stringify({
                        email: email.value.trim(),
                        password: pass.value
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || 'Login failed. Please try again.'
                    );
                }

                // Backend determines the actual account role.
                const user = data.user;

                const roleConfig = ROLE_CONFIG[user.role];

                if (!roleConfig) {
                    throw new Error(
                        'Your account has an unsupported role.'
                    );
                }

                // Prevent logging in through the wrong selected account type.
                if (roleConfig.key !== selectedAccount) {
                    await fetch('/auth/logout', {
                        method: 'POST',
                        credentials: 'same-origin'
                    });

                    throw new Error(
                        'This email belongs to a ' +
                        roleConfig.name +
                        ' account. Please select the correct account type.'
                    );
                }

                // Store only non-sensitive display information.
                window.RT_USER = {
                    user_id: user.user_id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                };

                // Success animation.
                btn.classList.remove('loading');

                btn.classList.add('done');

                label.textContent = 'Welcome back!';

                // Open the corresponding existing frontend screen.
                setTimeout(() => {
                    try {
                        if (roleConfig.key !== 'student') {
                            // These are separate frontend pages.
                            const destinations = {
                                registrar: '/registrar/dashboard',
                                admin: '/admin/dashboard'
                            };

                            window.location.href =
                                destinations[roleConfig.key];
                            return;
                        }

                        // Student dashboard is an existing SPA screen.
                        go(roleConfig.screen);

                        if (window.RTA && RTA.clear) {
                            RTA.clear();
                        }

                        isSubmitting = false;

                        btn.disabled = false;

                        btn.classList.remove('done');

                        label.textContent = 'Log in';

                        pass.value = '';

                    } catch (navigationError) {
                        console.error(navigationError);
                        window.location.href = '/student/dashboard';
                    }

                }, 400);

            } catch (error) {
                console.error('Login error:', error);

                btn.classList.remove('loading', 'done');

                showError(error.message);

                isSubmitting = false;

                btn.disabled = false;

                label.textContent = 'Log in';
            }
        });

        // Forgot password message.
        q('#lg-forgot').addEventListener('click', () => {
            toast(
                'Password reset will be added soon. For now, contact the registrar office.'
            );
        });

        // Reset the login screen when it is opened again.
        new MutationObserver(() => {
            if (!R.hidden) {
                resetLogin();
            }
        }).observe(R, {
            attributes: true,
            attributeFilter: ['hidden']
        });

    } catch (error) {
        console.error('Login integration error:', error);
    }
})();



/* ===== Extracted script ===== */
/* v7: notifications pane + sidebar account sync */
(()=>{try{
const L=document.getElementById('nl'),P=document.querySelector('.nt-r');
if(L&&P){const it=()=>[...L.querySelectorAll('.ni')],tabs=[...document.querySelectorAll('.nt-tabs button')];
const cnt=()=>{document.querySelector('[data-ucount]').textContent=L.querySelectorAll('.ni.un').length};
const flt=()=>{const un=document.querySelector('.nt-tabs .on').dataset.nf==='un';let n=0;it().forEach(i=>{const ok=!un||i.classList.contains('un');i.hidden=!ok;if(ok)n++});L.querySelector('.nt-empty').hidden=n>0;cnt()};
document.addEventListener('click',e=>{const i=e.target.closest('#nl .ni'),t=e.target.closest('.nt-tabs button');
 if(i){i.classList.remove('un');badge();cnt();it().forEach(x=>x.classList.toggle('on',x===i));P.querySelectorAll('.nd').forEach(a=>a.hidden=a.dataset.for!==i.dataset.n)}
 if(t){tabs.forEach(b=>b.classList.toggle('on',b===t));flt()}
 if(e.target.closest('[data-markread]'))flt()})}
[['mn','sbn'],['mr','sbr'],['ab','sbi']].forEach(([a,b])=>{const s=document.getElementById(a),d=document.getElementById(b);if(!s||!d)return;const f=()=>{d.textContent=s.textContent};new MutationObserver(f).observe(s,{childList:true,characterData:true,subtree:true});f()});
}catch(e){console.warn(e)}})();

/* ===== Extracted script ===== */
(function(){const t=localStorage.getItem('regitrack_theme');if(t)document.documentElement.setAttribute('data-theme',t)})();
function toggleTheme(){
  const root=document.documentElement;
  const isDark=root.getAttribute('data-theme')==='dark'||(!root.getAttribute('data-theme')&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  const next=isDark?'light':'dark';
  root.setAttribute('data-theme',next);
  localStorage.setItem('regitrack_theme',next);
  toast('Switched to '+next+' mode');
}

/* ===== Extracted script ===== */
(function(){var h=((window.__RT_HASH||"")||'').slice(1),d='choose',id=document.getElementById(h)&&PAGE[h]===HERE?h:d;
if(id==='login'&&!(window.RTA&&RTA.get()))id='choose';
if(HERE==='student-main.html'&&id==='s-home'&&!document.getElementById('s-home')){id='login'}
go(id);
try{var q=sessionStorage.getItem('rt-q');if(q){sessionStorage.removeItem('rt-q');var R=RO[role],i=document.getElementById(R.q);if(i){i.value=q;i.dispatchEvent(new Event('input',{bubbles:true}))}}}catch(e){}})();

/* ===== Extracted script ===== */
/* UI additions: requirements panel, email toggles, dynamic QR */
(function(){try{
const RQ={'Transcript of Records':['₱150 per copy','3–5 days',['Valid school ID or government ID','Cleared accountabilities','Request letter (for alumni)']],
'Certificate of Enrollment':['₱50 per copy','1 day',['Valid school ID','Currently enrolled status']],
'Certificate of Grades':['₱50 per copy','1–2 days',['Valid school ID','Term/semester to be covered']],
'Good Moral Certificate':['₱60 per copy','2 days',['Valid ID','Clearance from the Student Affairs Office']],
'Diploma (Certified Copy)':['₱200 per copy','5–7 days',['Valid ID','Photocopy of original diploma','Request letter']],
'Form 137':['₱100 per copy','3 days',['Valid ID','Authorization letter if claimed by a representative']]};
const P=document.getElementById('rqp');
const up=()=>{const o=document.querySelector('#wd .opt.on b');if(!o||!P)return;const d=RQ[o.textContent];if(!d)return;
 P.innerHTML='<h3>Requirements for '+o.textContent+'<span class="pill p5">'+d[0]+' · '+d[1]+'</span></h3><ul class="rq-list">'+d[2].map(x=>'<li>'+x+'</li>').join('')+'</ul>'};
document.addEventListener('click',()=>setTimeout(up,0));up();
document.addEventListener('click',e=>{const w=e.target.closest('.sw');if(w)w.classList.toggle('on')});

/* =====================================
   DYNAMIC PICKUP QR
===================================== */
window.renderPickupQR = function(request, status) {
    const box = document.getElementById('qrBox');
    const codeEl = document.getElementById('qrCode');
    const bar = document.getElementById('qrBar');
    const timer = document.getElementById('qrTimer');
    const card = document.getElementById('qrPickupCard');
    const detailGrid = document.querySelector('#s-detail .dash');

    if (!box || !card || !detailGrid) {
        console.error('QR elements or detail layout are missing.');
        return;
    }

    const normalizedStatus = (status || '')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .trim();

    const isReady = normalizedStatus.includes('ready');

    const isReleased =
        normalizedStatus.includes('released') ||
        normalizedStatus.includes('claimed');

    box.innerHTML = '';

    // =====================================
    // HIDE QR WHEN NOT READY OR ALREADY CLAIMED
    // =====================================
    if (!isReady || isReleased) {

        card.hidden = true;
        detailGrid.classList.add('qr-hidden');

        if (codeEl) codeEl.textContent = '';
        if (bar) bar.style.width = '0%';

        if (timer) {
            timer.textContent = isReleased
                ? 'Already claimed'
                : 'Not yet available';
        }

        return;
    }

    // =====================================
    // SHOW QR WHEN REQUEST IS READY
    // =====================================
    card.hidden = false;
    detailGrid.classList.remove('qr-hidden');

    const referenceNumber = request.reference_number;

    if (!referenceNumber) {
        box.textContent = 'Reference number unavailable.';
        console.error('Request has no reference_number:', request);
        return;
    }

    if (typeof QRCode === 'undefined') {
        box.textContent = 'QR generator library not loaded.';
        console.error('QRCode library is missing.');
        return;
    }

    // Generate QR automatically
    new QRCode(box, {
        text: referenceNumber,
        width: 220,
        height: 220,
        colorDark: '#1e3320',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    if (codeEl) {
        codeEl.textContent = referenceNumber;
    }
};
}catch(e){console.warn(e)}})();

/* ===== Extracted script ===== */
(function(){
  function titles(){document.querySelectorAll('.side .nv').forEach(function(n){if(!n.title){n.title=n.textContent.replace(/\s+/g,' ').trim().replace(/\d+$/,'').trim()}})}
  titles();document.addEventListener('DOMContentLoaded',titles);
  var on=document.querySelector('.side .nv.on');if(on&&on.scrollIntoView&&innerWidth<=760){try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}
  
})();





async function loadDashboard() {
    const dashboard = document.getElementById('s-home');
    if (!dashboard) return;

    // =====================================
    // HELPER FUNCTIONS
    // =====================================

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value ?? '';
    };

    const formatDate = (value) => {
        if (!value) return 'Date unavailable';

        const date = new Date(value);

        if (isNaN(date.getTime())) return 'Date unavailable';

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (value) => {
        const amount = Number(value || 0);

        return '₱' + amount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getStatusDate = (request) => {
        if (!request) return 'Date unavailable';

        if (request.status === 'Ready for Pickup') {
            return request.ready_at
                ? formatDate(request.ready_at)
                : 'Not yet ready';
        }

        if (request.status === 'Released') {
            return request.released_at
                ? formatDate(request.released_at)
                : 'Not yet released';
        }

        return formatDate(request.submitted_at);
    };

    // =====================================
    // STATUS COLORS / BADGES
    // =====================================

    const statusClasses = {
        'Submitted': 'p1',
        'Under Review': 'p2',
        'Processing': 'p3',
        'Ready for Pickup': 'p4',
        'Released': 'p5',
        'Rejected': 'p1',
        'Cancelled': 'p1',
        'On Hold': 'p2'
    };

    const updateBadge = (element, status) => {
        if (!element) return;

        element.textContent = status || 'Unknown';

        Object.values(statusClasses).forEach(className => {
            element.classList.remove(className);
        });

        element.classList.remove('live');

        const className = statusClasses[status];

        if (className) {
            element.classList.add(className);
        }

        if (
            status === 'Processing' ||
            status === 'Submitted' ||
            status === 'Under Review'
        ) {
            element.classList.add('live');
        }
    };

    // =====================================
    // PROGRESS RING
    // =====================================

    const statusProgress = {
        'Submitted': 20,
        'Under Review': 40,
        'Processing': 60,
        'Ready for Pickup': 80,
        'Released': 100,
        'Rejected': 0,
        'Cancelled': 0,
        'On Hold': 60
    };

    const updateProgress = (request) => {
        const ring = dashboard.querySelector('.ring .rf');
        const ringText = dashboard.querySelector('.ring [data-cu]');

        const circumference = 276.46;

        const percent = request
            ? (statusProgress[request.status] ?? 0)
            : 0;

        if (ring) {
            ring.style.strokeDasharray = circumference;
            ring.style.strokeDashoffset =
                circumference - (circumference * percent / 100);

            ring.style.transition = 'stroke-dashoffset 0.8s ease';
        }

        if (ringText) {
            ringText.textContent = `${percent}%`;
            ringText.dataset.t = `${percent}%`;
        }
    };

    // =====================================
    // LOAD DASHBOARD API
    // =====================================

    try {
        const response = await fetch('/student/api/dashboard', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Dashboard API error: ${response.status}`);
        }

        const data = await response.json();

        console.log('Dashboard API response:', data);

        if (!data.success) {
            throw new Error(data.message || 'Dashboard data unavailable.');
        }

        const student = data.student || {};
        const statistics = data.statistics || {};

        const requests = Array.isArray(data.recent_requests)
            ? data.recent_requests
            : [];

        // =====================================
        // 1. STUDENT NAME
        // =====================================

        setText('studentName', student.full_name || 'Student');

        // =====================================
        // 2. LATEST AND SECOND LATEST REQUEST
        // =====================================

        const latestRequest = requests[0] || null;
        const secondRequest = requests[1] || null;

        const latestCard = document.getElementById('latestRequestCard');
        const secondCard = document.getElementById('secondRequestCard');

        const latestLabel = document.getElementById('latestRequestLabel');
        const latestButton = document.getElementById('latestRequestButton');

        const activeStatus = document.getElementById('activeRequestStatus');

        window.latestRequestId = latestRequest
            ? latestRequest.request_id
            : null;

        window.secondRequestId = secondRequest
            ? secondRequest.request_id
            : null;

        // =====================================
        // MAIN CARD
        // =====================================

        if (latestCard) {
            if (latestRequest) {
                // Show the latest request
                setText(
                    'activeDocumentName',
                    latestRequest.document_name || 'Document'
                );

                if (latestLabel) {
                    latestLabel.textContent = 'Latest Request';
                }

                updateBadge(activeStatus, latestRequest.status);

                setText(
                    'activeRequestDate',
                    'Submitted: ' + formatDate(latestRequest.submitted_at)
                );

                updateProgress(latestRequest);

                // Button opens the latest request
                if (latestButton) {
                    latestButton.textContent = 'View request';
                    latestButton.dataset.requestView = 'latest';
                }

            } else {
                // No requests yet
                setText('activeDocumentName', 'No requests yet');
                setText('activeRequestStatus', 'Start your first request');
                setText(
                    'activeRequestDate',
                    'Your document requests will appear here.'
                );

                if (latestLabel) {
                    latestLabel.textContent = 'Welcome';
                }

                updateProgress(null);

                // Button directs to the request page
                if (latestButton) {
                    latestButton.textContent = 'Request Now';

                    // Remove the previous request-view action
                    delete latestButton.dataset.requestView;

                    // Use your existing SPA navigation
                    latestButton.dataset.go = 's-new';
                }
            }
        }

        // =====================================
        // SECOND CARD
        // =====================================

        if (secondCard) {
            if (secondRequest) {
                // Show second most recent request
                secondCard.hidden = false;

                setText(
                    'readyDocumentName',
                    secondRequest.document_name || 'Document'
                );

                setText(
                    'readyRequestCode',
                    `${secondRequest.reference_number || 'No reference'} · Qty: ${secondRequest.quantity ?? 1} · ${formatCurrency(secondRequest.total_fee)}`
                );

                setText('readyPickupDate', getStatusDate(secondRequest));

                const secondBadge = secondCard.querySelector('.pill');

                updateBadge(secondBadge, secondRequest.status);

            } else {
                // Hide second card when there are fewer than 2 requests
                secondCard.hidden = true;
            }
        }

        // =====================================
        // ADJUST MAIN CARD WIDTH
        // =====================================

        if (latestCard) {
            latestCard.classList.toggle(
                'full-width',
                !secondRequest
            );
        }


        // =====================================
        // 4. AVAILABLE DOCUMENTS
        // =====================================

        try {
            const documentResponse = await fetch(
                '/student/api/documents',
                {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!documentResponse.ok) {
                throw new Error(
                    `Documents API error: ${documentResponse.status}`
                );
            }

            const documentData = await documentResponse.json();

            console.log('Documents API response:', documentData);

            if (documentData.success) {
                const documents = Array.isArray(documentData.documents)
                    ? documentData.documents
                    : [];

                setText(
                    'documentCount',
                    `${documents.length} available documents`
                );
            }

        } catch (error) {
            console.error('Document loading error:', error);
            setText('documentCount', 'Unable to load documents');
        }

        // =====================================
        // 5. TRACK REQUESTS
        // =====================================

        const activeCount =
            Number(statistics.submitted || 0) +
            Number(statistics.under_review || 0) +
            Number(statistics.processing || 0) +
            Number(statistics.ready_for_pickup || 0) +
            Number(statistics.on_hold || 0);

        const releasedCount = Number(statistics.released || 0);

        setText(
            'requestSummary',
            `${activeCount} active · ${releasedCount} released`
        );

        // =====================================
        // 6. RECENT REQUESTS (MAXIMUM 3)
        // =====================================

        const recentRequestsList = document.getElementById(
            'recentRequestsList'
        );

        const noRecentRequests = document.getElementById(
            'noRecentRequests'
        );

        // Get only the three most recent requests
        const recentRequests = requests.slice(0, 3);

        // Clear previous content
        if (recentRequestsList) {
            recentRequestsList.innerHTML = '';
        }

        // Show empty state if there are no requests
        if (recentRequests.length === 0) {

            if (recentRequestsList) {
                recentRequestsList.hidden = true;
            }

            if (noRecentRequests) {
                noRecentRequests.hidden = false;
            }

        } else {

            if (recentRequestsList) {
                recentRequestsList.hidden = false;
            }

            if (noRecentRequests) {
                noRecentRequests.hidden = true;
            }

            recentRequests.forEach((request, index) => {

                const statusClass =
                    statusClasses[request.status] || 'p1';

                const isActive = [
                    'Processing',
                    'Submitted',
                    'Under Review'
                ].includes(request.status);

                const row = document.createElement('button');

                row.type = 'button';
                row.className = 'row';
                row.dataset.requestId = request.request_id;

                row.innerHTML = `
                    <span class="ic ${request.status === 'Ready for Pickup' || request.status === 'Released' ? 'g' : ''}">
                        <svg class="i">
                            <use href="#file"/>
                        </svg>
                    </span>

                    <span class="t">
                        <b class="recent-name"></b>
                        <span class="mu recent-info"></span>
                    </span>

                    <span class="pill ${statusClass} ${isActive ? 'live' : ''} recent-status"></span>
                `;

                // Safely insert request information
                row.querySelector('.recent-name').textContent =
                    request.document_name || 'Document';

                row.querySelector('.recent-info').textContent =
                    `${request.reference_number || 'No reference'} · ${formatDate(request.submitted_at)}`;

                row.querySelector('.recent-status').textContent =
                    request.status || 'Unknown';

                recentRequestsList.appendChild(row);
            });
        }

    } catch (error) {
        console.error('Dashboard loading error:', error);

        if (typeof toast === 'function') {
            toast('Unable to load dashboard information.');
        }
    }
}



async function loadRequestHistory() {
    const list = document.getElementById('lg');
    const empty = document.querySelector('[data-e="lg"]');

    if (!list) return;

    list.innerHTML = `
        <p class="mu">Loading request history...</p>
    `;

    try {
        const response = await fetch('/student/api/requests', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Request History API:', data);
        console.log('Request records:', data.requests);
        console.log('Statistics:', data.statistics);
        console.log('Active count:', data.statistics.pending_requests);
        console.log('Ready count:', data.statistics.ready_for_pickup);
        console.log('Released count:', data.statistics.released);
        console.log('Total count:', data.statistics.total_requests);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to load request history.');
        }

        window.requestHistoryData = data.requests || [];

        updateHistoryStatistics(data.statistics);
        renderRequestHistory('all');

        console.log('Rendering request history...');
    } catch (error) {
        console.error('Request history error:', error);

        list.innerHTML = '';
        if (empty) {
            empty.hidden = false;
            empty.querySelector('p').textContent =
                error.message || 'Unable to load request history.';
        }
    }
}

function updateHistoryStatistics(stats) {
    if (!stats) return;

    const setText = (id, value) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value ?? 0;
        } else {
            console.warn(`Missing HTML element: #${id}`);
        }
    };

    setText('historyActiveCount', stats.pending_requests);
    setText('historyReadyCount', stats.ready_for_pickup);
    setText('historyReleasedCount', stats.released);
    setText('historyTotalCount', stats.total_requests);
}


function renderRequestHistory(filter = 'all') {
    const list = document.getElementById('lg');
    const empty = document.querySelector('[data-e="lg"]');

    if (!list) return;

    const requests = window.requestHistoryData || [];

    const activeStatuses = [
        'Submitted',
        'Under Review',
        'Processing',
        'On Hold'
    ];

    const filteredRequests = requests.filter(request => {
        switch (filter) {
            case 'active':
                return activeStatuses.includes(request.status);

            case 'ready':
                return request.status === 'Ready for Pickup';

            case 'released':
                return request.status === 'Released';

            case 'rejected':
                return request.status === 'Rejected';

            default:
                return true;
        }
    });

    list.innerHTML = '';

    if (filteredRequests.length === 0) {
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;

    const statusClasses = {
        'Submitted': 'p1',
        'Under Review': 'p2',
        'Processing': 'p3',
        'Ready for Pickup': 'p4',
        'Released': 'p5',
        'Rejected': 'pr',
        'Cancelled': 'p1',
        'On Hold': 'p2'
    };

    function getCategory(status) {
        if (activeStatuses.includes(status)) return 'active';
        if (status === 'Ready for Pickup') return 'ready';
        if (status === 'Released') return 'released';
        if (status === 'Rejected') return 'rejected';
        return 'all';
    }

    function formatRequestDate(value) {
        if (!value) return 'Date unavailable';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return 'Date unavailable';
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    filteredRequests.forEach(request => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'row';
        row.dataset.requestId = request.request_id;
        row.dataset.c = getCategory(request.status);

        const icon = document.createElement('span');
        icon.className = 'ic';

        const iconSvg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        iconSvg.setAttribute('class', 'i');

        const iconUse = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use'
        );
        iconUse.setAttribute('href', '#file');

        iconSvg.appendChild(iconUse);
        icon.appendChild(iconSvg);

        const details = document.createElement('span');
        details.className = 't';

        const name = document.createElement('b');
        name.textContent = request.document_name || 'Unknown document';

        const info = document.createElement('span');
        info.className = 'mu';
        info.textContent =
            `${request.reference_number || 'No reference'} · ${formatRequestDate(request.submitted_at)}`;

        details.appendChild(name);
        details.appendChild(info);

        const status = document.createElement('span');
        status.className =
            `pill ${statusClasses[request.status] || 'p1'}`;

        status.textContent = request.status || 'Unknown';

        row.appendChild(icon);
        row.appendChild(details);
        row.appendChild(status);

        list.appendChild(row);
    });
}


document.addEventListener('click', function (event) {
    const chip = event.target.closest('#s-list .chips .chip');

    if (!chip) return;

    const container = chip.closest('.chips');

    container.querySelectorAll('.chip').forEach(button => {
        button.classList.remove('on');
    });

    chip.classList.add('on');

    renderRequestHistory(chip.dataset.v || 'all');
});





// ============================================
// STUDENT DOCUMENT CATALOG
// ============================================

window.documentCatalog = [];
window.selectedDocumentId = null;


// Assign categories to the existing document cards.
function getDocumentCategory(documentName) {
    const name = (documentName || '').toLowerCase();

    if (name.includes('form')) {
        return 'forms';
    }

    if (
        name.includes('certificate') ||
        name.includes('good moral')
    ) {
        return 'certs';
    }

    return 'records';
}


// Select an icon based on the document name.
function getDocumentIcon(documentName) {
    const name = (documentName || '').toLowerCase();

    if (name.includes('transcript')) return 'file';
    if (name.includes('enrollment')) return 'cap';
    if (name.includes('grades')) return 'chart';
    if (name.includes('good moral')) return 'award';
    if (name.includes('diploma')) return 'book';
    if (name.includes('form')) return 'id';

    return 'file';
}


// Format Philippine peso values.
function formatDocumentFee(fee) {
    if (fee === null || fee === undefined || fee === '') {
        return 'Fee unavailable';
    }

    return Number(fee).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    });
}


// Create a safe text element.
function createTextElement(tag, className, value) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = value ?? '';

    return element;
}


// Retrieve documents from Flask.
async function loadDocumentCatalog() {
    const container = document.getElementById('dg');
    const tableBody = document.getElementById('documentFeeTable');
    const empty = document.querySelector('[data-e="dg"]');

    if (!container || !tableBody) return;

    container.innerHTML = '<p class="mu">Loading available documents...</p>';
    tableBody.innerHTML = `
        <tr>
            <td colspan="4">Loading document information...</td>
        </tr>
    `;

    try {
        const response = await fetch('/student/api/documents', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        console.log('Document Catalog API:', data);

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Unable to load documents.'
            );
        }

        // Support either {documents: [...]} or a direct array.
        const documents = Array.isArray(data)
            ? data
            : (data.documents || []);

        window.documentCatalog = documents;

        if (documents.length === 0) {
            container.innerHTML = '';
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">No available documents.</td>
                </tr>
            `;

            if (empty) empty.hidden = false;
            return;
        }

        if (empty) empty.hidden = true;

        renderDocumentCards(documents);
        await renderDocumentFeeTable(documents);

    } catch (error) {
        console.error('Document catalog error:', error);

        container.innerHTML = '';
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">Unable to load document information.</td>
            </tr>
        `;

        if (empty) {
            empty.hidden = false;
            empty.querySelector('p').textContent =
                error.message || 'Unable to load documents.';
        }
    }
}


// Render the document cards.
function renderDocumentCards(documents) {
    const container = document.getElementById('dg');

    if (!container) return;

    container.innerHTML = '';

    if (!Array.isArray(documents) || documents.length === 0) {
        container.innerHTML = `
            <p class="mu">No documents available.</p>
        `;
        return;
    }

    documents.forEach(doc => {
        const category = getDocumentCategory(doc.document_name);

        const tile = document.createElement('button');

        tile.type = 'button';
        tile.className = 'tile';
        tile.dataset.go = 's-new';
        tile.dataset.doc = doc.document_name;
        tile.dataset.docId = doc.document_id;
        tile.dataset.c = category;

        const iconContainer = document.createElement('span');
        iconContainer.className = 'ic';

        const icon = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );

        icon.setAttribute('class', 'i');

        const iconUse = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use'
        );

        iconUse.setAttribute(
            'href',
            '#' + getDocumentIcon(doc.document_name)
        );

        icon.appendChild(iconUse);
        iconContainer.appendChild(icon);

        const details = document.createElement('span');

        const name = createTextElement(
            'b',
            '',
            doc.document_name
        );

        const description = createTextElement(
            'span',
            'mu',
            doc.description || 'Registrar-issued document.'
        );

        const processing = doc.processing_days ?? 'Not specified';

        const information = createTextElement(
            'span',
            'mu pr2',
            `${formatDocumentFee(doc.fee)} · ${processing}`
        );

        details.appendChild(name);
        details.appendChild(description);
        details.appendChild(information);

        const arrowContainer = document.createElement('span');
        arrowContainer.className = 'ar';

        const arrow = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );

        arrow.setAttribute('class', 'i');

        const arrowUse = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use'
        );

        arrowUse.setAttribute('href', '#arr');

        arrow.appendChild(arrowUse);
        arrowContainer.appendChild(arrow);

        tile.appendChild(iconContainer);
        tile.appendChild(details);
        tile.appendChild(arrowContainer);

        container.appendChild(tile);
    });
}



// Retrieve requirements for one document.

async function getDocumentRequirements(documentId) {
    const response = await fetch(
        `/student/api/documents/${documentId}/requirements`,
        {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        }
    );

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message || 'Unable to load requirements.'
        );
    }

    // Supports both array and object API responses.
    if (Array.isArray(data)) {
        return data;
    }

    return data.requirements || [];
}




// Render fees and requirements table.
async function renderDocumentFeeTable(documents) {
    const tableBody = document.getElementById('documentFeeTable');

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="4">Loading document information...</td>
        </tr>
    `;

    const results = await Promise.all(
        documents.map(async doc => {
            try {
                const requirements = await getDocumentRequirements(
                    doc.document_id
                );

                return {
                    doc,
                    requirements: Array.isArray(requirements)
                        ? requirements
                        : [],
                    error: false
                };

            } catch (error) {
                console.error(
                    `Requirements error for ${doc.document_name}:`,
                    error
                );

                return {
                    doc,
                    requirements: [],
                    error: true
                };
            }
        })
    );

    tableBody.innerHTML = '';

    if (results.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">No document information available.</td>
            </tr>
        `;
        return;
    }

    results.forEach(result => {
        const doc = result.doc;
        const row = document.createElement('tr');

        // Document name
        const nameCell = document.createElement('td');
        const name = document.createElement('b');

        name.textContent = doc.document_name || 'Unnamed Document';
        nameCell.appendChild(name);

        // Fee
        const feeCell = document.createElement('td');
        feeCell.textContent = formatDocumentFee(doc.fee);

        // Processing time
        const processingCell = document.createElement('td');

        processingCell.textContent =
            doc.processing_days !== null &&
            doc.processing_days !== undefined &&
            doc.processing_days !== ''
                ? String(doc.processing_days).match(/day/i)
                    ? doc.processing_days
                    : `${doc.processing_days} days`
                : 'Not specified';

        // Requirements
        const requirementsCell = document.createElement('td');

        if (result.error) {
            requirementsCell.textContent =
                'Unable to load requirements.';

        } else if (result.requirements.length === 0) {
            requirementsCell.textContent =
                'No requirements listed.';

        } else {
            const list = document.createElement('ul');

            result.requirements.forEach(requirement => {
                const item = document.createElement('li');

                item.textContent =
                    requirement.requirement_text ||
                    requirement.requirement_name ||
                    requirement.description ||
                    'Requirement';

                if (
                    requirement.is_required === 0 ||
                    requirement.is_required === false ||
                    requirement.is_required === '0'
                ) {
                    item.textContent += ' (Optional)';
                }

                list.appendChild(item);
            });

            requirementsCell.appendChild(list);
        }

        row.appendChild(nameCell);
        row.appendChild(feeCell);
        row.appendChild(processingCell);
        row.appendChild(requirementsCell);

        tableBody.appendChild(row);
    });
}




// Stores documents retrieved from the database.
window.documentCatalog = [];
window.selectedDocumentId = null;






document.addEventListener('click', function(event) {
    const tile = event.target.closest('#dg .tile[data-doc-id]');

    if (!tile) return;

    const documentId = Number(tile.dataset.docId);

    window.selectedDocumentId = documentId;

    window.selectedDocumentData =
        (window.documentCatalog || []).find(
            doc => Number(doc.document_id) === documentId
        ) || null;

    console.log('SELECTED DOCUMENT:', window.selectedDocumentData);
}, true);




function updatePickupQR(request) {
    const qrCard = document.getElementById('pickupQRCard');

    if (!qrCard || !request) return;

    const status = String(
        request.status || request.request_status || ''
    ).toLowerCase().trim().replace(/[_-]+/g, ' ');

    const isReady =
        status === 'ready for release' ||
        status === 'ready to release' ||
        status === 'ready for pickup';

    qrCard.hidden = !isReady;
}


async function loadRequestDetail(requestId) {
    if (!requestId) return;

    try {
        const response = await fetch(
            `/student/api/requests/${encodeURIComponent(requestId)}`
        );

        const data = await response.json();
        console.log('REQUEST DETAIL API:', data);
        console.log('REQUEST OBJECT:', data.request);
        console.log('FEE:', data.request?.fee);
        console.log('ACTIVITIES:', data.request?.activities);
        

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Unable to load request details.'
            );
        }

        const request = data.request;

        renderRequestDetail(request);
        console.log('QR DATA:', {
            status: request.status,
            qr_image: request.qr_image,
            qr_expires_at: request.qr_expires_at,
            qr_redeemed: request.qr_redeemed
        });

    } catch (error) {
        console.error('Request detail error:', error);

        document.getElementById('detailRequestMeta').textContent =
            'Unable to load request details.';
    }
}


function renderRequestDetail(request) {

    // BASIC INFORMATION
    document.getElementById('detailDocumentName').textContent =
        request.document_name || 'Document Request';

    document.getElementById('detailRequestMeta').textContent =
        `${request.request_code || request.request_id} · Submitted ${request.submitted_at || '--'}`;

    document.getElementById('detailPurpose').textContent =
        request.purpose || '--';

    document.getElementById('detailFee').textContent =
        request.total_fee != null
            ? `₱${Number(request.total_fee).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
            : '--';

    document.getElementById('detailPickupDate').textContent =
        request.ready_at || 'Not yet scheduled';

    document.getElementById('detailEmail').textContent =
        request.email || '--';

    // STATUS
    const status = (request.status || '')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .trim();

    renderRequestProgress(status);

    // QR PICKUP PASS
    renderPickupQR(request, status);

    // ACTIVITY TIMELINE
    renderRequestActivity(request.status_history || []);

    // EMAIL UPDATES
    renderEmailUpdates(request.email_updates || []);

    console.log('STATUS HISTORY:', request.status_history);
    console.log('CURRENT STATUS:', request.status);
    console.log('QR IMAGE:', request.qr_image);
    console.log('QR EXPIRY:', request.qr_expires_at);
    console.log('QR REDEEMED:', request.qr_redeemed);
}


function renderRequestProgress(status) {

    const steps = [
        'submitted',
        'review',
        'processing',
        'ready',
        'released'
    ];

    let currentStep = 0;

    if (status.includes('submitted')) {
        currentStep = 0;
    } else if (
        status.includes('review') ||
        status.includes('approved')
    ) {
        currentStep = 1;
    } else if (
        status.includes('processing') ||
        status.includes('in progress')
    ) {
        currentStep = 2;
    } else if (
        status.includes('ready')
    ) {
        currentStep = 3;
    } else if (
        status.includes('released') ||
        status.includes('claimed')
    ) {
        currentStep = 4;
    } else if (
        status.includes('rejected') ||
        status.includes('declined') ||
        status.includes('cancelled')
    ) {
        currentStep = -1;
    }

    const progress = document.getElementById('detailProgress');

    progress.querySelectorAll('.sp1').forEach((step, index) => {

        step.classList.remove('d', 'c');

        if (currentStep === -1) return;

        if (index < currentStep) {
            step.classList.add('d');
        } else if (index === currentStep) {
            step.classList.add('c');
        }

    });

    const badge = document.getElementById('detailStatusBadge');

    badge.textContent = status
        ? status.replace(/\b\w/g, c => c.toUpperCase())
        : 'Unknown';

    // Optional: use your existing status badge styling
    badge.className = 'pill';

    if (status.includes('ready')) {
        badge.classList.add('p4');
    } else if (
        status.includes('released') ||
        status.includes('claimed')
    ) {
        badge.classList.add('p4');
    } else if (
        status.includes('rejected') ||
        status.includes('declined')
    ) {
        badge.classList.add('p1');
    } else {
        badge.classList.add('p3');
    }
}


function renderPickupQR(request, status) {

    const qrCard = document.getElementById('qrPickupCard');
    const qrBox = document.getElementById('qrBox');
    const qrCode = document.getElementById('qrCode');
    const qrState = document.getElementById('qrState');
    const qrTimer = document.getElementById('qrTimer');

    // Normalize status
    const normalizedStatus = (status || '')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .trim();

    const isReady = normalizedStatus.includes('ready');

    const isReleased =
        normalizedStatus.includes('released') ||
        normalizedStatus.includes('claimed');

    // Always clear previous QR before rendering
    qrBox.innerHTML = '';
    qrCode.textContent = '';
    qrTimer.textContent = '';

    // Hide QR if not ready or already claimed
    if (!isReady || isReleased) {

        qrCard.hidden = true;

        qrState.textContent = isReleased
            ? 'Already claimed'
            : 'Not yet available';

        return;
    }

    // Request is ready
    qrCard.hidden = false;

    // Check QR image from backend
    if (!request.qr_image) {

        qrBox.textContent = 'QR code is being prepared.';

        qrCode.textContent =
            request.reference_number ||
            request.request_code ||
            request.request_id ||
            '';

        qrState.textContent = 'Preparing pickup pass';

        return;
    }

    // Create QR image
    const qrImage = document.createElement('img');

    qrImage.src = request.qr_image;
    qrImage.alt = 'Pickup QR code';

    qrImage.style.width = '100%';
    qrImage.style.maxWidth = '220px';
    qrImage.style.display = 'block';
    qrImage.style.margin = '0 auto';

    qrImage.onerror = function() {
        qrBox.textContent = 'Unable to load QR code.';
        console.error('QR image failed to load:', request.qr_image);
    };

    qrBox.appendChild(qrImage);

    // Display request reference
    qrCode.textContent =
        request.reference_number ||
        request.request_code ||
        request.request_id ||
        '';

    qrState.textContent = request.qr_redeemed
        ? 'Redeemed'
        : 'Active · single use';

    qrTimer.textContent = request.qr_expires_at
        ? `Expires: ${request.qr_expires_at}`
        : 'Valid pickup pass';
}

function renderRequestActivity(activities) {

    const container = document.getElementById('detailActivity');

    container.innerHTML = '';

    if (!activities.length) {
        container.innerHTML =
            '<p class="mu">No activity recorded yet.</p>';
        return;
    }

    activities.forEach(activity => {

        const item = document.createElement('div');

        const content = document.createElement('span');

        // STATUS TITLE
        const title = document.createElement('b');
        title.textContent = activity.new_status || 'Update';

        // DATE
        const date = document.createElement('span');
        date.className = 'mu';

        date.textContent = activity.changed_at
            ? new Date(activity.changed_at).toLocaleString('en-PH', {
                dateStyle: 'medium',
                timeStyle: 'short'
            })
            : '';

        content.appendChild(title);
        content.appendChild(document.createElement('br'));
        content.appendChild(date);

        if (activity.changed_by_name) {
            content.appendChild(document.createElement('br'));
        }

        item.appendChild(content);

        container.appendChild(item);
    });
}


function renderEmailUpdates(updates) {

    const container = document.getElementById('detailEmailUpdates');

    container.innerHTML = '';

    if (!updates.length) {
        container.innerHTML =
            '<p class="mu">No email updates recorded.</p>';
        return;
    }

    updates.forEach(update => {

        const row = document.createElement('div');
        row.className = 'em';

        const icon = document.createElement('span');
        icon.className = 'ic g';

        icon.innerHTML = '<svg class="i"><use href="#bell"/></svg>';

        const content = document.createElement('div');

        const title = document.createElement('b');
        title.textContent = update.subject || update.message || 'Email update';

        const date = document.createElement('span');
        date.textContent = update.sent_at || update.date || '';

        content.appendChild(title);
        content.appendChild(date);

        row.appendChild(icon);
        row.appendChild(content);

        container.appendChild(row);
    });
}

document.addEventListener('click', function(e) {

    // =====================================
    // DASHBOARD REQUEST BUTTONS
    // =====================================

    const dashboardButton = e.target.closest(
        '#s-home [data-request-view]'
    );

    if (dashboardButton) {

        const type = dashboardButton.dataset.requestView;

        const requestId = type === 'latest'
            ? window.latestRequestId
            : window.secondRequestId;

        if (requestId) {
            openRequestDetail(requestId);
        } else {
            console.warn('No request ID available for this button.');
        }

        return;
    }

    // =====================================
    // REQUEST HISTORY BUTTONS
    // =====================================

    const requestCard = e.target.closest(
        '#s-list [data-request-id]'
    );

    if (requestCard) {

        const requestId = requestCard.dataset.requestId;

        if (requestId) {
            openRequestDetail(requestId);
        }

    }

});

function openRequestDetail(requestId) {
    if (!requestId) {
        console.error('Missing request ID.');
        return;
    }

    window.selectedRequestId = requestId;

    go('s-detail');

    loadRequestDetail(requestId);
}


async function loadHeaderProfile() {
    try {
        const response = await fetch('/student/api/profile');

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const data = await response.json();

        if (!data.success || !data.profile) {
            throw new Error('Profile data unavailable');
        }

        const profile = data.profile;
        const fullName = profile.full_name || 'Student';
        const email = profile.email || 'No email available';

        const initials = fullName
            .split(/\s+/)
            .filter(Boolean)
            .map(name => name[0])
            .join('')
            .toUpperCase();

        document.getElementById('mn').textContent = fullName;
        document.getElementById('ab').textContent = initials;
        document.getElementById('ab2').textContent = initials;
        document.getElementById('mr').textContent = 'Student';

        const emailElement = document.getElementById('profileEmail');

        if (emailElement) {
            emailElement.textContent = email;
        }
    } catch (error) {
        console.error('Error loading header profile:', error);
    }
}


// =========================================
// STUDENT SIGNUP
// =========================================

const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const message = document.getElementById('signupMessage');
        const submitBtn = document.getElementById('signupSubmit');

        const fullName = document.getElementById('signupName').value.trim();
        const studentId = document.getElementById('signupStudentId').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const program = document.getElementById('signupProgram').value.trim();
        const yearLevel = document.getElementById('signupYearLevel').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        message.hidden = false;

        // Check matching passwords
        if (password !== confirmPassword) {
            message.textContent = 'Passwords do not match.';
            return;
        }

        if (password.length < 8) {
            message.textContent = 'Password must be at least 8 characters.';
            return;
        }

        submitBtn.disabled = true;
        message.textContent = 'Creating account...';

        try {
            const response = await fetch('/auth/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: fullName,
                    student_id: studentId,
                    program: program,
                    year_level: yearLevel,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                message.textContent = data.message || 'Registration failed.';
                return;
            }

            message.textContent = 'Account created successfully! Please log in.';
            signupForm.reset();

            setTimeout(() => {
                go('login');
            }, 1200);

        } catch (error) {
            console.error('Signup error:', error);
            message.textContent = 'Unable to connect to the server.';
        } finally {
            submitBtn.disabled = false;
        }
    });
}



(function () {
    const page = document.getElementById('s-new');
    if (!page) return;

    const purposeInput = page.querySelector('#wpu');
    const copiesDisplay = page.querySelector('[id="cp"]');
    const feeDisplay = page.querySelector('#fee');
    const feePerCopyDisplay = page.querySelector('#feePerCopy');
    const selectedInfo = page.querySelector('#selectedDocumentInfo');
    const requirementsBox = page.querySelector('#documentRequirements');
    const reviewBox = page.querySelector('#rv');
    const message = page.querySelector('#requestMessage');

    const nextButton = page.querySelector('#wn');
    const backButton = page.querySelector('#wb');

    let documents = [];
    let selectedDocument = null;
    let copies = 1;
    let currentStep = 1;
    let submitting = false;

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.style.color = isError ? '#c0392b' : '';
    }

    function getFeeAmount(value) {
        // Supports values such as:
        // 150
        // "150.00"
        // "1,500.00"
        // "₱1,500.00"

        const cleaned = String(value ?? '')
            .replace(/,/g, '')
            .replace(/[^\d.-]/g, '');

        const amount = Number(cleaned);

        return Number.isFinite(amount) && amount >= 0
            ? amount
            : 0;
    }

    const peso = value =>
        '₱' + getFeeAmount(value).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    function calculateTotalFee() {
        if (!selectedDocument) return 0;

        const feePerCopy = getFeeAmount(selectedDocument.fee);
        const quantity = Math.max(1, Math.min(20, Number(copies) || 1));

        return feePerCopy * quantity;
    }

    function updateFee() {
        const feePerCopy = selectedDocument
            ? getFeeAmount(selectedDocument.fee)
            : 0;

        const total = feePerCopy * copies;

        console.log('SELECTED DOCUMENT:', selectedDocument);
        console.log('RAW FEE:', selectedDocument?.fee);
        console.log('CONVERTED FEE:', feePerCopy);
        console.log('COPIES:', copies);
        console.log('TOTAL:', total);

        copiesDisplay.textContent = String(copies);
        feePerCopyDisplay.textContent = peso(feePerCopy);
        feeDisplay.textContent = peso(total);
        
    }


    async function loadRequirements(documentId) {
            requirementsBox.innerHTML =
                '<p class="mu">Loading requirements...</p>';

            try {
                const response = await fetch(
                    `/student/api/documents/${documentId}/requirements`,
                    { credentials: 'same-origin' }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Unable to load requirements.');
                }

                const requirements = data.requirements || [];

                if (!requirements.length) {
                    requirementsBox.innerHTML =
                        '<p class="mu">No additional requirements listed.</p>';
                    return;
                }

                const heading = document.createElement('h3');
                heading.textContent = 'Requirements';
                requirementsBox.replaceChildren(heading);

                requirements.forEach(item => {
                    const row = document.createElement('p');
                    row.className = 'mu';

                    row.textContent =
                        `${item.requirement_text}${item.is_required ? ' (Required)' : ' (Optional)'}`;

                    requirementsBox.appendChild(row);
                });

            } catch (error) {
                requirementsBox.textContent = error.message;
            }
        }

    function updateStep(step) {
        currentStep = step;

        page.querySelectorAll('.wp').forEach(panel => {
            panel.classList.toggle(
                'on',
                Number(panel.dataset.s) === step
            );
        });

        page.querySelectorAll('#wst .sp1').forEach((indicator, index) => {
            indicator.classList.toggle('c', index + 1 === step);
            indicator.classList.toggle('d', index + 1 < step);
        });

        backButton.hidden = step === 1;

        nextButton.disabled = submitting;

        nextButton.innerHTML = step === 2
            ? 'Submit Request'
            : 'Continue <svg class="i"><use href="#arr"/></svg>';

        showMessage('');
    }


    function prepareNewRequestForm(doc) {
        if (!doc) {
            showMessage(
                'No document was selected. Please select a document first.',
                true
            );

            return;
        }

        selectedDocument = doc;
        copies = 1;
        submitting = false;

        purposeInput.value = '';

        selectedInfo.textContent =
            doc.description || 'No description available.';

        updateFee();
        updateStep(1);
    }

    window.prepareNewRequestForm = prepareNewRequestForm;


    function renderReview() {
        if (!selectedDocument) return;

        const fee = getFeeAmount(selectedDocument.fee);
        const totalFee = calculateTotalFee();

        reviewBox.innerHTML = '';

        const rows = [
            ['Document', selectedDocument.document_name],
            ['Purpose', purposeInput.value.trim()],
            ['Copies', copies],
            ['Fee per copy', peso(fee)],
            ['Total fee', peso(totalFee)]
        ];

        rows.forEach(([label, value]) => {
            const row = document.createElement('div');
            row.className = 'kv';

            const left = document.createElement('span');
            left.textContent = label;

            const right = document.createElement('b');
            right.textContent = value;

            row.append(left, right);
            reviewBox.appendChild(row);
        });

        const note = document.createElement('p');
        note.className = 'mu';
        note.textContent =
            'Pickup date and release details will be provided by the registrar staff.';

        reviewBox.appendChild(note);
    }

    async function submitRequest() {
        if (submitting) return;

        submitting = true;
        nextButton.disabled = true;
        nextButton.textContent = 'Submitting...';

        try {
            const response = await fetch('/student/api/requests', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    document_id: selectedDocument.document_id,
                    purpose: purposeInput.value.trim(),
                    quantity: copies
                })
            });

            const data = await response.json();
            console.log('SUBMISSION STATUS:', response.status);
            console.log('SUBMISSION RESPONSE:', data);

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to submit your request.'
                );
            }

            // Save the newly created request ID.
            const requestId = data.data?.request_id ?? data.request_id;

            if (!requestId) {
                throw new Error(
                    'Request was submitted, but no request ID was returned.'
                );
            }

            // Navigate to the request information page.
            window.currentRequestId = requestId;
            window.latestRequestId = requestId;

            if (requestId) {
                openRequestDetail(requestId);
            }

            // Load the specific request into the detail page.
            if (typeof window.loadRequestDetails === 'function') {
                await window.loadRequestDetails(requestId);
            }

        } catch (error) {
            showMessage(error.message, true);
            submitting = false;
            updateStep(2);

        } finally {
            if (submitting) {
                // Keep the button disabled while navigation takes place.
                nextButton.disabled = true;
            }
        }
    }

    // Copies controls
    page.querySelectorAll('[data-step]').forEach(button => {
        button.addEventListener('click', () => {
            const change = Number(button.dataset.step);

            console.log('-------------------------');
            console.log('BUTTON:', button.outerHTML);
            console.log('CHANGE:', change);
            console.log('BEFORE:', copies);
            console.log('Copies elements:', document.querySelectorAll('#cp').length);

            console.log(
                'Copies element values:',
                [...document.querySelectorAll('#cp')].map(el => el.textContent)
            );

            copies = Math.max(1, Math.min(20, copies + change));

            console.log('AFTER:', copies);

            updateFee();
        });
    });

    // Back button
    backButton.addEventListener('click', () => {
        if (currentStep === 2) {
            updateStep(1);
        }
    });

    // Continue / submit button
    nextButton.addEventListener('click', () => {
        if (submitting) return;

        // STEP 1: DETAILS
        if (currentStep === 1) {
            if (!selectedDocument) {
                showMessage('Please select a document first.', true);
                return;
            }

            if (!purposeInput.value.trim()) {
                showMessage(
                    'Please enter the purpose of your request.',
                    true
                );

                purposeInput.focus();
                return;
            }

            if (purposeInput.value.trim().length > 500) {
                showMessage(
                    'Purpose must not exceed 500 characters.',
                    true
                );

                return;
            }

            renderReview();
            updateStep(2);
            return;
        }

        // STEP 2: REVIEW AND SUBMIT
        if (currentStep === 2) {
            submitRequest();
        }
    });

    // Initial load
    updateStep(1);

    window.resetNewRequestForm = function () {
        selectedDocument = null;
        copies = 1;
        currentStep = 1;
        submitting = false;

        purposeInput.value = '';

        copiesDisplay.textContent = '1';
        feeDisplay.textContent = peso(0);
        feePerCopyDisplay.textContent = peso(0);

        selectedInfo.textContent = 'No document selected.';
        requirementsBox.innerHTML = '';

        reviewBox.innerHTML = '';

        showMessage('');
        updateStep(1);
    };
    

    // Allow dashboard / other navigation to reset the form.
    window.resetNewRequestForm = function () {
        selectedDocument = null;
        copies = 1;
        currentStep = 1;
        submitting = false;

        purposeInput.value = '';
        copiesDisplay.textContent = '1';
        feeDisplay.textContent = peso(0);
        feePerCopyDisplay.textContent = peso(0);

        loadDocuments();
        updateStep(1);
    };

})();
