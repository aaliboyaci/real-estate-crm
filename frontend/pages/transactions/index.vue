<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <p class="text-sm text-slate-500">
        {{ store.transactions.length }} transactions
      </p>
      <button
        class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        @click="showForm = true"
      >
        + New Transaction
      </button>
    </div>

    <!-- Kanban Pipeline -->
    <TransactionsTransactionPipeline
      :pipeline="store.pipeline"
      @advance="handleAdvance"
    />

    <!-- Create Form Modal -->
    <UiBaseModal v-model="showForm" title="New Transaction">
      <TransactionsTransactionForm
        @created="handleCreated"
        @cancel="showForm = false"
      />
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
import type { TransactionStage } from '~/types/transaction';

const store = useTransactionsStore();
const { success, error } = useToast();
const showForm = ref(false);

async function handleAdvance(id: string, targetStage: TransactionStage) {
  try {
    await store.advanceStage(id, targetStage);
    success(`Transaction advanced to ${targetStage.replace('_', ' ')}`);
  } catch (e: unknown) {
    error(e instanceof Error ? e.message : 'Failed to advance stage');
  }
}

function handleCreated() {
  showForm.value = false;
  success('Transaction created');
}

onMounted(() => store.fetchAll());
</script>
