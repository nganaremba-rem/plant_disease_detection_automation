import type { BrowserWindow } from "electron";
import { dialog } from "electron";
import prompt from "electron-prompt";
import fs from "fs-extra";
import { exec } from "node:child_process";
import path from "node:path";
import robot from "robotjs";
import trash from "trash";
import { ENDPOINTS, directory, mailConfig } from "../config/config.js";
import { CameraAndFarmData, EVENTS, Platform } from "../constants/constants.js";
import { AxiosInstance } from "../utils/api.js";
import { sendMailApiRequest } from "./sendMail.js";

export const launchApp = (pathOfApp: string) => {
  if (process.platform === Platform.windows) {
    exec(`start ${pathOfApp}`);
  } else if (process.platform === Platform.mac) {
    exec(`open ${pathOfApp}`);
  } else if (process.platform === Platform.linux) {
    exec(`xdg-open ${pathOfApp}`);
  }
};

export const checkTrueCloudInstallation = () => {
  const truecloudPath = "D:\\Users\\TVWall\\TRUECLOUD\\TVWall.exe";
  const exists = fs.existsSync(truecloudPath);
  console.log("Installation exists:", exists);
  return exists;
};

export const getMousePosition = () => {
  return robot.getMousePos();
};

export const getPixelColor = (x: number, y: number) => {
  return robot.getPixelColor(x, y);
};

export const clickOnScreen = (x: number, y: number) => {
  robot.moveMouse(x, y);
  robot.mouseClick();
};

export const typeText = (text: string) => {
  robot.typeString(text);
};

export const pressKey = (key: string) => {
  robot.keyTap(key);
};

export const pressKeyCombination = (keys: string[]) => {
  robot.keyTap(keys.join("+"));
};

export const deleteFiles = async (
  pathToDelete: string,
  mainWindow: BrowserWindow
) => {
  try {
    const files = await fs.readdir(pathToDelete);

    const fileCount = files.length;

    prompt(
      {
        title: "Confirm Deletion",
        label: `Are you sure you want to delete all ${fileCount} files in:\n${pathToDelete}?`,
        value: "NO", // Default value (important to prevent accidental confirmation)
        type: "input",
        inputAttrs: {
          type: "string",
          required: "YES",
          placeholder: "Type YES to confirm",
        },
        alwaysOnTop: true,
        skipTaskbar: false, // Ensures the prompt is visible on top
        height: 175,
        width: 400,
        resizable: false,
      },
      mainWindow
    ) // Ensure the prompt is parented to main window
      .then((result) => {
        if (result === null) {
          console.log("User cancelled deletion.");
          return;
        }
        if (result === "YES") {
          //ATTENTION: using 'trash' is safer to send files to Recycle Bin instead of deleting permanently
          //trash([directory]).then(() => {  //Delete whole directory - BE CAREFUL, not recommended if other files are in the path
          // fs.emptyDir(directory).then(() => { //Delete all files inside the directory
          //NOTE: fs.emptyDir() only deletes the files in the directory, it does NOT delete any subdirectories
          const filesToDelete = files.map((file) =>
            path.join(pathToDelete, file)
          );
          trash(filesToDelete)
            .then(() => {
              // safer -> sends to Recycle Bin

              dialog.showMessageBox(mainWindow, {
                type: "info",
                title: "Deletion Complete",
                message: `Successfully moved all ${fileCount} files to the Recycle Bin.`,
              });
            })
            .catch((err) => {
              console.error("Error moving to recycle bin", err);
              dialog.showErrorBox(
                "Error",
                `Error moving files to recycle bin: ${err.message}`
              );
            });
          //Alternative implementation is below: - THIS IS PERMANENT DELETE
          //WARNING: Be careful with the below implementation as the files will be permanently deleted from the disk
          // files.forEach(file => {
          //   const filePath = path.join(directory, file);
          //   fs.remove(filePath).then(() => {
          //   }).catch(err => {
          //     console.error('Error deleting file', err);
          //   });
          // });
        } else {
          console.log("User did not confirm deletion.");
          dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "Deletion Cancelled",
            message: "File deletion cancelled.",
          });
        }
      })
      .catch(console.error);
  } catch (error) {
    console.error(error);
  }
};

export const getLatestBmp = async (dir: string) => {
  let latestFile = null;
  let latestModTime = 0;

  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile() && file.toLowerCase().endsWith(".bmp")) {
        if (stat.mtimeMs > latestModTime) {
          latestFile = filePath;
          latestModTime = stat.mtimeMs;
        }
      }
    }
  } catch (error) {
    console.error(`Error getting latest BMP in ${dir}:`, error);
    return null;
  }

  return latestFile;
};

export const uploadImage = async (
  imagePath: string,
  mainWindow: BrowserWindow
): Promise<ClassificationResults | undefined> => {
  try {
    if (!imagePath) {
      console.log("No image to upload.");
      return undefined;
    }
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([fs.readFileSync(imagePath)]),
      path.basename(imagePath)
    );

    const response = await AxiosInstance.post<ClassificationResults>(
      ENDPOINTS.CLASSIFY,
      formData,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("API Response:", response.data);
    return response.data; // Return the API response
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    console.error("Error uploading image:", error);
    if (error.response) {
      console.error("API Error Data:", error.response.data);
      console.error("API Error Status:", error.response.status);
    }

    mainWindow.webContents.send(
      EVENTS.ERROR,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      error?.errors?.map((e: any) => e.message).join("\n") ||
        error?.message ||
        "Unknown error"
    );
    mainWindow.webContents.send(EVENTS.PROCESSING_STATUS, false);
  }
};

