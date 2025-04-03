export const PIXEL_COLORS = {
  CAM_READY_COLOR: "2ec97c",
  LOGIN_READY_COLOR: "ffffff",
  CAM_NOT_READY_COLOR: "379bff",
  CAM_VIDEO_NOT_ON_COLOR: "2b2e32",
};

export const SCREEN_POSITIONS = {
  LOGIN_BUTTON: {
    X: 633,
    Y: 485,
  },
  CAM_1: {
    X: 209,
    Y: 135,
  },
  CAM_2: {
    X: 210,
    Y: 177,
  },
  CAM_1_VIDEO_BOX: {
    X: 402,
    Y: 167,
  },
  CAPTURE_BUTTON: {
    X: 646,
    Y: 700,
  },
  CAM_2_VIDEO_BOX: {
    X: 669,
    Y: 170,
  },
  CLOSE_BUTTON: {
    X: 1332,
    Y: 11,
  },
};

export const COORDINATES = {
  LOGIN_READY_COORDINATES: {
    X: 637,
    Y: 487,
    COLOR: PIXEL_COLORS.LOGIN_READY_COLOR,
  },
  CAM_1_READY_COORDINATES: {
    X: 69,
    Y: 135,
    COLOR: PIXEL_COLORS.CAM_READY_COLOR,
  },
  CAM_2_READY_COORDINATES: {
    X: 69,
    Y: 174,
    COLOR: PIXEL_COLORS.CAM_READY_COLOR,
  },

  CAM_1_NOT_READY_COORDINATES: {
    X: 69,
    Y: 135,
    COLOR: PIXEL_COLORS.CAM_NOT_READY_COLOR,
  },

  CAM_1_VIDEO_NOT_ON_COORDINATES: {
    X: SCREEN_POSITIONS.CAM_1_VIDEO_BOX.X,
    Y: SCREEN_POSITIONS.CAM_1_VIDEO_BOX.Y,
    COLOR: PIXEL_COLORS.CAM_VIDEO_NOT_ON_COLOR,
  },

  CAM_2_VIDEO_NOT_ON_COORDINATES: {
    X: SCREEN_POSITIONS.CAM_2_VIDEO_BOX.X,
    Y: SCREEN_POSITIONS.CAM_2_VIDEO_BOX.Y,
    COLOR: PIXEL_COLORS.CAM_VIDEO_NOT_ON_COLOR,
  },
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
    chilliName: "KING HOT",
    chilliCode: "1102",
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
