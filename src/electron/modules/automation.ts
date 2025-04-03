import robot from "robotjs";
import { exec } from "node:child_process";
import fs from "fs-extra";
import prompt from "electron-prompt";
import trash from "trash";
import path from "node:path";
import type { BrowserWindow } from "electron";
import { dialog } from "electron";
import axios from "axios";
import { CameraAndFarmData } from "../constants/constants.js";
import { sendMail } from "./sendMail.js";

export const launchApp = (pathOfApp: string) => {
  if (process.platform === "win32") {
    exec(`start ${pathOfApp}`);
  } else if (process.platform === "darwin") {
    exec(`open ${pathOfApp}`);
  } else {
    exec(`xdg-open ${pathOfApp}`);
  }
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
  apiUrl: string
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

    const response = await axios.post<ClassificationResults>(apiUrl, formData, {
      headers: {
        accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("API Response:", response.data);
    return response.data; // Return the API response
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    console.error("Error uploading image:", error);
    if (error.response) {
      console.error("API Error Data:", error.response.data);
      console.error("API Error Status:", error.response.status);
    }
  }
};

const directory = "D:\\Users\\TVWall\\TRUECLOUD\\download\\";
const apiUrl = "http://localhost:8000/classify/";

export const processImage = async (mainWindow: BrowserWindow) => {
  try {
    const subfolders = (await fs.readdir(directory, { withFileTypes: true }))
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(directory, dirent.name));

    const results: ResultsForUI[] = [];

    for (const subfolder of subfolders) {
      const latestBmp = await getLatestBmp(subfolder);
      if (latestBmp) {
        console.log(`Latest BMP in ${subfolder}: ${latestBmp}`);
        const apiResponse = await uploadImage(latestBmp, apiUrl);
        console.log("API Response:", apiResponse);

        if (!apiResponse) {
          console.log("Upload failed");
          return;
        }

        const hasDisease = apiResponse.classification_results.some(
          (result) => result.label !== "healthy"
        );

        const diseaseTypes = apiResponse.classification_results.filter(
          (result) => result.label !== "healthy"
        );

        const cameraNumber = subfolders.indexOf(subfolder) + 1;
        const cameraData = CameraAndFarmData.find(
          (camera) => camera.camera === cameraNumber
        );

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

    // if any result has hasDisease true, send mail
    if (results.some((result) => result.hasDisease)) {
      sendMail("nganaremba@gmail.com", "Plant Disease Alert", results);
    }

    console.log("Results:", results);
    mainWindow.webContents.send("process-complete", results);
    mainWindow.webContents.send("processingStatus", false);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    console.error("Error processing images:", error);
    dialog.showErrorBox("Error", `An error occurred: ${error.message}`);
  }
};
