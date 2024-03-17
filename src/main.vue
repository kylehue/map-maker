<template>
   <NConfigProvider :theme="themeToUse" :theme-overrides="themeOverrides">
      <NMessageProvider>
         <NDialogProvider>
            <App></App>
         </NDialogProvider>
      </NMessageProvider>
   </NConfigProvider>
</template>

<script setup lang="ts">
import { BuiltInGlobalTheme } from "naive-ui/es/themes/interface";
import {
   NConfigProvider,
   NDialogProvider,
   NMessageProvider,
   darkTheme,
   lightTheme,
} from "naive-ui";
import App from "./app.vue";
import themeOverrides from "./utils/get-naive-theme";
import { currentTheme } from "./composables/use-theme-switch";
import { ref, watch } from "vue";

const themeToUse = ref<BuiltInGlobalTheme>(darkTheme);
watch(
   currentTheme,
   (currentTheme) => {
      if (currentTheme == "dark") {
         themeToUse.value = darkTheme;
         document.documentElement.classList.add("dark");
         document.documentElement.classList.remove("light");
      } else {
         themeToUse.value = lightTheme;
         document.documentElement.classList.add("light");
         document.documentElement.classList.remove("dark");
      }
   },
   { immediate: true }
);
</script>

<style scoped></style>
