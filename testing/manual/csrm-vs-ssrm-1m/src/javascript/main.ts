import { createGrid } from 'ag-grid-community';
import type { GridApi } from 'ag-grid-community';

import { gridOptions } from '../config';
import type { RowData } from '../config';
import { generateRows } from '../data';
import { createSyncDatasource } from '../datasource';
import type { DatasourceStats } from '../datasource';

/**
 * CSRM vs synchronous in-memory SSRM, 1M rows.
 *
 *   ?mode=csrm|ssrm   row model (default csrm). One mode per page load keeps heap numbers clean.
 *   ?rows=1000000     row count
 *   ?syncLoad=1       SSRM only: enable `serverSideSynchronousLoad`
 *
 * Everything is also driven from `window.exp` (see bottom) so runs can be scripted from DevTools.
 */

const params = new URLSearchParams(location.search);
const mode: 'csrm' | 'ssrm' = params.get('mode') === 'ssrm' ? 'ssrm' : 'csrm';
const rowCount = Number(params.get('rows') ?? 1_000_000);
const syncLoad = params.get('syncLoad') === '1';

interface Result {
    action: string;
    [metric: string]: string | number;
}

const results: Result[] = [];
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const heapMb = (): number | undefined => {
    const mem = (performance as any).memory;
    return mem ? Math.round((mem.usedJSHeapSize / 1024 / 1024) * 10) / 10 : undefined;
};

const gc = () => (window as any).gc?.();

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const paint = async () => {
    await nextFrame();
    await nextFrame();
};

const record = (result: Result) => {
    results.push(result);
    renderResults();
    return result;
};

function renderResults() {
    const keys = Array.from(new Set(results.flatMap((r) => Object.keys(r))));
    $('results').innerHTML =
        `<table><thead><tr>${keys.map((k) => `<th>${k}</th>`).join('')}</tr></thead><tbody>` +
        results.map((r) => `<tr>${keys.map((k) => `<td>${r[k] ?? ''}</td>`).join('')}</tr>`).join('') +
        '</tbody></table>';
}

// ---------------------------------------------------------------------------------------------
// Setup. Row generation happens before any measurement and the array is held in both modes, so
// "grid overhead" = heap after load - heap after generation.
// ---------------------------------------------------------------------------------------------

$('mode').textContent =
    `${mode.toUpperCase()}${mode === 'ssrm' && syncLoad ? ' (sync load)' : ''} · ${rowCount.toLocaleString()} rows`;
for (const m of ['csrm', 'ssrm']) {
    const link = $<HTMLAnchorElement>(`link-${m}`);
    link.href = `?mode=${m}&rows=${rowCount}${m === 'ssrm' && syncLoad ? '&syncLoad=1' : ''}`;
    link.classList.toggle('active', m === mode);
}
const syncLink = $<HTMLAnchorElement>('link-sync');
syncLink.href = `?mode=ssrm&rows=${rowCount}${syncLoad ? '' : '&syncLoad=1'}`;
syncLink.textContent = syncLoad ? 'SSRM: sync load ON' : 'SSRM: sync load off';

gc();
const heapBeforeData = heapMb();
const allRows = generateRows(rowCount);
gc();
const heapAfterData = heapMb();

const { datasource, stats } = createSyncDatasource(allRows);
const datasourceStats: DatasourceStats = stats;

let api!: GridApi<RowData>;
let loadingRowsRendered = 0;
let lastModelUpdateAt = 0;
let firstDataRenderedAt = 0;

function createGridForMode() {
    // Neither row model is given data here: `load` supplies it, so both are timed the same way.
    api = createGrid($('grid'), {
        ...gridOptions,
        rowModelType: mode === 'ssrm' ? 'serverSide' : 'clientSide',
        serverSideSynchronousLoad: syncLoad,
        onModelUpdated: () => (lastModelUpdateAt = performance.now()),
        onFirstDataRendered: () => (firstDataRenderedAt = performance.now()),
    });

    // Counts loading rows inserted into the DOM, i.e. loading spinners the user could have seen.
    new MutationObserver((mutations) => {
        for (const { addedNodes } of mutations) {
            addedNodes.forEach((added) => {
                if (added instanceof HTMLElement && (added.matches('.ag-loading') || added.querySelector('.ag-loading'))) {
                    loadingRowsRendered++;
                }
            });
        }
    }).observe($('grid'), { childList: true, subtree: true });
}

