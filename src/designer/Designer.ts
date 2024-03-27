import { useMouse } from "@vueuse/core";
import { useProjectStore } from "../store/project";
import { Camera } from "./Camera";
import { useDesignerStore } from "../store/designer";
import { Layer, Tool } from "../types";
import { useSettingsStore } from "../store/settings";
import { Material } from "../utils/Material";

const { x: mouseX, y: mouseY } = useMouse();

interface Selection {
   top: number;
   bottom: number;
   left: number;
   right: number;
}

export class Designer {
   public readonly canvas = document.createElement("canvas");
   public readonly context = this.canvas.getContext("2d")!;
   public readonly camera = new Camera(this.context);
   private readonly designerStore = useDesignerStore();
   private readonly projectStore = useProjectStore();
   private readonly settingsStore = useSettingsStore();
   private canvasBounds: DOMRect = this.canvas.getBoundingClientRect();
   private isMouseDown = false;

   private readonly settings = {
      gridColor: "rgba(125, 125, 125, 0.075)",
      centerGridColor: "rgba(125, 125, 125, 0.3)",
      highlight: "rgba(125, 125, 125, 0.5)",
      mapBoundsColor: "rgb(200, 10, 40)",
   };

   constructor() {
      this.context.imageSmoothingEnabled = false;
      this.canvas.tabIndex = 0;
      this.canvas.style.outline = "none";
      this.canvas.style.border = "none";
      this.repaint();
      this.initListeners();
   }

   private initListeners() {
      let lastLayerSinceMouseDown: Layer | null = null;
      let lastLayerMatrixSnapshot: string | null = null;
      this.canvas.addEventListener("mousedown", (e) => {
         e.preventDefault();
         if (!this.isMouseDown && this.projectStore.selectedLayer) {
            lastLayerSinceMouseDown = this.projectStore.selectedLayer;
            lastLayerMatrixSnapshot = lastLayerSinceMouseDown.matrix.toString();
         }

         this.isMouseDown = true;
         this.initTooling();
      });

      addEventListener("resize", () => {
         this.canvasBounds = this.canvas.getBoundingClientRect();
      });

      addEventListener("mouseup", () => {
         this.isMouseDown = false;

         // changed?
         const layer = lastLayerSinceMouseDown;
         const oldMatrix = lastLayerMatrixSnapshot;
         const newMatrix = layer?.matrix.toString();
         if (
            typeof lastLayerMatrixSnapshot == "string" &&
            typeof newMatrix == "string" &&
            layer &&
            oldMatrix !== newMatrix
         ) {
            this.projectStore.saveState(
               "layer-edit-matrix",
               () => {
                  layer!.matrix.fromString(oldMatrix!);
               },
               () => {
                  layer!.matrix.fromString(newMatrix!);
               }
            );
         }

         lastLayerSinceMouseDown = null;
         lastLayerMatrixSnapshot = null;
      });

      this.canvas.addEventListener("wheel", (e) => {
         this.designerStore.addZoom(e.deltaY);
         this.repaint();
      });

      let lastTool: Tool | null = null;
      addEventListener("keydown", (e) => {
         if (e.code == "Space" && this.designerStore.activeTool != "hand") {
            e.preventDefault();
            this.canvas.focus();
            lastTool = this.designerStore.activeTool;
            this.designerStore.setActiveTool("hand");
         }
         this.repaint();
      });

      addEventListener("keyup", () => {
         if (lastTool) this.designerStore.setActiveTool(lastTool);
         this.repaint();
      });

      addEventListener("mousemove", (e) => {
         if (this.designerStore.activeTool == "hand" && this.isMouseDown) {
            this.designerStore.move(-e.movementX, -e.movementY);
         }
         this.initTooling();
         this.repaint();
      });
   }

