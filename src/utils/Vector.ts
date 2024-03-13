export class Vector {
   public x = 0;
   public y = 0;

   constructor();
   constructor(x: number, y: number);
   constructor(x?: number, y?: number) {
      this.x = x ?? this.x;
      this.y = y ?? this.y;
   }
}