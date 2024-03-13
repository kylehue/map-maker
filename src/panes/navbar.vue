<template>
   <n-menu
      v-model:value="navActiveKey"
      mode="horizontal"
      :options="navOptions"
      responsive
   />
</template>

<script setup lang="ts">
import { MenuOption, NMenu } from "naive-ui";
import { reactive, ref, watch } from "vue";

enum Navigation {
   FILE_DROPDOWN,
   WINDOW_DROPDOWN,
   NEW_PROJECT,
   OPEN_FILES,
   EXPORT,
   WINDOW_SHOW_MATRIX,
   WINDOW_SHOW_MATERIALS,
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
      key: Navigation.WINDOW_DROPDOWN,
      label: "Window",
      children: [
         {
            key: Navigation.WINDOW_SHOW_MATRIX,
            label: "Map Matrix",
         },
         {
            key: Navigation.WINDOW_SHOW_MATERIALS,
            label: "Materials",
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
