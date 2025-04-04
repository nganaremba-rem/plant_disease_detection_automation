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
  COORDINATES,
  EVENTS,
  PIXEL_COLORS,
  SCREEN_POSITIONS,
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
  const tray = new Tray(
    process.env.NODE_ENV === "development"
      ? path.join(app.getAppPath(), "public/icon.png")
      : path.join(app.getAppPath(), "..", "public/icon.png")
  );

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
  });

  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  console.log(`Screen dimensions: ${width}x${height}`);

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

  // launch truecloud app
  launchApp("D:\\Users\\TVWall\\TRUECLOUD\\TVWall.exe");

  console.log("Checking if login is ready to be clicked");
  if (
    await isPositionReadyToBeClicked(
      COORDINATES.LOGIN_READY_COORDINATES(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      )
    )
  ) {
    // click on Login button
    clickOnScreen(
      SCREEN_POSITIONS.LOGIN_BUTTON(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).X,
      SCREEN_POSITIONS.LOGIN_BUTTON(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).Y
    );
    console.log("Login is ready to be clicked and clicked");
  } else {
    return;
  }

  console.log("Checking if 1st camera is ready to be clicked");
  // Turn on 1st camera
  if (
    await isPositionReadyToBeClicked(
      COORDINATES.CAM_1_READY_COORDINATES(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      )
    )
  ) {
    clickOnScreen(
      SCREEN_POSITIONS.CAM_1(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).X,
      SCREEN_POSITIONS.CAM_1(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).Y
    );
  } else {
    return;
  }

  console.log("Checking if 2nd camera is ready to be clicked");
  // Turn on 2nd camera
  if (
    await isPositionReadyToBeClicked(
      COORDINATES.CAM_2_READY_COORDINATES(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      )
    )
  ) {
    clickOnScreen(
      SCREEN_POSITIONS.CAM_2(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).X,
      SCREEN_POSITIONS.CAM_2(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).Y
    );
    console.log("2nd camera is ready to be clicked and clicked");
  } else {
    return;
  }

  console.log("Checking if 1st camera video is not on");
  // Click on 1st camera video
  if (
    (await isPositionReadyToBeClicked(
      COORDINATES.CAM_1_VIDEO_NOT_ON_COORDINATES(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ),
      false
    )) &&
    (await isPositionReadyToBeClicked(
      COORDINATES.CAM_1_VIDEO_NOT_ON_COORDINATES_2(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ),
      false
    ))
  ) {
    console.log("1st camera video is not on and clicking on it");
    clickOnScreen(
      SCREEN_POSITIONS.CAM_1_VIDEO_BOX(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).X,
      SCREEN_POSITIONS.CAM_1_VIDEO_BOX(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).Y
    );
  } else {
    return;
  }

  // Click on capture button

  console.log("Clicking on capture button");
  clickOnScreen(
    SCREEN_POSITIONS.CAPTURE_BUTTON(
      screen.getPrimaryDisplay().size.width,
      screen.getPrimaryDisplay().size.height
    ).X,
    SCREEN_POSITIONS.CAPTURE_BUTTON(
      screen.getPrimaryDisplay().size.width,
      screen.getPrimaryDisplay().size.height
    ).Y
  );

  // Click on 2nd camera video
  console.log("Checking if 2nd camera video is not on");
  if (
    (await isPositionReadyToBeClicked(
      COORDINATES.CAM_2_VIDEO_NOT_ON_COORDINATES(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ),
      false
    )) &&
    (await isPositionReadyToBeClicked(
      COORDINATES.CAM_2_VIDEO_NOT_ON_COORDINATES_2(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ),
      false
    ))
  ) {
    console.log("2nd camera video is not on and clicking on it");
    clickOnScreen(
      SCREEN_POSITIONS.CAM_2_VIDEO_BOX(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).X,
      SCREEN_POSITIONS.CAM_2_VIDEO_BOX(
        screen.getPrimaryDisplay().size.width,
        screen.getPrimaryDisplay().size.height
      ).Y
    );
  } else {
    return;
  }

  // Click on capture button
  console.log("Clicking on capture button");
  clickOnScreen(
    SCREEN_POSITIONS.CAPTURE_BUTTON(
      screen.getPrimaryDisplay().size.width,
      screen.getPrimaryDisplay().size.height
    ).X,
    SCREEN_POSITIONS.CAPTURE_BUTTON(
      screen.getPrimaryDisplay().size.width,
      screen.getPrimaryDisplay().size.height
    ).Y
  );

  // close the app
  console.log("Closing the app");
  clickOnScreen(
    SCREEN_POSITIONS.CLOSE_BUTTON(
      screen.getPrimaryDisplay().size.width,
      screen.getPrimaryDisplay().size.height
    ).X,
    SCREEN_POSITIONS.CLOSE_BUTTON(
      screen.getPrimaryDisplay().size.width,
      screen.getPrimaryDisplay().size.height
    ).Y
  );
  console.log("Processing image");
  processImage(mainWindow);
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
