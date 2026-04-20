<template>
  <div class="text-center py-12 text-stone-400">
    <p class="text-4xl mb-3">{{ icon }}</p>
    <p class="text-sm font-medium">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  message: string;
}>();
</script>
