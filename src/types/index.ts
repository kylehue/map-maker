export interface Project {
   filename: string;
   materials: Material[];
   layers: Layer[];
   tileSize: number;
   selectedLayer?: Layer;
   selectedMaterial?: Material;
}

export type MaterialRotation =
   | "90"
   | "180"
   | "270"
   | "-90"
   | "-180"
   | "-270"
   | "0";

export interface Material {
   id: string;
   filename: string;
   imageSrc: string;
   matrixId: string;
   rotation: MaterialRotation;
   isHorizontallyFlipped: boolean;
   isVerticallyFlipped: boolean;
}

export interface Layer {
   id: string;
   name: string;
   isVisible: boolean;
   isLocked: boolean;
}
