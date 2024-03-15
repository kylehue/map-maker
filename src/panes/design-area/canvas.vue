<template>
   <div class="flex w-full h-full" ref="canvasContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { useElementSize } from "@vueuse/core";
import { useDesignerStore } from "../../store/designer";

const canvasContainer = ref<HTMLDivElement>();
const canvasContainerSize = useElementSize(canvasContainer);
const designerStore = useDesignerStore();

watch(
   () => [canvasContainerSize.width.value, canvasContainerSize.height.value],
   ([width, height]) => {
      if (!designerStore.designer) return;
      designerStore.designer.setSize(width, height);
   }
);

onMounted(() => {
   canvasContainer.value?.appendChild(designerStore.designer!.canvas);
});
</script>
