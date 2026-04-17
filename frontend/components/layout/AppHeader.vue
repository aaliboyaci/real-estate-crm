<template>
  <header class="bg-white border-b border-slate-200 px-6 py-4">
    <h2 class="text-xl font-semibold text-slate-800">{{ pageTitle }}</h2>
  </header>
</template>

<script setup lang="ts">
const route = useRoute();

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transaction Pipeline',
  '/agents': 'Agents',
  '/reports': 'Financial Reports',
};

const pageTitle = computed(() => {
  if (route.path.startsWith('/transactions/') && route.params.id) return 'Transaction Detail';
  if (route.path.startsWith('/agents/') && route.params.id) return 'Agent Detail';
  return pageTitles[route.path] || 'Real Estate CRM';
});
</script>
