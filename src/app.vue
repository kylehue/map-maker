<template>
   <MaterialSplitter></MaterialSplitter>
   <MaterialManager></MaterialManager>
   <ContextMenu></ContextMenu>
   <div class="flex flex-col w-screen h-screen">
      <div
         v-if="!designerStore.isFullScreen"
         class="navbar flex w-screen h-10 flex-shrink-0 items-center"
      >
         <Navbar></Navbar>
      </div>
      <div class="body flex flex-auto">
         <div class="flex flex-col flex-auto w-full">
            <Splitpanes>
               <Pane
                  class="min-w-5 overflow-hidden"
                  :size="designerStore.isFullScreen ? 100 : 70"
               >
                  <DesignArea></DesignArea>
               </Pane>
               <Pane
                  v-if="
                     !designerStore.isFullScreen &&
                     (settingsStore.window.showMaterials ||
                        settingsStore.window.showMatrix ||
                        settingsStore.window.showLayers)
                  "
                  class="min-w-5 overflow-hidden"
                  :size="30"
               >
                  <Splitpanes class="flex flex-col h-full" horizontal>
                     <Pane
                        v-if="
                           settingsStore.window.showMaterials ||
                           settingsStore.window.showMatrix
                        "
                        class="relative flex-grow min-h-5 overflow-hidden"
                        :size="70"
                     >
                        <div class="flex flex-col w-full h-full absolute">
                           <NTabs
                              size="small"
                              type="segment"
                              animated
                              class="*:!text-xs border-t-0"
                           >
                              <NTabPane
                                 v-if="settingsStore.window.showMaterials"
                                 name="1"
                                 tab="Materials"
                              >
                                 <MaterialArea></MaterialArea>
                              </NTabPane>
                              <NTabPane
                                 v-if="settingsStore.window.showMatrix"
                                 name="2"
                                 tab="Matrix"
                              >
                                 <MatrixArea></MatrixArea>
                              </NTabPane>
                           </NTabs>
                        </div>
                     </Pane>
                     <Pane
                        v-if="settingsStore.window.showLayers"
                        class="relative flex-grow min-h-5 overflow-hidden"
                        :size="30"
                     >
                        <div class="flex flex-col w-full h-full absolute">
                           <LayerArea></LayerArea>
                        </div>
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
import { useThemeVars, NTabs, NTabPane } from "naive-ui";
import Navbar from "./panes/navbar.vue";
import DesignArea from "./panes/design-area/index.vue";
import MaterialArea from "./panes/material-area/index.vue";
import MatrixArea from "./panes/matrix-area/index.vue";
import LayerArea from "./panes/layer-area/index.vue";
import { useSettingsStore } from "./store/settings";
import ContextMenu from "./components/context-menu.vue";
import MaterialManager from "./components/material-manager.vue";
import MaterialSplitter from "./components/material-splitter.vue";
import { useDesignerStore } from "./store/designer";
import { useProjectStore } from "./store/project";
import { ProjectSaver } from "./utils/save";

const projectStore = useProjectStore();
const settingsStore = useSettingsStore();
const designerStore = useDesignerStore();
const theme = useThemeVars();

projectStore.setupNewProject();

addEventListener("keydown", (event) => {
   if (event.ctrlKey) {
      if (event.code == "KeyZ") {
         event.preventDefault();
         if (event.shiftKey) {
            projectStore.redoState();
         } else {
            projectStore.undoState();
         }
      } else if (event.code == "KeyY") {
         event.preventDefault();
         projectStore.redoState();
      } else if (event.code == "KeyS") {
         event.preventDefault();
         ProjectSaver.save(true);
      } else if (event.code == "KeyO") {
         event.preventDefault();
         ProjectSaver.open();
      }
   }
});
</script>

<style>
:root {
   --n-option-text-color-active: yellow;
   --n-option-color-active: yellow;
}
</style>

<style lang="scss" scoped>
:deep(.n-tabs),
:deep(.n-tabs-pane-wrapper),
:deep(.n-tab-pane) {
   width: 100%;
   height: 100%;
   padding: 0 !important;
   margin: 0 !important;
}

.navbar {
   background-color: v-bind("theme.cardColor");
   border-bottom: 1px solid v-bind("theme.dividerColor");
}

.body {
   background-color: v-bind("theme.bodyColor");
}
</style>
