// modified version of: github.com/robashton/camera/blob/master/camera.js
import { Vector } from "../utils/Vector";

export class Camera {
   public readonly context: CanvasRenderingContext2D;
   public readonly position = new Vector();
   public distance = 1000;
   public fieldOfView = Math.PI / 4.0;
   public aspectRatio = 0;
   public readonly viewport = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
      scale: new Vector(1, 1),
   };

   constructor(context: CanvasRenderingContext2D) {
      this.context = context;
      this.init();
   }

   private init() {
      this.updateViewport();
   }

   private applyScale() {
      this.context.scale(this.viewport.scale.x, this.viewport.scale.y);
   }

   private applyTranslation() {
      this.context.translate(-this.viewport.left, -this.viewport.top);
   }

   private updateViewport() {
      this.aspectRatio = this.context.canvas.width / this.context.canvas.height;
      this.viewport.width = this.distance * Math.tan(this.fieldOfView);
      this.viewport.height = this.viewport.width / this.aspectRatio;
      this.viewport.left = this.position.x - this.viewport.width / 2.0;
      this.viewport.top = this.position.y - this.viewport.height / 2.0;
      this.viewport.right = this.viewport.left + this.viewport.width;
      this.viewport.bottom = this.viewport.top + this.viewport.height;
      this.viewport.scale.x = this.context.canvas.width / this.viewport.width;
      this.viewport.scale.y = this.context.canvas.height / this.viewport.height;
   }

   public begin() {
      this.context.save();
      this.applyScale();
      this.applyTranslation();
   }

   public end() {
      this.context.restore();
   }

   public zoomTo(z: number) {
      this.distance = z;
      this.updateViewport();
   }

   public moveTo(x: number, y: number) {
      this.position.x = x;
      this.position.y = y;
      this.updateViewport();
   }

   public screenToWorld(x: number, y: number) {
      return new Vector(
         x / this.viewport.scale.x + this.viewport.left,
         y / this.viewport.scale.y + this.viewport.top
      );
   }

   public worldToScreen(x: number, y: number) {
      return new Vector(
         (x - this.viewport.left) * this.viewport.scale.x,
         (y - this.viewport.top) * this.viewport.scale.y
      );
   }
}
