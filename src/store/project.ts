import { reactive } from "vue";

export const projectStore = reactive({
   filename: "untitled project",
   layers: [],
   selectedLayer: undefined as string | undefined,
   materials: [],
   tileSize: 32,
});
