<template>
   <div class="flex w-full h-full items-center justify-between px-4">
      <div class="flex items-center">
         <NButton
            size="tiny"
            secondary
            @click="$emit('save')"
            :disabled="props.isSaved"
         >
            <template #icon>
               <NIcon>
                  <PhFloppyDisk />
               </NIcon>
            </template>
            Save changes
         </NButton>
      </div>
   </div>
</template>

<script setup lang="ts">
import { NButton, NTooltip, NIcon, useMessage } from "naive-ui";
import { PhFloppyDisk } from "@phosphor-icons/vue";

const props = defineProps<{
   isSaved: boolean;
}>();
</script>
