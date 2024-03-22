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
            title="Split Material"
            closable
            class="w-fit h-5/6 shadow-2xl"
            content-class="relative flex flex-col w-full h-full overflow-hidden"
            @close="() => (isMaterialSplitterVisible = false)"
         >
            <div class="flex items-center gap-4 overflow-auto">
               <div class="flex relative">
                  <div class="cropper">
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
                  <canvas ref="canvasRef"></canvas>
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
                           >
                              <template #prefix>
                                 <NText :depth="3">width:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="data.split.height"
                              placeholder=""
                           >
                              <template #prefix>
                                 <NText :depth="3">height:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="data.split.gap"
                              placeholder=""
                           >
                              <template #prefix>
                                 <NText :depth="3">gap:</NText>
                              </template>
                           </NInputNumber>
                        </div>
                     </div>
                     <NDivider class="!m-0"></NDivider>
                     <div class="flex flex-col w-full">
                        <NText>
                           Crop Input
                           <NText :depth="3" class="text-xs">(optional)</NText>
                        </NText>
                        <div class="flex flex-col gap-1">
                           <NInputNumber
                              v-model:value="cropModel.x.value"
                              placeholder=""
                              clearable
                              :min="0"
                           >
                              <template #prefix>
                                 <NText :depth="3">x:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="cropModel.y.value"
                              placeholder=""
                              clearable
                              :min="0"
                           >
                              <template #prefix>
                                 <NText :depth="3">y:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="cropModel.width.value"
                              placeholder=""
                              clearable
                              :min="0"
                              :max="
                                 computedMaterialSize.width - computedCropData.x
                              "
                           >
                              <template #prefix>
                                 <NText :depth="3">width:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="cropModel.height.value"
                              placeholder=""
                              clearable
                              :min="0"
                              :max="
                                 computedMaterialSize.height -
                                 computedCropData.y
                              "
                           >
                              <template #prefix>
                                 <NText :depth="3">height:</NText>
                              </template>
                           </NInputNumber>
                        </div>
                     </div>
                     <NDivider class="!m-0"></NDivider>
                     <div class="flex flex-col w-full">
                        <NText>
                           Resize Split Outputs
                           <NText :depth="3" class="text-xs">(optional)</NText>
                        </NText>
                        <div class="flex flex-col gap-1">
                           <NInputNumber
                              v-model:value="data.resizeOutput.width"
                              placeholder=""
                              clearable
                           >
                              <template #prefix>
                                 <NText :depth="3">width:</NText>
                              </template>
                           </NInputNumber>
                           <NInputNumber
                              v-model:value="data.resizeOutput.height"
                              placeholder=""
                              clearable
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
                        <NButton class="w-full">Split</NButton>
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

const projectStore = useProjectStore();
const theme = useThemeVars();
const message = useMessage();
const dialog = useDialog();
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
      gap: 0,
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
});

const cropModel = {
   x: computed({
      get() {
         return data.cropInput.topLeft.x;
      },
      set(x: number) {
         data.cropInput.topLeft.x = x;
         fixCropperSides("topLeft");
      },
   }),
   y: computed({
      get() {
         return data.cropInput.topLeft.y;
      },
      set(y: number) {
         data.cropInput.topLeft.y = y;
         fixCropperSides("topLeft");
      },
   }),
   width: computed({
      get() {
         return data.cropInput.topRight.x - data.cropInput.topLeft.x;
      },
      set(width: number) {
         data.cropInput.topRight.x = data.cropInput.topLeft.x + width;
         fixCropperSides("topRight");
      },
   }),
   height: computed({
      get() {
         return data.cropInput.bottomLeft.y - data.cropInput.topLeft.y;
      },
      set(height: number) {
         data.cropInput.bottomLeft.y = data.cropInput.topLeft.y + height;
         fixCropperSides("bottomLeft");
      },
   }),
};

