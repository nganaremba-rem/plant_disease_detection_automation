import { useEffect, useState } from "react";

const TrueCloudDownloadLink =
  "https://drive.google.com/uc?export=download&id=1LHhC-otEfGktUM7fWEq7goPgLTKS8q6e";

// Components
const Header = () => (
  <div className='text-center mb-12'>
    <h1 className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-3'>
      Plant Disease Detection
    </h1>
    <p className='text-gray-400 text-base max-w-xl mx-auto'>
      Advanced AI-powered system for real-time monitoring and detection of plant
      diseases
    </p>
  </div>
);

const MonitoringButton = ({
  isMonitoring,
  onClick,
}: {
  isMonitoring: boolean;
  onClick: () => void;
}) =>
  !isMonitoring ? (
    <button
      onClick={onClick}
      type='button'
      className='group px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg 
      shadow-md hover:shadow-green-500/20 transition-all duration-200 hover:-translate-y-0.5'
    >
      <div className='flex items-center gap-2'>
        <span className='font-medium'>Start Monitoring</span>
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 group-hover:animate-pulse'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      </div>
    </button>
  ) : (
    <div className='animate-pulse flex items-center gap-2 px-6 py-3 bg-green-500/10 rounded-lg'>
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-6 w-6 text-green-400'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
        />
      </svg>
      <span className='text-green-400 font-medium'>Monitoring...</span>
      <button
        type='button'
        onClick={() => window.electron.stopMonitoring()}
        className='text-red-400 hover:text-red-300 transition-colors duration-200'
      >
        Stop Monitoring
      </button>
    </div>
  );

const ProcessingIndicator = () => (
  <div className='flex justify-center py-6'>
    <div className='bg-gray-800/40 backdrop-blur-sm rounded-lg border border-green-500/20 px-6 py-3 shadow-lg'>
      <div className='flex items-center gap-3'>
        <div className='w-6 h-6 border-3 border-green-400/20 border-t-green-400 rounded-full animate-spin' />
        <div className='flex flex-col'>
          <span className='text-green-400 font-medium'>Processing Images</span>
          <span className='text-gray-400 text-sm'>Please wait...</span>
        </div>
      </div>
    </div>
  </div>
);

