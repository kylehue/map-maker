<template>
   <div class="flex flex-col w-full h-full">
      <textarea></textarea>
   </div>
</template>

<script setup lang="ts">
import { useThemeVars } from "naive-ui";

const theme = useThemeVars();
</script>

<style scoped lang="scss">
textarea {
   font-family: monospace, 'Courier New', Courier !important;
   width: 100%;
   height: 100%;
   padding: 5px !important;
   resize: none !important;
   border: none !important;
   outline: none !important;
   background: none !important;
   text-wrap: nowrap !important;
   border-radius: 5px;
}
</style>
