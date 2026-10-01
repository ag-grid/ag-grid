import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';

/**
 * The only way the suite talks to production. It enforces, for every request:
 * - GET or HEAD only;
 * - a global request budget (the run stops issuing requests past it);
 * - at most `concurrency` requests in flight and at least `delayMs` between request starts;
 * - the markdown guard: a request carrying `Accept: text/markdown` is refused unless the guard
 *   says the path cannot be served from (or stored into) a CloudFront cache entry shared with HTML.
 *
 * Responses are memoised by method, URL and headers, so checks that need the same page share one
 * fetch. A HEAD that does not need to be fresh is answered from a GET of the same URL when there
 * is one, and a HEAD of a document (anything but a static asset) is sent as a GET in the first
 * place, so the redirect, link and page checks that touch the same URL share one request. Checks
 * that must observe the cache (x-cache, Age) ask for `fresh` requests, which are never shared.
 *
 * Built on node:https rather than fetch so duplicate response headers stay visible (fetch joins
 * them, which would hide a doubled Content-Security-Policy).
 */
export const BROWSER_UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';
export const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
export const MARKDOWN_ACCEPT = 'text/markdown';

export interface Request {
    method?: 'GET' | 'HEAD';
    url: string;
    /** Merged over the browser defaults (User-Agent, Accept, Accept-Encoding). */
    headers?: Record<string, string>;
    /** Bypass the memo: always a new network request. */
    fresh?: boolean;
}

export interface Response {
    url: string;
    method: 'GET' | 'HEAD';
    status: number;
    /** Lower-cased header name -> every value, in order, duplicates kept. */
    headers: Map<string, string[]>;
    body: string;
    ms: number;
}

export type MarkdownGuard = (url: URL) => { allowed: boolean; reason: string };

export class BudgetExceeded extends Error {}
export class RefusedProbe extends Error {}

const MAX_BODY_BYTES = 8 * 1024 * 1024;

/** Static assets keep real HEAD requests: their bodies are large and no check reads them. */
const ASSET_PATH = /\.(png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|woff2?|ttf|otf|eot|css|js|mjs|map|zip|gz|pdf)$/i;

export class Http {
    requestCount = 0;
    refusedProbes: string[] = [];
    readonly log: string[] = [];
    private readonly memo = new Map<string, Promise<Response>>();
    private inFlight = 0;
    private readonly waiting: Array<() => void> = [];
    private nextStart = 0;
    private guard: MarkdownGuard = () => ({ allowed: false, reason: 'markdown guard not initialised' });
    private readonly agents = {
        http: new http.Agent({ keepAlive: true, maxSockets: 4 }),
        https: new https.Agent({ keepAlive: true, maxSockets: 4 }),
    };

    constructor(
        private readonly opts: {
            maxRequests: number;
            concurrency: number;
            delayMs: number;
            userAgent: string;
            verbose: boolean;
        }
    ) {}

    setMarkdownGuard(guard: MarkdownGuard): void {
        this.guard = guard;
    }

    get budgetLeft(): number {
        return this.opts.maxRequests - this.requestCount;
    }

    request(req: Request): Promise<Response> {
        let method = req.method ?? 'GET';
        if (method !== 'GET' && method !== 'HEAD') {
            throw new Error(`Refusing ${method}: GET and HEAD only`);
        }
        const headers: Record<string, string> = {
            'user-agent': this.opts.userAgent,
            accept: BROWSER_ACCEPT,
            'accept-encoding': 'gzip, br',
            'accept-language': 'en-GB,en;q=0.9',
        };
        for (const [k, v] of Object.entries(req.headers ?? {})) {
            headers[k.toLowerCase()] = v;
        }
        const url = new URL(req.url);
        if (/text\/markdown/i.test(headers.accept ?? '')) {
            const verdict = this.guard(url);
            if (!verdict.allowed) {
                this.refusedProbes.push(`${url.href}: ${verdict.reason}`);
                return Promise.reject(
                    new RefusedProbe(`markdown probe refused for ${url.pathname}: ${verdict.reason}`)
                );
            }
        }
        const keyFor = (m: string): string => JSON.stringify([m, url.href, headers]);
        if (!req.fresh) {
            const shared =
                this.memo.get(keyFor(method)) ?? (method === 'HEAD' ? this.memo.get(keyFor('GET')) : undefined);
            if (shared) {
                return shared;
            }
            if (method === 'HEAD' && !ASSET_PATH.test(url.pathname)) {
                method = 'GET';
            }
        }
        const promise = this.send(method, url, headers);
        this.memo.set(keyFor(method), promise);
        return promise;
    }

    get(url: string, headers?: Record<string, string>): Promise<Response> {
        return this.request({ url, headers });
    }

    head(url: string, headers?: Record<string, string>): Promise<Response> {
        return this.request({ method: 'HEAD', url, headers });
    }

