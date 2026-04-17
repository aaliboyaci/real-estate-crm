<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
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
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    slate: 'bg-slate-100 text-slate-700',
    red: 'bg-red-100 text-red-700',
  };
  return map[props.variant || 'slate'];
});
</script>
