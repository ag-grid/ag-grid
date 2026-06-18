import type {
    AgColumn,
    BeanCollection,
    ColAggFunc,
    ColKey,
    ColumnEventType,
    ColumnState,
    ColumnStateParams,
    IAggFuncService,
    IValueColsService,
    NamedBean,
} from 'ag-grid-community';
import { _warn } from 'ag-grid-community';

import { BaseColsService } from '../columns/baseColsService';

export class ValueColsSvc extends BaseColsService implements NamedBean, IValueColsService {
    beanName = 'valueColsSvc' as const;
    protected override eventName = 'columnValueChanged' as const;
    private aggFuncSvc?: IAggFuncService;

    public override wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.aggFuncSvc = beans.aggFuncSvc;
    }

    /** Value cols are included from a truthy aggFunc; `undefined` falls back to `initialAggFunc`
     *  (new cols) or the current flag (existing). Ordering is driven by `valueIndex`/`initialValueIndex`. */
    public override extractCol(col: AgColumn, colIsNew: boolean): void {
        const colDef = col.colDef;
        const aggFunc = colDef.aggFunc;
        let include: boolean;
        if (aggFunc !== undefined) {
            include = aggFunc !== null && aggFunc !== '';
        } else if (colIsNew) {
            const initial = colDef.initialAggFunc;
            include = initial != null && initial !== '';
        } else {
            // At extract time the flag still mirrors the prior active state — read it directly.
            include = col.aggregationActive;
        }
        if (!include) {
            // Promote a column whose active "Show Values As" mode needs an aggregated total (e.g. % of grand
            // total) to a value column, using the mode's `defaultAggFunc`.
            const modeAggFunc = col.showValueAs?.def.defaultAggFunc;
            if (modeAggFunc) {
                this.bucketCol(col, colIsNew);
                if (!col.aggFunc) {
                    this.writeAggFunc(col, modeAggFunc);
                }
            }
            return;
        }
        this.bucketCol(col, colIsNew);
        if (aggFunc != null && aggFunc !== '') {
            this.writeAggFunc(col, aggFunc);
        } else if (!col.aggFunc) {
            this.writeAggFunc(col, colDef.initialAggFunc);
        }
    }

    /** Seat an included value col: indexed (`valueIndex`, or `initialValueIndex` for new cols) cols are
     *  sorted by `commitExtract`; the rest keep their prior/col-def order. */
    private bucketCol(col: AgColumn, colIsNew: boolean): void {
        const colDef = col.colDef;
        const key = colDef.valueIndex ?? (colIsNew ? colDef.initialValueIndex : null);
        if (key != null) {
            this.extractAddColWithIndex(col, key);
        } else {
            this.extractAddColWithValue(col);
        }
    }

    // Imperative-only (the base gates on `runSideEffects`); the state/agg-func paths set the func explicitly.
    protected override onColActiveChanged(column: AgColumn, active: boolean): void {
        // A newly-active col with no agg-func picks up the default for its cell-data type.
        const aggFuncSvc = this.aggFuncSvc;
        if (active && aggFuncSvc && !column.aggFunc) {
            this.writeAggFunc(column, aggFuncSvc.getDefaultAggFunc(column));
        }
    }

    protected override writeColActive(col: AgColumn, active: boolean, source: ColumnEventType): boolean {
        if (col.aggregationActive === active) {
            return false;
        }
        col.aggregationActive = active;
        col.dispatchColEvent(this.eventName, source);
        return true;
    }

    public setColumnAggFunc(key: ColKey | undefined, aggFunc: ColAggFunc, source: ColumnEventType): void {
        if (key) {
            const column = this.colModel.getNonPivotCol(key);
            if (column && this.applyAggFunc(column, aggFunc, source)) {
                // aggFunc/activation only — stage + flush without a refresh; re-aggregation is event-driven.
                this.stageColChange([column]);
                this.colModel.flushColChanges(source, false);
            }
        }
    }

    /** `valueIndex` per active col from the current state-apply pass; consumed by {@link sortByPendingState}.
     *  Non-null signals a pending re-sort. */
    private pendingStateOrder: Map<AgColumn, number> | null = null;

    public override syncColState(
        column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        source: ColumnEventType
    ): void {
        // Fall back to the default only when the state value is `undefined` (not `null`).
        const stateAggFunc = stateItem?.aggFunc;
        const aggFunc = stateAggFunc !== undefined ? stateAggFunc : defaultState?.aggFunc;
        const stateValueIndex = stateItem?.valueIndex;
        const valueIndex = stateValueIndex !== undefined ? stateValueIndex : defaultState?.valueIndex;
        if (aggFunc === undefined && valueIndex === undefined) {
            return;
        }
        if (aggFunc !== undefined) {
            if (typeof aggFunc !== 'string' && aggFunc != null) {
                _warn(33); // stateItem.aggFunc must be a string — invalid (object / function) values.
                return;
            }
            this.applyAggFunc(column, aggFunc, source);
        } else if (typeof valueIndex === 'number' && !column.aggregationActive) {
            // An index without an aggFunc still activates the column (a default aggFunc is assigned on
            // activation), matching the `rowGroupIndex`/`pivotIndex` semantics where the index alone is enough.
            this.setColActive(column, true, source, true);
        }
        if (typeof valueIndex === 'number' && column.aggregationActive) {
            let idxMap = this.pendingStateOrder;
            if (idxMap === null) {
                idxMap = new Map();
                this.pendingStateOrder = idxMap;
            }
            idxMap.set(column, valueIndex);
        }
    }

    /** Re-order active value cols by the `valueIndex` recorded during the last `syncColState` pass; else keep
     *  insertion order. Runs before `refreshCols` so pivot result columns pick up the new value-col order. */
    public sortByPendingState(): void {
        if (!this.pendingStateOrder) {
            return;
        }
        const cols = this.columns;
        if (cols.length > 0) {
            cols.sort(this.compareByStateIndex);
            this.resetActiveCols(cols);
        }
        this.onColumnsChanged();
        this.pendingStateOrder = null;
    }

    private readonly compareByStateIndex = (a: AgColumn, b: AgColumn): number => {
        const indexes = this.pendingStateOrder;
        if (!indexes) {
            return 0;
        }
        const aIdx = indexes.get(a);
        const bIdx = indexes.get(b);
        if (aIdx != null) {
            return bIdx != null ? aIdx - bIdx : -1;
        }
        return bIdx != null ? 1 : 0;
    };

    /** Stamps each active col's position as its value-column order (`aggregationActiveIndex`, valid only when active). */
    protected override onColumnsChanged(): void {
        const cols = this.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            cols[i].aggregationActiveIndex = i;
        }
    }

    private applyAggFunc(column: AgColumn, aggFunc: ColAggFunc, source: ColumnEventType): boolean {
        if (aggFunc != null && aggFunc !== '') {
            const aggFuncChanged = this.writeAggFunc(column, aggFunc);
            const activeChanged = this.setColActive(column, true, source);
            return aggFuncChanged || activeChanged;
        }
        return this.setColActive(column, false, source);
    }

    private writeAggFunc(column: AgColumn, aggFunc: ColAggFunc): boolean {
        if (column.aggFunc === aggFunc) {
            return false;
        }
        column.aggFunc = aggFunc;
        column.dispatchStateUpdatedEvent('aggFunc');
        return true;
    }
}