/**
 * Run `action`, then wait until the grid has painted and no model/datasource activity has
 * happened since the previous frame pair. Returns ms from just before `action` to that paint.
 */
async function timed(action: () => void): Promise<{ apiMs: number; totalMs: number }> {
    const start = performance.now();
    action();
    const apiMs = performance.now() - start;
    for (let i = 0; i < 20; i++) {
        const checkpoint = performance.now();
        await paint();
        const lastActivity = Math.max(lastModelUpdateAt, datasourceStats.lastActivityAt);
        if (lastActivity < checkpoint) {
            break;
        }
    }
    return { apiMs: round(apiMs), totalMs: round(performance.now() - start) };
}

const round = (n: number) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------------------------

async function load(): Promise<Result> {
    const callsBefore = datasourceStats.getRowsCalls;
    const loadingRowsBefore = loadingRowsRendered;
    firstDataRenderedAt = 0;
    const start = performance.now();
    if (mode === 'csrm') {
        // CSRM: hand the 1M-row array to the grid and wait for it to render.
        api.setGridOption('rowData', allRows);
    } else {
        // SSRM: supply the datasource; the grid fetches and renders the first block(s).
        api.setGridOption('serverSideDatasource', datasource);
    }
    for (let i = 0; i < 20; i++) {
        const checkpoint = performance.now();
        await paint();
        if (firstDataRenderedAt && Math.max(lastModelUpdateAt, datasourceStats.lastActivityAt) < checkpoint) {
            break;
        }
    }
    const totalMs = round(performance.now() - start);
    await new Promise((r) => setTimeout(r, 50));
    gc();
    const heap = heapMb();
    return record({
        action: 'load',
        totalMs,
        getRowsCalls: datasourceStats.getRowsCalls - callsBefore,
        loadingRows: loadingRowsRendered - loadingRowsBefore,
        displayedRows: api.getDisplayedRowCount(),
        heapMb: heap ?? 'n/a',
        gridOverheadMb: heap != null && heapAfterData != null ? round(heap - heapAfterData) : 'n/a',
    });
}

async function runTimed(
    label: string,
    action: () => void,
    extra: () => Record<string, string | number> = () => ({})
): Promise<Result> {
    const prepareRunsBefore = datasourceStats.prepareRuns;
    const callsBefore = datasourceStats.getRowsCalls;
    const loadingRowsBefore = loadingRowsRendered;
    const { apiMs, totalMs } = await timed(action);
    return record({
        action: label,
        apiMs,
        totalMs,
        getRowsCalls: datasourceStats.getRowsCalls - callsBefore,
        loadingRows: loadingRowsRendered - loadingRowsBefore,
        datasourcePrepareMs:
            datasourceStats.prepareRuns > prepareRunsBefore ? round(datasourceStats.lastPrepareMs) : '',
        displayedRows: api.getDisplayedRowCount(),
        ...extra(),
    });
}

const sortBy = (colId: string, sort: 'asc' | 'desc') =>
    api.applyColumnState({ state: [{ colId, sort }], defaultState: { sort: null } });

const actions = {
    load,
    sortAthleteAsc: () => runTimed('sort athlete asc (string)', () => sortBy('athlete', 'asc')),
    sortAgeDesc: () => runTimed('sort age desc (number)', () => sortBy('age', 'desc')),
    sortMulti: () =>
        runTimed('sort country asc, then total desc', () =>
            api.applyColumnState({
                state: [
                    { colId: 'country', sort: 'asc', sortIndex: 0 },
                    { colId: 'total', sort: 'desc', sortIndex: 1 },
                ],
                defaultState: { sort: null },
            })
        ),
    clearSort: () => runTimed('clear sort', () => api.applyColumnState({ defaultState: { sort: null } })),
    filterText: () =>
        runTimed('filter athlete contains "A1"', () =>
            api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'A1' } })
        ),
    filterNumber: () =>
        runTimed('filter age 20-30 AND year > 2010', () =>
            api.setFilterModel({
                age: { filterType: 'number', type: 'inRange', filter: 20, filterTo: 30 },
                year: { filterType: 'number', type: 'greaterThan', filter: 2010 },
            })
        ),
    clearFilter: () => runTimed('clear filters', () => api.setFilterModel(null)),
    scrollFast: () => scroll('scroll full range (fast, 300 frames)', 300),
    scrollSlow: () => scroll('scroll first ~30k rows (slow, 600 frames)', 600, 30_000),
    memory,
};

