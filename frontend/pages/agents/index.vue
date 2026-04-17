<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <p class="text-sm text-slate-500">{{ store.agents.length }} agents</p>
      <button
        class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        @click="showForm = true"
      >
        + New Agent
      </button>
    </div>

    <div v-if="store.loading" class="text-center py-12 text-slate-400">Loading...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="agent in store.agents"
        :key="agent._id"
        class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
        @click="navigateTo(`/agents/${agent._id}`)"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
            {{ agent.firstName[0] }}{{ agent.lastName[0] }}
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">{{ agent.firstName }} {{ agent.lastName }}</p>
            <p class="text-xs text-slate-500">{{ agent.email }}</p>
          </div>
        </div>
        <div v-if="agent.phone" class="mt-3 text-xs text-slate-400">{{ agent.phone }}</div>
      </div>
    </div>

    <UiBaseModal v-model="showForm" title="New Agent">
      <form @submit.prevent="handleCreate" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">First Name</label>
            <input v-model="form.firstName" type="text" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
            <input v-model="form.lastName" type="text" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input v-model="form.email" type="email" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input v-model="form.phone" type="text" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg" @click="showForm = false">Cancel</button>
          <button type="submit" class="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800">Create Agent</button>
        </div>
      </form>
    </UiBaseModal>
  </div>
</template>

<script setup lang="ts">
const store = useAgentsStore();
const { success, error } = useToast();
const showForm = ref(false);

const form = reactive({ firstName: '', lastName: '', email: '', phone: '' });

async function handleCreate() {
  try {
    await store.create(form);
    showForm.value = false;
    Object.assign(form, { firstName: '', lastName: '', email: '', phone: '' });
    success('Agent created');
  } catch (e: unknown) {
    error(e instanceof Error ? e.message : 'Failed to create agent');
  }
}

onMounted(() => store.fetchAll());
</script>
