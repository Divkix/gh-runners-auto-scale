import { serve } from "https://deno.land/std@0.151.0/http/server.ts";
import { Context, Hono } from "https://deno.land/x/hono@v2.0.7/mod.ts";
import { Workflow } from "./customTypes.ts";
import { Config } from "./config.ts";
import { manageJobs, runPendingJobs } from "./helpers.ts";
import { cron } from "https://deno.land/x/deno_cron@v1.0.0/cron.ts";

// create a new hono instance
const app = new Hono();
// create a new workflow instance
const runs = new Workflow();
// load the config
const config = new Config();

// listen for post requests
app.post("/", async (c: Context) => {
  // fetch the json data from request
  const jsonData = await c.req.json();
  // parse the json data so that program can manage jobs
  return await manageJobs(jsonData, runs);
});

// start the server on port 8000
serve(app.fetch, { port: 8000 });

// runs every minute
cron("* * * * *", () => {
  console.log("checking for pending jobs...");
  // run the pending jobs in orkflow instance
  runPendingJobs(runs, config);
});

// runs every hour
cron("0 * * * *", () => {
  console.log("cleaning unused jobs and containers...");
  // clear completedRuns every hour
  runs.clearCompletedRuns();
})
