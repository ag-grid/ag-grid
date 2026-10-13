// Send a row's request(s) to the local Apache and evaluate its assertions.
import http from 'node:http';

const agent = new http.Agent({ keepAlive: true, maxSockets: 16 });

/** Hosts the harness serves (so their redirects are followed locally rather than to production). */
export const isHarnessHost = (host, extraHosts) =>
    /(^|\.)ag-grid\.com$/i.test(host) || /^(www\.)?angulargrid\.com$/i.test(host) || extraHosts.includes(host);

/** The listener a request goes to: the https stand-in, or the plain-http one. */
const portFor = (scheme, ctx) => (scheme === 'http' ? ctx.httpPort : ctx.port);

/** Every response the run received, for the run-wide checks (the browser-cache cap). */
export const responses = [];

export function request({ port, host, path, accept, requestHeaders = {} }) {
    return new Promise((resolvePromise, reject) => {
        const headers = { ...requestHeaders, Host: host, 'User-Agent': 'ag-htaccess-harness' };
        if (accept != null) {
            headers.Accept = accept;
        }
        const req = http.request({ host: '127.0.0.1', port, path, method: 'GET', headers, agent }, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                const response = {
                    status: res.statusCode,
                    // rawHeaders keeps duplicates (two CSP headers must count as two)
                    raw: res.rawHeaders,
                    body: Buffer.concat(chunks).toString('utf8').slice(0, 2000),
                };
                responses.push({ request: `${port} ${host}${path}`, response });
                resolvePromise(response);
            });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => req.destroy(new Error(`timeout ${host}${path}`)));
        req.end();
    });
}

export const headerValues = (res, name) => {
    const out = [];
    for (let i = 0; i < res.raw.length; i += 2) {
        if (res.raw[i].toLowerCase() === name.toLowerCase()) {
            out.push(res.raw[i + 1]);
        }
    }
    return out;
};
const header = (res, name) => {
    const v = headerValues(res, name);
    return v.length ? v.join(', ') : null;
};

/**
 * Normalise a Location: one on the harness server itself becomes host-relative ("/x"), since its
 * scheme/host there is only the harness's ServerName; anything else is returned verbatim.
 */
export function normaliseLocation(loc, port) {
    if (!loc) {
        return '';
    }
    const m = loc.match(/^https?:\/\/([^/]+)(\/.*)?$/i);
    // the plain-http listener's ServerName is localhost:80, which a Location spells without the port
    const harness = (h) =>
        h === 'localhost' || h === `localhost:${port}` || h === `127.0.0.1:${port}` || h.endsWith(`:${port}`);
    if (m && harness(m[1])) {
        return m[2] ?? '/';
    }
    return loc;
}

/** Follow a redirect chain from the first response. Returns { hops, finalStatus, finalUrl }. */
async function follow(first, row, ctx) {
    let res = first;
    let host = row.host;
    let scheme = row.scheme;
    let hops = 0;
    let url = `${scheme}://${host}${row.path}`;
    const seen = new Set([url]);
    while (res.status >= 300 && res.status < 400) {
        hops++;
        const loc = normaliseLocation(header(res, 'location'), ctx.port);
        let path;
        if (loc.startsWith('/')) {
            path = loc;
        } else {
            const u = new URL(loc);
            if (!isHarnessHost(u.hostname, ctx.extraHosts)) {
                return { hops, finalStatus: null, finalUrl: loc.split('#')[0] };
            }
            host = u.hostname;
            scheme = u.protocol.slice(0, -1);
            path = u.pathname + u.search;
        }
        path = path.split('#')[0];
        url = `${scheme}://${host}${path}`;
        if (seen.has(url) || hops > 10) {
            return { hops, finalStatus: 'LOOP', finalUrl: url };
        }
        seen.add(url);
        res = await request({ port: portFor(scheme, ctx), host, path, accept: row.accept });
    }
    return { hops, finalStatus: res.status, finalUrl: url };
}

const matchValue = (actual, op, value) => {
    if (op === '=') {
        return value === 'absent' ? actual == null : actual === value;
    }
    if (op === '~') {
        return actual != null && new RegExp(value).test(actual);
    }
    return false;
};

const HEADER_KEYS = { cc: 'Cache-Control', ct: 'Content-Type', xrt: 'X-Robots-Tag' };

// A conditional repeat of the row's request, carrying a validator from the first response, as a
// browser or CloudFront revalidates its stored copy.
const REVALIDATORS = {
    revalidate: { from: 'etag', send: 'If-None-Match' },
    'revalidate-lm': { from: 'last-modified', send: 'If-Modified-Since' },
};

