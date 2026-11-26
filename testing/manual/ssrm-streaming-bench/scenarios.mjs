// Scenario matrix and the pass/fail thresholds, fixed before anything was measured.
// `run-bench.mjs` runs the scenarios; `evaluate` turns their results into one verdict per requirement.

const R3_COLS = 'cols=200';

/** `action` names a step run in the page after the measurement window (see run-bench.mjs). */
export const SCENARIOS = [
    { id: 'S0', title: 'Control: feed off', query: `${R3_COLS}&feed=0` },
    { id: 'S1', title: 'Baseline: 75 ms top inserts, 5 updates/s per cell, async', query: R3_COLS, repeat: 2 },
    { id: 'S1i', title: 'S1 inserts only (no cell updates)', query: `${R3_COLS}&rate=0` },
    { id: 'S1u', title: 'S1 cell updates only (no inserts)', query: `${R3_COLS}&insertMs=0` },
    { id: 'S4', title: 'S1 with animateRows on', query: `${R3_COLS}&animate=1`, repeat: 2 },
    { id: 'S7', title: 'Selection across pause/resume with inserts', query: 'cols=50', action: 'selection' },
    { id: 'S5a', title: 'Window: cacheBlockSize 100, maxBlocksInCache -1', query: 'cols=50&block=100&maxBlocks=-1' },
    { id: 'S5b', title: 'Window: cacheBlockSize 100, maxBlocksInCache 5', query: 'cols=50&block=100&maxBlocks=5' },
    { id: 'S5c', title: 'Window: cacheBlockSize 500, maxBlocksInCache 1', query: 'cols=50&block=500&maxBlocks=1' },
    { id: 'S5d', title: 'Window: cacheBlockSize 500, maxBlocksInCache -1', query: 'cols=50&block=500&maxBlocks=-1' },
    {
        id: 'S6',
        title: 'Grouped by sym, SUM + grand total, 3 groups expanded',
        query: 'cols=50&group=1',
        action: 'expandGroups',
    },
    {
        id: 'S11',
        title: 'Server-side sort, filters, grouping (500 ms latency, feed off)',
        query: 'cols=50&feed=0&latency=500',
        action: 'serverOps',
    },
    { id: 'S3', title: 'S1 with sync transactions', query: `${R3_COLS}&sync=1` },
    { id: 'S2', title: 'S1 at 10 updates/s per cell', query: `${R3_COLS}&rate=10` },
    { id: 'S8a', title: '200 columns, send all fields', query: 'cols=200&colWidth=60', action: 'hscroll' },
    { id: 'S8b', title: '200 columns, trim to visible', query: 'cols=200&colWidth=60&trim=1', action: 'hscroll' },
    { id: 'S8c', title: '2,000 columns, send all fields', query: 'cols=2000&colWidth=60', action: 'hscroll' },
    { id: 'S8d', title: '2,000 columns, trim to visible', query: 'cols=2000&colWidth=60&trim=1', action: 'hscroll' },
    { id: 'S9a', title: '4 grids, all live', query: 'cols=50&grids=4' },
    { id: 'S9b', title: '16 grids, all live', query: 'cols=50&grids=16' },
    { id: 'S9c', title: '100 grids, all live', query: 'cols=50&grids=100' },
    {
        id: 'S9d',
        title: '100 grids, reduced feed (2 inserts/s, 2 updates/s per cell)',
        query: 'cols=50&grids=100&insertMs=500&rate=2',
    },
    {
        id: 'S10a',
        title: '100,000 backend rows: scroll top/middle/end',
        query: 'cols=50&feed=0&total=100000',
        action: 'scroll',
    },
    {
        id: 'S10b',
        title: '100,000,000 backend rows: scroll top/middle/end',
        query: 'cols=50&feed=0&total=100000000',
        action: 'scroll',
    },
    ...[5, 10, 20, 40, 80].map((rate) => ({
        id: `S12-${rate}`,
        title: `Ceiling sweep: ${rate} updates/s per cell with 75 ms inserts`,
        query: `${R3_COLS}&rate=${rate}`,
        rate,
    })),
];

