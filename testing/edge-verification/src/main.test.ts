import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { allChecks } from './checks';
import { AREAS, type Area } from './core/types';
import { TICKETS } from './expected/tickets';

/** The overview comment at the top of main.ts. */
const OVERVIEW = /^\/\*\*([\s\S]*?)\*\//.exec(readFileSync(new URL('./main.ts', import.meta.url), 'utf8'))![1];

const ticketNumber = (ticket: string) => Number(ticket.slice(3));
const sorted = (tickets: Iterable<string>) => [...new Set(tickets)].sort((a, b) => ticketNumber(a) - ticketNumber(b));

/** The SE tickets each area's checks cite in their refs. */
function citedByArea(): Map<Area, string[]> {
    const cited = new Map<Area, string[]>();
    for (const check of allChecks()) {
        const tickets = (check.refs ?? []).flatMap((ref) => ref.match(/SE-\d+/g) ?? []);
        cited.set(check.area, [...(cited.get(check.area) ?? []), ...tickets]);
    }
    return new Map([...cited].map(([area, tickets]) => [area, sorted(tickets)]));
}

/** The tickets the overview lists under each area: the SE-n lines of its table row. */
function listedByArea(): Map<Area, string[]> {
    const listed = new Map<Area, string[]>();
    let area: Area | undefined;
    for (const line of OVERVIEW.split('\n')) {
        const row = /^ \* {3}([a-z-]+)\s+/.exec(line);
        if (row && row[1] in AREAS) {
            area = row[1] as Area;
            listed.set(area, []);
        } else if (!/^ \*\s{4,}/.test(line)) {
            area = undefined;
        }
        if (area && /^ \*\s+SE-\d+/.test(line)) {
            listed.get(area)!.push(...(line.match(/SE-\d+/g) ?? []));
        }
    }
    return listed;
}

describe('the main.ts overview', () => {
    it('has a row for every area', () => {
        assert.deepEqual([...listedByArea().keys()].sort(), Object.keys(AREAS).sort());
    });

    it("lists exactly the tickets each area's checks cite, in order", () => {
        const cited = citedByArea();
        for (const [area, listed] of listedByArea()) {
            assert.deepEqual(listed, cited.get(area) ?? [], `${area}: the overview lists ${listed.join(', ')}`);
        }
    });

    it('names, under what the live run does not check, every ticket only reported as INFO', () => {
        const notLive = OVERVIEW.slice(OVERVIEW.indexOf('What the live run does NOT check'));
        const judged = new Set(
            allChecks()
                .filter((c) => !c.id.startsWith('seo-content.not-checkable.'))
                .flatMap((c) => (c.refs ?? []).flatMap((ref) => ref.match(/SE-\d+/g) ?? []))
        );
        const infoOnly = TICKETS.filter((t) => !judged.has(t) && !/^SE-(8|181)$/.test(t));
        assert.deepEqual(infoOnly, ['SE-44', 'SE-46']);
        for (const ticket of [...infoOnly, 'SE-181']) {
            assert.match(notLive, new RegExp(`\\b${ticket}\\b`), ticket);
        }
    });
});
