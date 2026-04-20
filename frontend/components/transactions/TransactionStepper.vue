<template>
  <div class="flex items-center justify-between">
    <div
      v-for="(stage, index) in stages"
      :key="stage.key"
      class="flex items-center"
      :class="index < stages.length - 1 ? 'flex-1' : ''"
    >
      <!-- Step circle -->
      <div class="flex flex-col items-center">
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
            getStepClass(index),
          ]"
        >
          <template v-if="index < currentIndex">&#10003;</template>
          <template v-else>{{ index + 1 }}</template>
        </div>
        <p
          :class="[
            'text-xs mt-2 font-medium',
            index <= currentIndex ? 'text-stone-900' : 'text-stone-400',
          ]"
        >
          {{ stage.label }}
        </p>
      </div>

      <!-- Connector line -->
      <div
        v-if="index < stages.length - 1"
        :class="[
          'flex-1 h-1 mx-3 mt-[-1.25rem] rounded-full',
          index < currentIndex ? 'bg-stone-900' : 'bg-stone-200',
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransactionStage } from '~/types/transaction';

const props = defineProps<{
  currentStage: TransactionStage;
}>();

const stages = [
  { key: 'agreement', label: 'Agreement' },
  { key: 'earnest_money', label: 'Earnest Money' },
  { key: 'title_deed', label: 'Title Deed' },
  { key: 'completed', label: 'Completed' },
];

const currentIndex = computed(() =>
  stages.findIndex((s) => s.key === props.currentStage),
);

function getStepClass(index: number) {
  if (index < currentIndex.value) return 'bg-stone-900 border-stone-900 text-white';
  if (index === currentIndex.value) return 'bg-stone-900 border-stone-900 text-white shadow-md';
  return 'bg-white border-stone-200 text-stone-400';
}
</script>
