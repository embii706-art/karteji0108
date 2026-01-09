export function renderHome() {
  return `
    <section class="p-4 space-y-4 pb-20">
      <!-- Welcome Card with 3D Effect -->
      <div class="glass-card rounded-2xl p-6 shadow-xl card-3d">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-float">
            <span class="material-symbols-rounded text-white text-3xl">waving_hand</span>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold gradient-text">Selamat Datang</h2>
            <p class="text-sm text-muted mt-1">KARTEJI v2.5 - Premium Edition</p>
          </div>
        </div>
      </div>

      <!-- Feature Cards Grid -->
      <div class="grid grid-cols-2 gap-3">
        <a href="#/feed" class="glass-card rounded-xl p-4 card-3d-interactive slide-in-right" style="animation-delay: 0.1s">
          <div class="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-3">
            <span class="material-symbols-rounded text-white text-2xl">newspaper</span>
          </div>
          <h3 class="font-semibold text-sm">Feed</h3>
          <p class="text-xs text-muted mt-1">Update terbaru</p>
        </a>

        <a href="#/activities" class="glass-card rounded-xl p-4 card-3d-interactive slide-in-right" style="animation-delay: 0.15s">
          <div class="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center mb-3">
            <span class="material-symbols-rounded text-white text-2xl">event</span>
          </div>
          <h3 class="font-semibold text-sm">Kegiatan</h3>
          <p class="text-xs text-muted mt-1">Kelola acara</p>
        </a>

        <a href="#/finance" class="glass-card rounded-xl p-4 card-3d-interactive slide-in-right" style="animation-delay: 0.2s">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style="background: linear-gradient(135deg, rgb(var(--success)) 0%, rgb(var(--accent)) 100%);">
            <span class="material-symbols-rounded text-white text-2xl">account_balance_wallet</span>
          </div>
          <h3 class="font-semibold text-sm">Kas</h3>
          <p class="text-xs text-muted mt-1">Kelola keuangan</p>
        </a>

        <a href="#/calendar" class="glass-card rounded-xl p-4 card-3d-interactive slide-in-right" style="animation-delay: 0.25s">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style="background: linear-gradient(135deg, rgb(var(--warning)) 0%, rgb(var(--secondary)) 100%);">
            <span class="material-symbols-rounded text-white text-2xl">calendar_month</span>
          </div>
          <h3 class="font-semibold text-sm">Kalender</h3>
          <p class="text-xs text-muted mt-1">Jadwal & event</p>
        </a>
      </div>

      <!-- Quick Actions -->
      <div class="glass-card rounded-2xl p-4 card-3d">
        <h3 class="font-semibold mb-3 flex items-center gap-2">
          <span class="material-symbols-rounded text-[rgb(var(--primary))]">bolt</span>
          Aksi Cepat
        </h3>
        <div class="space-y-2">
          <button onclick="window.openSmartSearch()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(var(--primary),0.1)] transition text-left">
            <div class="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-rounded text-white text-xl">search</span>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-sm">Smart Search</div>
              <div class="text-xs text-muted">Cari dengan cepat (⌘K)</div>
            </div>
          </button>
          
          <button onclick="window.openShareDialog()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(var(--primary),0.1)] transition text-left">
            <div class="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-rounded text-white text-xl">share</span>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-sm">Bagikan</div>
              <div class="text-xs text-muted">Bagikan ke sosial media</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Stats Card -->
      <div class="glass-card rounded-2xl p-5 card-3d">
        <h3 class="font-semibold mb-4">Ringkasan</h3>
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center">
            <div class="text-2xl font-bold gradient-text">0</div>
            <div class="text-xs text-muted mt-1">Kegiatan</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold gradient-text">0</div>
            <div class="text-xs text-muted mt-1">Anggota</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold gradient-text">0</div>
            <div class="text-xs text-muted mt-1">Dokumen</div>
          </div>
        </div>
      </div>

      <!-- New Features Badge -->
      <div class="glass-card rounded-2xl p-4 border-2 border-[rgba(var(--primary),0.3)]">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-rounded text-white text-xl">stars</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-sm">Fitur Baru v2.5! 🎉</h3>
            <ul class="text-xs text-muted mt-2 space-y-1">
              <li>✨ Glassmorphism UI</li>
              <li>🎨 3D Interactive Cards</li>
              <li>🔍 Smart Search (⌘K)</li>
              <li>📱 Enhanced PWA</li>
              <li>🔗 Social Sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `;
}
