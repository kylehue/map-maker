import { useDesignerStore } from "../store/designer";
import { useProjectStore } from "../store/project";
import { useSettingsStore } from "../store/settings";
import { MaterialPositionOrigin, MaterialRotation, Tool } from "../types";

export namespace ProjectSaver {
   export const fileExtension = ".mpmkr";

   export interface ProjectJSON {
      project: {
         layers: {
            name: string;
            isVisible: boolean;
            isLocked: boolean;
            matrixString: string;
         }[];
         materials: {
            name: string;
            matrixId: string;
            positionOrigin: MaterialPositionOrigin;
            texture: {
               url: string;
               rotation: MaterialRotation;
               isHorizontallyFlipped: boolean;
               isVerticallyFlipped: boolean;
            };
         }[];
         tileSize: number;
         emptyMatrixId: string;
         matrixSeparator: string;
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

   export function loadFromJSON(json: ProjectJSON) {
      const projectStore = useProjectStore();
      const settingsStore = useSettingsStore();
      const designerStore = useDesignerStore();

      // setup project
      projectStore.reset();
      projectStore.deleteLayer(projectStore.layers[0]);
      projectStore.setEmptyMatrixId(json.project.emptyMatrixId);
      projectStore.setMatrixSeparator(json.project.matrixSeparator);
      projectStore.setTileSize(json.project.tileSize);

      // add layers
      for (const rawLayer of json.project.layers) {
         const layer = projectStore.createLayer(rawLayer.name);
         layer.isLocked = rawLayer.isLocked;
         layer.isVisible = rawLayer.isVisible;
         layer.matrix.fromString(rawLayer.matrixString);
      }

      // add materials
      for (const rawMaterial of json.project.materials) {
         const material = projectStore.createMaterial(
            rawMaterial.name,
            rawMaterial.texture.url
         );
         material.positionOrigin = rawMaterial.positionOrigin;
         material.matrixId = rawMaterial.matrixId;
         material.texture.setHorizontallyFlipped(
            rawMaterial.texture.isHorizontallyFlipped
         );
         material.texture.setVerticallyFlipped(
            rawMaterial.texture.isVerticallyFlipped
         );
         material.texture.setRotation(rawMaterial.texture.rotation);
      }

      // setup designer
      designerStore.setZoom(json.designer.zoom);
      designerStore.setActiveTool(json.designer.activeTool);
      designerStore.position.x = json.designer.position.x;
      designerStore.position.y = json.designer.position.y;

      // setup settings
      settingsStore.window.showMatrix = json.settings.window.showMatrix;
      settingsStore.window.showMaterials = json.settings.window.showMaterials;
      settingsStore.window.showLayers = json.settings.window.showLayers;
      settingsStore.window.showToolbar = json.settings.window.showToolbar;
      settingsStore.designerArea.showGrid = json.settings.designerArea.showGrid;
      settingsStore.designerArea.showMatrixId =
         json.settings.designerArea.showMatrixId;
      settingsStore.designerArea.showMaterial =
         json.settings.designerArea.showMaterial;
      settingsStore.designerArea.showMapBounds =
         json.settings.designerArea.showMapBounds;
      settingsStore.materialArea.showMatrixId =
         json.settings.materialArea.showMatrixId;
   }

   export function toJSON(): ProjectJSON {
      const projectStore = useProjectStore();
      const settingsStore = useSettingsStore();
      const designerStore = useDesignerStore();

      return {
         project: {
            layers: projectStore.layers.map((v) => {
               return {
                  name: v.name,
                  isLocked: v.isLocked,
                  isVisible: v.isVisible,
                  matrixString: v.matrix.toString(),
               };
            }),
            materials: projectStore.materials.map((v) => {
               return {
                  name: v.name,
                  matrixId: v.matrixId,
                  positionOrigin: v.positionOrigin,
                  texture: {
                     url: v.texture.getOrigImageCanvasURL(),
                     isHorizontallyFlipped:
                        v.texture.getIsHorizontallyFlipped(),
                     isVerticallyFlipped: v.texture.getIsVerticallyFlipped(),
                     rotation: v.texture.getRotation(),
                  },
               };
            }),
            emptyMatrixId: projectStore.emptyMatrixId,
            matrixSeparator: projectStore.matrixSeparator,
            tileSize: projectStore.tileSize,
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

   let currentWritable: FileSystemWritableFileStream | null = null;
   export async function saveAs(downloadIfNotSupported = true) {
      await save(); // save first
      const projectStore = useProjectStore();
      if ("showSaveFilePicker" in window) {
         try {
            if (currentWritable) {
               await currentWritable.close();
               currentWritable = null;
            }

            const handler = await window.showSaveFilePicker({
               types: [
                  {
                     description: "Map Maker Files",
                     accept: {
                        "text/plain": [fileExtension],
                     },
                  },
               ],
               suggestedName: projectStore.filename,
            });

            const writable = await handler.createWritable();
            await writable.truncate(0);
            await writable.write(serialize());
            currentWritable = writable;
         } catch (e) {
            console.warn(e);
         }
      } else if (downloadIfNotSupported) {
         download();
      }
   }

   export async function save(forceIfNotSaved = false) {
      if (!currentWritable) {
         if (forceIfNotSaved) await saveAs(false);
         return;
      }

      try {
         await currentWritable.truncate(0); // clear
         await currentWritable.write(serialize());
      } catch (e) {
         console.warn(e);
      }
   }

   export function isWritableCached() {
      return !!currentWritable;
   }

   export async function resetSaver() {
      if (!currentWritable) return;
      await currentWritable.close();
      currentWritable = null;
   }

   addEventListener("beforeunload", async (e) => {
      await resetSaver();
   });

   export async function open() {
      await save(); // save first
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
            });

            const file = await handler.getFile();
            const fileContent = await file.text();
            loadFromJSON(deserialize(fileContent));

            // update writable
            await resetSaver();
            const writable = await handler.createWritable();
            await writable.truncate(0);
            await writable.write(fileContent);
            currentWritable = writable;
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
}
