import { Config } from "./config.ts";
import { jobsInterface, Workflow, WorkflowInterface } from "./customTypes.ts";

/**
 * function to parse the workflow received from webhook
 * @param {any} jsonData the json data from the webhook
 * @returns {WorkflowInterface} the workflow object
 */
// deno-lint-ignore no-explicit-any
function parseWorkflow(jsonData: any): WorkflowInterface {
  const workflow: WorkflowInterface = {
    action: jsonData.action,
    workflow_job: jsonData.workflow_job,
    organization: jsonData.organization,
    repository: jsonData.repository,
    sender: jsonData.sender,
  };
  return workflow;
}

/**
 * function to manage jobs
 * @param {any} jsonData the json data from the webhook
 * @param {Workflow} runs the workflow instance
 * @returns {Response} the response object
 */
// deno-lint-ignore no-explicit-any
function manageJobs(jsonData: any, runs: Workflow): Response {
  // parse the json data to workflow object
  const workflow = parseWorkflow(jsonData);
  // check the scope of the job, if it a organisation webhook or repository webhook
  // create a new jobs object to be added to the queue
  const job: jobsInterface = {
    id: <number>workflow.workflow_job?.id,
    url: workflow.repository.html_url,
  };
  // perform actions based on the action received
  switch (workflow.action) {
    // if action is requested, show a warning message to remove workflow run form webhook
    case "requested":
      // requested is only given when workflow_run is sent to the webhook
      console.error(
        "Please ONLY check the scope of the workflow job in webhook and not worflow run!",
      );
      break;
    // if action is queued, add the job to the queue
    case "queued":
      runs.queueRun(job);
      break;
    // if action is in_progress, remove the job from the queue
    case "in_progress":
      runs.processRun(job);
      break;
    // if action is completed, remove the job from the queue
    case "completed":
      runs.completeRun(job);
      runs.removeFromLocalRunning(job.id);
      break;
    // if no case is matched, end the program with error message
    default:
      break;
  }
  // return the response object with 201 status code
  return new Response(null, { status: 201 });
}

/**
 * function to run the pending jobs in the workflow instance
 * @param {Workflow} runs the workflow instance
 * @param {configFormat} config the config object
 */
function runPendingJobs(runs: Workflow, config: Config): void {
  console.log("running pending jobs...");

  // get pending jobs from the queue
  const pendingJobs = runs.getQueuedRun();
  const localRunningJobs = runs.getLocalRunning();

  // if maxConcurrentJobs is set to -1, run all pending jobs and skip the queue
  // if max jobs are running, return
  if ((config.maxConcurrentJobs !== -1) && (localRunningJobs.length >= config.maxConcurrentJobs)) return console.log("Maximum jobs running, will try again later")

  // if there are no pending jobs, return
  if (pendingJobs.length == 0) return console.log("No pending jobs.");

  // iterate over each job in the queue
  // using splice beacuse we want to run limited jobs at a time, as defined by MAX_CONCURRENT_JOBS
  // by default: MAX_CONCURRENT_JOBS = -1, which means no limit
  pendingJobs.slice(0, config.maxConcurrentJobs).forEach((job) => {
    // run the command
    Deno.run({
      // command to run
      cmd: ["./create-container.sh"],
      // env vars for the command to be run
      env: {
        "RUNNER_NAME_PREFIX": config.runnerNamePrefix,
        "ACCESS_TOKEN": config.accessToken,
        "LABELS": config.labels,
        "REPO_URL": job.url,
        "GITHUB_HOST": config.githubHost,
        "RUN_AS_ROOT": config.runAsRoot ? "1" : "0",
      },
      // set stderr and stdout output to null
      stderr: "null",
      stdout: "null",
    });
    runs.runLocally(job);
    console.log(`started container for job ${job.id}.`);
  });
}

export { manageJobs, runPendingJobs };
