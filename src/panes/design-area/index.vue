<template>
   <div class="flex w-full h-full">
      <div class="toolbar flex w-fit justify-center">
         <Toolbar></Toolbar>
      </div>
      <div class="relative flex flex-col w-full h-full">
         <div class="design-navbar flex w-full h-8 flex-shrink-0 items-center">
            <Navbar></Navbar>
         </div>
         <div class="design-area relative w-full h-full">
            <div class="absolute w-full h-full">
               <Canvas class="canvas"></Canvas>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useThemeVars } from "naive-ui";
import Canvas from "./canvas.vue";
import Navbar from "./navbar.vue";
import Toolbar from "./toolbar.vue";

const theme = useThemeVars();
</script>

<style lang="scss" scoped>
.design-navbar {
   background-color: v-bind("theme.cardColor");
   // border-bottom: 1px solid v-bind("theme.dividerColor");
}

.toolbar {
   background-color: v-bind("theme.cardColor");
   // border-right: 1px solid v-bind("theme.dividerColor");
}

.design-area {
   background-color: v-bind("theme.cardColor");
}

.canvas {
   border: 1px solid v-bind("theme.borderColor");
}
</style>
