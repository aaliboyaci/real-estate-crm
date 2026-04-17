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
        <span class="text-lg">{{ item.icon }}</span>
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
  { path: '/', label: 'Dashboard', icon: '□' },
  { path: '/transactions', label: 'Transactions', icon: '⇄' },
  { path: '/agents', label: 'Agents', icon: '○' },
  { path: '/reports', label: 'Reports', icon: '▤' },
];
</script>
