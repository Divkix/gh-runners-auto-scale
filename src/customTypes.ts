import { Redis } from "./deps.ts"

/**
 * interface for workflow_job object received from webhook
 */
interface WorkflowJob {
    /** id for workflow job */
    id: number;
    /** name for workflow job */
    name: string;
    /** runner id for workflow job */
    runner_id: number;
    /** runner name for workflow job */
    runner_name: string;
    /** url to check runs for workflow job */
    check_run_url: string;
    /** runner group name for workflow job */
    runner_group_name: string;
}

/**
 * interface for organisation object received from webhook
 */
interface Organization {
    /** name of organisation */
    name: string;
    /** id of organisation */
    id: number;
}

/**
 * interface for repository owner object received from webhook
 */
interface RepositoryOwner {
    /** name of repository owner */
    login: string;
    /** type of repository owner, can be organisation or repo */
    type: string;
}

/**
 * interface for repository object received from webhook
 */
interface Respository {
    /** name of repo */
    name: string;
    /** name of repo in format: user/repo */
    full_name: string;
    /** repository object of reposioty */
    owner: RepositoryOwner;
    /** url of repository */
    html_url: string;
}

/**
 * interface for sender object received from webhook
 */
interface Sender {
    /** username for sender of workflow_job */
    login: string;
    /** type of sender of workflow_job */
    type: string;
}

/**
 * interface combining all the interfaces received from webhook
 */
export interface WorkflowInterface {
    /** type of action: queued, in_progress or completed */
    action: string;
    /** workflow_job object */
    workflow_job: WorkflowJob;
    /** organisation object */
    organization: Organization | undefined;
    /** repository object */
    repository: Respository;
    /** sender object */
    sender: Sender;
}
/**
 * interface for jobs object to be used in queues
 */
export interface jobsInterface {
    /** id of job */
    id: number;
    /** url of job */
    url: string;
}

/**
 * class for manageing queues for jobs
 * @class jobsArray
 */
class jobsArray {
    /** redis client */
    redis: Redis;
    /** name of queue */
    queueName: string;

    constructor(redis: Redis, queueName: string) {
        this.queueName = queueName;
        this.redis = redis;
    }

    /**
     * get queued jobs
     * @return {Array<jobsInterface>} array of jobs queued
     */
    list(): Array<jobsInterface> {
        let jobsList: Array<jobsInterface> = [];
        this.redis.lrange(this.queueName, 0, -1).then((jobs) => {
            jobsList = jobs.map((job) => JSON.parse(job));
        });
        return jobsList;
    }

    /**
     * push job to queue
     * @param {number} jobId of job
     */
    push(job: jobsInterface): void {
        this.redis.rpush(this.queueName, JSON.stringify(job));
    }

    /**
     * remove job from queue
     * @param {number} jobId of job
     */
    remove(jobId: number) {
        this.redis.lrem(this.queueName, 0, JSON.stringify({ id: jobId }));
    }

    /**
     * clear job queue
     */
    clearQueue() {
        this.redis.del(this.queueName);
    }
}

/**
 * class for manageing workflows
 * @class Workflow
 */
export class Workflow {
    /** list for queued runs */
    queuedRuns: jobsArray;
    /** list for in_progress runs */
    inProgressRuns: jobsArray;
    /** list for completed runs */
    completedRuns: jobsArray;
    /** list jobs running locally
     *
     * run by the program
     */
    localRunning: jobsArray;

    /**
     * constructor for workflow class
     */
    constructor(redisClient: Redis) {
        // create empty arrays for jobs
        /** list for queued runs */
        this.queuedRuns = new jobsArray(redisClient, "queuedRuns");
        /** list for in_progress runs */
        this.inProgressRuns = new jobsArray(redisClient, "inProgressRuns");
        /** list for completed runs */
        this.completedRuns = new jobsArray(redisClient, "completedRuns");
        /** list jobs running locally */
        this.localRunning = new jobsArray(redisClient, "localRunning");
    }

