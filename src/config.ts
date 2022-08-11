import { config as dotEnvConfigFunc } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
interface configFormat {
  runAsRoot: boolean;
  accessToken: string;
  labels: string;
  runnerNamePrefix: string;
  githubHost: string;
}

/**
 * Loads the config from the .env file.
 * @returns The config object.
 */
export class Config implements configFormat {
  runAsRoot: boolean;
  accessToken: string;
  labels: string;
  runnerNamePrefix: string;
  githubHost: string;

  constructor() {
    const dotEnvConfig = dotEnvConfigFunc();
    this.runAsRoot = Deno.env.get("RUN_AS_ROOT") !== "" ||
      dotEnvConfig.RUN_AS_ROOT !== "" || true;
    this.accessToken = Deno.env.get("ACCESS_TOKEN") ||
      dotEnvConfig.ACCESS_TOKEN;
    this.labels = Deno.env.get("LABELS") || dotEnvConfig.LABELS ||
      "runner-auto-scale";
    this.runnerNamePrefix = Deno.env.get("RUNNER_NAME_PREFIX") ||
      dotEnvConfig.RUNNER_NAME_PREFIX || "runner-auto-scale";
    this.githubHost = Deno.env.get("GITHUB_HOST") || dotEnvConfig.GITHUB_HOST ||
      "https://api.github.com";
    this.checkConfig();
  }

  /**
   * Checks if the config is valid or not.
   * if not, throws an error.
   */
  checkConfig(): void {
    if (this.accessToken === undefined) {
      throw new Error(
        "access token not set, this needs to be set to make this script work!",
      );
    }
    return;
  }
}
