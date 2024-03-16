import { Material } from "../types";
import MaterialWorker from "../worker/material-worker?worker";
import { generateId } from "./generate-id";
import { postAsync } from "./worker-utils";

const worker = new MaterialWorker();

const map: Record<string, HTMLCanvasElement> = {};
const loadedImageMap: Record<string, HTMLImageElement> = {};

function createMaterialTransformationKey(
   material: Material,
   width: number,
   height: number
) {
   return btoa(
      JSON.stringify([
         material.id,
         material.isHorizontallyFlipped,
         material.isVerticallyFlipped,
         material.matrixId,
         material.rotation,
         width,
         height,
      ])
   );
}

export async function loadImage(src: string) {
   if (loadedImageMap[src]) return loadedImageMap[src];

   return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
         resolve(img);
         loadedImageMap[src] = img;
      };

      img.onerror = (e) => {
         reject(e);
      };
   });
}

function imageDataToImage(imageData: ImageData) {
   const canvas = document.createElement("canvas");
   const ctx = canvas.getContext("2d")!;
   canvas.width = imageData.width;
   canvas.height = imageData.height;
   ctx.putImageData(imageData, 0, 0);
   return canvas;
}

export async function getTransformedMaterialImage(
   material: Material,
   width: number,
   height: number
) {
   const key = createMaterialTransformationKey(material, width, height);
   if (map[key]) return map[key];
   const canvas = new OffscreenCanvas(width, height);
   const ctx = canvas.getContext("2d")!;
   ctx.imageSmoothingEnabled = false;
   ctx.drawImage(material.image, 0, 0, width, height);
   const imageData = ctx.getImageData(0, 0, width, height);
   const res = await postAsync(worker, "transform", {
      width,
      height,
      rotation: material.rotation,
      isHorizontallyFlipped: material.isHorizontallyFlipped,
      isVerticallyFlipped: material.isVerticallyFlipped,
      imageData,
   });

   const image = imageDataToImage(res.data.imageData);
   map[key] = image;
   material.transformedImage = image;
   material.transformedImageWidth = image.width;
   material.transformedImageHeight = image.height;
   return image;
}
