<template>
   <div class="flex w-full h-full items-center justify-between px-4">
      <div class="flex items-center *:!text-xs">
         <NTooltip animated>
            <template #trigger>
               <NButton size="tiny" quaternary circle>
                  <template #icon>
                     <PhArrowCounterClockwise />
                  </template>
               </NButton>
            </template>
            Undo <span class="opacity-70">(Ctrl+Z)</span>
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton size="tiny" quaternary circle>
                  <template #icon>
                     <PhArrowClockwise />
                  </template>
               </NButton>
            </template>
            Redo <span class="opacity-70">(Ctrl+Shift+Z)</span>
         </NTooltip>
         <n-menu
            v-model:value="navActiveKey"
            mode="horizontal"
            :options="navOptions"
            responsive
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
               <NButton size="tiny" quaternary circle>
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
import { onMounted, ref } from "vue";
import {
   PhMagnifyingGlass,
   PhArrowsOutCardinal,
   PhCornersOut,
   PhArrowCounterClockwise,
   PhArrowClockwise,
} from "@phosphor-icons/vue";
import { map } from "../../utils/map";
import { designerStore } from "../../store/designer";

enum Navigation {
   DISPLAY_DROPDOWN,
   VIEW_DROPDOWN,
   SHOW_GRID,
   SHOW_MATRIX_POSITION,
   SHOW_MATERIAL,
   RESET_VIEW,
   CENTER_VIEW,
}

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
            label: "Show Grid",
         },
         {
            key: Navigation.SHOW_MATRIX_POSITION,
            label: "Show Matrix Position",
         },
         {
            key: Navigation.SHOW_MATERIAL,
            label: "Show Material",
         },
      ],
   },
];

const zoomViewportButton = ref();
function moveDesigner(x: number, y: number) {
   designerStore.position.x += -x * 2;
   designerStore.position.y += -y * 2;
}

function zoomDesigner(x: number, y: number) {
   designerStore.zoom += (-x - y) * 4;
}
</script>