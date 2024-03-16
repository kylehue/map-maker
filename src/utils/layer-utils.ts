import { Layer } from "../types";

export function getTotalWidth(layer: Layer, tileWidth: number) {
   if (!layer.matrix.length) return 0;
   const maxLength = Math.max(...layer.matrix.map((e) => e.length));
   return maxLength * tileWidth;
}

export function getTotalHeight(layer: Layer, tileHeight: number) {
   return layer.matrix.length * tileHeight;
}