import { ref } from "vue";
import { Material } from "../utils/Material";

export const isMaterialSplitterVisible = ref(false);
export const materialToSplit = ref<Material>();

export function useMaterialSplitter(material: Material) {
   isMaterialSplitterVisible.value = true;
   materialToSplit.value = material;
}
