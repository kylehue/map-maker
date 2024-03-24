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
         <NButton secondary type="tertiary" @click="handleDuplicateMaterial">
            Duplicate
         </NButton>
         <NButton secondary type="error" @click="handleDeleteMaterial">
            Delete
         </NButton>
      </template>
      <NDivider class="!mt-0" />
      <div class="flex justify-between px-12">
         <div class="flex flex-col gap-2">
            <div class="flex flex-col w-fit">
               <NText>Name</NText>
               <NInput
                  v-model:value="name"
                  class="min-w-[300px]"
                  @blur="handleMaterialRename"
               >
               </NInput>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Matrix ID</NText>
               <NInput
                  v-model:value="matrixId"
                  class="min-w-[300px]"
                  @blur="handleMaterialChangeMatrixId"
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
                  v-model:value="rotation"
                  @blur="handleMaterialChangeRotation"
               >
               </NSelect>
            </div>
            <div class="flex flex-col w-fit">
               <NText>Position Origin</NText>
               <NSelect
                  :options="positionOriginOptions"
                  class="min-w-[300px]"
                  v-model:value="positionOrigin"
                  @blur="handleMaterialChangePositionOrigin"
               >
               </NSelect>
            </div>
            <div class="flex flex-col">
               <NCheckbox
                  v-model:checked="isHorizontallyFlipped"
                  @blur="handleMaterialChangeHorizontallyFlipped"
               >
                  Flip horizontally
               </NCheckbox>
               <NCheckbox
                  v-model:checked="isVerticallyFlipped"
                  @blur="handleMaterialChangeVerticallyFlipped"
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
import { HistoryStateAction } from "../types";

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

// don't watch name/matrixId live to prevent history bulking
const name = ref(materialComputedModels.name.value);
const matrixId = ref(materialComputedModels.matrixId.value);
const positionOrigin = ref(materialComputedModels.positionOrigin.value);
const rotation = ref(materialComputedModels.rotation.value);
const isHorizontallyFlipped = ref(
   materialComputedModels.isHorizontallyFlipped.value
);
const isVerticallyFlipped = ref(
   materialComputedModels.isVerticallyFlipped.value
);

function handleDuplicateMaterial() {
   const duplicatedMaterial = projectStore.duplicateMaterial(props.material);
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
   const material = props.material;
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

function handleMaterialRename() {
   const oldName = materialComputedModels.name.value;
   const newName = name.value;
   if (oldName === newName) return;
   materialComputedModels.name.value = newName;
   projectStore.saveState(
      "material-name",
      () => {
         materialComputedModels.name.value = oldName;
      },
      () => {
         materialComputedModels.name.value = newName;
      }
   );
}

function handleMaterialChangeMatrixId() {
   const oldMatrixId = materialComputedModels.matrixId.value;
   const newMatrixId = matrixId.value;
   if (oldMatrixId === newMatrixId) return;
   materialComputedModels.matrixId.value = newMatrixId;
   projectStore.saveState(
      "material-matrix-id",
      () => {
         materialComputedModels.matrixId.value = oldMatrixId;
      },
      () => {
         materialComputedModels.matrixId.value = newMatrixId;
      }
   );
}

function handleMaterialChangePositionOrigin() {
   const oldPositionOrigin = materialComputedModels.positionOrigin.value;
   const newPositionOrigin = positionOrigin.value;
   if (oldPositionOrigin === newPositionOrigin) return;
   materialComputedModels.positionOrigin.value = newPositionOrigin;
   projectStore.saveState(
      "material-position-origin",
      () => {
         materialComputedModels.positionOrigin.value = oldPositionOrigin;
      },
      () => {
         materialComputedModels.positionOrigin.value = newPositionOrigin;
      }
   );
}

function handleMaterialChangeRotation() {
   const oldRotation = materialComputedModels.rotation.value;
   const newRotation = rotation.value;
   if (oldRotation === newRotation) return;
   projectStore.saveState(
      "material-rotate",
      () => {
         materialComputedModels.rotation.value = oldRotation;
      },
      () => {
         materialComputedModels.rotation.value = newRotation;
      }
   );
}

function handleMaterialChangeHorizontallyFlipped() {
   const oldHorizontallyFlipped =
      materialComputedModels.isHorizontallyFlipped.value;
   const newHorizontallyFlipped = isHorizontallyFlipped.value;
   if (oldHorizontallyFlipped === newHorizontallyFlipped) return;
   projectStore.saveState(
      "material-horizontal-flip",
      () => {
         materialComputedModels.isHorizontallyFlipped.value =
            oldHorizontallyFlipped;
      },
      () => {
         materialComputedModels.isHorizontallyFlipped.value =
            newHorizontallyFlipped;
      }
   );
}

function handleMaterialChangeVerticallyFlipped() {
   const oldVerticallyFlipped =
      materialComputedModels.isVerticallyFlipped.value;
   const newVerticallyFlipped = isVerticallyFlipped.value;
   if (oldVerticallyFlipped === newVerticallyFlipped) return;
   projectStore.saveState(
      "material-vertical-flip",
      () => {
         materialComputedModels.isVerticallyFlipped.value =
            oldVerticallyFlipped;
      },
      () => {
         materialComputedModels.isVerticallyFlipped.value =
            newVerticallyFlipped;
      }
   );
}
</script>
