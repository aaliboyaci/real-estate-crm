<template>
  <div class="min-h-screen bg-slate-50 flex">
    <LayoutAppSidebar />
    <div class="flex-1 flex flex-col ml-64">
      <LayoutAppHeader />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
    <!-- Toast notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all',
          toast.type === 'success' && 'bg-emerald-500 text-white',
          toast.type === 'error' && 'bg-red-500 text-white',
          toast.type === 'info' && 'bg-slate-700 text-white',
        ]"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toasts } = useToast();
</script>
