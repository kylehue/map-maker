<template>
   <div class="flex flex-col w-full h-full">
      <textarea v-model="value" @input="handleInput"></textarea>
   </div>
</template>

<script setup lang="ts">
import { useThemeVars } from "naive-ui";
import { computed, ref, watch } from "vue";
import { useProjectStore } from "../../store/project";

const theme = useThemeVars();
const projectStore = useProjectStore();

const matrixStr = computed(() => {
   if (!projectStore.selectedLayer) return "";
   return projectStore.selectedLayer.matrix.toString();
});

const value = ref(matrixStr.value);

watch(matrixStr, (matrixStr) => {
   value.value = matrixStr;
});

function handleInput() {
   if (!projectStore.selectedLayer) return "";
   projectStore.selectedLayer.matrix.fromString(value.value);
}
</script>

<style scoped lang="scss">
textarea {
   font-family: monospace, "Courier New", Courier !important;
   width: 100%;
   height: 100%;
   padding: 5px !important;
   resize: none !important;
   border: none !important;
   outline: none !important;
   background: none !important;
   text-wrap: nowrap !important;
   border-radius: 5px;
   line-height: 1 !important;
}
</style>
