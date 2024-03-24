<template>
   <div
      v-if="!designerStore.isFullScreen && settingsStore.window.showToolbar"
      class="flex flex-col w-full h-full p-2 pt-8 gap-1"
   >
      <template v-for="tool in tools" :key="tool.tool">
         <ToolbarItem v-bind="tool"></ToolbarItem>
      </template>
   </div>
</template>

<script setup lang="ts">
import {
   PhCursor,
   PhSelection,
   PhPaintBrush,
   PhEraser,
   PhPaintBucket,
   PhHand,
} from "@phosphor-icons/vue";
import { Tool } from "../../types";
import { VNode, h } from "vue";
import ToolbarItem from "./toolbar-item.vue";
import { useDesignerStore } from "../../store/designer";
import { useSettingsStore } from "../../store/settings";

const tools: {
   tool: Tool;
   label: string;
   icon: VNode;
}[] = [
   // {
   //    tool: "move",
   //    label: "Move Tool",
   //    icon: h(PhCursor),
   // },
   {
      tool: "hand",
      label: "Hand Tool",
      icon: h(PhHand),
   },
   // {
   //    tool: "select",
   //    label: "Select Tool",
   //    icon: h(PhSelection),
   // },
   {
      tool: "brush",
      label: "Brush Tool",
      icon: h(PhPaintBrush),
   },
   {
      tool: "eraser",
      label: "Eraser Tool",
      icon: h(PhEraser),
   },
   {
      tool: "paint-bucket",
      label: "Paint Bucket Tool",
      icon: h(PhPaintBucket),
   },
];

const designerStore = useDesignerStore();
const settingsStore = useSettingsStore();
</script>
