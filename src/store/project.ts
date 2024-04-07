import { computed, reactive, ref, watch } from "vue";
import { HistoryStateAction, Layer, MaterialSplitSettings } from "../types";
import { defineStore } from "pinia";
import { generateId } from "../utils/generate-id";
import { clamp } from "../utils/clamp";
import MiniSearch from "minisearch";
import { MaterialTexture } from "../utils/MaterialTexture";
import { MapMatrix } from "../utils/MapMatrix";
import { ProjectSaver } from "../utils/save";
import {
   isMaterialSplitterVisible,
   materialToSplit,
} from "../composables/use-material-splitter";
import { focusedMaterial } from "../composables/use-material-manager";
import { cantor } from "../utils/cantor";
import { Material } from "../utils/Material";
import { useDesignerStore } from "./designer";
import { useSettingsStore } from "./settings";
import { escapeRegex } from "../utils/escape-regex";

export const useProjectStore = defineStore("project", () => {
   const designerStore = useDesignerStore();
   const settingsStore = useSettingsStore();
   const _filename = ref("untitled project");
   const _layers: Layer[] = reactive([]);
   const _materials: Material[] = reactive([]);
   const _tileSize = ref(32);
   const _selectedLayer = ref<Layer>();
   const _selectedMaterial = ref<Material>();
   const _emptyMatrixId = ref(".");
   const _matrixSeparator = ref(" ");
   const materialsMap = new Map<string, Material>();
   const savedMaterialSplitSettings: Record<string, MaterialSplitSettings> =
      reactive({});
   const maxHistoryState = 200;
   const historyStates: {
      action: HistoryStateAction;
      undo: Function;
      redo: Function;
   }[] = reactive([]);
   const historyStateIndex = ref(0);

   const _materialsSearcher = new MiniSearch({
      fields: ["matrixId", "name"],
      storeFields: ["id"],
      searchOptions: {
         fuzzy: true,
         boost: {
            name: 5,
         },
         prefix: true,
      },
   });

   let _materialsSearcherNeedsUpdate = true;
   watch(_materials, (_materials) => {
      _materialsSearcherNeedsUpdate = true;

      // update hashmap
      materialsMap.clear();
      for (const material of _materials) {
         materialsMap.set(material.getMatrixId(), material);
      }
   });

   function saveState(
      action: HistoryStateAction,
      undoFunction: Function,
      redoFunction: Function
   ) {
      // clear future
      historyStates.splice(historyStateIndex.value + 1);

      // save
      historyStates.push({
         action,
         undo: undoFunction,
         redo: redoFunction,
      });
      historyStateIndex.value = historyStates.length - 1;

      if (historyStates.length > maxHistoryState) {
         historyStates.shift();
      }
   }

   function timeTravel(step: number) {
      if (!historyStates.length || !step) return;
      const targetStateIndex = historyStateIndex.value + step;

      const operation = step < 0 ? "undo" : "redo";
      const stepDir = operation == "undo" ? -1 : 1;
      for (
         // If operation is redo, start after the current state
         let i =
            operation == "redo"
               ? historyStateIndex.value + 1
               : historyStateIndex.value;
         operation == "redo" ? i <= targetStateIndex : i > targetStateIndex;
         i += stepDir
      ) {
         const state = historyStates[i];
         if (!state) continue;

         // If operation is undo, we must undo the current state.
         if (i === historyStateIndex.value && operation == "undo") {
            state.undo();
         } else {
            state[operation]();
         }
      }

      historyStateIndex.value = clamp(
         targetStateIndex,
         0,
         historyStates.length - 1
      );
   }

   function undoState() {
      timeTravel(-1);
      designerStore.designer?.repaint();
   }

   function redoState() {
      timeTravel(1);
      designerStore.designer?.repaint();
   }

   function peekUndo() {
      return historyStates[historyStateIndex.value - 1] as
         | (typeof historyStates)[number]
         | undefined;
   }

   function peekRedo() {
      return historyStates[historyStateIndex.value + 1] as
         | (typeof historyStates)[number]
         | undefined;
   }

   function makeLayersMatrixSizeUniform() {
      // should only take care of visible layers
      const visibleLayers = _layers.filter((v) => v.isVisible);
      if (visibleLayers.length <= 1) return;

      const largestNonEmptyLayer = visibleLayers.sort((a, b) => {
         return (
            b.matrix.getNonEmptyTotalSize() - a.matrix.getNonEmptyTotalSize()
         );
      })[0];

      const size = largestNonEmptyLayer.matrix.getNonEmptyTotalSize();
      for (const layer of _layers) {
         layer.matrix.setMinSize(size);
      }
   }

   function duplicateLayer(layer: Layer) {
      for (let i = _layers.length - 1; i >= 0; i--) {
         if (_layers[i].id !== layer.id) continue;
         const copy = Object.assign({}, layer);
         copy.id = generateId();
         copy.name += " copy";
         _layers.splice(i + 1, 0, copy);

         if (settingsStore.isAutosaveEnabled) {
            ProjectSaver.save();
         }
         return copy;
      }
   }

   function deleteLayer(layer: Layer) {
      for (let i = _layers.length - 1; i >= 0; i--) {
         if (_layers[i].id !== layer.id) continue;

         if (layer.id === _selectedLayer.value?.id) {
            _selectedLayer.value = _layers[i + 1] ?? _layers[i - 1];
         }

         _layers.splice(i, 1);
         break;
      }

      makeLayersMatrixSizeUniform();
      designerStore.designer?.repaint();

      if (settingsStore.isAutosaveEnabled) {
         ProjectSaver.save();
      }
   }

   function restoreLayer(layer: Layer) {
      if (_layers.find((v) => v.id === layer.id)) return;
      _layers.unshift(layer);

      makeLayersMatrixSizeUniform();
      designerStore.designer?.repaint();

      if (settingsStore.isAutosaveEnabled) {
         ProjectSaver.save();
      }
   }

   function createLayer(name = "New layer", targetIndex?: number) {
      const layer: Layer = {
         id: generateId(),
         name,
         isLocked: false,
         isVisible: true,
         matrix: new MapMatrix(),
      };
      layer.matrix.setEmptyMatrixId(_emptyMatrixId.value);
      layer.matrix.setSeparator(_matrixSeparator.value);
      if (typeof targetIndex == "number") {
         _layers.splice(targetIndex, 0, layer);
      } else {
         _layers.unshift(layer);
      }

      if (_layers.length === 1) {
         setSelectedLayer(layer);
      }

      makeLayersMatrixSizeUniform();

      if (settingsStore.isAutosaveEnabled) {
         ProjectSaver.save();
      }

      return layer;
   }

   function moveLayer(layer: Layer, step: number) {
      if (layer.isLocked) return;
      const currentIndex = _layers.indexOf(layer);
      const targetIndex = clamp(currentIndex + step, 0, _layers.length - 1);
      const isSelected = _selectedLayer.value?.id === layer.id;

      _layers.splice(currentIndex, 1);
      _layers.splice(targetIndex, 0, layer);
      if (isSelected) setSelectedLayer(layer);
      designerStore.designer?.repaint();

      if (settingsStore.isAutosaveEnabled) {
         ProjectSaver.save();
      }
   }

   function getMaterialByMatrixId(matrixId: string) {
      return materialsMap.get(matrixId);
   }

   async function createMaterial(
      name: string,
      textureBase: string | File | HTMLImageElement | Blob,
      options?: {
         splitData?: Material["splitData"];
      }
   ) {
      options ??= {};
      const material = new Material();
      await material.getTexture().init(textureBase);
      material.setName(name);

      // Create matrix id for the material (based on name)
      // Make sure the matrix id doesn't contain the matrix separator
      const separatorRegex = new RegExp(
         escapeRegex(_matrixSeparator.value),
         "g"
      );
      const separatorReplacement = _matrixSeparator.value === " " ? "-" : " ";
      const assignedMatrixId = name.replace(
         separatorRegex,
         separatorReplacement
      );
      material.setMatrixId(assignedMatrixId);

      _materials.unshift(material);
      if (options.splitData) {
         material.setSplitData(options.splitData);
      }

      if (settingsStore.isAutosaveEnabled) {
         ProjectSaver.save();
      }

      return material;
   }

   function restoreMaterial(material: Material) {
      if (_materials.find((v) => v.getId() === material.getId())) return;
      _materials.unshift(material);
      material.restore();
      designerStore.designer?.repaint();

      if (settingsStore.isAutosaveEnabled) {
         ProjectSaver.save();
      }
   }

   async function duplicateMaterial(material: Material) {
      for (let i = _materials.length - 1; i >= 0; i--) {
         if (_materials[i].getId() !== material.getId()) continue;
         const clone = material.clone();
         await clone
            .getTexture()
            .init(material.getTexture().getOrigImageCanvasUrl());
         clone.setMatrixId(clone.getName());
         _materials.splice(i + 1, 0, clone);

         if (settingsStore.isAutosaveEnabled) {
            ProjectSaver.save();
         }
         return clone;
      }
   }

   function deleteMaterial(material: Material) {
      for (let i = _materials.length - 1; i >= 0; i--) {
         if (_materials[i].getId() !== material.getId()) continue;

         if (material.getId() === _selectedMaterial.value?.getId()) {
            _selectedMaterial.value = _materials[i + 1] ?? _materials[i - 1];
         }

         if (materialToSplit.value?.getId() === material.getId()) {
            materialToSplit.value = undefined;
            isMaterialSplitterVisible.value = false;
         }

         if (focusedMaterial.value?.getId() === material.getId()) {
            focusedMaterial.value = undefined;
         }

         material.dispose();
         _materials.splice(i, 1);
         designerStore.designer?.repaint();

         if (settingsStore.isAutosaveEnabled) {
            ProjectSaver.save();
         }

         break;
      }
   }

   function searchMaterial(searchText: string) {
      if (!searchText) return _materials;

      if (_materialsSearcherNeedsUpdate) {
         _materialsSearcher.removeAll();
         _materialsSearcher.addAll(_materials);
         _materialsSearcherNeedsUpdate = false;
      }

      const searchResults = _materialsSearcher.search(searchText);
      const ids = new Set();
      for (const result of searchResults) {
         ids.add(result.id);
      }
      return _materials.filter((v) => ids.has(v.getId()));
   }

   function setFilename(name: string) {
      _filename.value = name;
   }

   function setTileSize(size: number) {
      _tileSize.value = size;
   }

   function setSelectedLayer(layer: Layer) {
      _selectedLayer.value = layer;
   }

   function setSelectedMaterial(material: Material) {
      _selectedMaterial.value = material;
   }

   function setMatrixSeparator(sep: string) {
      _matrixSeparator.value = sep;
      for (const layer of _layers) {
         layer.matrix.setSeparator(sep);
      }
      designerStore.designer?.repaint();
   }

   function setEmptyMatrixId(id: string) {
      _emptyMatrixId.value = id;
      for (const layer of _layers) {
         layer.matrix.setEmptyMatrixId(id);
      }
      designerStore.designer?.repaint();
   }

   function reset() {
      _layers.length = 0;
      _materials.length = 0;
      _tileSize.value = 32;
      _selectedLayer.value = undefined;
      _selectedMaterial.value = undefined;
      _emptyMatrixId.value = ".";
      _matrixSeparator.value = " ";
      materialsMap.clear();
      _materialsSearcher.removeAll();
   }

   async function setupNewProject() {
      await ProjectSaver.reset();
      reset();
      clearHistory();
      _filename.value = "untitled project";
      _selectedLayer.value = createLayer("Layer");
      saveState(
         "start",
         () => {},
         () => {}
      );
   }

   function clearHistory() {
      historyStates.length = 0;
      historyStateIndex.value = 0;
   }

   reset();

   /**
    * Loads split settings to a material if there's any.
    */
   async function loadSplittedMaterialVariants(
      settingsName: string,
      textureBase: Blob,
      row: number,
      column: number
   ) {
      const loadedMaterials: Material[] = [];
      const settings = savedMaterialSplitSettings[settingsName];
      if (!settings) return loadedMaterials;
      const config = settings.storedMaterialConfigs[cantor(row, column)];
      if (!config) return loadedMaterials;

      for (const variant of config.variants) {
         const material = await createMaterial(variant.name, textureBase);
         variant.id = material.getId();
         material.setName(variant.name);
         material.setMatrixId(variant.matrixId);
         material.setPositionOrigin(variant.positionOrigin);
         material.getTexture().setRotation(variant.rotation);
         material
            .getTexture()
            .setHorizontallyFlipped(variant.isHorizontallyFlipped);
         material
            .getTexture()
            .setVerticallyFlipped(variant.isVerticallyFlipped);
         material.setSplitData({
            settingsName,
            row,
            column,
         });

         loadedMaterials.push(material);
      }

      return loadedMaterials;
   }

   function getOrCreateMaterialSplitSettings(
      settingsName: string,
      row: number,
      column: number
   ) {
      const settings = savedMaterialSplitSettings[settingsName];
      if (!settings) return;
      const posId = cantor(row, column);
      settings.storedMaterialConfigs[posId] ??= {
         row,
         column,
         variants: [],
      };

      return settings.storedMaterialConfigs[posId];
   }

   const filename = computed(() => _filename.value);
   const emptyMatrixId = computed(() => _emptyMatrixId.value);
   const matrixSeparator = computed(() => _matrixSeparator.value);
   const layers = computed(() => _layers);
   const materials = computed(() => _materials);
   const tileSize = computed(() => _tileSize.value);
   const selectedLayer = computed(() => _selectedLayer.value);
   const selectedMaterial = computed(() => _selectedMaterial.value);
   const isEmpty = computed(() => {
      return (
         _layers.length == 1 &&
         !_layers[0].matrix.toString().length &&
         _materials.length == 0
      );
   });
   const canRedo = computed(
      () =>
         historyStates.length &&
         historyStateIndex.value < historyStates.length - 1
   );
   const canUndo = computed(
      () => historyStates.length && historyStateIndex.value > 0
   );

   return {
      filename,
      emptyMatrixId,
      matrixSeparator,
      setMatrixSeparator,
      setEmptyMatrixId,
      layers,
      createLayer,
      duplicateLayer,
      deleteLayer,
      restoreLayer,
      moveLayer,
      setFilename,
      materials,
      getMaterialByMatrixId,
      createMaterial,
      duplicateMaterial,
      deleteMaterial,
      restoreMaterial,
      searchMaterial,
      tileSize,
      setTileSize,
      selectedLayer,
      setSelectedLayer,
      selectedMaterial,
      setSelectedMaterial,
      reset,
      setupNewProject,
      isEmpty,
      savedMaterialSplitSettings,
      loadSplittedMaterialVariants,
      getOrCreateMaterialSplitSettings,
      clearHistory,
      saveState,
      undoState,
      redoState,
      canRedo,
      canUndo,
      peekUndo,
      peekRedo,
      historyStates,
      historyStateIndex,
      makeLayersMatrixSizeUniform,
   };
});
