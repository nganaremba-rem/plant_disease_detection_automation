import { contextBridge, ipcRenderer, ipcMain } from "electron";

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
} satisfies Window["versions"]);

contextBridge.exposeInMainWorld("electron", {
  startMonitoring: () => ipcRenderer.invoke("startMonitoring"),
  stoppedMonitoring: (callback: () => void) =>
    ipcRenderer.on("stoppedMonitoring", () => callback()),
  processingStatus: (callback: (status: boolean) => void) =>
    ipcRenderer.on("processingStatus", (_, status) => callback(status)),
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  processComplete: (callback: (results: any) => void) => {
    ipcRenderer.on("process-complete", (_, results) => callback(results));
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
