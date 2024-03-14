<template>
   <div class="flex w-full h-full items-center justify-between px-4">
      <div class="flex items-center gap-1">
         <NUpload
            multiple
            directory-dnd
            accept="image/*"
            :on-change="handleFileUpload"
            class="flex items-center"
         >
            <NButton size="tiny" secondary>
               <template #icon>
                  <NIcon>
                     <PhUploadSimple />
                  </NIcon>
               </template>
               Load...
            </NButton>
         </NUpload>
         <NButton size="tiny" secondary>
            <template #icon>
               <NIcon>
                  <PhGearSix />
               </NIcon>
            </template>
            Manager...
         </NButton>
      </div>
      <div class="flex items-center">
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
import { NButton, NTooltip, NIcon, NUpload, UploadProps } from "naive-ui";
import {
   PhStackSimple,
   PhLockSimple,
   PhTrashSimple,
   PhCopy,
   PhPencilSimple,
   PhGearSix,
   PhUploadSimple,
} from "@phosphor-icons/vue";

type FileUploadData = Parameters<NonNullable<UploadProps["onChange"]>>[0];

function handleFileUpload(data: FileUploadData) {
   // TODO: add to materials
}
</script>
