<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm" :class="$attrs.class">
    <div v-if="title" class="px-5 py-4 border-b border-slate-100">
      <h3 class="text-sm font-semibold text-slate-700">{{ title }}</h3>
    </div>
    <div :class="noPadding ? '' : 'p-5'">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  noPadding?: boolean;
}>();
</script>
