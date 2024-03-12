<template>
   <div class="flex flex-col w-screen h-screen">
      <div class="navbar flex w-screen h-12 flex-shrink-0 items-center px-6">
         <n-menu
            v-model:value="mainNavActiveKey"
            mode="horizontal"
            :options="navOptions"
            responsive
         />
      </div>
      <div class="body flex w-screen h-full">
         <div class="flex flex-col absolute">
            
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { MenuOption, NMenu, useThemeVars } from "naive-ui";
import { ref } from "vue";

const theme = useThemeVars();

const mainNavActiveKey = ref();
const navOptions: MenuOption[] = [
   {
      key: "file",
      label: "File",
      children: [
         {
            key: "import",
            label: "Merge files",
         },
      ],
   },
];
</script>

<style lang="scss" scoped>
.navbar {
   background-color: v-bind("theme.cardColor");
   border-bottom: 1px solid v-bind("theme.dividerColor");
}

.body {
   background-color: v-bind("theme.bodyColor");
}
</style>
