import { useMouse } from "@vueuse/core";
import { useProjectStore } from "../store/project";
import { Camera } from "./Camera";
import { pointToAABBCollision } from "./utils";
import { useDesignerStore } from "../store/designer";
import { clamp } from "../utils/clamp";
import { Layer, Material } from "../types";
import { getTotalHeight, getTotalWidth } from "../utils/layer-utils";
import { useSettingsStore } from "../store/settings";

const { x: mouseX, y: mouseY } = useMouse();

export class Designer {
   public readonly canvas = document.createElement("canvas");
   public readonly context = this.canvas.getContext("2d")!;
   private readonly camera = new Camera(this.context);
   private readonly designerStore = useDesignerStore();
   private readonly projectStore = useProjectStore();
   private readonly settingsStore = useSettingsStore();
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

   private drawTiles(layer: Layer) {
      const ctx = this.context;
      const tileSize = this.projectStore.tileSize || 1;

      const totalWidth = getTotalWidth(layer, tileSize);
      const totalHeight = getTotalHeight(layer, tileSize);

      const renderTileViewportOffset = 4;
      const rowStart =
         Math.ceil((this.camera.viewport.top + totalHeight / 2) / tileSize) +
         1 -
         renderTileViewportOffset;
      const rowEnd =
         Math.floor(
            (this.camera.viewport.bottom + totalHeight / 2) / tileSize
         ) + renderTileViewportOffset;
      const colStart =
         Math.ceil((this.camera.viewport.left + totalWidth / 2) / tileSize) +
         1 -
         renderTileViewportOffset;
      const colEnd =
         Math.floor((this.camera.viewport.right + totalWidth / 2) / tileSize) +
         renderTileViewportOffset;

      // draw tiles
      for (
         let rowIndex = Math.max(0, rowStart);
         rowIndex < Math.min(layer.matrix.length, rowEnd);
         rowIndex++
      ) {
         const row = layer.matrix[rowIndex];
         for (
            let colIndex = Math.max(0, colStart);
            colIndex < Math.min(row.length, colEnd);
            colIndex++
         ) {
            const matrixId = row[colIndex];
            const tileIsEmpty = matrixId === this.projectStore.emptyMatrixId;

            if (!tileIsEmpty) {
               const material =
                  this.projectStore.getMaterialByMatrixId(matrixId);
               if (!material) continue;
               const x = colIndex * tileSize;
               const y = rowIndex * tileSize;
               ctx.drawImage(
                  material.texture.getImageCanvas(),
                  x,
                  y,
                  tileSize,
                  tileSize
               );
            }
         }
      }
   }

   private getTransformedImageInfo(material: Material) {
      const tileSize = this.projectStore.tileSize || 1;
      const image = material.texture.getImageCanvas();
      const width = image.width;
      const height = image.height;

      // center
      let x = -width / 2 + tileSize / 2;
      let y = -height / 2 + tileSize / 2;

      switch (material.positionOrigin) {
         case "top":
            y += height / 2 - tileSize / 2;
            break;
         case "bottom":
            y -= height / 2 - tileSize / 2;
            break;
         case "right":
            x -= width / 2 - tileSize / 2;
            break;
         case "left":
            x += width / 2 - tileSize / 2;
            break;
      }

      return { image, width, height, x, y };
   }

   private drawTarget() {
      const ctx = this.context;
      if (!this.projectStore.selectedMaterial) return;
      const [col, row] = this.getMouseColumnRow();
      const tileSize = this.projectStore.tileSize || 1;
      const { image, x, y } = this.getTransformedImageInfo(
         this.projectStore.selectedMaterial
      );
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.drawImage(image, col * tileSize + x, row * tileSize + y);
      ctx.restore();
   }

   private drawGrid() {
      const ctx = this.context;

      // draw center x & y lines
      ctx.beginPath();
      ctx.moveTo(this.camera.viewport.left, 0);
      ctx.lineTo(this.camera.viewport.right, 0);
      ctx.moveTo(0, this.camera.viewport.top);
      ctx.lineTo(0, this.camera.viewport.bottom);
      ctx.strokeStyle = this.settings.centerGridColor;
      ctx.stroke();
      ctx.closePath();

      // draw grid
      const tileSize = this.projectStore.tileSize || 1;
      const rowStart = ~~(this.camera.viewport.top / tileSize) - 4;
      const rowEnd = ~~(this.camera.viewport.bottom / tileSize) + 4;
      const colStart = ~~(this.camera.viewport.left / tileSize) - 4;
      const colEnd = ~~(this.camera.viewport.right / tileSize) + 4;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = this.settings.gridColor;
      for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
         ctx.beginPath();
         ctx.moveTo(this.camera.viewport.left, rowIndex * tileSize);
         ctx.lineTo(this.camera.viewport.right, rowIndex * tileSize);
         ctx.closePath();
         ctx.stroke();
      }

      for (let colIndex = colStart; colIndex < colEnd; colIndex++) {
         ctx.beginPath();
         ctx.moveTo(colIndex * tileSize, this.camera.viewport.top);
         ctx.lineTo(colIndex * tileSize, this.camera.viewport.bottom);
         ctx.closePath();
         ctx.stroke();
      }
   }

   public repaint() {
      const ctx = this.context;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.camera.begin();
      const position = this.designerStore.position;
      const zoom = this.designerStore.zoom;
      this.camera.moveTo(position.x, position.y);
      this.camera.zoomTo(zoom);

      for (const layer of this.projectStore.layers) {
         this.drawTiles(layer);
      }

      this.drawGrid();
      this.drawTarget();

      this.camera.end();
   }
}
