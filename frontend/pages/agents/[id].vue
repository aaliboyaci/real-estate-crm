<template>
  <div v-if="store.loading" class="text-center py-12 text-stone-400">Loading...</div>

  <div v-else-if="agent" class="space-y-6">
    <!-- Agent Info -->
    <UiBaseCard>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center text-xl font-bold text-white">
          {{ agent.firstName[0] }}{{ agent.lastName[0] }}
        </div>
        <div>
          <h3 class="text-lg font-bold text-stone-900">{{ agent.firstName }} {{ agent.lastName }}</h3>
          <p class="text-sm text-stone-400">{{ agent.email }}</p>
          <p v-if="agent.phone" class="text-sm text-stone-400">{{ agent.phone }}</p>
        </div>
      </div>
    </UiBaseCard>

    <!-- Commissions -->
    <UiBaseCard title="Commission History">
      <div v-if="commissionsLoading" class="text-center py-4 text-sm text-stone-400">Loading...</div>
      <div v-else-if="commissions.length === 0" class="text-center py-4 text-sm text-stone-400">
        No commissions yet
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-stone-400 border-b border-stone-100">
            <th class="pb-2 font-medium">Transaction</th>
            <th class="pb-2 font-medium">Role</th>
            <th class="pb-2 font-medium text-right">Amount</th>
            <th class="pb-2 font-medium text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in commissions" :key="c._id" class="border-b border-stone-50">
            <td class="py-3 text-stone-700">
              {{ typeof c.transaction === 'string' ? c.transaction : c.transaction.propertyAddress || c.transaction._id }}
            </td>
            <td class="py-2.5">
              <UiBaseBadge :variant="getBreakdown(c)?.role === 'both' ? 'emerald' : 'blue'">
                {{ getBreakdown(c)?.role ?? '-' }}
              </UiBaseBadge>
            </td>
            <td class="py-2.5 text-right font-semibold text-stone-900">
              {{ formatCents(getBreakdown(c)?.amountCents ?? 0) }}
            </td>
            <td class="py-2.5 text-right text-stone-400">
              {{ new Date(c.calculatedAt).toLocaleDateString() }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-stone-200 font-bold">
            <td colspan="2" class="pt-3">Total Earnings</td>
            <td class="pt-3 text-right text-stone-900 font-semibold">{{ formatCents(totalEarnings) }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import type { Commission } from '~/types/commission';

const route = useRoute();
const store = useAgentsStore();
const { formatCents } = useFormatCurrency();
const api = useApi();

const agent = computed(() => store.currentAgent);
const commissions = ref<Commission[]>([]);
const commissionsLoading = ref(false);

function getBreakdown(commission: Commission) {
  return commission.agentBreakdowns.find((b) => {
    const bAgentId = typeof b.agent === 'string' ? b.agent : b.agent._id;
    return bAgentId === route.params.id;
  });
}

const totalEarnings = computed(() =>
  commissions.value.reduce((sum, c) => sum + (getBreakdown(c)?.amountCents ?? 0), 0),
);

async function fetchCommissions() {
  commissionsLoading.value = true;
  try {
    commissions.value = await api.get<Commission[]>(`/agents/${route.params.id}/commissions`);
  } catch {
    commissions.value = [];
  } finally {
    commissionsLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchOne(route.params.id as string);
  await fetchCommissions();
});
</script>
