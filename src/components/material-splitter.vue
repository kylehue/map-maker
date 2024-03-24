<template>
   <div
      v-if="isMaterialSplitterVisible"
      class="material-manager-container absolute z-40 w-screen h-screen flex items-center justify-center"
   >
      <div
         class="material-manager-mask absolute w-screen h-screen"
         @click.self="() => (isMaterialSplitterVisible = false)"
      ></div>
      <Transition name="bounce" appear>
         <NCard
            v-if="isMaterialSplitterVisible"
            closable
            title="Split Material"
            class="w-fit h-5/6 shadow-2xl"
            content-class="relative flex flex-col w-full h-full overflow-hidden"
            @close="() => (isMaterialSplitterVisible = false)"
         >
            <div class="flex items-center gap-4 overflow-auto">
               <div class="flex relative">
                  <div class="cropper" v-if="data.isCroppingInputEnabled">
                     <span
                        class="top-left"
                        @mousedown="
                           () => {
                              croppersState.isMouseDown = true;
                              croppersState.side = 'topLeft';
                           }
                        "
                     ></span>
                     <span
                        class="top-right"
                        @mousedown="
                           () => {
                              croppersState.isMouseDown = true;
                              croppersState.side = 'topRight';
                           }
                        "
                     ></span>
                     <span
                        class="bottom-left"
                        @mousedown="
                           () => {
                              croppersState.isMouseDown = true;
                              croppersState.side = 'bottomLeft';
                           }
                        "
                     ></span>
                     <span
                        class="bottom-right"
                        @mousedown="
                           () => {
                              croppersState.isMouseDown = true;
                              croppersState.side = 'bottomRight';
                           }
                        "
                     ></span>
                  </div>
                  <canvas
                     ref="canvasRef"
                     :width="computedCanvasSize.width"
                     :height="computedCanvasSize.height"
                  ></canvas>
               </div>
               <div class="flex flex-col w-full h-full overflow-hidden">
                  <div
                     class="flex flex-col gap-4 overflow-auto px-4 max-w-[250px]"
                  >
                     <div class="flex flex-col w-full">
                        <NText>Split</NText>
                        <div class="flex flex-col gap-1">
                           <NInputNumber
                              v-model:value="data.split.width"
                              placeholder=""
                              :precision="0"
                              :min="0"
                              :max="computedMaterialSize.width"
                           >
                              <template #prefix>
                                 <NText :depth="3">width:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="data.split.height"
                              placeholder=""
                              :precision="0"
                              :min="0"
                              :max="computedMaterialSize.height"
                           >
                              <template #prefix>
                                 <NText :depth="3">height:</NText>
                              </template>
                           </NInputNumber>
                        </div>
                     </div>
                     <NDivider class="!m-0"></NDivider>
                     <div class="flex flex-col w-full">
                        <NCheckbox
                           v-model:checked="data.isCroppingInputEnabled"
                        >
                           Crop Input
                        </NCheckbox>
                        <div class="flex flex-col gap-1">
                           <NInputNumber
                              v-model:value="cropModel.x.value"
                              placeholder=""
                              :disabled="!data.isCroppingInputEnabled"
                              :min="0"
                              :max="computedMaterialSize.width"
                              :precision="0"
                           >
                              <template #prefix>
                                 <NText :depth="3">x:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="cropModel.y.value"
                              placeholder=""
                              :disabled="!data.isCroppingInputEnabled"
                              :min="0"
                              :max="computedMaterialSize.height"
                              :precision="0"
                           >
                              <template #prefix>
                                 <NText :depth="3">y:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="cropModel.width.value"
                              placeholder=""
                              :disabled="!data.isCroppingInputEnabled"
                              :min="0"
                              :max="
                                 computedMaterialSize.width - computedCropData.x
                              "
                              :precision="0"
                           >
                              <template #prefix>
                                 <NText :depth="3">width:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="cropModel.height.value"
                              placeholder=""
                              :disabled="!data.isCroppingInputEnabled"
                              :min="0"
                              :max="
                                 computedMaterialSize.height -
                                 computedCropData.y
                              "
                              :precision="0"
                           >
                              <template #prefix>
                                 <NText :depth="3">height:</NText>
                              </template>
                           </NInputNumber>
                        </div>
                     </div>
                     <NDivider class="!m-0"></NDivider>
                     <div class="flex flex-col w-full">
                        <NCheckbox
                           v-model:checked="data.isResizingOutputsEnabled"
                        >
                           Resize Split Outputs
                        </NCheckbox>
                        <div class="flex flex-col gap-1">
                           <NInputNumber
                              v-model:value="data.resizeOutput.width"
                              placeholder=""
                              :disabled="!data.isResizingOutputsEnabled"
                              :precision="0"
                           >
                              <template #prefix>
                                 <NText :depth="3">width:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="data.resizeOutput.height"
                              placeholder=""
                              :disabled="!data.isResizingOutputsEnabled"
                              :precision="0"
                           >
                              <template #prefix>
                                 <NText :depth="3">height:</NText>
                              </template>
                           </NInputNumber>
                        </div>
                     </div>
                     <NDivider class="!m-0"></NDivider>
                     <div class="flex flex-col w-full">
                        <NText> Load/Save settings </NText>
                        <div class="flex flex-col gap-1">
                           <NSelect
                              :options="splitSettingsOptions"
                              @update:value="handleLoadSettings"
                              v-model:value="selectedSplitSettingsOption"
                              placeholder="Load settings..."
                              filterable
                           >
                              <template #action>
                                 <NButton
                                    v-if="!!selectedSplitSettingsOption"
                                    quaternary
                                    type="error"
                                    class="w-full"
                                    @click="handleDeleteSettings"
                                 >
                                    <template #icon>
                                       <PhTrashSimple></PhTrashSimple>
                                    </template>
                                    Delete Selected
                                 </NButton>
                              </template>
                           </NSelect>
                           <NInput
                              v-model:value="data.settingsName"
                              placeholder="Save as..."
                              clearable
                           >
                              <template #suffix>
                                 <NButton
                                    size="tiny"
                                    quaternary
                                    @click="handleSaveSettings"
                                    >Save</NButton
                                 >
                              </template>
                           </NInput>
                        </div>
                     </div>
                     <NDivider class="!m-0"></NDivider>
                     <div class="flex flex-col gap-1 w-full">
                        <NCheckbox v-model:checked="data.deleteOriginal">
                           Delete original
                        </NCheckbox>
                        <NButton
                           class="w-full"
                           @click="handleSplit"
                           :loading="data.isLoadingSplit"
                        >
                           Split
                        </NButton>
                     </div>
                  </div>
               </div>
            </div>
         </NCard>
      </Transition>
   </div>
