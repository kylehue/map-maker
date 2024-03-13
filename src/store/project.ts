import { reactive } from "vue";

export const projectStore = reactive({
   filename: "untitled project",
   layers: [],
   materials: [],
   tileSize: 32,
});
