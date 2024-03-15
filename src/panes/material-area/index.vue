<template>
   <div ref="containerRef" class="flex flex-col w-full h-full">
      <template v-if="isDragAndDropping || !projectStore.materials.length">
         <NUpload
            multiple
            directory-dnd
            accept="image/*"
            class="w-full h-full"
            :on-change="handleFileUpload"
         >
            <NUploadDragger class="!border-none w-full h-full">
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
                  <NDivider />
                  <NAlert title="Warning" type="warning">
                     If you plan to save this project, ensure that you create a
                     dedicated folder to store all uploaded files, as we only
                     keep track of filepaths.
                  </NAlert>
               </div>
            </NUploadDragger>
         </NUpload>
      </template>
      <template v-else>
         <div
            class="material-navbar flex w-full h-8 flex-shrink-0 items-center"
         >
            <Navbar />
         </div>
         <div
            class="material-area flex flex-wrap flex-auto items-start p-2 overflow-auto"
         >
            <template v-for="material in projectStore.materials">
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
   NAlert,
   NDivider,
   useThemeVars,
   UploadProps,
} from "naive-ui";
import { onMounted, reactive, ref, watch } from "vue";
import { PhUpload } from "@phosphor-icons/vue";
import Navbar from "./navbar.vue";
import Material from "./material-item.vue";
import { useProjectStore } from "../../store/project";
type FileUploadData = Parameters<NonNullable<UploadProps["onChange"]>>[0];

const projectStore = useProjectStore();
const theme = useThemeVars();
const containerRef = ref<HTMLDivElement>();
const isDragAndDropping = ref(false);

function handleFileUpload(data: FileUploadData) {
   // TODO: add to materials
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
</style>../../components/material-item.vue
