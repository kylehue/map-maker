export function map(
   n: number,
   fromMin: number,
   fromMax: number,
   toMin: number,
   toMax: number
) {
   return ((n - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
}
