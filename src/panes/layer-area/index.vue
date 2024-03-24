<template>
   <div class="flex flex-col w-full h-full">
      <div class="layer-navbar flex w-full h-8 flex-shrink-0 items-center">
         <Navbar></Navbar>
      </div>
      <div
         ref="layerContainerRef"
         class="layer-area flex flex-col flex-auto items-start p-2 overflow-auto"
         @click.self.right="handleRightClick"
      >
         <template v-for="layer in projectStore.layers" :key="layer.id">
            <Layer
               :ref="
                  (e) => {
                     layersRef[layer.id] = {
                        item: e,
                        layer,
                     };
                  }
               "
               :layer="layer"
            ></Layer>
         </template>
      </div>
   </div>
</template>

<script setup lang="ts">
import { DropdownOption, MenuOption, NMenu, useThemeVars } from "naive-ui";
import { Ref, onUpdated, reactive, ref, watch } from "vue";
import Navbar from "./navbar.vue";
import Layer from "./layer-item.vue";
import { useProjectStore } from "../../store/project";
import type { Layer as ILayer } from "../../types";
import { useContextMenu } from "../../composables/use-context-menu";

const layersRef: Record<
   string,
   {
      item: any;
      layer: ILayer;
   }
> = reactive({});
const layerContainerRef = ref<HTMLDivElement>();
const projectStore = useProjectStore();
const theme = useThemeVars();

enum MaterialContextMenu {
   CREATE_NEW_LAYER,
}

const contextMenuOptions: DropdownOption[] = [
   {
      label: "Create new layer",
      key: MaterialContextMenu.CREATE_NEW_LAYER,
   },
];

function handleContextMenuSelect(e: MaterialContextMenu, hide: Function) {
   switch (e) {
      case MaterialContextMenu.CREATE_NEW_LAYER:
         projectStore.createLayer();
         break;
   }

   hide();
}

function handleRightClick(e: MouseEvent) {
   e.preventDefault();
   useContextMenu(
      contextMenuOptions,
      handleContextMenuSelect,
      e.pageX,
      e.pageY
   );
}

function scrollToSelectedLayerElement() {
   const selectedLayerRef = layersRef[projectStore.selectedLayer?.id ?? ""];
   if (!selectedLayerRef || !layerContainerRef.value) return;

   const container = layerContainerRef.value;
   const element = selectedLayerRef.item.elRef;

   // Get the bounding rectangles
   const containerRect = container.getBoundingClientRect();
   const elementRect = element.getBoundingClientRect();

   // Calculate positions
   const elementTopRelativeToContainer = elementRect.top - containerRect.top;
   const elementBottomRelativeToContainer =
      elementRect.bottom - containerRect.top;

   // Check if the element is outside the visible area of the container
   if (
      elementTopRelativeToContainer < 0 ||
      elementBottomRelativeToContainer > container.offsetHeight
   ) {
      // Element is outside, scroll the container
      container.scrollTo({
         top:
            element.offsetTop -
            container.offsetTop -
            container.offsetHeight / 2 +
            element.offsetHeight / 2,
         behavior: "smooth", // Optional: smooth scroll
      });
   }
}

onUpdated(() => {
   scrollToSelectedLayerElement();
});
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
