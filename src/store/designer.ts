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
   const _isFullScreen = ref(false);
   const _maxTiles = ref(50);
   const _minTiles = ref(5);
   const _activeTool = ref<Tool>("move");
   const _designer = ref<Designer>();

   onMounted(() => {
      _designer.value = new Designer();
   });

   function getMinZoom() {
      return projectStore.tileSize * _minTiles.value;
   }

   function getMaxZoom() {
      return projectStore.tileSize * _maxTiles.value;
   }

   function setZoom(z: number) {
      _zoom.value = clamp(z, getMinZoom(), getMaxZoom());
   }

   function addZoom(z: number) {
      setZoom(_zoom.value + z);
   }

   function getZoomNormalizer() {
      const sx = designer.value?.camera.viewport.scale.x || 1;
      const sy = designer.value?.camera.viewport.scale.y || 1;
      return Math.max(1 / sx, 1 / sy);
   }

   function move(x: number, y: number) {
      const zoomNormalizer = getZoomNormalizer();
      _position.x += x * zoomNormalizer;
      _position.y += y * zoomNormalizer;
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

   function resetView() {
      _zoom.value = 1000;
      centerView();
   }

   function centerView() {
      _position.x = 0;
      _position.y = 0;
   }

   function setFullScreen(v: boolean) {
      _isFullScreen.value = v;
   }

   const zoom = computed(() => _zoom.value);
   const position = computed(() => _position);
   const minTiles = computed(() => _minTiles.value);
   const maxTiles = computed(() => _maxTiles.value);
   const activeTool = computed(() => _activeTool.value);
   const designer = computed(() => _designer.value);
   const isFullScreen = computed(() => _isFullScreen.value);

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
      resetView,
      centerView,
      isFullScreen,
      setFullScreen,
      getMinZoom,
      getMaxZoom,
      getZoomNormalizer,
      move,
   };
});
