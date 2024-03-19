<template>
   <div class="flex items-center justify-between w-full px-8">
      <div class="flex items-center w-fit">
         <NMenu
            v-model:value="navActiveKey"
            mode="horizontal"
            :options="navOptions"
            responsive
            dropdown-placement="top-start"
            :dropdown-props="{
               arrowPointToCenter: true,
               showArrow: true,
            }"
            @update:value="handleSelect"
         />
         <NCheckbox
            v-if="isSavedToLocal"
            v-model:checked="settingsStore.isAutosaveEnabled"
            class="text-nowrap"
         >
            Enable Autosave
         </NCheckbox>
      </div>
      <ThemeSwitcher></ThemeSwitcher>
   </div>
</template>

<script setup lang="ts">
import {
   MenuOption,
   NButton,
   NInputNumber,
   NMenu,
   NText,
   useDialog,
   useMessage,
   NCheckbox,
   NInput,
} from "naive-ui";
import { computed, h, reactive, ref, watch } from "vue";
import ThemeSwitcher from "../components/theme-switcher.vue";
import { useProjectStore } from "../store/project";
import { useSettingsStore } from "../store/settings";
import { PhStackSimple } from "@phosphor-icons/vue";
import { ProjectSaver } from "../utils/save";

enum Navigation {
   FILE_DROPDOWN,
   FILE_NEW_PROJECT,
   FILE_OPEN_FILES,
   FILE_SAVE,
   FILE_SAVE_AS,
   FILE_EXPORT_DROPDOWN,
   EXPORT_MATRIX,
   EXPORT_PNG,
   WINDOW_DROPDOWN,
   WINDOW_SHOW_MATRIX,
   WINDOW_SHOW_MATERIALS,
   WINDOW_SHOW_LAYERS,
   WINDOW_SHOW_TOOLBAR,
   EDIT_DROPDOWN,
   EDIT_UNDO,
   EDIT_REDO,
   EDIT_CHANGE_TILE_SIZE,
   EDIT_CHANGE_EMPTY_MATRIX_ID,
   EDIT_CHANGE_MATRIX_SEPARATOR,
}

const isSavedToLocal = computed(() => !!ProjectSaver.cachedWritable.value);
const message = useMessage();
const dialog = useDialog();
const settingsStore = useSettingsStore();
const projectStore = useProjectStore();
const navActiveKey = ref<Navigation>();
const navOptions: MenuOption[] = [
   {
      key: Navigation.FILE_DROPDOWN,
      label: "File",
      children: [
         {
            key: Navigation.FILE_NEW_PROJECT,
            label: "New...",
         },
         {
            key: Navigation.FILE_OPEN_FILES,
            label: "Open Project...",
         },
         {
            key: Navigation.FILE_SAVE,
            label: "Save",
         },
         {
            key: Navigation.FILE_SAVE_AS,
            label: "Save as...",
         },
         {
            key: Navigation.FILE_EXPORT_DROPDOWN,
            label: "Export",
            children: [
               {
                  key: Navigation.EXPORT_PNG,
                  label: "Image (.png)",
               },
               {
                  key: Navigation.EXPORT_MATRIX,
                  label: "Matrix (.txt files)",
               },
            ],
         },
      ],
   },
   {
      key: Navigation.EDIT_DROPDOWN,
      label: "Edit",
      children: [
         {
            key: Navigation.EDIT_UNDO,
            label: "Undo",
         },
         {
            key: Navigation.EDIT_REDO,
            label: "Redo",
         },
         {
            key: Navigation.EDIT_CHANGE_TILE_SIZE,
            label: "Change tile size...",
         },
         {
            key: Navigation.EDIT_CHANGE_EMPTY_MATRIX_ID,
            label: "Change empty matrix ID...",
         },
         {
            key: Navigation.EDIT_CHANGE_MATRIX_SEPARATOR,
            label: "Change matrix separator...",
         },
      ],
   },
   {
      key: Navigation.WINDOW_DROPDOWN,
      label: "Window",
      children: [
         {
            key: Navigation.WINDOW_SHOW_MATRIX,
            label: () =>
               `${settingsStore.window.showMatrix ? "Hide" : "Show"} Matrix`,
         },
         {
            key: Navigation.WINDOW_SHOW_MATERIALS,
            label: () =>
               `${
                  settingsStore.window.showMaterials ? "Hide" : "Show"
               } Materials`,
         },
         {
            key: Navigation.WINDOW_SHOW_LAYERS,
            label: () =>
               `${settingsStore.window.showLayers ? "Hide" : "Show"} Layers`,
         },
         {
            key: Navigation.WINDOW_SHOW_TOOLBAR,
            label: () =>
               `${settingsStore.window.showToolbar ? "Hide" : "Show"} Toolbar`,
         },
      ],
   },
];