async function scroll(label: string, frames: number, limitRows?: number): Promise<Result> {
    const viewport = document.querySelector<HTMLElement>('.ag-body-vertical-scroll-viewport')!;
    viewport.scrollTop = 0;
    await paint();
    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    const rowHeight = maxScroll / Math.max(1, api.getDisplayedRowCount());
    const distance = limitRows ? Math.min(maxScroll, limitRows * rowHeight) : maxScroll;
    const callsBefore = datasourceStats.getRowsCalls;
    const loadingRowsBefore = loadingRowsRendered;
    const deltas: number[] = [];
    let last = performance.now();
    for (let i = 1; i <= frames; i++) {
        viewport.scrollTop = (distance * i) / frames;
        await nextFrame();
        const now = performance.now();
        deltas.push(now - last);
        last = now;
    }
    deltas.sort((a, b) => a - b);
    const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    return record({
        action: label,
        frames,
        meanFrameMs: round(mean),
        p95FrameMs: round(deltas[Math.floor(deltas.length * 0.95)]),
        maxFrameMs: round(deltas[deltas.length - 1]),
        framesOver50ms: deltas.filter((d) => d > 50).length,
        getRowsCalls: datasourceStats.getRowsCalls - callsBefore,
        loadingRows: loadingRowsRendered - loadingRowsBefore,
    });
}

async function memory(): Promise<Result> {
    gc();
    await new Promise((r) => setTimeout(r, 100));
    const heap = heapMb();
    return record({
        action: 'memory',
        heapBeforeDataMb: heapBeforeData ?? 'n/a',
        heapAfterDataMb: heapAfterData ?? 'n/a',
        heapNowMb: heap ?? 'n/a',
        gridOverheadMb: heap != null && heapAfterData != null ? round(heap - heapAfterData) : 'n/a',
        gcAvailable: typeof (window as any).gc === 'function' ? 'yes' : 'no (heap is approximate)',
    });
}

async function runAll() {
    // Reset sort/filter between steps so every step starts from the same state.
    await actions.load();
    await actions.sortAthleteAsc();
    await actions.clearSort();
    await actions.sortAgeDesc();
    await actions.clearSort();
    await actions.sortMulti();
    await actions.clearSort();
    await actions.filterText();
    await actions.clearFilter();
    await actions.filterNumber();
    await actions.clearFilter();
    await actions.scrollFast();
    await actions.scrollSlow();
    await actions.memory();
    return results;
}

// ---------------------------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------------------------

createGridForMode();

const buttons: [string, () => Promise<unknown>][] = [
    ['Load', actions.load],
    ['Sort athlete asc', actions.sortAthleteAsc],
    ['Sort age desc', actions.sortAgeDesc],
    ['Sort country, total', actions.sortMulti],
    ['Clear sort', actions.clearSort],
    ['Filter text', actions.filterText],
    ['Filter numbers', actions.filterNumber],
    ['Clear filters', actions.clearFilter],
    ['Scroll fast', actions.scrollFast],
    ['Scroll slow', actions.scrollSlow],
    ['Memory', actions.memory],
    ['Run all', runAll],
];
for (const [text, fn] of buttons) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = async () => {
        document.querySelectorAll('#controls button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
        try {
            await fn();
        } finally {
            document.querySelectorAll('#controls button').forEach((b) => ((b as HTMLButtonElement).disabled = false));
        }
    };
    $('controls').append(button);
}

(window as any).exp = { mode, syncLoad, rowCount, actions, runAll, results, stats: datasourceStats, getApi: () => api };
