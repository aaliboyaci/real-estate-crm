<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <DashboardStatsCards :stats="store.stats" :loading="store.loading" />

    <!-- Pipeline Mini View -->
    <UiBaseCard title="Transaction Pipeline">
      <div class="grid grid-cols-4 gap-4">
        <div
          v-for="stage in stages"
          :key="stage.key"
          class="text-center"
        >
          <div class="text-3xl font-bold tracking-tight text-stone-900">
            {{ store.stats?.stageCounts[stage.key] ?? 0 }}
          </div>
          <div class="text-xs text-stone-400 mt-1 font-medium">{{ stage.label }}</div>
        </div>
      </div>
    </UiBaseCard>

    <!-- Top Agents -->
    <UiBaseCard title="Top Earning Agents">
      <div v-if="!store.stats?.topAgents?.length" class="text-sm text-stone-400 text-center py-6">
        No commission data yet
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-stone-400 border-b border-stone-100">
            <th class="pb-3 font-medium text-xs uppercase tracking-wider">Agent</th>
            <th class="pb-3 font-medium text-right text-xs uppercase tracking-wider">Earnings</th>
            <th class="pb-3 font-medium text-right text-xs uppercase tracking-wider">Deals</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="agent in store.stats.topAgents"
            :key="agent.agentId"
            class="border-b border-stone-50"
          >
            <td class="py-3 text-stone-700">{{ agent.firstName }} {{ agent.lastName }}</td>
            <td class="py-3 text-right font-semibold text-stone-900">
              {{ formatCents(agent.totalEarningsCents) }}
            </td>
            <td class="py-3 text-right text-stone-400">{{ agent.transactionCount }}</td>
          </tr>
        </tbody>
      </table>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
const store = useDashboardStore();
const { formatCents } = useFormatCurrency();

const stages = [
  { key: 'agreement', label: 'Agreement' },
  { key: 'earnest_money', label: 'Earnest Money' },
  { key: 'title_deed', label: 'Title Deed' },
  { key: 'completed', label: 'Completed' },
];

onMounted(() => store.fetchStats());
</script>
