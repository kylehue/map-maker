import { type WorkerJob } from "../utils/worker-utils";

const matrices = new Map<string, string[][]>();

function getOrSetMatrix(_matrix: string) {
   const matrix = matrices.get(_matrix);
   if (Array.isArray(matrix)) return matrix;
   const newMatrix: string[][] = [];
   matrices.set(_matrix, newMatrix);
   return newMatrix;
}

// TODO: delete unused function?
function translate(
   _matrix: string,
   rowStep: number,
   colStep: number,
   emptyMatrixId = "."
) {
   const matrix = getOrSetMatrix(_matrix);
   const rowStepAbs = Math.abs(rowStep);
   const colStepAbs = Math.abs(colStep);

   if (rowStepAbs === 0 && colStepAbs === 0) return;

   const translated: string[][] = [];

   for (let i = 0; i < matrix.length + rowStepAbs; i++) {
      for (let j = 0; j < (matrix[0]?.length || 0) + colStepAbs; j++) {
         translated[i] ??= [];
         translated[i][j] = emptyMatrixId;
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
            matrix[row - (rowStep < 0 ? 0 : rowStepAbs)][
               col - (colStep < 0 ? 0 : colStepAbs)
            ];
      }
   }

   return translated;
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

   const matrix = getOrSetMatrix(_matrix);
   const matrixCenter = matrix.length / 2;
   const targetMatrixId = matrix[row + matrixCenter][col + matrixCenter];

   const isValidCell = (row: number, col: number) => {
      // get real position to 2d array
      const _row = row + matrixCenter;
      const _col = col + matrixCenter;

      // invalid if it's outside array bounds
      if (
         _row < 0 ||
         _col < 0 ||
         _row >= matrix.length ||
         _col >= matrix.length
      ) {
         return false;
      }

      // invalid if the cell is already filled
      if (matrix[_row][_col] === matrixId) {
         return false;
      }

      // invalid if the cell is not in the target "color"
      if (targetMatrixId !== matrix[_row][_col]) {
         return false;
      }

      return true;
   };

   const stack: { row: number; col: number }[] = [];
   stack.push({ row, col });
   while (stack.length) {
      const cell = stack.pop()!;

      // get real position to 2d array
      const _row = cell.row + matrixCenter;
      const _col = cell.col + matrixCenter;

      matrix[_row][_col] = matrixId;

      if (isValidCell(cell.row + 1, cell.col)) {
         stack.push({ row: cell.row + 1, col: cell.col });
      }
      if (isValidCell(cell.row - 1, cell.col)) {
         stack.push({ row: cell.row - 1, col: cell.col });
      }
      if (isValidCell(cell.row, cell.col + 1)) {
         stack.push({ row: cell.row, col: cell.col + 1 });
      }
      if (isValidCell(cell.row, cell.col - 1)) {
         stack.push({ row: cell.row, col: cell.col - 1 });
      }
   }

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

   // get real position to 2d array
   const matrixCenter = matrix.length / 2;
   const _row = row + matrixCenter;
   const _col = col + matrixCenter;

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

function clean(_matrix: string, emptyMatrixId = ".") {
   const matrix = getOrSetMatrix(_matrix);

   let maxRow = matrix.length;
   let maxCol = -Infinity;
   for (let i = matrix.length - 1; i >= 0; i--) {
      const row = matrix[i].filter(
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
      const row = (matrix[i] || []).filter(
         (str) => typeof str == "string" && str.length
      );
      while (row.length < maxLength) {
         row.push(emptyMatrixId);
      }
      matrix[i] = row;
   }

   trim(_matrix, emptyMatrixId);
   return matrix;
}

function fromString(
   _matrix: string,
   matrixStr: string,
   separator: string,
   emptyMatrixId = "."
) {
   const matrixData = matrixStr.split("\n").map((v) => v.split(separator));
   matrices.set(_matrix, matrixData);
   clean(_matrix, emptyMatrixId);
   return matrixData;
}

function replaceMatrixId(_matrix: string, from: string, to: string) {
   const matrix = getOrSetMatrix(_matrix);

   for (let i = matrix.length - 1; i >= 0; i--) {
      matrix[i] = matrix[i].map((v) => {
         if (v === from) return to;
         return v;
      });
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
   } else if (job.name == "setMatrixFromString") {
      resultToBeSent.data.matrix = fromString(
         job.data.matrix,
         job.data.matrixString,
         job.data.separator,
         job.data.emptyMatrixId
      );
   } else if (job.name == "setEmptyMatrixId" || job.name == "replaceMatrixId") {
      resultToBeSent.data.matrix = replaceMatrixId(
         job.data.matrix,
         job.data.from,
         job.data.to
      );
   }

   postMessage(resultToBeSent);
};

self.onerror = (e) => {
   console.error(e);
};
