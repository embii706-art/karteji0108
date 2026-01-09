import { skeletonList } from '../../components/Skeleton.js';

export async function adminRoles(){
  setTimeout(() => loadRoles(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">admin_panel_settings</span>
          Role & Permissions
        </h1>
      </div>
      
      <div class="rounded-2xl border border-[var(--border)] bg-[rgb(var(--primary))]/10 p-4">
        <div class="flex items-start gap-3">
          <span class="material-symbols-rounded text-[rgb(var(--primary))] text-[24px]">info</span>
          <div class="text-sm">
            <strong>Catatan Penting:</strong>
            <ul class="list-disc ml-4 mt-1 opacity-70">
              <li>Ketua/Wakil dapat mengubah role anggota lain</li>
              <li>Tidak dapat mengubah role diri sendiri</li>
              <li>Tidak dapat mengubah role super admin</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div id="rolesContent">
        ${skeletonList(3)}
      </div>
    </section>
  `;
}

function loadRoles() {
  const container = document.getElementById('rolesContent');
  if (!container) return;
  
  const roles = [
    { name: 'Super Admin', description: 'Akses penuh ke semua fitur', count: 1, color: 'red' },
    { name: 'Ketua', description: 'Dapat mengelola role dan approval', count: 0, color: 'blue' },
    { name: 'Wakil Ketua', description: 'Dapat mengelola role anggota', count: 0, color: 'blue' },
    { name: 'Sekretaris', description: 'Mengelola surat dan notulen', count: 0, color: 'green' },
    { name: 'Bendahara', description: 'Mengelola keuangan', count: 0, color: 'green' },
    { name: 'Anggota', description: 'Akses dasar aplikasi', count: 0, color: 'gray' }
  ];
  
  container.innerHTML = roles.map(role => `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-${role.color}-100 dark:bg-${role.color}-900/30 flex items-center justify-center">
            <span class="material-symbols-rounded text-${role.color}-600 text-[20px]">badge</span>
          </div>
          <div>
            <div class="font-bold">${role.name}</div>
            <div class="text-xs opacity-70">${role.description}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xl font-bold">${role.count}</div>
          <div class="text-xs opacity-70">anggota</div>
        </div>
      </div>
    </div>
  `).join('');
}