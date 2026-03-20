import type {
    AgColumn,
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterOptions,
    GroupRowValueSetterParams,
    IRowNode,
    NamedBean,
    RowNode,
    _IRowGroupingEditValueSvc,
    _ModuleWithoutApi,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { distributeGroupValue } from './distributeGroupValue/distributeGroupValue';
import { SharedRowGroupingModule } from './rowGroupingModule';

class RowGroupingEditValueSvc extends BeanStub implements NamedBean, _IRowGroupingEditValueSvc {
    beanName = 'rowGroupingEditValueSvc' as const;

    public isGroupCellEditable(rowNode: IRowNode, column: AgColumn): boolean {
        const colDef = column.getColDef();

        if (!column.isColumnFunc(rowNode, colDef.groupRowEditable!)) {
            return false;
        }

        const raw = colDef.groupRowValueSetter;

        // No value setter, true, false, or function → cell is editable
        if (raw == null || typeof raw !== 'object') {
            return true;
        }

        // Options object — check if distribution is suppressed (false/null) for this column's aggFunc
        return !isDistributionSuppressed(raw, colDef.aggFunc);
    }

    public setGroupDataValue(
        rowNode: RowNode,
        column: AgColumn,
        newValue: unknown,
        oldValue: unknown,
        eventSource: string | undefined,
        valueChanged: boolean
    ): boolean | undefined {
        const colDef = column.getColDef();

        // Resolve groupRowValueSetter: true or groupRowEditable → built-in distributeGroupValue,
        // false → explicitly disabled, function/object → as-is.
        // colDef is already deep-merged with defaultColDef (via _mergeDeep in columnFactoryUtils),
        // so object-type options inherit and merge with defaultColDef automatically.
        // When groupRowEditable is a callback, evaluate it against the current row — only enable
        // implicit distribution for rows where the callback returns true.
        let raw = colDef.groupRowValueSetter;
        if (raw == null) {
            const gre = colDef.groupRowEditable;
            raw = gre && column.isColumnFunc(rowNode, gre) ? true : undefined;
        }
        if (!raw) {
            return undefined; // No groupRowValueSetter or false → caller uses normal path.
        }

        const params: GroupRowValueSetterParams = this.gos.addCommon({
            node: rowNode,
            data: rowNode.data,
            oldValue,
            newValue,
            colDef,
            column,
            eventSource,
            valueChanged,
            aggregatedChildren: this.beans.aggChildrenSvc?.getAggregatedChildren(rowNode, column) ?? [],
        });

        const result =
            typeof raw === 'function'
                ? raw(params)
                : // true or options object — delegate to the built-in distributor.
                  distributeGroupValue(params, raw === true ? undefined : raw);

        // Default to true if user forgot to return a value (possible without TypeScript).
        return result ?? true;
    }
}

/** Whether this aggFunc is disabled by default (requires explicit distribution to be editable). */
function isDisabledByDefault(aggFunc: string | null): boolean {
    return aggFunc === 'count' || aggFunc === 'min' || aggFunc === 'max';
}

/** Checks whether an options-object groupRowValueSetter would suppress distribution for the given aggFunc. */
function isDistributionSuppressed(
    opts: GroupRowValueSetterOptions,
    aggFunc: string | ((params: any) => any) | null | undefined
): boolean {
    const dist = opts.distribution;

    // Top-level suppression
    if (dist === false || dist === null) {
        return true;
    }

    const aggFuncStr = typeof aggFunc === 'string' ? aggFunc : null;

    // Top-level string strategy applies to all aggFuncs — not suppressed
    if (typeof dist === 'string') {
        return false;
    }

    // No distribution specified — suppressed for count/min/max, not for others
    if (dist === undefined) {
        return isDisabledByDefault(aggFuncStr);
    }

    // Per-aggFunc record — look up the current column's aggFunc
    if (aggFuncStr == null) {
        return false; // Non-string aggFunc → falls through to default handler/overwrite
    }

    const entry = dist[aggFuncStr];

    // undefined means not in the record — suppressed if disabled by default
    if (entry === undefined) {
        return isDisabledByDefault(aggFuncStr);
    }

    if (entry === false || entry === null) {
        return true;
    }

    if (typeof entry === 'object') {
        const entryDist = (entry as GroupRowValueSetterDistributionOptions).distribution;
        return entryDist === false || entryDist === null;
    }

    return false;
}

/**
 * @feature Editing -> Group Row Edit
 * Enables `groupRowEditable` and `groupRowValueSetter` on group rows.
 * When `groupRowEditable` is set but no `groupRowValueSetter` is provided,
 * the module supplies a default that distributes the edited value to
 * descendant rows using {@link distributeGroupValue}.
 */
export const RowGroupingEditModule: _ModuleWithoutApi = {
    moduleName: 'RowGroupingEdit',
    version: VERSION,
    beans: [RowGroupingEditValueSvc],
    dependsOn: [EnterpriseCoreModule, SharedRowGroupingModule],
};
