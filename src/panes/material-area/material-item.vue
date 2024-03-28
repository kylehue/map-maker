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
               v-if="materialComputedModels.imageCanvasUrl.value"
               :src="materialComputedModels.imageCanvasUrl.value"
               loading="lazy"
               class="object-contain w-full h-full"
            />
            <span
               v-if="settingsStore.materialArea.showMatrixId"
               class="absolute font-bold matrix-id"
            >
               {{ materialComputedModels.matrixId.value }}
            </span>
         </div>
      </template>
      {{ materialComputedModels.name.value }}
   </NTooltip>
</template>

<script setup lang="ts">
import { useThemeVars, NTooltip, DropdownOption } from "naive-ui";
import { useSettingsStore } from "../../store/settings";
import { useProjectStore } from "../../store/project";
import { useMaterialManager } from "../../composables/use-material-manager";
import { useContextMenu } from "../../composables/use-context-menu";
import { Material } from "../../utils/Material";

const props = defineProps<{
   material: Material;
}>();

const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
const theme = useThemeVars();

const materialComputedModels = props.material.createComputedModels();

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
         handleDuplicateMaterial();
         break;
      case MaterialContextMenu.DELETE:
         handleDeleteMaterial();
         break;
   }

   hide();
}

async function handleDuplicateMaterial() {
   const duplicatedMaterial = await projectStore.duplicateMaterial(
      props.material
   );
   if (!duplicatedMaterial) return;
   projectStore.saveState(
      "material-duplicate",
      () => {
         projectStore.deleteMaterial(duplicatedMaterial);
      },
      () => {
         projectStore.restoreMaterial(duplicatedMaterial);
      }
   );
}

function handleDeleteMaterial() {
   const material = props.material;
   projectStore.deleteMaterial(material);
   projectStore.saveState(
      "material-delete",
      () => {
         projectStore.restoreMaterial(material);
      },
      () => {
         projectStore.deleteMaterial(material);
      }
   );
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
   }

   img {
      user-select: none !important;
      image-rendering: pixelated;
   }
}
</style>
