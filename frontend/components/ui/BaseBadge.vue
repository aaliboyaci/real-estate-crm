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
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-stone-100 text-stone-600',
    red: 'bg-red-50 text-red-700',
  };
  return map[props.variant || 'slate'];
});
</script>
