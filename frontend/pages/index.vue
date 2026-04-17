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
          <div
            :class="[
              'text-2xl font-bold',
              stage.color,
            ]"
          >
            {{ store.stats?.stageCounts[stage.key] ?? 0 }}
          </div>
          <div class="text-xs text-slate-500 mt-1">{{ stage.label }}</div>
        </div>
      </div>
    </UiBaseCard>

    <!-- Top Agents -->
    <UiBaseCard title="Top Earning Agents">
      <div v-if="!store.stats?.topAgents?.length" class="text-sm text-slate-400 text-center py-4">
        No commission data yet
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b border-slate-100">
            <th class="pb-2 font-medium">Agent</th>
            <th class="pb-2 font-medium text-right">Earnings</th>
            <th class="pb-2 font-medium text-right">Deals</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="agent in store.stats.topAgents"
            :key="agent.agentId"
            class="border-b border-slate-50"
          >
            <td class="py-2.5">{{ agent.firstName }} {{ agent.lastName }}</td>
            <td class="py-2.5 text-right font-medium text-emerald-600">
              {{ formatCents(agent.totalEarningsCents) }}
            </td>
            <td class="py-2.5 text-right text-slate-500">{{ agent.transactionCount }}</td>
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
  { key: 'agreement', label: 'Agreement', color: 'text-blue-600' },
  { key: 'earnest_money', label: 'Earnest Money', color: 'text-amber-600' },
  { key: 'title_deed', label: 'Title Deed', color: 'text-purple-600' },
  { key: 'completed', label: 'Completed', color: 'text-emerald-600' },
];

onMounted(() => store.fetchStats());
</script>
