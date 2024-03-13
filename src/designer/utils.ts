import { Vector } from "../utils/Vector";

interface Box {
   x: number;
   y: number;
   width: number;
   height: number;
}

export function pointToAABBCollision(x: number, y: number, box: Box) {
   return (
      x >= box.x &&
      x <= box.x + box.width &&
      y >= box.y &&
      y <= box.y + box.height
   );
}
