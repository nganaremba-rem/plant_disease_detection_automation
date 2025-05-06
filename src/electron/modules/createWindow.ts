import { BrowserWindow } from "electron";
import path from "node:path";
import { app } from "electron";

export const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload:
        process.env.NODE_ENV === "development"
          ? path.join(app.getAppPath(), "dist-electron/preload.cjs")
          : path.join(app.getAppPath(), "..", "dist-electron/preload.cjs"),
      contextIsolation: true,
      // devTools: process.env.NODE_ENV === "development", // Disable dev tools
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
