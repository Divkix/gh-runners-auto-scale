interface WorkflowJob {
    id: number;
    name: string;
    runner_id: number;
    runner_name: string;
    check_run_url: string;
    runner_group_name: string;
}

interface Organization {
    name: string;
    id: number;
}

interface Respository {
    name: string;
    full_name: string;
}

interface Sender {
    login: string;
    type: string;
}

export interface Workflow {
    action: string;
    workflow_job: WorkflowJob;
    organization: Organization;
    repository: Respository;
    sender: Sender;
}


export class WorkflowRun {
    queuedRuns: Array<number>;
    inProgressRuns: Array<number>;
    completedRuns: Array<number>;

    constructor() {
        this.queuedRuns = Array<number>()
        this.inProgressRuns = Array<number>()
        this.completedRuns = Array<number>()
    }

    /**
     * 
     * @return {Array<number>} array of jobs queued
     */
    getQueuedRun(): Array<number> {
        return this.queuedRuns
    }
    /**
     * 
     * @return {Array<number>} array of jobs in progress
     */
    getInProcessRun(): Array<number> {
        return this.inProgressRuns
    }
    /**
     * 
     * @return {Array<number>} array of jobs completed
     */
    getCompletedRun(): Array<number> {
        return this.completedRuns
    }

    /**
     * 
     * @param {number} jobId job id of the workflow job
     */
    addToQueuedRuns(jobId: number): void {
        this.queuedRuns.push(jobId)
        console.log(`${jobId} queued.`)
    }
    /**
     * 
     * @param {number} jobId job id of the workflow job
     */
    addToInProgressRuns(jobId: number): void {
        this.inProgressRuns.push(jobId)
        this.removeFromQueuedRuns(jobId)
        console.log(`${jobId} in progress.`)
    }
    /**
     * 
     * @param {number} jobId job id of the workflow job
     */
    addToCompletedRuns(jobId: number): void {
        this.completedRuns.push(jobId)
        this.removeFromCompletedRuns(jobId)
        console.log(`${jobId} completed.`)
    }

    /**
     * 
     * @param {number} jobId job id of the workflow job
     */
    removeFromQueuedRuns(jobId: number): Array<number> {
        return this._removeFromNumberArray(jobId, this.queuedRuns)
    }
    /**
     * 
     * @param {number} jobId job id of the workflow job
     * @returns {Array<number>} new array
     */
    removeFromInProgressRuns(jobId: number): Array<number> {
        return this._removeFromNumberArray(jobId, this.inProgressRuns)
    }
    /**
     * 
     * @param {number} jobId job id of the workflow job
     * @returns {Array<number>} new array
     */
    removeFromCompletedRuns(jobId: number): Array<number> {
        return this._removeFromNumberArray(jobId, this.completedRuns)
    }


    /**
     * Helper function to remove an element from an array of numbers
     * @param {number} item number
     * @param {Array<number>} array of number
     * @returns {Array<number>} the new spliced array
     */
    _removeFromNumberArray(item: number, array: Array<number>): Array<number> {
        const index = array.indexOf(item);
        // only splice array when item is found
        if (index > -1) {
            // 2nd parameter means remove one item only
            return array.splice(index, 1);
        }
        return array
    }
}
