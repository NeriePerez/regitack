

const DEFAULT_NOTIFS = [
  { id:1, title:'New TOR Request #1048', desc:'Maria Clara Santos submitted payment receipt', time:'12m ago', unread:true, reqId:'REQ-2026-1048' },
  { id:2, title:'Scholarship COE Urgent', desc:'Juan Miguel Reyes • DOST deadline tomorrow', time:'44m ago', unread:true, reqId:'REQ-2026-1047' },
  { id:3, title:'Archival Check Needed', desc:'Alyssa Mae Mendoza Diploma Authentication', time:'2h ago', unread:false, reqId:'REQ-2026-1046' }
];

let REQUESTS = JSON.parse(localStorage.getItem('regitrack_requests') || 'null');
let LISTINGS = JSON.parse(localStorage.getItem('regitrack_listings') || 'null');
let NOTIFS = JSON.parse(localStorage.getItem('regitrack_notifs') || 'null') || DEFAULT_NOTIFS;

let DB_USERS = [];
let DB_ROLES = [];
/* ================= HTML ESCAPING ================= */

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}



/* Global Search */
const gInput = document.getElementById('globalSearchInput');
const gSug = document.getElementById('searchSuggestions');

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    gInput.focus();
  }
  if (e.key === 'Escape') { closePops(); closeModal(); }
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
        <svg class="i" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div class="t">
          <b>${r.studentName} • ${r.type}</b>
          <small>${r.id} • ${r.date}</small>
        </div>
        <em>${r.status}</em>
      </div>
    `).join('');
  gSug.classList.add('on');
});

/* Notifications */
function renderNotifs() {
  const unreadCount = NOTIFS.filter(n => n.unread).length;
  document.getElementById('notifDot').hidden = unreadCount === 0;
  document.getElementById('notifList').innerHTML = NOTIFS.map(n => `
    <button class="ni ${n.unread ? 'un' : ''}" onclick="openNotif(${n.id}, '${n.reqId}')">
      <div class="ic g" style="width:36px;height:36px;border-radius:11px">
        <svg class="i" style="width:17px;height:17px" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V8z"/></svg>
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
  saveState();
  openRequestPage(reqId);
}

function markAllRead() {
  NOTIFS.forEach(n => n.unread = false);
  saveState();
  renderNotifs();
  toast('All alerts marked as read');
}

function toast(msg) {
  const wrap = document.getElementById('ts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<i><svg class="i" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></i><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3300);
}



function toggleListingStatus(id) {
  const item = LISTINGS.find(l => l.id === id);
  if (!item) return;
  item.active = !item.active;
  saveState();
  toast(`${item.name} is now ${item.active ? 'Active' : 'Paused'}`);
}

function openNextPending() {
  const next = REQUESTS.find(r => r.status === 'Pending' || r.status === 'In Review') || REQUESTS[0];
  openRequestPage(next.id);
}

function openAddListingModal() {
  const bg = document.getElementById('modalBg');
  document.getElementById('modalContent').innerHTML = `
    <div class="sec">
      <h2>Add Registry Service Listing</h2>
      <button class="ib" style="width:36px;height:36px" onclick="closeModal()">✕</button>
    </div>
    <p class="mu" style="margin-bottom:16px">Publish a new document or registrar service for student applications.</p>
    <div style="display:grid;gap:12px">
      <div>
        <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Service / Document Name</label>
        <input id="newLstName" class="dinp" style="width:100%" placeholder="e.g., Certified True Copy of Grades">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Fee (₱)</label>
          <input id="newLstFee" class="dinp" style="width:100%" value="₱150.00">
        </div>
        <div>
          <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">SLA Turnaround</label>
          <input id="newLstSla" class="dinp" style="width:100%" value="24 hrs">
        </div>
      </div>
      <div>
        <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Description</label>
        <input id="newLstDesc" class="dinp" style="width:100%" placeholder="Short description for students...">
      </div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <button class="btn ol w" onclick="closeModal()">Cancel</button>
        <button class="btn w" onclick="saveNewListing()">Publish Listing</button>
      </div>
    </div>
  `;
  bg.classList.add('on');
}

function saveNewListing() {
  const name = document.getElementById('newLstName').value.trim();
  const fee = document.getElementById('newLstFee').value.trim() || '₱150.00';
  const sla = document.getElementById('newLstSla').value.trim() || '24 hrs';
  const desc = document.getElementById('newLstDesc').value.trim() || 'Official registrar document service.';
  if (!name) { toast('Please enter a service name'); return; }
  LISTINGS.unshift({ id: 'LST-0' + (LISTINGS.length + 1), name, code: 'DOC-NEW', fee, sla, count: 0, active: true, desc });
  saveState();
  closeModal();
  toast(`Published "${name}" to active listings`);
}

function closeModal() { document.getElementById('modalBg').classList.remove('on'); }

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
  renderNotifs();

  initializeUserFilters();
  loadUserManagementData();

  document.getElementById('addUserButton')
        ?.addEventListener('click', openAddUser);

    document.getElementById('userSearch')
        ?.addEventListener('input', renderUsersTable);

    document.getElementById('roleFilter')
        ?.addEventListener('change', renderUsersTable);

    document.getElementById('statusFilter')
        ?.addEventListener('change', renderUsersTable);

    document.getElementById('clearFilters')
        ?.addEventListener('click', () => {
            document.getElementById('userSearch').value = '';
            document.getElementById('roleFilter').value = '';
            document.getElementById('statusFilter').value = '';

            renderUsersTable();
        });
});

