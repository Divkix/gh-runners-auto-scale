import { WorkflowInterface, Workflow } from './customTypes.ts'
import { configFormat } from './config.ts'


// deno-lint-ignore no-explicit-any
function parseWorkflow(jsonData: any): WorkflowInterface {
    const workflow: WorkflowInterface = {
        action: jsonData.action,
        workflow_job: jsonData.workflow_job,
        workflow_run: jsonData.workflow_run,
        organization: jsonData.organization,
        repository: jsonData.repository,
        sender: jsonData.sender
    }
    return workflow
}

// deno-lint-ignore no-explicit-any
function manageJobs(jsonData: any, runs: Workflow): Response {
    const workflow = parseWorkflow(jsonData)
    const scope: string = workflow.repository.owner.type === "Organization" ? "org" : "repo"
    const orgName: string = scope === "org" ? workflow.repository.owner.login : ""
    const id: number | undefined = scope === "repo" ? workflow.workflow_run?.id : workflow.workflow_job?.id
    const repoURL: string = scope === "repo" ? workflow.repository.html_url : ""
    switch (workflow.action) {
        // TODO: get all jobs from a workflow_run to run multiple runners at once
        case 'requested':
        case 'queued':
            runs.addToQueuedRuns(<number>id, scope, orgName, repoURL)
            break;
        case 'in_progress':
            runs.addToInProgressRuns(<number>id, scope, orgName, repoURL)
            break
        case 'completed':
            runs.addToCompletedRuns(<number>id, scope, orgName, repoURL)
            break
        default:
            break
    }
    return new Response(null, { status: 200 })
}

function runPendingJobs(runs: Workflow, config: configFormat): void {
    console.log('running pending jobs...')
    const cmd = runDockerRunCmd();
    const pendingJobs = runs.getQueuedRun();

    if (pendingJobs.length == 0) return console.log('No pending jobs.');

    pendingJobs.forEach((job) => {
        Deno.run({
            cmd,
            env: {
                "RUNNER_NAME_PREFIX": config.runnerNamePrefix,
                "ACCESS_TOKEN": config.accessToken,
                "RUNNER_SCOPE": job.scope,
                "ORG_NAME": job.owner,
                "LABELS": config.labels,
                "REPO_URL": job.scope === "repo" ? job.url : "",
                "ENTERPRISE_NAME": config.enterpreiseName === undefined ? "" : config.enterpreiseName,
                "RUNNER_WORKDIR": config.workDir === undefined ? "" : config.workDir,
                "GITHUB_HOST": config.githubHost,
                "RUN_AS_ROOT": config.runAsRoot ? "1" : "0"
            },
            // stderr: "null",
            // stdout: "null",
        })
        console.log(`started container for job ${job.id}.`)
        if (job.scope === "repo") runs.removeFromQueuedRuns(job.id)
    })
}

function runDockerRunCmd(): Array<string> {
    return ['./create-container.sh'];
}

export { manageJobs, runPendingJobs }
