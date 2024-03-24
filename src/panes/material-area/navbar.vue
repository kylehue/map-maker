<template>
   <div class="flex flex-col w-full gap-1 py-2 px-4">
      <div class="flex w-full h-full items-center justify-between">
         <div class="flex items-center gap-1">
            <NUpload
               multiple
               directory-dnd
               accept="image/*"
               :on-change="handleFileUpload"
               class="flex items-center"
               :show-file-list="false"
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
                     @click="handleDuplicateMaterial"
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
                     @click="handleDeleteMaterial"
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
      <NInput
         size="small"
         placeholder="Search Material"
         @update-value="$emit('search', $event)"
         clearable
      >
         <template #prefix>
            <NIcon>
               <PhMagnifyingGlass />
            </NIcon>
         </template>
      </NInput>
   </div>
</template>

<script setup lang="ts">
import {
   NButton,
   NTooltip,
   NIcon,
   NUpload,
   UploadProps,
   NInput,
} from "naive-ui";
import {
   PhTrashSimple,
   PhCopy,
   PhGearSix,
   PhUploadSimple,
   PhBracketsSquare,
   PhMagnifyingGlass,
} from "@phosphor-icons/vue";
import { useMaterialManager } from "../../composables/use-material-manager";
import { useProjectStore } from "../../store/project";
import { useSettingsStore } from "../../store/settings";

type FileUploadData = Parameters<NonNullable<UploadProps["onChange"]>>[0];

const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
async function handleFileUpload(data: FileUploadData) {
   if (!data.file.file) return;
   const material = await projectStore.createMaterial(
      data.file.file.name,
      data.file.file
   );
   projectStore.saveState(
      "material-upload",
      () => {
         projectStore.deleteMaterial(material);
      },
      () => {
         projectStore.restoreMaterial(material);
      }
   );
}

function toggleShowMatrixId() {
   settingsStore.materialArea.showMatrixId =
      !settingsStore.materialArea.showMatrixId;
}

function handleDuplicateMaterial() {
   const material = projectStore.selectedMaterial;
   if (!material) return;
   const duplicatedMaterial = projectStore.duplicateMaterial(material);
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
   const material = projectStore.selectedMaterial;
   if (!material) return;
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
</script>
