<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="close" />
      <div
        class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-lg font-semibold text-slate-800">{{ title }}</h3>
          <button
            class="text-slate-400 hover:text-slate-600 text-xl"
            @click="close"
          >
            &times;
          </button>
        </div>
        <div class="p-6">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  title: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function close() {
  emit('update:modelValue', false);
}
</script>
