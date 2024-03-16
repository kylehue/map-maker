import { useMouse } from "@vueuse/core";
import { useProjectStore } from "../store/project";
import { Camera } from "./Camera";
import { pointToAABBCollision } from "./utils";
import { useDesignerStore } from "../store/designer";
import { clamp } from "../utils/clamp";
import { Layer, Material } from "../types";
import { useSettingsStore } from "../store/settings";
import { useThemeVars } from "naive-ui";

const { x: mouseX, y: mouseY } = useMouse();

export class Designer {
   public readonly canvas = document.createElement("canvas");
   public readonly context = this.canvas.getContext("2d")!;
   private readonly camera = new Camera(this.context);
   private readonly designerStore = useDesignerStore();
   private readonly projectStore = useProjectStore();
   private readonly settingsStore = useSettingsStore();
   private readonly theme = useThemeVars();
   private canvasBounds: DOMRect = this.canvas.getBoundingClientRect();
   private fps = 50;
   private isMouseDown = false;
   private readonly registeredMatrixId: Record<string, Record<string, string>> =
      {};

   private readonly settings = {
      gridColor: "rgba(125, 125, 125, 0.075)",
      centerGridColor: "rgba(125, 125, 125, 0.3)",
      tileHoverColor: "rgba(129, 230, 155, 0.2)",
   };

   constructor() {
      this.context.imageSmoothingEnabled = false;

      const tick = () => {
         this.repaint();
         if (this.isMouseDown) this.initTooling();
         setTimeout(() => {
            requestAnimationFrame(tick);
         }, 1000 / this.fps);
      };
      tick();

      addEventListener("resize", () => {
         this.canvasBounds = this.canvas.getBoundingClientRect();
      });

      this.canvas.addEventListener("mousedown", () => {
         this.isMouseDown = true;
         this.initTooling();
      });

      addEventListener("mouseup", () => {
         this.isMouseDown = false;
      });

      this.canvas.addEventListener("mouseenter", (e) => {
         this.fps = 50;
         this.repaint();
      });

      this.canvas.addEventListener("mouseleave", (e) => {
         this.isMouseDown = false;
         this.fps = 4;
         this.repaint();
      });

      this.repaint();
   }

   // private convertRegisteredMatrixIdsToArray(layer: Layer) {
   //    const result: string[][] = [];
   //    const registeredMatrixIds = this.registeredMatrixId[layer.id];
   //    if (!registeredMatrixIds) return result;

   //    let minRow = Infinity;
   //    let minCol = Infinity;
   //    for (const pos of Object.keys(registeredMatrixIds)) {
   //       const [row, col] = pos.split(",").map((v) => parseInt(v));
   //       minRow = row < minRow ? row : minRow;
   //       minCol = col < minCol ? col : minCol;
   //    }

   //    const min = Math.min(minRow, minCol);
   //    for (const [pos, matrixId] of Object.entries(registeredMatrixIds)) {
   //       let [row, col] = pos.split(",").map((v) => parseInt(v));
   //       row += min;
   //       col += min;
   //       result[row] ??= [];
   //       result[row][col] = matrixId;
   //    }

   //    return result;
   // }

   // private registerMatrixId(
   //    layer: Layer,
   //    row: number,
   //    column: number,
   //    matrixId: string
   // ) {
   //    if (this.getRegisteredMatrixId(layer, row, column) === matrixId) return;

   //    this.registeredMatrixId[layer.id] ??= {};
   //    this.registeredMatrixId[layer.id][`${row},${column}`] = matrixId;

   //    // update layer's matrix
   //    layer.matrix = this.convertRegisteredMatrixIdsToArray(layer);
   // }

   // private getRegisteredMatrixId(layer: Layer, row: number, column: number) {
   //    return this.registeredMatrixId[layer.id]?.[`${row},${column}`] as
   //       | string
   //       | undefined;
   // }

   public initTooling() {
      let [col, row] = this.getMouseColumnRow();
      row = row >= 0 ? row + 1 : row;
      col = col >= 0 ? col + 1 : col;

      if (this.designerStore.activeTool == "brush") {
         const activeMaterial = this.projectStore.selectedMaterial;
         const activeLayer = this.projectStore.selectedLayer;
         // console.log(activeLayer, activeMaterial);
         if (!activeMaterial || !activeLayer) return;
         activeLayer.matrix.add(row, col, activeMaterial.matrixId);
         // this.registerMatrixId(
         //    activeLayer,
         //    row,
         //    col,
         //    activeMaterial.matrixId
         // );
         // activeLayer.matrix[row] ??= [];
         // activeLayer.matrix[row][col] = activeMaterial.matrixId;
         // console.log(activeLayer.matrix);
      }
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

      const totalWidth = layer.matrix.getTotalWidth(tileSize);
      const totalHeight = layer.matrix.getTotalHeight(tileSize);

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
         rowIndex < Math.min(layer.matrix.getMatrix().length, rowEnd);
         rowIndex++
      ) {
         const row = layer.matrix.getMatrix()[rowIndex];
         if (!row) continue;
         for (
            let colIndex = Math.max(0, colStart);
            colIndex < Math.min(row.length, colEnd);
            colIndex++
         ) {
            const matrixId = row[colIndex];
            if (typeof matrixId != "string") continue;
            const tileIsEmpty = matrixId === this.projectStore.emptyMatrixId;

            if (!tileIsEmpty) {
               const material =
                  this.projectStore.getMaterialByMatrixId(matrixId);
               if (!material) continue;
               const {
                  image,
                  x: tx,
                  y: ty,
               } = this.getTransformedImageInfo(material);
               const x = colIndex * tileSize - totalWidth / 2;
               const y = rowIndex * tileSize - totalHeight / 2;
               ctx.drawImage(image, x + tx, y + ty);
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

      ctx.font = "8px Courier New";
      this.writeText("0x0", tileSize / 2, tileSize / 2);
   }

   private writeText(text: string, x: number, y: number) {
      const ctx = this.context;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = this.theme.value?.textColorDisabled || "black";
      ctx.fillText(text, x, y);
   }

   public repaint() {
      const ctx = this.context;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.camera.begin();
      const position = this.designerStore.position;
      const zoom = this.designerStore.zoom;
      this.camera.moveTo(position.x, position.y);
      this.camera.zoomTo(zoom);

      for (let i = this.projectStore.layers.length - 1; i >= 0; i--) {
         const layer = this.projectStore.layers[i];
         this.drawTiles(layer);
      }

      this.drawGrid();
      this.drawTarget();

      this.camera.end();
   }
}
