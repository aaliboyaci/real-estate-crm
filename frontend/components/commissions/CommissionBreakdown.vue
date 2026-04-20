<template>
  <UiBaseCard title="Commission Breakdown">
    <div v-if="!summary" class="text-sm text-stone-400 text-center py-4">
      Commission will be calculated when the transaction is completed.
    </div>

    <div v-else class="space-y-4">
      <!-- Visual bar -->
      <div class="flex h-8 rounded-lg overflow-hidden">
        <div
          class="bg-stone-800 flex items-center justify-center text-white text-xs font-medium"
          :style="{ width: '50%' }"
        >
          Agency 50%
        </div>
        <div
          v-if="isSameAgent"
          class="bg-stone-500 flex items-center justify-center text-white text-xs font-medium"
          :style="{ width: '50%' }"
        >
          Agent 50%
        </div>
        <template v-else>
          <div
            class="bg-stone-400 flex items-center justify-center text-white text-xs font-medium"
            :style="{ width: '25%' }"
          >
            25%
          </div>
          <div
            class="bg-stone-600 flex items-center justify-center text-white text-xs font-medium"
            :style="{ width: '25%' }"
          >
            25%
          </div>
        </template>
      </div>

      <!-- Detail rows -->
      <div class="space-y-2">
        <div class="flex justify-between items-center py-2 border-b border-stone-100">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-stone-800" />
            <span class="text-sm text-stone-700 font-medium">Agency</span>
          </div>
          <span class="text-sm font-bold text-stone-900">{{ formatCents(summary.agencyCents) }}</span>
        </div>

        <div class="flex justify-between items-center py-2 border-b border-stone-100">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="isSameAgent ? 'bg-stone-500' : 'bg-stone-400'" />
            <span class="text-sm text-stone-700">
              {{ listingAgentName }}
              <span class="text-xs text-stone-400">({{ isSameAgent ? 'Both' : 'Listing' }})</span>
            </span>
          </div>
          <span class="text-sm font-bold text-stone-900">{{ formatCents(summary.listingAgentCents) }}</span>
        </div>

        <div v-if="!isSameAgent" class="flex justify-between items-center py-2 border-b border-stone-100">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-stone-600" />
            <span class="text-sm text-stone-700">
              {{ sellingAgentName }}
              <span class="text-xs text-stone-400">(Selling)</span>
            </span>
          </div>
          <span class="text-sm font-bold text-stone-900">{{ formatCents(summary.sellingAgentCents) }}</span>
        </div>

        <div class="flex justify-between items-center py-2 font-bold text-stone-900">
          <span class="text-sm">Total</span>
          <span class="text-sm">{{ formatCents(totalCents) }}</span>
        </div>
      </div>
    </div>
  </UiBaseCard>
</template>

<script setup lang="ts">
import type { CommissionSummary } from '~/types/transaction';
import type { Agent } from '~/types/agent';

const props = defineProps<{
  summary: CommissionSummary | null;
  serviceFeeCents: number;
  listingAgent: Agent | string;
  sellingAgent: Agent | string;
}>();

const { formatCents } = useFormatCurrency();

const isSameAgent = computed(() => {
  const listingId = typeof props.listingAgent === 'string' ? props.listingAgent : props.listingAgent._id;
  const sellingId = typeof props.sellingAgent === 'string' ? props.sellingAgent : props.sellingAgent._id;
  return listingId === sellingId;
});

const listingAgentName = computed(() =>
  typeof props.listingAgent === 'string'
    ? props.listingAgent
    : `${props.listingAgent.firstName} ${props.listingAgent.lastName}`,
);

const sellingAgentName = computed(() =>
  typeof props.sellingAgent === 'string'
    ? props.sellingAgent
    : `${props.sellingAgent.firstName} ${props.sellingAgent.lastName}`,
);

const totalCents = computed(() =>
  props.summary
    ? props.summary.agencyCents + props.summary.listingAgentCents + props.summary.sellingAgentCents
    : props.serviceFeeCents,
);
</script>
