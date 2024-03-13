<template>
   <div class="flex w-full h-full" ref="canvasContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { Designer } from "../../designer/Designer";
import { useElementSize } from "@vueuse/core";
import { map } from "../../utils/map";

const canvasContainer = ref<HTMLDivElement>();
const canvasContainerSize = useElementSize(canvasContainer);
const designer = new Designer();

watch(
   () => [canvasContainerSize.width.value, canvasContainerSize.height.value],
   ([width, height]) => {
      designer.setSize(width, height);
   }
);

onMounted(() => {
   canvasContainer.value?.appendChild(designer.canvas);
});
</script>