function handleSelect(e: Navigation) {
   switch (e) {
      case Navigation.FILE_NEW_PROJECT:
         confirmNewProject();
         break;
      case Navigation.FILE_OPEN_FILES:
         openProject();
         break;
      case Navigation.FILE_SAVE:
         ProjectSaver.save(true).then(() => {
            if (!isSavedToLocal.value) return;
            message.success("Project has been saved.");
         });
         break;
      case Navigation.FILE_SAVE_AS:
         saveProject();
         break;
      case Navigation.EXPORT_MATRIX:
         break;
      case Navigation.EXPORT_PNG:
         break;
      case Navigation.EDIT_UNDO:
         break;
      case Navigation.EDIT_REDO:
         break;
      case Navigation.EDIT_CHANGE_TILE_SIZE:
         promptChangeTileSize();
         break;
      case Navigation.EDIT_CHANGE_EMPTY_MATRIX_ID:
         promptChangeEmptyMatrixId();
         break;
      case Navigation.EDIT_CHANGE_MATRIX_SEPARATOR:
         promptChangeMatrixSeparator();
         break;
      case Navigation.WINDOW_SHOW_LAYERS:
         settingsStore.window.showLayers = !settingsStore.window.showLayers;
         break;
      case Navigation.WINDOW_SHOW_MATRIX:
         settingsStore.window.showMatrix = !settingsStore.window.showMatrix;
         break;
      case Navigation.WINDOW_SHOW_MATERIALS:
         settingsStore.window.showMaterials =
            !settingsStore.window.showMaterials;
         break;
      case Navigation.WINDOW_SHOW_TOOLBAR:
         settingsStore.window.showToolbar = !settingsStore.window.showToolbar;
         break;
   }
}

// Handle autosave
let lastInterval: number | null = null;
watch(
   () => settingsStore.isAutosaveEnabled,
   (isAutosaveEnabled) => {
      if (isAutosaveEnabled) {
         message.success("Autosave has been enabled.", {
            closable: true,
            duration: 10000,
         });

         lastInterval = setInterval(() => {
            ProjectSaver.save();
         }, 1000 * 60 * settingsStore.autosaveIntervalInMinutes);
      } else {
         message.warning("Autosave has been disabled.", {
            closable: true,
            duration: 10000,
         });
         if (typeof lastInterval == "number") {
            clearInterval(lastInterval);
            lastInterval = null;
         }
      }
   },
   {
      immediate: true,
   }
);

async function openProject() {
   try {
      await ProjectSaver.open();
   } catch (e) {
      message.error("Invalid file.");
   }
}

async function saveProject() {
   try {
      await ProjectSaver.saveAs();
   } catch (e) {
      message.error("Invalid file.");
   }
}

function confirmNewProject() {
   dialog.warning({
      title: "New Project",
      content: "Are you sure you want to create a new project?",
      action() {
         return h(
            NButton,
            {
               secondary: true,
               type: "warning",
               onClick(e) {
                  projectStore.setupNewProject();
               },
            },
            () => "Yes"
         );
      },
   });
}

function promptChangeTileSize() {
   dialog.create({
      title: "Change tile size",
      showIcon: false,
      content() {
         return h("div", {}, [
            h(NInputNumber, {
               "onUpdate:value": (n) => {
                  if (!n) return;
                  projectStore.setTileSize(n);
               },
               value: projectStore.tileSize,
            }),
         ]);
      },
      autoFocus: true,
   });
}

function promptChangeEmptyMatrixId() {
   dialog.create({
      title: "Change empty matrix ID",
      showIcon: false,
      content() {
         return h("div", {}, [
            h(NInput, {
               "onUpdate:value": (n) => {
                  if (!n) return;
                  projectStore.setEmptyMatrixId(n);
               },
               value: projectStore.emptyMatrixId,
            }),
         ]);
      },
      autoFocus: true,
   });
}

function promptChangeMatrixSeparator() {
   dialog.create({
      title: "Change matrix separator",
      showIcon: false,
      content() {
         return h("div", {}, [
            h(NInput, {
               "onUpdate:value": (n) => {
                  if (!n) return;
                  projectStore.setMatrixSeparator(n);
               },
               value: projectStore.matrixSeparator,
            }),
         ]);
      },
      autoFocus: true,
   });
}
</script>
