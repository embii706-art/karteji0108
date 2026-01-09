import { skeletonList } from '../components/Skeleton.js';
import { emptyFeed } from '../components/EmptyState.js';

export async function feed(){
  // Simulate loading
  setTimeout(() => loadFeed(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">newspaper</span>
          Feed & Pengumuman
        </h1>
        <button class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          + Posting
        </button>
      </div>
      
      <div id="feedContent">
        ${skeletonList(3)}
      </div>
    </section>
  `;
}

function loadFeed() {
  const container = document.getElementById('feedContent');
  if (!container) return;
  
  // Simulate empty state (replace with actual Firestore query)
  const posts = [];
  
  if (posts.length === 0) {
    container.innerHTML = emptyFeed();
  } else {
    // Render posts here
    container.innerHTML = posts.map(post => renderPost(post)).join('');
  }
}

function renderPost(post) {
  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white font-bold">
          ${post.author.charAt(0)}
        </div>
        <div class="flex-1">
          <div class="font-semibold">${post.author}</div>
          <div class="text-xs opacity-70">${post.timestamp}</div>
          <div class="mt-2 text-sm">${post.content}</div>
        </div>
      </div>
    </div>
  `;
}