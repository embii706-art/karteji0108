
let slowTimer=null;
export const net = {
  init(){
    const update = ()=>{
      if(!navigator.onLine){
        showNetbar('Anda sedang offline. Beberapa fitur dibatasi.', 'offline');
      } else {
        hideNetbar();
      }
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();

    // connection hints
    if(navigator.connection){
      navigator.connection.addEventListener('change', ()=>{
        // will be handled by slow monitor too
      });
    }
  },
  markSlow(on){
    if(!navigator.onLine) return;
    if(on) showNetbar('Koneksi lambat, data disinkronkan…', 'slow');
    else hideNetbar();
  }
};

export function hapticTap(){
  try{
    if(navigator.vibrate) navigator.vibrate(10);
  }catch{}
}

function showNetbar(text, kind){
  const bar=document.getElementById('netbar');
  const inner=document.getElementById('netbarInner');
  const t=document.getElementById('netbarText');
  if(!bar||!inner||!t) return;
  t.textContent=text;
  bar.classList.remove('hidden');
  if(kind==='offline'){
    inner.className = "mx-auto max-w-md px-3 py-2 text-sm rounded-b-2xl shadow bg-red-500 text-white flex items-center gap-2";
  }else{
    inner.className = "mx-auto max-w-md px-3 py-2 text-sm rounded-b-2xl shadow bg-amber-500 text-black flex items-center gap-2";
  }
}
function hideNetbar(){
  const bar=document.getElementById('netbar');
  if(!bar) return;
  bar.classList.add('hidden');
}
