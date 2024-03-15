import { computed, onMounted, reactive, ref, watch } from "vue";
import { Vector } from "../utils/Vector";
import { clamp } from "../utils/clamp";
import { useProjectStore } from "./project";
import { defineStore } from "pinia";
import { Tool } from "../types";
import { Designer } from "../designer/Designer";

export const useDesignerStore = defineStore("designer", () => {
   const projectStore = useProjectStore();
   const _zoom = ref(1000);
   const _position = reactive(new Vector());
   const _maxTiles = ref(50);
   const _minTiles = ref(5);
   const _activeTool = ref<Tool>("move");
   const _designer = ref<Designer>();

   onMounted(() => {
      _designer.value = new Designer();
   });

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

   function setActiveTool(s: Tool) {
      _activeTool.value = s;
   }

   const zoom = computed(() => _zoom.value);
   const position = computed(() => _position);
   const minTiles = computed(() => _minTiles.value);
   const maxTiles = computed(() => _maxTiles.value);
   const activeTool = computed(() => _activeTool.value);
   const designer = computed(() => _designer.value);

   return {
      designer,
      zoom,
      setZoom,
      addZoom,
      position,
      maxTiles,
      setMaxTiles,
      minTiles,
      setMinTiles,
      activeTool,
      setActiveTool,
   };
});
