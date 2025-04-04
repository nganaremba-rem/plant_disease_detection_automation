import { contextBridge, ipcRenderer, ipcMain } from "electron";

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
} satisfies Window["versions"]);

contextBridge.exposeInMainWorld("electron", {
  startMonitoring: (cronTimes: string[]) => {
    ipcRenderer.invoke("startMonitoring", cronTimes);
  },
  stopMonitoring: () => {
    ipcRenderer.invoke("stopMonitoring");
  },
  stoppedMonitoring: (callback: () => void) => {
    ipcRenderer.on("stoppedMonitoring", () => callback());
  },
  processingStatus: (callback: (status: boolean) => void) => {
    ipcRenderer.on("processingStatus", (_, status) => callback(status));
  },
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  processComplete: (callback: (results: any) => void) => {
    ipcRenderer.on("processComplete", (_, results) => callback(results));
  },
  timeScheduled: (callback: (time: string[]) => void) => {
    ipcRenderer.on("timeScheduled", (_, time) => callback(time));
  },
  openExternal: (url: string) => {
    ipcRenderer.invoke("openExternal", url);
  },
  errorReport: (callback: (error: string) => void) => {
    ipcRenderer.on("errorReport", (_, error) => callback(error));
  },
} satisfies Window["electron"]);

// ############## HANDLERS ##############

// export const ipcRendererOn = (
//   key: string,
//   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//   handler: (payload: any) => void
// ) => {
//   // @ts-ignore
//   ipcRenderer.on(key, (_, payload) => handler(payload));
// };

// export const ipcRendererInvoke = (key: string) => {
//   return ipcRenderer.invoke(key);
// };

// export const ipcMainHandle = (key: string, handler: () => void) => {
//   ipcMain.handle(key, handler);
// };