</template>

<script setup lang="ts">
import {
   NCard,
   NText,
   NButton,
   NCheckbox,
   NInput,
   NInputNumber,
   NDivider,
   NSelect,
   useThemeVars,
   useMessage,
   useDialog,
   NP,
} from "naive-ui";
import { SelectMixedOption } from "naive-ui/es/select/src/interface";
import { computed, h, reactive, ref, watch } from "vue";
import { PhTrashSimple } from "@phosphor-icons/vue";
import {
   isMaterialSplitterVisible,
   materialToSplit,
} from "../composables/use-material-splitter";
import { useProjectStore } from "../store/project";
import { clamp } from "../utils/clamp";
import MaterialWorker from "../worker/material-worker?worker";
import { postAsync } from "../utils/worker-utils";
import { MaterialSplitJobData } from "../types";
import { useWindowSize } from "@vueuse/core";
import { SplittedMaterials } from "../worker/material-worker";

const materialWorker = new MaterialWorker();
const projectStore = useProjectStore();
const theme = useThemeVars();
const message = useMessage();
const dialog = useDialog();
const { width: innerWidth, height: innerHeight } = useWindowSize();
const canvasRef = ref<HTMLCanvasElement>();
const ctxRef = ref<CanvasRenderingContext2D>();

const cropperSize = ref(25);
const croppersState = reactive({
   isMouseDown: false,
   side: "topLeft" as "topLeft" | "topRight" | "bottomLeft" | "bottomRight",
});

