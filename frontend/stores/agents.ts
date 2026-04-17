import type { Agent, CreateAgentDto } from '~/types/agent';

export const useAgentsStore = defineStore('agents', () => {
  const agents = ref<Agent[]>([]);
  const currentAgent = ref<Agent | null>(null);
  const loading = ref(false);

  const api = useApi();

  async function fetchAll() {
    loading.value = true;
    try {
      const result = await api.getRaw<{ data: Agent[]; meta: Record<string, number> }>('/agents');
      agents.value = result.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: string) {
    loading.value = true;
    try {
      currentAgent.value = await api.get<Agent>(`/agents/${id}`);
    } finally {
      loading.value = false;
    }
  }

  async function create(dto: CreateAgentDto) {
    const agent = await api.post<Agent>('/agents', dto);
    agents.value.unshift(agent);
    return agent;
  }

  async function update(id: string, dto: Partial<CreateAgentDto>) {
    const agent = await api.patch<Agent>(`/agents/${id}`, dto);
    const idx = agents.value.findIndex((a) => a._id === id);
    if (idx !== -1) agents.value[idx] = agent;
    if (currentAgent.value?._id === id) currentAgent.value = agent;
    return agent;
  }

  return { agents, currentAgent, loading, fetchAll, fetchOne, create, update };
});
