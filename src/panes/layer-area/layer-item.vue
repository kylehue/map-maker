<template>
   <div
      ref="containerRef"
      class="layer flex flex-shrink-0 items-center justify-between h-10 gap-2 p-2 rounded w-full"
      @click.right="handleRightClick"
      @dblclick="() => (isEditingLayerNameInput = true)"
      @keydown.f2="() => (isEditingLayerNameInput = true)"
      :tabindex="0"
      @click="() => projectStore.setSelectedLayer(layer)"
      :class="{
         selected: layer === projectStore.selectedLayer,
      }"
   >
      <div class="start">
         <NButton
            size="tiny"
            quaternary
            circle
            @click="() => (layer.isVisible = !layer.isVisible)"
         >
            <NIcon>
               <PhEyeSlash v-if="!layer.isVisible" />
               <PhEye v-else />
            </NIcon>
         </NButton>
         <input
            ref="layerNameInputRef"
            type="text"
            class="layer-name-input"
            v-model="layerNameInputValue"
            @blur="handleLayerNameInput"
            @keydown.enter="() => layerNameInputRef?.blur()"
         />
      </div>
      <div class="end">
         <NButton
            v-if="layer.isLocked"
            size="tiny"
            quaternary
            circle
            @click="() => (layer.isLocked = !layer.isLocked)"
         >
            <NIcon>
               <PhLockSimple />
            </NIcon>
         </NButton>
      </div>
   </div>
</template>

<script setup lang="ts">
import { NButton, NText, NIcon, useThemeVars, DropdownOption } from "naive-ui";
import { reactive, ref, watch } from "vue";
import {
   PhEye,
   PhEyeSlash,
   PhLockSimple,
   PhCaretUp,
   PhCaretDown,
} from "@phosphor-icons/vue";
import { useContextMenu } from "../../composables/use-context-menu";
import { useProjectStore } from "../../store/project";
import type { Layer } from "../../types";
import { clamp } from "../../utils/clamp";

const theme = useThemeVars();
const projectStore = useProjectStore();
const props = defineProps<{
   layer: Layer;
}>();

const containerRef = ref<HTMLDivElement>();
const isEditingLayerNameInput = ref(false);
const layerNameInputRef = ref<HTMLInputElement>();
const layerNameInputValue = ref(props.layer.name);

enum LayerContextMenu {
   TOGGLE_LOCK,
   TOGGLE_VISIBILITY,
   DUPLICATE,
   RENAME,
   DELETE,
   MOVE_UP,
   MOVE_DOWN,
}

const contextMenuOptions: DropdownOption[] = reactive([
   {
      label: () => (props.layer.isLocked ? "Unlock" : "Lock"),
      key: LayerContextMenu.TOGGLE_LOCK,
   },
   {
      label: () => (props.layer.isVisible ? "Hide" : "Show"),
      key: LayerContextMenu.TOGGLE_VISIBILITY,
   },
   {
      label: "Duplicate",
      key: LayerContextMenu.DUPLICATE,
   },
   {
      label: "Move up",
      key: LayerContextMenu.MOVE_UP,
   },
   {
      label: "Move down",
      key: LayerContextMenu.MOVE_DOWN,
   },
   {
      label: "Rename",
      key: LayerContextMenu.RENAME,
   },
   {
      label: "Delete",
      key: LayerContextMenu.DELETE,
   },
]);

function handleContextMenuSelect(e: LayerContextMenu, hide: Function) {
   switch (e) {
      case LayerContextMenu.TOGGLE_VISIBILITY:
         props.layer.isVisible = !props.layer.isVisible;
         break;
      case LayerContextMenu.TOGGLE_LOCK:
         props.layer.isLocked = !props.layer.isLocked;
         break;
      case LayerContextMenu.DUPLICATE:
         projectStore.duplicateLayer(props.layer);
         break;
      case LayerContextMenu.MOVE_UP:
         projectStore.moveLayer(props.layer, -1);
         break;
      case LayerContextMenu.MOVE_DOWN:
         projectStore.moveLayer(props.layer, 1);
         break;
      case LayerContextMenu.RENAME:
         isEditingLayerNameInput.value = true;
         break;
      case LayerContextMenu.DELETE:
         projectStore.deleteLayer(props.layer);
         break;
   }

   hide();
}

function handleRightClick(e: MouseEvent) {
   e.preventDefault();
   useContextMenu(
      contextMenuOptions,
      handleContextMenuSelect,
      e.pageX,
      e.pageY
   );
}

function handleLayerNameInput() {
   layerNameInputValue.value = layerNameInputValue.value.trim();
   if (layerNameInputValue.value !== props.layer.name) {
      props.layer.name = layerNameInputValue.value;
   }

   isEditingLayerNameInput.value = false;
}

watch(isEditingLayerNameInput, (isEditingLayer) => {
   if (!isEditingLayer) return;

   layerNameInputRef.value!.select();
   layerNameInputRef.value!.focus();
});

defineExpose({
   elRef: containerRef,
});
</script>

<style scoped lang="scss">
.layer {
   border: none;
   outline: none;
   cursor: pointer;
   transition: background 200ms;
   opacity: 0.7;
   &:hover {
      background: v-bind("theme.buttonColor2Hover") !important;
   }

   &.selected {
      background: v-bind("theme.buttonColor2Pressed");
      opacity: 1;
   }
}

.layer-name-input {
   color: v-bind("theme.textColor1") !important;
   border: none;
   outline: none;
   background: none;
   pointer-events: v-bind("isEditingLayerNameInput ? 'all' : 'none'");
}
</style>