const data = reactive({
   split: {
      width: 32,
      height: 32,
   },
   cropInput: {
      topLeft: {
         x: 0,
         y: 0,
      },
      topRight: {
         x: 0,
         y: 0,
      },
      bottomLeft: {
         x: 0,
         y: 0,
      },
      bottomRight: {
         x: 0,
         y: 0,
      },
   },
   resizeOutput: {
      width: 0,
      height: 0,
   },
   deleteOriginal: true,
   settingsName: "",
   isResizingOutputsEnabled: false,
   isCroppingInputEnabled: false,
   isLoadingSplit: false,
});

const cropModel = {
   x: computed({
      get() {
         return data.cropInput.topLeft.x;
      },
      set(x: number) {
         x = parseInt(x.toFixed());
         data.cropInput.topLeft.x = x;
         fixCropperSides("topLeft");
      },
   }),
   y: computed({
      get() {
         return data.cropInput.topLeft.y;
      },
      set(y: number) {
         y = parseInt(y.toFixed());
         data.cropInput.topLeft.y = y;
         fixCropperSides("topLeft");
      },
   }),
   width: computed({
      get() {
         return data.cropInput.topRight.x - data.cropInput.topLeft.x;
      },
      set(width: number) {
         width = parseInt(width.toFixed());
         data.cropInput.topRight.x = data.cropInput.topLeft.x + width;
         fixCropperSides("topRight");
      },
   }),
   height: computed({
      get() {
         return data.cropInput.bottomLeft.y - data.cropInput.topLeft.y;
      },
      set(height: number) {
         height = parseInt(height.toFixed());
         data.cropInput.bottomLeft.y = data.cropInput.topLeft.y + height;
         fixCropperSides("bottomLeft");
      },
   }),
};

const computedCanvasSize = computed(() => {
   const imgSize = computedMaterialSize.value;
   const maxWidth = innerWidth.value * 0.6;
   const maxHeight = innerHeight.value * 0.6;
   const ratio = Math.min(maxWidth / imgSize.width, maxHeight / imgSize.height);
   return { width: imgSize.width * ratio, height: imgSize.height * ratio };
});

const computedMaterialSize = computed(() => {
   const result = {
      width: 0,
      height: 0,
   };
   const material = materialToSplit.value;
   if (!material) return result;
   const materialImg = material.getTexture().getOrigImageCanvas();
   result.width = materialImg.width;
   result.height = materialImg.height;
   return result;
});

const computedSizeRatio = computed(() => {
   const result = {
      width: 0,
      height: 0,
   };
   const canvas = canvasRef.value;
   if (!canvas) return result;
   result.width = canvas.width / computedMaterialSize.value.width;
   result.height = canvas.height / computedMaterialSize.value.height;
   return result;
});

const computedCropData = computed(() => {
   const result = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      scaledX: 0,
      scaledY: 0,
      scaledWidth: 0,
      scaledHeight: 0,
   };

   const scaledWidthRatio = computedSizeRatio.value.width;
   const scaledHeightRatio = computedSizeRatio.value.height;
   result.x = data.cropInput.topLeft.x ?? 0;
   result.y = data.cropInput.topLeft.y ?? 0;
   result.width =
      data.cropInput.topRight.x - data.cropInput.topLeft.x ??
      computedMaterialSize.value.width;
   result.height =
      data.cropInput.bottomLeft.y - data.cropInput.topLeft.y ??
      computedMaterialSize.value.height;
   result.scaledX = result.x * scaledWidthRatio;
   result.scaledY = result.y * scaledHeightRatio;
   result.scaledWidth = result.width * scaledWidthRatio;
   result.scaledHeight = result.height * scaledHeightRatio;
   return result;
});

