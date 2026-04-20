<template>
  <div class="space-y-6">
    <!-- Financial Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="rounded-2xl bg-stone-900 text-white p-6 shadow-md">
        <p class="text-xs font-medium uppercase tracking-wider text-stone-400">Total Commissions</p>
        <p class="text-3xl font-bold mt-2 tracking-tight">{{ commissions.length }}</p>
      </div>
      <div class="rounded-2xl bg-white border border-stone-200/60 shadow-sm p-6">
        <p class="text-xs font-medium uppercase tracking-wider text-stone-500">Total Agency Revenue</p>
        <p class="text-3xl font-bold mt-2 tracking-tight text-stone-900">{{ formatCents(totalAgency) }}</p>
      </div>
      <div class="rounded-2xl bg-white border border-stone-200/60 shadow-sm p-6">
        <p class="text-xs font-medium uppercase tracking-wider text-stone-500">Total Agent Payouts</p>
        <p class="text-3xl font-bold mt-2 tracking-tight text-stone-900">{{ formatCents(totalAgentPayouts) }}</p>
      </div>
    </div>

    <UiBaseCard title="All Commissions">
      <div v-if="loading" class="text-center py-4 text-sm text-stone-400">Loading...</div>
      <div v-else-if="commissions.length === 0" class="text-center py-4 text-sm text-stone-400">
        No completed transactions yet
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-stone-400 border-b border-stone-100">
              <th class="pb-3 font-medium text-xs uppercase tracking-wider">Property</th>
              <th class="pb-3 font-medium text-right text-xs uppercase tracking-wider">Service Fee</th>
              <th class="pb-3 font-medium text-right text-xs uppercase tracking-wider">Agency</th>
              <th class="pb-3 font-medium text-right text-xs uppercase tracking-wider">Agents</th>
              <th class="pb-3 font-medium text-right text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in commissions" :key="c._id" class="border-b border-stone-50">
              <td class="py-2.5 text-stone-700">
                {{ typeof c.transaction === 'string' ? '-' : c.transaction.propertyAddress }}
              </td>
              <td class="py-2.5 text-right">{{ formatCents(c.totalServiceFeeCents) }}</td>
              <td class="py-2.5 text-right font-semibold text-stone-900">{{ formatCents(c.agencyAmountCents) }}</td>
              <td class="py-2.5 text-right">
                <span v-for="(b, idx) in c.agentBreakdowns" :key="idx" class="block text-xs">
                  {{ typeof b.agent === 'string' ? b.agent : `${b.agent.firstName} ${b.agent.lastName}` }}:
                  <span class="font-semibold text-stone-900">{{ formatCents(b.amountCents) }}</span>
                </span>
              </td>
              <td class="py-2.5 text-right text-stone-400">{{ new Date(c.calculatedAt).toLocaleDateString() }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-stone-200 font-bold">
              <td class="pt-3">Totals</td>
              <td class="pt-3 text-right">{{ formatCents(totalServiceFees) }}</td>
              <td class="pt-3 text-right text-stone-900">{{ formatCents(totalAgency) }}</td>
              <td class="pt-3 text-right text-stone-900">{{ formatCents(totalAgentPayouts) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import type { Commission } from '~/types/commission';

const api = useApi();
const { formatCents } = useFormatCurrency();

const commissions = ref<Commission[]>([]);
const loading = ref(false);

const totalServiceFees = computed(() =>
  commissions.value.reduce((sum, c) => sum + c.totalServiceFeeCents, 0),
);
const totalAgency = computed(() =>
  commissions.value.reduce((sum, c) => sum + c.agencyAmountCents, 0),
);
const totalAgentPayouts = computed(() =>
  commissions.value.reduce((sum, c) => sum + c.agentBreakdowns.reduce((s, b) => s + b.amountCents, 0), 0),
);

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
  await fetchCommissions();
});
</script>
