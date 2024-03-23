<template>
   <NCollapseItem :name="materialComputedModels.id.value">
      <template #header>
         <div class="flex items-center gap-2">
            <div class="relative flex items-center justify-center size-16">
               <img
                  v-if="materialComputedModels.imageCanvasUrl.value"
                  :src="materialComputedModels.imageCanvasUrl.value"
                  loading="lazy"
                  class="object-contain w-full h-full"
               />
               <NText class="matrix-id font-bold absolute shadow">
                  {{ materialComputedModels.matrixId.value }}
               </NText>
            </div>
            <NText>
               {{ materialComputedModels.name.value }}
            </NText>
         </div>
      </template>
      <template #header-extra>
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
      </template>
      <NDivider class="!mt-0" />
      <div class="flex justify-between px-12">
         <div class="flex flex-col gap-2">
            <div class="flex flex-col w-fit">
               <NText>Name</NText>
               <NInput
                  v-model:value="materialComputedModels.name.value"
                  class="min-w-[300px]"
               >
               </NInput>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Matrix ID</NText>
               <NInput
                  v-model:value="materialComputedModels.matrixId.value"
                  class="min-w-[300px]"
               >
               </NInput>
            </div>
         </div>
         <div class="flex flex-col gap-2">
            <div class="flex flex-col w-fit">
               <NText>Rotation</NText>
               <NSelect
                  :options="rotationOptions"
                  class="min-w-[300px]"
                  v-model:value="materialComputedModels.rotation.value"
               >
               </NSelect>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Position Origin</NText>
               <NSelect
                  :options="positionOriginOptions"
                  class="min-w-[300px]"
                  v-model:value="materialComputedModels.positionOrigin.value"
               >
               </NSelect>
            </div>
            <div class="flex flex-col">
               <NCheckbox
                  v-model:checked="
                     materialComputedModels.isHorizontallyFlipped.value
                  "
               >
                  Flip horizontally
               </NCheckbox>
               <NCheckbox
                  v-model:checked="
                     materialComputedModels.isVerticallyFlipped.value
                  "
               >
                  Flip vertically
               </NCheckbox>
            </div>
         </div>
         <div class="flex flex-col gap-2">
            <div class="relative size-32 flex items-center justify-center">
               <img
                  v-if="materialComputedModels.imageCanvasUrl.value"
                  :src="materialComputedModels.imageCanvasUrl.value"
                  loading="lazy"
                  class="object-contain w-full h-full"
               />
            </div>
            <div class="flex flex-col w-full">
               <NTooltip :disabled="!isTransformed">
                  <template #trigger>
                     <NButton
                        @click="useMaterialSplitter(props.material)"
                        :disabled="isTransformed"
                     >
                        Split Material
                     </NButton>
                  </template>
                  Splitting a transformed material is forbidden.
               </NTooltip>
            </div>
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
   NTooltip,
} from "naive-ui";
import { computed, ref, watch } from "vue";
import { SelectMixedOption } from "naive-ui/es/select/src/interface";
import { useProjectStore } from "../store/project";
import { useMaterialSplitter } from "../composables/use-material-splitter";
import { Material } from "../utils/Material";

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

const positionOriginOptions: SelectMixedOption[] = [
   {
      key: "top",
      value: "top",
      label: "top",
   },
   {
      key: "right",
      value: "right",
      label: "right",
   },
   {
      key: "bottom",
      value: "bottom",
      label: "bottom",
   },
   {
      key: "left",
      value: "left",
      label: "left",
   },
   {
      key: "center",
      value: "center",
      label: "center",
   },
];

const materialComputedModels = props.material.createComputedModels();

const isTransformed = computed(
   () =>
      materialComputedModels.isHorizontallyFlipped.value ||
      materialComputedModels.isVerticallyFlipped.value ||
      materialComputedModels.rotation.value != 0
);
</script>
