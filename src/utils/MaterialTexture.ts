import { Material } from "./Material";

export class MaterialTexture {
   private origImageCanvas = document.createElement("canvas");
   private origImageCanvasUrl = this.origImageCanvas.toDataURL();
   private imageCanvas = document.createElement("canvas");
   private ctx = this.imageCanvas.getContext("2d")!;
   private imageCanvasUrl = this.imageCanvas.toDataURL();
   private rotation: 90 | 180 | -90 | -180 | 0 = 0;
   private isHorizontallyFlipped = false;
   private isVerticallyFlipped = false;
   constructor() {}

   public async init(base: File | HTMLImageElement | string | Blob) {
      await new Promise((resolve) => {
         let url;
         if (base instanceof File || base instanceof Blob) {
            url = URL.createObjectURL(base);
         } else if (base instanceof HTMLImageElement) {
            url = base.src;
         } else {
            url = base;
         }

         const img = new Image();
         img.src = url;
         img.onload = () => {
            this.origImageCanvas.width = img.width;
            this.origImageCanvas.height = img.height;
            const ctx = this.origImageCanvas.getContext("2d")!;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);
            this.origImageCanvasUrl = this.origImageCanvas.toDataURL();
            this.updateCanvas();
            resolve(1);
         };

         img.onerror = () => {
            resolve(1);
         };
      });

      return this;
   }

   private updateCanvas() {
      const origWidth = this.origImageCanvas.width;
      const origHeight = this.origImageCanvas.height;
      const angle = this.rotation * (Math.PI / 180);
      const rotatedWidth =
         Math.abs(origWidth * Math.cos(angle)) +
         Math.abs(origHeight * Math.sin(angle));
      const rotatedHeight =
         Math.abs(origWidth * Math.sin(angle)) +
         Math.abs(origHeight * Math.cos(angle));

      this.imageCanvas.width = rotatedWidth;
      this.imageCanvas.height = rotatedHeight;

      this.ctx.imageSmoothingEnabled = false;
      this.ctx.save();
      this.ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
      this.ctx.rotate(angle);
      this.ctx.scale(
         this.isHorizontallyFlipped ? -1 : 1,
         this.isVerticallyFlipped ? -1 : 1
      );
      this.ctx.drawImage(
         this.origImageCanvas,
         -origWidth / 2,
         -origHeight / 2,
         origWidth,
         origHeight
      );
      this.ctx.restore();
      this.imageCanvasUrl = this.imageCanvas.toDataURL();
   }

   public setRotation(rotation: MaterialTexture["rotation"]) {
      this.rotation = rotation;
      this.updateCanvas();
   }

   public setHorizontallyFlipped(isHorizontallyFlipped: boolean) {
      this.isHorizontallyFlipped = isHorizontallyFlipped;
      this.updateCanvas();
   }

   public setVerticallyFlipped(isVerticallyFlipped: boolean) {
      this.isVerticallyFlipped = isVerticallyFlipped;
      this.updateCanvas();
   }

   public getImageCanvas() {
      return this.imageCanvas;
   }

   public getOrigImageCanvas() {
      return this.origImageCanvas;
   }

   public getImageCanvasUrl() {
      return this.imageCanvasUrl;
   }

   public getOrigImageCanvasUrl() {
      return this.origImageCanvasUrl;
   }

   public getIsHorizontallyFlipped() {
      return this.isHorizontallyFlipped;
   }

   public getIsVerticallyFlipped() {
      return this.isVerticallyFlipped;
   }

   public getRotation() {
      return this.rotation;
   }
}
