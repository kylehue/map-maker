<template>
   <NCollapseItem :name="material.id">
      <template #header>
         <div class="flex items-center gap-2">
            <div class="relative flex items-center justify-center size-16">
               <img
                  v-if="materialTransformedImg"
                  :src="materialTransformedImg"
                  loading="lazy"
                  class="object-contain w-full h-full"
               />
               <NText class="matrix-id font-bold absolute shadow">
                  {{ material.matrixId }}
               </NText>
            </div>
            <NText>
               {{ material.name }}
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
      <div class="flex items-center justify-between px-12">
         <div class="flex flex-col px-6 gap-2">
            <div class="flex flex-col w-fit">
               <NText>Name</NText>
               <NInput v-model:value="material.name" class="min-w-[300px]">
               </NInput>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Matrix ID</NText>
               <NInput v-model:value="material.matrixId" class="min-w-[300px]">
               </NInput>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Rotation</NText>
               <NSelect
                  :options="rotationOptions"
                  class="min-w-[300px]"
                  v-model:value="rotation"
               >
               </NSelect>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Position Origin</NText>
               <NSelect
                  :options="positionOriginOptions"
                  class="min-w-[300px]"
                  v-model:value="material.positionOrigin"
               >
               </NSelect>
            </div>
            <div class="flex flex-col">
               <NCheckbox v-model:checked="isHorizontallyFlipped">
                  Flip horizontally
               </NCheckbox>
               <NCheckbox v-model:checked="isVerticallyFlipped">
                  Flip vertically
               </NCheckbox>
            </div>
         </div>
         <div class="relative size-32 flex items-center justify-center">
            <img
               v-if="materialTransformedImg"
               :src="materialTransformedImg"
               loading="lazy"
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
import type { Material, MaterialRotation } from "../types";
import { computed, ref, watch } from "vue";
import { SelectMixedOption } from "naive-ui/es/select/src/interface";
import { useProjectStore } from "../store/project";

const projectStore = useProjectStore();
const props = defineProps<{
   material: Material;
}>();

const materialTransformedImg = computed(() => {
   return props.material.texture.getImageCanvasURL();
});

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

const isHorizontallyFlipped = ref(false);
const isVerticallyFlipped = ref(false);
const rotation = ref<MaterialRotation>(0);

watch(isHorizontallyFlipped, (v) => {
   props.material.texture.setHorizontallyFlipped(v);
});

watch(isVerticallyFlipped, (v) => {
   props.material.texture.setVerticallyFlipped(v);
});

watch(rotation, (v) => {
   props.material.texture.setRotation(v);
});
</script>
