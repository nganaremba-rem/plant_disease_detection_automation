import type { BrowserWindow } from "electron";
import { execSync } from "node:child_process";
import { EVENTS } from "../constants/constants.js";

export function closeTrueCloudProcess(mainWindow: BrowserWindow) {
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
