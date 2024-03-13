<template>
   <div class="flex flex-col w-full h-full">
      <NTabs size="small" type="card" animated addable class="*:!text-xs border-t-0">
         <NTabPane name="1" tab="Layer 1">
            <textarea spellcheck="false"></textarea>
         </NTabPane>
      </NTabs>
   </div>
</template>

<script setup lang="ts">
import { NTabs, NTabPane, NInput } from "naive-ui";
import { MenuOption, NMenu } from "naive-ui";
import { reactive, ref, watch } from "vue";
import Navbar from "./navbar.vue";
import { useThemeVars } from "naive-ui";

const theme = useThemeVars();
</script>

<style scoped lang="scss">
:deep(.n-tabs),
:deep(.n-tabs-pane-wrapper),
:deep(.n-tab-pane) {
   width: 100%;
   height: 100%;
   padding: 0 !important;
   margin: 0 !important;
}

:deep(.n-tab-pane) {
   padding: 5px !important;
}

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
