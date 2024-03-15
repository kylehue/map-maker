import { defineStore } from "pinia";
import { computed, reactive } from "vue";

export const useSettingsStore = defineStore("settings", () => {
   const _window = reactive({
      showMatrix: true,
      showMaterials: true,
   });

   const _keybinds = reactive({
      undo: [],
   });

   const _materialArea = reactive({
      showMatrixId: true,
   });

   const window = computed(() => _window);
   const keybinds = computed(() => _keybinds);
   const materialArea = computed(() => _materialArea);

   return {
      window,
      keybinds,
      materialArea,
   };
});
