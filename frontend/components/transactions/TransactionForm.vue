<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1">Property Address</label>
      <input
        v-model="form.propertyAddress"
        type="text"
        required
        class="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none"
        placeholder="Calle Gran Via 28, Madrid"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">Type</label>
        <select
          v-model="form.type"
          class="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none"
        >
          <option value="sale">Sale</option>
          <option value="rental">Rental</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">Property Price (EUR)</label>
        <input
          v-model.number="priceEur"
          type="number"
          min="0.01"
          step="0.01"
          required
          class="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1">Service Fee (EUR)</label>
      <input
        v-model.number="feeEur"
        type="number"
        min="0.01"
        step="0.01"
        required
        class="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">Listing Agent</label>
        <AgentsAgentSelect v-model="form.listingAgent" />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">Selling Agent</label>
        <AgentsAgentSelect v-model="form.sellingAgent" />
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        class="px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="submitting"
        class="px-5 py-2.5 text-sm font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Creating...' : 'Create Transaction' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
const store = useTransactionsStore();
const { error } = useToast();

const emit = defineEmits<{
  created: [];
  cancel: [];
}>();

const priceEur = ref(0);
const feeEur = ref(0);
const submitting = ref(false);

const form = reactive({
  propertyAddress: '',
  type: 'sale' as 'sale' | 'rental',
  listingAgent: '',
  sellingAgent: '',
});

async function handleSubmit() {
  if (!form.listingAgent || !form.sellingAgent) {
    error('Please select both agents');
    return;
  }

  submitting.value = true;
  try {
    await store.create({
      ...form,
      propertyPriceCents: Math.round(priceEur.value * 100),
      serviceFeeCents: Math.round(feeEur.value * 100),
    });
    emit('created');
  } catch (e: unknown) {
    error(e instanceof Error ? e.message : 'Failed to create transaction');
  } finally {
    submitting.value = false;
  }
}
</script>
