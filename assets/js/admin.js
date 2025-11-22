/* admin.js - full admin panel logic (localStorage based) */
(function(){
  'use strict';
  const uid = (p='id')=> p + '_' + Date.now() + '_' + Math.floor(Math.random()*9999);

  // storage helpers
  const read = (k)=> JSON.parse(localStorage.getItem(k) || 'null');
  const readArr = (k)=> JSON.parse(localStorage.getItem(k) || '[]');
  const write = (k,v)=> localStorage.setItem(k, JSON.stringify(v));

  // auth
  window.registerAdmin = function(name,email,password){
    if(!name||!email||!password) return {ok:false,msg:'Fill all fields'};
    let users = readArr('gp_admins');
    if(users.find(u=>u.email===email)) return {ok:false,msg:'Email exists'};
    users.push({id:uid('adm'),name,email,password});
    write('gp_admins', users);
    return {ok:true};
  };

  window.loginAdmin = function(email,password){
    const users = readArr('gp_admins');
    const u = users.find(x=>x.email===email && x.password===password);
    if(!u) return {ok:false};
    write('gp_logged',{id:u.id,name:u.name,email:u.email});
    return {ok:true,user:u};
  };

  window.logoutAdmin = function(){ localStorage.removeItem('gp_logged'); location.href='login.html'; };

  // protect admin pages
  const adminPages = ['/admin/dashboard.html','/admin/students.html','/admin/teachers.html','/admin/fees.html','/admin/attendance.html','/admin/notices-admin.html','/admin/uploads.html'];
  if(adminPages.some(p=> location.pathname.endsWith(p.split('/').pop()))){
    const logged = read('gp_logged');
    if(!logged) { location.href='login.html'; }
    else { const el = document.getElementById('adminName'); if(el) el.textContent = logged.name; }
  }

  // dashboard stats
  window.renderDashboardStats = function(){
    const students = readArr('gp_students'), teachers = readArr('gp_teachers'), notices = readArr('gp_notices'), gallery = readArr('gp_gallery');
    const s = document.getElementById('statStudents'), t = document.getElementById('statTeachers'), n = document.getElementById('statNotices'), g = document.getElementById('statGallery');
    if(s) s.textContent = students.length; if(t) t.textContent = teachers.length; if(n) n.textContent = notices.length; if(g) g.textContent = gallery.length;
  };

  // students
  window.renderStudents = function(){
    const tbody = document.querySelector('#studentsTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const arr = readArr('gp_students');
    arr.forEach(s=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><img src="${s.photo||'../assets/img/avatar.png'}" style="width:48px;height:48px;border-radius:8px"></td>
        <td>${s.name}</td><td>${s.class||''}</td><td>${s.phone||''}</td>
        <td><button class="btn-sm" onclick="editStudent('${s.id}')">Edit</button> <button class="btn-sm" onclick="deleteStudent('${s.id}')">Delete</button></td>`;
      tbody.appendChild(tr);
    });
  };

  window.addStudent = function(obj){
    const arr = readArr('gp_students'); arr.push(Object.assign({id:uid('stu')},obj)); write('gp_students',arr); renderStudents(); renderDashboardStats();
  };

  window.deleteStudent = function(id){
    if(!confirm('Delete student?')) return;
    let arr = readArr('gp_students'); arr = arr.filter(x=>x.id!==id); write('gp_students',arr); renderStudents(); renderDashboardStats();
  };

  // teachers
  window.renderTeachers = function(){
    const tbody = document.querySelector('#teachersTable tbody'); if(!tbody) return; tbody.innerHTML='';
    const arr = readArr('gp_teachers');
    arr.forEach(t=>{
      const tr = document.createElement('tr'); tr.innerHTML = `<td>${t.name}</td><td>${t.subject}</td><td>${t.phone||''}</td><td><button class="btn-sm" onclick="deleteTeacher('${t.id}')">Delete</button></td>`; tbody.appendChild(tr);
    });
  };
  window.addTeacher = function(obj){ const arr = readArr('gp_teachers'); arr.push(Object.assign({id:uid('tch')},obj)); write('gp_teachers',arr); renderTeachers(); renderDashboardStats(); };
  window.deleteTeacher = function(id){ if(!confirm('Delete teacher?')) return; let arr = readArr('gp_teachers'); arr = arr.filter(x=>x.id!==id); write('gp_teachers',arr); renderTeachers(); renderDashboardStats(); };

  // fees
  window.renderFees = function(){
    const tbody = document.querySelector('#feesTable tbody'); if(!tbody) return; tbody.innerHTML='';
    const arr = readArr('gp_fees'); const studs = readArr('gp_students');
    arr.forEach(f=>{
      const st = studs.find(s=>s.id===f.studentId) || {name:'Unknown'};
      const tr = document.createElement('tr'); tr.innerHTML = `<td>${st.name}</td><td>₹${Number(f.amount).toFixed(2)}</td><td>${f.date}</td><td>${f.note||''}</td><td><button class="btn-sm" onclick="deleteFee('${f.id}')">Delete</button></td>`; tbody.appendChild(tr);
    });
  };
  window.addFee = function(obj){ const arr = readArr('gp_fees'); arr.push(Object.assign({id:uid('fee')},obj)); write('gp_fees',arr); renderFees(); };
  window.deleteFee = function(id){ if(!confirm('Delete fee?')) return; let arr = readArr('gp_fees'); arr = arr.filter(x=>x.id!==id); write('gp_fees',arr); renderFees(); };

  // attendance
  window.renderAttendanceForDate = function(date){
    const container = document.getElementById('attendanceArea'); if(!container) return;
    const students = readArr('gp_students'); const att = JSON.parse(localStorage.getItem('gp_attendance')||'{}'); const present = att[date]||[];
    let html = '<div style="display:flex;justify-content:space-between;align-items:center"><strong>Attendance for '+date+'</strong><button onclick="saveAttendance(\''+date+'\')">Save</button></div><div style="margin-top:12px">';
    students.forEach(s=> { const checked = present.includes(s.id) ? 'checked' : ''; html += `<label style="display:flex;align-items:center;gap:8px;padding:8px"><input type="checkbox" data-id="${s.id}" ${checked}> <div><strong>${s.name}</strong><div style="font-size:12px;color:#9aa">${s.class||''}</div></div></label>`; });
    html += '</div>';
    container.innerHTML = html;
  };
  window.saveAttendance = function(date){
    const checks = Array.from(document.querySelectorAll('#attendanceArea input[type="checkbox"]')).filter(i=>i.checked).map(i=>i.dataset.id);
    const att = JSON.parse(localStorage.getItem('gp_attendance')||'{}'); att[date]=checks; localStorage.setItem('gp_attendance', JSON.stringify(att)); alert('Saved');
  };

  // notices admin
  window.renderNoticesAdmin = function(){
    const tbody = document.querySelector('#noticesTable tbody'); if(!tbody) return; tbody.innerHTML='';
    const arr = readArr('gp_notices'); arr.forEach(n=>{ const tr = document.createElement('tr'); tr.innerHTML = `<td>${n.title}</td><td>${n.msg}</td><td>${n.date}</td><td><button class="btn-sm" onclick="deleteNoticeAdmin('${n.id}')">Delete</button></td>`; tbody.appendChild(tr); });
  };
  window.addNoticeAdmin = function(obj){ const arr = readArr('gp_notices'); arr.unshift(Object.assign({id:uid('not'),date:new Date().toLocaleDateString()},obj)); write('gp_notices',arr); renderNoticesAdmin(); renderPublicMarquee(); };
  window.deleteNoticeAdmin = function(id){ if(!confirm('Delete notice?')) return; let arr = readArr('gp_notices'); arr = arr.filter(x=>x.id!==id); write('gp_notices',arr); renderNoticesAdmin(); renderPublicMarquee(); };

  // gallery
  window.uploadImage = function(file,cb){
    const fr = new FileReader(); fr.onload = function(){ const arr = readArr('gp_gallery'); arr.unshift({id:uid('img'),data:fr.result,name:file.name}); write('gp_gallery',arr); if(cb) cb(); }; fr.readAsDataURL(file);
  };
  window.renderGalleryAdmin = function(){
    const grid = document.getElementById('galleryGridAdmin'); if(!grid) return; grid.innerHTML=''; const arr = readArr('gp_gallery'); arr.forEach(i=>{ const div=document.createElement('div'); div.style.margin='8px'; div.innerHTML = `<img src="${i.data}" style="width:140px;height:90px;object-fit:cover;border-radius:8px"><div style="margin-top:6px"><button class="btn-sm" onclick="deleteImageAdmin('${i.id}')">Delete</button></div>`; grid.appendChild(div); });
  };
  window.deleteImageAdmin = function(id){ if(!confirm('Delete image?')) return; let arr = readArr('gp_gallery'); arr = arr.filter(x=>x.id!==id); write('gp_gallery',arr); renderGalleryAdmin(); renderPublicGallery(); };

  // public renderers
  window.renderPublicMarquee = function(){
    const el = document.getElementById('marqueeBox'); if(!el) return;
    const arr = readArr('gp_notices'); if(arr.length===0){ el.innerHTML = '<span style="padding-right:40px">No notices</span>'; return; }
    el.innerHTML = arr.map(n=>`<span style="padding-right:40px">${n.title} — ${n.date}</span>`).join('') + arr.map(n=>`<span style="padding-right:40px">${n.title} — ${n.date}</span>`).join('');
  };
  window.renderPublicGallery = function(){
    const grid = document.getElementById('galleryGrid'); if(!grid) return;
    const arr = readArr('gp_gallery'); grid.innerHTML = arr.map(i=>`<a href="${i.data}" target="_blank"><img src="${i.data}" alt="${i.name}"></a>`).join('');
  };

  // initialization on admin pages
  window.adminInit = function(){
    renderDashboardStats(); renderStudents(); renderTeachers(); renderFees(); renderNoticesAdmin(); renderGalleryAdmin();
  };

  // auto init public renderers
  document.addEventListener('DOMContentLoaded', function(){ renderPublicMarquee(); renderPublicGallery(); });

})();