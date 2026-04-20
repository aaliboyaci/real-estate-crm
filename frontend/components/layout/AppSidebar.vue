<template>
  <aside class="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-40">
    <div class="p-6 border-b border-slate-700">
      <h1 class="text-lg font-bold tracking-tight">Real Estate CRM</h1>
      <p class="text-xs text-slate-400 mt-1">Transaction Management</p>
    </div>

    <nav class="flex-1 py-4">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors hover:bg-slate-800"
        active-class="bg-slate-800 text-emerald-400 border-r-2 border-emerald-400"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" v-html="item.icon" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="p-4 border-t border-slate-700">
      <p class="text-xs text-slate-500">v1.0.0</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
const navItems = [
  { path: '/', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />' },
  { path: '/transactions', label: 'Transactions', icon: '<path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />' },
  { path: '/agents', label: 'Agents', icon: '<path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />' },
  { path: '/reports', label: 'Reports', icon: '<path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />' },
];
</script>
