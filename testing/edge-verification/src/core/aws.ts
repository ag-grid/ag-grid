import { execFile } from 'node:child_process';

/**
 * Read-only AWS access. Every call goes through the AWS CLI with the `ddos-report-readonly`
 * profile, and the operation name is checked against a read-only allowlist BEFORE anything is
 * executed, so this suite cannot issue a write even if a check is written wrongly.
 */
export const AWS_PROFILE = 'ddos-report-readonly';

/** get-*, list-*, describe-* and CloudTrail's lookup-events are the only verbs that can run. */
const READ_ONLY_OPERATION = /^(get|list|describe|lookup)-[a-z0-9-]+$/;

/**
 * The one exception: starting a CloudWatch Logs Insights query (logs:StartQuery), which reads log
 * events and changes nothing; its results come back through get-query-results. Allowed for the
 * `logs` service only, so no other service's start-* can slip through.
 */
const READ_ONLY_EXCEPTIONS = new Set(['logs start-query']);

/** Whether the guard lets a `service operation` run (exported for the offline tests). */
export function isReadOnlyOperation(service: string, operation: string): boolean {
    return READ_ONLY_OPERATION.test(operation) || READ_ONLY_EXCEPTIONS.has(`${service} ${operation}`);
}

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

/**
 * Why an AWS read failed. Only the first four leave a check unverifiable: the read could not be
 * made. `missing` means the read was made and the declared resource is not there, which is drift.
 */
export type AwsErrorKind = 'denied' | 'credentials' | 'throttled' | 'unavailable' | 'missing' | 'other';

/** The kinds that mean "could not look", reported as SKIP rather than FAIL. */
export const UNVERIFIABLE_KINDS: ReadonlySet<AwsErrorKind> = new Set([
    'denied',
    'credentials',
    'throttled',
    'unavailable',
]);

export class AwsError extends Error {
    constructor(
        message: string,
        readonly kind: AwsErrorKind,
        /** `service:Operation` when the call was denied by IAM. */
        readonly deniedAction?: string,
        /** The AWS error code, e.g. WAFNonexistentItemException. */
        readonly code?: string
    ) {
        super(message);
    }

    get unverifiable(): boolean {
        return UNVERIFIABLE_KINDS.has(this.kind);
    }
}

const MISSING_CODE = /^NoSuch|NotFound|^WAFNonexistentItemException$/;
const THROTTLED_CODE =
    /^(Throttling|ThrottlingException|TooManyRequestsException|RequestLimitExceeded|SlowDown|WAFLimitsExceededException)$/;
const UNAVAILABLE_CODE =
    /^(ServiceUnavailable|ServiceUnavailableException|InternalFailure|InternalError|InternalServerError|WAFInternalErrorException|RequestTimeout|RequestTimeoutException)$/;
const CREDENTIALS_TEXT =
    /Unable to locate credentials|config profile .* could not be found|SSO|ExpiredToken|InvalidClientTokenId|UnrecognizedClientException|security token included in the request is invalid|SignatureDoesNotMatch/i;
const NETWORK_TEXT =
    /Could not connect to the endpoint URL|Connect timeout|Read timeout|EndpointConnectionError|getaddrinfo|ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|Connection was closed/i;

/** Classifies the AWS CLI's stderr for a failed call (exported for the offline tests). */
export function awsErrorFromStderr(service: string, operation: string, stderr: string): AwsError {
    const denied = /not authorized to perform: ([\w-]+:\w+)/.exec(stderr);
    if (denied || /AccessDenied/i.test(stderr)) {
        const action = denied?.[1] ?? `${service}:${operation}`;
        return new AwsError(`AccessDenied: ${action}`, 'denied', action, 'AccessDenied');
    }
    const code = /An error occurred \((\w+)\)/.exec(stderr)?.[1];
    const line = `${service} ${operation}: ${errorLine(stderr)}`;
    if (code && MISSING_CODE.test(code)) {
        return new AwsError(`declared resource missing - ${line}`, 'missing', undefined, code);
    }
    if (CREDENTIALS_TEXT.test(stderr)) {
        return new AwsError(
            `No usable credentials for profile ${AWS_PROFILE}: ${errorLine(stderr)}`,
            'credentials',
            undefined,
            code ?? 'NoCredentials'
        );
    }
    if (code && THROTTLED_CODE.test(code)) {
        return new AwsError(`throttled - ${line}`, 'throttled', undefined, code);
    }
    if ((code && UNAVAILABLE_CODE.test(code)) || NETWORK_TEXT.test(stderr)) {
        return new AwsError(`AWS unavailable - ${line}`, 'unavailable', undefined, code);
    }
    return new AwsError(line, 'other', undefined, code);
}

export class Aws {
    /** IAM actions the profile was denied, for the report. */
    readonly denied = new Set<string>();
    callCount = 0;
    private readonly cache = new Map<string, Promise<any>>();
    private inFlight = 0;
    private readonly waiting: Array<() => void> = [];

    constructor(private readonly maxConcurrent = 4) {}

    /**
     * Memoised: the same call within one run is made once, unless `memo: false` (a poll that must
     * see a new answer, or a query that must not be shared).
     */
    call<T = any>(
        service: string,
        operation: string,
        args: string[] = [],
        region = 'us-east-1',
        opts: { memo?: boolean } = {}
    ): Promise<T> {
        if (!isReadOnlyOperation(service, operation)) {
            throw new Error(`Refusing non-read-only AWS operation: ${service} ${operation}`);
        }
        for (const arg of args) {
            if (FORBIDDEN_ARGS.some((f) => arg === f || arg.startsWith(f + '='))) {
                throw new Error(`Refusing AWS argument ${arg}`);
            }
        }
        if (opts.memo === false) {
            return this.exec(service, operation, args, region);
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
                    if (err && ((err as NodeJS.ErrnoException).code === 'ENOENT' || err.killed)) {
                        // No CLI, or the call timed out: nothing was read, so nothing can be concluded.
                        const why = err.killed ? 'timed out' : 'AWS CLI not found';
                        reject(new AwsError(`AWS unavailable - ${service} ${operation}: ${why}`, 'unavailable'));
                    } else if (err) {
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
        const error = awsErrorFromStderr(service, operation, stderr);
        if (error.deniedAction) {
            this.denied.add(error.deniedAction);
        }
        return error;
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
