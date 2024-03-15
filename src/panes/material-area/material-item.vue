<template>
   <NTooltip placement="bottom" :delay="1000">
      <template #trigger>
         <div
            class="material relative flex flex-shrink-0 items-center justify-center p-2 rounded w-24 h-24"
            :tabindex="0"
            @click="() => projectStore.setSelectedMaterial(material)"
            :class="{
               selected: material === projectStore.selectedMaterial,
            }"
         >
            <img
               :src="materialTransformedImg?.src"
               class="object-contain w-full h-full"
            />
            <span
               v-if="settingsStore.materialArea.showMatrixId"
               class="absolute text-xl font-bold mix-blend-difference"
            >
               {{ material.matrixId }}
            </span>
         </div>
      </template>
      {{ material.name }}
   </NTooltip>
</template>

<script setup lang="ts">
import { useThemeVars, NTooltip } from "naive-ui";
import { useSettingsStore } from "../../store/settings";
import { useProjectStore } from "../../store/project";
import type { Material } from "../../types";
import { getTransformedMaterialImage } from "../../utils/material-utils";
import { computedAsync } from "@vueuse/core";

const props = defineProps<{
   material: Material;
}>();

const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
const theme = useThemeVars();
const materialTransformedImg = computedAsync(() => {
   return getTransformedMaterialImage(
      props.material,
      props.material.image.width,
      props.material.image.height
   );
});
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
</style>
