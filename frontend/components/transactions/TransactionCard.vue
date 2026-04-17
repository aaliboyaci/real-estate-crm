<template>
  <div
    class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer space-y-3"
    @click="$emit('click')"
  >
    <div>
      <p class="text-sm font-medium text-slate-800 line-clamp-1">{{ transaction.propertyAddress }}</p>
      <div class="flex items-center gap-2 mt-1">
        <UiBaseBadge :variant="transaction.type === 'sale' ? 'slate' : 'blue'">
          {{ transaction.type }}
        </UiBaseBadge>
        <span class="text-xs text-slate-400">
          {{ formatCents(transaction.serviceFeeCents) }}
        </span>
      </div>
    </div>

    <div class="text-xs text-slate-500 space-y-1">
      <p>L: {{ getAgentName(transaction.listingAgent) }}</p>
      <p>S: {{ getAgentName(transaction.sellingAgent) }}</p>
    </div>

    <button
      v-if="showAdvance"
      class="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md py-1.5 font-medium transition-colors"
      @click.stop="$emit('advance')"
    >
      Advance Stage &rarr;
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~/types/transaction';
import type { Agent } from '~/types/agent';

defineProps<{
  transaction: Transaction;
  showAdvance?: boolean;
}>();

defineEmits<{
  click: [];
  advance: [];
}>();

const { formatCents } = useFormatCurrency();

function getAgentName(agent: Agent | string): string {
  if (typeof agent === 'string') return agent;
  return `${agent.firstName} ${agent.lastName}`;
}
</script>