export const REQUIREMENTS = [
    {
        id: 'R1',
        text: 'Backend does all sort/filter/group/aggregation; grid sends the models',
        threshold: 'backend receives sort, filter and group models; no local reorder; rendered rows follow the backend',
    },
    {
        id: 'R2',
        text: '5-10 updates/s per cell; every row updated at least once a second',
        threshold:
            'pass: rendered per-cell rate p50 >= 5/s and 100 % of visible rows changed >= 1/s; partial: >= 5/s on >= 90 %',
    },
    {
        id: 'R3',
        text: '> 1 screen refresh/s with > 50 rows x 50 columns visible',
        threshold: '> 50 x 50 visible, > 1 content refresh/s, no frame > 1000 ms',
    },
    {
        id: 'R4',
        text: 'Top insert every 75 ms, departing row DOM recycled, refresh holds',
        threshold:
            'pass: >= 12.5 inserts/s, > 1 refresh/s, row elements re-used; partial: same but rows destroyed + created',
    },
    {
        id: 'R5',
        text: 'Backend order incl. arrival sort; rows shift at refresh rate',
        threshold: 'rendered order matches backend order on every check, fps >= 1',
    },
    {
        id: 'R6',
        text: 'Group and total rows at the pace of leaf updates',
        threshold: 'pass: p95 lag <= 200 ms; partial: <= 1 s; fail: > 1 s',
    },
    {
        id: 'R7',
        text: '500-row virtualised window',
        threshold:
            'pass: loaded nodes stay <= 500 + cacheBlockSize with the default cache settings; partial: only with another combination',
    },
    {
        id: 'R8',
        text: 'Row + cell selection survives pause/resume',
        threshold: 'pass: rows and cell range follow the row ids; partial: rows only; fail: rows lost',
    },
    {
        id: 'R9',
        text: '25-50k typical, <= 100k displayed; ~100m backend',
        threshold: 'pass: correct rows at top/middle/end for 100k and 100m; partial: 100k only',
    },
    {
        id: 'R10a',
        text: '100+ grids on one screen',
        threshold: 'pass: > 1 refresh/s on every grid at the full feed; partial: only with a reduced feed',
    },
    {
        id: 'R10b',
        text: '~2,000 columns',
        threshold: 'pass: > 1 refresh/s with all fields sent; partial: only when trimmed to visible columns',
    },
];

const v = (verdict, number, scenarios) => ({ verdict, number, scenarios });
const unmeasured = (why, scenarios) => v('unmeasured', why, scenarios);
const g0 = (r) => r?.snapshot?.grids?.[0];
const ok = (r) => r && !r.error;