const splitSettingsOptions = computed(() => {
   const r: SelectMixedOption[] = Object.keys(
      projectStore.savedMaterialSplitSettings
   ).map((v) => ({
      key: v,
      value: v,
      label: v,
   }));

   return r;
});

const selectedSplitSettingsOption = ref<string | null>(null);

async function handleSplit() {
   const material = materialToSplit.value;
   if (!material) return;

   const totalMaterials = parseInt(
      (
         (computedCropData.value.width / data.split.width) *
         (computedCropData.value.height / data.split.height)
      ).toFixed()
   );

   let doProceed = true;
   if (totalMaterials > 100) {
      doProceed = await new Promise<boolean>((resolve) => {
         dialog.warning({
            title: "Split Material",
            content: `${totalMaterials} materials will be created. Are you sure you want to split?`,
            positiveText: "Split",
            positiveButtonProps: { quaternary: true },
            onPositiveClick(e) {
               resolve(true);
            },
            onClose() {
               resolve(false);
            },
         });
      });
   }

   if (!doProceed) return;
   const img = material.getTexture().getOrigImageCanvasUrl();
   if (!img) return;
   data.isLoadingSplit = true;
   const splitJobData: MaterialSplitJobData = {
      ...data,
      imageUrl: img,
   };

   const result = await postAsync(materialWorker, "split", splitJobData);
   if (result) {
      const settingsName = selectedSplitSettingsOption.value;
      const splittedMaterials: SplittedMaterials =
         result.data.splittedMaterials;
      for (let i = 0; i < splittedMaterials.length; i++) {
         const splittedMaterial = splittedMaterials[i];
         const loadedMaterials = projectStore.loadSplittedMaterialVariants(
            settingsName ?? "",
            splittedMaterial.blob,
            splittedMaterial.row,
            splittedMaterial.column
         );

         if (!loadedMaterials.length) {
            const materialChunk = projectStore.createMaterial(
               material.getName() + "_" + i,
               splittedMaterial.blob
            );

            if (settingsName) {
               materialChunk.setSplitData({
                  settingsName,
                  row: splittedMaterial.row,
                  column: splittedMaterial.column,
               });
            }
         }

         // // load config
         // if (settingsName) {

         //    projectStore.maybeLoadSplitSettingsToMaterial(
         //       settingsName,
         //       materialChunk,
         //       splittedMaterial.row,
         //       splittedMaterial.column
         //    );

         //    materialChunk.setSplitData({
         //       settingsName,
         //       row: splittedMaterial.row,
         //       column: splittedMaterial.column,
         //    });
         // }
      }
   }

   if (data.deleteOriginal) {
      projectStore.deleteMaterial(material);
      materialToSplit.value = undefined;
      isMaterialSplitterVisible.value = false;
   }

   data.isLoadingSplit = false;
}

function handleSaveSettings() {
   const settingsName = data.settingsName;
   const dataCopy = JSON.parse(JSON.stringify(data));
   delete dataCopy["settingsName"];
   delete dataCopy["isLoadingSplit"];
   projectStore.savedMaterialSplitSettings[settingsName] = {
      ...dataCopy,
      name: settingsName,
      storedMaterialConfigs: [],
   };
   selectedSplitSettingsOption.value = settingsName;
   message.success(`'${settingsName}' has been saved to split settings.`);
}

function handleLoadSettings(settingsName: string) {
   const loaded = projectStore.savedMaterialSplitSettings[settingsName];
   if (!loaded) return;
   data.cropInput = loaded.cropInput;
   data.resizeOutput = loaded.resizeOutput;
   data.split = loaded.split;
   data.isResizingOutputsEnabled = loaded.isResizingOutputsEnabled;
   data.isCroppingInputEnabled = loaded.isCroppingInputEnabled;
}

