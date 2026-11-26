import { valueColIds } from './backend.js';
import { LiveGrid } from './grids.js';
import { Metrics } from './metrics.js';

const { ModuleRegistry, AllEnterpriseModule } = window.agGrid;

ModuleRegistry.registerModules([AllEnterpriseModule]);

/** Every control, with its default. The page is configured from the URL query so the harness can drive scenarios. */
const CONTROLS = {
    insertMs: { label: 'Insert interval (ms, 0 = off)', value: 75 },
    rate: { label: 'Updates / s per cell (0 = off)', value: 5 },
    changed: { label: 'Value columns changed per update (0 = all)', value: 0 },
    cols: { label: 'Columns', value: 50 },
    colWidth: { label: 'Column width (px)', value: 60 },
    sync: { label: 'Sync transactions', value: false },
    wait: { label: 'asyncTransactionWaitMillis', value: 50 },
    block: { label: 'cacheBlockSize', value: 100 },
    maxBlocks: { label: 'maxBlocksInCache (-1 = unlimited)', value: -1 },
    grids: { label: 'Number of grids', value: 1 },
    live: { label: 'Grids with viewSubscriptionActive (0 = all)', value: 0 },
    gridHeight: { label: 'Grid height (px, 0 = fit the page)', value: 0 },
    latency: { label: 'Backend latency (ms)', value: 20 },
    group: { label: 'Group by sym', value: false },
    total: { label: 'Backend row count', value: 50_000 },
    trim: { label: 'Trim fields to visible columns', value: false },
    animate: { label: 'animateRows', value: false },
    rowHeight: { label: 'Row height (px)', value: 18 },
    subDebounce: { label: 'viewSubscription debounceMs', value: 50 },
    pauseHidden: { label: 'viewSubscription pauseWhenHidden', value: true },
    feed: { label: 'Start live feed', value: true },
};

function readConfig() {
    const q = new URLSearchParams(location.search);
    const cfg = {};
    for (const [key, { value }] of Object.entries(CONTROLS)) {
        const raw = q.get(key);
        cfg[key] = raw == null ? value : typeof value === 'boolean' ? raw === '1' || raw === 'true' : Number(raw);
    }
    return cfg;
}

function renderControls(cfg) {
    const form = document.getElementById('controls');
    for (const [key, { label, value }] of Object.entries(CONTROLS)) {
        const input = document.createElement('input');
        input.name = key;
        input.id = `ctl-${key}`;
        if (typeof value === 'boolean') {
            input.type = 'checkbox';
            input.checked = cfg[key];
        } else {
            input.type = 'number';
            input.value = String(cfg[key]);
        }
        const lbl = document.createElement('label');
        lbl.append(label, input);
        form.append(lbl);
    }
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        for (const key of Object.keys(CONTROLS)) {
            const input = form.elements[key];
            q.set(key, input.type === 'checkbox' ? (input.checked ? '1' : '0') : input.value);
        }
        location.search = q.toString();
    });
}

const cfg = readConfig();
renderControls(cfg);
const version = fetch('/dist/package.json')
    .then((r) => r.json())
    .then((p) => p.version);
version.then((v) => (document.getElementById('version').textContent = `AG Grid ${v}`));

const host = document.getElementById('grids');
const perRow = Math.ceil(Math.sqrt(cfg.grids));
host.style.gridTemplateColumns = `repeat(${perRow}, 1fr)`;
host.style.gridTemplateRows = `repeat(${Math.ceil(cfg.grids / perRow)}, ${cfg.gridHeight > 0 ? `${cfg.gridHeight}px` : '1fr'})`;
if (cfg.gridHeight > 0) {
    // The page grows past the browser window, so the grids below the fold are out of view: what pauseWhenHidden watches.
    document.body.style.height = 'auto';
    host.style.flex = 'none';
}

const metrics = new Metrics(cfg);
const grids = Array.from({ length: cfg.grids }, (_, i) => {
    const el = document.createElement('div');
    el.className = 'grid';
    host.append(el);
    return new LiveGrid(el, cfg, metrics, i);
});

