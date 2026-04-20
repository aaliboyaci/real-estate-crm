<template>
  <select
    :value="modelValue"
    class="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option value="" disabled>Select agent</option>
    <option v-for="agent in agents" :key="agent._id" :value="agent._id">
      {{ agent.firstName }} {{ agent.lastName }}
    </option>
  </select>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const agentsStore = useAgentsStore();
const agents = computed(() => agentsStore.agents);

onMounted(() => {
  if (agents.value.length === 0) agentsStore.fetchAll();
});
</script>