    /**
     * get queued jobs
     * @return {Array<jobsInterface>} array of jobs queued
     */
    getQueuedRun(): Array<jobsInterface> {
        return this.queuedRuns.list();
    }
    /**
     * add a job to the queued jobs array
     * @param {jobsInterface} job the workflow job
     */
    queueRun(job: jobsInterface): void {
        this.queuedRuns.push(job);
        console.log(`${job.id} queued.`);
    }
    /**
     * remove a job from the queued jobs array
     * @param {number} jobId job id of the workflow job
     */
    removeFromQueuedRuns(jobId: number) {
        this.queuedRuns.remove(jobId);
    }
    /**
     * clear the queued jobs array
     */
    clearQueuedRuns(): void {
        this.queuedRuns.clearQueue();
    }

    /**
     * get in_progress jobs
     * @return {Array<jobsInterface>} array of jobs in progress
     */
    getInProcessRun(): Array<jobsInterface> {
        return this.inProgressRuns.list();
    }
    /**
     * add a job to the in_progress jobs array
     * and remove from queued jobs array
     * @param {jobsInterface} job the workflow job
     */
    processRun(job: jobsInterface): void {
        this.inProgressRuns.push(job);
        this.removeFromQueuedRuns(job.id);
        console.log(`${job.id} in progress.`);
    }
    /**
     * remove a job from the in_progress jobs array
     * @param {number} jobId job id of the workflow job
     * @returns {Array<number>} new array
     */
    removeFromInProgressRuns(jobId: number) {
        this.inProgressRuns.remove(jobId);
    }
    /**
     * clear the queued jobs array
     */
    clearInProgressRuns(): void {
        this.inProgressRuns.clearQueue();
    }

    /**
     * get completed jobs
     * @return {Array<jobsInterface>} array of jobs completed
     */
    getCompletedRun(): Array<jobsInterface> {
        return this.completedRuns.list();
    }
    /**
     * add a job to the completed jobs array
     * and remove from in_progress, queued jobs array
     * @param {jobsInterface} job the workflow job
     */
    completeRun(job: jobsInterface): void {
        this.completedRuns.push(job);
        this.removeFromQueuedRuns(job.id);
        this.removeFromInProgressRuns(job.id);
        console.log(`${job.id} completed.`);
    }
    /**
     * remove a job from the completed jobs array
     * @param {number} jobId job id of the workflow job
     * @returns {Array<number>} new array
     */
    removeFromCompletedRuns(jobId: number) {
        this.completedRuns.remove(jobId);
    }
    /**
     * clear the queued jobs array
     */
    clearCompletedRuns(): void {
        this.completedRuns.clearQueue();
    }

    /**
     * get local running jobs
     * @returns {Array<jobsInterface>} array of jobs running locally
     */
    getLocalRunning(): Array<jobsInterface> {
        return this.localRunning.list();
    }
    /**
     * add a job to the local running jobs array
     * @param {jobsInterface} job job to be added to local running array
     */
    runLocally(job: jobsInterface): void {
        this.localRunning.push(job);
        console.log(`${job.id} running locally.`);
    }
    /**
     * remove a job from the local running jobs array
     * @param {number} jobId job id of the workflow job
     * @returns {Array<number>} new array after removing job
     */
    removeFromLocalRunning(jobId: number) {
        this.localRunning.remove(jobId);
    }
    /**
     * clear the local running jobs array
     */
    clearLocalRunning(): void {
        this.localRunning.clearQueue();
    }

    /**
     * clear all runs
     */
    clearAllRuns(): void {
        this.clearQueuedRuns();
        this.clearInProgressRuns();
        this.clearCompletedRuns();
    }
    /**
     * clear all runs
     */
    clearAll(): void {
        this.clearAllRuns();
        this.clearLocalRunning();
    }
}
