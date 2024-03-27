<template>
   <div class="flex w-full h-full cursor-none" ref="canvasContainer">
      <div
         class="absolute flex items-center justify-center pointer-events-none"
         :style="{
            transform: `translate(${x - left}px,${y - top}px)`,
         }"
      >
         <NIcon size="large" :color="theme.textColor1">
            <component :is="toolIcon" />
         </NIcon>
      </div>
   </div>
</template>

<script setup lang="ts">
import { NIcon, useMessage, useThemeVars } from "naive-ui";
import { computed, h, onMounted, reactive, ref, watch } from "vue";
import { useElementBounding, useElementSize, useMouse } from "@vueuse/core";
import { useDesignerStore } from "../../store/designer";
import {
   PhPaintBrush,
   PhCursor,
   PhSelection,
   PhEraser,
   PhPaintBucket,
   PhHand,
} from "@phosphor-icons/vue";
import { useProjectStore } from "../../store/project";

const canvasContainer = ref<HTMLDivElement>();
const canvasContainerSize = useElementSize(canvasContainer);
const { top, left } = useElementBounding(canvasContainer);
const designerStore = useDesignerStore();
const { x, y } = useMouse({
   target: canvasContainer,
});
const theme = useThemeVars();

const toolIcon = computed(() => {
   const tool = designerStore.activeTool;
   switch (tool) {
      case "brush":
         return h(PhPaintBrush, {
            style: {
               transform: `translateY(-90%)`,
            },
         });
      case "eraser":
         return h(PhEraser, {
            style: {
               transform: `translate(-10%, -80%)`,
            },
         });
      case "paint-bucket":
         return h(PhPaintBucket, {
            style: {
               transform: `translate(-100%, -80%)`,
            },
         });
      case "select":
         return h(PhSelection);
      case "hand":
         return h(PhHand);
      default:
         return h(PhCursor);
   }
});

const projectStore = useProjectStore();
const message = useMessage();
function handleCanvasMouseDown() {
   const tool = designerStore.activeTool;
   const layer = projectStore.selectedLayer;
   const material = projectStore.selectedMaterial;
   if (
      (tool == "brush" || tool == "eraser" || tool == "paint-bucket") &&
      !layer
   ) {
      message.warning("Please select a layer.");
   } else if ((tool == "brush" || tool == "paint-bucket") && !material) {
      message.warning("Please select a material.");
   }

   if (layer?.isLocked) {
      message.warning("This layer is locked!");
   }
}

watch(
   () => [canvasContainerSize.width.value, canvasContainerSize.height.value],
   ([width, height]) => {
      if (!designerStore.designer) return;
      designerStore.designer.setSize(width, height);
   }
);

watch(
   () => designerStore.designer,
   (designer) => {
      if (!designer) return;
      canvasContainer.value?.appendChild(designer.canvas);

      designer.canvas.addEventListener("mousedown", () => {
         handleCanvasMouseDown();
      });
   },
   {
      once: true,
   }
);
</script>
