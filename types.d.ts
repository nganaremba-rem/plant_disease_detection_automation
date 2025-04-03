interface VideoData {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
}

interface Window {
  versions: {
    node: () => string;
    chrome: () => string;
  };
  electron: {
    startMonitoring: () => void;
    stoppedMonitoring: (callback: () => void) => void;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    processComplete: (callback: (results: any) => void) => void;
    processingStatus: (callback: (status: boolean) => void) => void;
  };
}

interface ClassificationResults {
  classification_results: {
    label: string;
    score: number;
  }[];
}

type ResultsForUI = {
  folder: string;
  message?: string;
  hasDisease?: boolean;
  diseaseTypes?: ClassificationResults["classification_results"];

  camera?: number;
  cameraData?:
    | {
        farmer: string;
        chilliName: string;
        chilliCode: string;
        bedNumber: number | null;
      }
    | undefined;
  image?: string;
  classification_results?: {
    isDiseaseDetected: boolean;
    label: string;
    confidence: number;
  }[];
};
