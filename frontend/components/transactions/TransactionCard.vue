<template>
  <div
    class="bg-white rounded-2xl border border-stone-200/60 p-5 hover:shadow-md hover:border-stone-300 transition-all cursor-pointer space-y-3"
    @click="$emit('click')"
  >
    <div>
      <p class="text-sm font-semibold text-stone-900 line-clamp-1">{{ transaction.propertyAddress }}</p>
      <div class="flex items-center gap-2 mt-1">
        <UiBaseBadge :variant="transaction.type === 'sale' ? 'slate' : 'blue'">
          {{ transaction.type }}
        </UiBaseBadge>
        <span class="text-xs text-stone-500 font-medium">
          {{ formatCents(transaction.serviceFeeCents) }}
        </span>
      </div>
    </div>

    <div class="text-xs text-stone-400 space-y-1">
      <p>L: {{ getAgentName(transaction.listingAgent) }}</p>
      <p>S: {{ getAgentName(transaction.sellingAgent) }}</p>
    </div>

    <button
      v-if="showAdvance"
      class="w-full text-xs bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-2 font-medium transition-colors"
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
