/**
 * Skeleton Loader Component
 * Provides shimmer loading placeholders for better UX during data fetching
 * @version 3.0.0
 */

/**
 * Card skeleton for list items
 * @returns {string} HTML for skeleton card
 */
export function skeletonCard() {
  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 animate-pulse">
      <div class="skeleton h-5 w-3/4 rounded-lg mb-3"></div>
      <div class="skeleton h-4 w-full rounded mb-2"></div>
      <div class="skeleton h-4 w-5/6 rounded mb-3"></div>
      <div class="flex gap-2 mt-3">
        <div class="skeleton h-9 w-24 rounded-xl"></div>
        <div class="skeleton h-9 w-24 rounded-xl"></div>
      </div>
    </div>
  `;
}

/**
 * List item skeleton
 * @returns {string} HTML for skeleton list item
 */
export function skeletonListItem() {
  return `
    <div class="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] animate-pulse">
      <div class="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
      <div class="flex-1">
        <div class="skeleton h-4 w-2/3 rounded mb-2"></div>
        <div class="skeleton h-3 w-1/2 rounded"></div>
      </div>
      <div class="skeleton h-8 w-8 rounded-lg"></div>
    </div>
  `;
}

/**
 * Stats card skeleton
 * @returns {string} HTML for skeleton stats card
 */
export function skeletonStatsCard() {
  return `
    <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 animate-pulse">
      <div class="skeleton h-8 w-8 rounded-lg mb-3"></div>
      <div class="skeleton h-7 w-20 rounded mb-2"></div>
      <div class="skeleton h-3 w-24 rounded"></div>
    </div>
  `;
}

/**
 * Dashboard skeleton with stats
 * @returns {string} HTML for dashboard skeleton
 */
export function skeletonDashboard() {
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 animate-pulse">
        <div class="skeleton h-6 w-32 rounded mb-3"></div>
        <div class="skeleton h-4 w-48 rounded"></div>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        ${skeletonStatsCard()}
        ${skeletonStatsCard()}
        ${skeletonStatsCard()}
        ${skeletonStatsCard()}
      </div>
      
      ${skeletonCard()}
    </section>
  `;
}

/**
 * List skeleton
 * @param {number} count - Number of items
 * @returns {string} HTML for skeleton list
 */
export function skeletonList(count = 5) {
  return `
    <div class="space-y-3">
      ${Array(count).fill(0).map(() => skeletonListItem()).join('')}
    </div>
  `;
}

/**
 * Grid skeleton
 * @param {number} count - Number of cards
 * @returns {string} HTML for skeleton grid
 */
export function skeletonGrid(count = 4) {
  return `
    <div class="grid grid-cols-2 gap-3">
      ${Array(count).fill(0).map(() => skeletonStatsCard()).join('')}
    </div>
  `;
}
