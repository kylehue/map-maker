<template>
   <NTooltip placement="bottom" :delay="1000">
      <template #trigger>
         <div
            class="material relative flex flex-shrink-0 items-center justify-center p-2 rounded w-24 h-24"
            :tabindex="0"
            @click="() => projectStore.setSelectedMaterial(material)"
            @click.right="handleRightClick"
            :class="{
               selected: material === projectStore.selectedMaterial,
            }"
         >
            <img
               v-if="materialTransformedImg"
               :src="materialTransformedImg.src"
               loading="lazy"
               class="object-contain w-full h-full"
            />
            <NSpin v-else></NSpin>
            <span
               v-if="settingsStore.materialArea.showMatrixId"
               class="absolute font-bold matrix-id"
            >
               {{ material.matrixId }}
            </span>
         </div>
      </template>
      {{ material.name }}
   </NTooltip>
</template>

<script setup lang="ts">
import { useThemeVars, NTooltip, DropdownOption, NSpin } from "naive-ui";
import { useSettingsStore } from "../../store/settings";
import { useProjectStore } from "../../store/project";
import type { Material } from "../../types";
import { getTransformedMaterialImage } from "../../utils/material-utils";
import { computedAsync } from "@vueuse/core";
import { reactive } from "vue";
import { useMaterialManager } from "../../composables/use-material-manager";
import { useContextMenu } from "../../composables/use-context-menu";

const props = defineProps<{
   material: Material;
}>();

const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
const theme = useThemeVars();
const materialTransformedImg = computedAsync(
   () => {
      return getTransformedMaterialImage(
         props.material,
         props.material.image.width,
         props.material.image.height
      );
   },
   null,
   { lazy: true }
);

enum MaterialContextMenu {
   OPEN_IN_MANAGER,
   DUPLICATE,
   DELETE,
}

const contextMenuOptions: DropdownOption[] = [
   {
      label: "Open in Material Manager...",
      key: MaterialContextMenu.OPEN_IN_MANAGER,
   },
   {
      label: "Duplicate",
      key: MaterialContextMenu.DUPLICATE,
   },
   {
      label: "Delete",
      key: MaterialContextMenu.DELETE,
   },
];

function handleContextMenuSelect(e: MaterialContextMenu, hide: Function) {
   switch (e) {
      case MaterialContextMenu.OPEN_IN_MANAGER:
         useMaterialManager(props.material);
         break;
      case MaterialContextMenu.DUPLICATE:
         projectStore.duplicateMaterial(props.material);
         break;
      case MaterialContextMenu.DELETE:
         projectStore.deleteMaterial(props.material);
         break;
   }

   hide();
}

function handleRightClick(e: MouseEvent) {
   e.preventDefault();
   useContextMenu(
      contextMenuOptions,
      handleContextMenuSelect,
      e.pageX,
      e.pageY
   );
}
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
