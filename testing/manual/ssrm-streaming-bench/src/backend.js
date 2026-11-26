// In-browser mock of a trading-desk backend. Every sort, filter, grouping and aggregation happens here;
// the grid only renders what it is sent.

export const SYMBOLS = Array.from({ length: 50 }, (_, i) => `SYM${String(i).padStart(2, '0')}`);
export const FIXED_COLS = ['id', 'arrival', 'sym', 'qty', 'px'];
export const GRAND_TOTAL_KEY = '__grandTotal';

const MAX_MATERIALISE = 200_000;
const MAX_AGGREGATE = 2_000_000;
const ARRIVAL_EPOCH = Date.UTC(2026, 0, 1);

function hash(a, b, c) {
    let h = Math.imul(a, 0x9e3779b1) ^ Math.imul(b + 0x632be5ab, 0x85ebca77) ^ Math.imul(c + 0x27d4eb2f, 0xc2b2ae3d);
    h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
    h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
    return (h ^ (h >>> 16)) >>> 0;
}

export function valueColIds(colCount) {
    return Array.from({ length: Math.max(0, colCount - FIXED_COLS.length) }, (_, i) => `c${i}`);
}

export class Backend {
    constructor({ total, colCount, latencyMs, trim, changedCols = 0 }) {
        this.total = total;
        this.colIds = valueColIds(colCount);
        this.latencyMs = latencyMs;
        this.trim = trim;
        this.changedCols = changedCols;
        this.headId = total;
        this.versions = new Map();
        this.visibleCols = null;
        this.groups = null;
        this.requests = [];
        this.bytesSent = 0;
        this.rowsSent = 0;
    }

    get oldestId() {
        return this.headId - this.total + 1;
    }

    sym(id) {
        return SYMBOLS[hash(id, 1, 0) % SYMBOLS.length];
    }

    qty(id) {
        return 1 + (hash(id, 2, 0) % 1000);
    }

    px(id, version) {
        return 100 + (hash(id, 3, version) % 10_000) / 100;
    }

    row(id) {
        const version = this.versions.get(id) ?? 0;
        const data = {
            id: String(id),
            arrival: ARRIVAL_EPOCH + id * 75,
            sym: this.sym(id),
            qty: this.qty(id),
            px: this.px(id, version),
        };
        const cols = this.trim && this.visibleCols ? this.colIds.filter((c) => this.visibleCols.has(c)) : this.colIds;
        for (const col of cols) {
            const n = +col.slice(1);
            // With `changedCols` set, an update changes only the first that many value columns; the rest keep version 0.
            const v = this.changedCols > 0 && n >= this.changedCols ? 0 : version;
            data[col] = hash(id, 10 + n, v) % 100_000;
        }
        return data;
    }

    setVisibleColumns(colIds) {
        this.visibleCols = new Set(colIds);
    }

    ensureGroups() {
        if (this.groups || this.total > MAX_AGGREGATE) {
            return this.groups;
        }
        this.groups = new Map(SYMBOLS.map((s) => [s, { count: 0, qty: 0, px: 0 }]));
        for (let id = this.oldestId; id <= this.headId; id++) {
            this.addToGroup(id, 1);
        }
        return this.groups;
    }

    addToGroup(id, sign) {
        const g = this.groups.get(this.sym(id));
        g.count += sign;
        g.qty += sign * this.qty(id);
        g.px += sign * this.px(id, this.versions.get(id) ?? 0);
    }

    groupRow(sym) {
        const g = this.groups.get(sym);
        return { id: `g-${sym}`, sym, qty: g.qty, px: round2(g.px), childCount: g.count };
    }

    grandTotalRow() {
        let qty = 0;
        let px = 0;
        for (const g of this.groups.values()) {
            qty += g.qty;
            px += g.px;
        }
        return { [GRAND_TOTAL_KEY]: true, qty, px: round2(px) };
    }

    /** Appends the newest row and drops the oldest, keeping the total fixed. */
    insert() {
        const droppedId = this.oldestId;
        if (this.groups) {
            this.addToGroup(droppedId, -1);
        }
        this.versions.delete(droppedId);
        this.headId++;
        if (this.groups) {
            this.addToGroup(this.headId, 1);
        }
        return { row: this.row(this.headId), droppedId: String(droppedId), sym: this.sym(this.headId) };
    }

    /** Bumps the version of each live id, so `px` and every value column (or the first `changedCols`) change. */
    update(ids) {
        const rows = [];
        for (const idStr of ids) {
            const id = +idStr;
            if (id < this.oldestId || id > this.headId) {
                continue;
            }
            if (this.groups) {
                this.addToGroup(id, -1);
            }
            this.versions.set(id, (this.versions.get(id) ?? 0) + 1);
            if (this.groups) {
                this.addToGroup(id, 1);
            }
            rows.push(this.row(id));
        }
        return rows;
    }

