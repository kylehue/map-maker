<template>
   <NDropdown
      ref="contextMenuElementRef"
      trigger="manual"
      :show="isContextMenuVisible"
      :options="contextMenuOptions"
      @select="handleSelect"
      :x="contextMenuPosition.x"
      :y="contextMenuPosition.y"
      :on-clickoutside="() => (isContextMenuVisible = false)"
      show-arrow
      @click.right="(e) => e.preventDefault()"
   >
      <div class=""></div>
   </NDropdown>
</template>

<script setup lang="ts">
import { NDropdown } from "naive-ui";
import { ref, watch } from "vue";
import { useWindowFocus } from "@vueuse/core";
import {
   isContextMenuVisible,
   contextMenuHandler,
   contextMenuOptions,
   contextMenuPosition,
} from "../composables/use-context-menu";

const isWindowFocused = useWindowFocus();
const contextMenuElementRef = ref<HTMLDivElement>();

function handleSelect(key: any) {
   contextMenuHandler.value(key, () => {
      isContextMenuVisible.value = false;
   });
}

watch(isWindowFocused, (isWindowFocused) => {
   if (!isWindowFocused) isContextMenuVisible.value = false;
});

addEventListener("wheel", () => {
   isContextMenuVisible.value = false;
});
</script>
