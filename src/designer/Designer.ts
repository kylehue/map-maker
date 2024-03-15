import { useMouse } from "@vueuse/core";
import { useProjectStore } from "../store/project";
import { Camera } from "./Camera";
import { pointToAABBCollision } from "./utils";
import { useDesignerStore } from "../store/designer";
import { clamp } from "../utils/clamp";

const { x: mouseX, y: mouseY } = useMouse();

export class Designer {
   public readonly canvas = document.createElement("canvas");
   public readonly context = this.canvas.getContext("2d")!;
   private readonly camera = new Camera(this.context);
   private readonly designerStore = useDesignerStore();
   private readonly projectStore = useProjectStore();
   private canvasBounds: DOMRect = this.canvas.getBoundingClientRect();
   private fps = 50;

   private readonly settings = {
      gridColor: "rgba(125, 125, 125, 0.075)",
      centerGridColor: "rgba(125, 125, 125, 0.3)",
      tileHoverColor: "rgba(129, 230, 155, 0.2)",
   };

   constructor() {
      this.context.imageSmoothingEnabled = false;

      const tick = () => {
         this.repaint();
         setTimeout(() => {
            requestAnimationFrame(tick);
         }, 1000 / this.fps);
      };
      tick();
      
      addEventListener("resize", () => {
         this.canvasBounds = this.canvas.getBoundingClientRect();
      });

      this.canvas.addEventListener("mouseenter", (e) => {
         this.fps = 50;
         this.repaint();
      });

      this.canvas.addEventListener("mouseleave", (e) => {
         this.fps = 4;
         this.repaint();
      });

      this.repaint();
   }

   public setFPS(fps: number) {
      this.fps = fps;
   }

   public setSize(width: number, height: number) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvasBounds = this.canvas.getBoundingClientRect();

      this.repaint();
   }

   public getMouse() {
      let { x, y } = this.camera.screenToWorld(
         mouseX.value - this.canvasBounds.left,
         mouseY.value - this.canvasBounds.top
      );
      return { x, y };
   }

   public getMouseColumnRow() {
      const { x, y } = this.getMouse();
      const col = Math.floor(x / this.projectStore.tileSize);
      const row = Math.floor(y / this.projectStore.tileSize);
      return [col, row];
   }

   private drawTiles() {
      const ctx = this.context;
      const size = this.projectStore.tileSize || 1;

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
      const position = this.designerStore.position;
      const zoom = this.designerStore.zoom;
      this.camera.moveTo(position.x, position.y);
      this.camera.zoomTo(zoom);
      this.drawTiles();

      this.camera.end();
   }
}
