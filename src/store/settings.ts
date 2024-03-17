import { defineStore } from "pinia";
import { computed, reactive } from "vue";

export const useSettingsStore = defineStore("settings", () => {
   const _window = reactive({
      showMatrix: true,
      showMaterials: true,
      showLayers: true,
      showToolbar: true,
   });

   const _keybinds = reactive({
      undo: [],
   });

   const _materialArea = reactive({
      showMatrixId: true,
   });

   const _designerArea = reactive({
      showGrid: true,
      showMatrixId: false,
      showMaterial: true,
      showMapBounds: true,
   });

   const window = computed(() => _window);
   const keybinds = computed(() => _keybinds);
   const materialArea = computed(() => _materialArea);
   const designerArea = computed(() => _designerArea);

   return {
      window,
      keybinds,
      materialArea,
      designerArea,
   };
});
