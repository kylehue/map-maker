import { ref } from "vue";
import { Material } from "../types";

export const isMaterialManagerVisible = ref(false);
export const focusedMaterial = ref<Material>();

export function useMaterialManager(material?: Material) {
   isMaterialManagerVisible.value = true;
   focusedMaterial.value = material;
}