function handleDeleteSettings() {
   const settingsName = selectedSplitSettingsOption.value;
   if (!settingsName) return;
   dialog.error({
      positiveText: "Delete",
      title: "Delete Settings",
      content: `Are you sure you want to delete the '${settingsName}' split settings?`,
      positiveButtonProps: { quaternary: true },
      icon: () => h(PhTrashSimple),
      onPositiveClick(e) {
         delete projectStore.savedMaterialSplitSettings[settingsName];
         selectedSplitSettingsOption.value = null;
      },
   });
}

function repaint() {
   const ctx = ctxRef.value;
   if (!ctx) return;
   ctx.imageSmoothingEnabled = false;
   const material = materialToSplit.value;
   if (!material) return;
   const materialImg = material.getTexture().getOrigImageCanvas();

   // draw base
   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   ctx.save();
   ctx.globalAlpha = 0.25;
   ctx.drawImage(materialImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
   ctx.restore();

   // draw cropped
   ctx.drawImage(
      materialImg,
      computedCropData.value.x,
      computedCropData.value.y,
      computedCropData.value.width,
      computedCropData.value.height,
      computedCropData.value.scaledX,
      computedCropData.value.scaledY,
      computedCropData.value.scaledWidth,
      computedCropData.value.scaledHeight
   );

   // draw split grid
   const sizeRatio = computedSizeRatio.value;
   const splitCountX = computedCropData.value.width / data.split.width;
   ctx.lineWidth = 1;
   ctx.setLineDash([4, 4]);
   for (let i = 1; i < splitCountX; i++) {
      ctx.beginPath();
      const x =
         computedCropData.value.scaledX +
         i * data.split.width * sizeRatio.width;
      ctx.moveTo(x, computedCropData.value.scaledY);
      ctx.lineTo(
         x,
         computedCropData.value.scaledY + computedCropData.value.scaledHeight
      );
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.closePath();
   }
   const splitCountY = computedCropData.value.height / data.split.height;
   for (let i = 1; i < splitCountY; i++) {
      ctx.beginPath();
      const y =
         computedCropData.value.scaledY +
         i * data.split.height * sizeRatio.height;
      ctx.moveTo(computedCropData.value.scaledX, y);
      ctx.lineTo(
         computedCropData.value.scaledX + computedCropData.value.scaledWidth,
         y
      );
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.closePath();
   }
}

function clampTopLeftSideCropper() {
   data.cropInput.topLeft.x = parseInt(
      clamp(data.cropInput.topLeft.x, 0, data.cropInput.bottomRight.x).toFixed()
   );
   data.cropInput.topLeft.y = parseInt(
      clamp(data.cropInput.topLeft.y, 0, data.cropInput.bottomRight.y).toFixed()
   );
}

function clampTopRightSideCropper() {
   const canvas = canvasRef.value;
   if (!canvas) return;
   data.cropInput.topRight.x = parseInt(
      clamp(
         data.cropInput.topRight.x,
         data.cropInput.bottomLeft.x,
         canvas.width / computedSizeRatio.value.width
      ).toFixed()
   );
   data.cropInput.topRight.y = parseInt(
      clamp(data.cropInput.topRight.y, 0, data.cropInput.bottomLeft.y).toFixed()
   );
}

function clampBottomLeftSideCropper() {
   const canvas = canvasRef.value;
   if (!canvas) return;
   data.cropInput.bottomLeft.x = parseInt(
      clamp(data.cropInput.bottomLeft.x, 0, data.cropInput.topRight.x).toFixed()
   );
   data.cropInput.bottomLeft.y = parseInt(
      clamp(
         data.cropInput.bottomLeft.y,
         data.cropInput.topRight.y,
         canvas.height / computedSizeRatio.value.height
      ).toFixed()
   );
}

function clampBottomRightSideCropper() {
   const canvas = canvasRef.value;
   if (!canvas) return;
   data.cropInput.bottomRight.x = parseInt(
      clamp(
         data.cropInput.bottomRight.x,
         data.cropInput.topLeft.x,
         canvas.width / computedSizeRatio.value.width
      ).toFixed()
   );
   data.cropInput.bottomRight.y = parseInt(
      clamp(
         data.cropInput.bottomRight.y,
         data.cropInput.topLeft.y,
         canvas.height / computedSizeRatio.value.height
      ).toFixed()
   );
}

const cropperClampersArrayMap: [typeof croppersState.side, Function][] = [
   ["topLeft", clampTopLeftSideCropper],
   ["topRight", clampTopRightSideCropper],
   ["bottomLeft", clampBottomLeftSideCropper],
   ["bottomRight", clampBottomRightSideCropper],
];

function fixCropperSides(prioritizedSide?: typeof croppersState.side) {
   const canvas = canvasRef.value;
   if (!canvas) return;

   // limit
   cropperClampersArrayMap
      .sort((a, b) => {
         if (a[0] == prioritizedSide && b[0] != prioritizedSide) return -1;
         return 0;
      })
      .forEach((v) => v[1]());

   // maintain rectangularity
   switch (prioritizedSide) {
      case "topLeft":
         data.cropInput.topRight.y = data.cropInput.topLeft.y;
         data.cropInput.bottomLeft.x = data.cropInput.topLeft.x;
         if (prioritizedSide) break;
      case "topRight":
         data.cropInput.topLeft.y = data.cropInput.topRight.y;
         data.cropInput.bottomRight.x = data.cropInput.topRight.x;
         if (prioritizedSide) break;
      case "bottomLeft":
         data.cropInput.bottomRight.y = data.cropInput.bottomLeft.y;
         data.cropInput.topLeft.x = data.cropInput.bottomLeft.x;
         if (prioritizedSide) break;
      case "bottomRight":
         data.cropInput.bottomLeft.y = data.cropInput.bottomRight.y;
         data.cropInput.topRight.x = data.cropInput.bottomRight.x;
         if (prioritizedSide) break;
   }
}

function resetCropInput() {
   data.cropInput.topLeft.x = 0;
   data.cropInput.topLeft.y = 0;
   data.cropInput.topRight.x = computedMaterialSize.value.width;
   data.cropInput.topRight.y = 0;
   data.cropInput.bottomLeft.x = 0;
   data.cropInput.bottomLeft.y = computedMaterialSize.value.height;
   data.cropInput.bottomRight.x = computedMaterialSize.value.width;
   data.cropInput.bottomRight.y = computedMaterialSize.value.height;
}

function reset() {
   const currentSplitSettings = selectedSplitSettingsOption.value;
   if (currentSplitSettings) {
      // clone saved settings to avoid resetting it
      projectStore.savedMaterialSplitSettings[currentSplitSettings] =
         JSON.parse(
            JSON.stringify(
               projectStore.savedMaterialSplitSettings[currentSplitSettings]
            )
         );
   }

   selectedSplitSettingsOption.value = null;
   data.settingsName = "";
   data.deleteOriginal = true;
   data.isCroppingInputEnabled = false;
   data.isResizingOutputsEnabled = false;
   data.split.width = projectStore.tileSize;
   data.split.height = projectStore.tileSize;
   resetCropInput();
   data.resizeOutput.width = 0;
   data.resizeOutput.height = 0;
}

addEventListener("mousemove", (e) => {
   if (croppersState.isMouseDown) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      const canvasBounds = canvasRef.value?.getBoundingClientRect();
      const sizeRatio = computedSizeRatio.value;
      if (!canvasBounds) return;
      const side = data.cropInput[croppersState.side];
      side.x ??= 0;
      side.y ??= 0;
      side.x = parseInt(
         ((e.clientX - canvasBounds.left) / sizeRatio.width).toFixed()
      );
      side.y = parseInt(
         ((e.clientY - canvasBounds.top) / sizeRatio.height).toFixed()
      );
      fixCropperSides(croppersState.side);
   }
});

