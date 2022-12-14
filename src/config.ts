import { dotEnvConfigFunc } from './deps.ts';

interface configFormat {
    runAsRoot: boolean;
    accessToken: string;
    labels: string;
    runnerNamePrefix: string;
    githubHost: string;
    maxConcurrentJobs: number;
    redisUsername: string;
    redisPassword: string;
    redisHost: string;
    redisPort: number;
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
    maxConcurrentJobs: number;
    redisUsername: string;
    redisPassword: string;
    redisHost: string;
    redisPort: number;

    constructor() {
        const dotEnvConfig = dotEnvConfigFunc();
        this.runAsRoot = Deno.env.get('RUN_AS_ROOT') !== '' ||
            dotEnvConfig.RUN_AS_ROOT !== '' || true;
        this.accessToken = Deno.env.get('ACCESS_TOKEN') ||
            dotEnvConfig.ACCESS_TOKEN;
        this.labels = Deno.env.get('LABELS') || dotEnvConfig.LABELS ||
            'gh-runners-auto-scale';
        this.runnerNamePrefix = Deno.env.get('RUNNER_NAME_PREFIX') ||
            dotEnvConfig.RUNNER_NAME_PREFIX || 'gh-runners-auto-scale';
        this.githubHost = Deno.env.get('GITHUB_HOST') ||
            dotEnvConfig.GITHUB_HOST ||
            'https://api.github.com';
        this.maxConcurrentJobs = Number(Deno.env.get('MAX_CONCURRENT_JOBS')) ||
            Number(dotEnvConfig.MAX_CONCURRENT_JOBS) || -1;
        this.redisUsername = Deno.env.get('REDIS_USERNAME') ||
            dotEnvConfig.REDIS_USERNAME || '';
        this.redisPassword = Deno.env.get('REDIS_PASSWORD') ||
            dotEnvConfig.REDIS_PASSWORD || '';
        this.redisHost = Deno.env.get('REDIS_HOST') ||
            dotEnvConfig.REDIS_HOST || "localhost";
        this.redisPort = Number(Deno.env.get('REDIS_PORT')) ||
            Number(dotEnvConfig.REDIS_PORT) || 6379;
        this.checkConfig();
    }

    /**
     * Checks if the config is valid or not.
     * if not, throws an error.
     */
    checkConfig(): void {
        if (this.accessToken === undefined) {
            throw new Error(
                'access token not set, this needs to be set to make this script work!',
            );
        }
        return;
    }
}
