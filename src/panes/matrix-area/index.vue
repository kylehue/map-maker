<template>
   <div class="flex flex-col w-full h-full">
      <div class="matrix-navbar flex w-full h-8 flex-shrink-0 items-center">
         <Navbar @save="save" :is-saved="!hasChanged"></Navbar>
      </div>
      <div
         class="matrix-area flex flex-col flex-auto items-start overflow-auto"
      >
         <textarea v-model="value" @blur="save"></textarea>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useThemeVars } from "naive-ui";
import { computed, ref, watch } from "vue";
import Navbar from "./navbar.vue";
import { useProjectStore } from "../../store/project";
import { useDesignerStore } from "../../store/designer";

const theme = useThemeVars();
const projectStore = useProjectStore();
const designerStore = useDesignerStore();

const matrixStr = computed(() => {
   if (!projectStore.selectedLayer) return "";
   return projectStore.selectedLayer.matrix.toString();
});

const hasChanged = computed(() => {
   if (!projectStore.selectedLayer) return false;
   return matrixStr.value !== value.value;
});

const value = ref(matrixStr.value);

// watch changes outside matrix-area (mostly in designer)
watch(matrixStr, (matrixStr) => {
   value.value = matrixStr;
});

function save() {
   if (!projectStore.selectedLayer) return "";
   projectStore.selectedLayer.matrix.fromString(value.value);
   value.value = projectStore.selectedLayer.matrix.toString();
   projectStore.makeLayersMatrixSizeUniform();
}
</script>

<style scoped lang="scss">
.matrix-navbar {
   background: v-bind("theme.cardColor");
   border: 1px solid v-bind("theme.dividerColor");
   border-left: none;
   border-right: none;
}

.matrix-area {
   background: v-bind("theme.bodyColor");
}

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
