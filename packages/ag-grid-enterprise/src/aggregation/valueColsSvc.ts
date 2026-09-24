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

import type { ColStateIntent } from '../columns/baseColsService';
import { BaseColsService } from '../columns/baseColsService';

/** {@link ValueColsSvc.applyAggFunc} outcome: nothing moved / func changed on an active col / (de)activated. */
const AGG_UNCHANGED = 0;
const AGG_FUNC_ONLY = 1;
const AGG_MEMBERSHIP = 2;
type AggFuncChange = typeof AGG_UNCHANGED | typeof AGG_FUNC_ONLY | typeof AGG_MEMBERSHIP;

/** Write `aggFunc` onto `column` (dispatching the state event); returns whether it changed. */
const writeAggFunc = (column: AgColumn, aggFunc: ColAggFunc): boolean => {
    if (column.aggFunc === aggFunc) {
        return false;
    }
    column.aggFunc = aggFunc;
    column.dispatchStateUpdatedEvent('aggFunc');
    return true;
};

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
            const modeAggFunc = col.showValuesAs?.def.defaultAggFunc;
            if (modeAggFunc) {
                this.bucketCol(col, colIsNew);
                if (!col.aggFunc) {
                    writeAggFunc(col, modeAggFunc);
                }
            }
            return;
        }
        this.bucketCol(col, colIsNew);
        if (aggFunc != null && aggFunc !== '') {
            writeAggFunc(col, aggFunc);
        } else if (!col.aggFunc) {
            writeAggFunc(col, colDef.initialAggFunc);
        }
    }

    /** Seat an included value col: indexed (`valueIndex`, or `initialValueIndex` for new cols) cols are
     *  sorted by `commitExtract`; the rest keep their prior/col-def order. */
    private bucketCol(col: AgColumn, colIsNew: boolean): void {
        const colDef = col.colDef;
        const key = colDef.valueIndex ?? (colIsNew ? colDef.initialValueIndex : null);
        this.bucketByKey(col, key);
    }

    // Imperative-only (the base gates on `runSideEffects`); the state/agg-func paths set the func explicitly.
    protected override onColActiveChanged(column: AgColumn, active: boolean): void {
        // A newly-active col with no agg-func picks up the default for its cell-data type.
        const aggFuncSvc = this.aggFuncSvc;
        if (active && aggFuncSvc && !column.aggFunc) {
            writeAggFunc(column, aggFuncSvc.getDefaultAggFunc(column));
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
        if (!key) {
            return;
        }
        const column = this.colModel.getNonPivotCol(key);
        if (!column) {
            return;
        }
        const change = this.applyAggFunc(column, aggFunc, source);
        if (change === AGG_UNCHANGED) {
            return;
        }
        const membershipChanged = change === AGG_MEMBERSHIP;
        // (De)activation moves the value-column set → reindex + rebuild pivot result cols; a func-only change
        // keeps positions and re-aggregates event-driven, so just record it for dispatch (no reindex/rebuild).
        if (membershipChanged) {
            this.stageColChange(column);
        } else {
            this.recordColChange(column);
        }
        this.colModel.flushColChanges(source, membershipChanged ? 'membership' : 'dispatch');
    }

    public override syncColState(
        column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        source: ColumnEventType
    ): void {
        const aggFunc = resolveStateAggFunc(stateItem, defaultState);
        if (!isValidStateAggFunc(aggFunc)) {
            this.warn(33); // stateItem.aggFunc must be a string — invalid (object / function) values.
            return;
        }
        const intent = this.getStateIntent(column, stateItem, defaultState);
        if (!intent) {
            return;
        }
        if (aggFunc !== undefined) {
            this.applyAggFunc(column, aggFunc, source);
        } else if (intent.active && !column.aggregationActive) {
            this.setColActive(column, true, source, true);
        }
        if (intent.index !== undefined && column.aggregationActive) {
            this.recordPendingStateOrder(column, intent.index);
        }
    }

    protected override getStateIntent(
        _column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined
    ): ColStateIntent | undefined {
        const aggFunc = resolveStateAggFunc(stateItem, defaultState);
        const stateValueIndex = stateItem?.valueIndex;
        const valueIndex = stateValueIndex !== undefined ? stateValueIndex : defaultState?.valueIndex;
        if ((aggFunc === undefined && valueIndex === undefined) || !isValidStateAggFunc(aggFunc)) {
            return undefined;
        }
        const index = typeof valueIndex === 'number' ? valueIndex : undefined;
        if (aggFunc !== undefined) {
            const active = aggFunc != null && aggFunc !== '';
            return { active, index: active ? index : undefined };
        }
        // An index without an aggFunc still activates the column (a default aggFunc is assigned on
        // activation), matching the `rowGroupIndex`/`pivotIndex` semantics where the index alone is enough.
        return { active: index === undefined ? undefined : true, index };
    }

    /** Stamps each active col's position as its value-column order (`aggregationActiveIndex`, valid only when active). */
    protected override onColumnsChanged(): void {
        const cols = this.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            cols[i].aggregationActiveIndex = i;
        }
    }

    /** Apply `aggFunc` to `column` and report what moved: {@link AGG_MEMBERSHIP} ((de)activation — the
     *  value-column set changed, so dependent pivot result columns must rebuild), {@link AGG_FUNC_ONLY} (func
     *  changed on an already-active col — re-aggregates event-driven), or {@link AGG_UNCHANGED}. */
    private applyAggFunc(column: AgColumn, aggFunc: ColAggFunc, source: ColumnEventType): AggFuncChange {
        if (aggFunc != null && aggFunc !== '') {
            const aggFuncChanged = writeAggFunc(column, aggFunc);
            const activeChanged = this.setColActive(column, true, source);
            if (activeChanged) {
                return AGG_MEMBERSHIP;
            }
            return aggFuncChanged ? AGG_FUNC_ONLY : AGG_UNCHANGED;
        }
        return this.setColActive(column, false, source) ? AGG_MEMBERSHIP : AGG_UNCHANGED;
    }
}

/** Falls back to the default only when the state value is `undefined` (not `null`). */
function resolveStateAggFunc(
    stateItem: ColumnState | null,
    defaultState: ColumnStateParams | undefined
): ColumnState['aggFunc'] {
    const stateAggFunc = stateItem?.aggFunc;
    return stateAggFunc !== undefined ? stateAggFunc : defaultState?.aggFunc;
}

function isValidStateAggFunc(aggFunc: ColumnState['aggFunc']): boolean {
    return aggFunc == null || typeof aggFunc === 'string';
}
