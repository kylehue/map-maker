import { ref } from "vue";

export const isMaterialManagerVisible = ref(false);

export function useMaterialManager() {
   isMaterialManagerVisible.value = true;
}
