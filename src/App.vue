<template>
   <div class="flex flex-col w-screen h-screen">
      <div class="navbar flex w-screen h-10 flex-shrink-0 items-center">
         <navbar></navbar>
      </div>
      <div class="body flex flex-auto">
         <div class="flex flex-col flex-auto w-full">
            <Splitpanes>
               <Pane class="min-w-5 overflow-hidden" :size="60">
                  <DesignArea></DesignArea>
               </Pane>
               <Pane class="min-w-5 overflow-hidden" :size="40">
                  <Splitpanes horizontal>
                     <Pane
                        v-if="settingsStore.window.showMatrix"
                        class="min-h-5 overflow-hidden"
                        :size="50"
                     >
                        <MatrixArea></MatrixArea>
                     </Pane>
                     <Pane
                        v-if="settingsStore.window.showMaterials"
                        class="min-h-5 overflow-hidden"
                        :size="50"
                     >
                        <MaterialArea></MaterialArea>
                     </Pane>
                  </Splitpanes>
               </Pane>
            </Splitpanes>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from "splitpanes";
import { useThemeVars } from "naive-ui";
import navbar from "./panes/navbar.vue";
import DesignArea from "./panes/design-area/index.vue";
import MaterialArea from "./panes/material-area.vue";
import MatrixArea from "./panes/matrix-area/index.vue";
import { settingsStore } from "./store/settings";

const theme = useThemeVars();
</script>

<style lang="scss" scoped>
.navbar {
   background-color: v-bind("theme.cardColor");
   border-bottom: 1px solid v-bind("theme.dividerColor");
}

.body {
   background-color: v-bind("theme.bodyColor");
}
</style>./panes/matrix-area/index.vue
