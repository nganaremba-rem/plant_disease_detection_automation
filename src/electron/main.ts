import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  screen,
  Tray,
  Menu,
} from "electron";
import * as path from "node:path";
import {
  clickOnScreen,
  deleteFiles,
  getMousePosition,
  getPixelColor,
  launchApp,
  processImage,
  checkTrueCloudInstallation,
} from "./modules/automation.js";
import cron from "node-cron";
import {
  COORDINATES_WITH_COLORS,
  EVENTS,
  PIXEL_COLORS,
  SECONDS_TO_WAIT,
} from "./constants/constants.js";

import dotenv from "dotenv";
import { SCHEDULED_TIMING } from "./config/config.js";
import { execSync } from "node:child_process";

dotenv.config();

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
      contextIsolation: true,
      devTools: process.env.NODE_ENV === "development", // Disable dev tools
    },
    autoHideMenuBar: true,
    show: false, // Don't show window until it's ready to maximize
  });

  mainWindow.maximize(); // Maximize the window
  mainWindow.show(); // Show the window after maximizing

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }

  return mainWindow;
};

function minimizeAppToTray(mainWindow: BrowserWindow) {
  // Create tray icon
  const tray = new Tray(path.join(app.getAppPath(), "public/icon.png"));

  tray.on("click", () => {
    mainWindow.show();
  });

  tray.on("right-click", () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show App",
        click: () => {
          mainWindow.show();
        },
        accelerator: "CommandOrControl+S",
      },
      { type: "separator" },
      {
        label: "Restart App",
        click: () => {
          app.relaunch();
          app.exit();
        },
        accelerator: "CommandOrControl+R",
      },
      {
        label: "Toggle Developer Tools",
        click: () => {
          mainWindow.webContents.toggleDevTools();
        },
        accelerator: "CommandOrControl+Shift+I",
        visible: process.env.NODE_ENV === "development",
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          app.quit();
        },
        accelerator: "CommandOrControl+Q",
      },
    ]);
    tray.setContextMenu(contextMenu);
  });

  tray.setToolTip("Plant Disease Detection Monitoring System");

  // Track if app is quitting
  let isQuitting = false;

  // Handle window close button
  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // Handle before-quit event
  app.on("before-quit", () => {
    isQuitting = true;
  });
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  minimizeAppToTray(mainWindow);

  // Set app to launch at startup
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath("exe"),
    args: ["--hidden"], // Launch minimized to tray
  });

  // Handle the --hidden flag
  const hiddenFlag = process.argv.includes("--hidden");
  if (hiddenFlag) {
    mainWindow.hide(); // Start minimized if --hidden flag is present
  }

  mainWindow.webContents.on("dom-ready", () => {
    if (!checkTrueCloudInstallation()) {
      mainWindow.webContents.send(
        EVENTS.ERROR,
        "TrueCloud not found at D:\\Users\\TVWall\\TRUECLOUD\\TVWall.exe"
      );
    }

    // Get primary display dimensions
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    console.log(`Screen dimensions: ${width}x${height}`);

    if (width !== 1920 || height !== 1080) {
      console.log("screen size does not match");

      mainWindow.webContents.send(
        EVENTS.ERROR,
        "Screen resolution must be set to 1920x1080 with display scaling at 100%"
      );
    }

    // get mouse position
    // setInterval(() => {
    //   const mouse = getMousePosition();
    //   console.log(`Mouse X: ${mouse.x}, Y: ${mouse.y}`);
    //   const color = getPixelColor(mouse.x, mouse.y);
    //   console.log(`Color: ${color}`);
    // }, 1000);
  });

  // delete all files in the path
  // deleteFiles("D:\\Users\\TVWall\\TRUECLOUD\\download\\", mainWindow);

  ipcMain.handle("startMonitoring", (_, cronTimes: string[]) => {
    console.log("Starting monitoring with cron times:", cronTimes);
    cancelAllJobs();
    for (const cronTime of cronTimes) {
      scheduleJob(cronTime, () => monitoringTask(mainWindow, cronTime));
    }

    mainWindow.webContents.send(EVENTS.TIME_SCHEDULED, cronTimes);

    startMonitoring(mainWindow);
  });

  ipcMain.handle("stopMonitoring", () => {
    cancelAllJobs();
    mainWindow.webContents.send(EVENTS.STOPPED_MONITORING);
    mainWindow.webContents.send(EVENTS.TIME_SCHEDULED, []);
  });

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

function closeTrueCloudProcess(mainWindow: BrowserWindow) {
  // Close truecloud if it is already running
  try {
    // Execute tasklist command to list running processes
    // /FI filters the list based on a criteria
    // "IMAGENAME eq TVWall.exe" filters for processes with image name TVWall.exe
    // { encoding: "utf-8" } returns the output as a UTF-8 string
    const trueCloudProcess = execSync(
      'tasklist /FI "IMAGENAME eq TVWall.exe"',
      { encoding: "utf-8" }
    );

    // Check if TVWall.exe process exists in the output
    if (trueCloudProcess.includes("TVWall.exe")) {
      // Execute taskkill to forcefully terminate the process
      // /F forces termination
      // /IM specifies termination by image name
      // TVWall.exe is the process to terminate
      execSync("taskkill /F /IM TVWall.exe");
      console.log("Closed existing TrueCloud process");
    }
  } catch (error) {
    // Log any errors that occur during process termination
    console.error("Error while closing TrueCloud:", error);
    // Send error event to renderer process
    mainWindow.webContents.send(
      EVENTS.ERROR,
      "Error closing TrueCloud process"
    );
  }
}

async function startMonitoring(mainWindow: BrowserWindow) {
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
    }
  }

  // click on the scroll up button
  clickOnScreen(
    COORDINATES_WITH_COLORS.CAM_SCROLL_UP_BUTTON(width, height).X,
    COORDINATES_WITH_COLORS.CAM_SCROLL_UP_BUTTON(width, height).Y
  );

  // close the app
  console.log("Closing the app");
  clickOnScreen(
    COORDINATES_WITH_COLORS.CLOSE_BUTTON(width, height).X,
    COORDINATES_WITH_COLORS.CLOSE_BUTTON(width, height).Y
  );
  console.log("Processing image");
  processImage(mainWindow, unavailableCamerasIndex);
  console.log("Sending processingStatus event");
  mainWindow.webContents.send(EVENTS.PROCESSING_STATUS, true);
}

function monitoringTask(mainWindow: BrowserWindow, cronString: string) {
  console.log(`Running monitoring task triggered by ${cronString}...`);
  startMonitoring(mainWindow);
  mainWindow.webContents.send(
    EVENTS.MONITORING_UPDATE,
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

ipcMain.handle("openExternal", (_, url: string) => {
  shell.openExternal(url);
});
