interface WorkflowJob {
    id: number;
    name: string;
    runner_id: number;
    runner_name: string;
    check_run_url: string;
    runner_group_name: string;
}

interface WorkflowRun {
    id: number;
    name: string;
    url: string;
}

interface Organization {
    name: string;
    id: number;
}

interface RepositoryOwner {
    login: string
    type: string
}

interface Respository {
    name: string;
    full_name: string;
    owner: RepositoryOwner
    html_url: string
}

interface Sender {
    login: string;
    type: string;
}

export interface WorkflowInterface {
    action: string;
    workflow_job?: WorkflowJob | undefined;
    workflow_run?: WorkflowRun | undefined;
    organization?: Organization | undefined;
    repository: Respository;
    sender: Sender;
}

interface jobs {
    id: number,
    scope: string
    owner: string
    url: string
}

export class Workflow {
    queuedRuns: Array<jobs>;
    inProgressRuns: Array<jobs>;
    completedRuns: Array<jobs>;

    constructor() {
        this.queuedRuns = Array<jobs>()
        this.inProgressRuns = Array<jobs>()
        this.completedRuns = Array<jobs>()
    }

    /**
     * 
     * @return {Array<jobs>} array of jobs queued
     */
    getQueuedRun(): Array<jobs> {
        return this.queuedRuns
    }
    /**
     * 
     * @return {Array<jobs>} array of jobs in progress
     */
    getInProcessRun(): Array<jobs> {
        return this.inProgressRuns
    }
    /**
     * 
     * @return {Array<jobs>} array of jobs completed
     */
    getCompletedRun(): Array<jobs> {
        return this.completedRuns
    }

    /**
     * 
     * @param {number} jobId job id of the workflow job
     */
    addToQueuedRuns(jobId: number, scope: string, owner: string, repoURL: string): void {
        const job: jobs = {
            id: jobId,
            scope: scope,
            owner: owner,
            url: repoURL
        }
        this.queuedRuns.push(job)
        if (scope === "repo") {
            console.log(`${jobId} requested.`)
        } else {
            console.log(`${jobId} queued.`)
        }
    }
    /**
     * 
     * @param {number} jobId job id of the workflow job
     */
    addToInProgressRuns(jobId: number, scope: string, owner: string, repoURL: string): void {
        const job: jobs = {
            id: jobId,
            scope: scope,
            owner: owner,
            url: repoURL
        }
        this.inProgressRuns.push(job)
        this.removeFromQueuedRuns(jobId)
        console.log(`${jobId} in progress.`)
    }
    /**
     * 
     * @param {number} jobId job id of the workflow job
     */
    addToCompletedRuns(jobId: number, scope: string, owner: string, repoURL: string): void {
        const job: jobs = {
            id: jobId,
            scope: scope,
            owner: owner,
            url: repoURL
        }
        this.completedRuns.push(job)
        this.removeFromQueuedRuns(jobId)
        this.removeFromInProgressRuns(jobId)
        console.log(`${jobId} completed.`)
    }

    /**
     * 
     * @param {number} jobId job id of the workflow job
     */
    removeFromQueuedRuns(jobId: number): Array<jobs> {
        return this._removeFromNumberArray(jobId, this.queuedRuns)
    }
    /**
     * 
     * @param {number} jobId job id of the workflow job
     * @returns {Array<number>} new array
     */
    removeFromInProgressRuns(jobId: number): Array<jobs> {
        return this._removeFromNumberArray(jobId, this.inProgressRuns)
    }
    /**
     * 
     * @param {number} jobId job id of the workflow job
     * @returns {Array<number>} new array
     */
    removeFromCompletedRuns(jobId: number): Array<jobs> {
        return this._removeFromNumberArray(jobId, this.completedRuns)
    }


    /**
     * Helper function to remove an element from an array of numbers
     * @param {number} item number
     * @param {Array<jobs>} array of number
     * @returns {Array<jobs>} the new spliced array
     */
    _removeFromNumberArray(item: number, array: Array<jobs>): Array<jobs> {
        array.forEach((job, index) => {
            if (job.id === item) { // only splice array when item is found
                if (index > -1) {
                    // 2nd parameter means remove one item only
                    return array.splice(index, 1);
                }
            }
        })
        return array
    }
}
