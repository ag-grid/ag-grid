import { describeChain, header } from '../core/http';
import { type CheckDef, Problems } from '../core/types';
import { REDIRECTS, type RedirectRow } from '../expected/redirects';

const isRedirect = (code: number): boolean => code >= 300 && code < 400;

function title(row: RedirectRow): string {
    const target = row.to ?? (row.toPrefix ? `${row.toPrefix}*` : undefined);
    return `${row.from} -> ${target ?? row.status}${row.note ? ` (${row.note})` : ''}`;
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
            // Stops after the expected number of redirects: one more response is enough to show
            // whether the chain ends there, so a long chain costs no extra requests.
            const chain = await http.follow(row.from, { maxHops: row.hops ?? 1 });
            const first = chain[0];
            const last = chain[chain.length - 1];
            const p = new Problems();
            const expectedStatus = row.status ?? 301;
            p.eq('first status', first.status, expectedStatus);

            if (isRedirect(expectedStatus)) {
                const location = header(first, 'location');
                const resolved = location ? new URL(location, row.from).href : undefined;
                if (row.to !== undefined) {
                    p.eq('Location', resolved, row.to);
                }
                if (row.toPrefix !== undefined) {
                    p.check(
                        !!resolved?.startsWith(row.toPrefix),
                        `Location ${resolved} does not start with ${row.toPrefix}`
                    );
                }
                const hops = chain.filter((r) => isRedirect(r.status)).length;
                p.eq('redirect hops', hops, row.hops ?? 1);
                p.eq('final status', last.status, row.final ?? 200);
            }
            if (p.count) {
                p.add(`chain: ${describeChain(chain)}`);
            }
            return p.outcome(describeChain(chain));
        },
    }));
}
