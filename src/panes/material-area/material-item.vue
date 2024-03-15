<template>
   <div
      class="material relative flex flex-shrink-0 items-center justify-center p-2 rounded w-24 h-24"
      :tabindex="0"
      @click="() => projectStore.setSelectedMaterial(material)"
      :class="{
         selected: material === projectStore.selectedMaterial,
      }"
   >
      <img :src="material.imageSrc" class="object-contain w-full h-full" />
      <span
         v-if="settingsStore.materialArea.showMatrixId"
         class="matrix-id absolute text-xl font-bold"
      >
         {{ material.matrixId }}
      </span>
   </div>
</template>

<script setup lang="ts">
import { useThemeVars } from "naive-ui";
import { useSettingsStore } from "../../store/settings";
import { useProjectStore } from "../../store/project";
import type { Material } from "../../types";

const props = defineProps<{
   material: Material;
}>();

const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
const theme = useThemeVars();
</script>

<style scoped lang="scss">
.material {
   border: none;
   outline: none;
   cursor: pointer;
   transition: background 200ms;
   &:hover {
      background: v-bind("theme.buttonColor2Hover") !important;
   }

   &.selected {
      background: v-bind("theme.buttonColor2Pressed");
      opacity: 0.7;
   }

   img {
      user-select: none !important;
   }
}

.matrix-id {
   mix-blend-mode: overlay;
}
</style>