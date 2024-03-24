import { computed, reactive, ref, watch } from "vue";
import type { Layer, MaterialSplitSettings } from "../types";
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

export const useProjectStore = defineStore("project", () => {
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

   const _materialsSearcher = new MiniSearch({
      fields: ["matrixId", "name"],
      storeFields: ["id"],
      searchOptions: {
         fuzzy: true,
         boost: {
            name: 2,
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

   function duplicateLayer(layer: Layer) {
      for (let i = _layers.length - 1; i >= 0; i--) {
         if (_layers[i] !== layer) continue;
         const copy = Object.assign({}, layer);
         copy.id = generateId();
         copy.name += " copy";
         _layers.splice(i + 1, 0, copy);
         break;
      }
   }

   function deleteLayer(layer: Layer) {
      for (let i = _layers.length - 1; i >= 0; i--) {
         if (_layers[i] !== layer) continue;
         _layers.splice(i, 1);

         if (layer === _selectedLayer.value) {
            _selectedLayer.value = undefined;
         }

         break;
      }
   }

   function createLayer(name = "new layer") {
      const layer: Layer = {
         id: generateId(),
         name,
         isLocked: false,
         isVisible: true,
         matrix: new MapMatrix(),
      };
      layer.matrix.setEmptyMatrixId(_emptyMatrixId.value);
      layer.matrix.setSeparator(_matrixSeparator.value);
      _layers.unshift(layer);
      return layer;
   }

   function moveLayer(layer: Layer, step: number) {
      if (layer.isLocked) return;
      const currentIndex = _layers.indexOf(layer);
      const targetIndex = clamp(currentIndex + step, 0, _layers.length - 1);
      const isSelected = _selectedLayer.value === layer;

      deleteLayer(layer);
      _layers.splice(targetIndex, 0, layer);
      if (isSelected) setSelectedLayer(layer);
   }

   function getMaterialByMatrixId(matrixId: string) {
      return materialsMap.get(matrixId);
   }

   function createMaterial(
      name: string,
      textureBase: string | File | HTMLImageElement | Blob,
      options?: {
         splitData?: Material["splitData"];
      }
   ) {
      options ??= {};
      const material = new Material();
      material.setName(name);
      _materials.unshift(material);
      material.getTexture().init(textureBase);
      if (options.splitData) {
         material.setSplitData(options.splitData);
      }

      return material;
   }

   function duplicateMaterial(material: Material) {
      for (let i = _materials.length - 1; i >= 0; i--) {
         if (_materials[i] !== material) continue;
         const clone = material.clone();
         _materials.splice(i + 1, 0, clone);
         clone.getTexture().init(material.getTexture().getOrigImageCanvasUrl());
         break;
      }
   }

   function deleteMaterial(material: Material) {
      for (let i = _materials.length - 1; i >= 0; i--) {
         if (_materials[i] !== material) continue;
         _materials.splice(i, 1);

         if (material === _selectedMaterial.value) {
            _selectedMaterial.value = undefined;
         }

         if (materialToSplit.value === material) {
            materialToSplit.value = undefined;
            isMaterialSplitterVisible.value = false;
         }

         if (focusedMaterial.value === material) {
            focusedMaterial.value = undefined;
         }

         material.dispose();

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
   }

   function setEmptyMatrixId(id: string) {
      _emptyMatrixId.value = id;
      for (const layer of _layers) {
         layer.matrix.setEmptyMatrixId(id);
      }
   }

   function reset() {
      _filename.value = "untitled project";
      _layers.length = 0;
      _materials.length = 0;
      _tileSize.value = 32;
      _selectedLayer.value = undefined;
      _selectedMaterial.value = undefined;
      _emptyMatrixId.value = ".";
      _matrixSeparator.value = " ";
      materialsMap.clear();
      _materialsSearcher.removeAll();
      _selectedLayer.value = createLayer("Layer 1");
   }

   async function setupNewProject() {
      await ProjectSaver.reset();
      reset();
   }

   reset();

   /**
    * Loads split settings to a material if there's any.
    */
   function loadSplittedMaterialVariants(
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
         const material = createMaterial(variant.name, textureBase);
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
      moveLayer,
      setFilename,
      materials,
      getMaterialByMatrixId,
      createMaterial,
      duplicateMaterial,
      deleteMaterial,
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
   };
});
