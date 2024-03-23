import { computed, reactive } from "vue";
import { MaterialTexture } from "./MaterialTexture";
import { generateId } from "./generate-id";
import { useProjectStore } from "../store/project";
import { cantor } from "./cantor";
import { MaterialSplitSettings } from "../types";

export class Material {
   private id = generateId();
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
   private splitDataConfig: MaterialSplitSettings["storedMaterialConfigs"][number]["variants"][number] =
      {
         name: this.name,
         rotation: this.texture.getRotation(),
         isHorizontallyFlipped: this.texture.getIsHorizontallyFlipped(),
         isVerticallyFlipped: this.texture.getIsVerticallyFlipped(),
         matrixId: this.matrixId,
         positionOrigin: this.positionOrigin,
      };

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

   public setName(name: string) {
      this.name = name;
      this.splitDataConfig.name = name;
   }

   public setMatrixId(matrixId: string) {
      this.matrixId = matrixId;
      this.splitDataConfig.matrixId = matrixId;
   }

   public setPositionOrigin(positionOrigin: Material["positionOrigin"]) {
      this.positionOrigin = positionOrigin;
      this.splitDataConfig.positionOrigin = positionOrigin;
   }

   public setSplitData(splitData: Material["splitData"]) {
      this.splitData = splitData;
      const projectStore = useProjectStore();
      const settings = projectStore.getOrCreateMaterialSplitSettings(
         splitData!.settingsName,
         splitData!.row,
         splitData!.column
      );
      settings?.variants.push(this.splitDataConfig);
   }

   public dispose() {
      // TODO: remove from project store settings
   }

   public clone() {
      const clone = new Material();
      clone.setName(this.name);
      clone.setMatrixId(this.matrixId);
      clone.setPositionOrigin(this.positionOrigin);
      // clone.getTexture().setRotation(this.getTexture().getRotation());
      // clone
      //    .getTexture()
      //    .setHorizontallyFlipped(this.getTexture().getIsHorizontallyFlipped());
      // clone
      //    .getTexture()
      //    .setVerticallyFlipped(this.getTexture().getIsVerticallyFlipped());
      clone.setSplitData(this.splitData);
      if (this.splitData) {
         const projectStore = useProjectStore();
         const settings = projectStore.getOrCreateMaterialSplitSettings(
            this.splitData.settingsName,
            this.splitData.row,
            this.splitData.column
         );
         settings?.variants.push(clone.splitDataConfig);
      }

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
               this.name = name;
               this.splitDataConfig.name = name;
            },
         }),
         matrixId: computed({
            get: () => {
               return this.matrixId;
            },
            set: (matrixId: string) => {
               this.matrixId = matrixId;
               this.splitDataConfig.matrixId = matrixId;
            },
         }),
         positionOrigin: computed({
            get: () => {
               return this.positionOrigin;
            },
            set: (positionOrigin: Material["positionOrigin"]) => {
               this.positionOrigin = positionOrigin;
               this.splitDataConfig.positionOrigin = positionOrigin;
            },
         }),
         rotation: computed({
            get: () => {
               return this.texture.getRotation();
            },
            set: (rotation: MaterialTexture["rotation"]) => {
               this.texture.setRotation(rotation);
               this.splitDataConfig.rotation = rotation;
            },
         }),
         isHorizontallyFlipped: computed({
            get: () => {
               return this.texture.getIsHorizontallyFlipped();
            },
            set: (isHorizontallyFlipped: boolean) => {
               this.texture.setHorizontallyFlipped(isHorizontallyFlipped);
               this.splitDataConfig.isHorizontallyFlipped =
                  isHorizontallyFlipped;
            },
         }),
         isVerticallyFlipped: computed({
            get: () => {
               return this.texture.getIsVerticallyFlipped();
            },
            set: (isVerticallyFlipped: boolean) => {
               this.texture.setVerticallyFlipped(isVerticallyFlipped);
               this.splitDataConfig.isVerticallyFlipped = isVerticallyFlipped;
            },
         }),
         splitData: computed({
            get: () => {
               return this.splitData;
            },
            set: (splitData: Material["splitData"]) => {
               this.splitData = splitData;
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
