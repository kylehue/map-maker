<template>
   <div
      v-if="isMaterialManagerVisible"
      class="material-manager-container absolute z-50 w-screen h-screen flex items-center justify-center"
      @click.self="() => (isMaterialManagerVisible = false)"
   >
      <Transition name="bounce" appear>
         <NCard
            v-if="isMaterialManagerVisible"
            title="Material Manager"
            closable
            class="w-5/6 h-5/6 shadow-2xl"
            @close="() => (isMaterialManagerVisible = false)"
         >
            <div class="relative flex flex-col w-full h-full overflow-hidden">
               <div class="flex flex-row w-fit z-10">
                  <NInput placeholder="Search" clearable>
                     <template #prefix>
                        <NIcon>
                           <PhMagnifyingGlass />
                        </NIcon>
                     </template>
                  </NInput>
               </div>
               <div class="flex flex-col absolute overflow-auto w-full h-full pt-16">
                  <NCollapse class="flex flex-col overflow-auto h-full">
                     <template v-for="i in 20">
                        <MaterialManagerItem></MaterialManagerItem>
                     </template>
                  </NCollapse>
               </div>
            </div>
         </NCard>
      </Transition>
   </div>
</template>

<script setup lang="ts">
import { NCard, NInput, NCollapse, NIcon } from "naive-ui";
import { isMaterialManagerVisible } from "../composables/use-material-manager";
import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import MaterialManagerItem from "./material-manager-item.vue";
</script>

<style scoped lang="scss">
.material-manager-container {
   background-color: rgba(0, 0, 0, 0.5);
   pointer-events: all;
}
</style>
