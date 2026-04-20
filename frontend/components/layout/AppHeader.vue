<template>
  <header class="px-8 py-6">
    <h2 class="text-2xl font-bold text-stone-900 tracking-tight">{{ pageTitle }}</h2>
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
