<template>
   <div class="flex w-full h-full items-center justify-between px-4">
      <div class="flex items-center gap-1">
         <NUpload
            multiple
            directory-dnd
            accept="image/*"
            :on-change="handleFileUpload"
            class="flex items-center"
         >
            <NButton size="tiny" secondary>
               <template #icon>
                  <NIcon>
                     <PhUploadSimple />
                  </NIcon>
               </template>
               Load...
            </NButton>
         </NUpload>
         <NButton size="tiny" secondary @click="() => useMaterialManager()">
            <template #icon>
               <NIcon>
                  <PhGearSix />
               </NIcon>
            </template>
            Manager...
         </NButton>
      </div>
      <div class="flex items-center">
         <NTooltip animated>
            <template #trigger>
               <NButton
                  size="tiny"
                  quaternary
                  circle
                  @click="toggleShowMatrixId"
               >
                  <template #icon>
                     <PhBracketsSquare />
                  </template>
               </NButton>
            </template>
            Show/Hide Matrix IDs
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton
                  size="tiny"
                  quaternary
                  circle
                  :disabled="!projectStore.selectedMaterial"
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
                  :disabled="!projectStore.selectedMaterial"
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
import { NButton, NTooltip, NIcon, NUpload, UploadProps } from "naive-ui";
import {
   PhTrashSimple,
   PhCopy,
   PhGearSix,
   PhUploadSimple,
   PhBracketsSquare,
} from "@phosphor-icons/vue";
import { useMaterialManager } from "../../composables/use-material-manager";
import { useProjectStore } from "../../store/project";
import { useSettingsStore } from "../../store/settings";

type FileUploadData = Parameters<NonNullable<UploadProps["onChange"]>>[0];

const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
function handleFileUpload(data: FileUploadData) {
   // TODO: add to materials
}

function toggleShowMatrixId() {
   settingsStore.materialArea.showMatrixId =
      !settingsStore.materialArea.showMatrixId;
}
</script>
