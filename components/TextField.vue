<template>
  <div class="d-flex align-center ga-2">
    <v-text-field
      v-model="model"
      :label
      :density
      :type
      :messages
      variant="outlined"
    />
  </div>
</template>
<script setup>
import {useVModel} from "@vueuse/core";
import {defineProps, defineEmits} from "vue";
import {useAriaLabelForRole} from "~/composables/useAriaLabelForRole";

const props = defineProps({
  modelValue: {type: String},
  label: {type: String},
  density: {type: String},
  type: {type: String},
  messages: {type: String}
});

const emit = defineEmits(["update:modelValue", "blur", "end"]);

// Label
useAriaLabelForRole(props.label)

// Model
const model = useVModel(props, "modelValue", emit);
// Emit end event
watchDebounced(
  model,
  // If new and old value is the same, it means that user didn't edit anything
  (value, oldValue) => value === oldValue || emit("end"),
  {debounce: 1000}
);
</script>
