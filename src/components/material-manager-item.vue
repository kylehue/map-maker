<template>
   <NCollapseItem>
      <template #header>
         <div class="flex gap-2 items-center justify-between w-full">
            <div class="start flex items-center gap-2">
               <div class="relative flex items-center justify-center size-16">
                  <img
                     :src="materialTransformedImg?.src"
                     class="object-contain w-full h-full"
                  />
                  <NText
                     class="text-2xl font-bold absolute mix-blend-difference"
                  >
                     {{ material.matrixId }}
                  </NText>
               </div>
               <NText>
                  {{ material.name }}
               </NText>
            </div>
            <div class="end flex items-center gap-1">
               <NButton
                  secondary
                  type="tertiary"
                  @click="projectStore.duplicateMaterial(material)"
               >
                  Duplicate
               </NButton>
               <NButton
                  secondary
                  type="error"
                  @click="projectStore.deleteMaterial(material)"
               >
                  Delete
               </NButton>
            </div>
         </div>
      </template>
      <NDivider class="!mt-0" />
      <div class="flex items-center justify-between px-12">
         <div class="flex flex-col px-6 gap-2">
            <div class="flex flex-col w-fit">
               <NText>Name</NText>
               <NInput v-model:value="material.name" class="min-w-[300px]">
               </NInput>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Matrix ID</NText>
               <NInput
                  v-model:value="material.matrixId"
                  class="min-w-[300px]"
               >
               </NInput>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Rotation</NText>
               <NSelect
                  :options="rotationOptions"
                  class="min-w-[300px]"
                  v-model:value="material.rotation"
               >
               </NSelect>
            </div>
            <NCheckbox v-model:checked="material.isHorizontallyFlipped">
               Flip horizontally
            </NCheckbox>
            <NCheckbox v-model:checked="material.isVerticallyFlipped">
               Flip vertically
            </NCheckbox>
         </div>
         <div class="relative size-32 flex items-center justify-center">
            <img
               :src="materialTransformedImg?.src"
               class="object-contain w-full h-full"
            />
         </div>
      </div>
   </NCollapseItem>
</template>

<script setup lang="ts">
import {
   NCollapseItem,
   NText,
   NButton,
   NCheckbox,
   NInput,
   NDivider,
   NSelect,
} from "naive-ui";
import type { Material } from "../types";
import { computedAsync } from "@vueuse/core";
import { getTransformedMaterialImage } from "../utils/material-utils";
import { SelectMixedOption } from "naive-ui/es/select/src/interface";
import { useProjectStore } from "../store/project";

const projectStore = useProjectStore();
const props = defineProps<{
   material: Material;
}>();

const rotationOptions: SelectMixedOption[] = [
   {
      key: 0,
      value: 0,
      label: "0°",
   },
   {
      key: 90,
      value: 90,
      label: "90°",
   },
   {
      key: 180,
      value: 180,
      label: "180°",
   },
   {
      key: -90,
      value: -90,
      label: "-90°",
   },
   {
      key: -180,
      value: -180,
      label: "-180°",
   },
];

const materialTransformedImg = computedAsync(() => {
   return getTransformedMaterialImage(
      props.material,
      props.material.image.width,
      props.material.image.height
   );
});
</script>
