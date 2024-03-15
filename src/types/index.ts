export interface Project {
   filename: string;
   materials: Material[];
   layers: Layer[];
   tileSize: number;
   selectedLayer?: Layer;
   selectedMaterial?: Material;
}

export type MaterialRotation = 90 | 180 | -90 | -180 | 0;

export interface Material {
   id: string;
   name: string;
   imageSrc: string;
   matrixId: string;
   rotation: MaterialRotation;
   isHorizontallyFlipped: boolean;
   isVerticallyFlipped: boolean;
   image: HTMLImageElement;
}

export interface Layer {
   id: string;
   name: string;
   isVisible: boolean;
   isLocked: boolean;
}

export type Tool = "move" | "select" | "brush" | "eraser" | "paint-bucket";
