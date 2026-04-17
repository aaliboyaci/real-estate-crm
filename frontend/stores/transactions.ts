import type { Transaction, CreateTransactionDto, TransactionStage } from '~/types/transaction';

const STAGE_LABELS: Record<TransactionStage, string> = {
  agreement: 'Agreement',
  earnest_money: 'Earnest Money',
  title_deed: 'Title Deed',
  completed: 'Completed',
};

const STAGE_ORDER: TransactionStage[] = ['agreement', 'earnest_money', 'title_deed', 'completed'];

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);
  const currentTransaction = ref<Transaction | null>(null);
  const loading = ref(false);

  const api = useApi();

  const pipeline = computed(() =>
    STAGE_ORDER.map((stage) => ({
      stage,
      label: STAGE_LABELS[stage],
      items: transactions.value.filter((t) => t.currentStage === stage),
    })),
  );

  async function fetchAll(stage?: TransactionStage) {
    loading.value = true;
    try {
      const params: Record<string, unknown> = { limit: 100 };
      if (stage) params.stage = stage;
      const result = await api.getRaw<{ data: Transaction[]; meta: Record<string, number> }>('/transactions', params);
      transactions.value = result.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: string) {
    loading.value = true;
    try {
      currentTransaction.value = await api.get<Transaction>(`/transactions/${id}`);
    } finally {
      loading.value = false;
    }
  }

  async function create(dto: CreateTransactionDto) {
    const transaction = await api.post<Transaction>('/transactions', dto);
    transactions.value.unshift(transaction);
    return transaction;
  }

  async function advanceStage(id: string, targetStage: TransactionStage, note?: string) {
    const transaction = await api.patch<Transaction>(`/transactions/${id}/stage`, {
      targetStage,
      note,
    });
    const idx = transactions.value.findIndex((t) => t._id === id);
    if (idx !== -1) transactions.value[idx] = transaction;
    if (currentTransaction.value?._id === id) currentTransaction.value = transaction;
    return transaction;
  }

  return {
    transactions,
    currentTransaction,
    loading,
    pipeline,
    fetchAll,
    fetchOne,
    create,
    advanceStage,
    STAGE_LABELS,
    STAGE_ORDER,
  };
});
