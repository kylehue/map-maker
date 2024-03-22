import { MapMatrix } from "../utils/MapMatrix";
import { MaterialTexture } from "../utils/MaterialTexture";

export type MaterialRotation = 90 | 180 | -90 | -180 | 0;
export type MaterialPositionOrigin =
   | "top"
   | "bottom"
   | "left"
   | "right"
   | "center";

export interface Material {
   id: string;
   name: string;
   matrixId: string;
   positionOrigin: MaterialPositionOrigin;
   texture: MaterialTexture;
   splitData?: {
      row: number;
      column: number;
   };
}

export interface Layer {
   id: string;
   name: string;
   isVisible: boolean;
   isLocked: boolean;
   matrix: MapMatrix;
}

export interface MaterialSplitSettings {
   storedMatrixIds: {
      row: number;
      column: number;
      matrixId: string;
   }[];
   split: {
      width: number;
      height: number;
      gap: number;
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

export type Tool =
   | "move"
   | "hand"
   | "select"
   | "brush"
   | "eraser"
   | "paint-bucket";
