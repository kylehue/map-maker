<template>
   <div class="flex flex-col w-full h-full">
      <div class="design-navbar flex w-full h-8 flex-shrink-0 items-center">
         <Navbar></Navbar>
      </div>
      <div class="design-area flex flex-auto">
         <Canvas></Canvas>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useThemeVars } from "naive-ui";
import Canvas from "./canvas.vue";
import Navbar from "./navbar.vue";

const theme = useThemeVars();
</script>

<style lang="scss" scoped>
.design-navbar {
   background-color: v-bind("theme.cardColor");
   // border-bottom: 1px solid v-bind("theme.dividerColor");
}

.design-area {
   background-color: v-bind("theme.cardColor");
   border: 1px solid v-bind("theme.borderColor");
}
</style>