const ResultCard = ({ result }: { result: ResultsForUI }) => {
  return (
    <div className='bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5'>
      <div className='p-5'>
        {/* Camera Info */}
        {"camera" in result && (
          <div className='bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-400/20 rounded-lg px-6 py-4 mb-6 shadow-lg hover:shadow-blue-500/10 transition-all duration-300'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-500/20 rounded-lg'>
                  {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                  <svg
                    className='w-5 h-5 text-blue-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                </div>
                <div>
                  <span className='text-blue-400 font-bold text-lg'>
                    Camera {result.camera}
                  </span>
                </div>
              </div>
            </div>
            {result.cameraData && (
              <div className='bg-blue-500/5 rounded-lg p-3 space-y-2'>
                <div className='flex items-center gap-2 text-blue-300'>
                  👨‍🌾
                  <p className='font-medium'>{result.cameraData.farmer}</p>
                </div>
                <div className='flex items-center gap-2 text-blue-300'>
                  🌶️
                  <p className='font-medium'>
                    {result.cameraData.chilliName}
                    <span className='text-blue-400/60 ml-1'>
                      ({result.cameraData.chilliCode})
                    </span>
                  </p>
                  {result.cameraData.bedNumber && (
                    <span className='text-blue-400/60 ml-1'>
                      #{result.cameraData.bedNumber}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Display */}
        {"image" in result && (
          <div className='relative group rounded-lg overflow-hidden h-56 mb-4'>
            <img
              className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-102'
              src={result.image || "https://placehold.co/600x400?text=No+Image"}
              alt='Plant Analysis'
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/600x400?text=Image+Load+Error";
              }}
            />
          </div>
        )}

        {/* Analysis Results */}
        {result.message ? (
          <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
            <p className='text-red-400 font-medium flex items-center gap-2'>
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                />
              </svg>
              {result.message}
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='p-3 bg-gray-800/30 rounded-lg'>
              <p
                className={`font-medium flex items-center gap-2 ${
                  result.hasDisease ? "text-red-400" : "text-green-400"
                }`}
              >
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  />
                </svg>
                {result.hasDisease ? "Disease Detected" : "Healthy Plant"}
              </p>
            </div>

            {result.hasDisease &&
              "diseaseTypes" in result &&
              result.diseaseTypes &&
              result.diseaseTypes.length > 0 && (
                <div className='p-3 bg-gray-800/30 rounded-lg'>
                  <h4 className='text-gray-300 font-medium mb-2'>
                    Detected Diseases
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {result.diseaseTypes.map((type) => (
                      <span
                        key={type.label}
                        className='px-2 py-1 capitalize bg-red-500/20 text-red-400 rounded-md text-sm'
                      >
                        {type.label} ({(type.score * 100).toFixed(2)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {"classification_results" in result &&
              result.classification_results &&
              result.classification_results.length > 0 && (
                <div>
                  <button
                    type='button'
                    onClick={(e) => {
                      const detailsEl = e.currentTarget.nextElementSibling;
                      detailsEl?.classList.toggle("hidden");
                      e.currentTarget
                        .querySelector("svg")
                        ?.classList.toggle("rotate-180");
                    }}
                    className='w-full p-3 mb-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2'
                  >
                    <span className='font-medium'>View Detailed Analysis</span>
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg
                      className='w-4 h-4 transition-transform duration-200'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </button>

                  <div className='hidden p-4 bg-gray-800/40 backdrop-blur-sm rounded-lg animate-fadeIn shadow-xl'>
                    <h4 className='text-gray-200 font-semibold mb-3 flex items-center gap-2'>
                      <span>Classification Results</span>
                      <span className='text-xs px-3 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 rounded-full font-medium'>
                        {result.classification_results.length} Results
                      </span>
                    </h4>
                    <div className='space-y-2.5'>
                      {result.classification_results.map((result) => (
                        <div
                          key={result.label}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02] cursor-default ${
                            result.isDiseaseDetected
                              ? result.confidence > 70
                                ? "bg-red-900/40 hover:bg-red-900/50"
                                : result.confidence > 40
                                ? "bg-orange-900/40 hover:bg-orange-900/50"
                                : "bg-yellow-900/40 hover:bg-yellow-900/50"
                              : "bg-green-900/40 hover:bg-green-900/50"
                          }`}
                        >
                          <span
                            className={`font-medium ${
                              result.isDiseaseDetected
                                ? result.confidence > 70
                                  ? "text-red-300"
                                  : result.confidence > 40
                                  ? "text-orange-300"
                                  : "text-yellow-300"
                                : "text-green-300"
                            }`}
                          >
                            {result.label.toUpperCase()}
                          </span>
                          <span
                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                              result.isDiseaseDetected
                                ? result.confidence > 70
                                  ? "bg-red-500/20 text-red-400"
                                  : result.confidence > 40
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {result.confidence.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

const formatCronTime = (cronExpression: string) => {
  const [minute, hour] = cronExpression.split(" ");
  const formattedHour = hour.padStart(2, "0");
  const period = Number(hour) >= 12 ? "PM" : "AM";
  return `${formattedHour}:${minute.padStart(2, "0")}${period}`;
};

const convertDateTimeToCron = (dateTime: string) => {
  const [hours, minutes] = dateTime.split(":");
  return `${minutes} ${hours} * * *`;
};

// TimeSchedule component
const TimeSchedule = ({ times }: { times: string[] }) => {
  return (
    <div className='flex flex-col items-center gap-4 mb-8'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-green-400 mb-2'>
          Monitoring Started!
        </h2>

        <p className='text-gray-300 text-lg mb-4'>
          Scheduled monitoring will occur at the following times:
        </p>
      </div>

      <div className='flex flex-wrap justify-center gap-4'>
        {times.map((time) => (
          <div
            key={time}
            className='px-6 py-3 bg-gray-800/50 rounded-lg text-gray-300 
              border border-gray-700 shadow-lg hover:bg-gray-700/50 
              transition-all duration-200 flex items-center gap-2'
          >
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              className='w-5 h-5 text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span className='text-lg'>{formatCronTime(time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ErrorMessage = ({ error }: { error: string }) => {
  return (
    <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3 w-full max-w-2xl mx-auto'>
      <p className='text-red-400 font-medium flex items-center gap-2 flex-wrap break-words'>
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          className='w-4 h-4 flex-shrink-0'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z'
          />
        </svg>
        <span className='text-red-400 break-all'>{error}</span>
      </p>
    </div>
  );
};
// Main App Component
export default function App() {
  const [results, setResults] = useState<ResultsForUI[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeScheduled, setTimeScheduled] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scheduledTimes, setScheduledTimes] = useState<
    {
      id: number;
      time: string;
      isActive: boolean;
    }[]
  >([]);

  console.log(scheduledTimes);

  const handleStartMonitoring = () => {
    const cronTimes = scheduledTimes
      .filter((time) => time.isActive)
      .map((time) => convertDateTimeToCron(time.time));
    console.log(cronTimes);
    window.electron.startMonitoring(cronTimes);
    setIsMonitoring(true);
  };

  useEffect(() => {
    window.electron.processComplete((data) => {
      setResults(data);
      setIsProcessing(false);
    });
    window.electron.processingStatus(setIsProcessing);
    window.electron.timeScheduled(setTimeScheduled);
    window.electron.stoppedMonitoring(() => setIsMonitoring(false));
    window.electron.errorReport((error) => {
      setErrorMessage(error);
    });
  }, []);

  if (errorMessage) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'>
        <div className='container mx-auto px-4 py-8'>
          <Header />

          {errorMessage && <ErrorMessage error={errorMessage} />}
          <div className='mb-4 p-3 bg-yellow-900/30 rounded border border-yellow-600/50'>
            <h2 className='text-lg font-medium text-yellow-400'>
              Requirements:
            </h2>
            <ul className='mt-1 space-y-1 text-sm text-yellow-100'>
              <li>
                • TrueCloud v1.7.6.7 installed at D:\Users\TVWall\TRUECLOUD (
                <button
                  type='button'
                  onClick={() =>
                    window.electron.openExternal(TrueCloudDownloadLink)
                  }
                  className='text-yellow-400 hover:text-yellow-300 underline cursor-pointer'
                >
                  Download
                </button>
                )
              </li>
              <li>
                • Must have logged in once in TrueCloud with "Save user and
                password" checked (do not check "Auto login")
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <Header />

        <div className='mb-4 p-3 bg-yellow-900/30 rounded border border-yellow-600/50'>
          <h2 className='text-lg font-medium text-yellow-400'>Requirements:</h2>
          <ul className='mt-1 space-y-1 text-sm text-yellow-100'>
            <li>
              • Must have logged in once in TrueCloud with "Save user and
              password" checked (do not check "Auto login")
            </li>
          </ul>
        </div>

        <div className='mb-8'>
          <div className='bg-gray-800/50 rounded-lg p-6 border border-gray-700'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-gray-100'>
                Scheduled Times
              </h2>
              <button
                type='button'
                onClick={() => {
                  const newTime = {
                    id: Date.now(),
                    time: "09:00",
                    isActive: true,
                  };
                  setScheduledTimes((prev) => [...prev, newTime]);
                }}
                className='px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors duration-200'
              >
                Add Time
              </button>
            </div>

            <div className='space-y-3'>
              {scheduledTimes.map((schedule) => (
                <div
                  key={schedule.id}
                  className='flex items-center justify-between bg-gray-700/30 rounded-lg p-4 border border-gray-600/50'
                >
                  <div className='flex items-center gap-4'>
                    <input
                      type='time'
                      value={schedule.time}
                      onChange={(e) => {
                        setScheduledTimes((prev) =>
                          prev.map((t) =>
                            t.id === schedule.id
                              ? { ...t, time: e.target.value }
                              : t
                          )
                        );
                      }}
                      className='bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500'
                    />

                    <label className='flex items-center cursor-pointer'>
                      <div className='relative'>
                        <input
                          type='checkbox'
                          className='sr-only'
                          checked={schedule.isActive}
                          onChange={() => {
                            setScheduledTimes((prev) =>
                              prev.map((t) =>
                                t.id === schedule.id
                                  ? { ...t, isActive: !t.isActive }
                                  : t
                              )
                            );
                          }}
                        />
                        <div
                          className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                            schedule.isActive ? "bg-green-600" : "bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute w-4 h-4 rounded-full transition-transform duration-200 transform bg-white top-1 left-1 ${
                              schedule.isActive
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                      <span className='ml-3 text-sm font-medium text-gray-300'>
                        {schedule.isActive ? "Active" : "Inactive"}
                      </span>
                    </label>
                  </div>

                  <button
                    type='button'
                    onClick={() => {
                      setScheduledTimes((prev) =>
                        prev.filter((t) => t.id !== schedule.id)
                      );
                    }}
                    className='text-red-400 hover:text-red-300 transition-colors duration-200'
                  >
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='flex justify-center mb-12'>
          <MonitoringButton
            isMonitoring={isMonitoring}
            onClick={handleStartMonitoring}
          />
        </div>

        {timeScheduled.length > 0 && <TimeSchedule times={timeScheduled} />}

        {isProcessing && <ProcessingIndicator />}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {results.map((result) => (
            <ResultCard key={result.folder} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
}
