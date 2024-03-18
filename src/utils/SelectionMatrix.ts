import { MapMatrix } from "./MapMatrix";

export class SelectionMatrix extends MapMatrix {
   private start?: [number, number];
   private end?: [number, number];

   setBounds() {
      
   }

   setStart(row: number, col: number) {
      this.clear();
      this.add(row, col, "x");
      this.start = [row, col];
   }

   setEnd(row: number, col: number) {
      this.add(row, col, "x");
      this.end = [row, col];
   }

   select() {

   }
}