   public initTooling() {
      let [col, row] = this.getMouseColumnRow();
      const tool = this.designerStore.activeTool;

      if (!this.isMouseDown) return;
      const layer = this.projectStore.selectedLayer;
      const material = this.projectStore.selectedMaterial;
      if (tool == "brush") {
         if (!material || !layer || layer?.isLocked) return;
         layer.matrix.add(row, col, material.getMatrixId());
      } else if (tool == "eraser") {
         if (!layer || layer?.isLocked) return;
         layer.matrix.add(row, col, this.projectStore.emptyMatrixId);
      } else if (tool == "paint-bucket") {
         if (!material || !layer || layer?.isLocked) return;
         layer.matrix.fill(row, col, material.getMatrixId());
      }

      this.projectStore.makeLayersMatrixSizeUniform();
      this.repaint();
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

   private drawTiles(ctx: CanvasRenderingContext2D, layer: Layer) {
      const tileSize = this.projectStore.tileSize || 1;

      const totalSize = layer.matrix.getTotalSize(tileSize);

      const renderTileViewportOffset = 4;
      const rowStart =
         Math.ceil((this.camera.viewport.top + totalSize / 2) / tileSize) +
         1 -
         renderTileViewportOffset;
      const rowEnd =
         Math.floor((this.camera.viewport.bottom + totalSize / 2) / tileSize) +
         renderTileViewportOffset;
      const colStart =
         Math.ceil((this.camera.viewport.left + totalSize / 2) / tileSize) +
         1 -
         renderTileViewportOffset;
      const colEnd =
         Math.floor((this.camera.viewport.right + totalSize / 2) / tileSize) +
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
               const x = colIndex * tileSize - totalSize / 2;
               const y = rowIndex * tileSize - totalSize / 2;
               if (this.settingsStore.designerArea.showMaterial) {
                  const {
                     image,
                     x: tx,
                     y: ty,
                  } = this.getTransformedImageInfo(material);
                  ctx.drawImage(image, x + tx, y + ty);
               }
               if (this.settingsStore.designerArea.showMatrixId) {
                  this.writeText(
                     ctx,
                     material.getMatrixId(),
                     x + tileSize / 2,
                     y + tileSize / 2,
                     this.settingsStore.designerArea.showMaterial
                        ? "white"
                        : this.settings.highlight
                  );
               }
            }
         }
      }
   }

   private getTransformedImageInfo(material: Material) {
      const tileSize = this.projectStore.tileSize || 1;
      const image = material.getTexture().getImageCanvas();
      const width = image.width;
      const height = image.height;

      // center
      let x = -width / 2 + tileSize / 2;
      let y = -height / 2 + tileSize / 2;

      switch (material.getPositionOrigin()) {
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

   private drawMaterialTarget(ctx: CanvasRenderingContext2D) {
      if (!this.projectStore.selectedMaterial) return;
      if (
         this.designerStore.activeTool != "brush" &&
         this.designerStore.activeTool != "paint-bucket"
      ) {
         return;
      }
      const [col, row] = this.getMouseColumnRow();
      const tileSize = this.projectStore.tileSize || 1;
      const { image, x, y } = this.getTransformedImageInfo(
         this.projectStore.selectedMaterial
      );
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.drawImage(image, col * tileSize + x, row * tileSize + y);
      ctx.restore();
   }

   private drawTarget(ctx: CanvasRenderingContext2D) {
      const tileSize = this.projectStore.tileSize || 1;
      const [col, row] = this.getMouseColumnRow();
      ctx.beginPath();
      ctx.rect(col * tileSize, row * tileSize, tileSize, tileSize);
      ctx.strokeStyle = this.settings.highlight;
      ctx.stroke();
      ctx.closePath();
   }

   private getLargestLayer() {
      return this.projectStore.layers
         .filter((v) => v.isVisible)
         .sort((a, b) => {
            return b.matrix.getTotalSize(1) - a.matrix.getTotalSize(1);
         })[0];
   }

   private drawMapBounds(ctx: CanvasRenderingContext2D) {
      const largestLayer = this.getLargestLayer();
      if (!largestLayer) return;
      const tileSize = this.projectStore.tileSize || 1;
      const totalSize = largestLayer.matrix.getTotalSize(tileSize);
      ctx.beginPath();
      ctx.rect(-totalSize / 2, -totalSize / 2, totalSize, totalSize);
      ctx.strokeStyle = this.settings.mapBoundsColor;
      ctx.stroke();
      ctx.closePath();
   }

   private drawGrid(ctx: CanvasRenderingContext2D) {
      ctx.lineWidth = this.designerStore.getZoomNormalizer() * 0.5;

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
      this.writeText(ctx, "0x0", tileSize / 2, tileSize / 2);
   }

   private writeText(
      ctx: CanvasRenderingContext2D,
      text: string | number,
      x: number,
      y: number,
      color = this.settings.gridColor
   ) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.fillText(text.toString(), x, y);
   }

   public repaint(ctx = this.context, raw = false) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (!raw) {
         this.camera.begin();
         const position = this.designerStore.position;
         const zoom = this.designerStore.zoom;
         this.camera.moveTo(position.x, position.y);
         this.camera.zoomTo(zoom);
      }

      for (let i = this.projectStore.layers.length - 1; i >= 0; i--) {
         const layer = this.projectStore.layers[i];
         if (!layer.isVisible) continue;
         this.drawTiles(ctx, layer);
      }

      if (!raw) {
         if (this.settingsStore.designerArea.showGrid) {
            this.drawGrid(ctx);
         }

         if (this.settingsStore.designerArea.showMapBounds) {
            this.drawMapBounds(ctx);
         }

         this.drawTarget(ctx);
         this.drawMaterialTarget(ctx);

         this.camera.end();
      }
   }

   public getImageCanvas() {
      const canvas = document.createElement("canvas");
      const largestLayer = this.getLargestLayer();
      const tileSize = this.projectStore.tileSize || 1;
      const totalSize = largestLayer.matrix.getTotalSize(tileSize);
      canvas.width = totalSize;
      canvas.height = totalSize;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      this.repaint(ctx, true);
      return canvas;
   }
}
