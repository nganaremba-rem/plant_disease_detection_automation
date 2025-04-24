export const PIXEL_COLORS = {
  CAM_READY_COLOR: "2ec97c",
  LOGIN_READY_COLOR: "ffffff",
  CAM_NOT_READY_COLOR: "379bff",
  CAM_VIDEO_NOT_ON_COLOR: "2b2e32",
  CAM_VIDEO_NOT_ON_COLOR_2: "000000",
};

export const SECONDS_TO_WAIT = 20 * 1000; // 20 seconds

// Function to calculate scaled positions based on screen dimensions
function calculateScaledPosition(
  x: number,
  y: number,
  screenWidth?: number,
  screenHeight?: number,
  baseWidth = 1920,
  baseHeight = 1080
) {
  if (!screenWidth || !screenHeight) {
    throw new Error("Screen width and height are required");
  }
  // get the screen ratio
  const screenRatio = screenWidth / screenHeight;
  // get the ratio in 16/9 instead of decimal

  const baseRatio = baseWidth / baseHeight;
  if (screenRatio !== baseRatio) {
    throw new Error(
      `Screen ratio should be ${baseRatio} but is ${screenRatio}`
    );
  }

  return {
    X: Math.round((x / baseWidth) * (screenWidth ?? baseWidth)),
    Y: Math.round((y / baseHeight) * (screenHeight ?? baseHeight)),
  };
}

// For screen size 1920x1080
const SCREEN_POSITIONS = {
  LOGIN_BUTTON: {
    x: 914,
    y: 645,
  },
  CLOSE_CAPTURE_PREVIEW_BUTTON: {
    x: 660,
    y: 792,
  },
  CAM_ICON_COORDINATES: [
    {
      // CAM 1 ready coordinates
      x: 67,
      y: 134,
    },
    {
      // CAM 2 ready coordinates
      x: 67,
      y: 174,
    },
    {
      // CAM 3 ready coordinates
      x: 67,
      y: 214,
    },
    {
      // CAM 4 ready coordinates
      x: 67,
      y: 254,
    },
    {
      // CAM 5 ready coordinates
      x: 67,
      y: 294,
    },
    {
      // CAM 6 ready coordinates
      x: 67,
      y: 334,
    },
    {
      // CAM 7 ready coordinates
      x: 67,
      y: 374,
    },
    {
      // CAM 8 ready coordinates
      x: 67,
      y: 414,
    },
    {
      // CAM 9 ready coordinates
      x: 67,
      y: 454,
    },
    {
      // CAM 10 ready coordinates
      x: 67,
      y: 494,
    },
    {
      // CAM 11 ready coordinates
      x: 67,
      y: 534,
    },
    {
      // CAM 12 ready coordinates
      x: 67,
      y: 574,
    },
    {
      // CAM 13 ready coordinates
      x: 67,
      y: 614,
    },
    {
      // CAM 14 ready coordinates
      x: 67,
      y: 547,
    },
    {
      // CAM 15 ready coordinates
      x: 67,
      y: 589,
    },
    {
      // CAM 16 ready coordinates
      x: 67,
      y: 631,
    },
  ],
  CAM_TOGGLE_ON_OFF_BUTTON_COORDINATES: [
    {
      // CAM 1 toggle on off button coordinates
      x: 210,
      y: 137,
    },
    {
      // CAM 2 toggle on off button coordinates
      x: 210,
      y: 177,
    },
    {
      // CAM 3 toggle on off button coordinates
      x: 210,
      y: 217,
    },
    {
      // CAM 4 toggle on off button coordinates
      x: 210,
      y: 257,
    },
    {
      // CAM 5 toggle on off button coordinates
      x: 210,
      y: 297,
    },
    {
      // CAM 6 toggle on off button coordinates
      x: 210,
      y: 337,
    },
    {
      // CAM 7 toggle on off button coordinates
      x: 210,
      y: 377,
    },
    {
      // CAM 8 toggle on off button coordinates
      x: 210,
      y: 417,
    },
    {
      // CAM 9 toggle on off button coordinates
      x: 210,
      y: 457,
    },
    {
      // CAM 10 toggle on off button coordinates
      x: 210,
      y: 497,
    },
    {
      // CAM 11 toggle on off button coordinates
      x: 210,
      y: 537,
    },
    {
      // CAM 12 toggle on off button coordinates
      x: 210,
      y: 577,
    },
    {
      // CAM 13 toggle on off button coordinates
      x: 210,
      y: 617,
    },
    {
      // CAM 14 toggle on off button coordinates
      x: 210,
      y: 550,
    },
    {
      // CAM 15 toggle on off button coordinates
      x: 210,
      y: 590,
    },
    {
      // CAM 16 toggle on off button coordinates
      x: 210,
      y: 630,
    },
  ],
  CAM_VIDEO_BOX_COORDINATES: [
    {
      // CAM 1 video box coordinates
      x: 470,
      y: 209,
    },
    {
      // CAM 2 video box coordinates
      x: 887,
      y: 209,
    },
    {
      // CAM 3 video box coordinates
      x: 1304,
      y: 209,
    },
    {
      // CAM 4 video box coordinates
      x: 1721,
      y: 209,
    },
    {
      // CAM 5 video box coordinates
      x: 470,
      y: 432,
    },
    {
      // CAM 6 video box coordinates
      x: 887,
      y: 432,
    },
    {
      // CAM 7 video box coordinates
      x: 1304,
      y: 432,
    },
    {
      // CAM 8 video box coordinates
      x: 1721,
      y: 432,
    },
    {
      // CAM 9 video box coordinates
      x: 470,
      y: 655,
    },
    {
      // CAM 10 video box coordinates
      x: 887,
      y: 655,
    },
    {
      // CAM 11 video box coordinates
      x: 1304,
      y: 655,
    },
    {
      // CAM 12 video box coordinates
      x: 1721,
      y: 655,
    },
    {
      // CAM 13 video box coordinates
      x: 470,
      y: 878,
    },
    {
      // CAM 14 video box coordinates
      x: 887,
      y: 878,
    },
    {
      // CAM 15 video box coordinates
      x: 1304,
      y: 878,
    },
    {
      // CAM 16 video box coordinates
      x: 1721,
      y: 878,
    },
  ],
  CAPTURE_BUTTON: {
    x: 648,
    y: 1011,
  },
  CLOSE_BUTTON: {
    x: 1896,
    y: 8,
  },
  CAM_SCROLL_DOWN_BUTTON: {
    x: 238,
    y: 642,
  },
  CAM_SCROLL_UP_BUTTON: {
    x: 238,
    y: 95,
  },
};

