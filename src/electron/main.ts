import { BrowserWindow, app, ipcMain, screen, shell } from "electron";
import { EVENTS } from "./constants/constants.js";
import { checkTrueCloudInstallation } from "./modules/automation.js";
import dotenv from "dotenv";
import { createWindow } from "./modules/createWindow.js";
import { cancelAllJobs, scheduleJob } from "./modules/jobs.js";
import { minimizeAppToTray } from "./modules/minimizeToTray.js";
import { monitoringTask, startMonitoring } from "./modules/startMonitoring.js";

dotenv.config();

app.whenReady().then(() => {
  const mainWindow = createWindow();

  // Register IPC handlers
  ipcMain.handle("startMonitoring", async (_, cronTimes: string[]) => {
    try {
      console.log("Starting monitoring with cron times:", cronTimes);
      cancelAllJobs();
      for (const cronTime of cronTimes) {
        scheduleJob(cronTime, () => monitoringTask(mainWindow, cronTime));
      }

      mainWindow.webContents.send(EVENTS.TIME_SCHEDULED, cronTimes);
      await startMonitoring(mainWindow);
      return true;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      console.error("Error in startMonitoring:", error);
      mainWindow.webContents.send(EVENTS.ERROR, error.message);
      return false;
    }
  });

  ipcMain.handle("stopMonitoring", () => {
    try {
      cancelAllJobs();
      mainWindow.webContents.send(EVENTS.STOPPED_MONITORING);
      mainWindow.webContents.send(EVENTS.TIME_SCHEDULED, []);
      return true;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      console.error("Error in stopMonitoring:", error);
      mainWindow.webContents.send(EVENTS.ERROR, error.message);
      return false;
    }
  });

  ipcMain.handle("openExternal", (_, url: string) => {
    shell.openExternal(url);
  });

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

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
});
