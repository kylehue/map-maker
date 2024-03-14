import { DropdownOption } from "naive-ui";
import { onMounted, h, ref, reactive } from "vue";

type SelectHandler = (key: any, hide: () => void) => void;
export const isContextMenuVisible = ref(false);
export const contextMenuOptions = ref<DropdownOption[]>([]);
export const contextMenuHandler = ref<SelectHandler>(() => {});
export const contextMenuPosition = reactive({
   x: 0,
   y: 0,
});

export function useContextMenu(
   options: DropdownOption[],
   onSelect: SelectHandler,
   x = 0,
   y = 0
) {
   // @ts-ignore
   contextMenuOptions.value = options;
   contextMenuHandler.value = onSelect;
   isContextMenuVisible.value = true;
   contextMenuPosition.x = x;
   contextMenuPosition.y = y;
}