// Coordinates with color checks that use the scaled positions
export const COORDINATES_WITH_COLORS = {
  CLOSE_CAPTURE_PREVIEW_BUTTON: (width: number, height: number) => ({
    ...calculateScaledPosition(
      SCREEN_POSITIONS.CLOSE_CAPTURE_PREVIEW_BUTTON.x,
      SCREEN_POSITIONS.CLOSE_CAPTURE_PREVIEW_BUTTON.y,
      width,
      height
    ),
    COLOR: PIXEL_COLORS.CAM_READY_COLOR,
  }),
  CAM_SCROLL_DOWN_BUTTON: (width: number, height: number) => ({
    ...calculateScaledPosition(
      SCREEN_POSITIONS.CAM_SCROLL_DOWN_BUTTON.x,
      SCREEN_POSITIONS.CAM_SCROLL_DOWN_BUTTON.y,
      width,
      height
    ),
    COLOR: PIXEL_COLORS.CAM_READY_COLOR,
  }),
  CAM_SCROLL_UP_BUTTON: (width: number, height: number) => ({
    ...calculateScaledPosition(
      SCREEN_POSITIONS.CAM_SCROLL_UP_BUTTON.x,
      SCREEN_POSITIONS.CAM_SCROLL_UP_BUTTON.y,
      width,
      height
    ),
    COLOR: PIXEL_COLORS.CAM_READY_COLOR,
  }),
  LOGIN_READY_COORDINATES: (width: number, height: number) => ({
    ...calculateScaledPosition(
      SCREEN_POSITIONS.LOGIN_BUTTON.x,
      SCREEN_POSITIONS.LOGIN_BUTTON.y,
      width,
      height
    ),
    COLOR: PIXEL_COLORS.LOGIN_READY_COLOR,
  }),
  CAPTURE_BUTTON: (width: number, height: number) => ({
    ...calculateScaledPosition(
      SCREEN_POSITIONS.CAPTURE_BUTTON.x,
      SCREEN_POSITIONS.CAPTURE_BUTTON.y,
      width,
      height
    ),
    COLOR: PIXEL_COLORS.CAM_READY_COLOR, // TODO: change to capture button color
  }),
  CLOSE_BUTTON: (width: number, height: number) => ({
    ...calculateScaledPosition(
      SCREEN_POSITIONS.CLOSE_BUTTON.x,
      SCREEN_POSITIONS.CLOSE_BUTTON.y,
      width,
      height
    ),
    COLOR: PIXEL_COLORS.CAM_READY_COLOR, // TODO: change to close button color
  }),
  CAM_TOGGLE_ON_OFF_BUTTON_COORDINATES: (width: number, height: number) => [
    ...SCREEN_POSITIONS.CAM_TOGGLE_ON_OFF_BUTTON_COORDINATES.map((coord) => ({
      ...calculateScaledPosition(coord.x, coord.y, width, height),
      COLOR: PIXEL_COLORS.CAM_READY_COLOR, // TODO: change to toggle on off button color
    })),
  ],
  CAM_READY_COORDINATES: (width: number, height: number) => [
    ...SCREEN_POSITIONS.CAM_ICON_COORDINATES.map((coord) => ({
      ...calculateScaledPosition(coord.x, coord.y, width, height),
      COLOR: PIXEL_COLORS.CAM_READY_COLOR,
    })),
  ],
  CAM_NOT_READY_COORDINATES: (width: number, height: number) => [
    ...SCREEN_POSITIONS.CAM_ICON_COORDINATES.map((coord) => ({
      ...calculateScaledPosition(coord.x, coord.y, width, height),
      COLOR: PIXEL_COLORS.CAM_NOT_READY_COLOR,
    })),
  ],
  CAM_VIDEO_NOT_ON_COORDINATES: (width: number, height: number) => [
    ...SCREEN_POSITIONS.CAM_VIDEO_BOX_COORDINATES.map((coord) => ({
      ...calculateScaledPosition(coord.x, coord.y, width, height),
      COLOR: PIXEL_COLORS.CAM_VIDEO_NOT_ON_COLOR,
    })),
  ],
  CAM_VIDEO_NOT_ON_COORDINATES_2: (width: number, height: number) => [
    ...SCREEN_POSITIONS.CAM_VIDEO_BOX_COORDINATES.map((coord) => ({
      ...calculateScaledPosition(coord.x, coord.y, width, height),
      COLOR: PIXEL_COLORS.CAM_VIDEO_NOT_ON_COLOR_2,
    })),
  ],
  CAM_VIDEO_BOX_COORDINATES: (width: number, height: number) => [
    ...SCREEN_POSITIONS.CAM_VIDEO_BOX_COORDINATES.map((coord) => ({
      ...calculateScaledPosition(coord.x, coord.y, width, height),
      COLOR: PIXEL_COLORS.CAM_VIDEO_NOT_ON_COLOR,
    })),
  ],
};

