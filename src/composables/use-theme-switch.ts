import { ref } from "vue";

type Theme = "dark" | "light";

export const currentTheme = ref<Theme>("dark");

export function useThemeSwitch(theme: Theme) {
   currentTheme.value = theme;
}