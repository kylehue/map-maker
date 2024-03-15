<template>
   <div ref="containerRef" class="flex flex-col w-full h-full">
      <template v-if="isDragAndDropping || !projectStore.materials.length">
         <NUpload
            multiple
            directory-dnd
            accept="image/*"
            class="w-full h-full"
            :on-change="handleFileUpload"
            :show-file-list="false"
         >
            <NUploadDragger
               class="!border-none w-full h-full flex items-center justify-center"
            >
               <div class="flex flex-col items-center">
                  <NIcon size="48" :depth="3" class="mb-4">
                     <PhUpload />
                  </NIcon>
                  <NText style="font-size: 16px">
                     Click or drag a file to this area to upload
                  </NText>
                  <NP depth="3" style="margin: 8px 0 0 0">
                     Use this space to keep your tilesheets, tiles, or any other
                     images you wish to utilize.
                  </NP>
               </div>
            </NUploadDragger>
         </NUpload>
      </template>
      <template v-else>
         <div class="material-navbar flex w-full flex-shrink-0 items-center">
            <Navbar @search="(e) => (searchMaterialText = e)" />
         </div>
         <div
            class="material-area flex flex-wrap flex-auto items-start p-2 overflow-auto"
            @click.self.right="handleRightClick"
         >
            <template v-for="material in materialsComputed" :key="material.id">
               <Material :material="material"></Material>
            </template>
         </div>
      </template>
   </div>
</template>

<script setup lang="ts">
import {
   NP,
   NText,
   NUpload,
   NUploadDragger,
   NIcon,
   NDivider,
   useThemeVars,
   UploadProps,
   DropdownOption,
} from "naive-ui";
import { onMounted, computed, ref } from "vue";
import { PhUpload } from "@phosphor-icons/vue";
import Navbar from "./navbar.vue";
import Material from "./material-item.vue";
import { useProjectStore } from "../../store/project";
import { loadImage } from "../../utils/material-utils";
import { useMaterialManager } from "../../composables/use-material-manager";
import { useSettingsStore } from "../../store/settings";
import { useContextMenu } from "../../composables/use-context-menu";
type FileUploadData = Parameters<NonNullable<UploadProps["onChange"]>>[0];

const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
const theme = useThemeVars();
const containerRef = ref<HTMLDivElement>();
const isDragAndDropping = ref(false);
const searchMaterialText = ref("");
const materialsComputed = computed(() =>
   projectStore.searchMaterial(searchMaterialText.value)
);

enum MaterialContextMenu {
   OPEN_MANAGER,
   TOGGLE_MATRIX_ID,
}

const contextMenuOptions: DropdownOption[] = [
   {
      label: "Open Material Manager...",
      key: MaterialContextMenu.OPEN_MANAGER,
   },
   {
      label: () => {
         return `${
            settingsStore.materialArea.showMatrixId ? "Hide" : "Show"
         } Matrix IDs`;
      },
      key: MaterialContextMenu.TOGGLE_MATRIX_ID,
   },
];

function handleContextMenuSelect(e: MaterialContextMenu, hide: Function) {
   switch (e) {
      case MaterialContextMenu.OPEN_MANAGER:
         useMaterialManager();
         break;
      case MaterialContextMenu.TOGGLE_MATRIX_ID:
         settingsStore.materialArea.showMatrixId =
            !settingsStore.materialArea.showMatrixId;
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

function handleFileUpload(data: FileUploadData) {
   if (!data.file.fullPath) return;
   const url = URL.createObjectURL(data.file.file!);
   loadImage(url).then((e) => {
      projectStore.createMaterial(data.file.fullPath!, e);
   });
}

onMounted(() => {
   containerRef.value?.addEventListener("dragenter", (e) => {
      isDragAndDropping.value = true;
   });
});

addEventListener("dragleave", () => {
   isDragAndDropping.value = false;
});

addEventListener("dragend", () => {
   isDragAndDropping.value = false;
});

addEventListener("drop", () => {
   isDragAndDropping.value = false;
});
</script>

<style scoped lang="scss">
:deep(.n-upload-trigger) {
   width: 100%;
   height: 100%;
}

.material-navbar {
   background: v-bind("theme.cardColor");
   border: 1px solid v-bind("theme.dividerColor");
   border-left: none;
   border-right: none;
}

.material-area {
   background: v-bind("theme.cardColor");
}
</style>
