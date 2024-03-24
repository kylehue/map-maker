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
   name: string;
   storedMaterialConfigs: Record<
      number,
      {
         row: number;
         column: number;
         variants: {
            id: string;
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
   isResizingOutputsEnabled: boolean;
   isCroppingInputEnabled: boolean;
}

export type MaterialSplitJobData = Omit<
   MaterialSplitSettings,
   "storedMaterialConfigs" | "name"
> & { imageUrl: string };

export type Tool =
   | "move"
   | "hand"
   | "select"
   | "brush"
   | "eraser"
   | "paint-bucket";

export type HistoryStateAction =
   | "start"
   | "split-settings-delete"
   | "material-upload"
   | "material-split"
   | "material-horizontal-flip"
   | "material-vertical-flip"
   | "material-rotate"
   | "material-name"
   | "material-matrix-id"
   | "material-position-origin"
   | "material-duplicate"
   | "material-delete"
   | "layer-name"
   | "layer-create"
   | "layer-move-up"
   | "layer-move-down"
   | "layer-lock"
   | "layer-duplicate"
   | "layer-delete"
   | "layer-visible"
   | "layer-edit-matrix";
