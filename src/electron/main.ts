import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "node:path";
import {
  clickOnScreen,
  deleteFiles,
  getMousePosition,
  getPixelColor,
  launchApp,
  processImage,
} from "./modules/automation.js";
import cron from "node-cron";
import {
  COORDINATES,
  PIXEL_COLORS,
  SCREEN_POSITIONS,
} from "./constants/constants.js";

let isMonitoringRunning = false;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let scheduledJobs: any[] = []; // Keep track of scheduled cron jobs

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload:
        process.env.NODE_ENV === "development"
          ? path.join(app.getAppPath(), "dist-electron/preload.cjs")
          : path.join(app.getAppPath(), "..", "dist-electron/preload.cjs"),
      contextIsolation: true, // Enable context isolation for accessing process.env in renderer
    },
    autoHideMenuBar: true,
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }

  return mainWindow;
};

app.whenReady().then(() => {
  const mainWindow = createWindow();

  // delete all files in the path
  // deleteFiles("D:\\Users\\TVWall\\TRUECLOUD\\download\\", mainWindow);

  ipcMain.handle("startMonitoring", () => {
    // scheduleJob("0 9 * * *", () => monitoringTask(mainWindow, "0 9 * * *")); // At 09:00 every day
    // scheduleJob("0 12 * * *", () => monitoringTask(mainWindow, "0 12 * * *")); // At 12:00 every day
    // scheduleJob("0 15 * * *", () => monitoringTask(mainWindow, "0 15 * * *")); // At 15:00 every day
    scheduleJob("30 15 0 * * *", () =>
      monitoringTask(mainWindow, "30 15 0 * * *")
    ); // At 12:15:30am every day
    scheduleJob("0 16 0 * * *", () =>
      monitoringTask(mainWindow, "0 16 0 * * *")
    ); // At 12:16:00am every day
    startMonitoring(mainWindow);
  });

  // get mouse position
  // setInterval(() => {
  //   const mouse = getMousePosition();
  //   console.log(`Mouse X: ${mouse.x}, Y: ${mouse.y}`);
  //   const color = getPixelColor(mouse.x, mouse.y);
  //   console.log(`Color: ${color}`);
  // }, 1000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function isPositionReadyToBeClicked(
  coordinatesWithColor: {
    X: number;
    Y: number;
    COLOR: string;
  },
  shouldMatchColor = true
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let isReady = false;
    const interval = setInterval(() => {
      const color = getPixelColor(
        coordinatesWithColor.X,
        coordinatesWithColor.Y
      );
      console.log(
        `Comparing color: ${color} with ${coordinatesWithColor.COLOR}\nX: ${coordinatesWithColor.X}, Y: ${coordinatesWithColor.Y}`
      );
      if (
        (shouldMatchColor && color === coordinatesWithColor.COLOR) ||
        (!shouldMatchColor && color !== coordinatesWithColor.COLOR)
      ) {
        isReady = true;
        clearInterval(interval);
        resolve(true);
      }
    }, 1000);
    setTimeout(() => {
      resolve(isReady);
    }, 60000); // Wait for 1 minute (60000ms) before resolving
  });
}

async function startMonitoring(mainWindow: BrowserWindow) {
  // launch truecloud app
  launchApp("D:\\Users\\TVWall\\TRUECLOUD\\TVWall.exe");

  console.log("Checking if login is ready to be clicked");
  if (await isPositionReadyToBeClicked(COORDINATES.LOGIN_READY_COORDINATES)) {
    // click on Login button
    clickOnScreen(
      SCREEN_POSITIONS.LOGIN_BUTTON.X,
      SCREEN_POSITIONS.LOGIN_BUTTON.Y
    );
    console.log("Login is ready to be clicked and clicked");
  } else {
    return;
  }

  console.log("Checking if 1st camera is ready to be clicked");
  // Turn on 1st camera
  if (await isPositionReadyToBeClicked(COORDINATES.CAM_1_READY_COORDINATES)) {
    clickOnScreen(SCREEN_POSITIONS.CAM_1.X, SCREEN_POSITIONS.CAM_1.Y);
    console.log("1st camera is ready to be clicked and clicked");
  } else {
    return;
  }

  console.log("Checking if 2nd camera is ready to be clicked");
  // Turn on 2nd camera
  if (await isPositionReadyToBeClicked(COORDINATES.CAM_2_READY_COORDINATES)) {
    clickOnScreen(SCREEN_POSITIONS.CAM_2.X, SCREEN_POSITIONS.CAM_2.Y);
    console.log("2nd camera is ready to be clicked and clicked");
  } else {
    return;
  }

  console.log("Checking if 1st camera video is not on");
  // Click on 1st camera video
  if (
    await isPositionReadyToBeClicked(
      COORDINATES.CAM_1_VIDEO_NOT_ON_COORDINATES,
      false
    )
  ) {
    console.log("1st camera video is not on and clicking on it");
    clickOnScreen(
      SCREEN_POSITIONS.CAM_1_VIDEO_BOX.X,
      SCREEN_POSITIONS.CAM_1_VIDEO_BOX.Y
    );
  } else {
    return;
  }

  // Click on capture button

  console.log("Clicking on capture button");
  clickOnScreen(
    SCREEN_POSITIONS.CAPTURE_BUTTON.X,
    SCREEN_POSITIONS.CAPTURE_BUTTON.Y
  );

  // Click on 2nd camera video
  console.log("Checking if 2nd camera video is not on");
  if (
    await isPositionReadyToBeClicked(
      COORDINATES.CAM_2_VIDEO_NOT_ON_COORDINATES,
      false
    )
  ) {
    console.log("2nd camera video is not on and clicking on it");
    clickOnScreen(
      SCREEN_POSITIONS.CAM_2_VIDEO_BOX.X,
      SCREEN_POSITIONS.CAM_2_VIDEO_BOX.Y
    );
  } else {
    return;
  }

  // Click on capture button
  console.log("Clicking on capture button");
  clickOnScreen(
    SCREEN_POSITIONS.CAPTURE_BUTTON.X,
    SCREEN_POSITIONS.CAPTURE_BUTTON.Y
  );

  // close the app
  console.log("Closing the app");
  clickOnScreen(
    SCREEN_POSITIONS.CLOSE_BUTTON.X,
    SCREEN_POSITIONS.CLOSE_BUTTON.Y
  );
  console.log("Sending stoppedMonitoring event");
  mainWindow.webContents.send("stoppedMonitoring");
  console.log("Processing image");
  processImage(mainWindow);
  console.log("Sending processingStatus event");
  mainWindow.webContents.send("processingStatus", true);
}

function monitoringTask(mainWindow: BrowserWindow, cronString: string) {
  console.log(`Running monitoring task triggered by ${cronString}...`);
  startMonitoring(mainWindow);
  mainWindow.webContents.send(
    "monitoring-update",
    `Task from ${cronString} executed!`
  );
}

function scheduleJob(cronExpression: string, task: () => void) {
  console.log(`Scheduling cron job: ${cronExpression}`);
  const job = cron.schedule(cronExpression, task);
  scheduledJobs.push(job);
  job.start();
}

function cancelAllJobs() {
  console.log("Cancelling all scheduled jobs...");
  for (const job of scheduledJobs) {
    job.stop(); // Stop each running cron job
  }
  scheduledJobs = []; // Clear the array
  isMonitoringRunning = false; // Reset running flag
  console.log("All scheduled jobs cancelled.");
}
