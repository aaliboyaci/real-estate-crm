<template>
  <div v-if="store.loading" class="text-center py-12 text-slate-400">Loading...</div>

  <div v-else-if="tx" class="space-y-6">
    <!-- Stepper -->
    <UiBaseCard>
      <TransactionsTransactionStepper :current-stage="tx.currentStage" />
    </UiBaseCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Property Info -->
      <UiBaseCard title="Property Details">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500">Address</dt>
            <dd class="font-medium text-slate-800">{{ tx.propertyAddress }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Type</dt>
            <dd><UiBaseBadge :variant="tx.type === 'sale' ? 'slate' : 'blue'">{{ tx.type }}</UiBaseBadge></dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Property Price</dt>
            <dd class="font-medium text-slate-800">{{ formatCents(tx.propertyPriceCents) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Service Fee</dt>
            <dd class="font-bold text-emerald-600">{{ formatCents(tx.serviceFeeCents) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Created</dt>
            <dd class="text-slate-600">{{ new Date(tx.createdAt).toLocaleDateString() }}</dd>
          </div>
        </dl>
      </UiBaseCard>

      <!-- Agents -->
      <UiBaseCard title="Agents">
        <div class="space-y-4">
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wide mb-1">Listing Agent</p>
            <p class="text-sm font-medium text-slate-800">{{ getAgentName(tx.listingAgent) }}</p>
            <p v-if="typeof tx.listingAgent !== 'string'" class="text-xs text-slate-500">{{ tx.listingAgent.email }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wide mb-1">Selling Agent</p>
            <p class="text-sm font-medium text-slate-800">{{ getAgentName(tx.sellingAgent) }}</p>
            <p v-if="typeof tx.sellingAgent !== 'string'" class="text-xs text-slate-500">{{ tx.sellingAgent.email }}</p>
          </div>
        </div>

        <!-- Advance Button -->
        <div v-if="tx.currentStage !== 'completed'" class="mt-6 pt-4 border-t border-slate-100">
          <button
            :disabled="advancing"
            class="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
            @click="handleAdvance"
          >
            {{ advancing ? 'Advancing...' : `Advance to ${nextStageLabel}` }}
          </button>
        </div>
      </UiBaseCard>
    </div>

    <!-- Commission Breakdown -->
    <CommissionsCommissionBreakdown
      :summary="tx.commissionSummary"
      :service-fee-cents="tx.serviceFeeCents"
      :listing-agent="tx.listingAgent"
      :selling-agent="tx.sellingAgent"
    />

    <!-- Stage History -->
    <UiBaseCard title="Stage History">
      <div v-if="tx.stageHistory.length === 0" class="text-sm text-slate-400 text-center py-2">
        No transitions yet
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="(entry, idx) in tx.stageHistory"
          :key="idx"
          class="flex items-center gap-3 text-sm py-2 border-b border-slate-50 last:border-0"
        >
          <UiBaseBadge :variant="badgeVariant(entry.to)">
            {{ entry.from.replace('_', ' ') }} &rarr; {{ entry.to.replace('_', ' ') }}
          </UiBaseBadge>
          <span class="text-xs text-slate-400">
            {{ new Date(entry.transitionedAt).toLocaleString() }}
          </span>
          <span v-if="entry.note" class="text-xs text-slate-500 italic">{{ entry.note }}</span>
        </div>
      </div>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import type { Agent } from '~/types/agent';
import type { TransactionStage } from '~/types/transaction';

const route = useRoute();
const store = useTransactionsStore();
const { success, error } = useToast();
const { formatCents } = useFormatCurrency();
const advancing = ref(false);

const tx = computed(() => store.currentTransaction);

const nextStageMap: Record<string, { stage: TransactionStage; label: string }> = {
  agreement: { stage: 'earnest_money', label: 'Earnest Money' },
  earnest_money: { stage: 'title_deed', label: 'Title Deed' },
  title_deed: { stage: 'completed', label: 'Completed' },
};

const nextStageLabel = computed(() =>
  tx.value ? nextStageMap[tx.value.currentStage]?.label ?? '' : '',
);

function getAgentName(agent: Agent | string): string {
  if (typeof agent === 'string') return agent;
  return `${agent.firstName} ${agent.lastName}`;
}

function badgeVariant(stage: string) {
  const map: Record<string, 'blue' | 'amber' | 'purple' | 'emerald'> = {
    agreement: 'blue',
    earnest_money: 'amber',
    title_deed: 'purple',
    completed: 'emerald',
  };
  return map[stage] || 'slate';
}

async function handleAdvance() {
  if (!tx.value) return;
  const next = nextStageMap[tx.value.currentStage];
  if (!next) return;

  advancing.value = true;
  try {
    await store.advanceStage(tx.value._id, next.stage);
    // Refetch to get updated commission data
    await store.fetchOne(tx.value._id);
    success(`Advanced to ${next.label}`);
  } catch (e: unknown) {
    error(e instanceof Error ? e.message : 'Failed to advance stage');
  } finally {
    advancing.value = false;
  }
}

onMounted(() => store.fetchOne(route.params.id as string));
</script>
