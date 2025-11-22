/* main.js - public site interactions, GSAP for landing animation */
document.addEventListener('DOMContentLoaded', function(){
  // GSAP animations (CDN loaded in HTML)
  if(window.gsap){
    const tl = gsap.timeline();
    tl.from(".logo", {duration:0.8, y:-30, opacity:0, ease:"power2.out"})
      .from(".nav-links a", {duration:0.6, opacity:0, stagger:0.08}, "-=0.4")
      .from(".hero-left h1", {duration:0.9, y:30, opacity:0, ease:"power3.out"}, "-=0.3")
      .from(".hero-left .meta", {duration:0.6, opacity:0}, "-=0.6")
      .from(".hero-left .lead", {duration:0.6, opacity:0}, "-=0.55")
      .from(".hero-card", {duration:0.8, scale:0.98, opacity:0}, "-=0.6");
  }

  // Typed words
  (function(){
    const el = document.querySelector('.typed');
    if(!el) return;
    const words = ["शिक्षा","अनुशासन","रचनात्मकता","भविष्य"];
    let i=0, j=0, forward=true;
    function tick(){
      const word = words[i];
      if(forward){ el.textContent = word.slice(0,j+1); j++; if(j>=word.length){ forward=false; setTimeout(tick,900); return }}
      else { el.textContent = word.slice(0,j-1); j--; if(j<=0){ forward=true; i=(i+1)%words.length; } }
      setTimeout(tick,120);
    }
    tick();
  })();

  // marquee pause
  const marquee = document.querySelector('.marquee');
  if(marquee){ marquee.addEventListener('mouseenter', ()=> marquee.style.animationPlayState='paused'); marquee.addEventListener('mouseleave', ()=> marquee.style.animationPlayState='running'); }

  // lightbox
  const lightbox = document.getElementById('lightbox'), lbimg = document.getElementById('lightboxImg');
  document.querySelectorAll('.gallery-grid a').forEach(a=>{
    a.addEventListener('click', function(e){
      e.preventDefault(); lbimg.src = this.href; lightbox.classList.add('open');
    });
  });
  if(lightbox) lightbox.addEventListener('click', ()=> lightbox.classList.remove('open'));

  // open admission modal
  const m = document.getElementById('modalAdmission');
  document.getElementById('openAdmissionBtn') && document.getElementById('openAdmissionBtn').addEventListener('click', ()=> m.classList.add('open'));
  document.getElementById('closeModal') && document.getElementById('closeModal').addEventListener('click', ()=> m.classList.remove('open'));
  m && m.addEventListener('click', (e)=>{ if(e.target===m) m.classList.remove('open'); });

  // admission form save -> localStorage (demo)
  const f = document.getElementById('admissionForm');
  if(f) f.addEventListener('submit', function(e){ e.preventDefault();
    const fd = new FormData(this);
    const list = JSON.parse(localStorage.getItem('gp_admissions')||'[]');
    list.push({id:'a_'+Date.now(), name:fd.get('studentName'), phone:fd.get('phone'), cls:fd.get('class'), date:new Date().toISOString()});
    localStorage.setItem('gp_admissions', JSON.stringify(list));
    alert('Application submitted.'); this.reset(); document.getElementById('modalAdmission').classList.remove('open');
  });

});