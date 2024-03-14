<template>
   <NUpload multiple directory-dnd class="w-full h-full">
      <NUploadDragger class="!border-none w-full h-full">
         <NAlert title="Warning" type="warning">
            If you plan to save this project, ensure that you create a dedicated
            folder to store all uploaded files, as we only keep track of
            filepaths.
         </NAlert>
         <NDivider />
         <div style="margin-bottom: 12px">
            <NIcon size="48" :depth="3">
               <PhUpload />
            </NIcon>
         </div>
         <NText style="font-size: 16px">
            Click or drag a file to this area to upload
         </NText>
         <NP depth="3" style="margin: 8px 0 0 0">
            Use this space to keep your tilesheets, tiles, or any other images
            you wish to utilize.
         </NP>
      </NUploadDragger>
   </NUpload>
</template>

<script setup lang="ts">
import {
   NP,
   NText,
   NUpload,
   NUploadDragger,
   NIcon,
   NAlert,
   NDivider,
} from "naive-ui";
import { reactive, ref, watch } from "vue";
import { PhUpload } from "@phosphor-icons/vue";
</script>

<style scoped lang="scss">
:deep(.n-upload-trigger) {
   width: 100%;
   height: 100%;
}
</style>
