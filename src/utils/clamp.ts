export function clamp(n: number, min: number, max: number) {
   let val = n < min ? min : n;
   val = val > max ? max : val;
   return val;
}
