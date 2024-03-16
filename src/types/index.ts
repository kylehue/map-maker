import { MapMatrix } from "../utils/MapMatrix";
import { MaterialTexture } from "../utils/MaterialTexture";

export interface Project {
   filename: string;
   materials: Material[];
   layers: Layer[];
   tileSize: number;
   selectedLayer?: Layer;
   selectedMaterial?: Material;
}

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
}

export interface Layer {
   id: string;
   name: string;
   isVisible: boolean;
   isLocked: boolean;
   matrix: MapMatrix;
}

export type Tool = "move" | "select" | "brush" | "eraser" | "paint-bucket";
