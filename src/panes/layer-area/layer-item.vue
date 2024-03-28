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
            @click="() => handleLayerToggleVisibility()"
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
import { useDesignerStore } from "../../store/designer";

const theme = useThemeVars();
const projectStore = useProjectStore();
const designerStore = useDesignerStore();
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

const contextMenuOptions: DropdownOption[] = [
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
];

function handleContextMenuSelect(e: LayerContextMenu, hide: Function) {
   switch (e) {
      case LayerContextMenu.TOGGLE_VISIBILITY:
         handleLayerToggleVisibility();
         break;
      case LayerContextMenu.TOGGLE_LOCK:
         handleLayerToggleLock();
         break;
      case LayerContextMenu.DUPLICATE:
         handleLayerDuplicate();
         break;
      case LayerContextMenu.MOVE_UP:
         handleLayerMoveUp();
         break;
      case LayerContextMenu.MOVE_DOWN:
         handleLayerMoveDown();
         break;
      case LayerContextMenu.RENAME:
         isEditingLayerNameInput.value = true;
         break;
      case LayerContextMenu.DELETE:
         handleLayerDelete();
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
   const newName = (layerNameInputValue.value =
      layerNameInputValue.value.trim());
   const oldName = props.layer.name;

   if (oldName !== newName) {
      props.layer.name = newName;
      projectStore.saveState(
         "layer-name",
         () => {
            props.layer.name = oldName;
            layerNameInputValue.value = oldName;
         },
         () => {
            props.layer.name = newName;
            layerNameInputValue.value = newName;
         }
      );
   }

   isEditingLayerNameInput.value = false;
}

function handleLayerToggleVisibility() {
   const oldIsVisible = props.layer.isVisible;
   const newIsVisible = !props.layer.isVisible;
   props.layer.isVisible = newIsVisible;
   designerStore.designer?.repaint();
   projectStore.saveState(
      "layer-visible",
      () => {
         props.layer.isVisible = oldIsVisible;
         designerStore.designer?.repaint();
      },
      () => {
         props.layer.isVisible = newIsVisible;
         designerStore.designer?.repaint();
      }
   );
}

function handleLayerToggleLock() {
   const oldIsLocked = props.layer.isLocked;
   const newIsLocked = !props.layer.isLocked;
   props.layer.isLocked = newIsLocked;
   projectStore.saveState(
      "layer-lock",
      () => {
         props.layer.isVisible = oldIsLocked;
      },
      () => {
         props.layer.isVisible = newIsLocked;
      }
   );
}

function handleLayerDuplicate() {
   const duplicatedLayer = projectStore.duplicateLayer(props.layer);
   if (!duplicatedLayer) return;
   projectStore.saveState(
      "layer-duplicate",
      () => {
         projectStore.deleteLayer(duplicatedLayer);
      },
      () => {
         projectStore.restoreLayer(duplicatedLayer);
      }
   );
}

function handleLayerMoveUp() {
   const oldIndex = projectStore.layers.indexOf(props.layer);
   projectStore.moveLayer(props.layer, -1);
   const newIndex = projectStore.layers.indexOf(props.layer);
   if (oldIndex === newIndex) return;
   projectStore.saveState(
      "layer-move-up",
      () => {
         projectStore.moveLayer(props.layer, 1);
      },
      () => {
         projectStore.moveLayer(props.layer, -1);
      }
   );
}

function handleLayerMoveDown() {
   const oldIndex = projectStore.layers.indexOf(props.layer);
   projectStore.moveLayer(props.layer, 1);
   const newIndex = projectStore.layers.indexOf(props.layer);
   if (oldIndex === newIndex) return;
   projectStore.saveState(
      "layer-move-down",
      () => {
         projectStore.moveLayer(props.layer, -1);
      },
      () => {
         projectStore.moveLayer(props.layer, 1);
      }
   );
}

function handleLayerDelete() {
   const layer = props.layer;
   projectStore.deleteLayer(layer);
   projectStore.saveState(
      "layer-delete",
      () => {
         projectStore.restoreLayer(layer);
      },
      () => {
         projectStore.deleteLayer(layer);
      }
   );
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