export const CameraAndFarmData = [
  {
    camera: 1,
    farmer: "S.S.ROY",
    chilliName: "RED HOT",
    chilliCode: "+0728",
    bedNumber: null,
  },
  {
    camera: 2,
    farmer: "S.S.ROY",
    chilliName: "KING HOT",
    chilliCode: "1102",
    bedNumber: 2,
  },
  {
    camera: 3,
    farmer: "Goutam Das",
    chilliName: "DHOOM",
    chilliCode: "2",
    bedNumber: null,
  },
  {
    camera: 4,
    farmer: "Goutam Das",
    chilliName: "DHOOM",
    chilliCode: "1",
    bedNumber: null,
  },
  {
    camera: 5,
    farmer: "S.S.ROY",
    chilliName: "PAVANI",
    chilliCode: "1302",
    bedNumber: 1,
  },
  {
    camera: 6,
    farmer: "S.S.ROY",
    chilliName: "PAVANI",
    chilliCode: "1302",
    bedNumber: 2,
  },
  {
    camera: 7,
    farmer: "S.S.ROY",
    chilliName: "KING HOT",
    chilliCode: "1102",
    bedNumber: 1,
  },
  {
    camera: 8,
    farmer: "S.S.ROY",
    chilliName: "RED HOT",
    chilliCode: "+0728",
    bedNumber: 2,
  },
  {
    camera: 9,
    farmer: "S.S.ROY",
    chilliName: "RED HOT",
    chilliCode: "2090",
    bedNumber: 1,
  },
  {
    camera: 10,
    farmer: "S.S.ROY",
    chilliName: "RED HOT",
    chilliCode: "2090",
    bedNumber: 2,
  },
  {
    camera: 11,
    farmer: "Goutam Das",
    chilliName: "NS2565",
    chilliCode: "2",
    bedNumber: null,
  },
  {
    camera: 12,
    farmer: "Goutam Das",
    chilliName: "NS2565",
    chilliCode: "1",
    bedNumber: null,
  },
  {
    camera: 13,
    farmer: "Goutam Das",
    chilliName: "NS2549",
    chilliCode: "2",
    bedNumber: null,
  },
  {
    camera: 14,
    farmer: "Goutam Das",
    chilliName: "NS2549",
    chilliCode: "1",
    bedNumber: null,
  },
  {
    camera: 15,
    farmer: "Goutam Das",
    chilliName: "TEJITA ",
    chilliCode: "2",
    bedNumber: null,
  },
  {
    camera: 16,
    farmer: "Goutam Das",
    chilliName: "TEJITA",
    chilliCode: "1",
    bedNumber: null,
  },
];

export const EVENTS = {
  PROCESS_COMPLETE: "processComplete",
  PROCESSING_STATUS: "processingStatus",
  START_MONITORING: "startMonitoring",
  STOPPED_MONITORING: "stoppedMonitoring",
  TIME_SCHEDULED: "timeScheduled",
  MONITORING_UPDATE: "monitoringUpdate",
  ERROR: "errorReport",
};

export const Platform = {
  windows: "win32",
  mac: "darwin",
  linux: "linux",
};
