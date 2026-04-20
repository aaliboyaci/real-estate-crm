<template>
  <div class="bg-white rounded-2xl border border-stone-200/60 shadow-sm" :class="$attrs.class">
    <div v-if="title" class="px-6 py-4 border-b border-stone-100">
      <h3 class="text-sm font-semibold text-stone-800">{{ title }}</h3>
    </div>
    <div :class="noPadding ? '' : 'p-6'">
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
