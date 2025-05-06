import { Menu, Tray, type BrowserWindow } from "electron";
import { app } from "electron";
import path from "node:path";

export function minimizeAppToTray(mainWindow: BrowserWindow) {
  // Create tray icon
  const isDev = process.env.NODE_ENV === "development";
  const tray = new Tray(
    isDev
      ? path.join(app.getAppPath(), "public/icon.png")
      : path.join(app.getAppPath(), "..", "dist-react/icon.png")
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
