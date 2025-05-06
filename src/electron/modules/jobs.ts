import cron from "node-cron";

let scheduledJobs: cron.ScheduledTask[] = [];
let isMonitoringRunning = false;

export function scheduleJob(cronExpression: string, task: () => void) {
  console.log(`Scheduling cron job: ${cronExpression}`);
  const job = cron.schedule(cronExpression, task);
  scheduledJobs.push(job);
  job.start();
}

export function cancelAllJobs() {
  console.log("Cancelling all scheduled jobs...");
  for (const job of scheduledJobs) {
    job.stop(); // Stop each running cron job
  }
  scheduledJobs = []; // Clear the array
  isMonitoringRunning = false; // Reset running flag
  console.log("All scheduled jobs cancelled.");
}
