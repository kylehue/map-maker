<template>
   <div class="flex w-full h-full items-center justify-between px-4">
      <div class="flex items-center">
         <NButton size="tiny" secondary @click="handleCreateLayer">
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
                  @click="handleDuplicateLayer"
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
                  @click="handleDeleteLayer"
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

function handleDeleteLayer() {
   const layer = projectStore.selectedLayer;
   if (!layer) return;
   if (layer.isLocked) {
      message.warning("This layer is locked!");
      return;
   }
   projectStore.deleteLayer(layer);
   projectStore.saveState(
      "layer-delete",
      () => {
         projectStore.restoreLayer(layer);
      },
      () => {
         projectStore.deleteLayer(layer);
      }
   );
}

function handleDuplicateLayer() {
   const layer = projectStore.selectedLayer;
   if (!layer) return;
   const duplicatedLayer = projectStore.duplicateLayer(layer);
   if (!duplicatedLayer) return;
   projectStore.saveState(
      "layer-duplicate",
      () => {
         projectStore.deleteLayer(duplicatedLayer);
      },
      () => {
         projectStore.restoreLayer(duplicatedLayer);
      }
   );
}

function handleCreateLayer() {
   const layer = projectStore.createLayer("new layer");
   projectStore.saveState(
      "layer-create",
      () => {
         projectStore.deleteLayer(layer);
      },
      () => {
         projectStore.restoreLayer(layer);
      }
   );
}

function handleMoveLayerUp() {
   const layer = projectStore.selectedLayer;
   if (!layer) return;
   if (layer.isLocked) {
      message.warning("This layer is locked!");
      return;
   }
   const oldIndex = projectStore.layers.indexOf(layer);
   projectStore.moveLayer(layer, -1);
   const newIndex = projectStore.layers.indexOf(layer);
   if (oldIndex === newIndex) return;
   projectStore.saveState(
      "layer-move-up",
      () => {
         projectStore.moveLayer(layer, 1);
      },
      () => {
         projectStore.moveLayer(layer, -1);
      }
   );
}

function handleMoveLayerDown() {
   const layer = projectStore.selectedLayer;
   if (!layer) return;
   if (layer.isLocked) {
      message.warning("This layer is locked!");
      return;
   }
   const oldIndex = projectStore.layers.indexOf(layer);
   projectStore.moveLayer(layer, 1);
   const newIndex = projectStore.layers.indexOf(layer);
   if (oldIndex === newIndex) return;
   projectStore.saveState(
      "layer-move-down",
      () => {
         projectStore.moveLayer(layer, -1);
      },
      () => {
         projectStore.moveLayer(layer, 1);
      }
   );
}
</script>