/* ===== USER MANAGEMENT ===== */
const ROLES=['Student','Registrar Staff','Admin'],ME='admin@regitrack.edu.ph';
const SEED=[{id:'U-01',name:'Registrar Admin',email:'admin@regitrack.edu.ph',role:'Admin',status:'Active',pass:'Admin@123'},{id:'U-02',name:'Registrar Rey',email:'registrar@email.com',role:'Registrar Staff',status:'Active',pass:'Registrar@123'},{id:'U-03',name:'Sam Rivera',email:'student@email.com',role:'Student',status:'Active',pass:'Student@123'},{id:'U-04',name:'Maria Clara Santos',email:'mc.santos@student.edu.ph',role:'Student',status:'Active',pass:'Student@123'},{id:'U-05',name:'Juan Miguel Reyes',email:'jm.reyes@student.edu.ph',role:'Student',status:'Active',pass:'Student@123'},{id:'U-06',name:'Ana Dela Cruz',email:'a.delacruz@dnsc.edu.ph',role:'Registrar Staff',status:'Active',pass:'Registrar@123'},{id:'U-07',name:'Rafael Bautista',email:'r.bautista@student.edu.ph',role:'Student',status:'Inactive',pass:'Student@123'}];
let USERS=JSON.parse(localStorage.getItem('regitrack_users')||'null')||SEED;
const saveU=()=>localStorage.setItem('regitrack_users',JSON.stringify(USERS));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ini=n=>n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const activeAdmins=()=>USERS.filter(x=>x.role==='Admin'&&x.status==='Active').length;
const lastAdmin=x=>x.role==='Admin'&&x.status==='Active'&&activeAdmins()<=1;
function renderUsers(){
 const q=(document.getElementById('uSearch').value||'').toLowerCase(),rf=document.getElementById('uRole').value,sf=document.getElementById('uStatus').value;
 const UIC=["<svg class=\"i\" viewBox=\"0 0 24 24\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0a3-3.87\"/><path d=\"M16 3.13a4 4 0 0 0 0 7.75\"/></svg>", "<svg class=\"i\" viewBox=\"0 0 24 24\"><path d=\"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z\"/><path d=\"M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0a3-3h7z\"/></svg>", "<svg class=\"i\" viewBox=\"0 0 24 24\"><rect x=\"2\" y=\"7\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"/></svg>", "<svg class=\"i\" viewBox=\"0 0 24 24\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg>"];
 document.getElementById('uStats').innerHTML=[['Total Users',USERS.length],['Students',USERS.filter(x=>x.role==='Student').length],['Registrar Staff',USERS.filter(x=>x.role==='Registrar Staff').length],['Admins',USERS.filter(x=>x.role==='Admin').length]].map((s,i)=>'<div class="stat card"><div class="ic">'+UIC[i]+'</div><div><b>'+s[1]+'</b><span class="mu">'+s[0]+'</span></div></div>').join('');
 const L=USERS.filter(x=>(!rf||x.role===rf)&&(!sf||x.status===sf)&&(!q||x.name.toLowerCase().includes(q)||x.email.toLowerCase().includes(q)));
 document.getElementById('uList').innerHTML=L.length?'<div class="urow uhead"><span>User</span><span>Role</span><span>Status</span><span></span></div>'+L.map(x=>'<div class="urow"><div class="who"><span class="av">'+ini(x.name)+'</span><div style="min-width:0"><b>'+esc(x.name)+(x.email===ME?' <small class="mu" style="display:inline">(you)</small>':'')+'</b><span class="mu">'+esc(x.email)+' · '+(x.last?'Last login '+new Date(x.last).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Never logged in')+'</span></div></div><select class="dinp" onchange="setRole(\''+x.id+'\',this.value)">'+ROLES.map(r=>'<option'+(r===x.role?' selected':'')+'>'+r+'</option>').join('')+'</select><span><span class="pill '+(x.status==='Active'?'p5':'p2')+'">'+x.status+'</span></span><div class="uacts"><button class="lk" onclick="editUser(\''+x.id+'\')">Edit</button><button class="lk" onclick="resetPw(\''+x.id+'\')">Reset password</button><button class="lk" onclick="toggleUser(\''+x.id+'\')">'+(x.status==='Active'?'Deactivate':'Activate')+'</button><button class="lk dn2" onclick="delUser(\''+x.id+'\')">Remove</button></div></div>').join(''):'<div class="mu" style="padding:18px 20px">No users match your search.</div>';
 const P=PERMS();
 document.getElementById('permTable').innerHTML='<thead><tr><th>Permission</th>'+ROLES.map(r=>'<th class="c" style="width:150px">'+r+'</th>').join('')+'</tr></thead><tbody>'+PERM_ROWS.map((n,ri)=>'<tr><td style="font-weight:600">'+n+'</td>'+[0,1,2].map(ci=>'<td class="c"><input type="checkbox" '+(P[ri][ci]?'checked ':'')+(ci===2&&ri>=5?'disabled ':'')+'onchange="setPerm('+ri+','+ci+',this.checked)" aria-label="'+n+' — '+ROLES[ci]+'"></td>').join('')+'</tr>').join('')+'</tbody>';
}
function setRole(id,r){const x=USERS.find(u=>u.id===id);if(x.role!=='Admin'||r==='Admin'){}else if(lastAdmin(x)||x.email===ME){toast('At least one active Admin (and your own account) must stay an Admin');renderUsers();return}x.role=r;saveU();logAudit('Role changed',x.email+' → '+r);renderUsers();toast(x.name+' is now '+r)}
function toggleUser(id){const x=USERS.find(u=>u.id===id);if(x.status==='Active'&&(x.email===ME||lastAdmin(x))){toast('You cannot deactivate the last active Admin or your own account');return}x.status=x.status==='Active'?'Inactive':'Active';saveU();logAudit(x.status==='Active'?'Account activated':'Account deactivated',x.email);renderUsers();toast(x.name+' is now '+x.status)}
function delUser(id){const x=USERS.find(u=>u.id===id);if(x.email===ME||lastAdmin(x)){toast('You cannot remove the last active Admin or your own account');return}USERS=USERS.filter(u=>u.id!==id);saveU();logAudit('User removed',x.email);renderUsers();toast('Removed '+x.name)}
//function openAddUser(){document.getElementById('modalContent').innerHTML='<div class="sec"><h2>Add User</h2><button class="ib" style="width:36px;height:36px" onclick="closeModal()">✕</button></div><p class="mu" style="margin-bottom:16px">Create an account and assign its role.</p><div style="display:grid;gap:12px"><div><label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Full Name</label><input id="nuName" class="dinp" style="width:100%" placeholder="e.g., Ana Dela Cruz"></div><div><label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Email</label><input id="nuEmail" class="dinp" style="width:100%" placeholder="name@dnsc.edu.ph"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Role</label><select id="nuRole" class="dinp" style="width:100%">'+ROLES.map(r=>'<option>'+r+'</option>').join('')+'</select></div><div><label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Temporary Password</label><input id="nuPass" class="dinp" style="width:100%" value="Welcome@123"></div></div><div style="display:flex;gap:10px;margin-top:8px"><button class="btn ol w" onclick="closeModal()">Cancel</button><button class="btn w" onclick="saveUser()">Create User</button></div></div>';document.getElementById('modalBg').classList.add('on')}
function saveUser(){const name=nuName.value.trim(),email=nuEmail.value.trim().toLowerCase(),pass=nuPass.value.trim();if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Enter a name and a valid email');return}if(pass.length<6){toast('Password must be at least 6 characters');return}if(USERS.some(x=>x.email===email)){toast('That email already has an account');return}USERS.unshift({id:'U-'+String(Date.now()).slice(-5),name,email,role:nuRole.value,status:'Active',pass});saveU();logAudit('User created',email+' as '+nuRole.value);closeModal();renderUsers();toast('Created '+name+' as '+nuRole.value)}
function logAudit(action,detail){try{const a=JSON.parse(localStorage.getItem('regitrack_audit')||'[]');a.unshift({t:Date.now(),by:'admin@regitrack.edu.ph',action,detail});localStorage.setItem('regitrack_audit',JSON.stringify(a.slice(0,300)))}catch(e){}}
const PERM_ROWS=['Submit document requests','Track status & QR pass','Process & approve requests','Scan QR & log claims','Manage document services','View analytics & reports','Export reports & CSV','Manage users & roles'],PERM_DEF=[[1,0,0],[1,0,0],[0,1,0],[0,1,0],[0,1,0],[0,0,1],[0,0,1],[0,0,1]];
function PERMS(){try{return JSON.parse(localStorage.getItem('regitrack_perms')||'null')||PERM_DEF}catch(e){return PERM_DEF}}
function setPerm(r,c,v){const p=PERMS().map(x=>x.slice());p[r][c]=v?1:0;localStorage.setItem('regitrack_perms',JSON.stringify(p));logAudit('Permission changed',PERM_ROWS[r]+' · '+ROLES[c]+': '+(v?'granted':'revoked'));toast('Permissions updated')}
function editUser(id){const x=USERS.find(u=>u.id===id);document.getElementById('modalContent').innerHTML='<div class="sec"><h2>Edit User</h2><button class="ib" style="width:36px;height:36px" onclick="closeModal()">✕</button></div><div style="display:grid;gap:12px;margin-top:10px"><div><label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Full Name</label><input id="euName" class="dinp" style="width:100%" value="'+esc(x.name)+'"></div><div><label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">Email</label><input id="euEmail" class="dinp" style="width:100%" value="'+esc(x.email)+'"></div><div style="display:flex;gap:10px;margin-top:8px"><button class="btn ol w" onclick="closeModal()">Cancel</button><button class="btn w" onclick="saveEdit(\''+id+'\')">Save Changes</button></div></div>';document.getElementById('modalBg').classList.add('on')}
function saveEdit(id){const x=USERS.find(u=>u.id===id),n=euName.value.trim(),e=euEmail.value.trim().toLowerCase();if(!n||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){toast('Enter a name and a valid email');return}if(USERS.some(u=>u.id!==id&&u.email===e)){toast('That email already has an account');return}if(x.email===ME&&e!==ME){toast('Your own login email cannot be changed here');return}const old=x.email;x.name=n;x.email=e;saveU();logAudit('User edited',old+(old!==e?' → '+e:''));closeModal();renderUsers();toast('Saved '+n)}
function resetPw(id){const x=USERS.find(u=>u.id===id);x.pass='Reset@'+Math.floor(1000+Math.random()*9000);saveU();logAudit('Password reset',x.email);document.getElementById('modalContent').innerHTML='<div class="sec"><h2>Password Reset</h2><button class="ib" style="width:36px;height:36px" onclick="closeModal()">✕</button></div><p class="mu" style="margin:10px 0 14px">Temporary password for <b>'+esc(x.name)+'</b>. Share it securely; they should change it after logging in.</p><div class="dinp" style="font-family:monospace;font-size:18px;font-weight:800;text-align:center">'+x.pass+'</div><button class="btn w" style="margin-top:14px;width:100%" onclick="closeModal()">Done</button>';document.getElementById('modalBg').classList.add('on')}
window.addEventListener('DOMContentLoaded',()=>{USERS.forEach(x=>{if(x.email===ME&&!x.last)x.last=Date.now()});saveU();renderUsers()});
document.querySelectorAll('.dt').forEach(function(e){e.textContent=new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})})


(function(){
  function titles(){document.querySelectorAll('.side .nv').forEach(function(n){if(!n.title){n.title=n.textContent.replace(/\s+/g,' ').trim().replace(/\d+$/,'').trim()}})}
  titles();document.addEventListener('DOMContentLoaded',titles);
  var on=document.querySelector('.side .nv.on');if(on&&on.scrollIntoView&&innerWidth<=760){try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}
  function t(){var d=new Date(),e=document.getElementById('clk');if(e)e.textContent=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}t();setInterval(t,15000);
})();







/* ================= LOAD DATABASE USERS AND ROLES ================= */

async function loadUserManagementData() {

    const usersContainer = document.getElementById('usersTableBody');
    const rolesContainer = document.getElementById('rolesList');

    try {

        if (usersContainer) {
            usersContainer.innerHTML = `
                <div class="mu" style="padding:18px 20px">
                    Loading users...
                </div>
            `;
        }

        if (rolesContainer) {
            rolesContainer.innerHTML = 'Loading roles...';
        }

        const [usersResponse, rolesResponse] = await Promise.all([
            fetch('/admin/api/users'),
            fetch('/admin/api/roles')
        ]);

        const usersResult = await usersResponse.json();
        const rolesResult = await rolesResponse.json();

        if (!usersResponse.ok || !usersResult.success) {
            throw new Error(
                usersResult.message || 'Unable to load users.'
            );
        }

        if (!rolesResponse.ok || !rolesResult.success) {
            throw new Error(
                rolesResult.message || 'Unable to load roles.'
            );
        }

        // Store database records
        DB_USERS = usersResult.users || [];
        DB_ROLES = rolesResult.roles || [];

        // Render everything using the same data
        renderUserStatistics();
        renderDatabaseRoles();
        renderUsersTable();
        renderRolesList();

    } catch (error) {

        console.error('User management loading error:', error);

        if (usersContainer) {
            usersContainer.innerHTML = `
                <div class="mu" style="padding:18px 20px;color:#dc2626">
                    ${escapeHTML(error.message)}
                </div>
            `;
        }

        if (rolesContainer) {
            rolesContainer.innerHTML = `
                <p style="color:#dc2626">
                    Unable to load system roles.
                </p>
            `;
        }

        toast(error.message, true);
    }
}




// ==========================================
// RENDER AVAILABLE ROLES
// ==========================================


function renderDatabaseRoles() {
    const roleFilter = document.getElementById('roleFilter');
    const rolesList = document.getElementById('rolesList');

    if (roleFilter) {
        roleFilter.innerHTML = `
            <option value="">All roles</option>
            ${DB_ROLES.map(role => `
                <option value="${escapeHTML(role.role_name)}">
                    ${escapeHTML(role.role_name)}
                </option>
            `).join('')}
        `;
    }

    if (rolesList) {
        rolesList.innerHTML = DB_ROLES.map(role => `
            <div class="fi" style="padding:12px 16px;border-bottom:1px solid var(--bd)">
                <div>
                    <b>${escapeHTML(role.role_name)}</b>
                    <span class="mu">${escapeHTML(role.description || '')}</span>
                </div>
            </div>
        `).join('') || '<p class="mu">No roles found.</p>';
    }
}



// ==========================================
// ADD USER MODAL - DATABASE ROLES
// ==========================================

function openAddUser() {
    const modalContent = document.getElementById('modalContent');
    const modalBg = document.getElementById('modalBg');

    modalContent.innerHTML = `
        <div class="sec">
            <h2>Add User</h2>
            <button
                class="ib"
                type="button"
                style="width:36px;height:36px"
                onclick="closeModal()"
            >✕</button>
        </div>

        <p class="mu" style="margin-bottom:16px">
            Create an account and assign its role.
        </p>

        <form id="databaseAddUserForm" style="display:grid;gap:12px">

            <div>
                <label>Full Name</label>
                <input
                    id="nuName"
                    class="dinp"
                    style="width:100%"
                    placeholder="e.g., Ana Dela Cruz"
                    maxlength="150"
                    required
                >
            </div>

            <div>
                <label>Email</label>
                <input
                    id="nuEmail"
                    type="email"
                    class="dinp"
                    style="width:100%"
                    placeholder="name@dnsc.edu.ph"
                    maxlength="150"
                    required
                >
            </div>

            <div>
                <label>Role</label>
                <select
                    id="nuRole"
                    class="dinp"
                    style="width:100%"
                    required
                >
                    <option value="">Select role</option>
                    ${DB_ROLES.map(role => `
                        <option value="${escapeHTML(role.role_name)}">
                            ${escapeHTML(role.role_name)}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div>
                <label>Temporary Password</label>
                <input
                    id="nuPass"
                    type="password"
                    class="dinp"
                    style="width:100%"
                    minlength="8"
                    autocomplete="new-password"
                    required
                >
            </div>

            <div style="display:flex;gap:10px;margin-top:8px">
                <button
                    class="btn ol w"
                    type="button"
                    onclick="closeModal()"
                >Cancel</button>

                <button class="btn w" type="submit">
                    Create User
                </button>
            </div>
        </form>
    `;

    modalBg.classList.add('on');

    document.getElementById('databaseAddUserForm')
        .addEventListener('submit', createDatabaseUser);
}


// ==========================================
// CREATE USER - SAVE TO DATABASE
// ==========================================

async function createDatabaseUser(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('[type="submit"]');

    const payload = {
        full_name: document.getElementById('nuName').value.trim(),
        email: document.getElementById('nuEmail').value.trim(),
        role: document.getElementById('nuRole').value,
        password: document.getElementById('nuPass').value
    };

    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Creating...';

        const response = await fetch('/admin/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to create user.');
        }

        closeModal();

        await loadUserManagementData();

        alert('User created successfully.');

    } catch (error) {
        console.error('Create user error:', error);
        alert(error.message);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Create User';
    }
}





/* ================= USER STATISTICS ================= */

function renderUserStatistics() {

    const total = DB_USERS.length;

    const students = DB_USERS.filter(
        user => user.role_name === 'Student'
    ).length;

    const registrar = DB_USERS.filter(
        user => user.role_name === 'Registrar Staff'
    ).length;

    const admins = DB_USERS.filter(
        user => user.role_name === 'Admin'
    ).length;

    document.getElementById('totalUsers').textContent = total;
    document.getElementById('studentUsers').textContent = students;
    document.getElementById('registrarUsers').textContent = registrar;
    document.getElementById('adminUsers').textContent = admins;
}



/* ================= RENDER SYSTEM USERS ================= */

function renderUsersTable() {

    const container = document.getElementById('usersTableBody');

    if (!container) return;

    const search = (
        document.getElementById('userSearch')?.value || ''
    ).toLowerCase().trim();

    const role = document.getElementById('roleFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';

    // Apply search and filters
    const filteredUsers = DB_USERS.filter(user => {

        const name = (user.full_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();

        const matchesSearch =
            name.includes(search) || email.includes(search);

        const matchesRole =
            !role || user.role_name === role;

        const matchesStatus =
            !status || user.account_status === status;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Column headings
    const header = `
        <div class="urow uhead">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
        </div>
    `;

    if (filteredUsers.length === 0) {

        container.innerHTML = header + `
            <div class="mu" style="padding:18px 20px">
                No users match your search.
            </div>
        `;

    } else {

        container.innerHTML = header + filteredUsers.map(user => {

            const isStudent = user.role_name === 'Student';

            const statusClass =
                user.account_status === 'Active' ? 'p5' :
                user.account_status === 'Inactive' ? 'p2' : 'p3';

            const lastLogin = user.last_login
                ? `Last login ${escapeHTML(user.last_login)}`
                : 'Never logged in';

            // Only Admin and Registrar Staff can have editable roles
            const roleDisplay = isStudent
                ? `
                    <span>${escapeHTML(user.role_name)}</span>
                `
                : `
                    <select
                        class="dinp"
                        onchange="setDatabaseUserRole(${Number(user.user_id)}, this.value)"
                    >
                        ${DB_ROLES
                            .filter(r => r.role_name !== 'Student')
                            .map(r => `
                                <option
                                    value="${escapeHTML(r.role_name)}"
                                    ${r.role_name === user.role_name ? 'selected' : ''}
                                >
                                    ${escapeHTML(r.role_name)}
                                </option>
                            `).join('')}
                    </select>
                `;

            return `
                <div class="urow">

                    <!-- USER -->
                    <div class="who">

                        <span class="av">
                            ${escapeHTML(ini(user.full_name || ''))}
                        </span>

                        <div style="min-width:0">
                            <b>${escapeHTML(user.full_name || '')}</b>

                            <span class="mu">
                                ${escapeHTML(user.email || '')}
                                · ${escapeHTML(lastLogin)}
                            </span>
                        </div>

                    </div>

                    <!-- ROLE -->
                    ${roleDisplay}

                    <!-- STATUS -->
                    <span>
                        <span class="pill ${statusClass}">
                            ${escapeHTML(user.account_status || '')}
                        </span>
                    </span>

                    <!-- ACTIONS -->
                    <div class="uacts">
                      <button class="lk" onclick="openEditUser(${user.user_id})">
                          Edit
                      </button>

                      <button class="lk" onclick="openResetPassword(${user.user_id})">
                          Reset Password
                      </button>

                      <button class="lk ${user.account_status === 'Active' ? 'danger' : 'primary'}"
                              onclick="toggleDatabaseUserStatus(${user.user_id})">
                          ${user.account_status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>

                </div>
            `;

        }).join('');
    }

    // Update displayed count
    const count = document.getElementById('usersCount');

    if (count) {
        count.textContent =
            `Showing ${filteredUsers.length} of ${DB_USERS.length} users`;
    }
}




/* ================= RENDER AVAILABLE ROLES ================= */

function renderRolesList() {

    const container = document.getElementById('rolesList');

    if (!container) return;

    if (DB_ROLES.length === 0) {
        container.innerHTML = `
            <p class="mu">No roles available.</p>
        `;
        return;
    }

    container.innerHTML = DB_ROLES.map(role => `
        <div class="tile" style="margin-bottom:10px">
            <div style="font-weight:800">
                ${escapeHTML(role.role_name)}
            </div>

            <p class="mu" style="font-size:12.5px;margin-top:5px">
                ${escapeHTML(role.description || 'No description available.')}
            </p>
        </div>
    `).join('');
}




/* ================= SEARCH AND FILTER EVENTS ================= */

function initializeUserFilters() {

    document.getElementById('userSearch')?.addEventListener(
        'input',
        renderUsersTable
    );

    document.getElementById('roleFilter')?.addEventListener(
        'change',
        renderUsersTable
    );

    document.getElementById('statusFilter')?.addEventListener(
        'change',
        renderUsersTable
    );

    document.getElementById('clearFilters')?.addEventListener(
        'click',
        () => {

            document.getElementById('userSearch').value = '';
            document.getElementById('roleFilter').value = '';
            document.getElementById('statusFilter').value = '';

            renderUsersTable();
        }
    );
}




async function setDatabaseUserRole(userId, newRole) {

    const user = DB_USERS.find(
        u => Number(u.user_id) === Number(userId)
    );

    if (!user) return;

    // Students must not have editable roles
    if (user.role_name === 'Student') {
        renderUsersTable();
        return;
    }

    const previousRole = user.role_name;

    try {

        const response = await fetch(`/admin/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: user.full_name,
                email: user.email,
                role: newRole,
                account_status: user.account_status
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to update user role.');
        }

        // Update local database data
        user.role_name = newRole;

        renderUsersTable();
        renderUserStatistics();

        toast('User role updated successfully.', false);

    } catch (error) {

        console.error('Role update error:', error);

        user.role_name = previousRole;

        renderUsersTable();

        toast(error.message, true);
    }
}



