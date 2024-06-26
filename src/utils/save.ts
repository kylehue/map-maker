import { ref } from "vue";
import { useDesignerStore } from "../store/designer";
import { useProjectStore } from "../store/project";
import { useSettingsStore } from "../store/settings";
import { MaterialSplitSettings, Tool } from "../types";
import { Writer } from "./writer";
import { Material } from "./Material";

export namespace ProjectSaver {
   export const fileExtension = ".mpmkr";

   export interface ProjectJSON {
      project: {
         layers: {
            name: string;
            isVisible: boolean;
            isLocked: boolean;
            matrixString: string;
            index: number;
         }[];
         materials: {
            name: string;
            matrixId: string;
            positionOrigin: Material["positionOrigin"];
            texture: {
               url: string;
               rotation: Material["texture"]["rotation"];
               isHorizontallyFlipped: boolean;
               isVerticallyFlipped: boolean;
            };
         }[];
         tileSize: number;
         emptyMatrixId: string;
         matrixSeparator: string;
         savedMaterialSplitSettings: MaterialSplitSettings[];
      };
      settings: {
         window: {
            showMatrix: boolean;
            showMaterials: boolean;
            showLayers: boolean;
            showToolbar: boolean;
         };
         materialArea: {
            showMatrixId: boolean;
         };
         designerArea: {
            showGrid: boolean;
            showMatrixId: boolean;
            showMaterial: boolean;
            showMapBounds: boolean;
         };
         isAutosaveEnabled: boolean;
      };
      designer: {
         zoom: number;
         position: {
            x: number;
            y: number;
         };
         activeTool: Tool;
      };
   }

   export interface LoadFromJSONOptions {
      filename?: string;
      projectOnly?: boolean;
      keepHistory?: boolean;
   }

   export async function loadFromJSON(
      json: ProjectJSON,
      options: LoadFromJSONOptions = {}
   ) {
      const projectStore = useProjectStore();
      const settingsStore = useSettingsStore();
      const designerStore = useDesignerStore();

      // setup project
      projectStore.reset();
      if (!options.keepHistory) projectStore.clearHistory();
      projectStore.setEmptyMatrixId(json.project.emptyMatrixId);
      projectStore.setMatrixSeparator(json.project.matrixSeparator);
      projectStore.setTileSize(json.project.tileSize);

      // add layers
      for (const rawLayer of json.project.layers) {
         const layer = projectStore.createLayer(rawLayer.name, rawLayer.index);
         layer.isLocked = rawLayer.isLocked;
         layer.isVisible = rawLayer.isVisible;
         layer.matrix.fromString(rawLayer.matrixString);
      }

      // add materials
      for (const rawMaterial of json.project.materials) {
         const material = await projectStore.createMaterial(
            rawMaterial.name,
            rawMaterial.texture.url
         );
         material.setPositionOrigin(rawMaterial.positionOrigin);
         material.setMatrixId(rawMaterial.matrixId);
         material
            .getTexture()
            .setHorizontallyFlipped(rawMaterial.texture.isHorizontallyFlipped);
         material
            .getTexture()
            .setVerticallyFlipped(rawMaterial.texture.isVerticallyFlipped);
         material.getTexture().setRotation(rawMaterial.texture.rotation);
      }

      // add split settings
      for (const settings of json.project.savedMaterialSplitSettings) {
         projectStore.savedMaterialSplitSettings[settings.name] = settings;
      }

      if (options.filename) {
         projectStore.setFilename(options.filename);
      }

      if (!options.projectOnly) {
         // setup designer
         designerStore.setZoom(json.designer.zoom);
         designerStore.setActiveTool(json.designer.activeTool);
         designerStore.position.x = json.designer.position.x;
         designerStore.position.y = json.designer.position.y;

         // setup settings
         settingsStore.window.showMatrix = json.settings.window.showMatrix;
         settingsStore.window.showMaterials =
            json.settings.window.showMaterials;
         settingsStore.window.showLayers = json.settings.window.showLayers;
         settingsStore.window.showToolbar = json.settings.window.showToolbar;
         settingsStore.designerArea.showGrid =
            json.settings.designerArea.showGrid;
         settingsStore.designerArea.showMatrixId =
            json.settings.designerArea.showMatrixId;
         settingsStore.designerArea.showMaterial =
            json.settings.designerArea.showMaterial;
         settingsStore.designerArea.showMapBounds =
            json.settings.designerArea.showMapBounds;
         settingsStore.materialArea.showMatrixId =
            json.settings.materialArea.showMatrixId;
         settingsStore.isAutosaveEnabled = json.settings.isAutosaveEnabled;
      }
   }

