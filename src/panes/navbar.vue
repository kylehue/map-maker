<template>
   <div class="flex items-center justify-between w-full pr-4">
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
      />
      <ThemeSwitcher></ThemeSwitcher>
   </div>
</template>

<script setup lang="ts">
import { MenuOption, NMenu } from "naive-ui";
import { reactive, ref, watch } from "vue";
import ThemeSwitcher from "../components/theme-switcher.vue";

enum Navigation {
   FILE_DROPDOWN,
   WINDOW_DROPDOWN,
   EDIT_DROPDOWN,
   NEW_PROJECT,
   OPEN_FILES,
   EXPORT,
   WINDOW_SHOW_MATRIX,
   WINDOW_SHOW_MATERIALS,
   WINDOW_SHOW_LAYERS,
   EDIT_TILE_SIZE,
}

const navActiveKey = ref<Navigation>();
const navOptions: MenuOption[] = [
   {
      key: Navigation.FILE_DROPDOWN,
      label: "File",
      children: [
         {
            key: Navigation.NEW_PROJECT,
            label: "New...",
         },
         {
            key: Navigation.OPEN_FILES,
            label: "Open...",
         },
         {
            key: Navigation.EXPORT,
            label: "Export as...",
         },
      ],
   },
   {
      key: Navigation.EDIT_DROPDOWN,
      label: "Edit",
      children: [
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

watch(navActiveKey, (key) => {
   if (!key) return;
   switch (key) {
   }
   console.log(key);
   navActiveKey.value = undefined;
});
</script>