async function toggleDatabaseUserStatus(userId) {
    const user = DB_USERS.find(u => Number(u.user_id) === Number(userId));

    if (!user) return;

    const newStatus = user.account_status === 'Active'
        ? 'Inactive'
        : 'Active';

    const action = newStatus === 'Inactive' ? 'deactivate' : 'activate';

    if (!confirm(`Are you sure you want to ${action} ${user.full_name}?`)) {
        return;
    }

    try {
        const response = await fetch(`/admin/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: user.full_name,
                email: user.email,
                role: user.role_name,
                account_status: newStatus
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || `Unable to ${action} user.`);
        }

        await loadUserManagementData();

        toast(
            `${user.full_name} has been ${action}d successfully.`,
            false
        );

    } catch (error) {
        console.error('User status update error:', error);
        toast(error.message, true);
    }
}


function openEditUser(id) {
    const user = DB_USERS.find(u => Number(u.user_id) === Number(id));

    if (!user) {
        toast('User not found.', true);
        return;
    }

    document.getElementById('modalContent').innerHTML = `
        <div class="sec" style="display:flex;justify-content:space-between;align-items:center">
            <h2>Edit User</h2>
            <button class="ib" style="width:36px;height:36px" onclick="closeModal()">✕</button>
        </div>

        <div style="display:grid;gap:12px;margin-top:10px">

            <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">
                    Full Name
                </label>
                <input
                    id="euName"
                    class="dinp"
                    style="width:100%"
                    value="${escapeHTML(user.full_name)}"
                >
            </div>

            <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">
                    Email
                </label>
                <input
                    id="euEmail"
                    type="email"
                    class="dinp"
                    style="width:100%"
                    value="${escapeHTML(user.email)}"
                >
            </div>

            <div style="display:flex;gap:10px;margin-top:8px">
                <button class="btn ol w" onclick="closeModal()">Cancel</button>
                <button class="btn w" onclick="saveDatabaseUserEdit(${user.user_id})">
                    Save Changes
                </button>
            </div>
        </div>
    `;

    document.getElementById('modalBg').classList.add('on');
}


async function saveDatabaseUserEdit(id) {
    const user = DB_USERS.find(u => Number(u.user_id) === Number(id));

    if (!user) return;

    const name = document.getElementById('euName').value.trim();
    const email = document.getElementById('euEmail').value.trim().toLowerCase();

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast('Enter a name and a valid email address.', true);
        return;
    }

    const emailExists = DB_USERS.some(u =>
        Number(u.user_id) !== Number(id) &&
        u.email.toLowerCase() === email
    );

    if (emailExists) {
        toast('That email already has an account.', true);
        return;
    }

    try {
        const response = await fetch(`/admin/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: name,
                email: email,
                role: user.role_name,
                account_status: user.account_status
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to update user.');
        }

        closeModal();
        await loadUserManagementData();

        toast(`Saved changes for ${name}.`, false);

    } catch (error) {
        console.error('Edit user error:', error);
        toast(error.message, true);
    }
}