addEventListener("mouseup", (e) => {
   croppersState.isMouseDown = false;
});

watch(canvasRef, (canvas) => {
   if (!canvas) return;
   reset();
   ctxRef.value = canvas.getContext("2d")!;
   fixCropperSides();
   repaint();
});

watch(data, () => {
   fixCropperSides();
   repaint();
});

watch(
   () => [
      data.split.width,
      data.split.height,
      data.isResizingOutputsEnabled,
      canvasRef.value,
   ],
   () => {
      if (!data.isResizingOutputsEnabled) {
         data.resizeOutput.width = data.split.width;
         data.resizeOutput.height = data.split.height;
      }
   }
);

watch(
   () => data.isCroppingInputEnabled,
   () => {
      if (!data.isCroppingInputEnabled) {
         resetCropInput();
      }
   }
);

watch(isMaterialSplitterVisible, () => {
   reset();
});
</script>

<style scoped lang="scss">
.material-manager-container {
   cursor: v-bind("croppersState.isMouseDown ? 'move' : 'default'");
   overflow: hidden;
}

.material-manager-mask {
   background-color: rgba(0, 0, 0, 0.5);
   pointer-events: v-bind("croppersState.isMouseDown ? 'none' : 'auto'");
}

.cropper {
   $width: 5px;
   $color: white;
   position: absolute;
   span {
      position: absolute;
      width: v-bind("cropperSize + 'px'");
      height: v-bind("cropperSize + 'px'");
      opacity: v-bind("croppersState.isMouseDown ? 1.0 : 0.5");
      transition: opacity 300ms;
      cursor: move;
   }

   .top-left {
      border: $width solid $color;
      border-right-width: 0;
      border-bottom-width: 0;
      left: v-bind("data.cropInput.topLeft.x * computedSizeRatio.width + 'px'");
      top: v-bind("data.cropInput.topLeft.y * computedSizeRatio.height + 'px'");
   }

   .top-right {
      border: $width solid $color;
      border-left-width: 0;
      border-bottom-width: 0;
      left: v-bind(
         "data.cropInput.topRight.x * computedSizeRatio.width + 'px'"
      );
      top: v-bind(
         "data.cropInput.topRight.y * computedSizeRatio.height + 'px'"
      );
      transform: translateX(v-bind("-cropperSize + 'px'"));
   }

   .bottom-left {
      border: $width solid $color;
      border-right-width: 0;
      border-top-width: 0;
      left: v-bind(
         "data.cropInput.bottomLeft.x * computedSizeRatio.width + 'px'"
      );
      top: v-bind(
         "data.cropInput.bottomLeft.y * computedSizeRatio.height + 'px'"
      );
      transform: translateY(v-bind("-cropperSize + 'px'"));
   }

   .bottom-right {
      border: $width solid $color;
      border-left-width: 0;
      border-top-width: 0;
      left: v-bind(
         "data.cropInput.bottomRight.x * computedSizeRatio.width + 'px'"
      );
      top: v-bind(
         "data.cropInput.bottomRight.y * computedSizeRatio.height + 'px'"
      );
      transform: translate(
         v-bind("-cropperSize + 'px'"),
         v-bind("-cropperSize + 'px'")
      );
   }

   &::before {
      content: "";
      position: absolute;
      left: v-bind("cropModel.x.value * computedSizeRatio.width + 'px'");
      top: v-bind("cropModel.y.value * computedSizeRatio.height + 'px'");
      width: v-bind("cropModel.width.value * computedSizeRatio.width + 'px'");
      height: v-bind(
         "cropModel.height.value * computedSizeRatio.height + 'px'"
      );
      border: 1px dashed rgba(255, 255, 255, 0.5);
      opacity: v-bind("croppersState.isMouseDown ? 1.0 : 0.0");
      transition: opacity 300ms;
   }
}
</style>
