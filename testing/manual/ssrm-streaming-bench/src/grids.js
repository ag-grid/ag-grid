import { Backend, FIXED_COLS, GRAND_TOTAL_KEY, valueColIds } from './backend.js';

const { createGrid, GRAND_TOTAL_ROW_ID, themeQuartz } = window.agGrid;

const theme = themeQuartz.withParams({ spacing: 2, fontSize: 11, headerFontSize: 11 });
const fmt2 = (p) => (typeof p.value === 'number' ? p.value.toFixed(2) : p.value);
const fmtTime = (p) => (p.value == null ? '' : new Date(p.value).toISOString().slice(11, 23));

function columnDefs(cfg) {
    const agg = cfg.group ? 'sum' : undefined;
    return [
        { field: 'id', width: 80 },
        { field: 'arrival', width: 90, valueFormatter: fmtTime, sortable: true },
        {
            field: 'sym',
            width: 70,
            rowGroup: cfg.group,
            hide: cfg.group,
            enableRowGroup: true,
            filter: 'agTextColumnFilter',
        },
        { field: 'qty', width: 70, aggFunc: agg, filter: 'agNumberColumnFilter', sortable: true },
        { field: 'px', width: 80, aggFunc: agg, valueFormatter: fmt2 },
        ...valueColIds(cfg.cols).map((field) => ({ field, width: cfg.colWidth, sortable: false })),
    ];
}

/** One grid, its backend and its live feed. */
export class LiveGrid {
    constructor(el, cfg, metrics, index) {
        this.el = el;
        this.cfg = cfg;
        this.metrics = metrics;
        this.index = index;
        this.backend = new Backend({ total: cfg.total, colCount: cfg.cols, latencyMs: cfg.latency, trim: cfg.trim });
        this.subscribed = new Map();
        this.buffer = [];
        this.paused = false;
        this.timers = [];
        this.defaultOrder = true;
        this.refreshPending = false;
        this.resetStats();

        this.api = createGrid(el, {
            theme,
            columnDefs: columnDefs(cfg),
            defaultColDef: { sortable: false, suppressHeaderMenuButton: true },
            autoGroupColumnDef: { width: 160 },
            rowModelType: 'serverSide',
            serverSideDatasource: { getRows: (p) => this.getRows(p) },
            getRowId: ({ data }) => (data[GRAND_TOTAL_KEY] ? GRAND_TOTAL_ROW_ID : data.id),
            serverSideEnableClientSideSort: false,
            cacheBlockSize: cfg.block,
            maxBlocksInCache: cfg.maxBlocks,
            asyncTransactionWaitMillis: cfg.wait,
            animateRows: cfg.animate,
            rowHeight: cfg.rowHeight,
            headerHeight: cfg.rowHeight + 4,
            rowSelection: { mode: 'multiRow', checkboxes: false, headerCheckbox: false, enableClickSelection: true },
            cellSelection: true,
            grandTotalRow: cfg.group ? 'bottom' : undefined,
            viewSubscription: {
                subscribeRows: (rows) => rows.forEach((r) => this.subscribed.set(r.id, r)),
                unsubscribeRows: (rows) => rows.forEach((r) => this.subscribed.delete(r.id)),
                debounceMs: cfg.subDebounce,
                pauseWhenHidden: true,
            },
            onSortChanged: () => this.onOrderChanged(),
            onFilterChanged: () => this.onOrderChanged(),
            onColumnRowGroupChanged: () => this.onOrderChanged(),
            onVirtualColumnsChanged: () => this.onVirtualColumnsChanged(),
            onFirstDataRendered: () => metrics.attach(this),
        });
        this.onVirtualColumnsChanged();
    }

    resetStats() {
        this.stats = { insertsEmitted: 0, updateTicks: 0, backendMs: 0, refreshInserts: 0, refetches: 0 };
    }

    getRows(params) {
        this.backend.getRows(params.request).then((res) => {
            if (res.unsupported) {
                this.stats.unsupported = res.unsupported;
            }
            params.success(res);
        });
    }

    onOrderChanged() {
        const sorted = this.api.getColumnState().some((c) => c.sort && c.colId !== 'arrival');
        const arrivalAsc = this.api.getColumnState().some((c) => c.colId === 'arrival' && c.sort === 'asc');
        const filtered = Object.keys(this.api.getFilterModel() ?? {}).length > 0;
        this.grouped = this.api.getRowGroupColumns().length > 0;
        this.defaultOrder = !sorted && !arrivalAsc && !filtered;
        if (this.grouped && !this.backend.groups) {
            this.backend.ensureGroups();
        }
    }