    /**
     * Follows redirects (each hop through `request`, so memoised and budgeted) and returns every
     * response in order. Stops at the first non-3xx, after following `maxHops` redirects (so at
     * most maxHops + 1 responses, the last possibly another 3xx), or on a loop.
     */
    async follow(
        url: string,
        opts: { method?: 'GET' | 'HEAD'; headers?: Record<string, string>; maxHops?: number } = {}
    ): Promise<Response[]> {
        const chain: Response[] = [];
        const seen = new Set<string>();
        let current = url;
        for (let hop = 0; hop <= (opts.maxHops ?? 6); hop++) {
            const res = await this.request({ method: opts.method ?? 'HEAD', url: current, headers: opts.headers });
            chain.push(res);
            const location = header(res, 'location');
            if (res.status < 300 || res.status >= 400 || !location) {
                break;
            }
            const next = new URL(location, current).href;
            if (seen.has(next)) {
                break;
            }
            seen.add(next);
            current = next;
        }
        return chain;
    }

    private async send(method: 'GET' | 'HEAD', url: URL, headers: Record<string, string>): Promise<Response> {
        if (this.requestCount >= this.opts.maxRequests) {
            throw new BudgetExceeded(`request budget of ${this.opts.maxRequests} reached`);
        }
        this.requestCount++;
        await this.acquire();
        try {
            const started = Date.now();
            const res = await this.raw(method, url, headers);
            res.ms = Date.now() - started;
            const line = `${method} ${url.href} -> ${res.status}${header(res, 'location') ? ' ' + header(res, 'location') : ''}`;
            this.log.push(line);
            if (this.opts.verbose) {
                console.log(`    [http] ${line}`);
            }
            return res;
        } finally {
            this.release();
        }
    }

    private raw(method: 'GET' | 'HEAD', url: URL, headers: Record<string, string>): Promise<Response> {
        const isHttps = url.protocol === 'https:';
        const lib = isHttps ? https : http;
        return new Promise((resolve, reject) => {
            const req = lib.request(
                url,
                { method, headers, agent: isHttps ? this.agents.https : this.agents.http, timeout: 30_000 },
                (res) => {
                    const map = new Map<string, string[]>();
                    for (let i = 0; i < res.rawHeaders.length; i += 2) {
                        const name = res.rawHeaders[i].toLowerCase();
                        const list = map.get(name) ?? [];
                        list.push(res.rawHeaders[i + 1]);
                        map.set(name, list);
                    }
                    const chunks: Buffer[] = [];
                    let size = 0;
                    res.on('data', (chunk: Buffer) => {
                        size += chunk.length;
                        if (size <= MAX_BODY_BYTES) {
                            chunks.push(chunk);
                        }
                    });
                    res.on('end', () => {
                        let buf = Buffer.concat(chunks);
                        const encoding = (map.get('content-encoding')?.[0] ?? '').toLowerCase();
                        try {
                            if (encoding === 'gzip') {
                                buf = zlib.gunzipSync(buf);
                            } else if (encoding === 'br') {
                                buf = zlib.brotliDecompressSync(buf);
                            } else if (encoding === 'deflate') {
                                buf = zlib.inflateSync(buf);
                            }
                        } catch {
                            // A truncated body (over MAX_BODY_BYTES) cannot be decompressed; keep it empty.
                            buf = Buffer.alloc(0);
                        }
                        resolve({
                            url: url.href,
                            method,
                            status: res.statusCode ?? 0,
                            headers: map,
                            body: buf.toString('utf8'),
                            ms: 0,
                        });
                    });
                    res.on('error', reject);
                }
            );
            req.on('timeout', () => req.destroy(new Error(`timeout after 30s: ${method} ${url.href}`)));
            req.on('error', reject);
            req.end();
        });
    }

    private async acquire(): Promise<void> {
        while (this.inFlight >= this.opts.concurrency) {
            await new Promise<void>((resolve) => this.waiting.push(resolve));
        }
        this.inFlight++;
        const now = Date.now();
        const wait = Math.max(0, this.nextStart - now);
        this.nextStart = Math.max(now, this.nextStart) + this.opts.delayMs;
        if (wait) {
            await new Promise((resolve) => setTimeout(resolve, wait));
        }
    }

    private release(): void {
        this.inFlight--;
        this.waiting.shift()?.();
    }

    close(): void {
        this.agents.http.destroy();
        this.agents.https.destroy();
    }
}

/** First value of a header, or undefined. */
export function header(res: Response, name: string): string | undefined {
    return res.headers.get(name.toLowerCase())?.[0];
}

/** Every value of a header (duplicates kept). */
export function headerAll(res: Response, name: string): string[] {
    return res.headers.get(name.toLowerCase()) ?? [];
}

/** Comma-joined tokens across every copy of a list-valued header such as Vary, lower-cased. */
export function headerTokens(res: Response, name: string): string[] {
    return headerAll(res, name)
        .flatMap((v) => v.split(','))
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
}

export function describeChain(chain: Response[]): string {
    return chain.map((r) => `${r.status} ${r.url}`).join(' -> ');
}
