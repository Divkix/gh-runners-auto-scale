import { Workflow } from './customTypes.ts';
import { Config } from './config.ts';
import { manageJobs, runPendingJobs } from './helpers.ts';
import { serve, Context, Hono, cron, connect } from './deps.ts';

// create a new hono instance
const app = new Hono();
// load the config
const config = new Config();
// create a new redis client instance
const redis = await connect({
    username: config.redisUsername,
    password: config.redisPassword,
    hostname: config.redisHost,
    port: config.redisPort,
});
// create a new workflow instance
const runs = new Workflow(redis);

// listen for post requests
app.post('/', async (c: Context) => {
    // fetch the json data from request
    const jsonData = await c.req.json();
    // parse the json data so that program can manage jobs
    return await manageJobs(jsonData, runs);
});

// start the server on port 8000
serve(app.fetch, { port: 8000 });

// runs every minute
cron('* * * * *', () => {
    console.log('checking for pending jobs...');
    // run the pending jobs in orkflow instance
    runPendingJobs(runs, config);
});

// runs every hour
cron('0 * * * *', () => {
    console.log('cleaning unused jobs and containers...');
    // clear completedRuns every hour
    runs.clearCompletedRuns();
});
