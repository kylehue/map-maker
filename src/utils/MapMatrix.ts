export class MapMatrix {
   private matrix: string[][] = [];
   private emptyMatrixId = ".";

   constructor() {}

   setEmptyMatrixId(emptyMatrixId: string) {
      this.emptyMatrixId = emptyMatrixId;
   }

   getTotalWidth(tileWidth: number) {
      if (!this.matrix.length) return 0;
      const maxLength = Math.max(...this.matrix.map((e) => e.length));
      return maxLength * tileWidth;
   }

   getTotalHeight(tileHeight: number) {
      return this.matrix.length * tileHeight;
   }

   static getMirrors(row: number, col: number) {
      return [
         [row, col],
         [-row, col],
         [row, -col],
         [-row, -col],
      ] as [number, number][];
   }

   getMatrix() {
      return this.matrix;
   }

   add(row: number, col: number, matrixId: string) {
      const top = -Math.ceil(this.matrix.length / 2);
      const bottom = Math.ceil(this.matrix.length / 2);
      const left = -Math.ceil((this.matrix[0]?.length || 0) / 2);
      const right = Math.ceil((this.matrix[0]?.length || 0) / 2);

      // Keep matrix perfectly square
      let overlapX = 0;
      let overlapY = 0;
      if (col <= left || col >= right) {
         overlapX = Math.max(
            Math.abs(col) - Math.abs(left),
            Math.abs(col) - Math.abs(right)
         );
      }
      if (row <= top || row >= bottom) {
         overlapY = Math.max(
            Math.abs(row) - Math.abs(top),
            Math.abs(row) - Math.abs(bottom)
         );
      }
      const overlap = Math.max(overlapX, overlapY);
      this.translate(overlap, overlap);
      this.translate(-overlap, -overlap);

      // Put the matrix id by using the center as the origin
      const centerRow = Math.ceil(this.matrix.length / 2);
      const centerCol = Math.ceil((this.matrix[0]?.length || 0) / 2);
      const o1 = row <= 0 ? 0 : 1; // offset
      const o2 = col <= 0 ? 0 : 1;
      this.matrix[centerRow + row - o1] ??= [];
      this.matrix[centerRow + row - o1][centerCol + col - o2] = matrixId;
   }

   private translate(rowStep: number, colStep: number) {
      const rowStepAbs = Math.abs(rowStep);
      const colStepAbs = Math.abs(colStep);
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
      return this.matrix.map((v) => v.join(" ")).join("\n");
   }

   fromString(matrixStr: string, separator = " ") {
      this.matrix = matrixStr.split("\n").map((v) => v.split(separator));
   }
}

(window as any).MapMatrix = MapMatrix;
