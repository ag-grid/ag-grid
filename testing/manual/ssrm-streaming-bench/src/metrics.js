// Measures what the browser actually rendered, not what was sent: cell text sampled per frame by row id + col id,
// DOM row element churn in the centre container, frame timing and transaction timing.
import { valueColIds } from './backend.js';

const LONG_FRAME_MS = 50;

function stats(values) {
    if (!values.length) {
        return { n: 0 };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
    const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;
    return { n: sorted.length, avg: r2(avg), p50: r2(at(0.5)), p95: r2(at(0.95)), max: r2(sorted[sorted.length - 1]) };
}

function r2(n) {
    return Math.round(n * 100) / 100;
}

class GridTracker {
    constructor(grid, sampleCols) {
        this.grid = grid;
        this.root = grid.el;
        this.centre = this.root.querySelector('.ag-grid-scrolling-rows .ag-grid-scrolling-container');
        this.viewport = this.root.querySelector('.ag-grid-viewport');
        this.header = this.root.querySelector('.ag-header');
        this.sampleCols = sampleCols;
        this.observer = new MutationObserver((records) => this.onMutations(records));
        this.observer.observe(this.centre, {
            childList: true,
            subtree: true,
            attributeFilter: ['row-id'],
            attributeOldValue: true,
        });
        this.reset();
    }

    reset() {
        this.cells = new Map();
        this.rows = new Map();
        this.refreshFrames = 0;
        this.added = 0;
        this.removed = 0;
        this.rowIdChanges = 0;
        this.orderChecks = 0;
        this.orderMismatches = 0;
        this.pendingHeads = [];
        this.headLag = [];
        this.pendingAgg = new Map();
        this.aggLag = { group: [], total: [] };
        this.aggSuperseded = 0;
        this.txSync = [];
        this.txQueue = [];
        this.statuses = {};
        this.insertsApplied = 0;
    }

    onMutations(records) {
        for (const rec of records) {
            if (rec.type === 'attributes') {
                if (rec.target.classList.contains('ag-row') && rec.oldValue !== null) {
                    this.rowIdChanges++;
                }
                continue;
            }
            if (rec.target !== this.centre) {
                continue;
            }
            for (const n of rec.addedNodes) {
                this.added += n.classList?.contains('ag-row') ? 1 : 0;
            }
            for (const n of rec.removedNodes) {
                this.removed += n.classList?.contains('ag-row') ? 1 : 0;
            }
        }
    }

    sampleFrame(now, checkOrder) {
        let changed = false;
        const ordered = checkOrder ? [] : null;
        const { top, bottom } = this.visibleBand();
        for (const rowEl of this.centre.children) {
            const rowId = rowEl.getAttribute('row-id');
            if (!rowId || rowEl.classList.contains('ag-opacity-zero')) {
                continue;
            }
            if (ordered && /^\d+$/.test(rowId)) {
                ordered.push([+rowEl.getAttribute('row-index'), +rowId]);
            }
            const rect = rowEl.getBoundingClientRect();
            if (rect.top < top - 1 || rect.bottom > bottom + 1) {
                continue;
            }
            let rowChanged = false;
            for (const col of this.sampleCols) {
                const cell = rowEl.querySelector(`[col-id="${col}"]`);
                if (!cell) {
                    continue;
                }
                const key = `${rowId}|${col}`;
                const text = cell.textContent;
                const entry = this.cells.get(key);
                if (!entry) {
                    this.cells.set(key, { text, first: now, last: now, changes: 0 });
                } else {
                    entry.last = now;
                    if (entry.text !== text) {
                        entry.text = text;
                        entry.changes++;
                        rowChanged = true;
                    }
                }
            }
            const row = this.rows.get(rowId);
            if (!row) {
                this.rows.set(rowId, { first: now, last: now, changes: 0 });
            } else {
                row.last = now;
                row.changes += rowChanged ? 1 : 0;
            }
            changed ||= rowChanged;
        }
        if (changed) {
            this.refreshFrames++;
        }
        if (ordered?.length) {
            this.orderChecks++;
            const k = ordered[0][0] + ordered[0][1];
            if (ordered.some(([idx, id]) => idx + id !== k)) {
                this.orderMismatches++;
            }
        }
        const settled = performance.now();
        this.resolveHeads(settled);
        this.resolveAgg(settled);
    }

    resolveHeads(now) {
        if (!this.pendingHeads.length) {
            return;
        }
        const top = this.centre.querySelector('.ag-row[row-index="0"]')?.getAttribute('row-id');
        if (!top) {
            return;
        }
        const topId = +top;
        while (this.pendingHeads.length && this.pendingHeads[0].id <= topId) {
            this.headLag.push(now - this.pendingHeads.shift().t);
        }
    }

    /** Each expected value's lag runs until it, or a later value for the same row, is on screen. */
    resolveAgg(now) {
        for (const [rowId, queue] of this.pendingAgg) {
            const cell = this.root.querySelector(`.ag-row[row-id="${rowId}"] [col-id="px"]`);
            if (!cell) {
                this.pendingAgg.delete(rowId);
                continue;
            }
            const shown = queue.findLastIndex((p) => p.text === cell.textContent);
            for (const p of queue.splice(0, shown + 1)) {
                this.aggLag[p.total ? 'total' : 'group'].push(now - p.t);
            }
            this.aggSuperseded += Math.max(0, shown);
        }
    }

    /** Rows wholly between the header and the bottom of the viewport; rendered buffer rows outside it are not in view. */
    visibleBand() {
        return {
            top: this.header.getBoundingClientRect().bottom,
            bottom: this.viewport.getBoundingClientRect().bottom,
        };
    }

    visibleCounts() {
        const vp = this.viewport.getBoundingClientRect();
        const { top, bottom } = this.visibleBand();
        let rows = 0;
        for (const rowEl of this.centre.children) {
            const r = rowEl.getBoundingClientRect();
            rows += r.top >= top - 1 && r.bottom <= bottom + 1 && r.height > 0 ? 1 : 0;
        }
        let cols = 0;
        for (const h of this.header.querySelectorAll('.ag-header-row-column .ag-header-cell')) {
            const r = h.getBoundingClientRect();
            cols += r.left >= vp.left - 1 && r.right <= vp.right + 1 && r.width > 0 ? 1 : 0;
        }
        return { rows, cols };
    }

    summary(seconds) {
        const cellRates = [];
        for (const c of this.cells.values()) {
            const span = (c.last - c.first) / 1000;
            if (span >= 1) {
                cellRates.push(c.changes / span);
            }
        }
        let rowsObserved = 0;
        let rowsAtLeast1 = 0;
        for (const r of this.rows.values()) {
            const span = (r.last - r.first) / 1000;
            if (span >= 2) {
                rowsObserved++;
                rowsAtLeast1 += r.changes / span >= 1 ? 1 : 0;
            }
        }
        const cellStats = stats(cellRates);
        const sortedRates = [...cellRates].sort((a, b) => a - b);
        return {
            contentRefreshPerS: r2(this.refreshFrames / seconds),
            perCellRenderedRate: { ...cellStats, p10: r2(sortedRates[Math.floor(0.1 * sortedRates.length)] ?? 0) },
            rowsObserved,
            pctRowsChangedAtLeast1PerS: rowsObserved ? r2((100 * rowsAtLeast1) / rowsObserved) : null,
            domRowsAddedPerS: r2(this.added / seconds),
            domRowsRemovedPerS: r2(this.removed / seconds),
            rowIdAttributeChanges: this.rowIdChanges,
            insertsAppliedPerS: r2(this.insertsApplied / seconds),
            orderChecks: this.orderChecks,
            orderMismatches: this.orderMismatches,
            headRenderLagMs: stats(this.headLag),
            aggLagMs: {
                group: stats(this.aggLag.group),
                total: stats(this.aggLag.total),
                superseded: this.aggSuperseded,
            },
            txSyncApplyMs: stats(this.txSync),
            txAsyncQueueMs: stats(this.txQueue),
            txStatuses: this.statuses,
            subscribedRows: this.grid.subscribed.size,
            ...this.visibleCounts(),
            feed: {
                ...this.grid.stats,
                backendMs: r2(this.grid.stats.backendMs),
                insertsEmittedPerS: r2(this.grid.stats.insertsEmitted / seconds),
                updateTicksPerS: r2(this.grid.stats.updateTicks / seconds),
                backendMsPerS: r2(this.grid.stats.backendMs / seconds),
            },
        };
    }
}

export class Metrics {
    constructor(cfg) {
        this.cfg = cfg;
        this.trackers = new Map();
        this.cellUpdatesSent = 0;
        this.reset();
        new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
                this.longTasks++;
                this.longTaskMs += e.duration;
            }
        }).observe({ entryTypes: ['longtask'] });
        requestAnimationFrame((t) => this.frame(t));
    }

    reset() {
        this.startedAt = performance.now();
        this.frames = [];
        this.lastFrame = null;
        this.longTasks = 0;
        this.longTaskMs = 0;
        this.cellUpdatesSent = 0;
        this.nodeCounts = [];
        this.frameNo = 0;
        this.trackers.forEach((t) => {
            t.reset();
            t.grid.resetStats();
        });
    }

    attach(grid) {
        const sampleCols = this.sampleColsFor(grid);
        this.trackers.set(grid.index, new GridTracker(grid, sampleCols));
    }

    sampleColsFor(grid) {
        const valueCols = valueColIds(grid.cfg.cols).length;
        if (this.cfg.grids > 1) {
            return valueCols ? ['c0'] : ['px'];
        }
        const picks = [0, 1, 10, 25, 44].filter((i) => i < valueCols).map((i) => `c${i}`);
        return grid.cfg.group ? ['px', ...picks.slice(0, 2)] : picks;
    }

    visibleValueCols(grid) {
        const vis = grid.backend.visibleCols;
        return vis ? [...vis].filter((c) => /^c\d+$/.test(c)).length : 0;
    }

    frame(now) {
        if (this.lastFrame != null) {
            this.frames.push(now - this.lastFrame);
        }
        this.lastFrame = now;
        this.frameNo++;
        const checkOrder = this.frameNo % 15 === 0;
        for (const t of this.trackers.values()) {
            t.sampleFrame(now, checkOrder && !t.grid.grouped && t.grid.defaultOrder);
        }
        if (this.frameNo % 60 === 0) {
            const g = [...this.trackers.values()][0]?.grid;
            if (g) {
                let n = 0;
                g.api.forEachNode(() => n++);
                this.nodeCounts.push({ t: now, n });
            }
        }
        requestAnimationFrame((t) => this.frame(t));
    }

    txApplied(grid, ms, status, insertedId) {
        const t = this.trackers.get(grid.index);
        if (!t) {
            return;
        }
        if (ms != null) {
            t.txSync.push(ms);
        }
        this.onApplied(t, status, insertedId);
    }

    txQueued(grid, ms, status, insertedId) {
        const t = this.trackers.get(grid.index);
        if (!t) {
            return;
        }
        t.txQueue.push(ms);
        this.onApplied(t, status, insertedId);
    }

    onApplied(t, status, insertedId) {
        t.statuses[status] = (t.statuses[status] ?? 0) + 1;
        if (insertedId != null && status === 'Applied') {
            t.insertsApplied++;
            if (!t.grid.grouped) {
                t.pendingHeads.push({ id: +insertedId, t: performance.now() });
            }
        }
    }

    expectAgg(grid, rowId, text, t, total) {
        const tracker = this.trackers.get(grid.index);
        if (!tracker) {
            return;
        }
        const queue = tracker.pendingAgg.get(rowId) ?? tracker.pendingAgg.set(rowId, []).get(rowId);
        queue.push({ text, t, total });
    }

    snapshot() {
        const now = performance.now();
        const seconds = (now - this.startedAt) / 1000;
        const frameStats = stats(this.frames);
        const nodes = this.nodeCounts;
        const tail = nodes.slice(Math.floor(nodes.length / 2));
        const slope = tail.length >= 2 ? r2((tail.at(-1).n - tail[0].n) / ((tail.at(-1).t - tail[0].t) / 1000)) : null;
        const grids = [...this.trackers.values()].map((t) => t.summary(seconds));
        return {
            seconds: r2(seconds),
            fps: r2(this.frames.length / seconds),
            frameMs: frameStats,
            longFrames: this.frames.filter((f) => f > LONG_FRAME_MS).length,
            framesOver1000ms: this.frames.filter((f) => f > 1000).length,
            longTasks: this.longTasks,
            longTaskMs: r2(this.longTaskMs),
            cellUpdatesSentPerS: r2(this.cellUpdatesSent / seconds),
            loadedNodes: {
                first: nodes[0]?.n ?? null,
                last: nodes.at(-1)?.n ?? null,
                max: Math.max(0, ...nodes.map((x) => x.n)),
                slopePerSSecondHalf: slope,
            },
            gridsAttached: grids.length,
            grids,
        };
    }
}
