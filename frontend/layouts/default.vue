<template>
  <div class="min-h-screen bg-stone-100 flex">
    <LayoutAppSidebar />
    <div class="flex-1 flex flex-col ml-64">
      <LayoutAppHeader />
      <main class="flex-1 p-8">
        <div class="bg-white/60 rounded-2xl p-6 min-h-full backdrop-blur-sm">
          <slot />
        </div>
      </main>
    </div>
    <!-- Toast notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium transition-all',
          toast.type === 'success' && 'bg-stone-900 text-white',
          toast.type === 'error' && 'bg-red-600 text-white',
          toast.type === 'info' && 'bg-stone-800 text-white',
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
