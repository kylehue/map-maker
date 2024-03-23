import { MapMatrix } from "../utils/MapMatrix";
import { Material } from "../utils/Material";

export interface Layer {
   id: string;
   name: string;
   isVisible: boolean;
   isLocked: boolean;
   matrix: MapMatrix;
}

export interface MaterialSplitSettings {
   storedMaterialConfigs: Record<
      number,
      {
         row: number;
         column: number;
         variants: {
            matrixId: string;
            name: string;
            rotation: Material["texture"]["rotation"];
            positionOrigin: Material["positionOrigin"];
            isHorizontallyFlipped: boolean;
            isVerticallyFlipped: boolean;
         }[];
      }
   >;
   split: {
      width: number;
      height: number;
   };
   cropInput: {
      topLeft: {
         x: number;
         y: number;
      };
      topRight: {
         x: number;
         y: number;
      };
      bottomLeft: {
         x: number;
         y: number;
      };
      bottomRight: {
         x: number;
         y: number;
      };
   };
   resizeOutput: {
      width: number;
      height: number;
   };
}

export type MaterialSplitJobData = Omit<
   MaterialSplitSettings,
   "storedMaterialConfigs"
> & { imageUrl: string };

export type Tool =
   | "move"
   | "hand"
   | "select"
   | "brush"
   | "eraser"
   | "paint-bucket";
