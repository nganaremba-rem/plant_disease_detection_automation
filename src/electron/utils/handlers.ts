// functions

import type { BrowserWindow } from "electron";

export const webContentsSend = (
  window: BrowserWindow,
  key: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any
) => {
  window.webContents.send(key, data);
};