const ready = new Promise((resolve) => {
    const poll = setInterval(() => {
        if (metrics.trackers.size === grids.length) {
            clearInterval(poll);
            resolve();
        }
    }, 50);
});

ready.then(() => {
    if (cfg.feed) {
        grids.forEach((g) => g.start());
    }
    metrics.reset();
});

const overlay = document.getElementById('overlay');
setInterval(() => {
    const s = metrics.snapshot();
    const g = s.grids[0] ?? {};
    overlay.textContent = [
        `fps ${s.fps}  max frame ${s.frameMs.max ?? '-'} ms  long frames ${s.longFrames}`,
        `inserts/s ${g.insertsAppliedPerS ?? '-'}  cell updates sent/s ${s.cellUpdatesSentPerS}`,
        `content refresh/s ${g.contentRefreshPerS ?? '-'}  per-cell rendered/s p50 ${g.perCellRenderedRate?.p50 ?? '-'}`,
        `tx sync p95 ${g.txSyncApplyMs?.p95 ?? '-'} ms  async queue p95 ${g.txAsyncQueueMs?.p95 ?? '-'} ms`,
        `DOM rows +${g.domRowsAddedPerS ?? '-'}/s -${g.domRowsRemovedPerS ?? '-'}/s  row-id re-keys ${g.rowIdAttributeChanges ?? '-'}`,
        `loaded nodes ${s.loadedNodes.last ?? '-'}  subscribed ${g.subscribedRows ?? '-'}  visible ${g.rows ?? '-'}x${g.cols ?? '-'}`,
        selectionText,
    ].join('\n');
}, 1000);

let selection = null;
let selectionText = '';

