<template>
   <div
      v-if="isMaterialManagerVisible"
      class="material-manager-container absolute z-30 w-screen h-screen flex items-center justify-center"
      @click.self="() => (isMaterialManagerVisible = false)"
   >
      <Transition name="bounce" appear>
         <NCard
            v-if="isMaterialManagerVisible"
            title="Material Manager"
            closable
            class="w-5/6 h-5/6 shadow-2xl"
            content-class="relative flex flex-col w-full h-full overflow-hidden"
            @close="() => (isMaterialManagerVisible = false)"
         >
            <div class="flex flex-row gap-2 w-full z-10">
               <NInput
                  placeholder="Search"
                  class="max-w-[300px]"
                  clearable
                  v-model:value="searchMaterialText"
               >
                  <template #prefix>
                     <NIcon>
                        <PhMagnifyingGlass />
                     </NIcon>
                  </template>
               </NInput>
               <NButton
                  v-if="!!focusedMaterial"
                  @click="() => (focusedMaterial = undefined)"
                  quaternary
               >
                  Browse Materials
               </NButton>
               <NUpload
                  multiple
                  directory-dnd
                  accept="image/*"
                  :on-change="handleFileUpload"
                  :show-file-list="false"
               >
                  <NButton secondary quaternary>
                     <template #icon>
                        <NIcon>
                           <PhUploadSimple />
                        </NIcon>
                     </template>
                     Load...
                  </NButton>
               </NUpload>
            </div>
            <div class="flex flex-col overflow-auto w-full h-full pt-16">
               <NCollapse
                  class="flex flex-col overflow-auto h-full px-4 pb-8"
                  :trigger-areas="['main', 'arrow']"
                  :expanded-names="focusedMaterial?.id"
               >
                  <template
                     v-for="material in materialsComputed"
                     :key="material.id"
                  >
                     <MaterialManagerItem :material="material">
                     </MaterialManagerItem>
                  </template>
               </NCollapse>
            </div>
         </NCard>
      </Transition>
   </div>
</template>

<script setup lang="ts">
import {
   NCard,
   NInput,
   NCollapse,
   NIcon,
   NButton,
   NUpload,
   UploadProps,
} from "naive-ui";
import {
   focusedMaterial,
   isMaterialManagerVisible,
} from "../composables/use-material-manager";
import { PhMagnifyingGlass, PhUploadSimple } from "@phosphor-icons/vue";
import MaterialManagerItem from "./material-manager-item.vue";
import { useProjectStore } from "../store/project";
import { computed, ref, watch } from "vue";

const projectStore = useProjectStore();
const searchMaterialText = ref("");

watch(searchMaterialText, () => {
   focusedMaterial.value = undefined;
});

const materialsComputed = computed(() => {
   if (focusedMaterial.value) {
      return projectStore.materials.filter(
         (v) => v.id === focusedMaterial.value?.id
      );
   }
   return projectStore.searchMaterial(searchMaterialText.value);
});

type FileUploadData = Parameters<NonNullable<UploadProps["onChange"]>>[0];
function handleFileUpload(data: FileUploadData) {
   if (!data.file.file) return;
   projectStore.createMaterial(data.file.file.name, data.file.file);
}
</script>

<style scoped lang="scss">
.material-manager-container {
   background-color: rgba(0, 0, 0, 0.5);
   pointer-events: all;
}
</style>
