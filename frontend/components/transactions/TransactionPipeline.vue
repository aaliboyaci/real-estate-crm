<template>
  <div class="grid grid-cols-4 gap-4">
    <div
      v-for="column in pipeline"
      :key="column.stage"
      class="space-y-3"
    >
      <!-- Column Header -->
      <div class="flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
        <UiBaseBadge :variant="badgeVariant(column.stage)">
          {{ column.label }}
        </UiBaseBadge>
        <span class="text-xs text-stone-400 font-medium">{{ column.items.length }}</span>
      </div>

      <!-- Cards -->
      <TransactionsTransactionCard
        v-for="tx in column.items"
        :key="tx._id"
        :transaction="tx"
        :show-advance="column.stage !== 'completed'"
        @advance="handleAdvance(tx)"
        @click="navigateTo(`/transactions/${tx._id}`)"
      />

      <UiBaseEmptyState
        v-if="column.items.length === 0"
        message="No transactions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionStage } from '~/types/transaction';

defineProps<{
  pipeline: Array<{
    stage: TransactionStage;
    label: string;
    items: Transaction[];
  }>;
}>();

const emit = defineEmits<{
  advance: [id: string, targetStage: TransactionStage];
}>();

const nextStageMap: Record<string, TransactionStage> = {
  agreement: 'earnest_money',
  earnest_money: 'title_deed',
  title_deed: 'completed',
};

function handleAdvance(tx: Transaction) {
  const next = nextStageMap[tx.currentStage];
  if (next) emit('advance', tx._id, next);
}

function badgeVariant(stage: TransactionStage) {
  const map: Record<TransactionStage, 'blue' | 'amber' | 'purple' | 'emerald'> = {
    agreement: 'blue',
    earnest_money: 'amber',
    title_deed: 'purple',
    completed: 'emerald',
  };
  return map[stage];
}

function borderColor(stage: TransactionStage) {
  const map: Record<TransactionStage, string> = {
    agreement: 'border-blue-400',
    earnest_money: 'border-amber-400',
    title_deed: 'border-purple-400',
    completed: 'border-emerald-400',
  };
  return map[stage];
}
</script>
