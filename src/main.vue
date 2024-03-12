<template>
   <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
      <App></App>
   </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, darkTheme } from "naive-ui";
import App from "./app.vue";
import themeOverrides from "./utils/get-naive-theme";
</script>

<style scoped></style>
