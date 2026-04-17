export interface DashboardStats {
  totalTransactions: number;
  activeTransactions: number;
  agencyRevenueCents: number;
  stageCounts: Record<string, number>;
  topAgents: Array<{
    agentId: string;
    firstName: string;
    lastName: string;
    email: string;
    totalEarningsCents: number;
    transactionCount: number;
  }>;
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null);
  const loading = ref(false);

  const api = useApi();

  async function fetchStats() {
    loading.value = true;
    try {
      stats.value = await api.get<DashboardStats>('/dashboard/stats');
    } finally {
      loading.value = false;
    }
  }

  return { stats, loading, fetchStats };
});