const computedMaterialSize = computed(() => {
   const result = {
      width: 0,
      height: 0,
   };
   const material = materialToSplit.value;
   if (!material) return result;
   const materialImg = material.texture.getOrigImageCanvas();
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

function handleSaveSettings() {
   const settingsName = data.settingsName;
   projectStore.savedMaterialSplitSettings[settingsName] = {
      ...data,
      storedMatrixIds: [],
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
   const material = materialToSplit.value;
   if (!material) return;
   const materialImg = material.texture.getOrigImageCanvas();

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
}

function clampTopLeftSideCropper() {
   data.cropInput.topLeft.x = clamp(
      data.cropInput.topLeft.x,
      0,
      data.cropInput.bottomRight.x
   );
   data.cropInput.topLeft.y = clamp(
      data.cropInput.topLeft.y,
      0,
      data.cropInput.bottomRight.y
   );
}

function clampTopRightSideCropper() {
   const canvas = canvasRef.value;
   if (!canvas) return;
   data.cropInput.topRight.x = clamp(
      data.cropInput.topRight.x,
      data.cropInput.bottomLeft.x,
      canvas.width / computedSizeRatio.value.width
   );
   data.cropInput.topRight.y = clamp(
      data.cropInput.topRight.y,
      0,
      data.cropInput.bottomLeft.y
   );
}

function clampBottomLeftSideCropper() {
   const canvas = canvasRef.value;
   if (!canvas) return;
   data.cropInput.bottomLeft.x = clamp(
      data.cropInput.bottomLeft.x,
      0,
      data.cropInput.topRight.x
   );
   data.cropInput.bottomLeft.y = clamp(
      data.cropInput.bottomLeft.y,
      data.cropInput.topRight.y,
      canvas.height / computedSizeRatio.value.height
   );
}

function clampBottomRightSideCropper() {
   const canvas = canvasRef.value;
   if (!canvas) return;
   data.cropInput.bottomRight.x = clamp(
      data.cropInput.bottomRight.x,
      data.cropInput.topLeft.x,
      canvas.width / computedSizeRatio.value.width
   );
   data.cropInput.bottomRight.y = clamp(
      data.cropInput.bottomRight.y,
      data.cropInput.topLeft.y,
      canvas.height / computedSizeRatio.value.height
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
   data.split.gap = 0;
   data.split.width = projectStore.tileSize;
   data.split.height = projectStore.tileSize;
   data.cropInput.topLeft.x = 0;
   data.cropInput.topLeft.y = 0;
   data.cropInput.topRight.x = computedMaterialSize.value.width;
   data.cropInput.topRight.y = 0;
   data.cropInput.bottomLeft.x = 0;
   data.cropInput.bottomLeft.y = computedMaterialSize.value.height;
   data.cropInput.bottomRight.x = computedMaterialSize.value.width;
   data.cropInput.bottomRight.y = computedMaterialSize.value.height;
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
      side.x = (e.clientX - canvasBounds.left) / sizeRatio.width;
      side.y = (e.clientY - canvasBounds.top) / sizeRatio.height;
      fixCropperSides(croppersState.side);
   }
});

addEventListener("mouseup", (e) => {
   croppersState.isMouseDown = false;
});

watch(canvasRef, (canvas) => {
   if (!canvas) return;
   reset();
   canvas.width = 400;
   canvas.height = 400;
   ctxRef.value = canvas.getContext("2d")!;
   data.cropInput.topRight.x = computedMaterialSize.value.width;
   data.cropInput.bottomLeft.y = computedMaterialSize.value.height;
   data.cropInput.bottomRight.x = computedMaterialSize.value.width;
   data.cropInput.bottomRight.y = computedMaterialSize.value.height;
   fixCropperSides();
   repaint();
});

watch(data, () => {
   fixCropperSides();
   repaint();
});

watch(isMaterialSplitterVisible, (isMaterialSplitterVisible) => {
   reset();
});
</script>

<style scoped lang="scss">
.material-manager-container {
   cursor: v-bind("croppersState.isMouseDown ? 'move' : 'default'");
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
