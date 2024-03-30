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

   setEmptyMatrixId(emptyMatrixId: string) {
      for (let i = this.matrix.length - 1; i >= 0; i--) {
         this.matrix[i] = this.matrix[i].map((v) => {
            if (v === this.emptyMatrixId) return emptyMatrixId;
            return v;
         });
      }
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

   private async _expand(size: number) {
      if (!size) return;
      const result = await postAsync(worker, "expand", {
         matrix: this.id,
         size,
         emptyMatrixId: this.emptyMatrixId,
      });
      if (!result) return;
      this.matrix = result.data.matrix;
   }

   private _translate(rowStep: number, colStep: number) {
      const rowStepAbs = Math.abs(rowStep);
      const colStepAbs = Math.abs(colStep);

      if (rowStepAbs === 0 && colStepAbs === 0) return;

      const translated: string[][] = [];

      for (let i = 0; i < this.matrix.length + rowStepAbs; i++) {
         for (let j = 0; j < (this.matrix[0]?.length || 0) + colStepAbs; j++) {
            translated[i] ??= [];
            translated[i][j] = this.emptyMatrixId;
         }
      }

      for (
         let row = rowStep < 0 ? 0 : rowStepAbs;
         row < translated.length - (rowStep >= 0 ? 0 : rowStepAbs);
         row++
      ) {
         for (
            let col = colStep < 0 ? 0 : colStepAbs;
            col < translated[row].length - (colStep >= 0 ? 0 : colStepAbs);
            col++
         ) {
            translated[row][col] =
               this.matrix[row - (rowStep < 0 ? 0 : rowStepAbs)][
                  col - (colStep < 0 ? 0 : colStepAbs)
               ];
         }
      }

      this.matrix = translated;
   }

   toString() {
      return this.matrix.map((v) => v.join(this.separator)).join("\n");
   }

   fromString(matrixStr: string) {
      this.matrix = matrixStr.split("\n").map((v) => v.split(this.separator));
      this._clean();
   }

   private _clean() {
      let maxRow = this.matrix.length;
      let maxCol = -Infinity;
      for (let i = this.matrix.length - 1; i >= 0; i--) {
         const row = this.matrix[i].filter(
            (str) => typeof str == "string" && str.length
         );
         maxCol = Math.max(maxCol, row.length);
      }

      maxRow = Math.max(maxRow, 2);
      maxCol = Math.max(maxCol, 2);
      let maxLength = Math.max(maxRow, maxCol);

      // Keep it even so that its position in designer can be consistent
      if (maxLength % 2 != 0) {
         maxLength++;
      }

      // Adjust matrix dimensions to make rows and columns equal
      for (let i = 0; i < maxLength; i++) {
         const row = (this.matrix[i] || []).filter(
            (str) => typeof str == "string" && str.length
         );
         while (row.length < maxLength) {
            row.push(this.emptyMatrixId);
         }
         this.matrix[i] = row;
      }

      this.trim();
   }
}

(window as any).MapMatrix = MapMatrix;
