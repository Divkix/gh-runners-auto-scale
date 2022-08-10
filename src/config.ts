import { config as dotEnvConfigFunc } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
export interface configFormat {
    runAsRoot: boolean
    accessToken: string;
    runnerScope: string;
    enterpreiseName: string;
    labels: string;
    repoUrl: string;
    workDir: string;
    runnerNamePrefix: string;
    githubHost: string;
}

/**
 * Loads the config from the .env file.
 * @returns The config object.
 */
export class Config {
    /**
     * 
     * @returns {configFormat} the config object
     */
    loadConfig(): configFormat {
        return Config.loadEnvFileOrEnvVar()
    }

    /**
     * Checks if the config is valid or not
     * @param config the config object
     */
    static checkConfig(config: configFormat): void {
        if (config.accessToken === undefined) {
            throw new Error("access token not set, this needs to be set to make this script work!")
        }
        return
    }

    /**
     * 
     * @returns {configFormat} the config object
     */
    static loadEnvFileOrEnvVar(): configFormat {
        const dotEnvConfig = dotEnvConfigFunc();
        const env = Config.loadEnvVars()

        const newEnv: configFormat = {
            runAsRoot: env.runAsRoot || dotEnvConfig.RUN_AS_ROOT !== "" || true,
            accessToken: env.accessToken || dotEnvConfig.ACCESS_TOKEN,
            runnerScope: env.runnerScope || dotEnvConfig.RUNNER_SCOPE,
            enterpreiseName: env.enterpreiseName || dotEnvConfig.ENTERPREISE_NAME,
            labels: env.labels || dotEnvConfig.LABELS,
            repoUrl: env.repoUrl || dotEnvConfig.REPO_URL,
            workDir: env.workDir || dotEnvConfig.WORK_DIR,
            runnerNamePrefix: env.runnerNamePrefix || dotEnvConfig.RUNNER_NAME_PREFIX || "runner-auto-scale",
            githubHost: env.githubHost || dotEnvConfig.GITHUB_HOST || 'https://api.github.com'
        }
        Config.checkConfig(newEnv)
        return newEnv;
    }

    /**
     * 
     * @returns {configFormat}
     */
    static loadEnvVars(): configFormat {
        const envVars: configFormat = {
            runAsRoot: Deno.env.get('RUN_AS_ROOT') !== "",
            accessToken: <string>Deno.env.get('ACCESS_TOKEN'),
            runnerScope: <string>Deno.env.get('RUNNER_SCOPE'),
            enterpreiseName: <string>Deno.env.get('ENTERPREISE_NAME'),
            labels: <string>Deno.env.get('LABELS'),
            repoUrl: <string>Deno.env.get('REPO_URL'),
            workDir: <string>Deno.env.get('WORK_DIR'),
            runnerNamePrefix: <string>Deno.env.get('RUNNER_NAME_PREFIX'),
            githubHost: <string>Deno.env.get('GITHUB_HOST')
        }
        return envVars
    }
}