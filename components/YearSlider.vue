<template>
  <div class="align-center ga-2">
    <v-range-slider
      :model-value="yearRange"
      :min="props.minYear"
      :max="props.maxYear"
      strict
      step="1"
      messages="Filter characters by a year range"
      @end="emit('end')"
      @update:model-value="emitValue($event)"
    />

    <div class="d-flex year-slider-entry mt-3" style="width: 100%">
      <TextField class="year-entry" density="compact" type="number" @end="onEditEntryEnd"
                 v-model="from" label="From" messages="Filter character from year"/>
      <v-spacer/>
      <TextField class="year-entry" density="compact" type="number" @end="onEditEntryEnd"
                 v-model="to" label="To" messages="Filter character to year"/>
    </div>
  </div>
</template>

<script setup>
import {defineProps, defineEmits} from "vue";
import {useAriaLabelForRole} from "~/composables/useAriaLabelForRole";

const props = defineProps({
  modelValue: {type: Object},
  maxYear: {type: Number, default: 1715},
  minYear: {type: Number, default: 1644},
});

const emit = defineEmits(["update:modelValue", "end"]);

// Apply to model
const emitValue = (value) => emit('update:modelValue', {yearEarly: value[0], yearLate: value[1]})

// Label
const label = ref('Year')
useAriaLabelForRole(label)

// Year range array
const yearRange = computed(() => [
  props.modelValue?.yearEarly,
  props.modelValue?.yearLate,
]);

// Date entry model
const from = ref(`${yearRange.value[0]}`)
const to = ref(`${yearRange.value[1]}`)

// Watch if year range is changed, then update year entry model
watch(yearRange, (value) => {
  from.value = `${value[0]}`
  to.value = `${value[1]}`
})

// Enforce a ref value in a range
const getInRange = (value, min, max) => {
  if (value < min) return min
  if (value > max) return max

  return value
}

// On end editing year entry
const onEditEntryEnd = () => {
  // Emit value
  emitValue([
    getInRange(Number(from.value), props.minYear, Number(to.value)),
    getInRange(Number(to.value), Number(from.value), props.maxYear)
  ])
  // Emit end
  emit('end')
}
</script>

<style lang="scss">
.year-entry {
  width: 74px;

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }
}
</style>
