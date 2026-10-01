import { PARENTS, TICKETS } from '../expected/tickets';
import { AWS_PROFILE, KNOWN_IAM_GAPS } from './aws';
import { redact } from './redact';
import { AREAS, type Area, type FinalStatus, type Result } from './types';

const LABEL: Record<FinalStatus, string> = {
    pass: 'PASS',
    fail: 'FAIL',
    warn: 'WARN',
    info: 'INFO',
    skip: 'SKIP',
    pending: 'PENDING',
    'pending-live': 'NOW LIVE',
    known: 'KNOWN',
    'known-fixed': 'FIXED?',
};

const ORDER: FinalStatus[] = [
    'pass',
    'fail',
    'warn',
    'known',
    'known-fixed',
    'pending',
    'pending-live',
    'skip',
    'info',
];

const useColour = process.stdout.isTTY && !process.env.NO_COLOR;
const COLOUR: Partial<Record<FinalStatus, string>> = {
    pass: '32',
    fail: '31',
    warn: '33',
    known: '35',
    'known-fixed': '36',
    pending: '90',
    'pending-live': '36',
    skip: '90',
};
const paint = (status: FinalStatus, text: string): string =>
    useColour && COLOUR[status] ? `\u001b[${COLOUR[status]}m${text}\u001b[0m` : text;

const out = (line = ''): void => {
    console.log(redact(line));
};

export function printResults(results: Result[], verbose: boolean): void {
    const byArea = new Map<Area, Result[]>();
    for (const r of results) {
        byArea.set(r.check.area, [...(byArea.get(r.check.area) ?? []), r]);
    }
    for (const area of Object.keys(AREAS) as Area[]) {
        const rs = byArea.get(area);
        if (!rs?.length) {
            continue;
        }
        out();
        out(`== ${area}: ${AREAS[area]}`);
        for (const r of rs) {
            const quiet = r.status === 'pass' && !verbose;
            const refs = r.check.refs?.length ? `  [${r.check.refs.join(', ')}]` : '';
            out(`  ${paint(r.status, LABEL[r.status].padEnd(8))} ${r.check.title}${refs}`);
            if (!quiet && r.detail) {
                out(`           ${r.detail}`);
            }
            if (r.status === 'known' || r.status === 'known-fixed') {
                out(
                    `           known issue: ${r.check.knownIssue}${r.check.fixedBy ? ` | fix: ${r.check.fixedBy}` : ''}`
                );
            }
            if (r.status === 'pending-live') {
                out(`           now live: remove "pending" from this expectation (${r.check.pending})`);
            }
            if (r.status === 'known-fixed') {
                out('           passes now: remove the knownIssue marker if the fix is intended');
            }
            if (verbose || r.status === 'fail') {
                out(`           id: ${r.check.id}`);
            }
        }
    }
}

export function printSummary(
    results: Result[],
    extras: { http: number; maxRequests: number; aws: number; denied: string[]; refused: string[]; guard: string }
): void {
    out();
    out('== Summary');
    const header = ['area'.padEnd(15), ...ORDER.map((s) => LABEL[s].padStart(10)), 'total'.padStart(7)].join('');
    out(header);
    const totals = new Map<FinalStatus, number>();
    for (const area of Object.keys(AREAS) as Area[]) {
        const rs = results.filter((r) => r.check.area === area);
        if (!rs.length) {
            continue;
        }
        const cells = ORDER.map((s) => {
            const n = rs.filter((r) => r.status === s).length;
            totals.set(s, (totals.get(s) ?? 0) + n);
            return String(n || '.').padStart(10);
        });
        out([area.padEnd(15), ...cells, String(rs.length).padStart(7)].join(''));
    }
    out(
        [
            'TOTAL'.padEnd(15),
            ...ORDER.map((s) => String(totals.get(s) ?? 0).padStart(10)),
            String(results.length).padStart(7),
        ].join('')
    );
    out();
    out(
        `HTTP requests: ${extras.http} (cap ${extras.maxRequests}); AWS read-only calls: ${extras.aws}; markdown guard: ${extras.guard}`
    );
    if (extras.refused.length) {
        out(`Markdown probes refused by the guard (${extras.refused.length}):`);
        for (const r of extras.refused) {
            out(`  ${r}`);
        }
    }
    if (extras.denied.length) {
        out(`IAM actions denied to ${AWS_PROFILE} - the checks that need them are unverifiable until they are added:`);
        for (const action of [...extras.denied].sort()) {
            out(`  ${action}${KNOWN_IAM_GAPS[action] ? `: needed to verify ${KNOWN_IAM_GAPS[action]}` : ''}`);
        }
    }
}

export function printCoverage(results: Result[]): void {
    const cited = new Map<string, number>();
    for (const r of results) {
        for (const ref of r.check.refs ?? []) {
            for (const t of ref.match(/SE-\d+/g) ?? []) {
                cited.set(t, (cited.get(t) ?? 0) + 1);
            }
        }
    }
    const counts = TICKETS.map((t) => {
        const own = cited.get(t) ?? 0;
        const viaChildren = (PARENTS[t] ?? []).reduce((a, c) => a + (cited.get(c) ?? 0), 0);
        return { t, own, viaChildren };
    });
    out();
    out('== Ticket coverage (checks citing each ticket)');
    out(
        '  ' +
            counts
                .map(({ t, own, viaChildren }) => `${t}:${own}${viaChildren ? `(+${viaChildren} via children)` : ''}`)
                .join('  ')
    );
    const uncovered = counts.filter((c) => !c.own && !c.viaChildren).map((c) => c.t);
    out(uncovered.length ? `  NOT COVERED: ${uncovered.join(', ')}` : '  every ticket is covered');
}
