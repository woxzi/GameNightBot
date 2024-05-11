export function getScore(place: number): number {
  switch (place) {
    case 1:
      return 25;
    case 2:
      return 15;
    case 3:
      return 10;
    case 4:
      return 5;
    default:
      return 0;
  }
}
