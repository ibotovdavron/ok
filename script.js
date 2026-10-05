// Raqamlar animatsiyasi
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target,n=+el.dataset.n;let c=0;
  const t=setInterval(()=>{c+=Math.ceil(n/40);if(c>=n){c=n;clearInterval(t)}el.textContent=c+'+'},30);
  io.unobserve(el);
}));
document.querySelectorAll('[data-n]').forEach(el=>io.observe(el));
// Menyu havoladan keyin yopiladi
document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>document.body.classList.remove('open'));
// Ariza -> Telegram (USERNAME ni o'zgartiring)
function send(e){
  e.preventDefault();
  const m=`Yangi ariza%0AIsm: ${nm.value}%0ATel: ${ph.value}%0AKurs: ${cr.value}`;
  window.open('https://t.me/USERNAME?text='+m,'_blank');
  return false;
}
