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
   imageSrc: string;
   matrixId: string;
   rotation: MaterialRotation;
   isHorizontallyFlipped: boolean;
   isVerticallyFlipped: boolean;
   image: HTMLImageElement;
   transformedImage: CanvasImageSource;
   transformedImageWidth: number;
   transformedImageHeight: number;
   positionOrigin: MaterialPositionOrigin;
}

export interface Layer {
   id: string;
   name: string;
   isVisible: boolean;
   isLocked: boolean;
   matrix: string[][];
}

export type Tool = "move" | "select" | "brush" | "eraser" | "paint-bucket";
