export class MapMatrix {
   private matrix: string[][] = [];
   private emptyMatrixId = ".";
   private separator = " ";
   private minSize: number | null = null;
   private nonEmptyTotalSize = 0;
   private minRecordedRow = 0;
   private maxRecordedRow = 0;
   private minRecordedCol = 0;
   private maxRecordedCol = 0;

   constructor() {}

   public setMinSize(minSize: number | null) {
      if (minSize === this.minSize) return;
      if (typeof minSize == "number") {
         minSize = minSize % 2 !== 0 ? minSize + 1 : minSize;
      }

      this.minSize = minSize;
      this.updateMinSize();
   }

   private updateMinSize() {
      if (typeof this.minSize == "number" && this.minSize >= 0) {
         this.trim();
         if (this.matrix.length < this.minSize) {
            const offset = Math.floor((this.minSize - this.matrix.length) / 2);
            if (offset !== 0) {
               this.expand(offset);
            }
         }
      }
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

   private _updateNonEmptyTotalSize() {
      const maxes: number[] = [];
      for (let q = 0; q < 4; q++) {
         let firstNonEmptyCol: number | null = null;
         let lastNonEmptyCol: number | null = null;
         let firstNonEmptyRow: number | null = null;
         let lastNonEmptyRow: number | null = null;

         const qLength = Math.floor(this.matrix.length / 2);
         let rowStart = 0;
         let rowEnd = 0;
         let colStart = 0;
         let colEnd = 0;
         if (q == 0 || q == 1) {
            // top
            rowStart = 0;
            rowEnd = qLength;
         } else {
            // bottom
            rowStart = qLength;
            rowEnd = this.matrix.length;
         }

         if (q == 0 || q == 2) {
            // left
            colStart = 0;
            colEnd = qLength;
         } else {
            // right
            colStart = qLength;
            colEnd = this.matrix.length;
         }

         for (let i = rowStart; i < rowEnd; i++) {
            const row = this.matrix[i];
            let rowIsNonEmpty = false;

            for (let j = colStart; j < colEnd; j++) {
               const col = row[j];
               if (col !== this.emptyMatrixId) {
                  if (firstNonEmptyCol === null) firstNonEmptyCol = j;
                  lastNonEmptyCol = j;
                  rowIsNonEmpty = true;
               }
            }

            if (rowIsNonEmpty) {
               if (firstNonEmptyRow === null) firstNonEmptyRow = i;
               lastNonEmptyRow = i;
            }
         }

         const maxRow =
            firstNonEmptyRow === null || lastNonEmptyRow === null
               ? 0
               : lastNonEmptyRow - firstNonEmptyRow + 1;
         const maxCol =
            firstNonEmptyCol === null || lastNonEmptyCol === null
               ? 0
               : lastNonEmptyCol - firstNonEmptyCol + 1;
         maxes.push(Math.max(maxRow, maxCol));
      }

      this.nonEmptyTotalSize = Math.max(...maxes) * 2;
   }

   getMatrix() {
      return this.matrix;
   }

   trim() {
      const oldSize = this.matrix.length;
      const firstRowIsEmpty = () =>
         this.matrix[0]?.every((v) => v === this.emptyMatrixId);
      const lastRowIsEmpty = () =>
         this.matrix[this.matrix.length - 1]?.every(
            (v) => v === this.emptyMatrixId
         );
      const firstColIsEmpty = () =>
         this.matrix.every((v) => v[0] === this.emptyMatrixId);
      const lastColIsEmpty = () =>
         this.matrix.every((v) => v[v.length - 1] === this.emptyMatrixId);

      while (
         firstRowIsEmpty() &&
         lastRowIsEmpty() &&
         firstColIsEmpty() &&
         lastColIsEmpty()
      ) {
         this.matrix.shift();
         this.matrix.pop();
         this.matrix.forEach((v) => {
            v.shift();
            v.pop();
         });
      }

      if (oldSize !== this.matrix.length) {
         this._updateNonEmptyTotalSize();
      }
   }

   private getBounds() {
      const top = -Math.ceil(this.matrix.length / 2);
      const bottom = Math.ceil(this.matrix.length / 2);
      const left = -Math.ceil((this.matrix[0]?.length || 0) / 2);
      const right = Math.ceil((this.matrix[0]?.length || 0) / 2);

      return {
         top,
         bottom,
         left,
         right,
      };
   }

   private _recordRowAndColumn(row: number, col: number) {
      this.minRecordedRow = Math.min(row, this.minRecordedRow);
      this.maxRecordedRow = Math.max(row, this.maxRecordedRow);
      this.minRecordedCol = Math.min(col, this.minRecordedCol);
      this.maxRecordedCol = Math.max(col, this.maxRecordedCol);
   }

   fill(row: number, col: number, matrixId: string) {
      const fixedRow = row >= 0 ? row + 1 : row;
      const fixedCol = col >= 0 ? col + 1 : col;

      // Expand matrix if the row/col exceeds the matrix bounds
      const overlap = this.getOverlap(row, col);
      this.expand(overlap);

      const fill = (
         row: number,
         col: number,
         matrixId: string,
         targetMatrixId: string
      ) => {
         // stop if out of bounds
         if (
            row < 0 ||
            row >= this.matrix.length ||
            col < 0 ||
            col >= this.matrix[0].length
         ) {
            return;
         }

         // stop if the id is already set
         if (this.matrix[row][col] === matrixId) {
            return;
         }

         // stop if the current id is not equal to target id
         if (targetMatrixId !== this.matrix[row][col]) {
            return;
         }

         this.matrix[row][col] = matrixId;
         fill(row + 1, col, matrixId, targetMatrixId);
         fill(row - 1, col, matrixId, targetMatrixId);
         fill(row, col + 1, matrixId, targetMatrixId);
         fill(row, col - 1, matrixId, targetMatrixId);
      };

      const centerRow = Math.ceil(this.matrix.length / 2);
      const centerCol = Math.ceil((this.matrix[0]?.length || 0) / 2);
      const o1 = row <= 0 ? 0 : 1; // offset
      const o2 = col <= 0 ? 0 : 1;
      fill(
         centerRow + fixedRow - o1,
         centerCol + fixedCol - o2,
         matrixId,
         this.matrix[centerRow + fixedRow - o1][centerCol + fixedCol - o2]
      );

      const isBoundsExpanded =
         fixedRow < this.minRecordedRow ||
         fixedRow > this.maxRecordedRow ||
         fixedCol < this.minRecordedCol ||
         fixedCol > this.maxRecordedCol;
      if (isBoundsExpanded) {
         this._updateNonEmptyTotalSize();
      }

      this._recordRowAndColumn(fixedRow, fixedCol);
   }

   private getOverlap(row: number, col: number) {
      const fixedRow = row >= 0 ? row + 1 : row;
      const fixedCol = col >= 0 ? col + 1 : col;
      const { top, bottom, left, right } = this.getBounds();

      let overlapX = 0;
      let overlapY = 0;
      if (fixedCol <= left || fixedCol >= right) {
         overlapX = Math.max(
            Math.abs(fixedCol) - Math.abs(left),
            Math.abs(fixedCol) - Math.abs(right)
         );
      }
      if (fixedRow <= top || fixedRow >= bottom) {
         overlapY = Math.max(
            Math.abs(fixedRow) - Math.abs(top),
            Math.abs(fixedRow) - Math.abs(bottom)
         );
      }

      return Math.max(overlapX, overlapY);
   }

   add(row: number, col: number, matrixId: string, trimIfNeeded = true) {
      const fixedRow = row >= 0 ? row + 1 : row;
      const fixedCol = col >= 0 ? col + 1 : col;

      // Keep matrix perfectly square
      const overlap = this.getOverlap(row, col);
      this.expand(overlap);

      // Put the matrix id by using the center as the origin
      const centerRow = Math.ceil(this.matrix.length / 2);
      const centerCol = Math.ceil((this.matrix[0]?.length || 0) / 2);
      const o1 = fixedRow <= 0 ? 0 : 1; // offset
      const o2 = fixedCol <= 0 ? 0 : 1;
      this.matrix[centerRow + fixedRow - o1] ??= [];
      this.matrix[centerRow + fixedRow - o1][centerCol + fixedCol - o2] =
         matrixId;

      const isBoundsExpanded =
         fixedRow < this.minRecordedRow ||
         fixedRow > this.maxRecordedRow ||
         fixedCol < this.minRecordedCol ||
         fixedCol > this.maxRecordedCol;
      if (isBoundsExpanded) {
         this._updateNonEmptyTotalSize();
      }

      if (matrixId === this.emptyMatrixId && trimIfNeeded) {
         this.trim();
      }

      this._recordRowAndColumn(fixedRow, fixedCol);
   }

   private expand(size: number) {
      if (!size) return;

      // expand cols
      this.matrix.forEach((v) => {
         for (let i = 0; i < size; i++) {
            v.unshift(this.emptyMatrixId);
            v.push(this.emptyMatrixId);
         }
      });

      // expand rows
      const targetLength = this.matrix.length + size;
      for (let i = 0; i < size; i++) {
         this.matrix.unshift(
            Array.from({ length: targetLength }).map(() => this.emptyMatrixId)
         );
         this.matrix.push(
            Array.from({ length: targetLength }).map(() => this.emptyMatrixId)
         );
      }
   }

   private translate(rowStep: number, colStep: number) {
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
      this.clean();
   }

   private clean() {
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
