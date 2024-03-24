import type { MaterialSplitJobData } from "../types";
import { type WorkerJob } from "../utils/worker-utils";

async function imageUrlToImageBitMap(imageUrl: string) {
   const response = await fetch(imageUrl);
   const blob = await response.blob();
   return await createImageBitmap(blob);
}

async function split(data: MaterialSplitJobData) {
   const materials: {
      blob: Blob;
      row: number;
      column: number;
   }[] = [];

   // crop first
   const totalWidth = data.cropInput.topRight.x - data.cropInput.topLeft.x;
   const totalHeight = data.cropInput.bottomLeft.y - data.cropInput.topLeft.y;
   const croppedCanvas = new OffscreenCanvas(totalWidth, totalHeight);
   const croppedContext = croppedCanvas.getContext("2d")!;
   croppedContext.imageSmoothingEnabled = false;
   croppedContext.drawImage(
      await imageUrlToImageBitMap(data.imageUrl),
      data.cropInput.topLeft.x,
      data.cropInput.topLeft.y,
      totalWidth,
      totalHeight,
      0,
      0,
      totalWidth,
      totalHeight
   );

   // split
   const totalX = totalWidth / data.split.width;
   const totalY = totalHeight / data.split.height;
   for (let row = 0; row < totalY; row++) {
      for (let column = 0; column < totalX; column++) {
         const canvas = new OffscreenCanvas(
            data.resizeOutput.width,
            data.resizeOutput.height
         );
         const context = canvas.getContext("2d")!;
         context.imageSmoothingEnabled = false;
         context.drawImage(
            croppedCanvas,
            column * data.split.width,
            row * data.split.height,
            data.split.width,
            data.split.height,
            0,
            0,
            data.resizeOutput.width,
            data.resizeOutput.height
         );
         materials.push({
            blob: await canvas.convertToBlob({
               type: "image/png",
               quality: 100,
            }),
            row,
            column,
         });
      }
   }

   return materials;
}

export type SplittedMaterials = Awaited<ReturnType<typeof split>>;

self.onmessage = async (e) => {
   const job: WorkerJob = e.data;
   const resultToBeSent = Object.assign({}, job);
   resultToBeSent.data = {};

   if (job.name == "split") {
      resultToBeSent.data.splittedMaterials = await split(job.data);
   }

   postMessage(resultToBeSent);
};

self.onerror = (e) => {
   console.error(e);
};
