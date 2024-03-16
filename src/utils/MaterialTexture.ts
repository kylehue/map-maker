import { MaterialRotation } from "../types";

export class MaterialTexture {
   private origImageCanvas = document.createElement("canvas");
   private origImageCanvasURL = this.origImageCanvas.toDataURL();
   private imageCanvas = document.createElement("canvas");
   private ctx = this.imageCanvas.getContext("2d")!;
   private imageCanvasURL = this.imageCanvas.toDataURL();
   private rotation: MaterialRotation = 0;
   private isHorizontallyFlipped = false;
   private isVerticallyFlipped = false;
   constructor() {}

   public init(base: File | HTMLImageElement | string) {
      let url;
      if (base instanceof File) {
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
         ctx.drawImage(img, 0, 0);
         this.origImageCanvasURL = this.origImageCanvas.toDataURL();
         this.updateCanvas();
      };
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
      this.imageCanvasURL = this.imageCanvas.toDataURL();
   }

   public setRotation(rotation: MaterialRotation) {
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

   public getOriginalCanvas() {
      return this.origImageCanvas;
   }

   public getImageCanvasURL() {
      return this.imageCanvasURL;
   }

   public getOrigImageCanvasURL() {
      return this.origImageCanvasURL;
   }
}