function renderedRows(grid, colIds) {
    return [...grid.el.querySelectorAll('.ag-grid-scrolling-rows .ag-row[row-id]')]
        .map((el) => ({
            index: +el.getAttribute('row-index'),
            id: el.getAttribute('row-id'),
            ...Object.fromEntries(colIds.map((c) => [c, el.querySelector(`[col-id="${c}"]`)?.textContent])),
        }))
        .sort((a, b) => a.index - b.index);
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function until(fn, timeoutMs = 8000) {
    const end = performance.now() + timeoutMs;
    while (performance.now() < end) {
        const v = fn();
        if (v) {
            return v;
        }
        await sleep(50);
    }
    return null;
}

function selectRows(from = 5, to = 9) {
    const { api } = grids[0];
    const nodes = [];
    for (let i = from; i <= to; i++) {
        nodes.push(api.getDisplayedRowAtIndex(i));
    }
    api.setNodesSelected({ nodes, newValue: true });
    api.clearCellSelection();
    api.addCellRange({ rowStartIndex: from, rowEndIndex: to, columnStart: 'c0', columnEnd: 'c3' });
    selection = { ids: nodes.map((n) => n.id), indexes: nodes.map((n) => n.rowIndex) };
    selectionText = `selected ${selection.ids.join(',')}`;
    return selection;
}

const r1 = (n) => Math.round(n * 10) / 10;

/** The workaround for index-based ranges: re-create the range from the selected row ids' current indexes. */
function restoreRange() {
    const { api } = grids[0];
    const t0 = performance.now();
    const indexes = selection.ids.map((id) => api.getRowNode(id)?.rowIndex).filter((i) => i != null);
    api.clearCellSelection();
    if (indexes.length) {
        api.addCellRange({
            rowStartIndex: Math.min(...indexes),
            rowEndIndex: Math.max(...indexes),
            columnStart: 'c0',
            columnEnd: 'c3',
        });
    }
    return { ms: r1(performance.now() - t0) };
}

function checkSelection() {
    const { api } = grids[0];
    const rows = selection.ids.map((id) => {
        const node = api.getRowNode(id);
        return { id, selected: !!node?.isSelected(), index: node?.rowIndex ?? null };
    });
    const state = api.getServerSideSelectionState();
    const range = api.getCellRanges()?.[0];
    const rangeIds = [];
    if (range) {
        const a = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
        const b = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
        for (let i = a; i <= b; i++) {
            rangeIds.push(api.getDisplayedRowAtIndex(i)?.id ?? null);
        }
    }
    const result = {
        before: selection,
        rows,
        allRowsStillSelected: rows.every((r) => r.selected),
        selectionStateIds: [...(state?.toggledNodes ?? [])].filter((id) => selection.ids.includes(id)).length,
        rangeRowIdsAfter: rangeIds,
        rangeStillCoversSameRows: JSON.stringify(rangeIds) === JSON.stringify(selection.ids),
    };
    selectionText = `selection kept ${result.allRowsStillSelected}, range follows rows ${result.rangeStillCoversSameRows}`;
    return result;
}

/** Scrolls to a row index and checks the rendered rows are the backend's rows for those indexes (feed off). */
async function scrollCheck(index) {
    const grid = grids[0];
    grid.api.ensureIndexVisible(index, 'top');
    const ok = await until(() => {
        const rows = renderedRows(grid, []).filter((r) => Math.abs(r.index - index) < 20);
        return rows.length > 5 && rows.every((r) => /^\d+$/.test(r.id)) ? rows : null;
    });
    await nextFrame();
    const rows = renderedRows(grid, []).filter((r) => /^\d+$/.test(r.id));
    const mismatches = rows.filter((r) => +r.id !== grid.backend.headId - r.index).length;
    const vp = grid.el.querySelector('.ag-grid-viewport');
    return {
        index,
        loaded: !!ok,
        renderedRows: rows.length,
        firstIndex: rows[0]?.index ?? null,
        lastIndex: rows.at(-1)?.index ?? null,
        mismatches,
        displayedRowCount: grid.api.getDisplayedRowCount(),
        scrollHeight: vp.scrollHeight,
        unstretchedHeight: grid.backend.total * cfg.rowHeight,
    };
}

/** Rendered leaf rows, by row index, are exactly the backend's rows for that sort and filter. */
function matchesBackend(grid, sortModel, filterModel) {
    const rows = renderedRows(grid, []).filter((r) => /^\d+$/.test(r.id));
    if (rows.length < 5) {
        return null;
    }
    const request = {
        startRow: 0,
        endRow: rows.at(-1).index + 1,
        rowGroupCols: [],
        groupKeys: [],
        sortModel,
        filterModel,
    };
    const expected = grid.backend.query(request).rowData;
    return rows.every((r) => expected[r.index]?.id === r.id) ? rows : null;
}

/** Header sort, number + text filters and grouping, each checked against what the backend received and rendered. */
async function serverOpsTest() {
    const grid = grids[0];
    const { api, backend } = grid;
    const out = {};
    const before = renderedRows(grid, ['qty']).map((r) => r.id);
    const reqs = backend.requests.length;

    grid.el.querySelector('.ag-header-cell[col-id="qty"] .ag-header-cell-label').click();
    let reorderedLocally = false;
    const responseDue = performance.now() + cfg.latency - 50;
    while (performance.now() < responseDue) {
        await nextFrame();
        const ids = renderedRows(grid, []).map((r) => r.id);
        const sameSet = ids.length === before.length && ids.every((id) => before.includes(id));
        reorderedLocally ||= sameSet && JSON.stringify(ids) !== JSON.stringify(before);
    }
    out.sort = { renderedBeforeResponse: reorderedLocally ? 'reordered locally' : 'unchanged or loading' };
    const byQty = [{ colId: 'qty', sort: 'asc' }];
    const sorted = await until(() => matchesBackend(grid, byQty, {}));
    out.sort.backendReceived = backend.requests.slice(reqs).map((r) => r.sortModel);
    out.sort.renderedInBackendOrder = !!sorted;

    const reqs2 = backend.requests.length;
    api.setFilterModel({ qty: { filterType: 'number', type: 'greaterThan', filter: 900 } });
    const filtered = await until(() => matchesBackend(grid, byQty, api.getFilterModel()));
    out.numberFilter = {
        backendReceived: backend.requests.slice(reqs2).map((r) => r.filterModel),
        renderedMatches: !!filtered,
    };

    const reqs3 = backend.requests.length;
    api.setFilterModel({ sym: { filterType: 'text', type: 'equals', filter: 'SYM07' } });
    const textFiltered = await until(() => matchesBackend(grid, byQty, api.getFilterModel()));
    out.textFilter = {
        backendReceived: backend.requests.slice(reqs3).map((r) => r.filterModel),
        renderedMatches: !!textFiltered,
    };

    const reqs4 = backend.requests.length;
    api.setFilterModel(null);
    api.applyColumnState({ defaultState: { sort: null } });
    api.setRowGroupColumns(['sym']);
    const grouped = await until(() => {
        const rows = renderedRows(grid, []);
        return rows.length > 5 && rows.every((r) => r.id.startsWith('g-')) ? rows : null;
    });
    out.group = {
        backendReceived: backend.requests.slice(reqs4).map((r) => r.rowGroupCols),
        renderedGroupRows: grouped?.length ?? 0,
    };
    out.serverSideEnableClientSideSort = api.getGridOption('serverSideEnableClientSideSort');
    return out;
}

/** Sorts (and optionally filters) through the grid API, then waits until the backend's rows are on screen. */
async function applyOrder(sortModel, filterModel) {
    const grid = grids[0];
    grid.api.applyColumnState({ state: sortModel, defaultState: { sort: null } });
    if (filterModel) {
        grid.api.setFilterModel(filterModel);
    }
    await sleep(500);
    const shown = await until(() => renderedRows(grid, []).filter((r) => /^\d+$/.test(r.id)).length > 5);
    return { sortModel: grid.order().sortModel, filterModel: grid.order().filterModel, loaded: !!shown };
}

/** Expands the first n groups, then reports how many group rows are loaded. */
async function expandGroups(n) {
    const { api } = grids[0];
    const groups = await until(() => {
        const nodes = [];
        api.forEachNode((node) => node.group && node.level === 0 && nodes.push(node));
        return nodes.length >= n ? nodes : null;
    });
    groups?.slice(0, n).forEach((node) => node.setExpanded(true));
    await sleep(1000);
    return groups?.length ?? 0;
}

async function horizontalScrollCheck() {
    const grid = grids[0];
    const refetchesBefore = grid.stats.refetches;
    const valueCols = valueColIds(cfg.cols);
    grid.api.ensureColumnVisible(valueCols[Math.floor(valueCols.length / 2)], 'start');
    await nextFrame();
    await nextFrame();
    const count = () => {
        let blank = 0;
        let total = 0;
        for (const cell of grid.el.querySelectorAll('.ag-grid-scrolling-rows .ag-row[row-id] .ag-cell')) {
            if (/^c\d+$/.test(cell.getAttribute('col-id'))) {
                total++;
                blank += cell.textContent === '' ? 1 : 0;
            }
        }
        return { blank, total };
    };
    const immediately = count();
    const t0 = performance.now();
    const filled = await until(() => count().blank === 0, 5000);
    return {
        immediately,
        msUntilNoBlankCells: filled ? Math.round(performance.now() - t0) : null,
        refetches: grid.stats.refetches - refetchesBefore,
    };
}

window.__bench = {
    ready,
    version,
    config: () => ({ ...cfg }),
    snapshot: () => metrics.snapshot(),
    reset: () => metrics.reset(),
    pause: () => grids.forEach((g) => g.pause()),
    resume: () => grids.map((g) => g.resume()),
    stopFeed: () => grids.forEach((g) => g.stop()),
    requests: () => grids[0].backend.requests,
    bytesPerRow: () =>
        grids.map((g) => (g.backend.rowsSent ? Math.round(g.backend.bytesSent / g.backend.rowsSent) : null)),
    selectRows,
    checkSelection,
    restoreRange,
    applyOrder,
    scrollCheck,
    serverOpsTest,
    expandGroups,
    horizontalScrollCheck,
};

document.getElementById('pause').addEventListener('click', () => window.__bench.pause());
document.getElementById('resume').addEventListener('click', () => {
    window.__bench.resume();
    if (selection) {
        setTimeout(checkSelection, 500);
    }
});
document.getElementById('select').addEventListener('click', () => selectRows());
