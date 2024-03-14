<template>
   <div
      class="layer flex flex-shrink-0 items-center justify-between h-10 gap-2 p-2 rounded w-full"
      @click.right="handleRightClick"
      @dblclick="() => (isEditingLayerNameInput = true)"
      @keydown.f2="() => (isEditingLayerNameInput = true)"
      :tabindex="0"
   >
      <div class="start">
         <NButton
            size="tiny"
            quaternary
            circle
            @click="emit('toggle-visibility', !props.isHidden)"
         >
            <NIcon>
               <PhEyeSlash v-if="props.isHidden" />
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
            v-if="props.isLocked"
            size="tiny"
            quaternary
            circle
            @click="emit('toggle-lock', false)"
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
import { PhEye, PhEyeSlash, PhLockSimple } from "@phosphor-icons/vue";
import { useContextMenu } from "../composables/use-context-menu";

const theme = useThemeVars();

const props = defineProps<{
   name: string;
   isLocked?: boolean;
   isHidden?: boolean;
}>();

const emit = defineEmits<{
   (event: "toggle-lock", shouldLock: boolean): void;
   (event: "toggle-visibility", shouldShow: boolean): void;
   (event: "duplicate"): void;
   (event: "rename", newName: string): void;
   (event: "delete"): void;
}>();

const isEditingLayerNameInput = ref(false);
const layerNameInputRef = ref<HTMLInputElement>();
const layerNameInputValue = ref(props.name);

enum LayerContextMenu {
   TOGGLE_LOCK,
   TOGGLE_VISIBILITY,
   DUPLICATE,
   RENAME,
   DELETE,
}

const contextMenuOptions: DropdownOption[] = reactive([
   {
      label: () => (props.isLocked ? "Unlock" : "Lock"),
      key: LayerContextMenu.TOGGLE_LOCK,
   },
   {
      label: () => (props.isHidden ? "Show" : "Hide"),
      key: LayerContextMenu.TOGGLE_VISIBILITY,
   },
   {
      label: "Duplicate",
      key: LayerContextMenu.DUPLICATE,
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
         emit("toggle-visibility", !props.isHidden);
         break;
      case LayerContextMenu.TOGGLE_LOCK:
         emit("toggle-lock", !props.isLocked);
         break;
      case LayerContextMenu.DUPLICATE:
         emit("duplicate");
         break;
      case LayerContextMenu.RENAME:
         isEditingLayerNameInput.value = true;
         break;
      case LayerContextMenu.DELETE:
         emit("delete");
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
   if (layerNameInputValue.value !== props.name) {
      emit("rename", layerNameInputValue.value);
   }

   isEditingLayerNameInput.value = false;
}

watch(isEditingLayerNameInput, (isEditingLayer) => {
   if (!isEditingLayer) return;

   layerNameInputRef.value!.select();
   layerNameInputRef.value!.focus();
});
</script>

<style scoped lang="scss">
.layer {
   border: none;
   outline: none;
   cursor: pointer;
   transition: background 200ms;
   &:hover {
      background: v-bind("theme.hoverColor") !important;
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
