import { ref } from "vue";
import { Material } from "../types";

export const isMaterialSplitterVisible = ref(false);
export const materialToSplit = ref<Material>();

export function useMaterialSplitter(material: Material) {
   isMaterialSplitterVisible.value = true;
   materialToSplit.value = material;
}
