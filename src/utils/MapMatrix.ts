import MapMatrixWorker from "../worker/map-matrix-worker?worker";
import { generateId } from "./generate-id";
import { postAsync } from "./worker-utils";
const worker = new MapMatrixWorker();

export class MapMatrix {
   private id = generateId();
   private matrix: string[][] = [];
   private emptyMatrixId = ".";
   private separator = " ";
   private minSize: number | null = null;
   private nonEmptyTotalSize = 0;

   constructor() {}

   public setMinSize(minSize: number | null) {
      if (minSize === this.minSize) return;
      if (typeof minSize == "number") {
         minSize = minSize % 2 !== 0 ? minSize + 1 : minSize;
      }

      this.minSize = minSize;
      this._updateMinSize();
   }

   private async _updateMinSize() {
      const result = await postAsync(worker, "updateMinSize", {
         matrix: this.id,
         emptyMatrixId: this.emptyMatrixId,
         minSize: this.minSize,
      });
      if (!result) return;
      this.matrix = result.data.matrix;
   }

   clear() {
      this.matrix = [];
   }

   async setEmptyMatrixId(emptyMatrixId: string) {
      const result = await postAsync(worker, "setEmptyMatrixId", {
         matrix: this.id,
         from: this.emptyMatrixId,
         to: emptyMatrixId,
      });
      if (!result) return;
      this.matrix = result.data.matrix;
      this.emptyMatrixId = emptyMatrixId;
   }

   setSeparator(separator: string) {
      this.separator = separator;
   }

   getTotalSize(scalar = 1) {
      return this.matrix.length * scalar;
   }

   getNonEmptyTotalSize() {
      return this.nonEmptyTotalSize;
   }

   private async _updateNonEmptyTotalSize() {
      this.nonEmptyTotalSize = this.matrix.length;
      const result = await postAsync(worker, "getNonEmptyTotalSize", {
         matrix: this.id,
         emptyMatrixId: this.emptyMatrixId,
      });
      if (!result) return;
      this.nonEmptyTotalSize = result.data.nonEmptyTotalSize;
   }

   getMatrix() {
      return this.matrix;
   }

   async trim() {
      const result = await postAsync(worker, "trim", {
         matrix: this.id,
         emptyMatrixId: this.emptyMatrixId,
      });
      if (!result) return;
      this.matrix = result.data.matrix;
   }

   async fill(row: number, col: number, matrixId: string) {
      const result = await postAsync(worker, "fill", {
         matrix: this.id,
         row,
         col,
         matrixId,
         emptyMatrixId: this.emptyMatrixId,
      });
      if (!result) return;
      this.matrix = result.data.matrix;
      this._updateNonEmptyTotalSize();
   }

   async add(row: number, col: number, matrixId: string) {
      const result = await postAsync(worker, "add", {
         matrix: this.id,
         row,
         col,
         matrixId,
         emptyMatrixId: this.emptyMatrixId,
      });
      if (!result) return;
      this.matrix = result.data.matrix;
      this._updateNonEmptyTotalSize();
   }

   toString() {
      return this.matrix.map((v) => v.join(this.separator)).join("\n");
   }

   async fromString(matrixString: string) {
      const result = await postAsync(worker, "setMatrixFromString", {
         matrix: this.id,
         matrixString,
         separator: this.separator,
         emptyMatrixId: this.emptyMatrixId,
      });
      if (!result) return;
      this.matrix = result.data.matrix;
   }

   async replaceMatrixId(from: string, to: string) {
      const result = await postAsync(worker, "replaceMatrixId", {
         matrix: this.id,
         from,
         to,
      });
      if (!result) return;
      this.matrix = result.data.matrix;
   }
}

(window as any).MapMatrix = MapMatrix;
