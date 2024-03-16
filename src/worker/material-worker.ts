function imageDataToCanvas(imageData: ImageData) {
   const canvas = new OffscreenCanvas(imageData.width, imageData.height);
   const ctx = canvas.getContext("2d")!;
   ctx.putImageData(imageData, 0, 0);
   return canvas;
}

self.onmessage = (e) => {
   const data = e.data;
   const payload = data.data;
   const resultToBeSent = Object.assign({}, data);
   resultToBeSent.data = {};

   if (data.name == "transform") {
      const width = payload.width;
      const height = payload.height;
      const canvas = new OffscreenCanvas(width, height);

      // Calculate the bounding box of the rotated image
      const angle = payload.rotation * (Math.PI / 180);
      const rotatedWidth =
         Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
      const rotatedHeight =
         Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));

      // Set canvas size based on the bounding box
      canvas.width = rotatedWidth;
      canvas.height = rotatedHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
      ctx.rotate(angle);
      ctx.scale(
         payload.isHorizontallyFlipped ? -1 : 1,
         payload.isVerticallyFlipped ? -1 : 1
      );
      ctx.drawImage(
         imageDataToCanvas(payload.imageData),
         -width / 2,
         -height / 2,
         width,
         height
      );
      ctx.restore();

      resultToBeSent.data.imageData = ctx.getImageData(
         0,
         0,
         canvas.width,
         canvas.height
      );

      postMessage(resultToBeSent);
   }
};

self.onerror = (e) => {
   console.error(e);
};
