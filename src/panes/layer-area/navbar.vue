<template>
   <div class="flex w-full h-full items-center justify-between px-4">
      <div class="flex items-center">
         <NButton size="tiny" secondary>
            <template #icon>
               <NIcon>
                  <PhStackSimple />
               </NIcon>
            </template>
            New Layer
         </NButton>
      </div>
      <div class="flex items-center">
         <NTooltip animated>
            <template #trigger>
               <NButton size="tiny" quaternary circle>
                  <template #icon>
                     <PhLockSimple />
                  </template>
               </NButton>
            </template>
            Lock
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton size="tiny" quaternary circle>
                  <template #icon>
                     <PhCopy />
                  </template>
               </NButton>
            </template>
            Duplicate
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton size="tiny" quaternary circle>
                  <template #icon>
                     <PhPencilSimple />
                  </template>
               </NButton>
            </template>
            Rename
         </NTooltip>
         <NTooltip animated>
            <template #trigger>
               <NButton size="tiny" quaternary circle>
                  <template #icon>
                     <PhTrashSimple />
                  </template>
               </NButton>
            </template>
            Delete
         </NTooltip>
      </div>
   </div>
</template>

<script setup lang="ts">
import { NButton, NTooltip, NIcon } from "naive-ui";
import {
   PhStackSimple,
   PhLockSimple,
   PhTrashSimple,
   PhCopy,
   PhPencilSimple
} from "@phosphor-icons/vue";
</script>
