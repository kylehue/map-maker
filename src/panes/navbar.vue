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
import { MenuOption, NMenu } from "naive-ui";
import { reactive, ref, watch } from "vue";
import ThemeSwitcher from "../components/theme-switcher.vue";
import { useProjectStore } from "../store/project";

enum Navigation {
   FILE_DROPDOWN,
   FILE_NEW_PROJECT,
   FILE_OPEN_FILES,
   FILE_EXPORT,
   WINDOW_DROPDOWN,
   WINDOW_SHOW_MATRIX,
   WINDOW_SHOW_MATERIALS,
   WINDOW_SHOW_LAYERS,
   EDIT_DROPDOWN,
   EDIT_UNDO,
   EDIT_REDO,
   EDIT_TILE_SIZE,
}

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
            label: "Matrix",
         },
         {
            key: Navigation.WINDOW_SHOW_MATERIALS,
            label: "Materials",
         },
         {
            key: Navigation.WINDOW_SHOW_LAYERS,
            label: "Layers",
         },
      ],
   },
];

function handleSelect(e: Navigation) {
   switch (e) {
      case Navigation.FILE_NEW_PROJECT:
         projectStore.reset();
         break;
   }
}
</script>
