import { reactive, watch } from "vue";
import { Vector } from "../utils/Vector";
import { clamp } from "../utils/clamp";
import { projectStore } from "./project";

export const designerStore = reactive({
   zoom: 1000,
   position: new Vector(),
   maxTiles: 50,
   minTiles: 5
});

watch(
   designerStore,
   () => {
      clampZoom();
   },
   { immediate: true }
);

function clampZoom() {
   designerStore.zoom = clamp(
      designerStore.zoom,
      projectStore.tileSize * designerStore.minTiles,
      projectStore.tileSize * designerStore.maxTiles
   );
}
