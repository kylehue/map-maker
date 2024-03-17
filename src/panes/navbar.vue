<template>
   <div class="flex items-center justify-between w-full px-8">
      <NMenu
         v-model:value="navActiveKey"
         mode="horizontal"
         :options="navOptions"
         responsive
         dropdown-placement="top-start"
         :dropdown-props="{
            arrowPointToCenter: true,
            showArrow: true,
         }"
         @update:value="handleSelect"
      />
      <ThemeSwitcher></ThemeSwitcher>
   </div>
</template>

<script setup lang="ts">
import { MenuOption, NInputNumber, NMenu, NText, useDialog } from "naive-ui";
import { h, reactive, ref, watch } from "vue";
import ThemeSwitcher from "../components/theme-switcher.vue";
import { useProjectStore } from "../store/project";
import { useSettingsStore } from "../store/settings";
import { PhStackSimple } from "@phosphor-icons/vue";

enum Navigation {
   FILE_DROPDOWN,
   FILE_NEW_PROJECT,
   FILE_OPEN_FILES,
   FILE_EXPORT,
   WINDOW_DROPDOWN,
   WINDOW_SHOW_MATRIX,
   WINDOW_SHOW_MATERIALS,
   WINDOW_SHOW_LAYERS,
   WINDOW_SHOW_TOOLBAR,
   EDIT_DROPDOWN,
   EDIT_UNDO,
   EDIT_REDO,
   EDIT_TILE_SIZE,
}

const dialog = useDialog();
const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
const navActiveKey = ref<Navigation>();
const navOptions: MenuOption[] = [
   {
      key: Navigation.FILE_DROPDOWN,
      label: "File",
      children: [
         {
            key: Navigation.FILE_NEW_PROJECT,
            label: "New...",
         },
         {
            key: Navigation.FILE_OPEN_FILES,
            label: "Open...",
         },
         {
            key: Navigation.FILE_EXPORT,
            label: "Export as...",
         },
      ],
   },
   {
      key: Navigation.EDIT_DROPDOWN,
      label: "Edit",
      children: [
         {
            key: Navigation.EDIT_UNDO,
            label: "Undo",
         },
         {
            key: Navigation.EDIT_REDO,
            label: "Redo",
         },
         {
            key: Navigation.EDIT_TILE_SIZE,
            label: "Change tile size",
         },
      ],
   },
   {
      key: Navigation.WINDOW_DROPDOWN,
      label: "Window",
      children: [
         {
            key: Navigation.WINDOW_SHOW_MATRIX,
            label: () =>
               `${settingsStore.window.showMatrix ? "Hide" : "Show"} Matrix`,
         },
         {
            key: Navigation.WINDOW_SHOW_MATERIALS,
            label: () =>
               `${
                  settingsStore.window.showMaterials ? "Hide" : "Show"
               } Materials`,
         },
         {
            key: Navigation.WINDOW_SHOW_LAYERS,
            label: () =>
               `${settingsStore.window.showLayers ? "Hide" : "Show"} Layers`,
         },
         {
            key: Navigation.WINDOW_SHOW_TOOLBAR,
            label: () =>
               `${settingsStore.window.showToolbar ? "Hide" : "Show"} Toolbar`,
         },
      ],
   },
];

function handleSelect(e: Navigation) {
   switch (e) {
      case Navigation.FILE_NEW_PROJECT:
         projectStore.reset();
         break;
      case Navigation.EDIT_UNDO:
         break;
      case Navigation.EDIT_REDO:
         break;
      case Navigation.EDIT_TILE_SIZE:
         promptTileSize();
         break;
      case Navigation.WINDOW_SHOW_LAYERS:
         settingsStore.window.showLayers = !settingsStore.window.showLayers;
         break;
      case Navigation.WINDOW_SHOW_MATRIX:
         settingsStore.window.showMatrix = !settingsStore.window.showMatrix;
         break;
      case Navigation.WINDOW_SHOW_MATERIALS:
         settingsStore.window.showMaterials =
            !settingsStore.window.showMaterials;
         break;
      case Navigation.WINDOW_SHOW_TOOLBAR:
         settingsStore.window.showToolbar = !settingsStore.window.showToolbar;
         break;
   }
}

function promptTileSize() {
   dialog.create({
      title: "Change tile size",
      showIcon: false,
      content() {
         return h("div", {}, [
            h(NInputNumber, {
               "onUpdate:value": (n) => {
                  if (!n) return;
                  projectStore.setTileSize(n);
               },
               value: projectStore.tileSize,
            }),
         ]);
      },
   });
}
</script>