/** Run one row; returns its failures as `{ key, message }` (none = pass). */
export async function runRow(row, ctx) {
    const mapHost = (s) => (ctx.siteHost === 'www.ag-grid.com' ? s : s.replaceAll('www.ag-grid.com', ctx.siteHost));
    const res = await request({
        port: portFor(row.scheme, ctx),
        host: row.host,
        path: row.path,
        accept: row.accept,
        requestHeaders: row.requestHeaders,
    });
    // Each failure names the assertion that made it, so a known-fail row can expect exactly those.
    const fails = [];
    const fail = (key, message) => fails.push({ key, message });
    const loc = normaliseLocation(header(res, 'location'), ctx.port);
    if (res.status !== row.status) {
        fail('status', `status ${res.status} (want ${row.status})`);
    }
    const wantLoc = mapHost(row.location);
    let formOnly = false;
    if (loc !== wantLoc) {
        fail('location', `location '${loc}' (want '${wantLoc}')`);
        // same page, only spelled host-relative instead of absolute (or vice versa) on the canonical
        // host: worth separating from a behavioural difference in the report
        const origin = `https://${ctx.siteHost}`;
        formOnly = row.host === ctx.siteHost && loc.replace(origin, '') === wantLoc.replace(origin, '');
    }
    let chain;
    for (const { key, op, value } of row.checks) {
        const v = mapHost(value);
        if (key in HEADER_KEYS || key.startsWith('h:')) {
            const name = HEADER_KEYS[key] ?? key.slice(2);
            const actual = header(res, name);
            if (!matchValue(actual, op, v)) {
                fail(key, `${name} '${actual ?? '(absent)'}' (want ${op}${v})`);
            }
        } else if (key === 'vary') {
            const tokens = (header(res, 'vary') ?? '').split(',').map((t) => t.trim().toLowerCase());
            const has = tokens.includes(v.toLowerCase());
            if ((op === '+') !== has) {
                fail(key, `Vary '${header(res, 'vary') ?? '(absent)'}' (want ${op}${v})`);
            }
        } else if (key === 'link') {
            const link = header(res, 'link') ?? '';
            const has = new RegExp(`rel="?${v}"?`).test(link);
            if ((op === '+') !== has) {
                fail(key, `Link '${link || '(absent)'}' (want ${op}${v})`);
            }
        } else if (key === 'csp') {
            const n = headerValues(res, 'content-security-policy').length;
            if (n !== Number(v)) {
                fail(key, `Content-Security-Policy count ${n} (want ${v})`);
            }
        } else if (key === 'sec') {
            for (const name of ['Referrer-Policy', 'Permissions-Policy']) {
                const n = headerValues(res, name).length;
                if ((op === '+') !== n > 0) {
                    fail(key, `${name} ${n ? 'present' : 'absent'} (want ${op})`);
                }
            }
        } else if (key === 'body') {
            if (!new RegExp(v).test(res.body)) {
                fail(key, `body '${res.body.slice(0, 60).replace(/\s+/g, ' ')}' (want ~${v})`);
            }
        } else if (key in REVALIDATORS) {
            const { from, send } = REVALIDATORS[key];
            const validator = header(res, from);
            if (validator == null) {
                fail(key, `${key}: first response has no ${from}`);
                continue;
            }
            const again = await request({
                port: portFor(row.scheme, ctx),
                host: row.host,
                path: row.path,
                accept: row.accept,
                requestHeaders: { ...row.requestHeaders, [send]: validator },
            });
            if (String(again.status) !== v) {
                fail(key, `${key} with ${send}: ${validator} -> ${again.status} (want ${v})`);
            }
        } else if (key === 'hops' || key === 'final' || key === 'final-url') {
            chain ??= await follow(res, row, ctx);
            // a host-relative chain keeps the request's own Host, which is www.ag-grid.com for www
            // rows in every env, so the final URL is compared in the env's host spelling
            const actual =
                key === 'hops'
                    ? String(chain.hops)
                    : key === 'final'
                      ? String(chain.finalStatus)
                      : mapHost(chain.finalUrl);
            if (actual !== v) {
                fail(key, `${key} ${actual} (want ${v})`);
            }
        } else {
            fail('unknown', `unknown assertion '${key}'`);
        }
    }
    return { fails, formOnly: formOnly && fails.length === 1, status: res.status, location: loc, chain };
}