    onVirtualColumnsChanged() {
        const ids = this.api.getAllDisplayedVirtualColumns().map((c) => c.getColId());
        const before = this.backend.visibleCols;
        this.backend.setVisibleColumns(ids);
        if (this.cfg.trim && before && ids.some((id) => !before.has(id) && !FIXED_COLS.includes(id))) {
            this.stats.refetches++;
            this.api.refreshServerSide({ purge: false });
        }
    }

    start() {
        this.onOrderChanged();
        if (this.cfg.insertMs > 0) {
            this.timers.push(setInterval(() => this.insertTick(), this.cfg.insertMs));
        }
        if (this.cfg.rate > 0) {
            this.timers.push(setInterval(() => this.updateTick(), 1000 / this.cfg.rate));
        }
    }

    stop() {
        this.timers.forEach(clearInterval);
        this.timers = [];
    }

    insertTick() {
        const t0 = performance.now();
        const { row, droppedId, sym } = this.backend.insert();
        this.stats.backendMs += performance.now() - t0;
        this.stats.insertsEmitted++;
        if (this.grouped) {
            const droppedSym = this.backend.sym(+droppedId);
            const groupKeys = new Set([sym, droppedSym]);
            if (this.api.getRowNode(`g-${sym}`)?.expanded) {
                this.apply({ route: [sym], add: [row], addIndex: 0 }, row.id);
            }
            if (this.api.getRowNode(`g-${droppedSym}`)?.expanded) {
                this.apply({ route: [droppedSym], remove: [{ id: droppedId }] });
            }
            this.applyGroupUpdates(groupKeys);
            return;
        }
        if (!this.defaultOrder) {
            this.stats.refreshInserts++;
            if (!this.refreshPending) {
                this.refreshPending = true;
                setTimeout(() => {
                    this.refreshPending = false;
                    this.api.refreshServerSide({ purge: false });
                }, 1000);
            }
            return;
        }
        this.apply({ add: [row], addIndex: 0, remove: [{ id: droppedId }], rowCount: this.backend.total }, row.id);
    }

    updateTick() {
        const leaves = [...this.subscribed.values()].filter((r) => r.type === 'leaf');
        if (!leaves.length) {
            return;
        }
        const t0 = performance.now();
        const rows = this.backend.update(leaves.map((r) => r.id));
        this.stats.backendMs += performance.now() - t0;
        this.stats.updateTicks++;
        this.metrics.cellUpdatesSent += rows.length * this.metrics.visibleValueCols(this);
        if (!this.grouped) {
            this.apply({ update: rows });
            return;
        }
        const byRoute = new Map();
        for (const r of rows) {
            (byRoute.get(r.sym) ?? byRoute.set(r.sym, []).get(r.sym)).push(r);
        }
        for (const [sym, update] of byRoute) {
            this.apply({ route: [sym], update });
        }
        this.applyGroupUpdates(new Set(byRoute.keys()));
    }

    /** Sends the recalculated group rows and grand total in the same tick as the leaf changes. */
    applyGroupUpdates(syms) {
        const update = [...syms].map((s) => this.backend.groupRow(s));
        update.push(this.backend.grandTotalRow());
        const t = performance.now();
        for (const g of update) {
            const id = g[GRAND_TOTAL_KEY] ? GRAND_TOTAL_ROW_ID : g.id;
            this.metrics.expectAgg(this, id, g.px.toFixed(2), t, id === GRAND_TOTAL_ROW_ID);
        }
        this.apply({ route: [], update });
    }

    apply(tx, insertedId) {
        if (this.paused) {
            this.buffer.push({ tx, insertedId });
            return;
        }
        const t0 = performance.now();
        if (this.cfg.sync) {
            const res = this.api.applyServerSideTransaction(tx);
            this.metrics.txApplied(this, performance.now() - t0, res?.status, insertedId);
        } else {
            this.api.applyServerSideTransactionAsync(tx, (res) =>
                this.metrics.txQueued(this, performance.now() - t0, res?.status, insertedId)
            );
        }
    }

    pause() {
        this.paused = true;
    }

    /** Applies every buffered transaction in order, through the same sync or async path as live updates. */
    resume() {
        this.paused = false;
        const buffered = this.buffer;
        this.buffer = [];
        const t0 = performance.now();
        for (const { tx, insertedId } of buffered) {
            this.apply(tx, insertedId);
        }
        if (!this.cfg.sync) {
            this.api.flushServerSideAsyncTransactions();
        }
        return { applied: buffered.length, ms: Math.round(performance.now() - t0) };
    }

    destroy() {
        this.stop();
        this.api.destroy();
    }
}
