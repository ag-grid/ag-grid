import { type Http, MARKDOWN_ACCEPT, type Response, header } from '../core/http';
import { type CheckDef, Problems, fail, pass, skip } from '../core/types';
import { ARCHIVE_POISON_PROBE, CACHE_PROBES, type CacheProbe, NEVER_CACHED, POISON_PROBES } from '../expected/caching';
import { MARKDOWN_KEY_FUNCTION } from '../expected/edge';
import { PENDING } from '../expected/lifecycle';
import { WWW } from '../expected/redirects';

const HIT = /^(Hit|RefreshHit) from cloudfront$/i;
const xCache = (r: Response): string => header(r, 'x-cache') ?? '(none)';
const contentType = (r: Response): string => (header(r, 'content-type') ?? '').split(';')[0].trim();

async function resolveProbe(http: Http, probe: CacheProbe): Promise<string | undefined> {
    if (probe.path) {
        return probe.path;
    }
    if (!probe.discover) {
        return undefined;
    }
    const page = await http.get(`${WWW}${probe.discover.page}`);
    return probe.discover.match.exec(page.body)?.[0];
}

export function cachingChecks(): CheckDef[] {
    return [
        ...CACHE_PROBES.map((probe): CheckDef => ({
            id: `caching.hit.${probe.pattern}`,
            area: 'caching',
            title: `Behaviour ${probe.pattern} caches: a repeat request is a CloudFront hit`,
            refs: ['waf-finding.md §8', '2026-09-18 Twitter storm'],
            pending: probe.pending,
            async run({ http, live }) {
                const path = await resolveProbe(http, probe);
                if (!path) {
                    return fail(`no probe URL found on ${probe.discover?.page}`);
                }
                await live.prepareGuard();
                const { behaviour } = live.behaviourFor(path);
                if (behaviour.pattern !== probe.pattern) {
                    return fail(`${path} is served by ${behaviour.pattern}, not ${probe.pattern}`);
                }
                const url = `${WWW}${path}`;
                // The first request only has to warm the cache, so it may be one another check
                // already made; the second must be new to show what the cache does now.
                const first = await http.request({ method: 'HEAD', url });
                const second = await http.request({ method: 'HEAD', url, fresh: true });
                const p = new Problems();
                p.eq('status', second.status, 200);
                p.check(
                    HIT.test(xCache(second)),
                    `second request x-cache: ${xCache(second)} (first: ${xCache(first)})`
                );
                return p.outcome(`${path}: ${xCache(first)} -> ${xCache(second)}, age ${header(second, 'age') ?? '-'}`);
            },
        })),
        ...NEVER_CACHED.map((path): CheckDef => ({
            id: `caching.never-hit.${path}`,
            area: 'caching',
            title: `${path} is never served from the CloudFront cache`,
            refs: ['SE-80', '2026-09-18 /example/ incident'],
            async run({ http }) {
                const url = `${WWW}${path}`;
                // Either response coming from cache fails it, so only the repeat must be new.
                const a = await http.request({ method: 'HEAD', url });
                const b = await http.request({ method: 'HEAD', url, fresh: true });
                const hits = [a, b].filter((r) => HIT.test(xCache(r)));
                return hits.length ? fail(`x-cache: ${xCache(a)}, ${xCache(b)}`) : pass(`${xCache(a)}, ${xCache(b)}`);
            },
        })),
        {
            id: 'caching.host-in-cache-key',
            area: 'caching',
            title: 'Host is in the cache key: the apex never receives www’s cached asset',
            refs: ['CachingOptimizedWithHost', 'SE-4'],
            async run({ http }) {
                const path = await resolveProbe(http, CACHE_PROBES[0]);
                if (!path) {
                    return fail('no asset found to probe');
                }
                const www = await http.request({ method: 'HEAD', url: `${WWW}${path}` });
                const apex = await http.request({ method: 'HEAD', url: `https://ag-grid.com${path}`, fresh: true });
                const p = new Problems();
                p.eq('www status', www.status, 200);
                p.eq('apex status', apex.status, 301);
                p.eq('apex Location', header(apex, 'location'), `${WWW}${path}`);
                return p.outcome(`www ${www.status} ${xCache(www)}; apex ${apex.status} ${xCache(apex)}`);
            },
        },
        {
            id: 'caching.mta-sts-policy',
            area: 'caching',
            title: 'mta-sts.ag-grid.com serves its policy (WAF allow rule) and www does not',
            refs: ['allow-mta-sts-policy'],
            async run({ http }) {
                const policy = await http.get('https://mta-sts.ag-grid.com/.well-known/mta-sts.txt');
                const www = await http.request({ method: 'HEAD', url: `${WWW}/.well-known/mta-sts.txt` });
                const p = new Problems();
                p.eq('mta-sts status', policy.status, 200);
                p.check(/version:\s*STSv1/.test(policy.body), 'policy body lacks "version: STSv1"');
                p.check(
                    www.status !== 200 || contentType(www) !== contentType(policy),
                    `www returned ${www.status} ${contentType(www)}`
                );
                return p.outcome();
            },
        },
        ...POISON_PROBES.map((path): CheckDef => ({
            id: `caching.markdown-does-not-poison.${path}`,
            area: 'caching',
            title: `${path}: HTML, then markdown, then HTML again is still HTML`,
            refs: ['SE-80', '2026-09-18 /example/ incident'],
            async run({ http }) {
                const url = `${WWW}${path}`;
                // Only the last request must be new: it has to follow a markdown request, and a
                // shared one (made earlier by another check) still came first.
                const before = await http.request({ url });
                const md = await http.request({ url, headers: { accept: MARKDOWN_ACCEPT } });
                const after = await http.request({ url, fresh: true });
                const p = new Problems();
                p.eq('first response', contentType(before), 'text/html');
                p.eq('after a markdown request', contentType(after), 'text/html');
                p.check(!HIT.test(xCache(after)), `HTML came from cache after a markdown request (${xCache(after)})`);
                return p.outcome(`markdown request got ${md.status} ${contentType(md)}`);
            },
        })),
        {
            id: 'caching.archive-markdown-split',
            area: 'caching',
            title: 'Archive behaviour: markdown and HTML get separate cache entries',
            refs: ['waf-finding.md §4', 'add-archive-cache-behaviors.sh'],
            pending: PENDING.archiveCache,
            async run({ http, live }) {
                await live.prepareGuard();
                const split = live.markdownSplit(ARCHIVE_POISON_PROBE);
                if (!split.split) {
                    return skip(
                        `${ARCHIVE_POISON_PROBE} has no verified ${MARKDOWN_KEY_FUNCTION} cache-key split (${split.reason}): markdown probe not sent`
                    );
                }
                const url = `${WWW}${ARCHIVE_POISON_PROBE}`;
                await http.request({ method: 'HEAD', url, fresh: true });
                const md = await http.request({ url, headers: { accept: MARKDOWN_ACCEPT }, fresh: true });
                const html = await http.request({ url, fresh: true });
                const p = new Problems();
                p.eq('HTML after markdown', contentType(html), 'text/html');
                return p.outcome(`markdown ${md.status} ${contentType(md)} ${xCache(md)}; html ${xCache(html)}`);
            },
        },
    ];
}
