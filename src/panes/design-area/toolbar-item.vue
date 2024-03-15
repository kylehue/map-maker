<template>
   <NTooltip placement="left" :delay="1000" animated>
      <template #trigger>
         <NButton
            quaternary
            circle
            @click="designerStore.setActiveTool(tool)"
            :class="{
               'active-tool': designerStore.activeTool === tool,
            }"
         >
            <template #icon>
               <component :is="icon" />
            </template>
         </NButton>
      </template>
      {{ label }}
   </NTooltip>
</template>

<script setup lang="ts">
import { useThemeVars, NButton, NTooltip } from "naive-ui";
import { VNode } from "vue";
import { useDesignerStore } from "../../store/designer";
import type { Tool } from "../../types";
const designerStore = useDesignerStore();
const theme = useThemeVars();

defineProps<{
   tool: Tool;
   label: string;
   icon: VNode;
}>();
</script>

<style lang="scss" scoped>
.active-tool {
   background: v-bind("theme.buttonColor2Hover");
}
</style>
