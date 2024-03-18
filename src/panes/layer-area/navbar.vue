<template>
   <div class="flex w-full h-full items-center justify-between px-4">
      <div class="flex items-center">
         <NButton
            size="tiny"
            secondary
            @click="projectStore.createLayer('new layer')"
         >
            <template #icon>
               <NIcon>
                  <PhStackSimple />
               </NIcon>
            </template>
            New Layer
         </NButton>
      </div>
      <div class="flex items-center">
         <NTooltip animated>
            <template #trigger>
               <NButton
                  size="tiny"
                  quaternary
                  circle
                  :disabled="!projectStore.selectedLayer"
                  @click="handleMoveLayerUp"
               >
                  <template #icon>
                     <PhCaretUp />
                  </template>
               </NButton>
            </template>
            Move Up
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton
                  size="tiny"
                  quaternary
                  circle
                  :disabled="!projectStore.selectedLayer"
                  @click="handleMoveLayerDown"
               >
                  <template #icon>
                     <PhCaretDown />
                  </template>
               </NButton>
            </template>
            Move Down
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton
                  size="tiny"
                  quaternary
                  circle
                  :disabled="!projectStore.selectedLayer"
                  @click="
                     () => projectStore.selectedLayer!.isLocked = !projectStore.selectedLayer!.isLocked
                  "
               >
                  <template #icon>
                     <PhLockSimple />
                  </template>
               </NButton>
            </template>
            Lock
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton
                  size="tiny"
                  quaternary
                  circle
                  :disabled="!projectStore.selectedLayer"
                  @click="
                     () => projectStore.duplicateLayer(projectStore.selectedLayer!)
                  "
               >
                  <template #icon>
                     <PhCopy />
                  </template>
               </NButton>
            </template>
            Duplicate
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton
                  size="tiny"
                  quaternary
                  circle
                  :disabled="!projectStore.selectedLayer"
                  @click="
                     () => projectStore.deleteLayer(projectStore.selectedLayer!)
                  "
               >
                  <template #icon>
                     <PhTrashSimple />
                  </template>
               </NButton>
            </template>
            Delete
         </NTooltip>
      </div>
   </div>
</template>

<script setup lang="ts">
import { NButton, NTooltip, NIcon, useMessage } from "naive-ui";
import {
   PhStackSimple,
   PhLockSimple,
   PhTrashSimple,
   PhCopy,
   PhCaretUp,
   PhCaretDown,
} from "@phosphor-icons/vue";
import { useProjectStore } from "../../store/project";
const projectStore = useProjectStore();
const message = useMessage();

function handleMoveLayerUp() {
   if (projectStore.selectedLayer?.isLocked) {
      message.warning("This layer is locked!");
      return;
   }
   projectStore.moveLayer(projectStore.selectedLayer!, -1);
}

function handleMoveLayerDown() {
   if (projectStore.selectedLayer?.isLocked) {
      message.warning("This layer is locked!");
      return;
   }
   projectStore.moveLayer(projectStore.selectedLayer!, 1);
}
</script>