    getRows(request) {
        const t0 = performance.now();
        const result = this.query(request);
        const bytes = result.rowData.reduce((n, r) => n + JSON.stringify(r).length, 0);
        this.bytesSent += bytes;
        this.rowsSent += result.rowData.length;
        this.requests.push({
            at: t0,
            startRow: request.startRow,
            endRow: request.endRow,
            sortModel: request.sortModel,
            filterModel: request.filterModel,
            rowGroupCols: request.rowGroupCols.map((c) => c.id),
            groupKeys: request.groupKeys,
            rows: result.rowData.length,
            bytes,
            computeMs: performance.now() - t0,
            truncated: result.truncated ?? false,
        });
        return new Promise((resolve) => setTimeout(() => resolve(result), this.latencyMs));
    }

    query(request) {
        const { startRow, endRow, rowGroupCols, groupKeys, sortModel, filterModel } = request;
        const grouped = rowGroupCols.length > 0;
        const hasFilter = filterModel && Object.keys(filterModel).length > 0;

        if (grouped && groupKeys.length === 0) {
            if (!this.ensureGroups() || hasFilter) {
                return { rowData: [], rowCount: 0, unsupported: 'grouping needs total <= 2m rows and no filter' };
            }
            const keys = [...SYMBOLS].filter((s) => this.groups.get(s).count > 0);
            const sort = sortModel.find((s) => s.colId === 'sym' || s.colId === 'ag-Grid-AutoColumn');
            if (sort?.sort === 'desc') {
                keys.reverse();
            }
            const rowData = keys.slice(startRow, endRow).map((s) => this.groupRow(s));
            const res = { rowData, rowCount: keys.length };
            if (request.needsGrandTotal) {
                res.grandTotalData = this.grandTotalRow();
            }
            return res;
        }

        const sort = sortModel.find((s) => s.colId !== 'ag-Grid-AutoColumn');
        const arrivalOrder = !sort || sort.colId === 'arrival' || sort.colId === 'id';
        const desc = !sort || sort.sort === 'desc';

        if (!grouped && !hasFilter && arrivalOrder) {
            const end = Math.min(endRow, this.total);
            const rowData = [];
            for (let i = startRow; i < end; i++) {
                rowData.push(this.row(desc ? this.headId - i : this.oldestId + i));
            }
            return { rowData, rowCount: this.total };
        }

        const { ids, truncated } = this.materialise(grouped ? groupKeys[0] : null, filterModel);
        if (!arrivalOrder) {
            const key = sort.colId;
            const dir = desc ? -1 : 1;
            const valueOf = (id) => (key === 'sym' ? this.sym(id) : key === 'qty' ? this.qty(id) : this.row(id)[key]);
            const values = new Map(ids.map((id) => [id, valueOf(id)]));
            ids.sort((a, b) => (values.get(a) < values.get(b) ? -dir : values.get(a) > values.get(b) ? dir : b - a));
        } else if (!desc) {
            ids.reverse();
        }
        return {
            rowData: ids.slice(startRow, endRow).map((id) => this.row(id)),
            rowCount: ids.length,
            truncated,
        };
    }

    /** Newest-first ids matching the group key and filter, capped at MAX_MATERIALISE scanned rows. */
    materialise(groupKey, filterModel) {
        const ids = [];
        const floor = Math.max(this.oldestId, this.headId - MAX_MATERIALISE + 1);
        for (let id = this.headId; id >= floor; id--) {
            if ((groupKey == null || this.sym(id) === groupKey) && this.passesFilter(id, filterModel)) {
                ids.push(id);
            }
        }
        return { ids, truncated: floor > this.oldestId };
    }

    passesFilter(id, filterModel) {
        for (const [colId, model] of Object.entries(filterModel ?? {})) {
            if (colId === 'qty' && !numberMatches(this.qty(id), model)) {
                return false;
            }
            if (colId === 'sym' && !textMatches(this.sym(id), model)) {
                return false;
            }
        }
        return true;
    }
}

function numberMatches(v, { type, filter, filterTo }) {
    switch (type) {
        case 'equals':
            return v === filter;
        case 'greaterThan':
            return v > filter;
        case 'lessThan':
            return v < filter;
        case 'inRange':
            return v >= filter && v <= filterTo;
        default:
            return true;
    }
}

function textMatches(v, { type, filter }) {
    const s = v.toLowerCase();
    const f = String(filter ?? '').toLowerCase();
    switch (type) {
        case 'equals':
            return s === f;
        case 'startsWith':
            return s.startsWith(f);
        case 'contains':
            return s.includes(f);
        default:
            return true;
    }
}

function round2(n) {
    return Math.round(n * 100) / 100;
}
