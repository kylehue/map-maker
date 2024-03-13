import { useMouse } from "@vueuse/core";
import { projectStore } from "../store/project";
import { Camera } from "./Camera";
import { pointToAABBCollision } from "./utils";
import { designerStore } from "../store/designer";
import { clamp } from "../utils/clamp";

const { x: mouseX, y: mouseY } = useMouse();

export class Designer {
   public readonly canvas = document.createElement("canvas");
   public readonly context = this.canvas.getContext("2d")!;
   private readonly camera = new Camera(this.context);

   private readonly settings = {
      gridColor: "rgba(125, 125, 125, 0.075)",
      centerGridColor: "rgba(125, 125, 125, 0.3)",
      tileHoverColor: "rgba(129, 230, 155, 0.2)",
   };

   constructor() {
      this.context.imageSmoothingEnabled = false;

      const test = () => {
         requestAnimationFrame(test);
         this.repaint();
      };

      test();
   }

   public setSize(width: number, height: number) {
      this.canvas.width = width;
      this.canvas.height = height;
   }

   public getMouse() {
      let { x, y } = this.camera.screenToWorld(
         mouseX.value - this.canvas.offsetLeft,
         mouseY.value - this.canvas.offsetTop
      );
      return { x, y };
   }

   private drawTiles() {
      const ctx = this.context;
      const size = projectStore.tileSize || 1;

      const offset = 4;
      const rowStart = ~~(this.camera.viewport.top / size) - offset;
      const rowEnd = ~~(this.camera.viewport.bottom / size) + offset;
      const colStart = ~~(this.camera.viewport.left / size) - offset;
      const colEnd = ~~(this.camera.viewport.right / size) + offset;

      // draw tiles
      ctx.lineWidth = 0.5;
      for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
         for (let colIndex = colStart; colIndex < colEnd; colIndex++) {
            let tileIsEmpty = true; // TODO: change this

            const x = colIndex * size;
            const y = rowIndex * size;
            if (tileIsEmpty) {
               // draw empty tile
               ctx.beginPath();
               ctx.rect(x, y, size, size);
               ctx.strokeStyle = this.settings.gridColor;
               ctx.stroke();

               ctx.closePath();
            } else {
               // draw actual tile
            }

            const { x: mx, y: my } = this.getMouse();
            const isMouseOver = pointToAABBCollision(mx, my, {
               x,
               y,
               width: size,
               height: size,
            });
            if (isMouseOver) {
               ctx.rect(x, y, size, size);
               ctx.fillStyle = this.settings.tileHoverColor;
               ctx.fill();
            }
         }
      }

      // draw center x & y lines
      ctx.beginPath();
      ctx.moveTo(this.camera.viewport.left, 0);
      ctx.lineTo(this.camera.viewport.right, 0);
      ctx.moveTo(0, this.camera.viewport.top);
      ctx.lineTo(0, this.camera.viewport.bottom);
      ctx.strokeStyle = this.settings.centerGridColor;
      ctx.stroke();
      ctx.closePath();
   }

   public repaint() {
      const ctx = this.context;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.camera.begin();
      this.camera.moveTo(designerStore.position.x, designerStore.position.y);
      this.camera.zoomTo(designerStore.zoom);
      this.drawTiles();

      this.camera.end();
   }
}