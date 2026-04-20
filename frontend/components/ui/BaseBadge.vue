<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
      variantClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'blue' | 'amber' | 'purple' | 'emerald' | 'slate' | 'red';
}>();

const variantClasses = computed(() => {
  const map = {
    blue: 'bg-stone-100 text-stone-600',
    amber: 'bg-stone-100 text-stone-600',
    purple: 'bg-stone-100 text-stone-600',
    emerald: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-stone-100 text-stone-600',
    red: 'bg-red-50 text-red-700',
  };
  return map[props.variant || 'slate'];
});
</script>
