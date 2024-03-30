import { type WorkerJob } from "../utils/worker-utils";

const matrices = new Map<string, string[][]>();

function getOrSetMatrix(_matrix: string) {
   const matrix = matrices.get(_matrix);
   if (Array.isArray(matrix)) return matrix;
   const newMatrix: string[][] = [];
   matrices.set(_matrix, newMatrix);
   return newMatrix;
}

function getNonEmptyTotalSize(_matrix: string, emptyMatrixId = ".") {
   const matrix = getOrSetMatrix(_matrix);

   const maxes: number[] = [];
   for (let q = 0; q < 4; q++) {
      let firstNonEmptyCol: number | null = null;
      let lastNonEmptyCol: number | null = null;
      let firstNonEmptyRow: number | null = null;
      let lastNonEmptyRow: number | null = null;

      const qLength = Math.floor(matrix.length / 2);
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
         rowEnd = matrix.length;
      }

      if (q == 0 || q == 2) {
         // left
         colStart = 0;
         colEnd = qLength;
      } else {
         // right
         colStart = qLength;
         colEnd = matrix.length;
      }

      for (let i = rowStart; i < rowEnd; i++) {
         const row = matrix[i];
         let rowIsNonEmpty = false;

         for (let j = colStart; j < colEnd; j++) {
            const col = row[j];
            if (col !== emptyMatrixId) {
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

   return Math.max(...maxes) * 2;
}

function trim(_matrix: string, emptyMatrixId = ".") {
   const matrix = getOrSetMatrix(_matrix);

   const firstRowIsEmpty = () => matrix[0]?.every((v) => v === emptyMatrixId);
   const lastRowIsEmpty = () =>
      matrix[matrix.length - 1]?.every((v) => v === emptyMatrixId);
   const firstColIsEmpty = () => matrix.every((v) => v[0] === emptyMatrixId);
   const lastColIsEmpty = () =>
      matrix.every((v) => v[v.length - 1] === emptyMatrixId);

   while (
      firstRowIsEmpty() &&
      lastRowIsEmpty() &&
      firstColIsEmpty() &&
      lastColIsEmpty()
   ) {
      matrix.shift();
      matrix.pop();
      matrix.forEach((v) => {
         v.shift();
         v.pop();
      });
   }

   return matrix;
}

function getOverlap(_matrix: string, row: number, col: number) {
   const matrix = getOrSetMatrix(_matrix);

   const fixedRow = row >= 0 ? row + 1 : row;
   const fixedCol = col >= 0 ? col + 1 : col;

   const top = -matrix.length / 2;
   const bottom = matrix.length / 2;
   const left = -matrix.length / 2;
   const right = matrix.length / 2;

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

function expand(_matrix: string, size: number, emptyMatrixId = ".") {
   if (!size) return;
   const matrix = getOrSetMatrix(_matrix);

   // expand rows
   const targetLength = matrix.length;
   for (let i = 0; i < size; i++) {
      matrix.unshift(
         Array.from({ length: targetLength }).map(() => emptyMatrixId)
      );
      matrix.push(
         Array.from({ length: targetLength }).map(() => emptyMatrixId)
      );
   }

   // expand cols
   matrix.forEach((v) => {
      for (let i = 0; i < size; i++) {
         v.unshift(emptyMatrixId);
         v.push(emptyMatrixId);
      }
   });

   return matrix;
}

function getRealRowAndColumn(_matrix: string, row: number, col: number) {
   const matrix = getOrSetMatrix(_matrix);
   const center = matrix.length / 2;
   return [row + center, col + center];
}

function fill(
   _matrix: string,
   row: number,
   col: number,
   matrixId: string,
   emptyMatrixId = "."
) {
   // Expand if needed
   const overlap = getOverlap(_matrix, row, col);
   if (overlap > 0) {
      expand(_matrix, overlap, emptyMatrixId);
   }

   const [_row, _col] = getRealRowAndColumn(_matrix, row, col);

   const matrix = getOrSetMatrix(_matrix);
   const fill = (
      row: number,
      col: number,
      matrixId: string,
      targetMatrixId: string
   ) => {
      // stop if out of bounds
      if (
         row < 0 ||
         row >= matrix.length ||
         col < 0 ||
         col >= matrix[0].length
      ) {
         return;
      }

      // stop if the id is already set
      if (matrix[row][col] === matrixId) {
         return;
      }

      // stop if the current id is not equal to target id
      if (targetMatrixId !== matrix[row][col]) {
         return;
      }

      matrix[row][col] = matrixId;
      fill(row + 1, col, matrixId, targetMatrixId);
      fill(row - 1, col, matrixId, targetMatrixId);
      fill(row, col + 1, matrixId, targetMatrixId);
      fill(row, col - 1, matrixId, targetMatrixId);
   };

   fill(_row, _col, matrixId, matrix[_row][_col]);

   return matrix;
}

function add(
   _matrix: string,
   row: number,
   col: number,
   matrixId: string,
   emptyMatrixId = "."
) {
   const matrix = getOrSetMatrix(_matrix);
   const overlap = getOverlap(_matrix, row, col);
   if (overlap > 0) {
      expand(_matrix, overlap, emptyMatrixId);
   }

   const [_row, _col] = getRealRowAndColumn(_matrix, row, col);
   matrix[_row][_col] = matrixId;

   trim(_matrix, emptyMatrixId);

   return matrix;
}

function updateMinSize(_matrix: string, minSize: number, emptyMatrixId = ".") {
   const matrix = getOrSetMatrix(_matrix);

   if (typeof minSize == "number" && minSize >= 0) {
      trim(_matrix, emptyMatrixId);
      if (matrix.length < minSize) {
         const offset = Math.floor((minSize - matrix.length) / 2);
         if (offset !== 0) {
            expand(_matrix, offset, emptyMatrixId);
         }
      }
   }

   return matrix;
}

self.onmessage = async (e) => {
   const job: WorkerJob = e.data;
   const resultToBeSent = Object.assign({}, job);
   resultToBeSent.data = {};

   if (job.name == "getNonEmptyTotalSize") {
      resultToBeSent.data.nonEmptyTotalSize = getNonEmptyTotalSize(
         job.data.matrix,
         job.data.emptyMatrixId
      );
   } else if (job.name == "trim") {
      resultToBeSent.data.matrix = trim(
         job.data.matrix,
         job.data.emptyMatrixId
      );
   } else if (job.name == "fill") {
      resultToBeSent.data.matrix = fill(
         job.data.matrix,
         job.data.row,
         job.data.col,
         job.data.matrixId,
         job.data.emptyMatrixId
      );
   } else if (job.name == "add") {
      resultToBeSent.data.matrix = add(
         job.data.matrix,
         job.data.row,
         job.data.col,
         job.data.matrixId,
         job.data.emptyMatrixId
      );
   } else if (job.name == "expand") {
      resultToBeSent.data.matrix = expand(
         job.data.matrix,
         job.data.size,
         job.data.emptyMatrixId
      );
   } else if (job.name == "updateMinSize") {
      resultToBeSent.data.matrix = updateMinSize(
         job.data.matrix,
         job.data.minSize,
         job.data.emptyMatrixId
      );
   }

   postMessage(resultToBeSent);
};

self.onerror = (e) => {
   console.error(e);
};