/** Turns scenario results (keyed by id; repeated scenarios use their first run) into one verdict per requirement. */
export function evaluate(results) {
    const out = {};
    const s1 = results.S1;

    const s11 = results.S11?.action;
    if (ok(results.S11) && s11) {
        const sortSent = s11.sort.backendReceived.some((m) => m?.[0]?.colId === 'qty');
        const numSent = s11.numberFilter.backendReceived.some((m) => m?.qty);
        const textSent = s11.textFilter.backendReceived.some((m) => m?.sym);
        const groupSent = s11.group.backendReceived.some((c) => c.includes('sym'));
        const all =
            sortSent &&
            numSent &&
            textSent &&
            groupSent &&
            s11.sort.renderedImmediatelyAfterClick === 'unchanged or loading' &&
            s11.sort.renderedInBackendOrder &&
            s11.numberFilter.renderedMatches &&
            s11.textFilter.renderedMatches &&
            s11.group.renderedGroupRows > 0 &&
            s11.serverSideEnableClientSideSort === false;
        out.R1 = v(
            all ? 'pass' : 'fail',
            `sort sent ${sortSent}, filters sent ${numSent}/${textSent}, group sent ${groupSent}; after header click: ${s11.sort.renderedImmediatelyAfterClick}; rendered matches backend: sort ${s11.sort.renderedInBackendOrder}, number ${s11.numberFilter.renderedMatches}, text ${s11.textFilter.renderedMatches}, groups ${s11.group.renderedGroupRows}`,
            ['S11']
        );
    } else {
        out.R1 = unmeasured(results.S11?.error ?? 'not run', ['S11']);
    }

    const g1 = g0(s1);
    if (ok(s1) && g1) {
        const p50 = g1.perCellRenderedRate.p50;
        const pct = g1.pctRowsChangedAtLeast1PerS;
        const verdict = p50 >= 5 && pct === 100 ? 'pass' : p50 >= 5 && pct >= 90 ? 'partial' : 'fail';
        const sweep = SCENARIOS.filter((s) => s.rate && ok(results[s.id])).map((s) => [
            s.rate,
            g0(results[s.id]).perCellRenderedRate.p50,
        ]);
        const tracking = sweep.filter(([rate, got]) => got >= 0.9 * rate).map(([rate]) => rate);
        const ceiling = sweep.length
            ? `; sweep (requested -> rendered p50): ${sweep.map(([a, b]) => `${a} -> ${b}`).join(', ')}; highest rate tracked within 90 %: ${tracking.length ? Math.max(...tracking) : 'none'}`
            : '';
        out.R2 = v(
            verdict,
            `requested 5/s (feed managed ${g1.feed.updateTicksPerS} update ticks/s): rendered per-cell p50 ${p50}/s (p10 ${g1.perCellRenderedRate.p10}); ${pct} % of ${g1.rowsObserved} visible rows changed >= 1/s${ceiling}`,
            ['S1', 'S2', 'S12']
        );

        const big = g1.rows > 50 && g1.cols > 50;
        const r3 = big && g1.contentRefreshPerS > 1 && s1.snapshot.framesOver1000ms === 0;
        out.R3 = v(
            r3 ? 'pass' : 'fail',
            `${g1.rows} rows x ${g1.cols} cols visible; ${g1.contentRefreshPerS} content refreshes/s; ${s1.snapshot.fps} fps; max frame ${s1.snapshot.frameMs.max} ms`,
            ['S1']
        );

        const inserts = g1.insertsAppliedPerS;
        const recycled = g1.rowIdAttributeChanges > 0;
        const rateOk = inserts >= 12.5 && g1.contentRefreshPerS > 1;
        const only = g0(results.S1i);
        const insertsOnly =
            ok(results.S1i) && only
                ? `; inserts alone (S1i): ${only.insertsAppliedPerS}/s at ${results.S1i.snapshot.fps} fps`
                : '';
        out.R4 = v(
            rateOk && recycled ? 'pass' : rateOk ? 'partial' : 'fail',
            `${inserts} inserts/s applied (13.3 requested, ${g1.feed.insertsEmittedPerS} emitted; mock backend ${g1.feed.backendMsPerS} ms/s)${insertsOnly}; DOM rows +${g1.domRowsAddedPerS}/s -${g1.domRowsRemovedPerS}/s; row elements re-keyed: ${g1.rowIdAttributeChanges}; async queue p95 ${g1.txAsyncQueueMs.p95} ms`,
            ['S1', 'S1i', 'S3', 'S4']
        );

        out.R5 = v(
            g1.orderChecks > 0 && g1.orderMismatches === 0 && s1.snapshot.fps >= 1 ? 'pass' : 'fail',
            `${g1.orderMismatches} mismatches in ${g1.orderChecks} order checks; new top row rendered p95 ${g1.headRenderLagMs.p95} ms after apply`,
            ['S1']
        );
    } else {
        for (const id of ['R2', 'R3', 'R4', 'R5']) {
            out[id] = unmeasured(s1?.error ?? 'not run', ['S1']);
        }
    }

    const s6 = g0(results.S6);
    if (ok(results.S6) && s6 && (s6.aggLagMs.group.n || s6.aggLagMs.total.n)) {
        const p95 = Math.max(s6.aggLagMs.group.p95 ?? 0, s6.aggLagMs.total.p95 ?? 0);
        out.R6 = v(
            p95 <= 200 ? 'pass' : p95 <= 1000 ? 'partial' : 'fail',
            `group lag p95 ${s6.aggLagMs.group.p95 ?? '-'} ms (n ${s6.aggLagMs.group.n}), grand total p95 ${s6.aggLagMs.total.p95 ?? '-'} ms (n ${s6.aggLagMs.total.n}); superseded before render ${s6.aggLagMs.superseded}`,
            ['S6']
        );
    } else {
        out.R6 = unmeasured(results.S6?.error ?? 'no group/total lag samples', ['S6']);
    }

    const combos = ['S5a', 'S5b', 'S5c', 'S5d'].filter((id) => ok(results[id]));
    if (combos.length) {
        // "Stays" within the bound: under the window's limit and not still growing at the end of it.
        const bounded = combos.filter(
            (id) =>
                results[id].snapshot.loadedNodes.max <= 500 + results[id].config.block &&
                results[id].snapshot.loadedNodes.slopePerS != null &&
                results[id].snapshot.loadedNodes.slopePerS <= 0.5
        );
        const text = combos
            .map(
                (id) =>
                    `${id} max ${results[id].snapshot.loadedNodes.max} (slope ${results[id].snapshot.loadedNodes.slopePerS}/s)`
            )
            .join('; ');
        out.R7 = v(
            bounded.includes('S5a') ? 'pass' : bounded.length ? 'partial' : 'fail',
            `loaded nodes: ${text}`,
            combos
        );
    } else {
        out.R7 = unmeasured('not run', ['S5a', 'S5b', 'S5c', 'S5d']);
    }

    const s7 = results.S7?.action;
    if (ok(results.S7) && s7) {
        const rows = s7.allRowsStillSelected;
        const cells = s7.rangeStillCoversSameRows;
        out.R8 = v(
            rows && cells ? 'pass' : rows ? 'partial' : 'fail',
            `rows still selected: ${rows} (indexes ${s7.before.indexes.join(',')} -> ${s7.rows.map((r) => r.index).join(',')}); cell range still on the same row ids: ${cells}; ${s7.resume.applied} buffered transactions applied on resume in ${s7.resume.ms} ms`,
            ['S7']
        );
    } else {
        out.R8 = unmeasured(results.S7?.error ?? 'not run', ['S7']);
    }

    const scrollOk = (r) => ok(r) && r.action?.every((c) => c.loaded && c.mismatches === 0 && c.renderedRows > 0);
    if (ok(results.S10a) && ok(results.S10b)) {
        const a = scrollOk(results.S10a);
        const b = scrollOk(results.S10b);
        const desc = (r) =>
            r?.action
                ?.map((c) => `${c.index}: ${c.loaded ? `${c.renderedRows} rows, ${c.mismatches} wrong` : 'not loaded'}`)
                .join('; ') ?? r?.error;
        out.R9 = v(
            a && b ? 'pass' : a ? 'partial' : 'fail',
            `100k: ${desc(results.S10a)} | 100m: ${desc(results.S10b)}`,
            ['S10a', 'S10b']
        );
    } else {
        out.R9 = unmeasured(results.S10a?.error ?? results.S10b?.error ?? 'not run', ['S10a', 'S10b']);
    }

    const minRefresh = (r) => (ok(r) ? Math.min(...r.snapshot.grids.map((x) => x.contentRefreshPerS)) : null);
    if (ok(results.S9c)) {
        const full = minRefresh(results.S9c);
        const reduced = minRefresh(results.S9d);
        const attached = results.S9c.snapshot.gridsAttached;
        out.R10a = v(
            full > 1 && attached === 100 ? 'pass' : reduced > 1 ? 'partial' : 'fail',
            `100 grids (${attached} rendered data): slowest grid ${full} refreshes/s, ${results.S9c.snapshot.fps} fps; reduced feed: slowest ${reduced ?? '-'} refreshes/s`,
            ['S9a', 'S9b', 'S9c', 'S9d']
        );
    } else {
        out.R10a = unmeasured(results.S9c?.error ?? 'not run', ['S9c']);
    }

    if (ok(results.S8c) || ok(results.S8d)) {
        const pass = (r) => ok(r) && g0(r).contentRefreshPerS > 1 && r.snapshot.framesOver1000ms === 0;
        const all = pass(results.S8c);
        const trim = pass(results.S8d);
        const desc = (r) =>
            ok(r)
                ? `${g0(r).contentRefreshPerS} refreshes/s, ${r.snapshot.fps} fps, ${r.bytesPerRow} bytes/row`
                : r?.error;
        out.R10b = v(
            all ? 'pass' : trim ? 'partial' : 'fail',
            `send all: ${desc(results.S8c)} | trim: ${desc(results.S8d)}`,
            ['S8c', 'S8d']
        );
    } else {
        out.R10b = unmeasured('not run', ['S8c', 'S8d']);
    }
    return out;
}
