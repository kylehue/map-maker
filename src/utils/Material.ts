import { computed, reactive } from "vue";
import { MaterialTexture } from "./MaterialTexture";
import { generateId } from "./generate-id";
import { useProjectStore } from "../store/project";
import { cantor } from "./cantor";
import { MaterialSplitSettings } from "../types";

export class Material {
   private readonly id = generateId();
   private name = "";
   private matrixId = generateId();
   private positionOrigin: "top" | "bottom" | "left" | "right" | "center" =
      "center";
   // TODO: making this reactive is ugly
   private texture: MaterialTexture = reactive(
      new MaterialTexture()
   ) as MaterialTexture;
   private splitData?: {
      settingsName: string;
      row: number;
      column: number;
   } = undefined;

   constructor() {}

   public getId() {
      return this.id;
   }

   public getName() {
      return this.name;
   }

   public getMatrixId() {
      return this.matrixId;
   }

   public getPositionOrigin() {
      return this.positionOrigin;
   }

   public getTexture() {
      return this.texture;
   }

   public getSplitData() {
      return this.splitData;
   }

   private updateSplitDataConfig() {
      if (!this.splitData) return;
      const projectStore = useProjectStore();
      const settings = projectStore.getOrCreateMaterialSplitSettings(
         this.splitData.settingsName,
         this.splitData.row,
         this.splitData.column
      );
      if (!settings) return;
      let splitConfig = settings.variants.find((v) => v.id === this.id);
      if (!splitConfig) {
         splitConfig = {
            id: this.id,
            name: this.name,
            matrixId: this.matrixId,
            positionOrigin: this.positionOrigin,
            rotation: this.texture.getRotation(),
            isHorizontallyFlipped: this.texture.getIsHorizontallyFlipped(),
            isVerticallyFlipped: this.texture.getIsVerticallyFlipped(),
         };
         settings.variants.push(splitConfig);
         return;
      }
      splitConfig.name = this.name;
      splitConfig.matrixId = this.matrixId;
      splitConfig.positionOrigin = this.positionOrigin;
      splitConfig.rotation = this.texture.getRotation();
      splitConfig.isHorizontallyFlipped =
         this.texture.getIsHorizontallyFlipped();
      splitConfig.isVerticallyFlipped = this.texture.getIsVerticallyFlipped();
   }

   public setName(name: string) {
      this.name = name;
      this.updateSplitDataConfig();
   }

   public setMatrixId(matrixId: string) {
      this.matrixId = matrixId;
      this.updateSplitDataConfig();
   }

   public setPositionOrigin(positionOrigin: Material["positionOrigin"]) {
      this.positionOrigin = positionOrigin;
      this.updateSplitDataConfig();
   }

   public setSplitData(splitData: Material["splitData"]) {
      this.splitData = splitData;
      this.updateSplitDataConfig();
   }

   public dispose() {
      // Remove from split settings variants
      if (!this.splitData) return;
      const projectStore = useProjectStore();
      const settings = projectStore.getOrCreateMaterialSplitSettings(
         this.splitData.settingsName,
         this.splitData.row,
         this.splitData.column
      );
      if (!settings) return;
      for (let i = settings.variants.length - 1; i >= 0; i--) {
         const variant = settings.variants[i];
         if (variant.id === this.id) {
            settings.variants.splice(i, 1);
            break;
         }
      }
   }

   public clone() {
      const clone = new Material();
      clone.setName(this.name);
      clone.setMatrixId(this.matrixId);
      clone.setPositionOrigin(this.positionOrigin);
      clone.getTexture().setRotation(this.getTexture().getRotation());
      clone
         .getTexture()
         .setHorizontallyFlipped(this.getTexture().getIsHorizontallyFlipped());
      clone
         .getTexture()
         .setVerticallyFlipped(this.getTexture().getIsVerticallyFlipped());
      clone.setSplitData(this.splitData);
      return clone;
   }

   public createComputedModels() {
      return {
         id: computed(() => this.id),
         name: computed({
            get: () => {
               return this.name;
            },
            set: (name: string) => {
               this.setName(name);
            },
         }),
         matrixId: computed({
            get: () => {
               return this.matrixId;
            },
            set: (matrixId: string) => {
               this.setMatrixId(matrixId);
            },
         }),
         positionOrigin: computed({
            get: () => {
               return this.positionOrigin;
            },
            set: (positionOrigin: Material["positionOrigin"]) => {
               this.setPositionOrigin(positionOrigin);
            },
         }),
         rotation: computed({
            get: () => {
               return this.texture.getRotation();
            },
            set: (rotation: MaterialTexture["rotation"]) => {
               this.texture.setRotation(rotation);
               this.updateSplitDataConfig();
            },
         }),
         isHorizontallyFlipped: computed({
            get: () => {
               return this.texture.getIsHorizontallyFlipped();
            },
            set: (isHorizontallyFlipped: boolean) => {
               this.texture.setHorizontallyFlipped(isHorizontallyFlipped);
               this.updateSplitDataConfig();
            },
         }),
         isVerticallyFlipped: computed({
            get: () => {
               return this.texture.getIsVerticallyFlipped();
            },
            set: (isVerticallyFlipped: boolean) => {
               this.texture.setVerticallyFlipped(isVerticallyFlipped);
               this.updateSplitDataConfig();
            },
         }),
         splitData: computed({
            get: () => {
               return this.splitData;
            },
            set: (splitData: Material["splitData"]) => {
               this.setSplitData(splitData);
            },
         }),
         origImageCanvas: computed(() => this.texture.getOrigImageCanvas()),
         origImageCanvasUrl: computed(() =>
            this.texture.getOrigImageCanvasUrl()
         ),
         imageCanvas: computed(() => this.texture.getImageCanvas()),
         imageCanvasUrl: computed(() => this.texture.getImageCanvasUrl()),
      };
   }
}
