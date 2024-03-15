import { computed, reactive, ref, watch } from "vue";
import { Vector } from "../utils/Vector";
import { clamp } from "../utils/clamp";
import { useProjectStore } from "./project";
import { defineStore } from "pinia";

export const useDesignerStore = defineStore("designer", () => {
   const projectStore = useProjectStore();
   const _zoom = ref(1000);
   const _position = reactive(new Vector());
   const _maxTiles = ref(50);
   const _minTiles = ref(5);

   function setZoom(z: number) {
      _zoom.value = clamp(
         z,
         projectStore.tileSize * _minTiles.value,
         projectStore.tileSize * _maxTiles.value
      );
   }

   function addZoom(z: number) {
      setZoom(_zoom.value + z);
   }

   function setMaxTiles(n: number) {
      _maxTiles.value = n;
   }

   function setMinTiles(n: number) {
      _minTiles.value = n;
   }

   const zoom = computed(() => _zoom.value);
   const position = computed(() => _position);
   const minTiles = computed(() => _minTiles.value);
   const maxTiles = computed(() => _maxTiles.value);

   return {
      zoom,
      setZoom,
      addZoom,
      position,
      maxTiles,
      setMaxTiles,
      minTiles,
      setMinTiles,
   };
});
