import { execFile } from 'node:child_process';

/**
 * Read-only AWS access. Every call goes through the AWS CLI with the `ddos-report-readonly`
 * profile, and the operation name is checked against a read-only allowlist BEFORE anything is
 * executed, so this suite cannot issue a write even if a check is written wrongly.
 */
export const AWS_PROFILE = 'ddos-report-readonly';

/** get-*, list-*, describe-* and CloudTrail's lookup-events are the only verbs that can run. */
const READ_ONLY_OPERATION = /^(get|list|describe|lookup)-[a-z0-9-]+$/;

/** Arguments that could redirect the call to other credentials or endpoints. */
const FORBIDDEN_ARGS = ['--profile', '--endpoint-url', '--no-sign-request'];

/** Credential env vars are stripped so `--profile` is the only source of credentials. */
const STRIPPED_ENV = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SESSION_TOKEN',
    'AWS_PROFILE',
    'AWS_DEFAULT_PROFILE',
];

/**
 * Read actions the profile is known to lack, and what each would let the suite verify. A check
 * that needs one degrades to "unverifiable" rather than failing; the report prints this note for
 * every denied action it actually met.
 */
export const KNOWN_IAM_GAPS: Record<string, string> = {
    'cloudfront:DescribeFunction': 'the stage and runtime of the archive-markdown-cache-key function',
    'cloudfront:GetFunction':
        'the code of the archive-markdown-cache-key function (that it keys on Accept: text/markdown)',
    'cloudfront:ListFunctions': 'that the archive-markdown-cache-key function exists',
};

export class AwsError extends Error {
    constructor(
        message: string,
        /** `service:Operation` when the call was denied by IAM. */
        readonly deniedAction?: string,
        /** The AWS error code, e.g. WAFNonexistentItemException. */
        readonly code?: string
    ) {
        super(message);
    }
}

export class Aws {
    /** IAM actions the profile was denied, for the report. */
    readonly denied = new Set<string>();
    callCount = 0;
    private readonly cache = new Map<string, Promise<any>>();
    private inFlight = 0;
    private readonly waiting: Array<() => void> = [];

    constructor(private readonly maxConcurrent = 4) {}

    /** Memoised: the same call within one run is made once. */
    call<T = any>(service: string, operation: string, args: string[] = [], region = 'us-east-1'): Promise<T> {
        if (!READ_ONLY_OPERATION.test(operation)) {
            throw new Error(`Refusing non-read-only AWS operation: ${service} ${operation}`);
        }
        for (const arg of args) {
            if (FORBIDDEN_ARGS.some((f) => arg === f || arg.startsWith(f + '='))) {
                throw new Error(`Refusing AWS argument ${arg}`);
            }
        }
        const key = JSON.stringify([service, operation, args, region]);
        let promise = this.cache.get(key);
        if (!promise) {
            promise = this.exec(service, operation, args, region);
            this.cache.set(key, promise);
        }
        return promise;
    }

    private async exec(service: string, operation: string, args: string[], region: string): Promise<any> {
        await this.acquire();
        try {
            this.callCount++;
            const env: NodeJS.ProcessEnv = { ...process.env, AWS_PAGER: '' };
            for (const name of STRIPPED_ENV) {
                delete env[name];
            }
            const argv = [
                service,
                operation,
                ...args,
                '--region',
                region,
                '--profile',
                AWS_PROFILE,
                '--output',
                'json',
                '--no-cli-pager',
            ];
            const stdout = await new Promise<string>((resolve, reject) => {
                execFile('aws', argv, { env, timeout: 90_000, maxBuffer: 64 * 1024 * 1024 }, (err, out, stderr) => {
                    if (err) {
                        reject(this.toError(service, operation, String(stderr || err.message)));
                    } else {
                        resolve(out);
                    }
                });
            });
            return stdout.trim() ? JSON.parse(stdout) : {};
        } finally {
            this.release();
        }
    }

    private toError(service: string, operation: string, stderr: string): AwsError {
        const denied = /not authorized to perform: ([\w-]+:\w+)/.exec(stderr);
        if (denied || /AccessDenied/i.test(stderr)) {
            const action = denied?.[1] ?? `${service}:${operation}`;
            this.denied.add(action);
            return new AwsError(`AccessDenied: ${action}`, action, 'AccessDenied');
        }
        if (/Unable to locate credentials|config profile .* could not be found|SSO|ExpiredToken/i.test(stderr)) {
            return new AwsError(
                `No usable credentials for profile ${AWS_PROFILE}: ${errorLine(stderr)}`,
                undefined,
                'NoCredentials'
            );
        }
        const code = /An error occurred \((\w+)\)/.exec(stderr)?.[1];
        return new AwsError(`${service} ${operation}: ${errorLine(stderr)}`, undefined, code);
    }

    private async acquire(): Promise<void> {
        if (this.inFlight < this.maxConcurrent) {
            this.inFlight++;
            return;
        }
        // release() hands its slot straight to the next waiter, so inFlight never overshoots.
        await new Promise<void>((resolve) => this.waiting.push(resolve));
    }

    private release(): void {
        const next = this.waiting.shift();
        if (next) {
            next();
        } else {
            this.inFlight--;
        }
    }
}

/** The CLI prints the error itself on the last line of stderr (after any warnings). */
function errorLine(text: string): string {
    return text.trim().split('\n').filter(Boolean).pop() ?? text;
}
