import { ref } from "vue";
import { Material } from "../utils/Material";

export const isMaterialManagerVisible = ref(false);
export const focusedMaterial = ref<Material>();

export function useMaterialManager(material?: Material) {
   isMaterialManagerVisible.value = true;
   focusedMaterial.value = material;
}
