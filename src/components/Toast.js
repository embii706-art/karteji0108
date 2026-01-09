
export function toast(message, type='info'){
  const host = document.getElementById('toastHost');
  const el = document.createElement('div');
  el.className = 'mx-auto max-w-md pointer-events-auto';
  el.innerHTML = `
    <div class="mt-2 px-4 py-3 rounded-2xl shadow-lg border border-[var(--border)] bg-[var(--card)]">
      <div class="text-sm">${escapeHtml(message)}</div>
    </div>
  `;
  host.appendChild(el);
  setTimeout(()=>{ el.classList.add('opacity-0'); el.style.transition='opacity .25s'; }, 2400);
  setTimeout(()=> el.remove(), 2700);
}
function escapeHtml(s){return (s||'').replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]))}
