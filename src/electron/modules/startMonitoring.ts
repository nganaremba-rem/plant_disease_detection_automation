import { screen, type BrowserWindow } from "electron";
import { closeTrueCloudProcess } from "./closeTrueCloudProcess.js";
import { clickOnScreen, launchApp, processImage } from "./automation.js";
import { isPositionReadyToBeClicked } from "./isPositionReadyToBeClicked.js";
import {
  COORDINATES_WITH_COLORS,
  EVENTS,
  SECONDS_TO_WAIT,
} from "../constants/constants.js";

export function monitoringTask(mainWindow: BrowserWindow, cronString: string) {
  console.log(`Running monitoring task triggered by ${cronString}...`);
  startMonitoring(mainWindow);
  mainWindow.webContents.send(
    EVENTS.MONITORING_UPDATE,
    `Task from ${cronString} executed!`
  );
}

export async function startMonitoring(mainWindow: BrowserWindow) {
  closeTrueCloudProcess(mainWindow);

  const unavailableCamerasIndex: number[] = [];

  const { width, height } = screen.getPrimaryDisplay().size;

  // launch truecloud app
  launchApp("D:\\Users\\TVWall\\TRUECLOUD\\TVWall.exe");

  console.log("Checking if login is ready to be clicked");
  if (
    await isPositionReadyToBeClicked(
      COORDINATES_WITH_COLORS.LOGIN_READY_COORDINATES(width, height)
    )
  ) {
    // click on Login button
    clickOnScreen(
      COORDINATES_WITH_COLORS.LOGIN_READY_COORDINATES(width, height).X,
      COORDINATES_WITH_COLORS.LOGIN_READY_COORDINATES(width, height).Y
    );
    console.log("Login is ready to be clicked and clicked");
  } else {
    return;
  }

  console.log("Checking if 1st camera is ready to be clicked");

  for (const [
    index,
    { X, Y, COLOR },
  ] of COORDINATES_WITH_COLORS.CAM_READY_COORDINATES(width, height).entries()) {
    // when it reaches cam 13, click on the scroll down button
    if (index === 13) {
      clickOnScreen(
        COORDINATES_WITH_COLORS.CAM_SCROLL_DOWN_BUTTON(width, height).X,
        COORDINATES_WITH_COLORS.CAM_SCROLL_DOWN_BUTTON(width, height).Y
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (
      await isPositionReadyToBeClicked({ X, Y, COLOR }, true, SECONDS_TO_WAIT)
    ) {
      clickOnScreen(
        COORDINATES_WITH_COLORS.CAM_TOGGLE_ON_OFF_BUTTON_COORDINATES(
          width,
          height
        )[index].X,
        COORDINATES_WITH_COLORS.CAM_TOGGLE_ON_OFF_BUTTON_COORDINATES(
          width,
          height
        )[index].Y
      );
      console.log(`Camera ${index + 1} is ready to be clicked and clicked`);
    } else {
      unavailableCamerasIndex.push(index);
      console.log("Number of unavailable cameras:", unavailableCamerasIndex);
    }
  }

  // click on the scroll up button
  clickOnScreen(
    COORDINATES_WITH_COLORS.CAM_SCROLL_UP_BUTTON(width, height).X,
    COORDINATES_WITH_COLORS.CAM_SCROLL_UP_BUTTON(width, height).Y
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  let numberOfUnavailableCameras = 0;
  for (const [index, _] of COORDINATES_WITH_COLORS.CAM_VIDEO_NOT_ON_COORDINATES(
    width,
    height
  ).entries()) {
    if (unavailableCamerasIndex.includes(index)) {
      numberOfUnavailableCameras++;
      console.log(`Camera ${index + 1} is unavailable`);
      continue;
    }

    console.log("Number of unavailable cameras:", numberOfUnavailableCameras);

    if (
      (await isPositionReadyToBeClicked(
        COORDINATES_WITH_COLORS.CAM_VIDEO_NOT_ON_COORDINATES(width, height)[
          index - numberOfUnavailableCameras
        ],
        false,
        SECONDS_TO_WAIT
      )) &&
      (await isPositionReadyToBeClicked(
        COORDINATES_WITH_COLORS.CAM_VIDEO_NOT_ON_COORDINATES_2(width, height)[
          index - numberOfUnavailableCameras
        ],
        false,
        SECONDS_TO_WAIT
      ))
    ) {
      clickOnScreen(
        COORDINATES_WITH_COLORS.CAM_VIDEO_BOX_COORDINATES(width, height)[
          index - numberOfUnavailableCameras
        ].X,
        COORDINATES_WITH_COLORS.CAM_VIDEO_BOX_COORDINATES(width, height)[
          index - numberOfUnavailableCameras
        ].Y
      );
      console.log(`Camera ${index + 1} video is not on and clicked`);
      clickOnScreen(
        COORDINATES_WITH_COLORS.CAPTURE_BUTTON(width, height).X,
        COORDINATES_WITH_COLORS.CAPTURE_BUTTON(width, height).Y
      );
      clickOnScreen(
        COORDINATES_WITH_COLORS.CLOSE_CAPTURE_PREVIEW_BUTTON(width, height).X,
        COORDINATES_WITH_COLORS.CLOSE_CAPTURE_PREVIEW_BUTTON(width, height).Y
      );
    } else {
      console.log(`Camera ${index + 1} video is not on`);
      unavailableCamerasIndex.push(index);
    }
  }

  // click on the scroll up button
  clickOnScreen(
    COORDINATES_WITH_COLORS.CAM_SCROLL_UP_BUTTON(width, height).X,
    COORDINATES_WITH_COLORS.CAM_SCROLL_UP_BUTTON(width, height).Y
  );

  // close the app
  console.log("Closing the app");
  // TODO: turn this on when the app is ready
  clickOnScreen(
    COORDINATES_WITH_COLORS.CLOSE_BUTTON(width, height).X,
    COORDINATES_WITH_COLORS.CLOSE_BUTTON(width, height).Y
  );
  console.log("Processing image");
  processImage(mainWindow, unavailableCamerasIndex);
  console.log("Sending processingStatus event");
  mainWindow.webContents.send(EVENTS.PROCESSING_STATUS, true);
}
