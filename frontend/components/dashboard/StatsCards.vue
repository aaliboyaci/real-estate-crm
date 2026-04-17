<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.label"
      class="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
    >
      <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ card.label }}</p>
      <p class="text-2xl font-bold text-slate-800 mt-1">
        <template v-if="loading">--</template>
        <template v-else>{{ card.value }}</template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats } from '~/stores/dashboard';

const props = defineProps<{
  stats: DashboardStats | null;
  loading: boolean;
}>();

const { formatCents } = useFormatCurrency();

const cards = computed(() => [
  {
    label: 'Total Transactions',
    value: props.stats?.totalTransactions ?? 0,
  },
  {
    label: 'Active Transactions',
    value: props.stats?.activeTransactions ?? 0,
  },
  {
    label: 'Agency Revenue',
    value: props.stats ? formatCents(props.stats.agencyRevenueCents) : '--',
  },
  {
    label: 'Top Agent',
    value: props.stats?.topAgents?.[0]
      ? `${props.stats.topAgents[0].firstName} ${props.stats.topAgents[0].lastName}`
      : '--',
  },
]);
</script>