export const processImage = async (
  mainWindow: BrowserWindow,
  unavailableCamerasIndex: number[]
) => {
  try {
    const subfolders = (await fs.readdir(directory, { withFileTypes: true }))
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(directory, dirent.name))
      .sort((a, b) => {
        // Sort synchronously using sync fs.statSync instead of async fs.stat
        const statA = fs.statSync(a);
        const statB = fs.statSync(b);
        return statB.mtime.getTime() - statA.mtime.getTime();
      });

    subfolders.length = subfolders.length - unavailableCamerasIndex.length;

    const results: ResultsForUI[] = [];

    for (const subfolder of subfolders) {
      const latestBmp = await getLatestBmp(subfolder);
      if (latestBmp) {
        console.log(`Latest BMP in ${subfolder}: ${latestBmp}`);
        const apiResponse = await uploadImage(latestBmp, mainWindow);
        console.log("API Response:", apiResponse);

        if (!apiResponse) {
          console.log("Upload failed");
          return;
        }

        const hasDisease = apiResponse.classification_results.some(
          (result) => result.score > 0.8 // 80% confidence
        );

        const diseaseTypes = apiResponse.classification_results.filter(
          (result) => result.label !== "healthy"
        );

        /*
       unavailableCamerasIndex = [0, 10, 3]
            {
              subfolder index 0: camera 16
              subfolder index 1: camera 15
              subfolder index 2: camera 14
              subfolder index 3: camera 13
              subfolder index 4: camera 12
              subfolder index 5: camera 10 // since camera 11 (index 10) is unavailable, skip from 11 to 10
              subfolder index 6: camera 9
              subfolder index 7: camera 8
              subfolder index 8: camera 7
              subfolder index 9: camera 6
              subfolder index 10: camera 5 
              subfolder index 11: camera 3 // since camera 4 (index 3) is unavailable, skip from 4 to 2
              subfolder index 12: camera 2 // since camera 1 (index 0) is unavailable, this maps to camera 2
            }
       */

        const availableCameraIndex = Array.from(
          { length: 16 },
          (_, i) => i
        ).filter((index) => !unavailableCamerasIndex.includes(index));

        console.log("Available camera indexes:", availableCameraIndex);

        const cameraToFolderIndexMap = subfolders.map((_, index, array) => ({
          camIndex: availableCameraIndex[index],
          folderIndex: array.length - (index + 1),
        }));

        console.log("Camera to folder index map:", cameraToFolderIndexMap);
        // for (const invalidCamIndex of unavailableCamerasIndex) {
        //   const withoutInvalid = cameraToFolderIndexMap.filter(
        //     (item) => invalidCamIndex !== item.camIndex
        //   );

        //   const final = withoutInvalid.map((item, idx) => ({
        //     ...item,
        //     folderIndex: idx,
        //   }));

        //   cameraToFolderIndexMap = final;
        // }

        console.log("Camera to folder index map:", cameraToFolderIndexMap);

        const folderIndex = subfolders.indexOf(subfolder);
        console.log("Folder index:", folderIndex);
        const cameraIndex = cameraToFolderIndexMap.find(
          (item) => item.folderIndex === folderIndex
        )?.camIndex;

        console.log("Camera index:", cameraIndex);

        if (cameraIndex === undefined) {
          console.log("Camera index not found");
          return;
        }

        const cameraNumber = cameraIndex + 1;
        console.log("Camera number:", cameraNumber);

        if (!cameraNumber) {
          console.log("Camera number not found");
          return;
        }

        const cameraData = CameraAndFarmData.find(
          (camera) => camera.camera === cameraNumber
        );

        if (!cameraData) {
          console.log("Camera data not found");
          return;
        }

        console.log("Camera data:", cameraData);

        const result: ResultsForUI = {
          folder: subfolder,
          camera: cameraNumber,
          cameraData: cameraData,
          image: `data:image/bmp;base64,${fs
            .readFileSync(latestBmp)
            .toString("base64")}`,
          hasDisease,
          diseaseTypes,

          classification_results: apiResponse.classification_results.map(
            (result) => ({
              isDiseaseDetected: result.label !== "healthy",
              label: result.label,
              confidence: result.score * 100,
            })
          ),
          // apiResponse: apiResponse || "Upload failed",
        };

        results.push(result);
      } else {
        console.log(`No BMP files found in ${subfolder}`);
        results.push({
          folder: subfolder,
          message: "No BMP files found",
        });
      }
    }

    // since the latest new folder is the first one, we need to reverse the order here again
    const resultsForUIAndMail = results.toReversed();

    // if any result has hasDisease true, send mail
    if (resultsForUIAndMail.some((result) => result.hasDisease)) {
      sendMailApiRequest(mailConfig.mailTo, resultsForUIAndMail);
    }

    // console.log("Results:", resultsForUIAndMail);
    mainWindow.webContents.send(EVENTS.PROCESSING_STATUS, false);
    mainWindow.webContents.send(EVENTS.PROCESS_COMPLETE, resultsForUIAndMail);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    console.error("Error processing images:", error);
    dialog.showErrorBox("Error", `An error occurred: ${error.message}`);
  }
};
