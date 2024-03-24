<template>
   <div class="flex w-full h-full items-center justify-between px-4">
      <div class="flex items-center *:!text-xs">
         <NTooltip animated>
            <template #trigger>
               <NButton
                  v-show="!designerStore.isFullScreen"
                  size="tiny"
                  quaternary
                  circle
                  @click="projectStore.undoState()"
               >
                  <template #icon>
                     <PhArrowCounterClockwise />
                  </template>
               </NButton>
            </template>
            Undo <span class="opacity-70">(Ctrl+Z)</span>
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton
                  v-show="!designerStore.isFullScreen"
                  size="tiny"
                  quaternary
                  circle
                  @click="projectStore.redoState()"
               >
                  <template #icon>
                     <PhArrowClockwise />
                  </template>
               </NButton>
            </template>
            Redo <span class="opacity-70">(Ctrl+Shift+Z)</span>
         </NTooltip>
         <n-menu
            v-if="!designerStore.isFullScreen"
            v-model:value="navActiveKey"
            mode="horizontal"
            :options="navOptions"
            responsive
            dropdown-placement="top-start"
            :dropdown-props="{
               arrowPointToCenter: true,
               showArrow: true,
            }"
            :inverted="false"
         />
      </div>
      <div class="flex items-center">
         <NTooltip animated>
            <template #trigger>
               <NButton
                  v-drag-slider="moveDesigner"
                  size="tiny"
                  quaternary
                  circle
               >
                  <template #icon>
                     <PhArrowsOutCardinal />
                  </template>
               </NButton>
            </template>
            Move Viewport
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton
                  v-drag-slider="zoomDesigner"
                  ref="zoomViewportButton"
                  size="tiny"
                  quaternary
                  circle
               >
                  <template #icon>
                     <PhMagnifyingGlass />
                  </template>
               </NButton>
            </template>
            Zoom Viewport
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton
                  size="tiny"
                  quaternary
                  circle
                  @click="
                     designerStore.setFullScreen(!designerStore.isFullScreen)
                  "
               >
                  <template #icon>
                     <PhCornersOut />
                  </template>
               </NButton>
            </template>
            Fullscreen
         </NTooltip>
      </div>
   </div>
</template>

<script setup lang="ts">
import { NMenu, NButton, NTooltip, MenuOption } from "naive-ui";
import { onMounted, ref, watch } from "vue";
import {
   PhMagnifyingGlass,
   PhArrowsOutCardinal,
   PhCornersOut,
   PhArrowCounterClockwise,
   PhArrowClockwise,
} from "@phosphor-icons/vue";
import { useDesignerStore } from "../../store/designer";
import { useSettingsStore } from "../../store/settings";
import { useProjectStore } from "../../store/project";

enum Navigation {
   DISPLAY_DROPDOWN,
   VIEW_DROPDOWN,
   SHOW_GRID,
   SHOW_MATRIX_ID,
   SHOW_MATERIAL,
   SHOW_MAP_BOUNDS,
   RESET_VIEW,
   CENTER_VIEW,
}

const projectStore = useProjectStore();
const settingsStore = useSettingsStore();
const designerStore = useDesignerStore();

(window as any).projectStore = projectStore;
const zoomViewportButton = ref();
const navActiveKey = ref<Navigation>();
const navOptions: MenuOption[] = [
   {
      key: Navigation.VIEW_DROPDOWN,
      label: "View",
      children: [
         {
            key: Navigation.RESET_VIEW,
            label: "Reset View",
         },
         {
            key: Navigation.CENTER_VIEW,
            label: "Center View",
         },
      ],
   },
   {
      key: Navigation.DISPLAY_DROPDOWN,
      label: "Display",
      children: [
         {
            key: Navigation.SHOW_GRID,
            label: () =>
               `${settingsStore.designerArea.showGrid ? "Hide" : "Show"} Grid`,
         },
         {
            key: Navigation.SHOW_MATRIX_ID,
            label: () =>
               `${
                  settingsStore.designerArea.showMatrixId ? "Hide" : "Show"
               } Matrix ID`,
         },
         {
            key: Navigation.SHOW_MATERIAL,
            label: () =>
               `${
                  settingsStore.designerArea.showMaterial ? "Hide" : "Show"
               } Material`,
         },
         {
            key: Navigation.SHOW_MAP_BOUNDS,
            label: () =>
               `${
                  settingsStore.designerArea.showMapBounds ? "Hide" : "Show"
               } Map Bounds`,
         },
      ],
   },
];

function moveDesigner(x: number, y: number) {
   designerStore.move(-x, -y);
}

function zoomDesigner(x: number, y: number) {
   designerStore.addZoom(-(x + y) * 4);
}

watch(navActiveKey, (e) => {
   if (e == undefined) return;
   switch (e) {
      case Navigation.SHOW_GRID:
         settingsStore.designerArea.showGrid =
            !settingsStore.designerArea.showGrid;
         break;
      case Navigation.SHOW_MATERIAL:
         settingsStore.designerArea.showMaterial =
            !settingsStore.designerArea.showMaterial;
         break;
      case Navigation.SHOW_MAP_BOUNDS:
         settingsStore.designerArea.showMapBounds =
            !settingsStore.designerArea.showMapBounds;
         break;
      case Navigation.SHOW_MATRIX_ID:
         settingsStore.designerArea.showMatrixId =
            !settingsStore.designerArea.showMatrixId;
         break;
      case Navigation.CENTER_VIEW:
         designerStore.centerView();
         break;
      case Navigation.RESET_VIEW:
         designerStore.resetView();
         break;
   }

   navActiveKey.value = undefined;
});
</script>