   export function toJSON(): ProjectJSON {
      const projectStore = useProjectStore();
      const settingsStore = useSettingsStore();
      const designerStore = useDesignerStore();

      return {
         project: {
            layers: projectStore.layers.map((layer, index) => ({
               name: layer.name,
               isLocked: layer.isLocked,
               isVisible: layer.isVisible,
               matrixString: layer.matrix.toString(),
               index,
            })),
            materials: projectStore.materials.map((v) => {
               return {
                  name: v.getName(),
                  matrixId: v.getMatrixId(),
                  positionOrigin: v.getPositionOrigin(),
                  texture: {
                     url: v.getTexture().getOrigImageCanvasUrl(),
                     isHorizontallyFlipped: v
                        .getTexture()
                        .getIsHorizontallyFlipped(),
                     isVerticallyFlipped: v
                        .getTexture()
                        .getIsVerticallyFlipped(),
                     rotation: v.getTexture().getRotation(),
                  },
               };
            }),
            emptyMatrixId: projectStore.emptyMatrixId,
            matrixSeparator: projectStore.matrixSeparator,
            tileSize: projectStore.tileSize,
            savedMaterialSplitSettings: JSON.parse(
               JSON.stringify(
                  Object.values(projectStore.savedMaterialSplitSettings)
               )
            ),
         },
         designer: {
            activeTool: designerStore.activeTool,
            position: {
               x: designerStore.position.x,
               y: designerStore.position.y,
            },
            zoom: designerStore.zoom,
         },
         settings: {
            window: Object.assign({}, settingsStore.window),
            designerArea: Object.assign({}, settingsStore.designerArea),
            materialArea: Object.assign({}, settingsStore.materialArea),
            isAutosaveEnabled: settingsStore.isAutosaveEnabled,
         },
      };
   }

   export function serialize() {
      return JSON.stringify(toJSON());
   }

   export function deserialize(str: string): ProjectJSON {
      return JSON.parse(str);
   }

   export function download() {
      const projectStore = useProjectStore();
      const blob = new Blob([serialize()], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = projectStore.filename + fileExtension;
      link.href = url;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   }

   export const cachedWritable = ref<FileSystemWritableFileStream>();
   export async function open() {
      if ("showOpenFilePicker" in window) {
         try {
            const [handler] = await window.showOpenFilePicker({
               types: [
                  {
                     description: "Map Maker Files",
                     accept: {
                        "text/plain": [fileExtension],
                     },
                  },
               ],
               excludeAcceptAllOption: true,
            });

            // Save last project first before updating the current writer
            await save();

            // Close the last project's writer
            if (cachedWritable.value) Writer.closeWriter(cachedWritable.value);

            // Update writable
            const writable = await handler.createWritable();
            cachedWritable.value = writable;

            // Load project from json
            const file = await handler.getFile();
            const fileContent = await file.text();
            await loadFromJSON(deserialize(fileContent), {
               filename: file.name,
            });

            // Save current
            await save();
         } catch (e) {
            console.warn(e);
         }
      } else {
         const input = document.createElement("input");
         input.type = "file";
         input.accept = fileExtension;
         input.style.display = "none";
         input.addEventListener("change", function (event: any) {
            const file = event.target?.files?.[0];
            if (file) {
               const reader = new FileReader();
               reader.onload = function (event) {
                  const fileContent = event.target?.result as string;
                  loadFromJSON(deserialize(fileContent));
               };
               reader.readAsText(file);
            }
            document.body.removeChild(input);
         });
         document.body.appendChild(input);
         input.click();
      }
   }

   export async function saveAs(downloadIfNotSupported = true) {
      if ("showSaveFilePicker" in window) {
         try {
            const projectStore = useProjectStore();
            const handler = await window.showSaveFilePicker({
               types: [
                  {
                     description: "Map Maker Files",
                     accept: {
                        "text/plain": [fileExtension],
                     },
                  },
               ],
               excludeAcceptAllOption: true,
               suggestedName: projectStore.filename,
            });

            // Save last project first before updating the current writer
            await save();

            // Close the last project's writer
            if (cachedWritable.value) Writer.closeWriter(cachedWritable.value);

            // Update writable
            const writable = await handler.createWritable();
            cachedWritable.value = writable;
            await save();
         } catch (e) {
            console.warn(e);
         }
      } else if (downloadIfNotSupported) {
         download();
      }
   }

   export async function save(forceIfNotSaved = false) {
      if (!cachedWritable.value) {
         if (forceIfNotSaved) await saveAs(false);
         return;
      }

      try {
         Writer.enqueue(cachedWritable.value, serialize());
      } catch (e) {
         console.warn(e);
      }
   }

   export function isBusySaving() {
      return cachedWritable.value && Writer.isWriterBusy(cachedWritable.value);
   }

   export async function reset() {
      if (!cachedWritable.value) return;
      await Writer.closeWriter(cachedWritable.value);
      cachedWritable.value = undefined;
   }

   addEventListener("beforeunload", (e) => {
      // immediately close writer
      if (cachedWritable.value) {
         cachedWritable.value.close();
      }

      const projectStore = useProjectStore();
      if (projectStore.isEmpty) return;

      e.returnValue = "Changes you made may not be saved.";
      return "Changes you made may not be saved.";
   });
}
