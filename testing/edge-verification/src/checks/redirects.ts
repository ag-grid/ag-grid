import { lookup } from 'node:dns/promises';

import { type Http, type Response, describeChain, header } from '../core/http';
import { type CheckDef, Problems, skip } from '../core/types';
import { DISTRIBUTION } from '../expected/edge';
import { REDIRECTS, type RedirectRow } from '../expected/redirects';

const isRedirect = (code: number): boolean => code >= 300 && code < 400;

function title(row: RedirectRow): string {
    const target = row.to ?? (row.toPrefix ? `${row.toPrefix}*` : undefined);
    return `${row.from} -> ${target ?? row.status}${row.note ? ` (${row.note})` : ''}${row.final && row.final !== 200 ? ` -> ${row.final}` : ''}`;
}

/** The first hop's Location, resolved against the request URL. */
const locationOf = (res: Response, from: string): string | undefined => {
    const location = header(res, 'location');
    return location ? new URL(location, from).href : undefined;
};

function locationMatches(row: RedirectRow, resolved: string | undefined): boolean {
    if (row.to !== undefined && resolved !== row.to) {
        return false;
    }
    return row.toPrefix === undefined || !!resolved?.startsWith(row.toPrefix);
}

/**
 * The redirect chain for a row. Stops after the expected number of redirects (one more response
 * shows whether the chain ends there), and after the first response when its status or Location
 * is already wrong: the rest of a wrong chain proves nothing more and would cost requests.
 */
async function chainFor(http: Http, row: RedirectRow): Promise<Response[]> {
    const first = await http.head(row.from);
    const location = locationOf(first, row.from);
    if (!isRedirect(first.status) || !location || first.status !== (row.status ?? 301)) {
        return [first];
    }
    if (!locationMatches(row, location)) {
        return [first];
    }
    return [first, ...(await http.follow(location, { maxHops: (row.hops ?? 1) - 1 }))];
}

/** Hosts the distribution does not serve may not be in DNS at all (angulargrid.com today). */
async function unresolvable(url: string): Promise<string | undefined> {
    const host = new URL(url).hostname;
    if (DISTRIBUTION.aliases.includes(host)) {
        return undefined;
    }
    try {
        await lookup(host);
        return undefined;
    } catch (e) {
        return `${host} does not resolve (${(e as NodeJS.ErrnoException).code ?? (e as Error).message}): nothing to request`;
    }
}

export function redirectChecks(): CheckDef[] {
    return REDIRECTS.map((row) => ({
        id: `redirects.${row.from.replace(/^https:\/\//, '')}`,
        area: 'redirects',
        title: title(row),
        refs: row.refs,
        pending: row.pending,
        knownIssue: row.knownIssue,
        fixedBy: row.fixedBy,
        async run({ http }) {
            const noHost = await unresolvable(row.from);
            if (noHost) {
                return skip(noHost);
            }
            const chain = await chainFor(http, row);
            const first = chain[0];
            const last = chain[chain.length - 1];
            const p = new Problems();
            const expectedStatus = row.status ?? 301;
            p.eq('first status', first.status, expectedStatus);

            if (isRedirect(expectedStatus)) {
                const resolved = locationOf(first, row.from);
                if (row.to !== undefined) {
                    p.eq('Location', resolved, row.to);
                }
                if (row.toPrefix !== undefined) {
                    p.check(
                        !!resolved?.startsWith(row.toPrefix),
                        `Location ${resolved} does not start with ${row.toPrefix}`
                    );
                }
                // Only meaningful once the first hop is right; a wrong first hop stops the chain.
                if (!p.count) {
                    const hops = chain.filter((r) => isRedirect(r.status)).length;
                    p.eq('redirect hops', hops, row.hops ?? 1);
                    p.eq('final status', last.status, row.final ?? 200);
                }
            }
            if (p.count) {
                p.add(`chain: ${describeChain(chain)}`);
            }
            return p.outcome(describeChain(chain));
        },
    }));
}
