import { getPixelColor } from "./automation.js";

export function isPositionReadyToBeClicked(
  coordinatesWithColor: {
    X: number;
    Y: number;
    COLOR: string;
  },
  shouldMatchColor = true,
  waitTime = 1000 * 60 * 1 // 1 minute
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let isReady = false;
    const interval = setInterval(() => {
      const color = getPixelColor(
        coordinatesWithColor.X,
        coordinatesWithColor.Y
      );
      // console.log(
      //   `Comparing for X: ${coordinatesWithColor.X} and Y: ${coordinatesWithColor.Y} \nComparing color:   ${color} with ${coordinatesWithColor.COLOR}\nX: ${coordinatesWithColor.X}, Y: ${coordinatesWithColor.Y}`
      // );
      if (
        (shouldMatchColor && color === coordinatesWithColor.COLOR) ||
        (!shouldMatchColor && color !== coordinatesWithColor.COLOR)
      ) {
        isReady = true;
        clearInterval(interval);
        resolve(true);
      }
    }, 200);
    setTimeout(() => {
      resolve(isReady);
      clearInterval(interval);
    }, waitTime);
  });
}