function openResetPassword(id) {
    const user = DB_USERS.find(u => Number(u.user_id) === Number(id));

    if (!user) {
        toast('User not found.', true);
        return;
    }

    document.getElementById('modalContent').innerHTML = `
        <div class="sec" style="display:flex;justify-content:space-between;align-items:center">
            <h2>Reset Password</h2>
            <button class="ib" style="width:36px;height:36px" onclick="closeModal()">✕</button>
        </div>

        <p class="mu" style="margin:10px 0 14px">
            Set a new password for <b>${escapeHTML(user.full_name)}</b>.
        </p>

        <div style="display:grid;gap:12px">

            <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">
                    New Password
                </label>
                <input
                    id="rpPassword"
                    type="password"
                    class="dinp"
                    style="width:100%"
                    placeholder="Enter new password"
                >
            </div>

            <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:5px">
                    Confirm Password
                </label>
                <input
                    id="rpConfirm"
                    type="password"
                    class="dinp"
                    style="width:100%"
                    placeholder="Confirm new password"
                >
            </div>

            <div style="display:flex;gap:10px;margin-top:8px">
                <button class="btn ol w" onclick="closeModal()">Cancel</button>
                <button class="btn w" onclick="saveDatabasePasswordReset(${user.user_id})">
                    Reset Password
                </button>
            </div>
        </div>
    `;

    document.getElementById('modalBg').classList.add('on');
}


async function saveDatabasePasswordReset(id) {
    const password = document.getElementById('rpPassword').value;
    const confirmPassword = document.getElementById('rpConfirm').value;

    if (!password || !confirmPassword) {
        toast('Please complete both password fields.', true);
        return;
    }

    if (password.length < 8) {
        toast('Password must be at least 8 characters.', true);
        return;
    }

    if (password !== confirmPassword) {
        toast('Passwords do not match.', true);
        return;
    }

    try {
        const response = await fetch(`/admin/api/users/${id}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                new_password: password
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to reset password.');
        }

        closeModal();

        toast('Password has been reset successfully.', false);

    } catch (error) {
        console.error('Password reset error:', error);
        toast(error.message, true);
    }
}