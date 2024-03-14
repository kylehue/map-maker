<template>
   <NSwitch v-model:value="isDark" size="medium">
      <template #icon>
         <PhMoon v-if="isDark" />
         <PhSun v-else />
      </template>
   </NSwitch>
</template>

<script setup lang="ts">
import { NSwitch } from "naive-ui";
import { ref, watch } from "vue";
import { useThemeSwitch, currentTheme } from "../composables/use-theme-switch";
import { PhMoon, PhSun } from "@phosphor-icons/vue";

const isDark = ref(currentTheme.value == "dark");

watch(isDark, (isDark) => {
   useThemeSwitch(isDark ? "dark" : "light");
});
</script>
