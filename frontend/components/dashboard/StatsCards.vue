<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    <div
      v-for="card in cards"
      :key="card.label"
      :class="[
        'rounded-2xl p-6 transition-shadow',
        card.hero
          ? 'bg-stone-900 text-white shadow-md'
          : 'bg-white border border-stone-200/60 shadow-sm'
      ]"
    >
      <p :class="[
        'text-xs font-medium uppercase tracking-wider',
        card.hero ? 'text-stone-400' : 'text-stone-500'
      ]">{{ card.label }}</p>
      <p :class="[
        'font-bold mt-2 tracking-tight',
        card.hero ? 'text-white' : 'text-stone-900',
        card.isName ? 'text-xl' : 'text-3xl'
      ]">
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
    hero: false,
  },
  {
    label: 'Active Transactions',
    value: props.stats?.activeTransactions ?? 0,
    hero: false,
  },
  {
    label: 'Agency Revenue',
    value: props.stats ? formatCents(props.stats.agencyRevenueCents) : '--',
    hero: true,
  },
  {
    label: 'Top Agent',
    value: props.stats?.topAgents?.[0]
      ? `${props.stats.topAgents[0].firstName} ${props.stats.topAgents[0].lastName}`
      : '--',
    hero: false,
    isName: true,
  },
]);
</script>
