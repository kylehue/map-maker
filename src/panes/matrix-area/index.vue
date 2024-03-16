<template>
   <div class="flex flex-col w-full h-full">
      <textarea v-model="value"></textarea>
   </div>
</template>

<script setup lang="ts">
import { useThemeVars } from "naive-ui";
import { computed, ref } from "vue";
import { useProjectStore } from "../../store/project";

const theme = useThemeVars();
const projectStore = useProjectStore();
const value = computed(() => {
   if (!projectStore.selectedLayer) return "";
   return projectStore.selectedLayer.matrix.toString();
});
</script>

<style scoped lang="scss">
textarea {
   font-family: monospace, 'Courier New', Courier !important;
   width: 100%;
   height: 100%;
   padding: 5px !important;
   resize: none !important;
   border: none !important;
   outline: none !important;
   background: none !important;
   text-wrap: nowrap !important;
   border-radius: 5px;
}
</style>
