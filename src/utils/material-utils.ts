import { Material } from "../types";

const map: Record<string, HTMLImageElement> = {};
const loadedImageMap: Record<string, HTMLImageElement> = {};

function createMaterialTransformationKey(
   material: Material,
   width: number,
   height: number
) {
   return btoa(JSON.stringify(material)) + `${width}x${height}`;
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

export async function getTransformedMaterialImage(
   material: Material,
   width: number,
   height: number
) {
   const key = createMaterialTransformationKey(material, width, height);
   if (map[key]) return map[key];

   return await new Promise<HTMLImageElement>((resolve, reject) => {
      loadImage(material.imageSrc).then((img) => {
         const canvas = document.createElement("canvas");

         // Calculate the bounding box of the rotated image
         const angle = material.rotation * (Math.PI / 180);
         const rotatedWidth =
            Math.abs(width * Math.cos(angle)) +
            Math.abs(height * Math.sin(angle));
         const rotatedHeight =
            Math.abs(width * Math.sin(angle)) +
            Math.abs(height * Math.cos(angle));

         // Set canvas size based on the bounding box
         canvas.width = rotatedWidth;
         canvas.height = rotatedHeight;
         const ctx = canvas.getContext("2d")!;
         ctx.imageSmoothingEnabled = false;
         ctx.save();
         ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
         ctx.rotate(angle);
         ctx.scale(
            material.isHorizontallyFlipped ? -1 : 1,
            material.isVerticallyFlipped ? -1 : 1
         );
         ctx.drawImage(img, -width / 2, -height / 2, width, height);
         ctx.restore();

         const transformedImg = new Image(rotatedWidth, rotatedHeight);
         transformedImg.crossOrigin = "anonymous";
         transformedImg.src = canvas.toDataURL();
         transformedImg.onload = () => {
            map[key] = transformedImg;
            resolve(transformedImg);
         };

         transformedImg.onerror = (e) => {
            reject(e);
         };
      });
   });
}
