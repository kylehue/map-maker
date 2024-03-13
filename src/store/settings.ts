import { reactive } from "vue";

export const settingsStore = reactive({
   window: {
      showMatrix: true,
      showMaterials: true
   },
   keybinds: {
      undo: []
   }
});

(window as any).settings = settingsStore;