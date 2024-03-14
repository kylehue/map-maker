<template>
   <div class="flex flex-col w-full h-full">
      <div class="layer-navbar flex w-full h-8 flex-shrink-0 items-center">
         <Navbar></Navbar>
      </div>
      <div
         class="layer-area flex flex-col flex-auto items-start p-2 overflow-auto"
      >
         <template v-for="i in 50">
            <Layer :name="'Layer ' + i"></Layer>
         </template>
      </div>
   </div>
</template>

<script setup lang="ts">
import { MenuOption, NMenu, useThemeVars } from "naive-ui";
import { reactive, ref, watch } from "vue";
import Navbar from "./navbar.vue";
import Layer from "../../components/layer.vue";

const theme = useThemeVars();
</script>

<style scoped lang="scss">
.layer-navbar {
   background: v-bind("theme.cardColor");
   border: 1px solid v-bind("theme.dividerColor");
   border-left: none;
   border-right: none;
}

.layer-area {
   background: v-bind("theme.cardColor");
}
</style>
