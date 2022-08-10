import { Workflow, WorkflowRun } from './customTypes.ts'
import { configFormat } from './config.ts'


// deno-lint-ignore no-explicit-any
function parseWorkflow(jsonData: any): Workflow {
    const workflow: Workflow = {
        action: jsonData.action,
        workflow_job: jsonData.workflow_job,
        organization: jsonData.organization,
        repository: jsonData.repository,
        sender: jsonData.sender
    }
    return workflow
}

// deno-lint-ignore no-explicit-any
function manageJobs(jsonData: any, runs: WorkflowRun): void {
    const workflow = parseWorkflow(jsonData)
    switch (workflow.action) {
        case 'queued':
            runs.addToQueuedRuns(workflow.workflow_job.id)
            break;
        case 'in_progress':
            runs.addToInProgressRuns(workflow.workflow_job.id)
            break
        case 'completed':
            runs.addToCompletedRuns(workflow.workflow_job.id)
            break
        default:
            break
    }

}

function runPendingJobs(runs: WorkflowRun, config: configFormat): void {
    console.log('running pending jobs...')
    const cmd = runDockerRunCmd();
    const pendingJobs = runs.getQueuedRun();

    if (pendingJobs.length == 0) return console.log('No pending jobs.');

    console.log("running pending jobs...");
    pendingJobs.forEach((job) => {
        Deno.run({
            cmd,
            env: {
                "RUNNER_NAME_PREFIX": config.runnerNamePrefix,
                "ACCESS_TOKEN": config.accessToken,
                "RUNNER_SCOPE": config.runnerScope,
                "ORG_NAME": config.orgName,
                "LABELS": config.labels,
            },
            stderr: "null",
            stdout: "null",
        })
        console.debug(cmd)
        console.log(`started container for job ${job}.`)
    })
}

function runDockerRunCmd(): Array<string> {
    return ['./create-container.sh'];
}

export { manageJobs, runPendingJobs }
