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
  login: string
  /** type of repository owner, can be organisation or repo */
  type: string
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
  owner: RepositoryOwner
  /** url of repository */
  html_url: string
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
  id: number,
  /** url of job */
  url: string
}

/**
 * class for manageing workflows
 * @class Workflow
 */
export class Workflow {
  /** list for queued runs */
  queuedRuns: Array<jobsInterface>;
  /** list for in_progress runs */
  inProgressRuns: Array<jobsInterface>;
  /** list for completed runs */
  completedRuns: Array<jobsInterface>;

  /**
   * constructor for workflow class
   */
  constructor() {
    // create empty arrays for queued, in_progress and completed runs
    this.queuedRuns = Array<jobsInterface>()
    this.inProgressRuns = Array<jobsInterface>()
    this.completedRuns = Array<jobsInterface>()
  }

  /**
   * get queued jobs
   * @return {Array<jobsInterface>} array of jobs queued
   */
  getQueuedRun(): Array<jobsInterface> {
    return this.queuedRuns
  }
  /**
   * get in_progress jobs
   * @return {Array<jobsInterface>} array of jobs in progress
   */
  getInProcessRun(): Array<jobsInterface> {
    return this.inProgressRuns
  }
  /**
   * get completed jobs
   * @return {Array<jobsInterface>} array of jobs completed
   */
  getCompletedRun(): Array<jobsInterface> {
    return this.completedRuns
  }

  /**
   * add a job to the queued jobs array
   * @param {jobsInterface} job the workflow job
   */
  queueRun(job: jobsInterface): void {
    this.queuedRuns.push(job)
    console.log(`${job.id} queued.`)
  }
  /**
   * add a job to the in_progress jobs array
   * and remove from queued jobs array
   * @param {jobsInterface} job the workflow job
   */
  processRun(job: jobsInterface): void {
    this.inProgressRuns.push(job)
    this.removeFromQueuedRuns(job.id)
    console.log(`${job.id} in progress.`)
  }
  /**
   * add a job to the completed jobs array
   * and remove from in_progress, queued jobs array
   * @param {jobsInterface} job the workflow job
   */
  completeRun(job: jobsInterface): void {
    this.completedRuns.push(job)
    this.removeFromQueuedRuns(job.id)
    this.removeFromInProgressRuns(job.id)
    console.log(`${job.id} completed.`)
  }

  /**
   * remove a job from the queued jobs array
   * @param {number} jobId job id of the workflow job
   */
  removeFromQueuedRuns(jobId: number): Array<jobsInterface> {
    return this._removeFromNumberArray(jobId, this.queuedRuns)
  }
  /**
   * remove a job from the in_progress jobs array
   * @param {number} jobId job id of the workflow job
   * @returns {Array<number>} new array
   */
  removeFromInProgressRuns(jobId: number): Array<jobsInterface> {
    return this._removeFromNumberArray(jobId, this.inProgressRuns)
  }
  /**
   * remove a job from the completed jobs array
   * @param {number} jobId job id of the workflow job
   * @returns {Array<number>} new array
   */
  removeFromCompletedRuns(jobId: number): Array<jobsInterface> {
    return this._removeFromNumberArray(jobId, this.completedRuns)
  }


  /**
   * Helper function to remove an element from an array of numbers
   * @param {number} item number
   * @param {Array<jobsInterface>} array of number
   * @returns {Array<jobsInterface>} the new spliced array
   */
  _removeFromNumberArray(item: number, array: Array<jobsInterface>): Array<jobsInterface> {
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
