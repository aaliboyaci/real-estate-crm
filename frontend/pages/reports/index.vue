<template>
  <div class="space-y-6">
    <DashboardStatsCards :stats="dashStore.stats" :loading="dashStore.loading" />

    <UiBaseCard title="All Commissions">
      <div v-if="loading" class="text-center py-4 text-sm text-slate-400">Loading...</div>
      <div v-else-if="commissions.length === 0" class="text-center py-4 text-sm text-slate-400">
        No completed transactions yet
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-100">
              <th class="pb-2 font-medium">Property</th>
              <th class="pb-2 font-medium text-right">Service Fee</th>
              <th class="pb-2 font-medium text-right">Agency</th>
              <th class="pb-2 font-medium text-right">Agents</th>
              <th class="pb-2 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in commissions" :key="c._id" class="border-b border-slate-50">
              <td class="py-2.5 text-slate-700">
                {{ typeof c.transaction === 'string' ? '-' : c.transaction.propertyAddress }}
              </td>
              <td class="py-2.5 text-right">{{ formatCents(c.totalServiceFeeCents) }}</td>
              <td class="py-2.5 text-right font-medium text-slate-600">{{ formatCents(c.agencyAmountCents) }}</td>
              <td class="py-2.5 text-right">
                <span v-for="(b, idx) in c.agentBreakdowns" :key="idx" class="block text-xs">
                  {{ typeof b.agent === 'string' ? b.agent : `${b.agent.firstName} ${b.agent.lastName}` }}:
                  <span class="font-medium text-emerald-600">{{ formatCents(b.amountCents) }}</span>
                </span>
              </td>
              <td class="py-2.5 text-right text-slate-400">{{ new Date(c.calculatedAt).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import type { Commission } from '~/types/commission';

const dashStore = useDashboardStore();
const api = useApi();
const { formatCents } = useFormatCurrency();

const commissions = ref<Commission[]>([]);
const loading = ref(false);

async function fetchCommissions() {
  loading.value = true;
  try {
    commissions.value = await api.get<Commission[]>('/commissions');
  } catch {
    commissions.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await dashStore.fetchStats();
  await fetchCommissions();
});
</script>
